class MonthlyGoalListFormatter:
    def __init__(self, monthly_goal_list):
        self.monthly_goal_list = monthly_goal_list

    def format(self):
        monthly_goal_list = []
        for goal in self.monthly_goal_list:
            task_data = {
               'id': goal.id,
               'title': goal.title,
               'status_bool': goal.status == 1,
            }
            monthly_goal_list.append(task_data)
        return monthly_goal_list