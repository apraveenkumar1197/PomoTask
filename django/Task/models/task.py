from bson import ObjectId
from django.utils import timezone

from django.db import models
from django.db.models import Q
from Task.enums.status import Status
from datetime import date

from Task.models.tags import Tags


class TaskManager(models.Manager):
    pass


class TaskQuerySet(models.query.QuerySet):
    def not_done(self):
        return self.exclude(status__in=[Status.Done, Status.Deleted]).order_by('due_date')

    def important(self):
        return self.not_done().filter(important_flag__in=[True])

    def my_day(self, my_date=date.today()):
        return self.not_done().filter(
            due_date__gte=my_date,
            due_date__lte=my_date
        )

    def planned(self):
        return self.not_done().exclude(due_date=None)

class Task(models.Model):
    objects = TaskQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=24, default=lambda: str(ObjectId()), editable=False)
    title = models.CharField(max_length=255)
    important_flag = models.BooleanField(default=False, null=True)
    my_day_date = models.DateField(null=True)
    reminder_date_time = models.DateTimeField(null=True)
    due_date = models.DateField(null=True)
    from_time = models.TimeField(null=True)
    to_time = models.TimeField(null=True)
    estimate = models.BigIntegerField(null=True)
    description = models.TextField(null=True)
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.ToDo,
    )
    tags = models.Field(models.ManyToManyField(Tags, related_name='tasks'))

    @property
    def is_my_day(self):
        return self.my_day_date == timezone.now().date()

    def start_datetime(self):
        return f"{self.due_date} {self.from_time}" if self.from_time is not None else None

    def end_datetime(self):
        return f"{self.due_date} {self.to_time}" if self.to_time is not None else None
