from django.db import models

# Create your models here.
from django.db import models
from usuarios.models import Usuario

class TipoEmpleado(models.Model):
    id_tipo_emp = models.AutoField(primary_key=True)
    puesto = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=100)

    class Meta:
        db_table = 'tipo_empleado'

class Empleado(models.Model):
    id_emp = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT, db_column='id_usuario')
    id_tipo_emp = models.ForeignKey(TipoEmpleado, on_delete=models.PROTECT, db_column='id_tipo_emp')
    nombre_clinica = models.CharField(max_length=100)
    telefono = models.CharField(max_length=12)
    direccion = models.CharField(max_length=60)

    class Meta:
        db_table = 'empleado'

class Veterinario(models.Model):
    id_vet = models.AutoField(primary_key=True)
    id_emp = models.OneToOneField(Empleado, on_delete=models.PROTECT, db_column='id_emp')
    curp = models.CharField(max_length=18)
    cedula = models.CharField(max_length=10)

    class Meta:
        db_table = 'veterinario'