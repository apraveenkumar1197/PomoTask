from General.services.dashboard.daily_metrics import DailyMetrics
from General.services.dashboard.planned_vs_unplanned_data_fetcher import PlannedVsUnplannedDataFetcher
from Task.services.service_response import ServiceResponse


class DashboardDetailsFetcher:
    def __init__(self):
        pass

    def fetch(self):
        planned_vs_unplanned = PlannedVsUnplannedDataFetcher().fetch()
        daily_metrics = DailyMetrics().fetch()


        return ServiceResponse().data({
            'planned_vs_unplanned': planned_vs_unplanned.data(),
            'daily_metrics': daily_metrics.data(),
        })