from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase

from Points.schedule import occurrence_on, occurrences_between
from Points.service import monthly_summary


def point(repeat, **fields):
    rule = {
        'title': 'Review', 'repeat': repeat,
        'start_date': '2026-01-01', 'effective': '2026-01-01',
        'weekday': None, 'month_day': None, **fields,
    }
    return SimpleNamespace(id='review', revisions=[rule])


class RecurrenceTests(SimpleTestCase):
    def test_planned_weekday_does_not_split_the_weekly_checkmark(self):
        item = point('weekly', weekday=3)
        sunday = date(2026, 12, 27)
        saturday = date(2027, 1, 2)
        occurrences = list(occurrences_between(item, sunday, saturday))
        self.assertEqual(len(occurrences), 1)
        self.assertEqual(occurrences[0].id, occurrence_on(item, sunday).id)
        self.assertEqual(occurrences[0].planned_date, date(2026, 12, 30))
        self.assertNotEqual(occurrence_on(item, date(2027, 1, 3)).id, occurrences[0].id)

    def test_monthly_checkmark_and_optional_date(self):
        first, last = date(2028, 2, 1), date(2028, 2, 29)
        flexible = point('monthly')
        self.assertEqual(occurrence_on(flexible, first).id, occurrence_on(flexible, last).id)
        self.assertIsNone(occurrence_on(flexible, first).planned_date)
        self.assertEqual(occurrence_on(point('monthly', month_day=31), first).planned_date, last)

    def test_week_spanning_two_months_belongs_to_the_month_it_ends_in(self):
        item = point('weekly', effective='2026-12-27', start_date='2026-12-27')
        day = date(2027, 1, 2)
        occurrence = occurrence_on(item, day)
        with patch('Points.service.PointItem.objects.all', return_value=[item]), patch(
            'Points.service.load_states', return_value=({occurrence.id: SimpleNamespace(achieved=True)}, {})
        ):
            december = monthly_summary('2026-12', day)
            january = monthly_summary('2027-01', day)
        self.assertEqual((december['achieved'], december['due']), (0, 0))
        self.assertEqual((january['achieved'], january['due']), (1, 1))
