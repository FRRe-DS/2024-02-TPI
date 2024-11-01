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
# API DOCS

Se debe consultar desde `/api/` y en cada uno de los recursos listados a continuación:

## API Endpoints

- **Votantes:** `/api/votantes/`
- **Escultores:** `/api/escultores/`
- **Esculturas:** `/api/esculturas/`
- **Eventos:** `/api/eventos/`
- **Imágenes:** `/api/imagenes/`
- **Países:** `/api/paises/`
- **Administradores del sistema (AdminSis):** `/api/adminsis/`
- **Temáticas:** `/api/tematica/`
- **Lugares:** `/api/lugar/`

## Autenticación por Token

Para autenticarse y obtener un token, envía una solicitud `POST` al endpoint `/api/adminsis/get_token/` con el `username` y `password` en el cuerpo de la solicitud y luego este devolverá el token.

### Usuario Administrador por Defecto

La base de datos por defecto incluye un usuario administrador que puedes utilizar para propósitos de prueba:

- **Usuario:** `admin`
- **Contraseña:** `admin`



## Base de Datos

Este proyecto utiliza SQLite como base de datos. Si la base de datos está vacía, ya sea porque se ha clonado el repositorio y no contiene datos, el sistema insertará automáticamente utilizando los archivos SQL que se encuentran en el directorio `server/src/scripts/insert_sql/` utilizando el archivo `inicizalicacion.py` que se encuentra en  el mismo directorio. Estos archivos incluyen instrucciones `INSERT` que agregarán datos iniciales a las tablas necesarias.

### Pasos para inserción automática

**Ejecutar el proyecto mediante just serve** para que el sistema detecte si la base de datos esta vacía

*Esto facilita la configuración inicial del proyecto, permitiendo pruebas y desarrollo sin necesidad de insertar datos manualmente.

