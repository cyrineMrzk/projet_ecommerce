from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', login_view, name='login'),
    path('products/', create_product, name='create_product'),
    path('debug/', debug, name='debug'),
]
