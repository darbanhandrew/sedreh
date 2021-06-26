from django.urls import path
from . import views

urlpatterns = [
    path('order/', views.OrderAPIView.as_view(), name='order'),
    path('export/', views.ExportAPIView.as_view(), name='export'),
    path('partial_view/', views.partial_view, name='partial_view'),
    path('create-order/', views.create_order, name='create-order'),
    path('show-order/', views.show_order, name='show-order'),
    path('confirm-status/', views.confirm_status, name='confirm-status')
]
