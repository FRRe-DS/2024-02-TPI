FROM python:3.12-alpine
WORKDIR /app

RUN apk add --no-cache gcc musl-dev linux-headers 

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY ./src/ /app/

EXPOSE 8000
CMD ["gunicorn", "-c", "./gunicorn.conf.py", "backend.wsgi:application"]

