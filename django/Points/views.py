import json

from django.views.decorators.http import require_http_methods

from Points.models import PointItem
from Points.schedule import parse_date, today
from Points.service import list_items, monthly_summary, save_item, set_achieved
from Task.services.service_response import ServiceResponse
from common.http_utils import api_response


def response(data=None, error=None, status=200):
    result = ServiceResponse(error, status)
    if data is not None:
        result.data(data)
    return api_response(result)


def payload(request):
    data = json.loads(request.body)
    if not isinstance(data, dict):
        raise ValueError('Expected a JSON object.')
    return data


@require_http_methods(['GET', 'POST'])
def items(request):
    try:
        if request.method == 'POST':
            item = save_item(payload(request))
            return response({'id': item.id}, status=201)
        day = parse_date(request.GET.get('date', today().isoformat()))
        return response({'items': list_items(day), 'today': today()})
    except ValueError as error:
        return response(error=str(error), status=400)


@require_http_methods(['PUT'])
def update_item(request, item_id):
    try:
        item = save_item(payload(request), PointItem.objects.get(id=item_id))
        return response({'id': item.id, 'effective': item.revisions[-1]['effective']})
    except PointItem.DoesNotExist:
        return response(error='Point item not found.', status=404)
    except ValueError as error:
        return response(error=str(error), status=400)


@require_http_methods(['PUT'])
def check_in(request, item_id, day):
    try:
        data = payload(request)
        value = data.get('achieved')
        if type(value) is not bool:
            raise ValueError('Achievement must be true or false.')
        error = set_achieved(PointItem.objects.get(id=item_id), parse_date(day), value)
        return api_response(error) if error is not None else response({'achieved': value})
    except PointItem.DoesNotExist:
        return response(error='Point item not found.', status=404)
    except ValueError as error:
        return response(error=str(error), status=400)


@require_http_methods(['GET'])
def summary(request):
    try:
        day = today()
        month = request.GET.get('month', day.strftime('%Y-%m'))
        if parse_date(month + '-01') > day:
            raise ValueError('Choose the current month or an earlier month.')
        return response(monthly_summary(month, day))
    except ValueError as error:
        return response(error=str(error), status=400)
