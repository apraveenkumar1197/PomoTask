from django.db import models
from Task.models import Task

class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.RESTRICT)
    name = models.CharField(max_length=255)
    file = models.CharField(max_length=255)