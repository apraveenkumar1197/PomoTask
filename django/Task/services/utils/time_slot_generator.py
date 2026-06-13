from datetime import datetime, time, timedelta

class TimeSlotGenerator:
    SLOT_MINUTES = 30

    def __init__(self, start_time=time(9, 0), end_time=time(22, 0)):
        self.start_time = start_time
        self.end_time = end_time

    def _combine(self, t):
        """Combine time with today's date for comparison"""
        print(t.__class__)
        return datetime.combine(datetime.today(), t)

    def _overlaps(self, slot_start, slot_end, busy_start, busy_end):
        return slot_start < busy_end and slot_end > busy_start

    def generate(self, existing_time_sets):
        """
        existing_time_sets: List[(datetime.time, datetime.time)]
        returns: List[{"from": time, "to": time}]
        """
        # Convert existing time ranges to datetime for comparison
        busy_intervals = [
            (self._combine(start), self._combine(end))
            for start, end in existing_time_sets
        ]

        available_slots = []
        current = self._combine(self.start_time)
        end_boundary = self._combine(self.end_time)

        while current + timedelta(minutes=self.SLOT_MINUTES) <= end_boundary:
            slot_end = current + timedelta(minutes=self.SLOT_MINUTES)

            if not any(
                self._overlaps(current, slot_end, busy_start, busy_end)
                for busy_start, busy_end in busy_intervals
            ):
                available_slots.append({
                    "from": self._combine(current.time()),
                    "to": self._combine(slot_end.time())
                })

            current = slot_end

        return available_slots
