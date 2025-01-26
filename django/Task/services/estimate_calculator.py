from datetime import datetime


class EstimateCalculator:
    TIME_FORMAT = "%H:%M:%S"

    def __init__(self, from_time, to_time):
        self.from_time = from_time
        self.to_time = to_time

    def estimate(self):
        if self.from_time is None or self.to_time is None:
            return None

        return (datetime.strptime(self.to_time, self.TIME_FORMAT) - datetime.strptime(self.from_time, self.TIME_FORMAT)).total_seconds()