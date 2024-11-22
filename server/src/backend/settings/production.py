import dj_database_url
from decouple import config

SECRET_KEY = config("SECRET_KEY")

DEBUG = False

ALLOWED_HOSTS = [host.strip() for host in config("WEBSITE_HOSTNAME", default="localhost").split(",")]


DATABASES = {"default": config("DATABASE_URL", cast=dj_database_url.parse)}
