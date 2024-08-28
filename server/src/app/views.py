from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from app.models import UserCustom
from app.serializers import UserSerializer
from rest_framework import status

# Create your views here.


@api_view(["GET"])
def health_check(request: Request) -> Response:
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def getUserData(request: Request) -> Response:
    users = UserCustom.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(status=status.HTTP_200_OK, data=serializer.data)


@api_view(["POST"])
def addUser(request: Request) -> Response:
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_201_CREATED, data=serializer.data)

    return Response(status=status.HTTP_400_BAD_REQUEST, data=serializer.data)
