from .models import Votante
from celery import shared_task


@shared_task
def count_voatantes():
    # time.sleep(20)
    return Votante.objects.count()
