from datetime import date

from Task.constants import HTTP_SUCCESS, HTTP_ERROR
from Task.formatters.tag_list_formatter import TagListFormatter
from Task.formatters.task_update_formatter import TaskUpdateFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse
from Task.services.tags.tag_id_fetcher import TagIdFetcher


class TaskUpdater:
    task_data = None
    task_id = None

    def __init__(self, task_data, task_id):
        self.task_data = task_data
        self.task_id = task_id

    def update(self):
        try:
            task = Task.objects.filter(id=self.task_id)

            db_task_data = TaskUpdateFormatter(self.task_data).format()
            if db_task_data.is_failed():
                return db_task_data

            task.update(**db_task_data.data())
            return ServiceResponse('Task updated').data({'task_id': task.first().id})
        except Exception as e:
            return ServiceResponse('Error in updating Task', HTTP_ERROR).ex(e)
