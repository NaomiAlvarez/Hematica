from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.hashers import check_password
from .models import Usuario
from .serializers import RegisterSerializer, UsuarioSerializer
from apps.pacientes.models import Cliente


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Si el usuario es de tipo Cliente (id_tipo_usuario = 1),
            # crear automáticamente su registro en la tabla Cliente
            if user.id_tipo_usuario_id == 1:
                Cliente.objects.create(
                    id_usuario=user,
                    genero='M'  # Valor por defecto, puede editarse después
                )

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