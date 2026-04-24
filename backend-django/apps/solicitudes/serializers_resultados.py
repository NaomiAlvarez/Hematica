"""
Serializers para ResultadoEstudio e HistorialClinico.
"""
from rest_framework import serializers
from .models import ResultadoEstudio, HistorialClinico


class ResultadoEstudioSerializer(serializers.ModelSerializer):
    veterinario_nombre = serializers.CharField(
        source='id_vet.id_emp.id_usuario.nombre', read_only=True
    )
    paciente_nombre = serializers.CharField(
        source='id_solicitud.id_paciente.nombre', read_only=True
    )
    estado_solicitud = serializers.CharField(
        source='id_solicitud.estado', read_only=True
    )

    class Meta:
        model = ResultadoEstudio
        fields = [
            'id_resultado', 'id_solicitud', 'paciente_nombre',
            'estado_solicitud', 'id_vet', 'veterinario_nombre',
            'fecha_muestra', 'observaciones', 'reporte_clinico', 'archivo_pdf'
        ]


class HistorialClinicoSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source='id_paciente.nombre', read_only=True
    )
    especie = serializers.CharField(
        source='id_paciente.id_raza.id_especie.nombre', read_only=True
    )

    class Meta:
        model = HistorialClinico
        fields = [
            'id_exp', 'id_paciente', 'paciente_nombre', 'especie',
            'fecha_registro', 'diagnostico', 'tratamiento', 'notas'
        ]