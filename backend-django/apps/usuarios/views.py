"""Endpoints de autenticacion, cuenta, usuarios, auditoria y notificaciones."""

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.pacientes.models import Cliente
from apps.security import audit, get_usuario_from_request, require_roles
from .models import Auditoria, Notificacion, PasswordResetToken, TipoUsuario, Usuario
from .serializers import (
    AuditoriaSerializer,
    NotificacionSerializer,
    RegisterSerializer,
    TipoUsuarioSerializer,
    UsuarioSerializer,
)


def obtener_admin_desde_token(request):
    """Atajo usado por vistas administrativas basadas en APIView."""
    return require_roles(request, 'admin')


class RegisterView(APIView):
    """Crea usuarios nuevos y su perfil Cliente cuando el rol registrado es tutor."""
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user.id_tipo_usuario_id == 1:
                Cliente.objects.create(id_usuario=user, genero='M')
            Auditoria.objects.create(
                actor=user,
                accion='crear',
                modelo='Usuario',
                objeto_id=str(user.id_usuario),
                descripcion='Registro de usuario cliente',
            )
            return Response(UsuarioSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    """Valida correo/password y emite tokens JWT con los claims del proyecto."""
    def post(self, request):
        correo = request.data.get('correo')
        password = request.data.get('password')
        try:
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({'error': 'Credenciales incorrectas'}, status=401)
        if not check_password(password, user.password):
            return Response({'error': 'Credenciales incorrectas'}, status=401)
        token = RefreshToken()
        token['id_usuario'] = user.id_usuario
        token['tipo_usuario'] = user.id_tipo_usuario_id
        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'usuario': UsuarioSerializer(user).data
        })


class MeView(APIView):
    """Devuelve los datos actuales para reconstruir sesion desde el frontend."""
    def get(self, request):
        user, error_response = get_usuario_from_request(request)
        if error_response:
            return error_response
        return Response(UsuarioSerializer(user).data)


class ActualizarUsuarioView(APIView):
    """Permite que cada usuario actualice nombre, telefono y password propios."""
    def patch(self, request):
        user, error_response = get_usuario_from_request(request)
        if error_response:
            return error_response

        nombre = request.data.get('nombre')
        num_tel = request.data.get('num_tel')
        password = request.data.get('password')

        if nombre:
            user.nombre = nombre
        if num_tel:
            user.num_tel = num_tel
        if password:
            if len(password) < 8:
                return Response({'detail': 'La contrasena debe tener al menos 8 caracteres'}, status=400)
            user.password = make_password(password)

        user.save()
        audit(request, 'editar', user, 'Actualizacion de cuenta propia')
        return Response(UsuarioSerializer(user).data)


class AdminUsuariosView(APIView):
    """Lista usuarios para la pantalla administrativa de roles."""
    def get(self, request):
        _, error_response = obtener_admin_desde_token(request)
        if error_response:
            return error_response

        usuarios = Usuario.objects.select_related('id_tipo_usuario').order_by('nombre')
        return Response(UsuarioSerializer(usuarios, many=True).data)


class AdminTiposUsuarioView(APIView):
    """Lista roles existentes para alimentar el selector de administracion."""
    def get(self, request):
        _, error_response = obtener_admin_desde_token(request)
        if error_response:
            return error_response

        tipos = TipoUsuario.objects.all().order_by('id_tipo_usuario')
        return Response(TipoUsuarioSerializer(tipos, many=True).data)


class AdminAsignarRolView(APIView):
    """Cambia el rol de un usuario y crea Cliente si pasa a rol tutor."""
    def patch(self, request, id_usuario):
        admin_user, error_response = obtener_admin_desde_token(request)
        if error_response:
            return error_response

        if admin_user.id_usuario == id_usuario:
            return Response(
                {'error': 'No puedes cambiar tu propio rol desde esta pantalla'},
                status=400
            )

        id_tipo_usuario = request.data.get('id_tipo_usuario')
        if not id_tipo_usuario:
            return Response({'error': 'Selecciona un rol valido'}, status=400)

        try:
            tipo_usuario = TipoUsuario.objects.get(id_tipo_usuario=id_tipo_usuario)
            usuario = Usuario.objects.select_related('id_tipo_usuario').get(id_usuario=id_usuario)
        except TipoUsuario.DoesNotExist:
            return Response({'error': 'El rol seleccionado no existe'}, status=404)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        usuario.id_tipo_usuario = tipo_usuario
        usuario.save(update_fields=['id_tipo_usuario'])

        if tipo_usuario.id_tipo_usuario == 1:
            Cliente.objects.get_or_create(id_usuario=usuario, defaults={'genero': 'M'})

        audit(
            request,
            'cambiar_rol',
            usuario,
            f'Rol cambiado a {tipo_usuario.descripcion}',
            {'id_tipo_usuario': tipo_usuario.id_tipo_usuario}
        )
        return Response(UsuarioSerializer(usuario).data)


class PasswordResetRequestView(APIView):
    """Genera token temporal y envia el enlace de recuperacion por correo."""
    def post(self, request):
        correo = (request.data.get('correo') or '').strip()
        response_data = {
            'detail': 'Si el correo existe, enviaremos instrucciones para recuperar la contrasena.'
        }

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response(response_data)

        reset = PasswordResetToken.create_for_user(usuario)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset.token}"

        send_mail(
            subject='Recupera tu contrasena de Hematica',
            message=(
                f'Hola {usuario.nombre},\n\n'
                'Recibimos una solicitud para recuperar tu contrasena.\n'
                f'Usa este enlace durante la proxima hora: {reset_url}\n\n'
                'Si no solicitaste este cambio, ignora este correo.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario.correo],
            fail_silently=True,
        )

        Auditoria.objects.create(
            actor=usuario,
            accion='solicitar_reset_password',
            modelo='Usuario',
            objeto_id=str(usuario.id_usuario),
            descripcion='Solicitud de recuperacion de contrasena',
        )

        if settings.DEBUG:
            response_data['reset_url'] = reset_url
        return Response(response_data)


class PasswordResetConfirmView(APIView):
    """Consume un token valido de recuperacion y guarda la nueva contrasena."""
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password') or ''

        if len(password) < 8:
            return Response({'error': 'La contrasena debe tener al menos 8 caracteres'}, status=400)

        try:
            reset = PasswordResetToken.objects.select_related('usuario').get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Token invalido'}, status=400)

        if not reset.valido:
            return Response({'error': 'Token expirado o utilizado'}, status=400)

        usuario = reset.usuario
        usuario.password = make_password(password)
        usuario.save(update_fields=['password'])
        reset.marcar_usado()
        Auditoria.objects.create(
            actor=usuario,
            accion='reset_password',
            modelo='Usuario',
            objeto_id=str(usuario.id_usuario),
            descripcion='Contrasena restablecida por correo',
        )
        return Response({'detail': 'Contrasena actualizada correctamente'})


class NotificacionesView(APIView):
    """Lista notificaciones del usuario autenticado."""
    def get(self, request):
        usuario, error_response = get_usuario_from_request(request)
        if error_response:
            return error_response

        qs = Notificacion.objects.filter(usuario=usuario)
        return Response(NotificacionSerializer(qs, many=True).data)


class NotificacionMarcarLeidaView(APIView):
    """Marca como leida una notificacion propia."""
    def patch(self, request, id_notificacion):
        usuario, error_response = get_usuario_from_request(request)
        if error_response:
            return error_response

        try:
            notificacion = Notificacion.objects.get(
                id_notificacion=id_notificacion,
                usuario=usuario,
            )
        except Notificacion.DoesNotExist:
            return Response({'error': 'Notificacion no encontrada'}, status=404)

        notificacion.leida = True
        notificacion.save(update_fields=['leida'])
        return Response(NotificacionSerializer(notificacion).data)


class AdminAuditoriaView(APIView):
    """Expone las ultimas acciones registradas para revision administrativa."""
    def get(self, request):
        _, error_response = require_roles(request, 'admin')
        if error_response:
            return error_response

        qs = Auditoria.objects.select_related('actor').all()[:100]
        return Response(AuditoriaSerializer(qs, many=True).data)
