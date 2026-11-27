from calendar import monthrange
from dataclasses import dataclass
from datetime import date, time, timedelta
from hashlib import sha256
from zoneinfo import ZoneInfo

from decouple import config
from django.utils import timezone

DAY = timedelta(days=1)
REPEATS = ('daily', 'weekdays', 'interval', 'weekly', 'monthly')


def today():
    return timezone.now().astimezone(ZoneInfo(config('NOTIFICATION_TIMEZONE', default='UTC'))).date()


def parse_date(value):
    try:
        day = date.fromisoformat(value)
        if day.isoformat() == value and 1900 <= day.year <= 9997:
            return day
    except (TypeError, ValueError):
        pass
    raise ValueError('Enter a date in YYYY-MM-DD format.')


def parse_time(value):
    try:
        result = time.fromisoformat(value)
        if result.tzinfo is None and result.microsecond == 0:
            return result
    except (TypeError, ValueError):
        pass
    raise ValueError('Enter a valid planned time.')


def dates(start, end):
    while start <= end:
        yield start
        start += DAY


def rule_at(item, day):
    return next((rule for rule in reversed(item.revisions) if rule['effective'] <= day.isoformat()), None)


@dataclass(frozen=True)
class Occurrence:
    item_id: str
    start: date
    end: date
    rule: dict

    @property
    def id(self):
        repeat = self.rule['repeat']
        unit = repeat if repeat in ('weekly', 'monthly') else 'day'
        key = f'points:{self.item_id}:{unit}:{self.start.isoformat()}'
        return sha256(key.encode()).hexdigest()[:24]

    @property
    def planned_date(self):
        repeat = self.rule['repeat']
        if repeat == 'weekly':
            weekday = self.rule['weekday']
            day = self.start + timedelta(days=weekday) if weekday is not None else None
        elif repeat == 'monthly':
            month_day = self.rule['month_day']
            day = self.start.replace(day=min(month_day, self.end.day)) if month_day is not None else None
        else:
            day = self.start
        if day is not None and day.isoformat() < self.rule['start_date']:
            return None
        return day


def occurrence_on(item, day, rule=None):
    rule = rule if rule is not None else rule_at(item, day)
    if rule is None or day.isoformat() < rule['start_date']:
        return None
    repeat = rule['repeat']
    weekday = (day.weekday() + 1) % 7
    if repeat == 'weekdays' and weekday not in rule['weekdays']:
        return None
    if repeat == 'interval' and (day - parse_date(rule['start_date'])).days % rule['interval']:
        return None
    if repeat == 'weekly':
        start = day - timedelta(days=weekday)
        end = start + timedelta(days=6)
    elif repeat == 'monthly':
        start = day.replace(day=1)
        end = day.replace(day=monthrange(day.year, day.month)[1])
    else:
        start = end = day
    return Occurrence(item.id, start, end, rule)


def occurrences_between(item, start, end):
    result = {}
    for day in dates(start, end):
        occurrence = occurrence_on(item, day)
        if occurrence is not None:
            result[occurrence.id] = occurrence
    return result.values()


def current_occurrence(item, occurrence, day):
    """Use the latest settings for a period even when viewing an earlier day in it."""
    latest = occurrence_on(item, min(occurrence.end, max(occurrence.start, day)))
    return latest if latest is not None and latest.id == occurrence.id else occurrence
