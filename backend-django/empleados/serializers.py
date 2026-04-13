"""
Serializers para el módulo de empleados.
Convierte los datos del personal del laboratorio a formato JSON.
Incluye serializers para tipos de empleado, empleados y veterinarios.
Los veterinarios tienen un serializer especial que incluye su nombre
y clínica directamente para facilitar la asignación a solicitudes.
"""
from rest_framework import serializers
from .models import TipoEmpleado, Empleado, Veterinario


class TipoEmpleadoSerializer(serializers.ModelSerializer):
    """
    Serializer para los tipos de empleado (puestos).
    Convierte cada puesto a JSON con su id, nombre y descripción.
    Ejemplo de respuesta:
    {
        "id_tipo_emp": 1,
        "puesto": "Recepcionista",
        "descripcion": "Recibe muestras y gestiona solicitudes"
    }
    """
    class Meta:
        model = TipoEmpleado
        fields = ['id_tipo_emp', 'puesto', 'descripcion']


class EmpleadoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Empleado.
    Incluye el nombre del puesto como campo extra de solo lectura
    para que el frontend no tenga que hacer una consulta adicional.
    Ejemplo de respuesta:
    {
        "id_emp": 1,
        "id_usuario": 2,
        "id_tipo_emp": 1,
        "puesto": "Recepcionista",
        "nombre_clinica": "Hemática central",
        "telefono": "3121234567",
        "direccion": "Rafael Heredia #696"
    }
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
    Incluye el nombre del veterinario y su clínica como campos
    extra de solo lectura para facilitar la asignación a solicitudes.
    El frontend usa este serializer para mostrar la lista de
    veterinarios disponibles al momento de procesar una muestra.
    Ejemplo de respuesta:
    {
        "id_vet": 1,
        "id_emp": 1,
        "nombre": "Dr. Gómez",
        "clinica": "Hemática central",
        "curp": "GOME900101HCOLMR09",
        "cedula": "1234567"
    }
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