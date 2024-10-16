<h1 align=center><code>Trabajo Practico Final - Desarrollo de Software</code></h1>
<div align=center>
    <a href=https://github.com/FRRe-DS/2024-02-TPI/actions/workflows/general.yaml>
        <img src=https://github.com/FRRe-DS/2024-02-TPI/actions/workflows/general.yaml/badge.svg>
    </a>
</div>
<br>

## Client
Para trabajar en el cliente utilizamos [pnpm](https://pnpm.io/) con [vite](https://vitejs.dev/) como bundler.
``` sh
cd client
pnpm install
# Para ejecutar el servidor de desarrollo:
pnpm run dev

# Para crear los archivos estáticos:
pnpm run build
```


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
> `just serve` utiliza `docker compose` para iniciar el servicio, asi que es necesario que tengas instalado docker.

``` sh
# En ./src/Justfile o en cualquier subdirectorio siguiente:
just test
just serve dev # Inicializa el servidor configurado para desarrollo.
just serve prod # Inicializa un servidor configurado para producción.
```
