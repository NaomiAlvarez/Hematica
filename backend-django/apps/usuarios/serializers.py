from rest_framework import serializers
from .models import Auditoria, Notificacion, TipoUsuario, Usuario


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


class AuditoriaSerializer(serializers.ModelSerializer):
    actor_nombre = serializers.CharField(source='actor.nombre', read_only=True)
    actor_correo = serializers.CharField(source='actor.correo', read_only=True)

    class Meta:
        model = Auditoria
        fields = [
            'id_auditoria', 'actor', 'actor_nombre', 'actor_correo',
            'accion', 'modelo', 'objeto_id', 'descripcion', 'metadata', 'fecha'
        ]


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = [
            'id_notificacion', 'titulo', 'mensaje', 'tipo',
            'url', 'leida', 'fecha'
        ]
