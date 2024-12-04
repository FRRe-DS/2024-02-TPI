from pathlib import Path
import dj_database_url
import json

from google.oauth2 import service_account
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = False

try:
    SECRET_KEY = config("SECRET_KEY")
except KeyError as e:
    raise ValueError(f"SECRET_KEY no esta definida en las variables de entorno: {e}")

try:
    hostname = config("WEBSITE_HOSTNAME", default="localhost")
    hosts = [host.strip() for host in hostname.split(",") if host.strip()]
    ALLOWED_HOSTS = hosts + ["localhost", "0.0.0.0"]
    CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in hosts]
except KeyError as e:
    raise ValueError(
        f"WEBSITE_HOSTNAME is not defined in the environment variables: {e}"
    )

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True


DATABASES = {"default": config("DATABASE_URL", cast=dj_database_url.parse)}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
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
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": "bienaldelchaco",
            "credentials": GS_CREDENTIALS,
        },
    },
    "staticfiles": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS": {
            "location": STATIC_ROOT,  # Directorio local para archivos estáticos
        },
    },
}

MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/"
