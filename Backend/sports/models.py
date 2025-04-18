from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models

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
    colors = models.JSONField(default=list)
    sizes = models.JSONField(default=list)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    sale_type = models.CharField(max_length=10, choices=SALE_TYPES, default='SellNow')
    images = models.ImageField(upload_to='product_images/')
    stock_quantity = models.PositiveIntegerField(default=1)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sales_count = models.PositiveIntegerField(default=0)  # Added field to track sales count
    
    def __str__(self):
        return self.name
    
    @property
    def is_in_stock(self):
        return self.stock_quantity > 0
    
    @classmethod
    def get_best_sellers(cls):
        # Get the top 4 best sellers based on sales count
        return cls.objects.order_by('-sales_count')[:]

class Cart(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
    @property
    def total_amount(self):
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def item_count(self):
        return self.items.count()

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=20)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'product', 'color', 'size')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart}"
    
    @property
    def subtotal(self):
        return self.product.price * self.quantity

class Favorite(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"{self.product.name} favorited by {self.user.username}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="orders")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.id} by {self.user.username} ({self.status})"
    
    def calculate_total(self):
        """Recalculate total amount based on order items"""
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save()

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of purchase
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=20)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"
    
    @property
    def subtotal(self):
        return self.price * self.quantity

class Auction(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="auction")
    start_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    winner = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name="won_auctions")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Auction for {self.product.name} (Current: {self.current_price})"
    
    @property
    def is_active(self):
        from django.utils import timezone
        return self.status == 'active' and self.end_date > timezone.now()
    
    @property
    def time_remaining(self):
        from django.utils import timezone
        if self.is_active:
            return self.end_date - timezone.now()
        return None

class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-amount']  # Highest bid first
    
    def __str__(self):
        return f"Bid of {self.amount} by {self.user.username} on {self.auction.product.name}"

@receiver(post_save, sender=get_user_model())
def create_user_cart(sender, instance, created, **kwargs):
    """Create a cart for new users automatically"""
    if created:
        Cart.objects.create(user=instance)


#http://127.0.0.1:8000/api/debug/