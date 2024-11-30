from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema


@extend_schema(
    summary="Health Check Endpoint",
    description="Consulta el estado del servidor y devuelve 204 si está funcionando.",
    responses={204: None},
)
@api_view(["GET"])
def health_check(request: Request) -> Response:
    """
    Consulta el estado del servidor y devuelve 204 si está funcionando.
    """
    return Response(status=status.HTTP_204_NO_CONTENT)
