"""
Modelos para el modulo de solicitudes.
Define el flujo completo de atencion de una muestra en el laboratorio:
  1. Solicitud     -> el tutor solicita un estudio desde casa
  2. SolicitudEstudio -> estudios especificos incluidos en la solicitud
  3. ResultadoEstudio -> el veterinario registra los resultados
  4. HistorialClinico -> expediente medico acumulado del paciente
"""
from django.db import models
from apps.pacientes.models import Paciente
from apps.estudios.models import CatalogoEstudio
from apps.empleados.models import Veterinario


class Solicitud(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('muestra_recibida', 'Muestra recibida'),
        ('en_proceso', 'En proceso'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]

    id_solicitud = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        db_column='id_paciente',
        help_text="Mascota para la que se solicita el estudio."
    )
    fecha_solicitud = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora en que el tutor creo la solicitud."
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente',
        help_text="Estado actual de la solicitud en el flujo de atencion."
    )
    notas_cliente = models.TextField(
        blank=True,
        null=True,
        help_text="Observaciones del tutor sobre la mascota."
    )

    class Meta:
        db_table = 'solicitud'

    def __str__(self):
        return f"SOL-{str(self.id_solicitud).zfill(3)} - {self.id_paciente.nombre} ({self.estado})"


class SolicitudEstudio(models.Model):
    id_solicitud = models.ForeignKey(
        Solicitud,
        on_delete=models.PROTECT,
        db_column='id_solicitud',
        help_text="Solicitud a la que pertenece este estudio."
    )
    id_catalogo = models.ForeignKey(
        CatalogoEstudio,
        on_delete=models.PROTECT,
        db_column='id_catalogo',
        help_text="Tipo de estudio solicitado del catalogo."
    )

    class Meta:
        db_table = 'solicitud_estudio'

    def __str__(self):
        return f"{self.id_solicitud} - {self.id_catalogo.nombre}"


class ResultadoEstudio(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    id_solicitud = models.OneToOneField(
        Solicitud,
        on_delete=models.PROTECT,
        db_column='id_solicitud',
        help_text="Solicitud a la que corresponden estos resultados."
    )
    id_vet = models.ForeignKey(
        Veterinario,
        on_delete=models.PROTECT,
        db_column='id_vet',
        help_text="Veterinario que proceso la muestra."
    )
    fecha_muestra = models.DateTimeField(
        help_text="Fecha y hora en que se tomo la muestra."
    )
    observaciones = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Observaciones generales del veterinario."
    )
    reporte_clinico = models.TextField(
        help_text="Reporte clinico completo con todos los valores obtenidos."
    )
    archivo_pdf = models.FileField(
        upload_to='resultados/',
        blank=True,
        null=True,
        help_text="Archivo PDF con los resultados del estudio."
    )

    class Meta:
        db_table = 'resultado_estudio'

    def __str__(self):
        return f"Resultado de {self.id_solicitud}"


class HistorialClinico(models.Model):
    id_exp = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        db_column='id_paciente',
        help_text="Mascota a la que pertenece este expediente."
    )
    fecha_registro = models.DateField(
        auto_now_add=True,
        help_text="Fecha en que se registro este expediente."
    )
    diagnostico = models.CharField(
        max_length=400,
        help_text="Diagnostico del veterinario basado en los resultados."
    )
    tratamiento = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Tratamiento recomendado por el veterinario."
    )
    notas = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Notas adicionales del veterinario."
    )

    class Meta:
        db_table = 'historial_clinico'

    def __str__(self):
        return f"Expediente {self.id_exp} - {self.id_paciente.nombre}"