"""Serializers del modulo de usuarios.

Separan lo que se guarda en base de datos de lo que se expone por la API. La
contrasena nunca sale en respuestas y se cifra durante el registro.
"""

from rest_framework import serializers
from .models import Auditoria, Notificacion, TipoUsuario, Usuario


class TipoUsuarioSerializer(serializers.ModelSerializer):
    """Representa los roles disponibles para asignacion y lectura."""
    class Meta:
        model = TipoUsuario
        fields = ['id_tipo_usuario', 'descripcion']


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer publico de Usuario, sin exponer el hash de password."""
    tipo_usuario = TipoUsuarioSerializer(source='id_tipo_usuario', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombre', 'correo', 'num_tel', 'id_tipo_usuario', 'tipo_usuario']


class RegisterSerializer(serializers.ModelSerializer):
    """Valida datos de registro y cifra la contrasena antes de guardar."""
    class Meta:
        model = Usuario
        fields = ['nombre', 'correo', 'password', 'num_tel', 'id_tipo_usuario']

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class AuditoriaSerializer(serializers.ModelSerializer):
    """Aplana datos del actor para que el frontend muestre la bitacora."""
    actor_nombre = serializers.CharField(source='actor.nombre', read_only=True)
    actor_correo = serializers.CharField(source='actor.correo', read_only=True)

    class Meta:
        model = Auditoria
        fields = [
            'id_auditoria', 'actor', 'actor_nombre', 'actor_correo',
            'accion', 'modelo', 'objeto_id', 'descripcion', 'metadata', 'fecha'
        ]


class NotificacionSerializer(serializers.ModelSerializer):
    """Representa las notificaciones internas del usuario autenticado."""
    class Meta:
        model = Notificacion
        fields = [
            'id_notificacion', 'titulo', 'mensaje', 'tipo',
            'url', 'leida', 'fecha'
        ]
