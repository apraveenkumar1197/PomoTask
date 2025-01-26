
class CalendarTaskListFormatter:
    def __init__(self, task_list):
        self.task_list = task_list

    def format(self):
        task_list = []
        for task in self.task_list:
            task_data = {
                'event_id': task.id,
                'title': task.title,
                'start': task.start_datetime(),
                'end': task.end_datetime(),
                'draggable?': True,
                'editable?': True,
                'deletable?': True,
                'disabled?': True
            }
            task_list.append(task_data)
        return task_list