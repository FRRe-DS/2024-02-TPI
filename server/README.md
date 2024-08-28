
## Server
### UV
Para ejecutar el trabajo necesitan tener instalado [uv](https://docs.astral.sh/uv/), un manager de paquetes y de proyectos para Python. 
``` sh
uv run ./src/manage.py migrate
uv run ./src/manage.py runserver

# Ahora en otra terminal pueden ejecutar curl para ver si la aplicación está funcionando.
curl -v http://127.0.0.1:8000/health_check

```
La intención con esto es ahorrarse la mayor cantidad de tiempo con respecto a problemas de versionado con pip y python, además de aprovechar el resto de funciones que ofrece el comando, las cuales les invito que [lean](https://docs.astral.sh/uv/getting-started/).

Si quieren ver ejemplos de su uso, pueden ver la [documentación](https://docs.astral.sh/uv/getting-started/) de la herramienta, el archivo `./.github/workflows/general.yaml` en workflows o los comandos en `./src/Justfile`.

También pueden instalarse [Just](https://github.com/casey/just) para poder crear comandos y ahorrarse tipeo.
``` sh
# En ./src/Justfile
just test
just serve
```
