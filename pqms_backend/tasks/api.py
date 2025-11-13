
from rest_framework import viewsets, routers
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-updated_at")
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status","priority","assignee"]
    search_fields = ["title","description","assignee","checklist_name"]

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
