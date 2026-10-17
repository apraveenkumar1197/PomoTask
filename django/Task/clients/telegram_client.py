import html

import requests
from decouple import config

API_URL = "https://api.telegram.org/bot{token}/sendMessage"


class TelegramClient:
    """One-way notifications to a single Telegram chat via the Bot API.

    Needs TELEGRAM_BOT_TOKEN (from @BotFather) and TELEGRAM_CHAT_ID. When
    either is unset, send() is a no-op, so callers never need to check.
    """

    def __init__(self):
        self.token = config('TELEGRAM_BOT_TOKEN', default='')
        self.chat_id = config('TELEGRAM_CHAT_ID', default='')

    def is_configured(self):
        return bool(self.token and self.chat_id)

    def send(self, heading, content='', monospace=False):
        """Send a bold heading followed by content. Returns True on success; never raises.

        monospace=True renders content in a fixed-width block (for tables)."""
        if not self.is_configured():
            return False

        text = f"<b>{html.escape(heading)}</b>"
        if content:
            body = html.escape(content)
            text += f"\n<pre>{body}</pre>" if monospace else f"\n{body}"

        try:
            response = requests.post(
                API_URL.format(token=self.token),
                json={'chat_id': self.chat_id, 'text': text, 'parse_mode': 'HTML'},
                timeout=10,
            )
        except requests.RequestException as e:
            # Don't log the exception text verbatim: it embeds the request URL, i.e. the bot token.
            print(f"Telegram request failed: {type(e).__name__}")
            return False

        if not response.ok:
            print(f"Telegram sendMessage failed: {response.status_code} {response.text}")
            return False
        return True
