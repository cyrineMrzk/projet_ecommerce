from django.db import models
from django.contrib.auth import get_user_model

class Product(models.Model):
    SALE_TYPES = [
        ('SellNow', 'Sell Now'),
        ('Auction', 'Auction'),
    ]
    
    SEX_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex')
    ]
    CATEGORY_CHOICES = [
        ('Gym Equipment', 'Gym Equipment'),
        ('Cardio & Endurance', 'Cardio & Endurance'),
        ('Supplements', 'Supplements'),
        ('Accessories', 'Accessories')
    ]
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="products")
    brand = models.CharField(max_length=255)
    sex = models.CharField(max_length=20, choices=SEX_CHOICES)
    colors = models.JSONField(default=list)  # Stocke une liste de couleurs
    sizes = models.JSONField(default=list)   # Stocke une liste de tailles
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    sale_type = models.CharField(max_length=10, choices=SALE_TYPES, default='SellNow')
    images = models.ImageField(upload_to='product_images/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
