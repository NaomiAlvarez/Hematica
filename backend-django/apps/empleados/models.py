"""
Modelos para el módulo de empleados.
Define los tipos de empleado, empleados y veterinarios del laboratorio.
Un veterinario es un empleado con datos profesionales adicionales
como CURP y cédula profesional.
"""
from django.db import models
from apps.usuarios.models import Usuario


class TipoEmpleado(models.Model):
    id_tipo_emp = models.AutoField(primary_key=True)
    puesto = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=100)

    class Meta:
        db_table = 'tipo_empleado'

    def __str__(self):
        return self.puesto


class Empleado(models.Model):
    id_emp = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, db_column='id_usuario'
    )
    id_tipo_emp = models.ForeignKey(
        TipoEmpleado, on_delete=models.PROTECT, db_column='id_tipo_emp'
    )
    nombre_clinica = models.CharField(max_length=100)
    telefono = models.CharField(max_length=12)
    direccion = models.CharField(max_length=60)

    class Meta:
        db_table = 'empleado'

    def __str__(self):
        return f"{self.id_usuario.nombre} - {self.id_tipo_emp.puesto}"


class Veterinario(models.Model):
    id_vet = models.AutoField(primary_key=True)
    id_emp = models.OneToOneField(
        Empleado, on_delete=models.PROTECT, db_column='id_emp'
    )
    curp = models.CharField(max_length=18)
    cedula = models.CharField(max_length=10)

    # Relación ManyToMany con Cliente — un vet puede tener varios clientes
    # y un cliente puede tener varios vets
    clientes = models.ManyToManyField(
        'pacientes.Cliente',
        through='VeterinarioCliente',
        blank=True,
        related_name='veterinarios',
        help_text='Clientes asignados a este veterinario'
    )

    class Meta:
        db_table = 'veterinario'

    def __str__(self):
        return f"Dr. {self.id_emp.id_usuario.nombre}"


class VeterinarioCliente(models.Model):
    """
    Tabla intermedia que vincula veterinarios con sus clientes asignados.
    """
    id_vet = models.ForeignKey(
        Veterinario, on_delete=models.CASCADE, db_column='id_vet'
    )
    id_cliente = models.ForeignKey(
        'pacientes.Cliente', on_delete=models.CASCADE, db_column='id_cliente'
    )

    class Meta:
        db_table = 'veterinario_cliente'
        unique_together = ('id_vet', 'id_cliente')

    def __str__(self):
        return f"{self.id_vet} → {self.id_cliente}"