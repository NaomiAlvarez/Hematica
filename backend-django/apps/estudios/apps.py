"""Registro de la app Django encargada del catalogo de estudios."""
from django.apps import AppConfig


class EstudiosConfig(AppConfig):
    """Configuracion usada por Django al cargar la app estudios."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.estudios'
