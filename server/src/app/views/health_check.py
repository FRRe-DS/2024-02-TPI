from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request: Request) -> Response:
    """
    Endpoint para consultar el estado del servidor.
    """
    return Response(status=status.HTTP_204_NO_CONTENT)
