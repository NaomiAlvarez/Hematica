"""
Serializers para el módulo de estudios.
Maneja el catálogo de estudios disponibles en el laboratorio
y los resultados de estudios realizados a los pacientes.
"""
from rest_framework import serializers
from .models import CatalogoEstudio


class CatalogoEstudioSerializer(serializers.ModelSerializer):
    """
    Serializer para el catálogo de estudios disponibles.
    Cada estudio tiene un nombre y un precio.
    Ejemplo: Hemograma completo - $250.00
    """
    class Meta:
        model = CatalogoEstudio
        fields = ['id_catalogo', 'nombre', 'precio']