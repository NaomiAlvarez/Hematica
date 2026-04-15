from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.hashers import check_password
from .models import Usuario
from .serializers import RegisterSerializer, UsuarioSerializer

class RegisterView(APIView):
    """
    Vista para el registro de nuevos usuarios en el sistema.
    """
    def post(self, request):
        """
        Maneja la creación de un nuevo usuario.
        
        Args:
            request: Objeto de la solicitud con los datos del nuevo usuario.
            
        Returns:
            Response: Datos del usuario creado (201) o errores de validación (400).
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Retorna los datos serializados del usuario recién creado
            return Response(UsuarioSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    """
    Vista para la autenticación de usuarios y generación de tokens JWT.
    """
    def post(self, request):
        """
        Verifica credenciales y devuelve un par de tokens (Access y Refresh).
        
        Args:
            request: Contiene 'correo' y 'password'.
            
        Returns:
            Response: Tokens JWT y datos del usuario (200) o error de credenciales (401).
        """
        correo = request.data.get('correo')
        password = request.data.get('password')

        try:
            # Buscar al usuario por correo electrónico
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        # Verificar si la contraseña proporcionada coincide con el hash en la BD
        if not check_password(password, user.password):
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        # Generación manual del token JWT
        token = RefreshToken()
        # Inyectar claims (datos extra) personalizados en el token
        token['id_usuario'] = user.id_usuario
        token['tipo_usuario'] = user.id_tipo_usuario_id

        return Response({
            'access': str(token.access_token),
            'refresh': str(token),
            'usuario': UsuarioSerializer(user).data
        })


class MeView(APIView):
    """
    Vista para obtener el perfil del usuario autenticado a partir del token.
    """
    def get(self, request):
        """
        Extrae el ID del usuario desde el Header Authorization y retorna su perfil.
        
        Returns:
            Response: Datos del usuario (200) o error de autenticación (401).
        """
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token requerido'}, status=401)

        # Extraer el token de la cadena "Bearer <token>"
        token_str = auth_header.split(' ')[1]

        try:
            from rest_framework_simplejwt.tokens import AccessToken
            # Validar y decodificar el token de acceso
            token = AccessToken(token_str)
            
            # Obtener el ID del usuario desde los claims del token
            id_usuario = token['id_usuario']
            user = Usuario.objects.get(id_usuario=id_usuario)
            
            return Response(UsuarioSerializer(user).data)
        except (TokenError, Usuario.DoesNotExist, KeyError):
            # Captura tokens expirados, mal formados o usuarios eliminados
            return Response({'error': 'Token inválido o expirado'}, status=401)