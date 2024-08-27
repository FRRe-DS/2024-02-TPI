from django.test import SimpleTestCase
from django.urls import reverse


class SimpleTestVistas(SimpleTestCase):
    def test_vista_status_code(self):
        response = self.client.get(reverse("saludo"))
        self.assertEqual(response.status_code, 200)

    def test_health_check(self):
        response = self.client.get(reverse("health_check"))
        self.assertEqual(response.status_code, 200)
