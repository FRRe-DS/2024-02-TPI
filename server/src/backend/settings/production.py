import dj_database_url
from decouple import config

SECRET_KEY = config("SECRET_KEY", default="")

DEBUG = False

ALLOWED_HOSTS = "localhost,0.0.0.0".split(",")

DATABASES = {"default": config("DATABASE_URL", cast=dj_database_url.parse)}
