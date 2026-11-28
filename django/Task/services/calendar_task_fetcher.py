from Points.schedule import DAY, today
from Points.service import materialize_tasks
from Task.enums.status import Status
from Task.formatters.calendar_task_list_formatter import CalendarTaskListFormatter
from Task.models import Task
from Task.services.service_response import ServiceResponse


class CalendarTaskFetcher:
    def __init__(self, from_date=None, to_date=None):
        self.from_date = from_date
        self.to_date = to_date

    def list(self):
        day = today()
        start = self.from_date or day - DAY * 7
        end = self.to_date or day + DAY * 35
        linked = materialize_tasks(start, end)
        tasks = (Task.objects
                 .not_done()
                 .exclude(record_type=Task.RECORD_TYPE_POINT)
                 .exclude(due_date=None))

        activities = (Task.objects
                      .filter(record_type=Task.RECORD_TYPE_ACTIVITY)
                      .exclude(status=Status.Deleted)
                      .exclude(due_date=None))

        calendar_points = [
            task for task in linked
            if task.due_date is not None and start <= task.due_date <= end
            and str(task.status) not in (Status.Deleted, Status.Cancelled)
        ]
        all_records = list(tasks) + list(activities) + calendar_points
        event_list = CalendarTaskListFormatter(all_records).format()
        return ServiceResponse('Tasks fetched').data({'tasks': event_list})
