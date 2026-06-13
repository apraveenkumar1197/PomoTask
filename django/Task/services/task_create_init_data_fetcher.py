from Goal.services.task_goal_displayer import TaskGoalDisplayer
from Task.enums.status import Status
from Task.services.service_response import ServiceResponse


class TaskCreateInitDataFetcher:

    def fetch(self):
        return ServiceResponse().data({
            'statuses': [{'value': choice[0], 'label': choice[1]} for choice in Status.choices],
            'goals': TaskGoalDisplayer().fetch().data(),
        })