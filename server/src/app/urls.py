from django.urls import path
from .views import *
#from . import views
from rest_framework import routers

router = routers.DefaultRouter()

router.register('api/visitantes', VisitanteViewSet, 'visitantes')
router.register('api/escultores', EscultorViewSet, 'escultores')
router.register('api/esculturas', EsculturaViewSet, 'esculturas')
router.register('api/imagenes', ImagenViewSet, 'imagenes')
router.register('api/pais', PaisViewSet, 'paises')
router.register('api/adminsis', AdminSisViewSet, 'adminsis')
router.register('api/tematica', TematicaViewSet, 'tematicas')
router.register('api/lugar', LugarViewSet, 'lugares')

urlpatterns = router.urls

'''
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
'''