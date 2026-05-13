from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.hashers import check_password, make_password
from .models import Usuario, TipoUsuario
from .serializers import RegisterSerializer, UsuarioSerializer, TipoUsuarioSerializer
from apps.pacientes.models import Cliente


def obtener_admin_desde_token(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, Response({'error': 'Token requerido'}, status=401)

    token_str = auth_header.split(' ')[1]
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(token_str)
        usuario = Usuario.objects.select_related('id_tipo_usuario').get(
            id_usuario=token['id_usuario']
        )
    except (TokenError, Usuario.DoesNotExist, KeyError):
        return None, Response({'error': 'Token invalido o expirado'}, status=401)

    rol = (usuario.id_tipo_usuario.descripcion or '').strip().lower()
    if usuario.id_tipo_usuario_id != 4 and rol not in ['admin', 'administrador']:
        return None, Response({'error': 'Solo un administrador puede realizar esta accion'}, status=403)

    return usuario, None


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user.id_tipo_usuario_id == 1:
                Cliente.objects.create(id_usuario=user, genero='M')
            return Response(UsuarioSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
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
    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token requerido'}, status=401)
        token_str = auth_header.split(' ')[1]
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(token_str)
            id_usuario = token['id_usuario']
            user = Usuario.objects.get(id_usuario=id_usuario)
            return Response(UsuarioSerializer(user).data)
        except (TokenError, Usuario.DoesNotExist, KeyError):
            return Response({'error': 'Token inválido o expirado'}, status=401)


# Actualización de datos del usuario (nombre, num_tel, password)
class ActualizarUsuarioView(APIView):
    def patch(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token requerido'}, status=401)
        token_str = auth_header.split(' ')[1]
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(token_str)
            id_usuario = token['id_usuario']
            user = Usuario.objects.get(id_usuario=id_usuario)
        except (TokenError, Usuario.DoesNotExist, KeyError):
            return Response({'error': 'Token inválido o expirado'}, status=401)

        nombre = request.data.get('nombre')
        num_tel = request.data.get('num_tel')
        password = request.data.get('password')

        if nombre:
            user.nombre = nombre
        if num_tel:
            user.num_tel = num_tel
        if password:
            if len(password) < 8:
                return Response({'detail': 'La contraseña debe tener al menos 8 caracteres'}, status=400)
            user.password = make_password(password)

        user.save()
        return Response(UsuarioSerializer(user).data)


class AdminUsuariosView(APIView):
    def get(self, request):
        _, error_response = obtener_admin_desde_token(request)
        if error_response:
            return error_response

        usuarios = Usuario.objects.select_related('id_tipo_usuario').order_by('nombre')
        return Response(UsuarioSerializer(usuarios, many=True).data)


class AdminTiposUsuarioView(APIView):
    def get(self, request):
        _, error_response = obtener_admin_desde_token(request)
        if error_response:
            return error_response

        tipos = TipoUsuario.objects.all().order_by('id_tipo_usuario')
        return Response(TipoUsuarioSerializer(tipos, many=True).data)


class AdminAsignarRolView(APIView):
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

        return Response(UsuarioSerializer(usuario).data)
