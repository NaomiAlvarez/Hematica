"""Registro de la app Django encargada de empleados y veterinarios."""
from django.apps import AppConfig


class EmpleadosConfig(AppConfig):
    """Configuracion usada por Django al cargar la app empleados."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.empleados'
