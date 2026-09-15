from django.contrib import admin
from django.urls import path, include

admin.site.site_header = 'English Quest Admin'
admin.site.site_title  = 'English Quest'
admin.site.index_title = 'Content & School Management'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
