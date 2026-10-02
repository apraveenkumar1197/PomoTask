from bson import ObjectId
from django.db import models


def generate_object_id():
    return str(ObjectId())


class Dairy(models.Model):
    id = models.CharField(primary_key=True, max_length=24, default=generate_object_id, editable=False)
    date = models.DateField(unique=True, db_index=True)
    text = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d') if hasattr(self.date, 'strftime') else str(self.date),
            'text': self.text or '',
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else str(self.created_at),
            'updated_at': self.updated_at.isoformat() if hasattr(self.updated_at, 'isoformat') else str(self.updated_at),
        }
