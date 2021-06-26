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


class PositionGroupAPIView(APIView):

    def get(self, request, id, **kwargs):
        group = get_object_or_404(PositionGroup, id=id)

        return Response(group.geoserver_url, status=status.HTTP_200_OK)


class RegionAPIView(APIView):

    def post(self, request, **kwargs):
        try:
            name = request.POST.get('name')
            description = request.POST.get('description')
            geom_wkt = request.POST.get('wkt')

            if name == '' or geom_wkt == '':
                return response.HttpResponseNotFound()

            geom = GEOSGeometry(geom_wkt, srid=settings.WGS84_SRID)

            Region(
                polygon=PolygonGeometry(
                    name=name,
                    description=description,
                    geom=geom
                )
            ).save()

            return Response(status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LayersListPartialView(TemplateView):
    template_name = 'layersList.html'

    def get(self, request, **kwargs):
        positionGroups = PositionGroup.objects.all()
        
        return render(request, self.template_name, {'positionGroups': positionGroups})