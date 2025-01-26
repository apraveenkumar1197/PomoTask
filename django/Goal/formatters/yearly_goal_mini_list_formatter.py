class YearlyGoalMiniListFormatter:
    def __init__(self, yearly_goal_list):
        self.yearly_goal_list = yearly_goal_list

    def format(self):
        yearly_goal_list = []
        for goal in self.yearly_goal_list:
            task_data = {
               'id': goal.id,
               'title': goal.title,
            }
            yearly_goal_list.append(task_data)
        return yearly_goal_list