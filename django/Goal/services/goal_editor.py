from Goal.formatters.yearly_goal_list_formatter import YearlyGoalListFormatter
from Goal.models.goal import Goal
from Task.services.service_response import ServiceResponse


class GoalEditor:
    def __init__(self, goal_id):
        self.goal_id = goal_id

    def edit(self):
        goals_list = Goal.objects.filter(id=self.goal_id)
        goals_list = YearlyGoalListFormatter(goals_list).format()

        return ServiceResponse('Goal edit details').data({ 'goal': goals_list[0] })