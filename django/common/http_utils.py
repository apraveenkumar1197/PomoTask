from django.http import JsonResponse


def api_response(response_dic):
    if response_dic.__class__.__name__ == 'ServiceResponse':
        if response_dic.ex() is not None:
            print(response_dic.ex())

        data = {}
        if response_dic.msg() is not None:
            data['msg'] = response_dic.msg()
        if response_dic.data() is not None:
            data['data'] = response_dic.data()

        return JsonResponse(data, status=response_dic.code())

    if 'ex' in response_dic:
        print(response_dic['ex'])

    return JsonResponse(response_dic['res'], status=response_dic['code'])