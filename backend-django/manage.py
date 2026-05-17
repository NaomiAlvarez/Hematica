#!/usr/bin/env python
"""CLI de Django para tareas administrativas del backend Hematica.

Se usa para migraciones, pruebas, creacion de superusuario y cualquier comando
de `manage.py` ejecutado dentro o fuera de Docker.
"""
import os
import sys


def main():
    """Configura el settings module y delega el comando a Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hematica_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
