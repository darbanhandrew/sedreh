FROM python:3.8.5-slim-buster

ENV PYTHONUNBUFFERD 1

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install binutils libproj-dev gdal-bin

COPY requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

RUN mkdir /home/App
WORKDIR /home/App
COPY . /home/App

# RUN adduser -D user
# USER user