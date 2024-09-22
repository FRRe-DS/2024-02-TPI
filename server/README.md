
## Server
### UV
Para ejecutar el trabajo necesitan tener instalado [uv](https://docs.astral.sh/uv/), un manager de paquetes y de proyectos para Python. 
``` sh
uv run ./src/manage.py migrate
DJANGO_ENV=dev uv run ./src/manage.py runserver

# Ahora en otra terminal pueden ejecutar curl para ver si la aplicación está funcionando.
curl -v http://127.0.0.1:8000/health_check/

```
La intención con esto es ahorrarse la mayor cantidad de tiempo con respecto a problemas de versionado con pip y python, además de aprovechar el resto de funciones que ofrece el comando, las cuales les invito que [lean](https://docs.astral.sh/uv/getting-started/).

Si quieren ver ejemplos de su uso, pueden ver la [documentación](https://docs.astral.sh/uv/getting-started/) de la herramienta, el archivo `./.github/workflows/general.yaml` en workflows o los comandos en `./src/Justfile`.

Les recomiendo instalarse [Just](https://github.com/casey/just) para poder crear comandos y ahorrarse tipeo.

> [!IMPORTANT]
> `just serve` utilizar `docker compose` para iniciar el servicio, asi que es necesario que tengas instalado docker.

``` sh
# En ./src/Justfile o en cualquier subdirectorio siguiente:
just test
just serve dev # Inicializa el servidor http con Django, configurado para desarrollo.
just serve prod # Inicializa un servidor http con Gunicorn, configurado para producción.
```
