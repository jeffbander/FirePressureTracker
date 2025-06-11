"""
Serializers for the BP Management API
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Patient, BpReading, WorkflowTask, CommunicationLog
import json


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'role', 'email', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    medications_list = serializers.SerializerMethodField()
    latest_reading = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'full_name', 
                 'department', 'union', 'age', 'email', 'phone', 'emergency_contact',
                 'medications', 'medications_list', 'allergies', 'last_checkup',
                 'custom_systolic_threshold', 'custom_diastolic_threshold', 
                 'created_at', 'latest_reading']
        read_only_fields = ['id', 'created_at', 'full_name', 'latest_reading']

    def get_medications_list(self, obj):
        return obj.get_medications_list()

    def get_latest_reading(self, obj):
        latest = obj.bp_readings.first()
        if latest:
            return BpReadingSerializer(latest).data
        return None


class BpReadingSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BpReading
        fields = ['id', 'patient', 'patient_name', 'systolic', 'diastolic', 
                 'heart_rate', 'notes', 'recorded_by', 'recorded_by_name',
                 'recorded_at', 'is_abnormal', 'category']
        read_only_fields = ['id', 'is_abnormal', 'category', 'patient_name', 'recorded_by_name']

    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else None

    def get_recorded_by_name(self, obj):
        return obj.recorded_by.name if obj.recorded_by else None


class WorkflowTaskSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkflowTask
        fields = ['id', 'patient', 'patient_name', 'assigned_to', 'assignee_name',
                 'title', 'description', 'priority', 'status', 'due_date',
                 'completed_at', 'created_at']
        read_only_fields = ['id', 'completed_at', 'created_at', 'patient_name', 'assignee_name']

    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else None

    def get_assignee_name(self, obj):
        return obj.assigned_to.name if obj.assigned_to else None


class CommunicationLogSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunicationLog
        fields = ['id', 'patient', 'patient_name', 'patient_details', 'user', 
                 'user_name', 'user_details', 'type', 'message', 'notes', 
                 'outcome', 'follow_up_date', 'created_at']
        read_only_fields = ['id', 'created_at', 'patient_name', 'user_name']

    def get_patient_name(self, obj):
        return obj.patient.full_name if obj.patient else None

    def get_user_name(self, obj):
        return obj.user.name if obj.user else None

    def get_patient_details(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'first_name': obj.patient.first_name,
                'last_name': obj.patient.last_name,
                'employee_id': obj.patient.employee_id,
                'department': obj.patient.department,
                'phone': obj.patient.phone,
                'email': obj.patient.email
            }
        return None

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'name': obj.user.name,
                'role': obj.user.role,
                'email': obj.user.email
            }
        return None


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class DashboardStatsSerializer(serializers.Serializer):
    total_patients = serializers.IntegerField()
    abnormal_readings = serializers.IntegerField()
    pending_calls = serializers.IntegerField()
    today_readings = serializers.IntegerField()


class CommunicationAnalyticsSerializer(serializers.Serializer):
    total_communications = serializers.IntegerField()
    by_type = serializers.DictField()
    by_outcome = serializers.DictField()
    by_day = serializers.DictField()
    response_rate = serializers.IntegerField()
    top_staff = serializers.DictField()
    daily_trend = serializers.ListField()