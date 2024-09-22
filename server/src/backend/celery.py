import os
import logging.config
import django
import logging

# import logging
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django.setup()
app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

from django.conf import settings

logging.config.dictConfig(settings.LOGGING)

logger = logging.getLogger("celery")


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    logger.info(f"Request: {self.request!r}")
