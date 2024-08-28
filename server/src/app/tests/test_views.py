from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from app.models import UserCustom
from app.serializers import UserSerializer


class SimpleTestVistas(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 204)

class UserCustomViewsTestCase(APITestCase):
    def setUp(self):
        self.user = UserCustom.objects.create(username='testuser')
        self.get_url = reverse('getUserData')
        self.post_url = reverse('addUser')

    def test_get_user_data_200_OK(self):
        response = self.client.get(self.get_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_data = UserSerializer(UserCustom.objects.all(), many=True).data
        self.assertEqual(expected_data, response.data)

    def test_add_user_201_CREATED(self):
        data = {
            'username':'nuevo',
        }

        response = self.client.post(self.post_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'nuevo')
        self.assertTrue(UserCustom.objects.filter(username='nuevo').exists())

    def test_add_user_empty_string_400_BAD_REQUEST(self):
        data = {
            'username': '',
        }

        response = self.client.post(self.post_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
