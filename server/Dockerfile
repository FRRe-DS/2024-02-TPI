# https://github.com/astral-sh/uv-docker-example/blob/main/multistage.Dockerfile
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

RUN apt-get update && apt-get install -y libpq-dev gcc

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev


# ADD . /app

COPY ./pyproject.toml /app
COPY ./uv.lock /app

COPY ./src/manage.py /app/manage.py
COPY ./src/gunicorn.conf.py /app/gunicorn.conf.py
COPY ./src/backend /app/backend
COPY ./src/app /app/app


RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

FROM python:3.12-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=app:app /app /app

ENV PATH="/app/.venv/bin:$PATH"
ENV DJANGO_ENV="prod"


EXPOSE 80
CMD ["sh", "-c", "gunicorn -b 0.0.0.0:80 -c ./gunicorn.conf.py backend.wsgi:application"]
