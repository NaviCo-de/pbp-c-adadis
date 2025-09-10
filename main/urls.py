from django.urls import path
from main.views import *

app_name = 'main'
urlpatterns = [
    path('', show_main, name='show_main'),
    path('create-product', create_product, name='create_product'),
    path('product/<str:id>', show_product, name='show_product')

]