from datetime import datetime, time

from Task.models import Task
from Task.services.utils.time_slot_generator import TimeSlotGenerator

CALENDAR_COLORS = {
    'task': '#6264A7',
    'activity': '#F59E0B',
}


class CalendarTaskListFormatter:
    def __init__(self, task_list):
        self.task_list = task_list

    def format(self):
        task_list = []

        occupied_time_slots = Task.objects.planned_today_with_timing().values_list('from_time', 'to_time')
        free_time_slots = TimeSlotGenerator().generate(occupied_time_slots)
        free_time_slot_index = 0

        for task in self.task_list:
            record_type = getattr(task, 'record_type', 'task') or 'task'
            start_time = task.start_datetime()
            end_time = task.end_datetime()

            if record_type == 'task':
                # Auto-assign free slots only for tasks that lack explicit timing
                if task.is_today() and start_time is None and end_time is None:
                    if free_time_slot_index < len(free_time_slots):
                        time_slot = free_time_slots[free_time_slot_index]
                        start_time = time_slot['from']
                        end_time = time_slot['to']
                        free_time_slot_index += 1
                elif not task.is_today() and start_time is None and end_time is None:
                    start_time = datetime.combine(task.due_date, time(hour=9, minute=0)).strftime("%Y-%m-%d %H:%M:%S")
                    end_time = datetime.combine(task.due_date, time(hour=10, minute=0)).strftime("%Y-%m-%d %H:%M:%S")
            else:
                # Activities always have explicit times from calendar drag; fallback if missing
                if start_time is None and end_time is None and task.due_date:
                    start_time = datetime.combine(task.due_date, time(hour=9, minute=0)).strftime("%Y-%m-%d %H:%M:%S")
                    end_time = datetime.combine(task.due_date, time(hour=10, minute=0)).strftime("%Y-%m-%d %H:%M:%S")

            task_data = {
                'event_id': task.id,
                'title': task.title,
                'start': start_time,
                'end': end_time,
                'record_type': record_type,
                'color': CALENDAR_COLORS.get(record_type, '#6264A7'),
                'draggable?': True,
                'editable?': True,
                'deletable?': True,
                'disabled?': True,
            }
            task_list.append(task_data)
        return task_list
