import json

from django.views import View
from django.views.decorators.http import require_http_methods

from Goal.services.goal_creator import GoalCreator
from Goal.services.goal_deleter import GoalDeleter
from Goal.services.goal_editor import GoalEditor
from Goal.services.goal_updater import GoalUpdater
from Goal.services.monthly_goals_fetcher import MonthlyGoalsFetcher
from Goal.services.yearly_goal_fetcher import YearlyGoalFetcher
from common.http_utils import api_response


class GoalViews(View):

    @require_http_methods(["GET"])
    def yearly_goal_fetcher(request):
        return api_response(YearlyGoalFetcher(request.GET.get('year'), request.GET.get('mini')).fetch())

    @require_http_methods(["GET"])
    def monthly_goal_fetcher(request):
        print(f"{request.GET}")
        return api_response(MonthlyGoalsFetcher(request.GET.get('year'), request.GET.get('month')).fetch())

    @require_http_methods(["POST"])
    def create_goal(request):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(GoalCreator(data).create())

    @require_http_methods(["GET"])
    def edit_yearly_goal(request, goal_id):
        return api_response(GoalEditor(goal_id).edit())

    @require_http_methods(["PATCH"])
    def update_goal(request, goal_id):
        data = json.loads(request.body.decode('utf-8'))
        return api_response(GoalUpdater(goal_id, data).update())

    @require_http_methods(["DELETE"])
    def delete_goal(request, goal_id):
        return api_response(GoalDeleter(goal_id).delete())
