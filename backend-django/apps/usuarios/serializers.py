from rest_framework import serializers
from .models import Usuario, TipoUsuario


class TipoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoUsuario
        fields = ['id_tipo_usuario', 'descripcion']


class UsuarioSerializer(serializers.ModelSerializer):
    tipo_usuario = TipoUsuarioSerializer(source='id_tipo_usuario', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombre', 'correo', 'num_tel', 'id_tipo_usuario', 'tipo_usuario']


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'correo', 'password', 'num_tel', 'id_tipo_usuario']

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)