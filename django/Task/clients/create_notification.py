import requests


class CreateNotification:
    def __init__(self, heading, content):
        self.heading = heading
        self.content = content

    def push(self):
        return requests.get(self.url(), headers=self.headers())

    def _url(self):
        return "https://api.onesignal.com/notifications"

    def _body(self):
        return {
            "app_id": "",
            "target_channel": "push",
            "headings": {"en": self.heading},
            "contents": {"en": self.content},
            "included_segments": ["Total Subscriptions"]
        }

    def _headers(self):
        return {
            "Authorization": "Key "}
