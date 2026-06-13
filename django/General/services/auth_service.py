import jwt
import datetime
import json
from decouple import config
from Task.services.service_response import ServiceResponse

class AuthService:
    def __init__(self):
        self.static_username = config('AUTH_USERNAME')
        self.static_password = config('AUTH_PASSWORD')
        self.jwt_secret = config('JWT_SECRET')
        self.jwt_expiry_minutes = int(config('JWT_EXPIRY_MINUTES', default=60))

    def validate_and_generate_token(self, username, password):
        if username == self.static_username and password == self.static_password:
            payload = {
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=self.jwt_expiry_minutes),
                'iat': datetime.datetime.utcnow()
            }
            token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
            return ServiceResponse().data({'token': token})
        
        return ServiceResponse().msg('Invalid credentials').code(401)

