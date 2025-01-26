from Task.constants import HTTP_SUCCESS
from Task.enums.status import Status
from Task.formatters.tag_list_formatter import TagListFormatter
from Task.formatters.task_list_formatter import TaskListFormatter
from Task.models import Task
from datetime import date

from Task.models.tags import Tags
from Task.services.service_response import ServiceResponse


class TaskListFetcher:
    def __init__(self, filters):
        self.filter = filters['filter']
        self.tag_names = filters['tag_names']

    def fetch(self):
        if self.filter == 'important':
            tasks = Task.objects.important()
        elif self.filter == 'my_day':
            tasks = Task.objects.my_day()
        elif self.filter == 'planned':
            tasks = Task.objects.planned()
        else:
            tasks = Task.objects.not_done()

        if self.tag_names:
            tasks = self.tag_filtered_ids(tasks)

        tag_names = Tags.objects.values_list('name', flat=True)
        tag_names = sorted(list(tag_names))
        task_list = TaskListFormatter(tasks).format()
        return ServiceResponse('Tasks fetched').data({'tasks': task_list, 'tags': tag_names})

    def tag_filtered_ids(self, tasks):
        task_filtered_ids = []
        tags_ids = Tags.objects.filter(name__in=self.tag_names).values_list('id', flat=True)
        for task in tasks:
            if set(tags_ids).issubset(set(task.tags)):
                task_filtered_ids.append(task.id)

        return Task.objects.filter(id__in=task_filtered_ids)
