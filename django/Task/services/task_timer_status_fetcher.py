from django.utils import timezone
from PomoTask.contants import ORPHAN_TASK_TIMING_SECONDS
from Task.models import Task
from Task.services.service_response import ServiceResponse
from Task.services.task_editor import TaskEditor
from Task.services.task_timing_calculator import TaskTimingCalculator


class TaskTimerStatusFetcher:
    def __init__(self, task_id):
        self.task_id = task_id

    def fetch(self):
        return ServiceResponse('Tasks timing fetched').data({
            'task_timing': TaskTimingCalculator(self.task_id).get().data(),
            'pomodoro': {
                'work': 15 * 60,
                'short_break': 5 * 60,
                'long_break': 15 * 60,
                'cycle_count_for_long_break': 4,
            },
            'task': TaskEditor(self.task_id).edit().data()['task']
        })
