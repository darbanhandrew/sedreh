from django.urls import path
from . import views

urlpatterns = [
    path('getMonitoringMap/<int:id>/', views.MonitoringMapAPIView.as_view(), name='getMonitoringMap'),
    path('getMonitoringListButtons/', views.MonitoringListButtonsPartialView.as_view(), name='getMonitoringListButtons'),
]
