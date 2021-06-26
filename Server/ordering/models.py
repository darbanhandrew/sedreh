from django.contrib.postgres.fields import ArrayField
from django.db import models
from geometries.models import Region
# from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User
from django.contrib.gis.db import models as gisModels
from django.conf import settings


class PollutantGroup(models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)
    title = models.CharField(max_length=64, null=False, blank=False)

    def __str__(self):
        return self.title


class Pollutant(models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)
    title = models.CharField(max_length=16, null=False, blank=False)
    full_name = models.CharField(max_length=64)
    group = models.ForeignKey(PollutantGroup, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Order(models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)
    title = models.CharField(max_length=32)
    polygon = gisModels.PolygonField(srid=settings.WGS84_SRID, null=False, blank=False)
    creation_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    description = models.CharField(max_length=256, null=True, blank=True)
    from_date = models.DateField(null=False, blank=False)
    to_date = models.DateField(null=True, blank=True)
    # pollutants = models.ForeignKey(Pollutant, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    status = models.BooleanField(blank=True,null=True, default=False)