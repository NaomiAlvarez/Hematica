from django.db import models

# Create your models here.
from django.db import models

class TipoUsuario(models.Model):
    id_tipo_usuario = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=40)

    class Meta:
        db_table = 'tipo_usuario'

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=80)
    correo = models.CharField(max_length=70, unique=True)
    password = models.CharField(max_length=60)
    num_tel = models.CharField(max_length=12)
    id_tipo_usuario = models.ForeignKey(TipoUsuario, on_delete=models.PROTECT, db_column='id_tipo_usuario')

    class Meta:
        db_table = 'usuario'