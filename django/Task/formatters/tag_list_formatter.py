from Task.models.tags import Tags
from bson import ObjectId

class TagListFormatter:
    def __init__(self, tag_ids):
        self.tag_ids = tag_ids

    def format(self):
        tags = []
        if self.tag_ids is None:
            return tags

        tag_objs = Tags.objects.filter(id__in=self.tag_ids)
        for tag in tag_objs:
            tags.append({
                'id': tag.id,
                'name': tag.name
            })

        return tags