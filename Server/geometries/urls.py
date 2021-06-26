from django.urls import path
from . import views


urlpatterns = [
    path('getPositionGroup/<int:id>/', views.PositionGroupAPIView.as_view(), name='getPositionGroup'),
    path('getLayersList/', views.LayersListPartialView.as_view(), name='getLayersList'),
]
