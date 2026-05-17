"""
Serializers para el módulo de pacientes.
Los serializers convierten los modelos de Django a formato JSON
para enviarlos al frontend, y validan los datos JSON que llegan
del frontend antes de guardarlos en la base de datos.
"""
from rest_framework import serializers
from .models import Especie, Raza, Cliente, Paciente


class EspecieSerializer(serializers.ModelSerializer):
    """Respuesta compacta para catalogo de especies."""
    class Meta:
        model = Especie
        fields = ['id_especie', 'nombre']


class RazaSerializer(serializers.ModelSerializer):
    """Incluye el nombre de especie para tablas y filtros del frontend."""
    especie_nombre = serializers.CharField(source='id_especie.nombre', read_only=True)

    class Meta:
        model = Raza
        fields = ['id_raza', 'nombre', 'id_especie', 'especie_nombre']


class ClienteSerializer(serializers.ModelSerializer):
    """Aplana nombre y correo del Usuario asociado al Cliente."""
    nombre = serializers.CharField(source='id_usuario.nombre', read_only=True)
    correo = serializers.CharField(source='id_usuario.correo', read_only=True)

    class Meta:
        model = Cliente
        fields = ['id_cliente', 'id_usuario', 'genero', 'nombre', 'correo']


class PacienteSerializer(serializers.ModelSerializer):
    """Expone mascota con datos legibles de especie, raza y dueno."""
    especie_nombre = serializers.CharField(source='id_raza.id_especie.nombre', read_only=True)
    raza_nombre = serializers.CharField(source='id_raza.nombre', read_only=True)
    dueno = serializers.CharField(source='id_cliente.id_usuario.nombre', read_only=True)

    class Meta:
        model = Paciente
        fields = [
            'id_paciente', 'nombre', 'sexo', 'edad', 'peso',
            'anamnesis',       
            'id_cliente', 'id_raza',
            'especie_nombre', 'raza_nombre', 'dueno',
            'cartilla_pdf'
        ]
