from .views import (
    VisitanteViewSet,
    EscultorViewSet,
    EsculturaViewSet,
    ImagenViewSet,
    AdminSisViewSet,
    TematicaViewSet,
    LugarViewSet,
    health_check,
    PaisViewSet,
)
from rest_framework import routers
from django.urls import include, path

router = routers.DefaultRouter()

"""
 INFO: (Lautaro) Aunque el sufijo `ViewSet` lo indica, no es suficientemente explícito sobre el efecto que tienen las CBVs:
 Una Class Base View (CBV), implementa un `Set` de vistas predeterminadas los diferentes métodos HTTP comúnmente usados en aplicaciones REST.
 Es importante saber que a la hora de escribir tests o probar la aplicación con clientes HTTP, que los nombres dados a las rutas en el método
 `register` de la clase `DefaultRouter`, solamente servirán como base para las vistas generadas por la clase.
 `DefaultRouter` genera automáticamente, por cada vista registrada, dos rutas:
 - <base>-list para métodos GET y POST.
 - <base>-detail para métodos GET, PUT, PATCH y DELETE.
 
 Son con estas rutas a las cuales los tests y clientes HTTP que usemos se tienen que referir.
"""
router.register("api/visitantes", VisitanteViewSet, "visitantes")
router.register("api/escultores", EscultorViewSet, "escultores")
router.register("api/esculturas", EsculturaViewSet, "esculturas")
router.register("api/imagenes", ImagenViewSet, "imagenes")
router.register("api/pais", PaisViewSet, "paises")
router.register("api/adminsis", AdminSisViewSet, "adminsis")
router.register("api/tematica", TematicaViewSet, "tematicas")
router.register("api/lugar", LugarViewSet, "lugares")

urlpatterns = [
    path("", include(router.urls)),
    path("health_check/", health_check, name="health_check"),
]

"""
urlpatterns = [
    router.urls,
    path("", views.getVisitantesData, name="getVisitantesData"),
    path("add/", views.addVisitante, name="addVisitante"),
    path("health_check/", views.health_check, name="health_check"),
    path("getescultor/", views.getEscultor, name="getEscultor"),
    path("getesculturas/", views.getEsculturas, name="getEscultoras"),
    path("geteventos/", views.getEventos, name="getEventos"),
    path("getimagenes/", views.getImg, name="getImg")
]
"""
