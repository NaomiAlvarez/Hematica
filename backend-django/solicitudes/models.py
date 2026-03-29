from django.db import models

# Create your models here.
from django.db import models
from pacientes.models import Paciente
from estudios.models import CatalogoEstudio
from empleados.models import Veterinario

class Solicitud(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('muestra_recibida', 'Muestra recibida'),
        ('en_proceso', 'En proceso'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]
    id_solicitud = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, db_column='id_paciente')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    notas_cliente = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'solicitud'

class SolicitudEstudio(models.Model):
    id_solicitud = models.ForeignKey(Solicitud, on_delete=models.PROTECT, db_column='id_solicitud')
    id_catalogo = models.ForeignKey(CatalogoEstudio, on_delete=models.PROTECT, db_column='id_catalogo')

    class Meta:
        db_table = 'solicitud_estudio'

class ResultadoEstudio(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    id_solicitud = models.OneToOneField(Solicitud, on_delete=models.PROTECT, db_column='id_solicitud')
    id_vet = models.ForeignKey(Veterinario, on_delete=models.PROTECT, db_column='id_vet')
    fecha_muestra = models.DateTimeField()
    observaciones = models.CharField(max_length=150, blank=True, null=True)
    reporte_clinico = models.TextField()

    class Meta:
        db_table = 'resultado_estudio'

class HistorialClinico(models.Model):
    id_exp = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, db_column='id_paciente')
    fecha_registro = models.DateField(auto_now_add=True)
    diagnostico = models.CharField(max_length=400)
    tratamiento = models.CharField(max_length=100, blank=True, null=True)
    notas = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'historial_clinico'