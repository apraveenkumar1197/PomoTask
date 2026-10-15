from datetime import timedelta

from django.core.management import BaseCommand
from django.db import connections
from django.utils import timezone

from Task.clients.telegram_client import TelegramClient
from Task.models import Task


class Command(BaseCommand):
    help = 'Sends a Telegram message for every task whose reminder fell due in the previous minute'

    def handle(self, *args, **options):
        try:
            self._send_due_reminders()
        finally:
            # Management commands call connections.close_all() on exit, and
            # djongo's _close() does `if self.connection:`, which pymongo 4
            # rejects (Database objects can't be truth-tested) and turns every
            # run into a traceback. Dropping the reference first makes that a
            # no-op; the process is about to exit anyway.
            connections['default'].connection = None

    def _send_due_reminders(self):
        telegram = TelegramClient()
        if not telegram.is_configured():
            self.stdout.write('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set, skipping reminders.')
            return

        # Run every minute from cron: handle the half-open window
        # [previous minute, this minute) so each reminder is sent exactly once,
        # without needing a "sent" flag on the task.
        window_end = timezone.now().replace(second=0, microsecond=0)
        window_start = window_end - timedelta(minutes=1)

        tasks = Task.objects.not_done().filter(
            reminder_date_time__gte=window_start,
            reminder_date_time__lt=window_end,
        )
        for task in tasks:
            heading = f"Reminder: {task.title}"
            content = self._content(task)
            if telegram.send(heading, content):
                self.stdout.write(f'Sent reminder for task {task.id}')

    @staticmethod
    def _content(task):
        if task.due_date and task.from_time:
            return f"Starts at {task.due_date} {task.from_time.strftime('%H:%M')}"
        if task.due_date:
            return f"Due {task.due_date}"
        return ''
