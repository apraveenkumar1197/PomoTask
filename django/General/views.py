from General.services.dashboard_details_fetcher import DashboardDetailsFetcher
from General.services.auth_service import AuthService
from common.http_utils import api_response
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import json


class GeneralView(View):

    @require_http_methods(["GET"])
    def dashboard(request):
        return api_response(DashboardDetailsFetcher().fetch())

    @csrf_exempt
    @require_http_methods(["POST"])
    def login(request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            response = AuthService().validate_and_generate_token(username, password)
            return api_response(response)
        except json.JSONDecodeError:
            from Task.services.service_response import ServiceResponse
            return api_response(ServiceResponse().msg('Invalid JSON body').code(400))