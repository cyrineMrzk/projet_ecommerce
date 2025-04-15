from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', login_view, name='login'),
    path('products/', create_product, name='create_product'),
    path('debug/', debug, name='debug'),
    path('products/my/', get_my_products, name='get_my_products'),
]
