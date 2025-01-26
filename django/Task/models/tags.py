from django.db import models
from bson import ObjectId

class Tags(models.Model):

    id = models.CharField(primary_key=True, max_length=24, default=lambda: str(ObjectId()), editable=False)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)