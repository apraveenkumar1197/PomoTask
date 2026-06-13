from django.db import models
from bson import ObjectId

def generate_object_id():
    return str(ObjectId())

class Tags(models.Model):

    id = models.CharField(primary_key=True, max_length=24, default=generate_object_id, editable=False)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    home_page_order = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)