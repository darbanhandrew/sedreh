import datetime
from django.db import models
from ordering.models import Pollutant

class MonitoringmMap(models.Model):
    id = models.AutoField(primary_key=True)
    last_modify = models.DateTimeField(auto_now=True, null=False, blank=False)
    geoserver_url = models.CharField(max_length=512, null=False, blank=False)
    pollutant = models.ForeignKey(Pollutant, on_delete=models.CASCADE)
