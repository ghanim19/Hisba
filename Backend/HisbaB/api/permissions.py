from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    يسمح فقط للمستخدمين الإداريين (superusers) بالوصول.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsEditorOrAdminUser(BasePermission):
    """
    يسمح فقط للمستخدمين الإداريين (superusers) أو المحررين (editors) بالوصول.
    """
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_superuser or request.user.profile.permission == 'editor'))
