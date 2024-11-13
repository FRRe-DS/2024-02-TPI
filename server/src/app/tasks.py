from background_task.tasks import logging
from .models import Votante
from background_task import background


@background
def count_votantes():
    result = Votante.objects.count()
    logging.info(f"La cantidad de votantes es {result}")

    return result
