
class TaskTimerStatusFormatter:
    def __init__(self, task_timing_list):
        self.task_timing_list = task_timing_list

    def format(self):
        task_list = []

        for task in self.task_timing_list:
            task_data = {
                'id': task.id,
                'title': task.title,
                'is_important_flag': task.important_flag,
                'is_my_day': task.is_my_day,
            }
            task_list.append(task_data)
        return task_list