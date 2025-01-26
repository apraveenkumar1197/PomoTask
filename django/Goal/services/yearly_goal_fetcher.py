from datetime import datetime

from Goal.enums.status import Status
from Goal.formatters.yearly_goal_list_formatter import YearlyGoalListFormatter
from Goal.formatters.yearly_goal_mini_list_formatter import YearlyGoalMiniListFormatter
from Goal.models.goal import Goal
from Task.services.service_response import ServiceResponse


class YearlyGoalFetcher:
    def __init__(self, year=datetime.now().year, mini='Y'):
        self.year = year
        self.mini = mini == 'Y'

    def fetch(self):
        goals_list = Goal.objects.year(self.year)
        if self.mini:
            goals_list = YearlyGoalMiniListFormatter(goals_list).format()
        else:
            goals_list = YearlyGoalListFormatter(goals_list).format()

        return ServiceResponse('Goals fetched').data({'goals': goals_list})
