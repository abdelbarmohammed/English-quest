from rest_framework.permissions import BasePermission

from .models import Student


class IsStudent(BasePermission):
    """Grants access only to requests authenticated via DeviceTokenAuthentication."""

    message = 'A valid X-Device-Token header is required.'

    def has_permission(self, request, view):
        return isinstance(request.user, Student)
