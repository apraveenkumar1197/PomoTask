from Task.constants import HTTP_SUCCESS
from Task.enums.status import Status
from Task.formatters.tag_list_formatter import TagListFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse


class TaskEditor:
    def __init__(self, task_id):
        self.task_id = task_id

    def edit(self):
        task = Task.objects.filter(id=self.task_id).first()
        task_data = {
            'id': task.id,
            'title': task.title,
            'is_important_flag': task.important_flag,
            'is_my_day': task.is_my_day,
            'planned_date': task.due_date,
            'from_time': task.from_time,
            'to_time': task.to_time,
            'reminder_date_time': task.reminder_date_time,
            'estimate': task.estimate,
            'notes': task.description,
            'status_bool': False,
            'status': task.status,
            'tags': TagListFormatter(task.tags).format()
        }
        return ServiceResponse('Tasks fetched for edit').data({
            'statuses': [{'value': choice[0], 'label': choice[1]} for choice in Status.choices],
            'task': task_data
        })
