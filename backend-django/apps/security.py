from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


PDF_MAX_SIZE = 10 * 1024 * 1024


def role_slug(usuario):
    descripcion = (usuario.id_tipo_usuario.descripcion or '').strip().lower()
    if usuario.id_tipo_usuario_id == 4 or descripcion in {'admin', 'administrador'}:
        return 'admin'
    if descripcion == 'veterinario' or usuario.id_tipo_usuario_id == 2:
        return 'veterinario'
    return 'cliente'


def is_admin(usuario):
    return role_slug(usuario) == 'admin'


def is_veterinario(usuario):
    return role_slug(usuario) == 'veterinario'


def is_cliente(usuario):
    return role_slug(usuario) == 'cliente'


def get_usuario_from_request(request):
    from apps.usuarios.models import Usuario

    cached = getattr(request, 'usuario_actual', None)
    if cached is not None:
        return cached, None

    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, Response({'error': 'Token requerido'}, status=401)

    token_str = auth_header.split(' ', 1)[1]
    try:
        token = AccessToken(token_str)
        usuario = Usuario.objects.select_related('id_tipo_usuario').get(
            id_usuario=token['id_usuario']
        )
    except (TokenError, Usuario.DoesNotExist, KeyError):
        return None, Response({'error': 'Token invalido o expirado'}, status=401)

    request.usuario_actual = usuario
    return usuario, None


def require_roles(request, *roles):
    usuario, error_response = get_usuario_from_request(request)
    if error_response:
        return None, error_response
    if role_slug(usuario) not in roles:
        return None, Response({'error': 'No tienes permisos para realizar esta accion'}, status=403)
    return usuario, None


def cliente_for_usuario(usuario):
    from apps.pacientes.models import Cliente

    try:
        return Cliente.objects.get(id_usuario=usuario)
    except Cliente.DoesNotExist:
        return None


def veterinario_for_usuario(usuario):
    from apps.empleados.models import Veterinario

    try:
        return Veterinario.objects.get(id_emp__id_usuario=usuario)
    except Veterinario.DoesNotExist:
        return None


def accessible_cliente_ids(usuario):
    if is_admin(usuario):
        return None

    if is_cliente(usuario):
        cliente = cliente_for_usuario(usuario)
        return [cliente.id_cliente] if cliente else []

    vet = veterinario_for_usuario(usuario)
    if not vet:
        return []
    return list(vet.clientes.values_list('id_cliente', flat=True))


def user_can_access_cliente(usuario, id_cliente):
    ids = accessible_cliente_ids(usuario)
    return ids is None or int(id_cliente) in ids


def user_can_access_paciente(usuario, paciente):
    return user_can_access_cliente(usuario, paciente.id_cliente_id)


def audit(request, action, instance=None, description='', metadata=None):
    from apps.usuarios.models import Auditoria

    usuario, _ = get_usuario_from_request(request)
    model_name = ''
    object_id = ''
    if instance is not None:
        model_name = instance.__class__.__name__
        pk = getattr(instance, 'pk', None)
        object_id = str(pk) if pk is not None else ''

    Auditoria.objects.create(
        actor=usuario,
        accion=action,
        modelo=model_name,
        objeto_id=object_id,
        descripcion=description or '',
        metadata=metadata or {},
    )


def notify_usuario(usuario, titulo, mensaje, tipo='info', url=''):
    from apps.usuarios.models import Notificacion

    if usuario:
        Notificacion.objects.create(
            usuario=usuario,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            url=url,
        )


def notify_admins(titulo, mensaje, tipo='info', url=''):
    from apps.usuarios.models import Usuario

    admins = Usuario.objects.filter(
        id_tipo_usuario__descripcion__in=['Admin', 'Administrador', 'admin', 'administrador']
    ) | Usuario.objects.filter(id_tipo_usuario_id=4)
    for usuario in admins.distinct():
        notify_usuario(usuario, titulo, mensaje, tipo=tipo, url=url)


def validate_pdf_upload(archivo):
    if not archivo:
        return 'No se envio ningun archivo'
    if not archivo.name.lower().endswith('.pdf'):
        return 'Solo se permiten archivos PDF'
    if archivo.size > PDF_MAX_SIZE:
        return 'El archivo no puede superar 10MB'

    content_type = (getattr(archivo, 'content_type', '') or '').lower()
    if content_type and content_type not in {'application/pdf', 'application/x-pdf'}:
        return 'El archivo debe ser un PDF valido'

    pos = archivo.tell() if hasattr(archivo, 'tell') else None
    header = archivo.read(5)
    if hasattr(archivo, 'seek') and pos is not None:
        archivo.seek(pos)
    if header != b'%PDF-':
        return 'El contenido del archivo no corresponde a un PDF valido'
    return None


class AuthenticatedViewSetMixin:
    def initial(self, request, *args, **kwargs):
        self.format_kwarg = self.get_format_suffix(**kwargs)
        neg = self.perform_content_negotiation(request)
        request.accepted_renderer, request.accepted_media_type = neg
        version, scheme = self.determine_version(request, *args, **kwargs)
        request.version, request.versioning_scheme = version, scheme

        usuario, error_response = get_usuario_from_request(request)
        if error_response:
            if error_response.status_code == 401:
                raise AuthenticationFailed(error_response.data.get('error', 'Token requerido'))
            raise PermissionDenied(error_response.data.get('error', 'No tienes permisos'))
        self.usuario_actual = usuario

        self.perform_authentication(request)
        self.check_permissions(request)
        self.check_throttles(request)


class AdminWriteMixin(AuthenticatedViewSetMixin):
    def check_admin_write(self):
        if self.request.method not in {'GET', 'HEAD', 'OPTIONS'} and not is_admin(self.usuario_actual):
            raise PermissionDenied('Solo un administrador puede modificar este recurso')
