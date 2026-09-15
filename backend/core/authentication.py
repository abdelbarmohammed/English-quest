from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Student


class DeviceTokenAuthentication(BaseAuthentication):
    """
    Student authentication via X-Device-Token request header.

    Returns (Student, raw_token) on success.
    Returns None if the header is absent (unauthenticated, not an error —
    lets public endpoints remain accessible).
    Raises AuthenticationFailed on a present-but-invalid token.
    """

    HEADER = 'HTTP_X_DEVICE_TOKEN'

    def authenticate(self, request):
        token = request.META.get(self.HEADER)
        if not token:
            return None
        try:
            student = (
                Student.objects
                .select_related(
                    'school_class',
                    'school_class__school',
                    'school_class__subject',
                )
                .get(device_token=token)
            )
        except (Student.DoesNotExist, ValueError):
            raise AuthenticationFailed('Invalid or expired device token.')
        return (student, token)

    def authenticate_header(self, request):
        return 'X-Device-Token'
