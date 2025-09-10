import uuid
from django.db import models

# Create your models here.
class Product(models.Model):
    PILIHAN_KATEGORI = [
        ('sepatu', 'Sepatu'),
        ('bola', 'Bola'),
        ('jersey', 'Jersey'),
        ('slingbag', 'Slingbag')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField()
    stock = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)
    description = models.TextField()
    thumbnail = models.URLField(blank=True, null=True)
    category = models.CharField(choices=PILIHAN_KATEGORI, default='sepatu')
    total_sold = models.PositiveIntegerField(default=0, editable=False)
    is_featured = models.BooleanField(default=False, editable=False)

    def __str__(self):
        return self.name

    @property
    def is_product_featured(self):
        if (self.total_sold > 100):
            self.is_featured = True
        self.is_featured = False
        self.save()
    def bought_stock(self, amount):
        self.total_sold += amount
        self.stock -= amount
        self.save()

    def add_stock(self, amount):
        self.stock += amount
        self.save()