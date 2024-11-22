from decouple import config
from .base import (
    LANGUAGE_CODE,
    LOGGING,
    TEMPLATES,
    TIME_ZONE,
    USE_TZ,
    USE_I18N,
    REST_FRAMEWORK,
    AUTH_PASSWORD_VALIDATORS,
    EMAIL_APP_KEY,
    DEFAULT_FROM_EMAIL,
    DEFAULT_AUTO_FIELD,
    WSGI_APPLICATION,
    ROOT_URLCONF,
    CORS_ALLOWED_ORIGINS,
    MIDDLEWARE,
    INSTALLED_APPS,
)

DJANGO_ENV = config("DJANGO_ENV")

if DJANGO_ENV == "prod":
    from .production import (
        DATABASES,
        DEBUG,
        ALLOWED_HOSTS,
        SECRET_KEY,
        BASE_DIR,
        STORAGES,
        MEDIA_URL,
    )
elif DJANGO_ENV == "testing":
    from .testing import (
        DATABASES,
        DEBUG,
        ALLOWED_HOSTS,
        SECRET_KEY,
        BASE_DIR,
        STORAGES,
        MEDIA_URL,
    )
else:
    from .development import (
        DATABASES,
        DEBUG,
        ALLOWED_HOSTS,
        SECRET_KEY,
        BASE_DIR,
        STORAGES,
        MEDIA_URL,
    )

print(ALLOWED_HOSTS)

__all__ = [
    "LANGUAGE_CODE",
    "LOGGING",
    "TEMPLATES",
    "TIME_ZONE",
    "USE_TZ",
    "USE_I18N",
    "REST_FRAMEWORK",
    "AUTH_PASSWORD_VALIDATORS",
    "EMAIL_APP_KEY",
    "DEFAULT_FROM_EMAIL",
    "INSTALLED_APPS",
    "MIDDLEWARE",
    "DEFAULT_AUTO_FIELD",
    "BASE_DIR",
    "WSGI_APPLICATION",
    "ROOT_URLCONF",
    "CORS_ALLOWED_ORIGINS",
    "SECRET_KEY",
    "DATABASES",
    "DEBUG",
    "ALLOWED_HOSTS",
    "STORAGES",
    "MEDIA_URL",
]
