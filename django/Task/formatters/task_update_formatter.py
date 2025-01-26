from datetime import date

from django.utils.dateparse import parse_time, parse_datetime
from django.utils.datetime_safe import datetime

from Task.constants import HTTP_SUCCESS
from Task.services.estimate_calculator import EstimateCalculator
from Task.services.service_response import ServiceResponse
from Task.services.tags.tag_id_fetcher import TagIdFetcher


class TaskUpdateFormatter:
    def __init__(self, task_data):
        self.task_data = task_data

    def format(self):
        td = {}

        if 'title' in self.task_data:
            td['title'] = self.task_data['title']
        if 'add_to_my_day' in self.task_data and self.task_data['add_to_my_day']:
            td['my_day_date'] = date.today()
        if 'important_flag' in self.task_data:
            td['important_flag'] = self.task_data['important_flag']
        if 'due_date' in self.task_data:
            td['due_date'] = self.task_data['due_date']
        if 'from_time' in self.task_data:
            td['from_time'] = self.task_data['from_time']
        if 'to_time' in self.task_data:
            td['to_time'] = self.task_data['to_time']
        if 'reminder_date_time' in self.task_data:
            td['reminder_date_time'] = parse_datetime(self.task_data['reminder_date_time'])
        if 'from_time' in self.task_data and 'to_time' in self.task_data:
            td['estimate'] = EstimateCalculator(self.task_data['from_time'], self.task_data['to_time']).estimate()
        if 'status' in self.task_data:
            td['status'] = self.task_data['status']
        if 'notes' in self.task_data:
            td['description'] = self.task_data['notes']
        if 'tags' in self.task_data:
            response = TagIdFetcher(self.task_data['tags']).fetch()
            if response.is_failed():
                return response
            td['tags'] = response.data()['tag_ids']

        return ServiceResponse('Task data formatted for DB').data(td)
