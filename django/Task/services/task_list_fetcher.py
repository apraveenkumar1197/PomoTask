from Task.formatters.task_list_formatter import TaskListFormatter
from Task.models import Task

from Task.models.tags import Tags
from Task.services.service_response import ServiceResponse


class TaskListFetcher:
    def __init__(self, filters, search_term):
        self.filter = filters['filter']
        self.tag_names = filters['tag_names']
        self.search_term = search_term

    def fetch(self):
        if self.filter == 'important':
            tasks = Task.objects.important()
        elif self.filter == 'my_day':
            tasks = Task.objects.my_day()
        elif self.filter == 'planned':
            tasks = Task.objects.planned()
        elif self.filter == 'task-history':
            tasks = Task.objects.not_live()
        elif self.filter and self.filter.startswith('tag:'):
            tag_name = self.filter.split('tag:')[1]
            tasks = Task.objects.not_done()
            tasks = self.tag_filtered_ids_by_names(tasks, [tag_name])
        else:
            tasks = Task.objects.not_done()
            # Exclude tasks with pinned tags from the default task list
            home_page_tag_ids = set(Tags.objects.filter(home_page_order__isnull=False).values_list('id', flat=True))
            if home_page_tag_ids:
                excluded_task_ids = []
                for task in tasks:
                    if task.tags and (set(task.tags) & home_page_tag_ids):
                        excluded_task_ids.append(task.id)
                tasks = tasks.exclude(id__in=excluded_task_ids)

        #if self.search_term is not None and self.search_term is not "":
            #tasks = tasks.search(self.search_term)

        if self.tag_names:
            tasks = self.tag_filtered_ids(tasks)

        tasks = list(tasks)
        view_key = None if self.filter == 'task-history' else (self.filter or 'default')
        if view_key:
            tasks.sort(key=lambda t: (t.view_order or {}).get(view_key, float('inf')))

        tag_names = Tags.objects.values_list('name', flat=True)
        tag_names = sorted(list(tag_names))
        task_list = TaskListFormatter(tasks, self.search_term).format()

        # Fetch pinned side menu tags
        home_page_tags = Tags.objects.filter(home_page_order__isnull=False).order_by('home_page_order')
        home_page_tags_data = [{'id': t.id, 'name': t.name, 'home_page_order': t.home_page_order} for t in home_page_tags]

        return ServiceResponse('Tasks fetched').data({
            'tasks': task_list,
            'tags': tag_names,
            'home_page_tags': home_page_tags_data
        })

    def tag_filtered_ids(self, tasks):
        return self.tag_filtered_ids_by_names(tasks, self.tag_names)

    def tag_filtered_ids_by_names(self, tasks, tag_names):
        task_filtered_ids = []
        tags_ids = Tags.objects.filter(name__in=tag_names).values_list('id', flat=True)
        for task in tasks:
            if set(tags_ids).issubset(set(task.tags)):
                task_filtered_ids.append(task.id)

        return Task.objects.filter(id__in=task_filtered_ids)
