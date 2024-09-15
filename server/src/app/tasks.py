from .models import Visitante
from celery import shared_task


@shared_task
def count_visitantes():
    # time.sleep(20)
    return Visitante.objects.count()
