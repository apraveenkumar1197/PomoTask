from Task.constants import HTTP_SUCCESS
from Task.models.tags import Tags
from Task.services.service_response import ServiceResponse
from Task.services.tags.tag_creator import TagCreator


class TagIdFetcher:
    def __init__(self, tag_names):
        self.tag_names = tag_names

    def fetch(self):
        tag_ids = []
        tags = Tags.objects.filter(name=self.tag_names).values()
        tag_dic = {tag['name']: tag for tag in tags}

        for tag_name in self.tag_names:
            if tag_name in tag_dic:
                tag_ids.append(tag_dic[tag_name].id)
            else:
                response = TagCreator(tag_name).create()
                if response.is_failed():
                    return response

                tag_ids.append(response.data()['tag_id'])
        return ServiceResponse('Tag Ids fetched').data({'tag_ids': tag_ids})

