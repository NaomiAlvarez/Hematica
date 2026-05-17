"""Registro de la app Django encargada de usuarios, auth y auditoria."""
from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    """Configuracion usada por Django al cargar la app usuarios."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.usuarios'
