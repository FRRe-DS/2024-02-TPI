from django.http import HttpResponse, HttpRequest

# Create your views here.


def index(request: HttpRequest) -> HttpResponse:
    return HttpResponse("Indice")


def saludo(request: HttpRequest) -> HttpResponse:
    return HttpResponse("Hola! Aca vamos a hacer el tp!")


def health_check(request: HttpRequest) -> HttpResponse:
    return HttpResponse(status=204)
