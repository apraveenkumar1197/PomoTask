from Goal.formatters.yearly_goal_mini_list_formatter import YearlyGoalMiniListFormatter
from Goal.models.goal import Goal


class YearlyGoalListFormatter:
    def __init__(self, yearly_goal_list):
        self.yearly_goal_list = yearly_goal_list

    def format(self):
        yearly_goal_list = []
        for goal in self.yearly_goal_list:
            task_data = {
               'id': goal.id,
               'title': goal.title,
               'months': goal.months,
               'status_bool': goal.status == 1,
               'year': goal.year,
               'month': goal.month,
               'linked_goals': YearlyGoalMiniListFormatter(Goal.objects.filter(id__in=goal.linked_goals)).format(),
            }
            yearly_goal_list.append(task_data)
        return yearly_goal_list