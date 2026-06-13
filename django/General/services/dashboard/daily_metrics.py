from django.utils import timezone

from Task.models import Task
from Task.services.service_response import ServiceResponse


class DailyMetrics:
    def __init__(self):
        pass

    def fetch(self):
        todo = Task.objects.my_day().count()
        done = Task.objects.my_day(timezone.now(), True).count()
        return ServiceResponse().data({'todo': todo, 'done': done})
