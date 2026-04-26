"""
Modelos para el módulo de pacientes.
Define las especies, razas, clientes (tutores) y pacientes (mascotas).
Un cliente puede tener múltiples mascotas registradas en el sistema.
"""
from django.db import models
from apps.usuarios.models import Usuario


class Especie(models.Model):
    id_especie = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=25)

    class Meta:
        db_table = 'especie'

    def __str__(self):
        return self.nombre


class Raza(models.Model):
    id_raza = models.AutoField(primary_key=True)
    id_especie = models.ForeignKey(Especie, on_delete=models.PROTECT, db_column='id_especie')
    nombre = models.CharField(max_length=30)

    class Meta:
        db_table = 'raza'

    def __str__(self):
        return f"{self.nombre} ({self.id_especie.nombre})"


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT, db_column='id_usuario')
    genero = models.CharField(max_length=1)

    class Meta:
        db_table = 'cliente'

    def __str__(self):
        return self.id_usuario.nombre


class Paciente(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, db_column='id_cliente')
    id_raza = models.ForeignKey(Raza, on_delete=models.PROTECT, db_column='id_raza')
    nombre = models.CharField(max_length=20)
    sexo = models.CharField(max_length=1)
    edad = models.IntegerField()
    peso = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        help_text="Peso de la mascota en kg."
    )
    anamnesis = models.TextField(       
        blank=True, null=True,
        help_text="Historia clínica y síntomas previos del paciente."
    )
    cartilla_pdf = models.FileField(
        upload_to='cartillas/',
        blank=True, null=True,
        help_text="Cartilla de vacunación en PDF."
    )

    class Meta:
        db_table = 'paciente'

    def __str__(self):
        return f"{self.nombre} - {self.id_cliente.id_usuario.nombre}"