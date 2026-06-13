from django.db import models
from Task.models import Task

class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.RESTRICT)
    name = models.CharField(max_length=255)
    file = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)