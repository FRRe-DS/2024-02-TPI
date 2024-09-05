from django.urls import path
from . import views

urlpatterns = [
    path("", views.getUserData, name="getUserData"),
    path("add/", views.addUser, name="addUser"),
    path("health_check", views.health_check, name="health_check"),
]
