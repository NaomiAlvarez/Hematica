from rest_framework import serializers
from .models import TipoEmpleado, Empleado, Veterinario, VeterinarioCliente
from apps.pacientes.models import Cliente


class TipoEmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEmpleado
        fields = ['id_tipo_emp', 'puesto', 'descripcion']


class EmpleadoSerializer(serializers.ModelSerializer):
    puesto  = serializers.CharField(source='id_tipo_emp.puesto',    read_only=True)
    nombre  = serializers.CharField(source='id_usuario.nombre',     read_only=True)  # ← FIX

    class Meta:
        model = Empleado
        fields = ['id_emp', 'id_usuario', 'id_tipo_emp', 'puesto',
                  'nombre', 'nombre_clinica', 'telefono', 'direccion']


class VeterinarioSerializer(serializers.ModelSerializer):
    nombre      = serializers.CharField(source='id_emp.id_usuario.nombre', read_only=True)
    clinica     = serializers.CharField(source='id_emp.nombre_clinica',    read_only=True)
    clientes_ids = serializers.SerializerMethodField()

    class Meta:
        model = Veterinario
        fields = ['id_vet', 'id_emp', 'nombre', 'clinica', 'curp', 'cedula', 'clientes_ids']

    def get_clientes_ids(self, obj):
        return list(obj.clientes.values_list('id_cliente', flat=True))


class ClienteSimpleSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='id_usuario.nombre', read_only=True)
    correo = serializers.CharField(source='id_usuario.correo', read_only=True)

    class Meta:
        model = Cliente
        fields = ['id_cliente', 'nombre', 'correo']


class VeterinarioClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VeterinarioCliente
        fields = ['id_vet', 'id_cliente']