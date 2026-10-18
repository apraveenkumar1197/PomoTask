from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from decouple import config
from django.core.management import BaseCommand
from django.db import connections
from django.utils import timezone

from Task.clients.telegram_client import TelegramClient
from Task.models import Task

DEFAULT_SEND_TIME = time(8, 0)
LEAD_TIME = timedelta(minutes=30)
MAX_TITLE_WIDTH = 30


class Command(BaseCommand):
    help = ("Sends today's planned (timed) tasks to Telegram as a table, at 08:00 or "
            "30 minutes before the first task, whichever is earlier")

    def handle(self, *args, **options):
        try:
            self._send_daily_plan()
        finally:
            # See remainder_notification_sender: djongo's close() crashes under pymongo 4.
            connections['default'].connection = None

    def _send_daily_plan(self):
        telegram = TelegramClient()
        if not telegram.is_configured():
            self.stdout.write('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set, skipping daily plan.')
            return

        # due_date / from_time are wall-clock values entered by the user, so "today"
        # and "08:00" must be evaluated in their timezone, not the server's (UTC).
        tz = ZoneInfo(config('NOTIFICATION_TIMEZONE', default='UTC'))
        now = timezone.now().astimezone(tz).replace(second=0, microsecond=0)

        tasks = list(Task.objects.not_done()
                     .filter(due_date=now.date())
                     .exclude(from_time=None)
                     .order_by('from_time'))
        if not tasks:
            return

        send_at = self._send_at(now.date(), tasks[0].from_time, tz)
        # Run every minute from cron; only act in the minute the digest is due.
        if now != send_at:
            return

        if telegram.send(f"Plan for {now.strftime('%a, %d %b')}", self._table(tasks), monospace=True):
            self.stdout.write(f'Sent daily plan with {len(tasks)} task(s)')

    @staticmethod
    def _send_at(day, first_start, tz):
        default = datetime.combine(day, DEFAULT_SEND_TIME, tzinfo=tz)
        before_first = datetime.combine(day, first_start, tzinfo=tz) - LEAD_TIME
        midnight = datetime.combine(day, time(0, 0), tzinfo=tz)
        return max(min(default, before_first), midnight).replace(second=0, microsecond=0)

    @staticmethod
    def _table(tasks):
        def title(task):
            t = task.title
            return t if len(t) <= MAX_TITLE_WIDTH else t[:MAX_TITLE_WIDTH - 1] + '…'

        width = max(len('Task'), *(len(title(t)) for t in tasks))
        lines = [f"{'Task'.ljust(width)}  Start", f"{'-' * width}  -----"]
        lines += [f"{title(t).ljust(width)}  {t.from_time.strftime('%H:%M')}" for t in tasks]
        return '\n'.join(lines)
