# Fire Department BP System - Webhook API Documentation

## Overview

The Fire Department Blood Pressure Management System provides a webhook endpoint for external applications to register new patients directly into the system. Patients registered through the webhook automatically enter an approval workflow before becoming active in the system.

## Patient Status Workflow

Patients progress through the following statuses:

1. **awaiting_confirmation** - Initial status when registered via webhook
2. **awaiting_cuff** - Patient approved but waiting for BP monitoring equipment
3. **active** - Fully enrolled and participating in the program
4. **out_of_program** - No longer participating

## Webhook Endpoint

### Patient Registration
**POST** `/api/webhook/patients`

Registers a new patient from an external application. The patient will be created with status `awaiting_confirmation` and require approval before becoming active.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "employeeId": "FF-001",           // Required: Unique firefighter ID
  "firstName": "John",              // Required: First name
  "lastName": "Smith",              // Required: Last name
  "dateOfBirth": "1985-03-15",      // Required: YYYY-MM-DD format
  "department": "Engine Company",   // Required: Department/unit
  "union": "Union 3",               // Required: Union affiliation
  "email": "j.smith@fire.gov",      // Optional: Email address
  "phone": "(555) 123-4567",        // Optional: Phone number

  "allergies": "Penicillin",        // Optional: Known allergies
  "medications": "Lisinopril 10mg"  // Optional: Current medications
}
```

#### Response - Success (201)
```json
{
  "success": true,
  "message": "Patient registration received - awaiting confirmation",
  "patient": {
    "id": 35,
    "employeeId": "FF-001",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1985-03-15",
    "department": "Engine Company",
    "union": "Union 3",
    "age": 39,                     // Automatically calculated
    "email": "j.smith@fire.gov",
    "phone": "(555) 123-4567",

    "allergies": "Penicillin",
    "medications": "Lisinopril 10mg",
    "status": "awaiting_confirmation",
    "approvedAt": null,
    "approvedBy": null,
    "createdAt": "2025-06-26T17:16:02.597Z"
  }
}
```

#### Response - Error (400)
```json
{
  "success": false,
  "message": "Invalid patient data received from webhook",
  "error": "Detailed validation error message"
}
```

#### Response - Duplicate Employee ID (409)
```json
{
  "success": false,
  "message": "Patient with Employee ID FF-001 already exists",
  "existingPatient": {
    "id": 4,
    "name": "John Rodriguez",
    "status": "active",
    "createdAt": "2025-06-26T17:18:57.760Z"
  }
}
```

## Patient Management API

### Get Pending Patients
**GET** `/api/patients/pending`

Returns all patients awaiting confirmation or cuff assignment.

#### Response
```json
[
  {
    "id": 35,
    "employeeId": "FF-001",
    "firstName": "John",
    "lastName": "Smith",
    "status": "awaiting_confirmation",
    // ... other patient fields
  }
]
```

### Get Patients by Status
**GET** `/api/patients/status/{status}`

Returns patients with a specific status.

**Parameters:**
- `status`: One of `awaiting_confirmation`, `awaiting_cuff`, `active`, `out_of_program`

### Approve Patient
**PATCH** `/api/patients/{id}/approve`

Changes patient status in the approval workflow.

#### Request Body
```json
{
  "newStatus": "awaiting_cuff",    // New status to assign
  "approvedBy": 1                  // ID of approving user
}
```

#### Response
```json
{
  "id": 35,
  "status": "awaiting_cuff",
  "approvedAt": "2025-06-26T17:20:15.123Z",
  "approvedBy": 1,
  // ... other patient fields
}
```

## Integration Example

### cURL Example
```bash
curl -X POST http://your-server.com/api/webhook/patients \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "FF-999",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-07-22",
    "department": "Ladder Company",
    "union": "Union 5",
    "email": "j.doe@fire.gov",
    "phone": "(555) 555-0123",

    "allergies": "None known"
  }'
```

### JavaScript Example
```javascript
const registerPatient = async (patientData) => {
  try {
    const response = await fetch('/api/webhook/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Patient registered:', result.patient);
      return result.patient;
    } else {
      console.error('Registration failed:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};
```

### Python Example
```python
import requests
import json

def register_patient(patient_data):
    url = "http://your-server.com/api/webhook/patients"
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=patient_data)
        result = response.json()
        
        if response.status_code == 201 and result.get('success'):
            print(f"Patient registered: {result['patient']['employeeId']}")
            return result['patient']
        else:
            print(f"Registration failed: {result.get('message', 'Unknown error')}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return None

# Example usage
patient_data = {
    "employeeId": "FF-888",
    "firstName": "Mike",
    "lastName": "Johnson",
    "dateOfBirth": "1988-12-05",
    "department": "Rescue Squad",
    "union": "Union 2",
    "email": "m.johnson@fire.gov",
    "phone": "(555) 444-3333"
}

register_patient(patient_data)
```

## Field Validation

### Required Fields
- `employeeId`: Must be unique, alphanumeric with hyphens
- `firstName`: Non-empty string
- `lastName`: Non-empty string
- `dateOfBirth`: Valid date in YYYY-MM-DD format
- `department`: Non-empty string
- `union`: Non-empty string

### Optional Fields
- `email`: Valid email format if provided
- `phone`: Phone number in any format

- `allergies`: Free text field
- `medications`: Free text field

### Automatic Fields
- `age`: Calculated automatically from `dateOfBirth`
- `status`: Always set to "awaiting_confirmation" for webhook registrations
- `createdAt`: Set to current timestamp
- `id`: Auto-generated unique identifier

## Error Handling

The webhook endpoint validates all incoming data and returns detailed error messages for invalid requests:

- **400 Bad Request**: Invalid or missing required fields
- **409 Conflict**: Employee ID already exists
- **500 Internal Server Error**: Server-side processing error

## Security Considerations

1. Validate the source of webhook requests in production
2. Implement rate limiting to prevent abuse
3. Use HTTPS for all communications
4. Consider implementing webhook signatures for verification
5. Log all webhook attempts for audit purposes

## Approval Workflow

After webhook registration:

1. Patient appears in the "Approvals" section with status "awaiting_confirmation"
2. Staff reviews and approves the registration
3. Status changes to "awaiting_cuff" - patient approved but needs equipment
4. Once equipment is provided, status changes to "active"
5. Patient can now participate in BP monitoring program

The approval workflow ensures all registrations are verified before patients become active in the system.