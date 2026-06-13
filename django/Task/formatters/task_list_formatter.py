from Task.enums.status import Status
from Task.formatters.tag_list_formatter import TagListFormatter
from Task.formatters.task_date_formatter import TaskDateFormatter
from Task.formatters.task_estimate_formatter import TaskEstimateFormatter
from Task.formatters.task_time_formatter import TaskTimeFormatter


class TaskListFormatter:
    def __init__(self, task_list, search_term):
        self.task_list = task_list
        self.search_term = search_term

    def format(self):
        task_list = []


        for task in self.task_list:
            if self.search_term is not None and self.search_term is not "":
                if self.search_term not in task.title:
                    continue

            task_data = {
                'id': task.id,
                'title': task.title,
                'is_important_flag': task.important_flag,
                'is_my_day': task.is_my_day,
                'planned_date': TaskDateFormatter(task.due_date).format(),
                'from_time': TaskTimeFormatter(task.from_time).format(),
                'estimate_text': TaskEstimateFormatter(task.estimate).format(),
                'tags': TagListFormatter(task.tags).format(),
                'status_bool': str(task.status) in [Status.Done.value],
                'is_deleted': str(task.status) == Status.Deleted.value,
            }
            task_list.append(task_data)
        return task_list