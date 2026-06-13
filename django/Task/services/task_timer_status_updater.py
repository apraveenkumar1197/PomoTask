from Task.constants import HTTP_ERROR
from Task.models.task_timing import TaskTiming
from Task.services.service_response import ServiceResponse
from Task.services.task_timing_calculator import TaskTimingCalculator


class TaskTimerStatusUpdater:
    def __init__(self, task_id, status):
        self.task_id = task_id
        self.status = status

    def update(self):
        try:
            task_timing = TaskTiming(task_id=self.task_id, status=self.status)
            task_timing.save()
            TaskTimingCalculator(self.task_id).update()
            return ServiceResponse('Task timing updated')
        except Exception as e:
            return ServiceResponse('Error in updating Task', HTTP_ERROR).ex(e)
