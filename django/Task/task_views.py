import json

from django.views import View
from django.views.decorators.http import require_http_methods

from Task.services.calendar_task_fetcher import CalendarTaskFetcher
from Task.services.task_create_init_data_fetcher import TaskCreateInitDataFetcher
from Task.services.task_creator import TaskCreator
from Task.services.task_editor import TaskEditor
from Task.services.task_list_fetcher import TaskListFetcher
from Task.services.task_timer_status_fetcher import TaskTimerStatusFetcher
from Task.services.task_timer_status_updater import TaskTimerStatusUpdater
from Task.services.task_timing_history_fetcher import TaskTimingHistoryFetcher
from Task.services.task_updater import TaskUpdater
from common.http_utils import api_response


class TaskViews(View):

    @require_http_methods(["GET"])
    def task_init_data(request):
        return api_response(TaskCreateInitDataFetcher().fetch())

    @require_http_methods(["POST"])
    def create_task(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskCreator(data).create())

    @require_http_methods(["POST"])
    def task_list(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskListFetcher(data['filters'], data['search_term']).fetch())

    @require_http_methods(["GET"])
    def edit_task(request, task_id):
        return api_response(TaskEditor(task_id).edit())

    @require_http_methods(["PATCH"])
    def update_task(request, task_id):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskUpdater(data['task'], task_id).update())

    @require_http_methods(["GET"])
    def task_timing(request, task_id):
        return api_response(TaskTimerStatusFetcher(task_id).fetch())

    @require_http_methods(["POST"])
    def create_task_timing(request, task_id):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskTimerStatusUpdater(task_id, data['status']).update())

    @require_http_methods(["GET"])
    def task_timing_history(request, task_id):
        return api_response(TaskTimingHistoryFetcher(task_id).fetch())

    @require_http_methods(["GET"])
    def calendar_task_list(request):
        return api_response(CalendarTaskFetcher().list())

    @require_http_methods(["GET"])
    def list_tags(request):
        from Task.models.tags import Tags
        from Task.services.service_response import ServiceResponse
        tags = list(Tags.objects.all().values('id', 'name'))
        return api_response(ServiceResponse('Tags fetched').data(tags))

    @require_http_methods(["POST"]) 
    def toggle_tag_home_page(request):
        data = json.loads(request.body.decode('utf-8'))
        tag_name = data.get('tag_name')
        
        from Task.models.tags import Tags
        from Task.services.service_response import ServiceResponse
        from django.db.models import Max

        try:
            tag = Tags.objects.get(name=tag_name)
        except Tags.DoesNotExist:
            tag = Tags.objects.create(name=tag_name)

        if tag.home_page_order is not None:
            tag.home_page_order = None
        else:
            max_order = Tags.objects.aggregate(Max('home_page_order'))['home_page_order__max']
            tag.home_page_order = (max_order or 0) + 1

        tag.save()
        
        return api_response(ServiceResponse('Tag toggled successfully').data({
            'name': tag.name,
            'home_page_order': tag.home_page_order
        }))
