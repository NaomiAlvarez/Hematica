from django.db import models

# Create your models here.
from django.db import models

class CatalogoEstudio(models.Model):
    id_catalogo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        db_table = 'catalogo_estudio'