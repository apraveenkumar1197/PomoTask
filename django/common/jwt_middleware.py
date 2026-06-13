import jwt
from django.http import JsonResponse
from decouple import config
from Task.services.service_response import ServiceResponse
from common.http_utils import api_response

class JWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_secret = config('JWT_SECRET')
        # Routes that do not require authentication
        self.whitelist = [
            '/auth/login',
            '/admin',  # Allow admin access if needed
        ]

    def __call__(self, request):
        # 1. Check if the path is in the whitelist
        if any(request.path.startswith(path) for path in self.whitelist):
            return self.get_response(request)

        # 2. Get the Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return api_response(ServiceResponse().msg('Authentication credentials were not provided.').code(401))

        token = auth_header.split(' ')[1]

        try:
            # 3. Decode and validate the token
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            # You can attach the payload to the request for use in views if needed
            request.user_payload = payload
        except jwt.ExpiredSignatureError:
            return api_response(ServiceResponse().msg('Token has expired.').code(401))
        except jwt.InvalidTokenError:
            return api_response(ServiceResponse().msg('Invalid token.').code(401))
        except Exception as e:
            return api_response(ServiceResponse().msg(f'Authentication error: {str(e)}').code(401))

        return self.get_response(request)
