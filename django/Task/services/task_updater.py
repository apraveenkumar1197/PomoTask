from datetime import date

from PomoTask.contants import TASK_TIMING_STATUS_STOPPED
from Task.constants import HTTP_ERROR
from Task.formatters.task_update_formatter import TaskUpdateFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse
from Task.services.task_timer_status_updater import TaskTimerStatusUpdater
from Task.services.task_timing_calculator import TaskTimingCalculator


class TaskUpdater:
    task_data = None
    task_id = None

    def __init__(self, task_data, task_id):
        self.task_data = task_data
        self.task_id = task_id

    def update(self):
        try:
            task = Task.objects.filter(id=self.task_id)

            self.task_update_formatter = TaskUpdateFormatter(self.task_data)
            db_task_data = self.task_update_formatter.format()
            if db_task_data.is_failed():
                return db_task_data

            task.update(**db_task_data.data())
            self._check_timer_status()
            return ServiceResponse('Task updated').data({'task_id': task.first().id})
        except Exception as e:
            return ServiceResponse('Error in updating Task', HTTP_ERROR).ex(e)

    def _check_timer_status(self):
        if self.task_update_formatter.isTaskDone():
            status = TaskTimingCalculator(self.task_id).getStatus()
            if status != TASK_TIMING_STATUS_STOPPED:
                TaskTimerStatusUpdater(self.task_id, TASK_TIMING_STATUS_STOPPED).update()