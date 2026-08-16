from datetime import date

from bson import ObjectId
from django.db.models import Q
from django.utils import timezone

from django.db import models

from Goal.models.goal import Goal
from Task.enums.status import Status

from Task.models.tags import Tags


class TaskManager(models.Manager):
    pass


class TaskQuerySet(models.query.QuerySet):
    def search(self, search_term):
        return self.filter(title__regex=search_term)

    def not_done(self):
        return (self.exclude(status__in=[Status.Done, Status.Deleted, Status.Cancelled])
                    .exclude(record_type='activity')
                    .order_by('due_date', 'from_time'))

    def not_live(self):
        return (self.filter(status__in=[Status.Done, Status.Deleted, Status.Cancelled])
                    .exclude(record_type='activity')
                    .order_by('updated_at', 'due_date').reverse())

    def done(self):
        return self.filter(status__in=[Status.Done])

    def important(self):
        return self.not_done().filter(important_flag__in=[True])

    def my_day(self, my_date=timezone.now(), done=False):
        if done:
            return self.done().filter(
                Q(due_date__gte=my_date, due_date__lte=my_date) |
                Q(my_day_date=date.today())
            )
        else:
            return self.not_done().filter(
                Q(due_date__gte=my_date, due_date__lte=my_date) |
                Q(my_day_date=date.today())
            )

    def planned(self):
        return self.not_done().exclude(due_date=None)

    def planned_today_with_timing(self):
        return (self.not_done()
                .exclude(from_time=None, to_time=None)
                .filter(due_date=timezone.now().date().strftime("%Y-%m-%d"))
                .order_by('id'))

    def detail_planned(self):
        return self.not_done().exclude(due_date=None, from_time=None, to_time=None)


def generate_object_id():
    return str(ObjectId())

class Task(models.Model):
    RECORD_TYPE_TASK = 'task'
    RECORD_TYPE_ACTIVITY = 'activity'

    objects = TaskQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=24, default=generate_object_id, editable=False)
    title = models.CharField(max_length=255)
    record_type = models.CharField(max_length=20, default=RECORD_TYPE_TASK)
    important_flag = models.BooleanField(default=False, null=True)
    my_day_date = models.DateField(null=True)
    reminder_date_time = models.DateTimeField(null=True)
    due_date = models.DateField(null=True)
    from_time = models.TimeField(null=True)
    to_time = models.TimeField(null=True)
    estimate = models.BigIntegerField(null=True)
    total_seconds = models.BigIntegerField(null=True)
    description = models.TextField(null=True)
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.ToDo,
    )
    cancellation_reason = models.TextField(null=True, blank=True)
    view_order = models.JSONField(blank=True, default=dict)
    tags = models.Field(models.ManyToManyField(Tags, related_name='tasks'))
    goal = models.Field(models.OneToOneField(Goal, related_name='goals', on_delete=models.RESTRICT))
    created_at = models.DateTimeField(auto_now_add=True)  # Set only when created
    updated_at = models.DateTimeField(auto_now=True)  # Updated every save

    @property
    def is_my_day(self):
        return self.my_day_date == timezone.now().date()

    def is_today(self):
        return self.due_date == timezone.now().date()

    def start_datetime(self):
        return f"{self.due_date} {self.from_time}" if self.from_time is not None else None

    def end_datetime(self):
        return f"{self.due_date} {self.to_time}" if self.to_time is not None else None
