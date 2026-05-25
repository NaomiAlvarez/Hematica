from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import Usuario


def role_name(usuario):
    return (getattr(usuario.id_tipo_usuario, 'descripcion', '') or '').strip().lower()


def is_admin(usuario):
    rol = role_name(usuario)
    return getattr(usuario, 'id_tipo_usuario_id', None) == 4 or rol in ['admin', 'administrador']


def is_veterinario(usuario):
    rol = role_name(usuario)
    return getattr(usuario, 'id_tipo_usuario_id', None) == 2 or rol == 'veterinario'


def is_cliente(usuario):
    rol = role_name(usuario)
    return getattr(usuario, 'id_tipo_usuario_id', None) == 1 or rol in ['cliente', 'usuario']


def is_recepcionista(usuario):
    rol = role_name(usuario)
    return getattr(usuario, 'id_tipo_usuario_id', None) == 3 or rol.startswith('recepcion')


def is_operativo(usuario):
    return is_admin(usuario) or is_veterinario(usuario) or is_recepcionista(usuario)


def get_usuario_from_request(request):
    cached = getattr(request, 'hematica_usuario', None)
    if cached is not None:
        return cached, None

    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, 'Token requerido'

    token_str = auth_header.split(' ', 1)[1].strip()
    if not token_str:
        return None, 'Token requerido'

    try:
        token = AccessToken(token_str)
        usuario = Usuario.objects.select_related('id_tipo_usuario').get(
            id_usuario=token['id_usuario']
        )
    except (TokenError, Usuario.DoesNotExist, KeyError):
        return None, 'Token invalido o expirado'

    request.hematica_usuario = usuario
    return usuario, None


class IsAuthenticatedUsuario(BasePermission):
    message = 'Token requerido'

    def has_permission(self, request, view):
        usuario, error = get_usuario_from_request(request)
        if error:
            self.message = error
            return False
        return usuario is not None


class IsAdminUsuario(IsAuthenticatedUsuario):
    message = 'Solo un administrador puede realizar esta accion'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return is_admin(request.hematica_usuario)


class IsAdminOrReadOnlyUsuario(IsAuthenticatedUsuario):
    message = 'Solo un administrador puede modificar esta informacion'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_admin(request.hematica_usuario)


class IsOperativoOrReadOnlyUsuario(IsAuthenticatedUsuario):
    message = 'No tienes permisos para modificar esta informacion'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_operativo(request.hematica_usuario)
