"""
Modelos para el módulo de usuarios.
Define los tipos de usuario y los usuarios del sistema.
Los tipos de usuario determinan los permisos y accesos
que tiene cada persona en la plataforma.
"""
import secrets
from datetime import timedelta

from django.db import models
from django.utils import timezone


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
    max_length=128,
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


class Auditoria(models.Model):
    """Bitacora de acciones relevantes realizadas por usuarios o sistema."""
    id_auditoria = models.AutoField(primary_key=True)
    actor = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='id_actor',
        related_name='acciones_auditoria'
    )
    accion = models.CharField(max_length=40)
    modelo = models.CharField(max_length=80, blank=True)
    objeto_id = models.CharField(max_length=80, blank=True)
    descripcion = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auditoria'
        ordering = ['-fecha']

    def __str__(self):
        actor = self.actor.correo if self.actor else 'sistema'
        return f"{actor} - {self.accion} - {self.modelo}"


class Notificacion(models.Model):
    """Aviso interno visible desde la barra de navegacion del frontend."""
    id_notificacion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='notificaciones'
    )
    titulo = models.CharField(max_length=120)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=30, default='info')
    url = models.CharField(max_length=200, blank=True)
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificacion'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.titulo} - {self.usuario.correo}"


class PasswordResetToken(models.Model):
    """Token temporal para recuperar contrasena por correo."""
    id_reset = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario',
        related_name='password_resets'
    )
    token = models.CharField(max_length=120, unique=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    expira_en = models.DateTimeField()
    usado_en = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'password_reset_token'
        ordering = ['-creado_en']

    @classmethod
    def create_for_user(cls, usuario):
        """Crea un token de un solo uso con una hora de vigencia."""
        return cls.objects.create(
            usuario=usuario,
            token=secrets.token_urlsafe(48),
            expira_en=timezone.now() + timedelta(hours=1),
        )

    @property
    def valido(self):
        """Indica si el token sigue vigente y no ha sido usado."""
        return self.usado_en is None and self.expira_en >= timezone.now()

    def marcar_usado(self):
        """Marca el token como consumido para impedir reutilizacion."""
        self.usado_en = timezone.now()
        self.save(update_fields=['usado_en'])
