# https://docs.gunicorn.org/en/stable/settings.html#settings
import logging.config
import os
import django
from django.conf import settings
import multiprocessing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django.setup()
logging.config.dictConfig(settings.LOGGING)

workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 100

accesslog = "-"
errorlog = "-"
loglevel = "info"

preload_app = True
pythonpath = "."
