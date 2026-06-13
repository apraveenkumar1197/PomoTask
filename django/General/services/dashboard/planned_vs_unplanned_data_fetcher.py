from Task.models import Task
from Task.services.service_response import ServiceResponse


class PlannedVsUnplannedDataFetcher:
    def __init__(self):
        pass

    def fetch(self):
        total_count = Task.objects.not_done().count()
        planned_count = Task.objects.detail_planned().count()
        un_planned_count = total_count - planned_count

        return ServiceResponse().data({ 'planned_count': planned_count, 'un_planned_count': un_planned_count })