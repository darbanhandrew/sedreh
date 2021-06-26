import json
from datetime import date
# from urllib.request import Request
from urllib import request as requester

from django.shortcuts import render, redirect
from django.http import response, HttpResponse
from django.contrib.gis.geos import GEOSGeometry, LinearRing
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from django.shortcuts import render
from django.contrib.gis.geos import GEOSGeometry
from django.core.serializers import serialize


class OrderAPIView(APIView):
    pass


class ExportAPIView(APIView):

    def get(self, request, **kwargs):
        format = request.GET.get('format').lower()

        if format in ['geotiff', 'geotif', 'tiff', 'tiff']:
            pass

        if format in ['map']:
            pass

        return Response(status=status.HTTP_200_OK)


def partial_view(request, *args, **kwargs):
    return render(request, 'create.html')


def create_order(request):
    response_data = []
    if request.method == 'POST':
        name = request.POST.get('order-name')
        date_from = date.fromtimestamp((int(request.POST.get('date-from'))) / 1000)
        date_to = date.fromtimestamp(int(request.POST.get('date-to')) / 1000)
        geoJson = request.POST.get('geojson')
        tozihat = request.POST.get('tozihat')
        user = request.user
        # LinearRing
        order = Order.objects.create(user=user, title=name, from_date=date_from, to_date=date_to, description=tozihat,
                                     polygon=GEOSGeometry(geoJson))
        orders = Order.objects.filter(id=2).all()
        geo_json = serialize('geojson', orders,
                             geometry_field='polygon',
                             fields=('title',))
        headers = {"Content-Type": "application/json"}
        data = {"order_id": order.id, "start_time": order.from_date.strftime("%Y-%m-%dT00:00:00"),
                "geo_json": json.dumps(geo_json)
                }
        req = requester.Request(method='POST', url='http://web:1376/check-order/',
                                data=json.dumps(data).encode('utf-8'),
                                headers=headers)
        resp = requester.urlopen(req)
        response_data = [resp.read().decode()]
    return HttpResponse(
        json.dumps(response_data),
        content_type="application/json"
    )


@csrf_exempt
def show_order(request):
    geoJson = []
    if request.method == 'POST':
        id = request.POST.get('id')
        order = Order.objects.filter(id=id).all()
        if order:
            geoJson = serialize('geojson', order,
                                geometry_field='polygon',
                                fields=('title',))
    return HttpResponse(
        json.dumps(geoJson),
        content_type="application/json"
    )


def confirm_status(request):
    order_id = request.GET.get("order_id")
    order = Order.objects.get(id=order_id)
    order.status = True
    order.save()
    return HttpResponse(
        json.dumps({"status": "True"}),
        content_type="application/json"
    )
