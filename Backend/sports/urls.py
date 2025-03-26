from django.urls import path
from .views import register , login_view , create_product

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', login_view, name='login'),
     path('products/', create_product, name='create_product'),
]
