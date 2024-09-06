from django.urls import path
from . import views

urlpatterns = [
    path("", views.getVisitantesData, name="getVisitantesData"),
    path("add/", views.addVisitante, name="addVisitante"),
    path("health_check", views.health_check, name="health_check"),
]
