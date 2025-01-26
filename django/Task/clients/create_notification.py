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
            "app_id": "f614b705-3e6a-4bac-97f5-ea30196b770d",
            "target_channel": "push",
            "headings": {"en": self.heading},
            "contents": {"en": self.content},
            "included_segments": ["Total Subscriptions"]
        }

    def _headers(self):
        return {
            "Authorization": "Key os_v2_app_6yklobj6njf2zf7v5iybs23xbxevjod2iq7un2vhcygdrmr45w2vcsycvswf2dz5nz7k6jzn2dckguwqgr35vhybg3bkel3k32sruri"}
