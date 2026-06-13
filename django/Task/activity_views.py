import json

from django.views import View
from django.views.decorators.http import require_http_methods

from Task.services.activity_creator import ActivityCreator
from Task.services.task_updater import TaskUpdater
from common.http_utils import api_response


class ActivityViews(View):

    @require_http_methods(["POST"])
    def create_activity(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(ActivityCreator(data).create())

    @require_http_methods(["PATCH"])
    def update_activity(request, activity_id):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(TaskUpdater(data['activity'], activity_id).update())
