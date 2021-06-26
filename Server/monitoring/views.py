from django.shortcuts import render, redirect
from django.http import response, HttpResponse
from django.contrib.gis.geos import GEOSGeometry
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView


class MonitoringMapAPIView(APIView):

    def get(self, request, id, **kwargs):
        map = get_object_or_404(MonitoringmMap, id=id)

        return Response(map.geoserver_url, status=status.HTTP_200_OK)


class MonitoringListButtonsPartialView(TemplateView):
    template_name = 'monitoringListButtons.html'

    def get(self, request, **kwargs):
        monitoringMaps = MonitoringmMap.objects.all()

        return render(request, self.template_name, {'monitoringMaps': monitoringMaps})
