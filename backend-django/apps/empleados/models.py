"""
Modelos para el módulo de empleados.
Define los tipos de empleado, empleados y veterinarios del laboratorio.
Un veterinario es un empleado con datos profesionales adicionales
como CURP y cédula profesional.
"""
from django.db import models
from apps.usuarios.models import Usuario


class TipoEmpleado(models.Model):
    """
    Define los puestos disponibles en el laboratorio.
    Ejemplos: Recepcionista, Laboratorista, Veterinario analista.
    Cada empleado tiene exactamente un tipo asignado.
    """
    id_tipo_emp = models.AutoField(primary_key=True)
    puesto = models.CharField(
        max_length=50,
        help_text="Nombre del puesto. Ejemplo: Recepcionista, Laboratorista."
    )
    descripcion = models.CharField(
        max_length=100,
        help_text="Descripción de las responsabilidades del puesto."
    )

    class Meta:
        db_table = 'tipo_empleado'

    def __str__(self):
        return self.puesto


class Empleado(models.Model):
    """
    Representa al personal del laboratorio.
    Está ligado a un Usuario del sistema.
    Contiene información laboral como clínica, teléfono y dirección.
    Si el empleado es veterinario, tendrá un registro adicional
    en el modelo Veterinario con sus datos profesionales.
    """
    id_emp = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(
        Usuario,
        on_delete=models.PROTECT,
        db_column='id_usuario',
        help_text="Usuario del sistema asociado a este empleado."
    )
    id_tipo_emp = models.ForeignKey(
        TipoEmpleado,
        on_delete=models.PROTECT,
        db_column='id_tipo_emp',
        help_text="Puesto del empleado en el laboratorio."
    )
    nombre_clinica = models.CharField(
        max_length=100,
        help_text="Nombre de la clínica o laboratorio donde trabaja."
    )
    telefono = models.CharField(
        max_length=12,
        help_text="Teléfono de contacto del empleado."
    )
    direccion = models.CharField(
        max_length=60,
        help_text="Dirección del empleado o de la clínica."
    )

    class Meta:
        db_table = 'empleado'

    def __str__(self):
        return f"{self.id_usuario.nombre} - {self.id_tipo_emp.puesto}"


class Veterinario(models.Model):
    """
    Extiende los datos de un Empleado con información profesional.
    Solo los empleados que son veterinarios tienen este registro.
    Los veterinarios se asignan a las solicitudes de estudio
    para procesar muestras y registrar resultados clínicos.
    """
    id_vet = models.AutoField(primary_key=True)
    id_emp = models.OneToOneField(
        Empleado,
        on_delete=models.PROTECT,
        db_column='id_emp',
        help_text="Empleado asociado a este veterinario."
    )
    curp = models.CharField(
        max_length=18,
        help_text="CURP del veterinario. 18 caracteres."
    )
    cedula = models.CharField(
        max_length=10,
        help_text="Cédula profesional del veterinario."
    )

    class Meta:
        db_table = 'veterinario'

    def __str__(self):
        return f"Dr. {self.id_emp.id_usuario.nombre}"