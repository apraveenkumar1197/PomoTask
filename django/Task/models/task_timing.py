from bson import ObjectId
from django.db import models

from Task.models import Task


def generate_object_id():
    return str(ObjectId())

class TaskTiming(models.Model):
    id = models.CharField(primary_key=True, max_length=24, default=generate_object_id, editable=False)
    task = models.ForeignKey(Task, on_delete=models.RESTRICT)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)