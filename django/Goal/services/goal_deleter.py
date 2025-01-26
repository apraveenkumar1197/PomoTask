from Goal.models.goal import Goal
from Task.constants import HTTP_ERROR
from Task.services.service_response import ServiceResponse


class GoalDeleter:
    def __init__(self, goal_id):
        self.goal_id = goal_id

    def delete(self):
        try:
            goals = Goal.objects.filter(id=self.goal_id)
            goals.delete()
            return ServiceResponse('Goal deleted')
        except Exception as e:
            return ServiceResponse('Something went wrong', HTTP_ERROR).ex(e)
