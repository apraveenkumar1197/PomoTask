
class TaskEstimateFormatter:
    def __init__(self, estimate_seconds):
        self.estimate_seconds = estimate_seconds

    def format(self):
        if self.estimate_seconds is None:
            return None

        hours = self.estimate_seconds // 3600  # Get the number of hours
        minutes = (self.estimate_seconds % 3600) // 60  # Get the remaining minutes after hours

        formatted_time = ""
        formatted_time += f"{hours}h" if hours != 0 else ""
        formatted_time += f" {minutes}m" if minutes != 0 else ""

        return formatted_time
