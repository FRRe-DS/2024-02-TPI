from .views import (
    EventoViewSet,
    VotanteViewSet,
    EscultorViewSet,
    EsculturaViewSet,
    ImagenViewSet,
    TematicaViewSet,
    PaisViewSet,
    VotoEscultorViewSet,
    AdminSisViewSet,
    LugarViewSet,
)
from rest_framework import routers
from django.urls import include, path
from app import views

router = routers.DefaultRouter()

"""
 INFO: (Lautaro) Aunque el sufijo `ViewSet` lo indica, no es suficientemente explícito sobre el efecto que tienen las CBVs:
 Una Class Base View (CBV), implementa un `Set` de vistas predeterminadas los diferentes métodos HTTP comúnmente usados en aplicaciones REST.
 Es importante saber que a la hora de escribir tests, que los nombres dados a las rutas en el método
 `register` de la clase `DefaultRouter`, solamente servirán como base para las vistas generadas por la clase.
 `DefaultRouter` genera automáticamente, por cada vista registrada, dos rutas:

 - <base>-list para métodos GET y POST.
 - <base>-detail para métodos GET, PUT, PATCH y DELETE.
 
 Son con estas rutas a las cuales los tests que realicemos se tienen que referir.
"""

router.register("api/votantes", VotanteViewSet, "votantes")
router.register("api/escultores", EscultorViewSet, "escultores")
router.register("api/esculturas", EsculturaViewSet, "esculturas")
router.register("api/eventos", EventoViewSet, "eventos")
router.register("api/imagenes", ImagenViewSet, "imagenes")
router.register("api/paises", PaisViewSet, "paises")
router.register("api/adminsis", AdminSisViewSet, "adminsis")
router.register("api/tematica", TematicaViewSet, "tematicas")
router.register("api/lugar", LugarViewSet, "lugares")
router.register("api/voto_escultor", VotoEscultorViewSet, "voto_escultor")

urlpatterns = [
    path("", include(router.urls)),
    path("generar_qr/", views.generar_qr, name="generar_qr"),
    path("health_check/", views.health_check, name="health_check"),
    path("test_celery/", views.celery_task_ejemplo, name="celery_task_ejemplo"),
    path(
        "check_id_celery/<str:task_id>/",
        views.check_task_status,
        name="check_task_status",
    ),
    path("admin/doc/", include("django.contrib.admindocs.urls")),
]
