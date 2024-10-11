FROM python:3.12-alpine

RUN apk add --no-cache gcc musl-dev linux-headers 

# RUN adduser -D -h /home/grupo2 grupo2
# WORKDIR /home/grupo2/app
WORKDIR /app

COPY ./requirements.txt requirements.txt
# COPY ./requirements.txt /home/grupo2/app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# COPY ./src/ /home/grupo2/app/
COPY ./src/ /app

# USER grupo2 
EXPOSE 8000
CMD ["gunicorn", "-c", "./gunicorn.conf.py", "backend.wsgi:application"]

