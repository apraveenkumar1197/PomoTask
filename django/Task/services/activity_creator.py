from Task.formatters.task_update_formatter import TaskUpdateFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse


class ActivityCreator:
    def __init__(self, activity_data):
        self.activity_data = activity_data

    def create(self):
        activity_data = self.activity_data['activity']
        db_data = TaskUpdateFormatter(activity_data).format()
        activity = Task(**db_data.data())
        activity.record_type = Task.RECORD_TYPE_ACTIVITY
        activity.save()
        return ServiceResponse('Activity created').data({'activity': {'id': activity.id}})
