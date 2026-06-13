from Goal.services.monthly_goals_fetcher import MonthlyGoalsFetcher
from Goal.services.yearly_goal_fetcher import YearlyGoalFetcher
from Task.services.service_response import ServiceResponse


class TaskGoalDisplayer:
    def __init__(self):
        pass

    def fetch(self):
        monthly_goals = MonthlyGoalsFetcher().fetch().data()['goals']
        yearly_goals = YearlyGoalFetcher().fetch().data()['goals']

        return ServiceResponse('Goals fetched').data({
            'monthly_goals': monthly_goals,
            'yearly_goals': yearly_goals
        })