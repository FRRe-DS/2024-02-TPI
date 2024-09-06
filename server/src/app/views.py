from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from app.models import Visitante
from app.serializers import VisitanteSerializer
from rest_framework import status


@api_view(["GET"])
def health_check(request: Request) -> Response:
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def getVisitantesData(request: Request) -> Response:
    users = Visitante.objects.all()
    serializer = VisitanteSerializer(users, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)


@api_view(["POST"])
def addVisitante(request: Request) -> Response:
    serializer = VisitanteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, data=serializer.data)

    return Response(status=status.HTTP_400_BAD_REQUEST, data=serializer.data)
