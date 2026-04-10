"""
Serializers para el módulo de pacientes.
Convierten los modelos de Django a JSON y viceversa para la API REST.
"""
from rest_framework import serializers
from .models import Especie, Raza, Cliente, Paciente


class EspecieSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Especie.
    Devuelve el id y nombre de la especie (ej. Canino, Felino).
    """
    class Meta:
        model = Especie
        fields = ['id_especie', 'nombre']


class RazaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Raza.
    Incluye el nombre de la especie a la que pertenece la raza
    como campo de solo lectura.
    """
    especie_nombre = serializers.CharField(
        source='id_especie.nombre',
        read_only=True
    )

    class Meta:
        model = Raza
        fields = ['id_raza', 'nombre', 'id_especie', 'especie_nombre']


class ClienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Cliente (tutor de la mascota).
    Relacionado con un Usuario del sistema.
    """
    class Meta:
        model = Cliente
        fields = ['id_cliente', 'id_usuario', 'genero']


class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Paciente (mascota).
    Incluye campos adicionales de solo lectura para mostrar
    el nombre de la especie, raza y dueño sin necesitar
    consultas adicionales desde el frontend.
    """
    especie_nombre = serializers.CharField(
        source='id_raza.id_especie.nombre',
        read_only=True
    )
    raza_nombre = serializers.CharField(
        source='id_raza.nombre',
        read_only=True
    )
    dueno = serializers.CharField(
        source='id_cliente.id_usuario.nombre',
        read_only=True
    )

    class Meta:
        model = Paciente
        fields = [
            'id_paciente', 'nombre', 'sexo', 'edad',
            'id_cliente', 'id_raza',
            'especie_nombre', 'raza_nombre', 'dueno'
        ]