# PeoplePay360: Enterprise Security & Access Control Specification

This document details the security architecture, Role-Based Access Control (RBAC) enforcement, cryptographic standards, and vulnerability mitigations implemented in PeoplePay360.

---

## 1. Security Architecture Overview

PeoplePay360 employs a defense-in-depth security model designed specifically for sensitive human resources and financial payroll operations.

```text
[ Incoming Client Request (Next.js / Browser) ]
                    │
                    ▼
[ Next.js Reverse Proxy & CORS Validation ] (Allowed origins, methods, headers)
                    │
                    ▼
[ Spring Security Filter Chain ]
    ├── Disable CSRF (Stateless Bearer token architecture)
    ├── SecurityContextHolderFilter
    └── JwtAuthenticationFilter
            ├── Header extraction: Authorization: Bearer <token>
            ├── HMAC-SHA256 signature verification (SecretKey)
            ├── Expiration check (claims.exp)
            └── SecurityContext population: SecurityUser(email, role, UUID)
                    │
                    ▼
[ Method-Level RBAC Enforcement ] (@PreAuthorize("hasAnyRole(...)"))
                    │
                    ▼
[ Sandboxed Business Execution ] (SandboxedSpelEngine, Parameterized JPA queries)
                    │
                    ▼
[ Audit Logging & Persistence ] (BaseEntity @EntityListeners, PostgreSQL)
```

---

## 2. Role-Based Access Control (RBAC) Matrix

The system implements 5 standardized hierarchical roles defined in [`Role.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/common/enums/Role.java):

1. **`ADMIN`**: Full administrative supervision, audit log overrides, system configurations.
2. **`HR_MANAGER`**: Workforce management, contract authorizations, leave approvals, department allocations.
3. **`HR_PAYROLL_MANAGER`**: Payrun execution, salary structure design, validation, disbursement approval.
4. **`HR_PAYROLL_USER`**: Payrun drafting, preliminary computation audits, attendance inspections.
5. **`EMPLOYEE`**: Self-service profile review, personal attendance clocking, leave requests, personal payslip downloads.

### Comprehensive Permissions Matrix

| Functional Module | Operation / Endpoint | `ADMIN` | `HR_MANAGER` | `HR_PAYROLL_MGR` | `HR_PAYROLL_USER` | `EMPLOYEE` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Employees** | `GET /employees` (List all) | Yes | Yes | Yes | Yes | **Denied (403)** |
| | `GET /employees/{id}` (View Profile) | Yes | Yes | Yes | Yes | **Self Only** |
| | `POST /employees` (Create Employee) | Yes | Yes | Denied | Denied | Denied |
| | `PUT /employees/{id}` (Update Employee) | Yes | Yes | Denied | Denied | Denied |
| **Contracts** | `GET /contracts` (List all contracts) | Yes | Yes | Yes | Yes | Denied (403) |
| | `POST /contracts` (Issue contract) | Yes | Yes | Denied | Denied | Denied |
| | `PUT /contracts/{id}/status` | Yes | Yes | Denied | Denied | Denied |
| **Attendance** | `POST /attendance/punch` (Clock In/Out) | Yes | Yes | Yes | Yes | **Self Only** |
| | `GET /attendance/employee/{id}` | Yes | Yes | Yes | Yes | **Self Only** |
| | `PUT /attendance/{id}/override` | Yes | Yes | Denied | Denied | Denied |
| **Time Off** | `POST /timeoff/requests` (Apply leave) | Yes | Yes | Yes | Yes | **Self Only** |
| | `PUT /timeoff/requests/{id}/approve` | Yes | Yes | Denied | Denied | Denied |
| | `POST /timeoff/allocations` | Yes | Yes | Denied | Denied | Denied |
| **Payroll** | `POST /payroll/payruns` (Create Payrun) | Yes | Denied | Yes | Yes | Denied |
| | `POST /payroll/payruns/{id}/compute` | Yes | Denied | Yes | Yes | Denied |
| | `POST /payroll/payruns/{id}/validate` | Yes | Denied | Yes | Denied | Denied |
| | `POST /payroll/payruns/{id}/pay` | Yes | Denied | Yes | Denied | Denied |
| | `GET /payroll/payslips/{id}/pdf` | Yes | Yes | Yes | Yes | **Self Only** |
| | `POST /payroll/structures` | Yes | Denied | Yes | Denied | Denied |

---

## 3. Authentication & Stateless Token Architecture

### 3.1 Token Generation & Verification
Authentication operates via stateless JSON Web Tokens (JWT) signed using HMAC-SHA256 ([`JwtTokenProvider.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/security/JwtTokenProvider.java)):

* **Signature Algorithm:** `HS256` (HMAC using SHA-256) with a minimum 256-bit cryptographically secure key.
* **Token Lifetime:** Configurable via `app.jwt.access-token-expiration-ms` (Default: 86,400,000 ms / 24 hours).
* **Payload Structure:**
  ```json
  {
    "sub": "michael.scott@peoplepay360.com",
    "userId": "00000000-0000-0000-0000-000000000003",
    "role": "HR_PAYROLL_MANAGER",
    "iat": 1725530400,
    "exp": 1725616800
  }
  ```

### 3.2 Request Interception Pipeline
[`JwtAuthenticationFilter.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/security/JwtAuthenticationFilter.java) executes prior to Spring Security's `UsernamePasswordAuthenticationFilter`:

1. Extracts the header `Authorization: Bearer <token>`.
2. Validates signature integrity, expiry, and structure.
3. Resolves user details via [`CustomUserDetailsService.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/security/CustomUserDetailsService.java).
4. Sets an authenticated `UsernamePasswordAuthenticationToken` inside `SecurityContextHolder`.

---

## 4. Cryptographic Standards & Password Security

* **Password Hashing:** Passwords are never stored in plaintext. Passwords are salted and hashed using `BCryptPasswordEncoder` ([`SecurityConfig.java:75`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/security/SecurityConfig.java#L75)).
* **BCrypt Work Factor:** Default strength 10 rounds (1,024 key expansion iterations), providing resilience against GPU/ASIC rainbow table attacks.
* **Zero PII Exposure in Logs:** Password credentials, authorization headers, and raw tokens are excluded from application logs (`logging.level.org.springframework.security=WARN`).

---

## 5. OWASP Top 10 Vulnerability Defenses

### 5.1 Remote Code Execution (RCE) Defense: Sandboxed SpEL Engine
Salary calculation formulas can be configured dynamically by administrators. Standard Spring Expression Language (SpEL) allows Java reflection and method invocation (`T(java.lang.Runtime).getRuntime().exec(...)`), which represents an arbitrary code execution vulnerability.

PeoplePay360 mitigates this threat via [`SandboxedSpelEngine.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/SandboxedSpelEngine.java):
```java
EvaluationContext context = SimpleEvaluationContext
        .forReadOnlyDataBinding()
        .build();
```
* `SimpleEvaluationContext.forReadOnlyDataBinding()` strips all Java reflection, constructor calls, and class loading capabilities.
* Formulas can only read pre-injected arithmetic values (`BASIC`, `WAGE`, `WORKED_DAYS`) and execute basic mathematical operators.

### 5.2 Insecure Direct Object Reference (IDOR) Mitigation
* Traditional sequential auto-incrementing integer IDs (`/payslips/1`, `/payslips/2`) allow attackers to enumerate other employees' financial records.
* PeoplePay360 uses **Randomized UUIDv4** for all primary keys ([`BaseEntity.java:30`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/common/BaseEntity.java#L30)). A 128-bit randomized UUID space renders brute-force enumeration mathematically infeasible.
* Self-service endpoints cross-verify target IDs with the authenticated principal:
  ```java
  boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
  if (isEmployee && !currentUser.getId().equals(employeeId)) {
      throw new AccessDeniedException("Access denied");
  }
  ```

### 5.3 SQL Injection (SQLi) Defense
* Raw SQL string concatenation is prohibited across the codebase.
* All database communication is managed via Spring Data JPA and Hibernate ORM.
* Queries use parameterized JPQL with explicit `@Param` bindings:
  ```java
  @Query("SELECT c FROM Contract c WHERE c.employee.id = :employeeId AND c.status = :status")
  Optional<Contract> findContract(@Param("employeeId") UUID employeeId, @Param("status") ContractStatus status);
  ```
  Parameters are passed out-of-band to PostgreSQL as typed binary arguments.

### 5.4 Cross-Origin Resource Sharing (CORS) & CSRF Policies
* **CSRF:** Stateless REST APIs utilizing `Authorization: Bearer` headers are immune to browser cross-site request forgery attacks (since browsers do not automatically attach custom headers to third-party requests). CSRF is explicitly disabled.
* **CORS:** Strict origin whitelisting configured in [`SecurityConfig.java:79-90`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/security/SecurityConfig.java#L79-L90):
  * Allowed Origins: `http://localhost:3000` (configurable via `app.cors.allowed-origins`).
  * Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`.
  * Credentials: Enabled for authorized cross-origin requests.

---

## 6. Concurrency & Audit Integrity

* **Optimistic Locking (`@Version`):**
  [`BaseEntity.java:40-42`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/common/BaseEntity.java#L40-L42) enforces a `version` column across all tables. Simultaneous updates from multiple administrators trigger an `OptimisticLockException` rather than silent data overwrites.
* **Automated Audit Timestamps:**
  `@CreatedDate` and `@LastModifiedDate` guarantee that record creation and revision timestamps cannot be forged by clients.
* **Supervisory Override Logs:**
  Any manual attendance correction requires an audit reason (`override_reason`) and supervisor reference (`modified_by`), preserved in PostgreSQL for compliance reviews.
