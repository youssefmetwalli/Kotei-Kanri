
from rest_framework import viewsets, permissions, routers
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ["username","display_name","email","department"]
    ordering_fields = ["id","username","display_name"]

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
