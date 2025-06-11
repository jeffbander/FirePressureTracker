"""
Management command to seed the database with initial data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from bp_management.models import Patient, BpReading, WorkflowTask, CommunicationLog
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial test data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with initial data...')
        
        # Create users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'name': 'System Administrator',
                'role': 'admin',
                'email': 'admin@firestation.gov',
                'phone': '555-0001',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')

        nurse_user, created = User.objects.get_or_create(
            username='nurse1',
            defaults={
                'name': 'Sarah Johnson',
                'role': 'nurse',
                'email': 'nurse@firestation.gov',
                'phone': '555-0002'
            }
        )
        if created:
            nurse_user.set_password('nurse123')
            nurse_user.save()
            self.stdout.write(f'Created nurse user: {nurse_user.username}')

        coach_user, created = User.objects.get_or_create(
            username='coach1',
            defaults={
                'name': 'Michael Chen',
                'role': 'coach',
                'email': 'coach@firestation.gov',
                'phone': '555-0003'
            }
        )
        if created:
            coach_user.set_password('coach123')
            coach_user.save()
            self.stdout.write(f'Created coach user: {coach_user.username}')

        # Create sample patients
        patients_data = [
            {
                'employee_id': 'FF001',
                'first_name': 'John',
                'last_name': 'Smith',
                'department': 'Station 1',
                'union': 'IAFF Local 123',
                'age': 35,
                'email': 'j.smith@firestation.gov',
                'phone': '555-1001',
                'emergency_contact': '555-1002'
            },
            {
                'employee_id': 'FF002',
                'first_name': 'Maria',
                'last_name': 'Rodriguez',
                'department': 'Station 2',
                'union': 'IAFF Local 123',
                'age': 42,
                'email': 'm.rodriguez@firestation.gov',
                'phone': '555-1003',
                'emergency_contact': '555-1004'
            },
            {
                'employee_id': 'FF003',
                'first_name': 'David',
                'last_name': 'Wilson',
                'department': 'Station 1',
                'union': 'IAFF Local 123',
                'age': 28,
                'email': 'd.wilson@firestation.gov',
                'phone': '555-1005',
                'emergency_contact': '555-1006'
            },
            {
                'employee_id': 'FF004',
                'first_name': 'Jennifer',
                'last_name': 'Brown',
                'department': 'Station 3',
                'union': 'IAFF Local 123',
                'age': 38,
                'email': 'j.brown@firestation.gov',
                'phone': '555-1007',
                'emergency_contact': '555-1008'
            },
            {
                'employee_id': 'FF005',
                'first_name': 'Robert',
                'last_name': 'Taylor',
                'department': 'Station 2',
                'union': 'IAFF Local 123',
                'age': 45,
                'email': 'r.taylor@firestation.gov',
                'phone': '555-1009',
                'emergency_contact': '555-1010'
            }
        ]

        created_patients = []
        for patient_data in patients_data:
            patient, created = Patient.objects.get_or_create(
                employee_id=patient_data['employee_id'],
                defaults=patient_data
            )
            if created:
                created_patients.append(patient)
                self.stdout.write(f'Created patient: {patient.full_name}')

        # Create sample BP readings
        bp_categories = [
            (110, 70, 'normal'),
            (118, 78, 'normal'),
            (125, 82, 'elevated'),
            (135, 88, 'stage1'),
            (148, 95, 'stage2'),
            (165, 105, 'stage2'),
            (185, 115, 'crisis')
        ]

        for patient in Patient.objects.all():
            # Create 3-5 readings per patient over the last 30 days
            num_readings = random.randint(3, 5)
            for i in range(num_readings):
                systolic, diastolic, category = random.choice(bp_categories)
                # Add some variation
                systolic += random.randint(-5, 5)
                diastolic += random.randint(-3, 3)
                
                recorded_at = timezone.now() - timedelta(days=random.randint(1, 30))
                
                BpReading.objects.create(
                    patient=patient,
                    systolic=systolic,
                    diastolic=diastolic,
                    heart_rate=random.randint(60, 100),
                    notes=f'Routine check for {patient.full_name}',
                    recorded_by=random.choice([nurse_user, coach_user]),
                    recorded_at=recorded_at
                )

        self.stdout.write(f'Created BP readings for all patients')

        # Create workflow tasks
        tasks_data = [
            {
                'title': 'Follow-up call for elevated BP',
                'description': 'Contact patient about recent elevated blood pressure reading',
                'priority': 'high',
                'status': 'pending'
            },
            {
                'title': 'Schedule medical evaluation',
                'description': 'Patient needs comprehensive medical evaluation',
                'priority': 'medium',
                'status': 'pending'
            },
            {
                'title': 'Lifestyle counseling session',
                'description': 'Provide dietary and exercise recommendations',
                'priority': 'low',
                'status': 'completed'
            }
        ]

        for patient in Patient.objects.all()[:3]:
            for task_data in tasks_data[:2]:  # Create 2 tasks per patient
                WorkflowTask.objects.create(
                    patient=patient,
                    assigned_to=random.choice([nurse_user, coach_user]),
                    due_date=timezone.now() + timedelta(days=random.randint(1, 7)),
                    **task_data
                )

        self.stdout.write(f'Created workflow tasks')

        # Create communication logs
        communication_types = ['call', 'email', 'note', 'visit']
        outcomes = ['resolved', 'unresolved', 'escalated', 'no_answer', 'scheduled']
        
        for patient in Patient.objects.all():
            # Create 1-3 communications per patient
            num_comms = random.randint(1, 3)
            for i in range(num_comms):
                comm_type = random.choice(communication_types)
                outcome = random.choice(outcomes)
                
                CommunicationLog.objects.create(
                    patient=patient,
                    user=random.choice([nurse_user, coach_user]),
                    type=comm_type,
                    message=f'{comm_type.title()} regarding blood pressure management for {patient.full_name}',
                    notes=f'Patient was {"responsive" if outcome != "no_answer" else "not available"}',
                    outcome=outcome,
                    created_at=timezone.now() - timedelta(days=random.randint(1, 14))
                )

        self.stdout.write(f'Created communication logs')
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))