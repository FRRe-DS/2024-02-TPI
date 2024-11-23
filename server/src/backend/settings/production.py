from pathlib import Path
import dj_database_url
import os
import json

from google.oauth2 import service_account
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [
    host.strip() for host in config("WEBSITE_HOSTNAME", default="localhost").split(",")
]

CSRF_TRUSTED_ORIGINS = [
    host.strip() for host in config("WEBSITE_HOSTNAME", default="localhost").split(",")
]
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True


DATABASES = {"default": config("DATABASE_URL", cast=dj_database_url.parse)}

GS_CREDENTIALS = service_account.Credentials.from_service_account_info(
    config("STORAGE_KEY", default="", cast=json.loads)
)

GS_BUCKET_NAME = "bienaldelchaco"

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
# Configuración del almacenamiento
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": "bienaldelchaco",
            "credentials": GS_CREDENTIALS,  # Asegúrate de haber definido GS_CREDENTIALS antes
        },
    },
    "staticfiles": {  # Archivos estáticos (local)
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS": {
            "location": STATIC_ROOT,  # Directorio local para archivos estáticos
        },
    },
}

# URL base para servir archivos multimedia y estáticos
MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/"
