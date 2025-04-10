from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'sale_type', 'owner', 'created_at')
    search_fields = ('name', 'brand', 'category')
    list_filter = ('category', 'sale_type', 'sex', 'created_at')

