
from rest_framework import viewsets, routers
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, CheckItem
from .serializers import CategorySerializer, CheckItemSerializer

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

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'check-items', CheckItemViewSet, basename='checkitem')
