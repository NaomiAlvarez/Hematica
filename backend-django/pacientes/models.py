from django.db import models

# Create your models here.
from django.db import models
from usuarios.models import Usuario

class Especie(models.Model):
    id_especie = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=25)

    class Meta:
        db_table = 'especie'

class Raza(models.Model):
    id_raza = models.AutoField(primary_key=True)
    id_especie = models.ForeignKey(Especie, on_delete=models.PROTECT, db_column='id_especie')
    nombre = models.CharField(max_length=30)

    class Meta:
        db_table = 'raza'

class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT, db_column='id_usuario')
    genero = models.CharField(max_length=1)

    class Meta:
        db_table = 'cliente'

class Paciente(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, db_column='id_cliente')
    id_raza = models.ForeignKey(Raza, on_delete=models.PROTECT, db_column='id_raza')
    nombre = models.CharField(max_length=20)
    sexo = models.CharField(max_length=1)
    edad = models.IntegerField()

    class Meta:
        db_table = 'paciente'