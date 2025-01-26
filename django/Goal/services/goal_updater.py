from Goal.models.goal import Goal
from Task.constants import HTTP_ERROR
from Task.services.service_response import ServiceResponse


class GoalUpdater:
    def __init__(self, goal_id, goal_data):
        self.goal_id = goal_id
        self.goal_data = goal_data['goal']

    def update(self):
        try:
            goal = Goal.objects.filter(id=self.goal_id)
            goal.update(**self.goal_data)
            return ServiceResponse('Goal updated').data({'goal_id': goal.first().id})
        except Exception as e:
            return ServiceResponse('Error in updating goal', HTTP_ERROR).ex(e)
