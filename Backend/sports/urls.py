from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', login_view, name='login'),
    path('products/', create_product, name='create_product'),
    path('debug/', debug, name='debug'),
    path('products/my/', get_my_products, name='get_my_products'),
    path('best-sellers/', best_sellers, name='best_sellers'),
    #path('orders/<int:order_id>/debug/', debug_invoice, name='debug_invoice'),
    path ('fetch', fetch_products_by_filtering, name='fetch_products_by_filtering'), 
      # Cart
    path('cart/', get_cart, name='get_cart'),
    path('cart/add/', add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_id>/', update_cart_item, name='update_cart_item'),
    path('cart/remove/<int:item_id>/', remove_from_cart, name='remove_from_cart'),
    path('cart/clear/', remove_from_cart, name='clear_cart'),
    
    # Favorites
    path('favorites/', get_favorites, name='get_favorites'),
    path('favorites/add/', add_to_favorites, name='add_to_favorites'),
    path('favorites/remove/<int:product_id>/', remove_from_favorites, name='remove_from_favorites'),
    
    # Orders
    path('checkout/', checkout, name='checkout'),
    path('orders/', get_orders, name='get_orders'),
    path('orders/create/', create_order, name='create_order'),
    path('orders/<int:order_id>/', get_order_details, name='get_order_details'),
    path('orders/<int:order_id>/invoice/', generate_invoice_pdf, name='generate_invoice_pdf'),

    # Auctions
    path('auctions/create/', create_auction, name='create_auction'),
]
