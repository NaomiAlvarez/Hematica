"""Registro de la app Django encargada de clientes y pacientes."""
from django.apps import AppConfig


class PacientesConfig(AppConfig):
    """Configuracion usada por Django al cargar la app pacientes."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.pacientes'
