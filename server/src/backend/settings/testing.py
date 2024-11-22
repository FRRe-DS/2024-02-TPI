from pathlib import Path
import os
from google.oauth2 import service_account
import json
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_URL = "/static/"

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

SECRET_KEY = "django-insecure-j+&k(*o_vgi3d01+n^#r14+dagby)7-&-iq!@_2$2t(hd6hw7)"

DEBUG = True

BASE_DIR = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = "localhost,127.0.0.1".split(",")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
    }
}

GS_CREDENTIALS = service_account.Credentials.from_service_account_info(
    config("STORAGE_KEY", default="", cast=json.loads)
)

GS_BUCKET_NAME = "bienaldelchaco"

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

MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/"
