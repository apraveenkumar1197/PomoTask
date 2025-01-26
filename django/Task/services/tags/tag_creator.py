from Task.constants import HTTP_SUCCESS, HTTP_ERROR
from Task.models.tags import Tags
from Task.services.service_response import ServiceResponse


class TagCreator:
    def __init__(self, tag_name):
        self.tag_name = tag_name

    def create(self):
        try:
            tag, created = Tags.objects.get_or_create(name=self.tag_name)
            return ServiceResponse('Tag created').data({'tag_id': tag.id})
        except Exception as e:
            return ServiceResponse('Error in creating Task', HTTP_ERROR).ex(e)
