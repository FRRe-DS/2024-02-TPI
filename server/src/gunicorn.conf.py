# https://docs.gunicorn.org/en/stable/settings.html#settings
import logging.config
import os
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django.setup()
logging.config.dictConfig(settings.LOGGING)

bind = "0.0.0.0:8000"
workers = 4
timeout = 30
daemon = False
limit_request_line = 4094
errorlog = "-"
accesslog = "-"

# workers = multiprocessing.cpu_count() * 2 + 1
