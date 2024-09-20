FROM python:3.12
WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/ /app/

EXPOSE 8000
ENV DJANGO_ENV="prod"
CMD ["gunicorn", "-c", "./gunicorn.conf.py", "backend.wsgi:application"]

