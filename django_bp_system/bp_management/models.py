"""
Models for the Fire Department Blood Pressure Management System
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import json


class User(AbstractUser):
    """Custom user model for the system"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('nurse', 'Nurse'),
        ('coach', 'Health Coach'),
        ('firefighter', 'Firefighter'),
    ]
    
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='firefighter')
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class Patient(models.Model):
    """Firefighter patient model"""
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    department = models.CharField(max_length=100)
    union = models.CharField(max_length=50)
    age = models.IntegerField()
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    medications = models.TextField(null=True, blank=True)  # JSON string
    allergies = models.TextField(null=True, blank=True)
    last_checkup = models.DateField(null=True, blank=True)
    custom_systolic_threshold = models.IntegerField(null=True, blank=True)
    custom_diastolic_threshold = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_medications_list(self):
        """Return medications as a list"""
        if self.medications:
            try:
                return json.loads(self.medications)
            except json.JSONDecodeError:
                return []
        return []

    def set_medications_list(self, medications_list):
        """Set medications from a list"""
        self.medications = json.dumps(medications_list)


class BpReading(models.Model):
    """Blood pressure reading model"""
    BP_CATEGORIES = [
        ('normal', 'Normal'),
        ('elevated', 'Elevated'),
        ('stage1', 'Stage 1 Hypertension'),
        ('stage2', 'Stage 2 Hypertension'),
        ('crisis', 'Hypertensive Crisis'),
        ('low', 'Low Blood Pressure'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bp_readings')
    systolic = models.IntegerField()
    diastolic = models.IntegerField()
    heart_rate = models.IntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    recorded_at = models.DateTimeField(default=timezone.now)
    is_abnormal = models.BooleanField(default=False)
    category = models.CharField(max_length=20, choices=BP_CATEGORIES, default='normal')

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.patient.full_name}: {self.systolic}/{self.diastolic} ({self.recorded_at.date()})"

    def save(self, *args, **kwargs):
        """Auto-categorize and mark abnormal readings on save"""
        self.category, self.is_abnormal = self.categorize_bp()
        super().save(*args, **kwargs)

    def categorize_bp(self):
        """Categorize blood pressure reading"""
        if self.systolic < 90 or self.diastolic < 60:
            return 'low', True
        elif self.systolic >= 180 or self.diastolic >= 120:
            return 'crisis', True
        elif self.systolic >= 140 or self.diastolic >= 90:
            return 'stage2', True
        elif self.systolic >= 130 or self.diastolic >= 80:
            return 'stage1', True
        elif self.systolic >= 120 and self.diastolic < 80:
            return 'elevated', True
        else:
            return 'normal', False


class WorkflowTask(models.Model):
    """Workflow task model for hypertension management"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='workflow_tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', 'due_date']

    def __str__(self):
        return f"{self.title} - {self.patient.full_name}"

    def save(self, *args, **kwargs):
        """Auto-set completed_at when status changes to completed"""
        if self.status == 'completed' and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != 'completed':
            self.completed_at = None
        super().save(*args, **kwargs)


class CommunicationLog(models.Model):
    """Communication log model for tracking patient interactions"""
    TYPE_CHOICES = [
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('note', 'Note'),
        ('visit', 'In-Person Visit'),
    ]
    
    OUTCOME_CHOICES = [
        ('resolved', 'Resolved'),
        ('unresolved', 'Unresolved'),
        ('escalated', 'Escalated'),
        ('no_answer', 'No Answer'),
        ('scheduled', 'Follow-up Scheduled'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='communications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='communications')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='call')
    message = models.TextField()
    notes = models.TextField(null=True, blank=True)
    outcome = models.CharField(max_length=15, choices=OUTCOME_CHOICES, null=True, blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type.title()} with {self.patient.full_name} on {self.created_at.date()}"