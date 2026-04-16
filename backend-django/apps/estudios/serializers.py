"""
Serializers para el módulo de estudios.
Convierte el catálogo de estudios disponibles a formato JSON
para que el frontend pueda mostrarlos al tutor al momento
de crear una solicitud de estudio.
"""
from rest_framework import serializers
from .models import CatalogoEstudio


class CatalogoEstudioSerializer(serializers.ModelSerializer):
    """
    Serializer para el catálogo de estudios disponibles.
    Convierte cada estudio a JSON con su id, nombre y precio.
    El frontend usa este serializer para mostrar la lista
    de estudios disponibles al tutor cuando crea una solicitud.
    Ejemplo de respuesta:
    {
        "id_catalogo": 1,
        "nombre": "Hemograma completo",
        "precio": "250.00"
    }
    """
    class Meta:
        model = CatalogoEstudio
        fields = ['id_catalogo', 'nombre', 'precio']