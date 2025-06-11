"""
Django Admin configuration for BP Management
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Patient, BpReading, WorkflowTask, CommunicationLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'name', 'role', 'email', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'name', 'email']
    ordering = ['username']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('name', 'role', 'phone')}),
    )


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'first_name', 'last_name', 'department', 'age', 'created_at']
    list_filter = ['department', 'union', 'created_at']
    search_fields = ['employee_id', 'first_name', 'last_name', 'department']
    ordering = ['last_name', 'first_name']
    readonly_fields = ['created_at']


@admin.register(BpReading)
class BpReadingAdmin(admin.ModelAdmin):
    list_display = ['patient', 'systolic', 'diastolic', 'category', 'is_abnormal', 'recorded_by', 'recorded_at']
    list_filter = ['category', 'is_abnormal', 'recorded_at', 'recorded_by']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__employee_id']
    ordering = ['-recorded_at']
    readonly_fields = ['is_abnormal', 'category', 'recorded_at']


@admin.register(WorkflowTask)
class WorkflowTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'assigned_to', 'priority', 'status', 'due_date', 'created_at']
    list_filter = ['priority', 'status', 'created_at', 'assigned_to']
    search_fields = ['title', 'patient__first_name', 'patient__last_name', 'assigned_to__name']
    ordering = ['-priority', 'due_date']
    readonly_fields = ['completed_at', 'created_at']


@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ['patient', 'user', 'type', 'outcome', 'created_at']
    list_filter = ['type', 'outcome', 'created_at', 'user']
    search_fields = ['patient__first_name', 'patient__last_name', 'user__name', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at']