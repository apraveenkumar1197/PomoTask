from django.views.decorators.http import require_http_methods

from Goal.services.yearly_goal_fetcher import YearlyGoalFetcher
from common.http_utils import api_response
