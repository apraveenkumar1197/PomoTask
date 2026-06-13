from Goal.models.goal import Goal
from Task.constants import HTTP_ERROR
from Task.services.service_response import ServiceResponse


class GoalCreator:
    def __init__(self, goal_data):
        self.goal_data = goal_data

    def create(self):
        try:
            goal_data = self.goal_data['goal']
            goal = Goal(**goal_data)
            goal.save()
            return ServiceResponse('Goal created')
        except Exception as e:
            return ServiceResponse('Error in creating Goal', HTTP_ERROR).ex(e)
