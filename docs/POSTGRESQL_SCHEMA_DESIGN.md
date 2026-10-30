# PropertyHub &mdash; PostgreSQL Database Schema & Relational Design

## 1. System Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o{ properties : "owns (owner_id)"
    users ||--o{ properties : "manages (manager_id)"
    users ||--o{ properties : "assigned (agent_id)"
    users ||--o| tenants : "has profile (user_id)"
    users ||--o{ rental_agreements : "lessor / owner (owner_id)"
    users ||--o{ expenses : "created_by"
    users ||--o{ property_visits : "guided_by (agent_id)"
    users ||--o{ notifications : "receives (recipient_id)"
    users ||--o{ activity_logs : "performed_by (user_id)"

    properties ||--o| tenants : "rents (current_tenant_id)"
    properties ||--o{ rental_agreements : "leased_under (property_id)"
    properties ||--o{ payments : "billed_for (property_id)"
    properties ||--o{ maintenance_requests : "maintenance_at (property_id)"
    properties ||--o{ expenses : "incurred_by (property_id)"
    properties ||--o{ property_visits : "walkthrough_for (property_id)"

    tenants ||--o{ rental_agreements : "lessee (tenant_id)"
    tenants ||--o{ payments : "pays (tenant_id)"
    tenants ||--o{ maintenance_requests : "submits (tenant_id)"

    rental_agreements ||--o{ payments : "generates (agreement_id)"
    rental_agreements ||--o| rental_agreements : "renewed_from"

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        varchar phone
        varchar status
        timestamptz created_at
    }

    properties {
        uuid id PK
        varchar title
        varchar property_type
        uuid owner_id FK
        uuid manager_id FK
        numeric monthly_rent
        numeric security_deposit
        varchar availability_status
    }

    tenants {
        uuid id PK
        uuid user_id FK "UK"
        uuid property_id FK
        varchar emergency_contact_name
        varchar emergency_contact_phone
        varchar status
    }

    rental_agreements {
        uuid id PK
        varchar agreement_number UK
        uuid property_id FK
        uuid owner_id FK
        uuid tenant_id FK
        date lease_start_date
        date lease_end_date
        numeric monthly_rent
        varchar agreement_status
    }

    payments {
        uuid id PK
        varchar invoice_number UK
        uuid agreement_id FK
        uuid property_id FK
        uuid tenant_id FK
        numeric amount
        date due_date
        varchar payment_method
        varchar status
        varchar razorpay_order_id
        varchar razorpay_payment_id
    }

    maintenance_requests {
        uuid id PK
        varchar ticket_number UK
        uuid property_id FK
        uuid tenant_id FK
        varchar category
        varchar priority
        varchar status
        numeric estimated_cost
        numeric actual_cost
    }

    expenses {
        uuid id PK
        uuid property_id FK
        uuid created_by FK
        varchar category
        numeric amount
        date expense_date
        varchar paid_to
    }

    property_visits {
        uuid id PK
        uuid property_id FK
        uuid agent_id FK
        varchar visitor_name
        varchar visitor_phone
        date visit_date
        varchar status
    }

    notifications {
        uuid id PK
        uuid recipient_id FK
        varchar title
        varchar type
        boolean is_read
    }

    activity_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar module
        varchar ip_address
    }
```

---

## 2. Table Specifications & Relationships

### 1. `users` Table
- **Primary Key**: `id` (UUID v4)
- **Roles**: `ADMIN`, `PROPERTY_OWNER`, `PROPERTY_MANAGER`, `AGENT`, `TENANT`
- **Unique Indexes**: `email`
- **Relationships**:
  - `1 -> N` with `properties` (as Owner)
  - `1 -> N` with `properties` (as Manager)
  - `1 -> 1` with `tenants` (User to Tenant profile)
  - `1 -> N` with `rental_agreements`
  - `1 -> N` with `expenses`
  - `1 -> N` with `notifications`

### 2. `properties` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `owner_id -> users(id) ON DELETE CASCADE`
  - `manager_id -> users(id) ON DELETE SET NULL`
  - `assigned_agent_id -> users(id) ON DELETE SET NULL`
  - `current_tenant_id -> tenants(id) ON DELETE SET NULL`
- **Data Types**: `monthly_rent` (NUMERIC 12,2), `amenities` (TEXT[]), `images` (TEXT[])

### 3. `tenants` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `user_id -> users(id) ON DELETE CASCADE` (Unique: 1-to-1)
  - `property_id -> properties(id) ON DELETE SET NULL`
- **Attributes**: Identity verification (Aadhaar / PAN), emergency contacts, employment details.

### 4. `rental_agreements` Table
- **Primary Key**: `id` (UUID v4)
- **Unique Constraints**: `agreement_number`
- **Foreign Keys**:
  - `property_id -> properties(id) ON DELETE CASCADE`
  - `owner_id -> users(id) ON DELETE CASCADE`
  - `tenant_id -> tenants(id) ON DELETE CASCADE`
  - `renewed_from_id -> rental_agreements(id) ON DELETE SET NULL` (Self-referencing for lease extensions)

### 5. `payments` Table (Razorpay & Invoicing)
- **Primary Key**: `id` (UUID v4)
- **Unique Constraints**: `invoice_number`
- **Foreign Keys**:
  - `agreement_id -> rental_agreements(id) ON DELETE CASCADE`
  - `property_id -> properties(id) ON DELETE CASCADE`
  - `tenant_id -> tenants(id) ON DELETE CASCADE`
- **Payment Gateways**: Razorpay (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`), UPI, Net Banking, Cards.

### 6. `maintenance_requests` Table
- **Primary Key**: `id` (UUID v4)
- **Unique Constraints**: `ticket_number`
- **Foreign Keys**:
  - `property_id -> properties(id) ON DELETE CASCADE`
  - `tenant_id -> tenants(id) ON DELETE CASCADE`
- **Attributes**: Category (Plumbing, Electrical, HVAC, etc.), priority, assigned technician, estimated & actual costs.

### 7. `expenses` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `property_id -> properties(id) ON DELETE CASCADE`
  - `created_by -> users(id) ON DELETE CASCADE`
- **Attributes**: Maintenance, utilities, property taxes, insurance, management fees.

### 8. `property_visits` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `property_id -> properties(id) ON DELETE CASCADE`
  - `agent_id -> users(id) ON DELETE SET NULL`
- **Attributes**: Prospective tenant walkthroughs, scheduling, and agent tour feedback.

### 9. `notifications` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `recipient_id -> users(id) ON DELETE CASCADE`
- **Attributes**: In-app notifications with JSON metadata for contextual redirection.

### 10. `activity_logs` Table
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**:
  - `user_id -> users(id) ON DELETE SET NULL`
- **Attributes**: Immutable audit logs capturing user actions, IP addresses, and mutated modules.

---

## 3. How to Execute

### Option A: Via Command Line (psql)
```bash
psql -U postgres -h localhost -d propertyhub -f server/src/database/schema.sql
psql -U postgres -h localhost -d propertyhub -f server/src/database/seed.sql
```

### Option B: Via Cloud SQL Editor (Neon / Supabase / Render / ElephantSQL)
1. Open the SQL Editor in your cloud dashboard.
2. Copy and paste the contents of [`server/src/database/schema.sql`](file:///c:/Users/dorab/OneDrive/Desktop/Mtech_KLU/fullstack%20web%20engineering/property%20management/server/src/database/schema.sql) and click **Run**.
3. Copy and paste [`server/src/database/seed.sql`](file:///c:/Users/dorab/OneDrive/Desktop/Mtech_KLU/fullstack%20web%20engineering/property%20management/server/src/database/seed.sql) and click **Run**.
