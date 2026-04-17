"""
Modelos para el módulo de pacientes.
Define las especies, razas, clientes (tutores) y pacientes (mascotas).
Un cliente puede tener múltiples mascotas registradas en el sistema.
"""
from django.db import models
from apps.usuarios.models import Usuario


class Especie(models.Model):
    """
    Representa el tipo de animal.
    Ejemplos: Canino, Felino, Ave, Reptil.
    Una especie puede tener múltiples razas asociadas.
    """
    id_especie = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=25,
        help_text="Nombre de la especie. Ejemplo: Canino, Felino."
    )

    class Meta:
        db_table = 'especie'

    def __str__(self):
        return self.nombre


class Raza(models.Model):
    """
    Representa la raza de un animal dentro de una especie.
    Ejemplo: Labrador y Golden Retriever son razas de Canino.
    Cada raza pertenece a exactamente una especie.
    """
    id_raza = models.AutoField(primary_key=True)
    id_especie = models.ForeignKey(
        Especie,
        on_delete=models.PROTECT,
        db_column='id_especie',
        help_text="Especie a la que pertenece esta raza."
    )
    nombre = models.CharField(
        max_length=30,
        help_text="Nombre de la raza. Ejemplo: Labrador, Siamés."
    )

    class Meta:
        db_table = 'raza'

    def __str__(self):
        return f"{self.nombre} ({self.id_especie.nombre})"


class Cliente(models.Model):
    """
    Representa al tutor o dueño de una mascota.
    Está ligado a un Usuario del sistema con rol de Cliente.
    Un cliente puede tener múltiples mascotas registradas.
    """
    id_cliente = models.AutoField(primary_key=True)
    id_usuario = models.OneToOneField(
        Usuario,
        on_delete=models.PROTECT,
        db_column='id_usuario',
        help_text="Usuario del sistema asociado a este cliente."
    )
    genero = models.CharField(
        max_length=1,
        help_text="Género del cliente. M = Masculino, F = Femenino."
    )

    class Meta:
        db_table = 'cliente'

    def __str__(self):
        return self.id_usuario.nombre


class Paciente(models.Model):
    """
    Representa a la mascota que recibe los servicios del laboratorio.
    Cada paciente pertenece a un cliente (tutor) y tiene una raza asignada.
    A través de la raza se puede obtener la especie del paciente.
    """
    id_paciente = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        db_column='id_cliente',
        help_text="Tutor o dueño de esta mascota."
    )
    id_raza = models.ForeignKey(
        Raza,
        on_delete=models.PROTECT,
        db_column='id_raza',
        help_text="Raza de la mascota. A través de la raza se obtiene la especie."
    )
    nombre = models.CharField(
        max_length=20,
        help_text="Nombre de la mascota. Ejemplo: Firulais, Luna."
    )
    sexo = models.CharField(
        max_length=1,
        help_text="Sexo de la mascota. M = Macho, H = Hembra."
    )
    edad = models.IntegerField(
        help_text="Edad de la mascota en años."
    )

    class Meta:
        db_table = 'paciente'

    def __str__(self):
        return f"{self.nombre} - {self.id_cliente.id_usuario.nombre}"