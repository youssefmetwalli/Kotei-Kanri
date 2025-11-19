from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from .models import CheckItem
from .serializers import CheckItemSerializer


class CheckItemViewSet(ModelViewSet):
    queryset = CheckItem.objects.all().order_by("-created_at")
    serializer_class = CheckItemSerializer
    permission_classes = [AllowAny]
