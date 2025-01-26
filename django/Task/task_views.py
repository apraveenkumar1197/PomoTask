import json

from django.views import View
from django.views.decorators.http import require_http_methods

from Task.services.calendar_task_fetcher import CalendarTaskFetcher
from Task.services.task_creator import TaskCreator
from Task.services.task_editor import TaskEditor
from Task.services.task_list_fetcher import TaskListFetcher
from Task.services.task_updater import TaskUpdater
from common.http_utils import api_response


class TaskViews(View):

    @require_http_methods(["POST"])
    def create_task(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskCreator(data).create())

    @require_http_methods(["POST"])
    def task_list(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskListFetcher(data['filters']).fetch())

    @require_http_methods(["GET"])
    def edit_task(request, task_id):
        return api_response(TaskEditor(task_id).edit())

    @require_http_methods(["PATCH"])
    def update_task(request, task_id):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskUpdater(data['task'], task_id).update())

    @require_http_methods(["GET"])
    def calendar_task_list(request):
        return api_response(CalendarTaskFetcher().list())
