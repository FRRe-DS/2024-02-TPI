from pathlib import Path


SECRET_KEY = "django-insecure-j+&k(*o_vgi3d01+n^#r14+dagby)7-&-iq!@_2$2t(hd6hw7)"

DEBUG = True

BASE_DIR = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = "localhost,127.0.0.1".split(",")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
    }
}
