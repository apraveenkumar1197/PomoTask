from datetime import datetime

from django.core.management import BaseCommand

from Task.clients.create_notification import CreateNotification
from Task.models import Task


class Command(BaseCommand):
    help = 'RemainderNotificationSender'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        from django.db import connections

        conn = connections['default']
        print(f"{conn}")
        return None

        tasks = Task.objects.filter(reminder_date_time=datetime.now())
        for task in tasks:
            heading = f"Reminder for {task.title}"
            content = f"Starts at {task.due_date} {task.from_time}"
            CreateNotification(heading, content).push()

