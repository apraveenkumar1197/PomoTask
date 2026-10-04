import json
from django.views import View
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from Dairy.services.dairy_service import DairyService
from common.http_utils import api_response
from Task.services.service_response import ServiceResponse


class DairyViews(View):

    @require_http_methods(["GET"])
    def get_by_date(request, date):
        return api_response(DairyService.get_by_date(date))

    @csrf_exempt
    @require_http_methods(["POST"])
    def save_dairy(request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            date_val = data.get('date')
            text_val = data.get('text', '')
            return api_response(DairyService.save_dairy(date_val, text_val))
        except json.JSONDecodeError:
            return api_response(ServiceResponse().msg('Invalid JSON payload').code(400))
        except Exception as e:
            return api_response(ServiceResponse().msg(str(e)).code(500).ex(e))
