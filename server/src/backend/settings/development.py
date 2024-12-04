import os
import json
from pathlib import Path
from google.oauth2 import service_account
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "django-insecure-j+&k(*o_vgi3d01+n^#r14+dagby)7-&-iq!@_2$2t(hd6hw7)"
DEBUG = True
ALLOWED_HOSTS = "localhost,127.0.0.1".split(",")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "tpi",
        "USER": "postgres",
        "PASSWORD": "password",
        "HOST": "localhost",
        "PORT": "5432",
        "OPTIONS": {
            "pool": True,
        },
    },
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

try:
    acc_info = json.loads(config("STORAGE_KEY"))
    GS_CREDENTIALS = service_account.Credentials.from_service_account_info(acc_info)
except json.JSONDecodeError as e:
    raise ValueError(f"STORAGE_KEY no es un JSON válido: {e}")
except KeyError:
    raise ValueError("STORAGE_KEY no está definido en las variables de entorno")

GS_BUCKET_NAME = "bienaldelchaco"

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
# Configuración del almacenamiento
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": GS_BUCKET_NAME,
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
