from django.utils import timezone

from PomoTask.contants import ORPHAN_TASK_TIMING_SECONDS, TASK_TIMING_STATUS_STARTED, TASK_TIMING_STATUS_STOPPED
from Task.models import Task
from Task.services.service_response import ServiceResponse


class TaskTimingHistoryFetcher:
    def __init__(self, task_id):
        self.task_id = task_id

    def fetch(self):
        task = Task.objects.filter(id=self.task_id).first()
        task_timings = task.tasktiming_set.all().order_by('created_at')

        sessions = []
        start_record = None

        for timing in task_timings:
            if timing.status == TASK_TIMING_STATUS_STARTED:
                if start_record is not None:
                    sessions.append({
                        'started_at': start_record.created_at.isoformat(),
                        'stopped_at': None,
                        'duration_seconds': ORPHAN_TASK_TIMING_SECONDS,
                    })
                start_record = timing
            elif timing.status == TASK_TIMING_STATUS_STOPPED:
                if start_record is not None:
                    duration = round((timing.created_at - start_record.created_at).total_seconds())
                    sessions.append({
                        'started_at': start_record.created_at.isoformat(),
                        'stopped_at': timing.created_at.isoformat(),
                        'duration_seconds': duration,
                    })
                    start_record = None

        if start_record is not None:
            duration = round((timezone.now() - start_record.created_at).total_seconds())
            sessions.append({
                'started_at': start_record.created_at.isoformat(),
                'stopped_at': None,
                'duration_seconds': duration,
            })

        return ServiceResponse('Task timing history fetched').data({
            'sessions': list(reversed(sessions)),
        })
