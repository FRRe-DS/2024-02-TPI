from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("saludo", views.saludo, name="saludo"),
    path("health_check", views.health_check, name="health_check"),
]
