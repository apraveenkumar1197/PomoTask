from Task.models import Task
from Task.services.service_response import ServiceResponse


class TaskReorderService:
    def __init__(self, view_key, task_ids):
        self.view_key = view_key
        self.task_ids = task_ids

    def reorder(self):
        for index, task_id in enumerate(self.task_ids):
            task = Task.objects.filter(id=task_id).first()
            if task:
                view_order = task.view_order or {}
                view_order[self.view_key] = index
                task.view_order = view_order
                task.save()
        return ServiceResponse('Tasks reordered')
