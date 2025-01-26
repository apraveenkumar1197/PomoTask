from datetime import datetime

from django.db import models
from bson import ObjectId

from Goal.enums.goal_type import GoalType
from Goal.enums.status import Status


class GoalManager(models.Manager):
    def year(self, year=datetime.now().year):
        return self.filter(type=GoalType.Year, year=year)

    def month(self, year=datetime.now().year, month=datetime.now().month):
        return self.filter(type=GoalType.Month, year=year, month=month)

class Goal(models.Model):
    objects = GoalManager()

    id = models.CharField(primary_key=True, max_length=24, default=lambda: str(ObjectId()), editable=False)
    title = models.CharField(max_length=255)
    type = models.IntegerField(
        choices=GoalType.choices,
        blank=False,
        null=False,
    )
    status = models.IntegerField(
        choices=Status.choices,
        default=Status.ToDo
    )
    months = models.JSONField(blank=True, default=list)
    linked_goals = models.JSONField(blank=True, default=list)
    year = models.IntegerField(blank=True)
    month = models.CharField(max_length=255, blank=True)
