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
                 .not_done()
                 .exclude(due_date=None))

        activities = (Task.objects
                      .filter(record_type=Task.RECORD_TYPE_ACTIVITY)
                      .exclude(status=Status.Deleted)
                      .exclude(due_date=None))

        all_records = list(tasks) + list(activities)
        event_list = CalendarTaskListFormatter(all_records).format()
        return ServiceResponse('Tasks fetched').data({'tasks': event_list})
