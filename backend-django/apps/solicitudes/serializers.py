"""
Serializers para el modulo de solicitudes.
Convierte los modelos de Solicitud y SolicitudEstudio a formato JSON.
"""
from rest_framework import serializers
from .models import Solicitud, SolicitudEstudio


class SolicitudSerializer(serializers.ModelSerializer):
    """Expone la solicitud junto con nombres calculados para tablas del frontend."""
    paciente_nombre = serializers.CharField(
        source='id_paciente.nombre', read_only=True
    )
    dueno = serializers.CharField(
        source='id_paciente.id_cliente.id_usuario.nombre', read_only=True
    )
    motivo_cancelacion = serializers.CharField(
        allow_null=True, required=False
    )

    class Meta:
        model = Solicitud
        fields = [
            'id_solicitud', 'id_paciente', 'paciente_nombre',
            'dueno', 'fecha_solicitud', 'estado', 'notas_cliente',
            'motivo_cancelacion'
        ]


class SolicitudEstudioSerializer(serializers.ModelSerializer):
    """Representa cada estudio elegido dentro de una solicitud."""
    estudio_nombre = serializers.CharField(
        source='id_catalogo.nombre', read_only=True
    )
    precio = serializers.DecimalField(
        source='id_catalogo.precio', max_digits=8,
        decimal_places=2, read_only=True
    )

    class Meta:
        model = SolicitudEstudio
        fields = [
            'id', 'id_solicitud', 'id_catalogo',
            'estudio_nombre', 'precio'
        ]
