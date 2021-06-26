from django.contrib import admin
from django.contrib.auth.views import  LogoutView
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('panel/', views.IndexPage.as_view(), name='index'),
    path('admin/', admin.site.urls),
    path('monitoring/', include('monitoring.urls')),
    path('ordering/', include('ordering.urls')),
    path('notification/', include('notification.urls')),
    path('geometries/', include('geometries.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path("register", views.register_request, name="register"),
    path("", views.login_request, name="login"),
    path("logout/", LogoutView.as_view(), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
