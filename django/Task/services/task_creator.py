from Task.constants import HTTP_ERROR
from Task.formatters.task_update_formatter import TaskUpdateFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse


class TaskCreator:
    task_data = None

    def __init__(self, task_data):
        self.task_data = task_data

    def create(self):
        try:
            task_data = self.task_data['task']
            db_task_data = TaskUpdateFormatter(task_data).format()
            task = Task(**db_task_data.data())
            task.save()
            return ServiceResponse('Task created')
        except Exception as e:
            return ServiceResponse('Error in creating Task', HTTP_ERROR).ex(e)
