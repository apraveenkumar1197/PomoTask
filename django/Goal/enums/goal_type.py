from django.db import models


class GoalType(models.TextChoices):
    Year = '0', 'Year'
    Month = '1', 'Month'
    Week = '2', 'Week'