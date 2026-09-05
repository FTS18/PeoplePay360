# PeoplePay360: RESTful API Specification

This document details the HTTP REST API endpoints exposed by the PeoplePay360 Spring Boot backend service. 

- **Base URL:** `http://localhost:8080/api/v1` (or proxied via Next.js `/api/v1`)
- **Protocol:** HTTP/1.1 with JSON payload serialization
- **Security:** Bearer JWT token in `Authorization` header (`Authorization: Bearer <token>`)

---

## 1. Global Response Envelope

All API endpoints return responses encapsulated in a standardized envelope format:

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-05T11:25:00.123Z"
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "Invalid request parameter or resource conflict",
  "data": null,
  "timestamp": "2026-09-05T11:25:00.123Z"
}
```

---

## 2. Authentication & Authorization (`/auth`)

### `POST /auth/login`
Authenticates a user and issues a stateless JWT bearer token.

* **Access:** Public (Unauthenticated)
* **Request Body:**
```json
{
  "email": "admin@peoplepay360.com",
  "password": "Admin@123"
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "admin@peoplepay360.com",
      "firstName": "System",
      "lastName": "Admin",
      "role": "ADMIN"
    }
  }
}
```

---

## 3. Employee Master Operations (`/employees`)

### `GET /employees`
Retrieves a paginated and filterable collection of employee master profiles.

* **Access:** `ADMIN`, `HR_MANAGER`, `HR_PAYROLL_MANAGER`
* **Query Parameters:**
  - `page` (int, default: 0)
  - `size` (int, default: 20)
  - `department` (string, optional)
  - `status` (string, optional: `ACTIVE`, `INACTIVE`)
  - `search` (string, optional: matches name, code, or email)
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "7c1b51e0-c97b-4892-9426-38d15024b42b",
        "employeeCode": "EMP005",
        "firstName": "John",
        "lastName": "Doe",
        "workEmail": "john.doe@peoplepay360.com",
        "workPhone": "+1 (555) 019-2834",
        "department": "Engineering",
        "jobPosition": "Senior Software Engineer",
        "role": "EMPLOYEE",
        "status": "ACTIVE",
        "bankAccountNumber": "ACC-EMP005-9988",
        "bankIfscOrRouting": "FEB00012",
        "taxIdOrPan": "TAX-ID-EMP005",
        "joiningDate": "2026-03-01"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 8,
    "totalPages": 1,
    "last": true
  }
}
```

### `GET /employees/{id}`
Fetches detailed profile information for an individual employee.

* **Access:** Authenticated users (Self or HR/Admin)
* **Response `200 OK`:** Single employee object.

### `PUT /employees/{id}`
Updates editable profile information (phone, bank account details, tax identifier).

* **Access:** `ADMIN`, `HR_MANAGER`
* **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "workPhone": "+1 (555) 999-0000",
  "jobPosition": "Lead Software Engineer",
  "bankAccountNumber": "ACC-EMP005-7777",
  "bankIfscOrRouting": "FEB00099",
  "taxIdOrPan": "TAX-ID-EMP005-REV"
}
```

### `GET /employees/departments`
Retrieves a distinct list of registered operational departments.

* **Response `200 OK`:** `["Engineering", "Finance", "Human Resources", "Product", "Executive"]`

---

## 4. Contract Management (`/contracts`)

### `GET /contracts`
Lists employment contracts with status and pagination filters.

* **Query Parameters:** `page`, `size`, `status` (`DRAFT`, `RUNNING`, `EXPIRED`), `employeeId`
* **Response `200 OK`:** Paginated contract objects.

### `POST /contracts`
Drafts a new employment contract for an employee.

* **Access:** `ADMIN`, `HR_MANAGER`
* **Request Body:**
```json
{
  "employeeId": "7c1b51e0-c97b-4892-9426-38d15024b42b",
  "department": "Engineering",
  "jobPosition": "Senior Software Engineer",
  "salaryStructureId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "workingScheduleId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "wage": 65000.00,
  "startDate": "2026-09-01",
  "endDate": null,
  "status": "RUNNING"
}
```
* **Error `409 Conflict`:** Triggered if an active overlapping contract already exists for this employee.

---

## 5. Schedules & Attendance (`/attendance`, `/schedules`)

### `GET /schedules`
Lists all working calendar templates and shift hours.

### `GET /attendance`
Queries daily attendance records for staff.

* **Query Parameters:** `date` (YYYY-MM-DD), `employeeId`, `status` (`PRESENT`, `LATE`, `EXCEPTION`)

### `POST /attendance/check-in`
Punches daily arrival timestamp.

* **Request Body:** `{ "employeeId": "UUID" }`

### `POST /attendance/check-out`
Punches departure timestamp and computes net worked hours.

* **Request Body:** `{ "employeeId": "UUID" }`

### `PUT /attendance/{id}/override`
Manual adjustment of an attendance record by an authorized supervisor.

* **Access:** `ADMIN`, `HR_MANAGER`
* **Request Body:**
```json
{
  "workedHours": 8.00,
  "status": "PRESENT",
  "overrideReason": "Badge reader hardware timeout at security turnstile",
  "reviewedById": "00000000-0000-0000-0000-000000000001"
}
```

---

## 6. Time-Off & Leave Ledger (`/timeoff`)

### `GET /timeoff/types`
Returns configured leave categories (`PTO`, `SICK`, `UNPAID`).

### `GET /timeoff/allocations`
Queries annual leave balance allotments by employee.

### `POST /timeoff/requests`
Submits an employee time-off application.

* **Request Body:**
```json
{
  "employeeId": "7c1b51e0-c97b-4892-9426-38d15024b42b",
  "timeOffTypeId": "e2b17b3c-7468-45a8-8b9a-4c2299b82101",
  "startDate": "2026-09-10",
  "endDate": "2026-09-12",
  "duration": 3.0,
  "reason": "Personal relocation"
}
```

### `PUT /timeoff/requests/{id}/approve`
Authorizes pending leave and debits the allocation balance.

### `PUT /timeoff/requests/{id}/refuse`
Rejects leave request with mandatory explanation.

* **Request Body:** `{ "rejectionReason": "Project delivery freeze in effect" }`

---

## 7. Payroll Engine Execution (`/payroll`)

### `GET /payroll/payruns`
Lists all batch payroll runs.

### `POST /payroll/payruns`
Initializes a new batch payrun in `DRAFT` state.

* **Request Body:**
```json
{
  "name": "Payrun September 2026",
  "salaryStructureId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "periodStart": "2026-09-01",
  "periodEnd": "2026-09-30"
}
```

### `POST /payroll/payruns/{id}/compute`
Triggers the calculation engine: evaluates contracts, schedules, attendance, and leaves to generate itemized payslips. Transitions state from `DRAFT` ➔ `COMPUTED`.

### `POST /payroll/payruns/{id}/validate`
Signs off on the computed calculations and warning checks. Transitions state from `COMPUTED` ➔ `VALIDATED`.

### `POST /payroll/payruns/{id}/payout`
Executes liquid disbursement. Makes payslips immutable and triggers PDF compilation. Transitions state from `VALIDATED` ➔ `PAID`.

### `GET /payroll/payslips/{id}`
Returns complete payslip detail including itemized `payslip_lines` (Basic, HRA, PF, Tax, Net).

---

## 8. Executive Dashboard Analytics (`/dashboard`)

### `GET /dashboard/summary`
Calculates aggregated workforce metrics.

* **Query Parameters:** `sinceDate` (optional, default: past 6 months)
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalNetSalaryPaid": 5400.00,
    "averageSalary": 2700.00,
    "activeEmployeesCount": 8,
    "runningContractsCount": 8,
    "pendingLeaveRequestsCount": 2,
    "todayPresentCount": 6
  }
}
```

### `GET /dashboard/department-costs`
Aggregates operational cost distribution per organizational unit.

* **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "department": "Engineering", "headcount": 1, "totalGross": 3000.00, "totalNet": 2700.00 },
    { "department": "Product", "headcount": 1, "totalGross": 3000.00, "totalNet": 2700.00 }
  ]
}
```

### `GET /dashboard/monthly-trends`
Returns historical disbursement outflow grouped by settlement cycle.
