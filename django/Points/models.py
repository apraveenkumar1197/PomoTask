from bson import ObjectId
from django.db import models


def new_id():
    return str(ObjectId())


class PointItem(models.Model):
    id = models.CharField(primary_key=True, max_length=24, default=new_id, editable=False)
    revisions = models.JSONField(default=list)


class PointOccurrence(models.Model):
    id = models.CharField(primary_key=True, max_length=24)
    item_id = models.CharField(max_length=24, db_index=True)
    period_start = models.CharField(max_length=10)
    period_end = models.CharField(max_length=10)
    achieved = models.BooleanField(default=False)
    task_defaults = models.JSONField(default=dict)
