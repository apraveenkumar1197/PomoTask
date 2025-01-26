from django.utils.dateparse import parse_date
from django.utils.datetime_safe import datetime


class TaskDateFormatter:

    def __init__(self, date):
        if type(date) == str:
            date = parse_date(date)

        self.date = date

    def format(self):
        if self.date is None:
            return None

        if self.date.year == datetime.now().year:
            return self.date.strftime('%d %b')

        return self.date.strftime('%d %b %Y')


