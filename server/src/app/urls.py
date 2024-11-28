from rest_framework import routers
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from app.views.sets import (
    VotanteViewSet,
    LugarViewSet,
    EventoViewSet,
    EscultorViewSet,
    EsculturaViewSet,
    ImagenViewSet,
    PaisViewSet,
    AdminSisViewSet,
    TematicaViewSet,
    EscultorEventoViewSet,
    background_task_ejemplo,
    check_django_task_status,
    get_token,
)
from app.views.health_check import health_check
from app.views.votacion import estado_votacion, generarQR, VotoEscultorViewSet

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
router.register("api/escultor_evento", EscultorEventoViewSet, "escultor_evento")

urlpatterns = [
    path("", include(router.urls)),
    path("api/health_check/", health_check, name="health_check"),
    path("api/generar_qr/", generarQR.as_view(), name="generar_qr"),
    path("api/get_token/", get_token, name="token"),
    path("api/estado_votacion/", estado_votacion, name="estado_votacion"),
    path(
        "api/test_background/", background_task_ejemplo, name="background_task_ejemplo"
    ),
    path(
        "api/tasks_status/",
        check_django_task_status,
        name="check_task_status",
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path("admin/doc/", include("django.contrib.admindocs.urls")),
]
