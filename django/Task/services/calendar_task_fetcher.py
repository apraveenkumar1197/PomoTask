from Task.constants import HTTP_SUCCESS
from Task.enums.status import Status
from Task.formatters.calendar_task_list_formatter import CalendarTaskListFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse


class CalendarTaskFetcher:
    def __init__(self, from_date=None, to_date=None):
        self.from_date = from_date
        self.to_date = to_date

    def list(self):
        tasks = (Task.objects
                 .exclude(status=Status.Done)
                 .exclude(due_date=None)
                 .exclude(from_time=None)
                 .exclude(to_time=None))
        task_list = CalendarTaskListFormatter(tasks).format()
        return ServiceResponse('Tasks fetched').data({'tasks': task_list})
