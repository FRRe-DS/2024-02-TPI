[![General CI](https://github.com/lauacosta/desarrollo_software/actions/workflows/general.yaml/badge.svg)](https://github.com/lauacosta/desarrollo_software/actions/workflows/general.yaml)


# Trabajo Practico Final - Desarrollo de Software

## Como ejecutar:
### UV
Para ejecutar el trabajo necesitan tener instalado [uv](https://docs.astral.sh/uv/), un manager de paquetes y de proyectos para Python. La intención con esto es ahorrarse la mayor cantidad de tiempo con respecto a problemas de versionado con pip y python, además de aprovechar el resto de funciones que ofrece el comando.
``` sh
    uv run ./src/manage.py migrate
    uv run ./src/manage.py runserver
```

Si quieren ver ejemplos de su uso, pueden ver la [documentación](https://docs.astral.sh/uv/getting-started/) de la herramienta, el archivo `./.github/workflows/general.yaml` en workflows o los comandos en `./src/Justfile`.

También pueden instalarse [Just](https://github.com/casey/just) para poder crear comandos y ahorrarse tipeo.
``` sh
    # En ./src/Justfile
    just serve
    just test
```

