from Goal.formatters.monthly_goal_list_formatter import MonthlyGoalListFormatter
from Goal.models.goal import Goal
from Task.services.service_response import ServiceResponse


class MonthlyGoalsFetcher:
    def __init__(self, year, month):
        self.year = year
        self.month = month

    def fetch(self):
        goals_list = Goal.objects.month(self.year, self.month)
        goals_list = MonthlyGoalListFormatter(goals_list).format()
        return ServiceResponse('Goals fetched').data({
            'goals': goals_list,
        })