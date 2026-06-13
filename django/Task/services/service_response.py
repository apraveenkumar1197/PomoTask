from Task.constants import HTTP_SUCCESS


class ServiceResponse:
    def __init__(self, msg_data = None, code_data = HTTP_SUCCESS):
        self.ex_data = None
        self.data_data = None
        self.msg_data = msg_data
        self.code_data = code_data

    def code(self, code_data = None):
        if code_data is None:
            return self.code_data
        self.code_data = code_data
        return self

    def msg(self, msg_data = None):
        if msg_data is None:
            return self.msg_data
        self.msg_data = msg_data
        return self

    def data(self, data_data = None):
        if data_data is None:
            return self.data_data
        self.data_data = data_data
        return self

    def ex(self, ex_data = None):
        if ex_data is None:
            return self.ex_data
        self.ex_data = ex_data
        return self

    def is_success(self):
        return self.code_data == HTTP_SUCCESS

    def is_failed(self):
        return self.code_data != HTTP_SUCCESS
