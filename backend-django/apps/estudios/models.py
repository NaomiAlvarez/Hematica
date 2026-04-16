"""
Modelos para el módulo de estudios.
Define el catálogo de estudios disponibles en el laboratorio.
Se separó en dos modelos distintos:
  - CatalogoEstudio: los tipos de estudio disponibles con su precio.
  - ResultadoEstudio: los resultados de un estudio realizado a un paciente.
    (Este modelo vive en el módulo de solicitudes porque depende de Solicitud)
"""
from django.db import models


class CatalogoEstudio(models.Model):
    """
    Representa un tipo de estudio disponible en el laboratorio.
    Ejemplos: Hemograma completo, Urianálisis, Coproparasitoscópico.
    El precio puede actualizarse sin afectar los estudios ya realizados.
    Los administradores pueden agregar, editar o eliminar estudios del catálogo.
    """
    id_catalogo = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=100,
        help_text="Nombre del estudio. Ejemplo: Hemograma completo."
    )
    precio = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Precio del estudio en pesos mexicanos. Ejemplo: 250.00"
    )

    class Meta:
        db_table = 'catalogo_estudio'

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"