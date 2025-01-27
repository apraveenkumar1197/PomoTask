from django.apps import AppConfig


class TaskConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Task'

    def ready(self):
        from .schedule import start_scheduler
        start_scheduler()
