from django.db import models


class Status(models.TextChoices):
    ToDo = '0', 'ToDo'
    Done = '1', 'Done'
    InProgress = '2', 'In Progress'
    Deleted = '3', 'Deleted'