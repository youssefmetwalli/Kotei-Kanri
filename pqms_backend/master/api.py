from rest_framework import viewsets, routers
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, CheckItem, SystemSettings
from .serializers import (
    CategorySerializer,
    CheckItemSerializer,
    SystemSettingsSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    search_fields = ["name","description"]

class CheckItemViewSet(viewsets.ModelViewSet):
    queryset = CheckItem.objects.select_related("category").all().order_by("-updated_at")
    serializer_class = CheckItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["type","required","category"]
    search_fields = ["name","description","unit"]


class SystemSettingsView(APIView):
    # 認証をかけたいなら permissions.IsAuthenticated に変えてOK
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        # シングルトン: pk=1 のレコードを必ず使う。なければ作成。
        obj, created = SystemSettings.objects.get_or_create(pk=1)
        return obj

    def get(self, request, *args, **kwargs):
        settings_obj = self.get_object()
        serializer = SystemSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        settings_obj = self.get_object()
        serializer = SystemSettingsSerializer(settings_obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        settings_obj = self.get_object()
        serializer = SystemSettingsSerializer(
            settings_obj, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'check-items', CheckItemViewSet, basename='checkitem')
