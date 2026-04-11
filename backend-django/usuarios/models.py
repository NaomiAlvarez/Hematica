"""
Modelos para el módulo de usuarios.
Define los tipos de usuario y los usuarios del sistema.
Los tipos de usuario determinan los permisos y accesos
que tiene cada persona en la plataforma.
"""
from django.db import models


class TipoUsuario(models.Model):
    """
    Define los roles disponibles en el sistema.
    Ejemplos: Cliente (tutor), Veterinario, Recepcionista, Admin.
    Cada usuario tiene exactamente un tipo asignado.
    """
    id_tipo_usuario = models.AutoField(primary_key=True)
    descripcion = models.CharField(
        max_length=40,
        help_text="Nombre del rol. Ejemplo: Cliente, Veterinario, Admin."
    )

    class Meta:
        db_table = 'tipo_usuario'

    def __str__(self):
        return self.descripcion


class Usuario(models.Model):
    """
    Representa a cualquier persona registrada en el sistema.
    Puede ser un tutor (cliente), veterinario, recepcionista o admin.
    El tipo de usuario determina a qué partes del sistema tiene acceso.
    La contraseña siempre se guarda cifrada con bcrypt.
    """
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=80,
        help_text="Nombre completo del usuario."
    )
    correo = models.CharField(
        max_length=70,
        unique=True,
        help_text="Correo electrónico único. Se usa para iniciar sesión."
    )
    password = models.CharField(
        max_length=60,
        help_text="Contraseña cifrada con bcrypt. Nunca se guarda en texto plano."
    )
    num_tel = models.CharField(
        max_length=12,
        help_text="Número de teléfono de contacto."
    )
    id_tipo_usuario = models.ForeignKey(
        TipoUsuario,
        on_delete=models.PROTECT,
        db_column='id_tipo_usuario',
        help_text="Rol del usuario en el sistema."
    )

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return f"{self.nombre} ({self.correo})"