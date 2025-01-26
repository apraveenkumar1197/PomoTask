from django.db import models
from Task.models import Task


class LinkedTask(models.Model):
    parent = models.ForeignKey(Task, related_name='parent_tasks', on_delete=models.RESTRICT)
    child = models.ForeignKey(Task, related_name='child_tasks', on_delete=models.RESTRICT)
