from django.db import models

# Create your models here.
class Product(models.Model):
    PILIHAN_KATEGORI = [
        'Anak-anak',
        'Dewasa'
    ]

    name = models.CharField()
    price = models.IntegerField()
    description = models.TextField()
    thumbnail = models.URLField()
    category = models.CharField()
    is_featured = models.BooleanField()