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
> [!IMPORTANT]
> Para ejecutar la aplicación utilizamos `docker compose`, asi que es necesario que lo tengas instalado.

![Visualización del compose.yaml](../assets/compose.svg)

``` sh
# https://github.com/casey/just
# En ./src/Justfile o en cualquier subdirectorio:

just test
just serve dev  # Inicializa el servidor http con Django, configurado para desarrollo.
just serve prod # Inicializa un servidor http con Gunicorn, configurado para producción.

# Ahora en otra terminal pueden ejecutar curl para ver si la aplicación está funcionando.
curl -v http://127.0.0.1:8000/health_check/
```
