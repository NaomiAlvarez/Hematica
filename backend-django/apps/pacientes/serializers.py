"""
Serializers para el módulo de pacientes.
Los serializers convierten los modelos de Django a formato JSON
para enviarlos al frontend, y validan los datos JSON que llegan
del frontend antes de guardarlos en la base de datos.
"""
from rest_framework import serializers
from .models import Especie, Raza, Cliente, Paciente


class EspecieSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Especie.
    Convierte una especie a JSON con su id y nombre.
    Ejemplo de respuesta:
    {
        "id_especie": 1,
        "nombre": "Canino"
    }
    """
    class Meta:
        model = Especie
        fields = ['id_especie', 'nombre']


class RazaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Raza.
    Incluye el nombre de la especie como campo extra de solo lectura
    para que el frontend no tenga que hacer una consulta adicional
    para saber a qué especie pertenece la raza.
    Ejemplo de respuesta:
    {
        "id_raza": 1,
        "nombre": "Labrador",
        "id_especie": 1,
        "especie_nombre": "Canino"
    }
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
    Serializer para el modelo Cliente (tutor de mascotas).
    Incluye el nombre y correo del usuario para mostrar en el frontend.
    """
    nombre = serializers.CharField(
        source='id_usuario.nombre',
        read_only=True
    )
    correo = serializers.CharField(
        source='id_usuario.correo',
        read_only=True
    )

    class Meta:
        model = Cliente
        fields = ['id_cliente', 'id_usuario', 'genero', 'nombre', 'correo']


class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Paciente (mascota).
    Incluye campos adicionales de solo lectura para mostrar
    el nombre de la especie, raza y dueño directamente en la respuesta.
    Esto evita que el frontend tenga que hacer múltiples consultas.
    Ejemplo de respuesta:
    {
        "id_paciente": 1,
        "nombre": "Firulais",
        "sexo": "M",
        "edad": 3,
        "id_cliente": 1,
        "id_raza": 2,
        "especie_nombre": "Canino",
        "raza_nombre": "Labrador",
        "dueno": "María López"
    }
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