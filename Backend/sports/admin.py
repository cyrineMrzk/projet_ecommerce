from django.contrib import admin
from .models import Product, Cart, CartItem, Favorite, Order, OrderItem, Auction, Bid

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'sale_type', 'owner', 'created_at')
    search_fields = ('name', 'brand', 'category')
    list_filter = ('category', 'sale_type', 'sex', 'created_at')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'item_count', 'total_amount', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'color', 'size', 'subtotal', 'added_at')
    search_fields = ('cart__user__username', 'product__name')
    list_filter = ('added_at', 'color', 'size')
    date_hierarchy = 'added_at'
    
    def subtotal(self, obj):
        return f"${obj.subtotal}"
    subtotal.admin_order_field = 'product__price'

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    search_fields = ('user__username', 'user__email', 'product__name')
    list_filter = ('added_at',)
    date_hierarchy = 'added_at'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    search_fields = ('user__username', 'user__email', 'shipping_address')
    list_filter = ('status', 'created_at')
    date_hierarchy = 'created_at'
    readonly_fields = ('total_amount',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'subtotal')
    search_fields = ('order__user__username', 'product__name')
    list_filter = ('color', 'size')
    
    def subtotal(self, obj):
        return f"${obj.subtotal}"
    subtotal.admin_order_field = 'price'

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('product', 'start_price', 'current_price', 'end_date', 'status', 'winner')
    search_fields = ('product__name', 'winner__username')
    list_filter = ('status', 'created_at', 'end_date')
    date_hierarchy = 'created_at'
    readonly_fields = ('current_price',)

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('auction', 'user', 'amount', 'created_at')
    search_fields = ('auction__product__name', 'user__username')
    list_filter = ('created_at',)
    date_hierarchy = 'created_at'

