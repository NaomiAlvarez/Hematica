"""
Serializers para el módulo de empleados.
Maneja el personal del laboratorio: empleados generales
y veterinarios con sus datos profesionales.
"""
from rest_framework import serializers
from .models import TipoEmpleado, Empleado, Veterinario


class TipoEmpleadoSerializer(serializers.ModelSerializer):
    """
    Serializer para los tipos de empleado.
    Define los puestos disponibles en el laboratorio.
    Ejemplo: Recepcionista, Laboratorista, Veterinario analista.
    """
    class Meta:
        model = TipoEmpleado
        fields = ['id_tipo_emp', 'puesto', 'descripcion']


class EmpleadoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Empleado.
    Incluye el nombre del puesto como campo de solo lectura
    para no tener que hacer consultas extra desde el frontend.
    """
    puesto = serializers.CharField(
        source='id_tipo_emp.puesto',
        read_only=True
    )

    class Meta:
        model = Empleado
        fields = [
            'id_emp', 'id_usuario', 'id_tipo_emp',
            'puesto', 'nombre_clinica', 'telefono', 'direccion'
        ]


class VeterinarioSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Veterinario.
    Extiende los datos del empleado con información
    profesional: CURP y cédula profesional.
    Usado para asignar veterinarios a solicitudes de estudio.
    """
    nombre = serializers.CharField(
        source='id_emp.id_usuario.nombre',
        read_only=True
    )
    clinica = serializers.CharField(
        source='id_emp.nombre_clinica',
        read_only=True
    )

    class Meta:
        model = Veterinario
        fields = ['id_vet', 'id_emp', 'nombre', 'clinica', 'curp', 'cedula']