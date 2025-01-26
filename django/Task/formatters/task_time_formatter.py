from django.utils.dateparse import parse_time
from django.utils.datetime_safe import datetime


class TaskTimeFormatter:

    def __init__(self, time):
        if type(time) == str:
            time = parse_time(time)

        self.time = time

    def format(self):
        if self.time is None:
            return None

        return self.time.strftime('%I:%M %p')


