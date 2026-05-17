"""Registro de la app Django encargada de solicitudes y resultados."""
from django.apps import AppConfig


class SolicitudesConfig(AppConfig):
    """Configuracion usada por Django al cargar la app solicitudes."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.solicitudes'
