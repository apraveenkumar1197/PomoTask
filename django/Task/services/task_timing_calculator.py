from PomoTask.contants import ORPHAN_TASK_TIMING_SECONDS, TASK_TIMING_STATUS_STARTED, TASK_TIMING_STATUS_STOPPED
from django.utils import timezone
from functools import lru_cache

from Task.models import Task
from Task.services.service_response import ServiceResponse


class TaskTimingCalculator:
    def __init__(self, task_id):
        self.task_id = task_id

    def get(self):
        cal_dic = self._calculate()

        return ServiceResponse('Tasks timing fetched').data({
            'total_seconds': cal_dic['total_seconds'],
            'status': cal_dic['status'],
        })

    def getStatus(self):
        return self._calculate()['status']

    def update(self):
        Task.objects.filter(id=self.task_id).update(total_seconds=self._calculate()['total_seconds'])

    @lru_cache(maxsize=None)
    def _calculate(self):
        task = Task.objects.filter(id=self.task_id).first()
        task_timings = task.tasktiming_set.all()
        total_seconds = 0
        datetime = None

        for task_timing in task_timings:
            if task_timing.status == TASK_TIMING_STATUS_STARTED:
                if datetime is not None:
                    total_seconds += ORPHAN_TASK_TIMING_SECONDS
                datetime = task_timing.created_at
            if task_timing.status == TASK_TIMING_STATUS_STOPPED:
                if datetime is not None:
                    total_seconds += round((task_timing.created_at - datetime).total_seconds())
                datetime = None

        if datetime is not None:
            total_seconds += round((timezone.now() - datetime).total_seconds())

        self.total_seconds = total_seconds
        self.status = TASK_TIMING_STATUS_STARTED if datetime is not None else TASK_TIMING_STATUS_STOPPED

        return {
            'total_seconds': self.total_seconds,
            'status': self.status,
        }
