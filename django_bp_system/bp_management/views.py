"""
API Views for the Fire Department Blood Pressure Management System
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
import json

from .models import User, Patient, BpReading, WorkflowTask, CommunicationLog
from .serializers import (
    UserSerializer, PatientSerializer, BpReadingSerializer,
    WorkflowTaskSerializer, CommunicationLogSerializer, LoginSerializer,
    DashboardStatsSerializer, CommunicationAnalyticsSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Patient.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(department__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def priority(self, request):
        """Get priority patients based on abnormal readings"""
        priority_patients = []
        patients = Patient.objects.all()
        
        for patient in patients:
            latest_reading = patient.bp_readings.first()
            if latest_reading and latest_reading.is_abnormal:
                patient_data = PatientSerializer(patient).data
                priority_patients.append(patient_data)
        
        return Response(priority_patients)


class BpReadingViewSet(viewsets.ModelViewSet):
    queryset = BpReading.objects.all()
    serializer_class = BpReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BpReading.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        abnormal = self.request.query_params.get('abnormal', None)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if abnormal:
            queryset = queryset.filter(is_abnormal=True)
            
        return queryset

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent readings"""
        limit = int(request.query_params.get('limit', 10))
        readings = BpReading.objects.all()[:limit]
        serializer = BpReadingSerializer(readings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def abnormal(self, request):
        """Get abnormal readings"""
        readings = BpReading.objects.filter(is_abnormal=True)
        serializer = BpReadingSerializer(readings, many=True)
        return Response(serializer.data)


class WorkflowTaskViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTask.objects.all()
    serializer_class = WorkflowTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = WorkflowTask.objects.all()
        status_filter = self.request.query_params.get('status', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        patient_id = self.request.query_params.get('patient_id', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset


class CommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = CommunicationLog.objects.all()
    serializer_class = CommunicationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CommunicationLog.objects.all()
        
        # Apply filters
        patient_id = self.request.query_params.get('patient_id', None)
        user_id = self.request.query_params.get('user_id', None)
        comm_type = self.request.query_params.get('type', None)
        outcome = self.request.query_params.get('outcome', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        search = self.request.query_params.get('search', None)
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_order = self.request.query_params.get('sort_order', 'desc')

        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if comm_type:
            queryset = queryset.filter(type=comm_type)
        if outcome:
            queryset = queryset.filter(outcome=outcome)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(notes__icontains=search) |
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search) |
                Q(patient__employee_id__icontains=search)
            )

        # Apply sorting
        if sort_by == 'patient_name':
            sort_field = 'patient__last_name'
        elif sort_by == 'user_name':
            sort_field = 'user__name'
        else:
            sort_field = sort_by

        if sort_order == 'desc':
            sort_field = f'-{sort_field}'

        queryset = queryset.order_by(sort_field)
        return queryset

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get communication analytics"""
        period = request.query_params.get('period', '30d')
        
        # Calculate date range
        now = timezone.now()
        if period == '7d':
            cutoff_date = now - timedelta(days=7)
        elif period == '90d':
            cutoff_date = now - timedelta(days=90)
        elif period == '1y':
            cutoff_date = now - timedelta(days=365)
        else:  # 30d default
            cutoff_date = now - timedelta(days=30)

        communications = CommunicationLog.objects.filter(created_at__gte=cutoff_date)

        # Calculate analytics
        analytics = {
            'total_communications': communications.count(),
            'by_type': {},
            'by_outcome': {},
            'by_day': {},
            'response_rate': 0,
            'top_staff': {},
            'daily_trend': []
        }

        # Group by type
        type_counts = communications.values('type').annotate(count=Count('type'))
        for item in type_counts:
            analytics['by_type'][item['type']] = item['count']

        # Group by outcome
        outcome_counts = communications.exclude(outcome__isnull=True).values('outcome').annotate(count=Count('outcome'))
        for item in outcome_counts:
            analytics['by_outcome'][item['outcome']] = item['count']

        # Calculate response rate
        calls = communications.filter(type='call')
        answered_calls = calls.exclude(outcome='no_answer')
        if calls.count() > 0:
            analytics['response_rate'] = round((answered_calls.count() / calls.count()) * 100)

        # Group by staff
        staff_counts = communications.values('user__name').annotate(count=Count('user'))
        for item in staff_counts:
            analytics['top_staff'][item['user__name']] = item['count']

        # Daily trend
        daily_counts = defaultdict(int)
        for comm in communications:
            date_str = comm.created_at.strftime('%Y-%m-%d')
            daily_counts[date_str] += 1

        analytics['by_day'] = dict(daily_counts)
        analytics['daily_trend'] = [
            {'date': date, 'count': count}
            for date, count in sorted(daily_counts.items())
        ]

        serializer = CommunicationAnalyticsSerializer(analytics)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    today = timezone.now().date()
    
    stats = {
        'total_patients': Patient.objects.count(),
        'abnormal_readings': BpReading.objects.filter(is_abnormal=True).count(),
        'pending_calls': WorkflowTask.objects.filter(
            status='pending',
            title__icontains='call'
        ).count(),
        'today_readings': BpReading.objects.filter(
            recorded_at__date=today
        ).count()
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)