from django.db import models
from django.db.models import Q
from django.contrib.gis.db import models as gisModels
from django.conf import settings


class Geometry(gisModels.Model):
    gid = models.AutoField(primary_key=True, null=False, blank=False)
    geom = gisModels.GeometryField(srid=settings.WGS84_SRID, null=False, blank=False)
    name = models.CharField(max_length=128, null=False, blank=False)
    description = models.CharField(max_length=256, null=True, blank=True)
    creation_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class FavoriteRegion(Geometry):
    geom = gisModels.PolygonField(srid=settings.WGS84_SRID, null=False, blank=False)


class FavoritePoint(Geometry):
    geom = gisModels.PointField(srid=settings.WGS84_SRID, null=False, blank=False)


class Province(Geometry):
    geom = gisModels.PolygonField(srid=settings.WGS84_SRID, null=True, blank=True)


class Township(Geometry):
    geom = gisModels.PolygonField(srid=settings.WGS84_SRID, null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)


class City(Geometry):
    geom = gisModels.PolygonField(srid=settings.WGS84_SRID, null=True, blank=True)
    township = models.ForeignKey(Township, on_delete=models.CASCADE)


class Region(models.Model):
    # user =
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True, blank=True)
    polygon = models.ForeignKey(FavoriteRegion, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(city__isnull=False) | Q(polygon__isnull=False),
                name='not_both_null'
            )
        ]


class PositionGroup(models.Model):
    id = models.AutoField(primary_key=True, null=False, blank=False)
    name = models.CharField(max_length=128, null=False, blank=False, unique=True)
    geoserver_url = models.CharField(max_length=512, null=False, blank=False)

    def __str__(self):
        return self.name


class Position(Geometry):
    geom = gisModels.PointField(srid=settings.WGS84_SRID, null=False, blank=False)
    groupId = models.ForeignKey(PositionGroup, on_delete=models.CASCADE)
