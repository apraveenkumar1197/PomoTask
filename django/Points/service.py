from django.db import DatabaseError
from django.db.models import Q

from Points.models import PointItem, PointOccurrence
from Points.schedule import (
    DAY, REPEATS, current_occurrence, dates, occurrence_on, occurrences_between, parse_date, parse_time,
    rule_at, today,
)
from Task.enums.status import Status
from Task.models import Task


def validate_item(data, day):
    title = data.get('title')
    repeat = data.get('repeat')
    if not isinstance(title, str) or not title.strip() or len(title.strip()) > 120:
        raise ValueError('Enter an item name of up to 120 characters.')
    if repeat not in REPEATS:
        raise ValueError('Choose a repeat schedule.')
    start = parse_date(data.get('start_date'))
    show_task = data.get('show_task', False)
    if type(show_task) is not bool:
        raise ValueError('Show as task must be on or off.')
    rule = {
        'title': title.strip(), 'repeat': repeat, 'start_date': start.isoformat(),
        'effective': day.isoformat(), 'show_task': show_task,
        'weekdays': [], 'weekday': None, 'month_day': None, 'interval': None,
        'from_time': None, 'to_time': None,
    }
    if repeat == 'weekdays':
        weekdays = data.get('weekdays')
        if not isinstance(weekdays, list) or not weekdays or any(type(d) is not int or not 0 <= d <= 6 for d in weekdays):
            raise ValueError('Choose at least one weekday.')
        rule['weekdays'] = sorted(set(weekdays))
    for kind, field, minimum, maximum in (
        ('weekly', 'weekday', 0, 6), ('monthly', 'month_day', 1, 31), ('interval', 'interval', 1, 365),
    ):
        if repeat != kind:
            continue
        value = data.get(field)
        if value is None and kind != 'interval':
            continue
        if type(value) is not int or not minimum <= value <= maximum:
            raise ValueError(f'Choose a value from {minimum} to {maximum} for {field.replace("_", " ")}.')
        rule[field] = value
    if show_task:
        start_time = parse_time(data.get('from_time'))
        end_time = parse_time(data.get('to_time'))
        if start_time >= end_time:
            raise ValueError('Planned end must be after planned start on the same day.')
        rule.update(from_time=start_time.isoformat(), to_time=end_time.isoformat())
    return rule


def save_item(data, item=None):
    day = today()
    rule = validate_item(data, day)
    if item is None:
        if parse_date(rule['start_date']) < day:
            raise ValueError('Start date must be today or later.')
        item = PointItem.objects.create(revisions=[rule])
    else:
        active_rule = rule_at(item, day)
        if active_rule is None:
            active_rule = item.revisions[0]
        rule['start_date'] = active_rule['start_date']
        effective = day
        active = occurrence_on(item, day)
        cadence = ('repeat', 'weekdays', 'interval')
        if active is not None and any(rule[field] != active_rule[field] for field in cadence):
            effective = active.end + DAY
        rule['effective'] = effective.isoformat()
        item.revisions = [r for r in item.revisions if r['effective'] < rule['effective']] + [rule]
        item.save(update_fields=['revisions'])
        # Update materialized future slots immediately, including slots removed by the new cadence.
        for record in PointOccurrence.objects.filter(item_id=item.id, period_end__gte=rule['effective']):
            task = Task.objects.filter(id=record.id).first()
            if task is None:
                continue
            occurrence = occurrence_on(item, max(effective, parse_date(record.period_start)))
            if occurrence is None or occurrence.id != record.id:
                Task.objects.filter(id=task.id).update(record_type=Task.RECORD_TYPE_HIDDEN_POINT)
            else:
                sync_task(occurrence, record, task)
    return item


def load_states(occurrences):
    ids = list({occurrence.id for occurrence in occurrences})
    if not ids:
        return {}, {}
    return (
        {record.id: record for record in PointOccurrence.objects.filter(id__in=ids)},
        {task.id: task for task in Task.objects.filter(id__in=ids, record_type__in=Task.POINT_RECORD_TYPES)},
    )


def achieved(record, task):
    return str(task.status) == Status.Done if task is not None else bool(record and record.achieved)


def next_occurrence(item, day):
    start = max(day, parse_date(item.revisions[0]['start_date']))
    return next((d for d in dates(start, start + DAY * 366) if occurrence_on(item, d)), None)


def list_items(day):
    items = list(PointItem.objects.all())
    occurrences = {item.id: occurrence_on(item, day) for item in items}
    records, tasks = load_states(o for o in occurrences.values() if o is not None)
    result = []
    for item in items:
        occurrence = occurrences[item.id]
        following = next_occurrence(item, day) if occurrence is None else None
        task = tasks.get(occurrence.id) if occurrence is not None else None
        rule = rule_at(item, day) or item.revisions[0]
        planned = None
        if occurrence is not None and rule['show_task']:
            planned = task.due_date if task is not None and task.record_type == Task.RECORD_TYPE_POINT else occurrence.planned_date
        result.append({
            'id': item.id, 'rule': rule, 'settings': item.revisions[-1],
            'period_start': occurrence.start if occurrence is not None else None,
            'period_end': occurrence.end if occurrence is not None else None,
            'achieved': achieved(records.get(occurrence.id), task) if occurrence is not None else False,
            'next_due': following, 'planned_date': planned,
            'from_time': task.from_time if task is not None else rule['from_time'],
            'to_time': task.to_time if task is not None else rule['to_time'],
        })
    return sorted(result, key=lambda item: item['settings']['title'].casefold())


def occurrence_record(occurrence):
    record = PointOccurrence.objects.filter(id=occurrence.id).first()
    if record is not None:
        return record
    return create_or_read(PointOccurrence.objects, occurrence.id, {
        'item_id': occurrence.item_id,
        'period_start': occurrence.start.isoformat(),
        'period_end': occurrence.end.isoformat(),
    })[0]


def create_or_read(manager, identifier, values):
    # A unique ID prevents duplicates. Avoid get_or_create's transaction rollback,
    # which this version of Djongo cannot perform after a concurrent insert.
    try:
        return manager.create(id=identifier, **values), True
    except DatabaseError:
        existing = manager.filter(id=identifier).first()
        if existing is None:
            raise
        return existing, False


def task_values(defaults):
    start = parse_time(defaults['from_time'])
    end = parse_time(defaults['to_time'])
    start_seconds = start.hour * 3600 + start.minute * 60 + start.second
    end_seconds = end.hour * 3600 + end.minute * 60 + end.second
    return {
        'due_date': parse_date(defaults['due_date']) if defaults['due_date'] else None,
        'from_time': start, 'to_time': end,
        'estimate': end_seconds - start_seconds,
    }


def sync_task(occurrence, record=None, task=None):
    rule = occurrence.rule
    if not rule['show_task']:
        if task is not None and task.record_type == Task.RECORD_TYPE_POINT:
            Task.objects.filter(id=task.id).update(record_type=Task.RECORD_TYPE_HIDDEN_POINT)
        return None
    planned = occurrence.planned_date
    defaults = {
        'due_date': planned.isoformat() if planned else None, 'title': rule['title'],
        'from_time': rule['from_time'], 'to_time': rule['to_time'],
    }
    record = record or occurrence_record(occurrence)
    if task is None:
        task, created = create_or_read(Task.objects, occurrence.id, {
            **task_values(defaults), 'title': rule['title'], 'record_type': Task.RECORD_TYPE_POINT,
            'status': Status.Done if record.achieved else Status.ToDo,
        })
        if created:
            PointOccurrence.objects.filter(id=record.id).update(task_defaults=defaults)
            return task
    updates = {}
    if task.record_type == Task.RECORD_TYPE_HIDDEN_POINT:
        updates['record_type'] = Task.RECORD_TYPE_POINT
    previous = record.task_defaults
    if defaults['title'] != previous.get('title'):
        updates['title'] = defaults['title']
    if any(defaults[field] != previous.get(field) for field in ('due_date', 'from_time', 'to_time')):
        updates.update(task_values(defaults))
        # Keep a date chosen in Tasks when editing the item's default time.
        if 'due_date' in record.task_defaults and defaults['due_date'] == record.task_defaults['due_date']:
            updates.pop('due_date')
    if updates:
        Task.objects.filter(id=task.id).update(**updates)
        task.refresh_from_db()
    if defaults != record.task_defaults:
        PointOccurrence.objects.filter(id=record.id).update(task_defaults=defaults)
    return task


def materialize_tasks(start, end, include_unplanned=False):
    day = today()
    occurrences = [
        current_occurrence(item, occurrence, day)
        for item in PointItem.objects.all()
        for occurrence in occurrences_between(item, start, end)
    ]
    records, tasks = load_states(occurrences)
    result = []
    for occurrence in occurrences:
        if not occurrence.rule['show_task']:
            continue
        task = tasks.get(occurrence.id)
        planned = occurrence.planned_date
        if task is None and not include_unplanned and (planned is None or not start <= planned <= end):
            continue
        result.append(sync_task(occurrence, records.get(occurrence.id), task))
    return result


def set_achieved(item, day, value):
    current_day = today()
    if day > current_day:
        raise ValueError('Future occurrences cannot be checked off.')
    occurrence = occurrence_on(item, day)
    if occurrence is None:
        raise ValueError('This item is not due on the selected date.')
    occurrence = current_occurrence(item, occurrence, current_day)
    record = occurrence_record(occurrence)
    task = Task.objects.filter(id=occurrence.id, record_type__in=Task.POINT_RECORD_TYPES).first()
    if task is None and occurrence.rule['show_task']:
        task = sync_task(occurrence, record)
    if task is not None:
        from Task.services.task_updater import TaskUpdater

        result = TaskUpdater({'status': Status.Done.value if value else Status.ToDo.value}, task.id).update()
        if result.is_failed():
            return result
    else:
        PointOccurrence.objects.filter(id=record.id).update(achieved=value)
    return None


def monthly_summary(month, day):
    start = parse_date(month + '-01')
    next_month = (start.replace(day=28) + DAY * 4).replace(day=1)
    end = min(day, next_month - DAY)
    items = list(PointItem.objects.all())
    by_item = {
        item.id: [
            occurrence for occurrence in occurrences_between(item, start - DAY * 6, end)
            if start <= occurrence.end < next_month
        ] if end >= start else []
        for item in items
    }
    records, tasks = load_states(o for occurrences in by_item.values() for o in occurrences)
    rows = []
    for item in items:
        occurrences = by_item[item.id]
        if not occurrences:
            continue
        count = sum(achieved(records.get(o.id), tasks.get(o.id)) for o in occurrences)
        rows.append({'id': item.id, 'title': item.revisions[-1]['title'], 'due': len(occurrences), 'achieved': count})
    return {
        'through': end,
        'due': sum(row['due'] for row in rows),
        'achieved': sum(row['achieved'] for row in rows),
        'items': sorted(rows, key=lambda row: row['title'].casefold()),
    }


def points_for_today(day):
    active = materialize_tasks(day, day, include_unplanned=True)
    return Q(record_type=Task.RECORD_TYPE_POINT, due_date=day) | Q(
        id__in=[task.id for task in active if task.due_date is None],
    )


def validate_task_plan(task, updates):
    if str(updates.get('status')) == Status.Deleted:
        raise ValueError('Turn off Show as task in Points to remove this linked task.')
    if not {'due_date', 'from_time', 'to_time'} & updates.keys():
        return
    record = PointOccurrence.objects.get(id=task.id)
    day = updates.get('due_date', task.due_date)
    if day is None:
        return
    planned = parse_date(day) if isinstance(day, str) else day
    if not record.period_start <= planned.isoformat() <= record.period_end:
        raise ValueError('Plan this task within its Points occurrence.')
    start = updates.get('from_time', task.from_time)
    end = updates.get('to_time', task.to_time)
    start = parse_time(start) if isinstance(start, str) else start
    end = parse_time(end) if isinstance(end, str) else end
    if start is None or end is None or start >= end:
        raise ValueError('Enter a planned start and end time for this task.')
