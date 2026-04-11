"""
Modelos para el módulo de solicitudes.
Define el flujo completo de atención de una muestra en el laboratorio:
  1. Solicitud     -> el tutor solicita un estudio desde casa
  2. SolicitudEstudio -> estudios específicos incluidos en la solicitud
  3. ResultadoEstudio -> el veterinario registra los resultados
  4. HistorialClinico -> expediente médico acumulado del paciente
"""
from django.db import models
from pacientes.models import Paciente
from estudios.models import CatalogoEstudio
from empleados.models import Veterinario


class Solicitud(models.Model):
    """
    Representa una solicitud de estudio hecha por un tutor.
    Tiene un flujo de estados definido:
      pendiente -> muestra_recibida -> en_proceso -> finalizado
    También puede cancelarse en cualquier momento antes de finalizarse.
    Cada solicitud genera un folio único para rastrearla.
    """
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
        help_text="Fecha y hora en que el tutor creó la solicitud. Se genera automáticamente."
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente',
        help_text="Estado actual de la solicitud en el flujo de atención."
    )
    notas_cliente = models.TextField(
        blank=True,
        null=True,
        help_text="Observaciones del tutor sobre la mascota. Ejemplo: No ha comido desde ayer."
    )

    class Meta:
        db_table = 'solicitud'

    def __str__(self):
        return f"SOL-{str(self.id_solicitud).zfill(3)} - {self.id_paciente.nombre} ({self.estado})"


class SolicitudEstudio(models.Model):
    """
    Tabla intermedia que relaciona una Solicitud con los estudios solicitados.
    Una solicitud puede incluir múltiples estudios al mismo tiempo.
    Ejemplo: Hemograma + Urianálisis en la misma solicitud.
    """
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
        help_text="Tipo de estudio solicitado del catálogo."
    )

    class Meta:
        db_table = 'solicitud_estudio'

    def __str__(self):
        return f"{self.id_solicitud} - {self.id_catalogo.nombre}"


class ResultadoEstudio(models.Model):
    """
    Registra los resultados de una solicitud procesada por el veterinario.
    Solo existe cuando la solicitud está en estado 'finalizado'.
    Al crear un resultado, el sistema envía automáticamente
    un correo al tutor con los resultados (lo implementa Naomi).
    Cada solicitud tiene exactamente un resultado (OneToOne).
    """
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
        help_text="Veterinario que procesó la muestra y registró los resultados."
    )
    fecha_muestra = models.DateTimeField(
        help_text="Fecha y hora en que se tomó la muestra."
    )
    observaciones = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Observaciones generales del veterinario sobre la muestra."
    )
    reporte_clinico = models.TextField(
        help_text="Reporte clínico completo con todos los valores obtenidos del análisis."
    )

    class Meta:
        db_table = 'resultado_estudio'

    def __str__(self):
        return f"Resultado de {self.id_solicitud}"


class HistorialClinico(models.Model):
    """
    Expediente médico acumulado de un paciente a lo largo del tiempo.
    Se crea o actualiza cada vez que se finaliza un estudio.
    Permite al veterinario ver el historial completo de una mascota
    y hacer seguimiento de su salud a lo largo del tiempo.
    """
    id_exp = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        db_column='id_paciente',
        help_text="Mascota a la que pertenece este expediente."
    )
    fecha_registro = models.DateField(
        auto_now_add=True,
        help_text="Fecha en que se registró este expediente. Se genera automáticamente."
    )
    diagnostico = models.CharField(
        max_length=400,
        help_text="Diagnóstico del veterinario basado en los resultados."
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
        help_text="Notas adicionales del veterinario. Ejemplo: Revisión en 30 días."
    )

    class Meta:
        db_table = 'historial_clinico'

    def __str__(self):
        return f"Expediente {self.id_exp} - {self.id_paciente.nombre}"