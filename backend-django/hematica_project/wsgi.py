"""Entrada WSGI del backend Hematica.

Sirve para despliegues tradicionales de Django en servidores compatibles con
WSGI, como Gunicorn o uWSGI.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hematica_project.settings')

# Objeto que importa el servidor WSGI para atender requests.
application = get_wsgi_application()
