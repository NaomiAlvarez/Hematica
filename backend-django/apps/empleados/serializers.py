"""Serializers del modulo de empleados.

Incluyen campos derivados para que el frontend pueda mostrar nombres, clinicas
y clientes asignados sin hacer consultas adicionales por cada fila.
"""

from rest_framework import serializers
from .models import TipoEmpleado, Empleado, Veterinario, VeterinarioCliente
from apps.pacientes.models import Cliente


class TipoEmpleadoSerializer(serializers.ModelSerializer):
    """Convierte los puestos laborales disponibles a JSON."""
    class Meta:
        model = TipoEmpleado
        fields = ['id_tipo_emp', 'puesto', 'descripcion']


class EmpleadoSerializer(serializers.ModelSerializer):
    """Expone datos laborales y datos basicos del Usuario asociado."""
    puesto  = serializers.CharField(source='id_tipo_emp.puesto',    read_only=True)
    nombre  = serializers.CharField(source='id_usuario.nombre',     read_only=True)

    class Meta:
        model = Empleado
        fields = ['id_emp', 'id_usuario', 'id_tipo_emp', 'puesto',
                  'nombre', 'nombre_clinica', 'telefono', 'direccion']


class VeterinarioSerializer(serializers.ModelSerializer):
    """Expone datos profesionales y los clientes asignados al veterinario."""
    nombre      = serializers.CharField(source='id_emp.id_usuario.nombre', read_only=True)
    clinica     = serializers.CharField(source='id_emp.nombre_clinica',    read_only=True)
    clientes_ids = serializers.SerializerMethodField()

    class Meta:
        model = Veterinario
        fields = ['id_vet', 'id_emp', 'nombre', 'clinica', 'curp', 'cedula', 'clientes_ids']

    def get_clientes_ids(self, obj):
        return list(obj.clientes.values_list('id_cliente', flat=True))


class ClienteSimpleSerializer(serializers.ModelSerializer):
    """Version compacta de Cliente usada en asignacion veterinario-cliente."""
    nombre = serializers.CharField(source='id_usuario.nombre', read_only=True)
    correo = serializers.CharField(source='id_usuario.correo', read_only=True)

    class Meta:
        model = Cliente
        fields = ['id_cliente', 'nombre', 'correo']


class VeterinarioClienteSerializer(serializers.ModelSerializer):
    """Representa la tabla puente entre veterinarios y clientes."""
    class Meta:
        model = VeterinarioCliente
        fields = ['id_vet', 'id_cliente']
