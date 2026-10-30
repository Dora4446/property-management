-- =====================================================================
-- PropertyHub - Smart Property Management System
-- PostgreSQL Relational Database Schema & Constraints
-- Currency: INR (₹) | Locale: India | UUID v4 Primary Keys
-- =====================================================================

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. USERS TABLE
-- Manages Admins, Property Owners, Property Managers, Agents, and Tenants
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'TENANT' 
        CHECK (role IN ('ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'AGENT', 'TENANT')),
    phone VARCHAR(30) NOT NULL,
    avatar TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    street VARCHAR(255) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    state VARCHAR(100) DEFAULT '',
    pincode VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =====================================================================
-- 2. PROPERTIES TABLE
-- Property listings with location, specs, rent, and owner/manager links
-- =====================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_type VARCHAR(50) NOT NULL 
        CHECK (property_type IN ('Apartment', 'House', 'Villa', 'Commercial', 'Office', 'Land')),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    bedrooms INT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    bathrooms INT NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
    built_up_area NUMERIC(10, 2) NOT NULL CHECK (built_up_area > 0), -- in sq ft
    furnishing_status VARCHAR(50) NOT NULL DEFAULT 'Semi-Furnished' 
        CHECK (furnishing_status IN ('Furnished', 'Semi-Furnished', 'Unfurnished')),
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    monthly_rent NUMERIC(12, 2) NOT NULL CHECK (monthly_rent >= 0), -- INR
    security_deposit NUMERIC(12, 2) NOT NULL CHECK (security_deposit >= 0), -- INR
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    availability_status VARCHAR(50) NOT NULL DEFAULT 'Available' 
        CHECK (availability_status IN ('Available', 'Occupied', 'Under Maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_manager_id ON properties(manager_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON properties(availability_status);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);

-- =====================================================================
-- 3. TENANTS TABLE
-- Resident profiles linked to a user account and assigned property
-- =====================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_relationship VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(30) NOT NULL,
    employer_name VARCHAR(255) DEFAULT '',
    designation VARCHAR(150) DEFAULT '',
    monthly_income NUMERIC(12, 2) DEFAULT 0 CHECK (monthly_income >= 0),
    id_type VARCHAR(50) DEFAULT 'Aadhaar' 
        CHECK (id_type IN ('Aadhaar', 'PAN', 'Passport', 'VoterID')),
    id_number VARCHAR(100) DEFAULT '',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' 
        CHECK (status IN ('Active', 'Inactive', 'Pending')),
    lease_start_date DATE,
    lease_end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Optional backlink on properties to current active tenant
ALTER TABLE properties 
    ADD COLUMN IF NOT EXISTS current_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_current_tenant ON properties(current_tenant_id);

-- =====================================================================
-- 4. RENTAL AGREEMENTS TABLE
-- Legal lease contracts between Owner, Tenant, and Property
-- =====================================================================
CREATE TABLE IF NOT EXISTS rental_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_number VARCHAR(100) UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent NUMERIC(12, 2) NOT NULL CHECK (monthly_rent >= 0),
    security_deposit NUMERIC(12, 2) NOT NULL CHECK (security_deposit >= 0),
    payment_due_day INT NOT NULL DEFAULT 5 CHECK (payment_due_day BETWEEN 1 AND 31),
    agreement_status VARCHAR(30) NOT NULL DEFAULT 'Active' 
        CHECK (agreement_status IN ('Draft', 'Active', 'Expired', 'Terminated')),
    terms_and_conditions TEXT DEFAULT 'Standard 11-month Indian residential tenancy agreement governed by state tenancy laws.',
    document_url TEXT DEFAULT '',
    renewed_from_id UUID REFERENCES rental_agreements(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agreements_number ON rental_agreements(agreement_number);
CREATE INDEX IF NOT EXISTS idx_agreements_property ON rental_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_agreements_tenant ON rental_agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agreements_owner ON rental_agreements(owner_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON rental_agreements(agreement_status);

-- =====================================================================
-- 5. PAYMENTS & INVOICES TABLE
-- Rent charges, Razorpay transaction data, UPI, Cards, Net Banking
-- =====================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    agreement_id UUID NOT NULL REFERENCES rental_agreements(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_month VARCHAR(50) NOT NULL, -- e.g., 'October 2026'
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    payment_method VARCHAR(50) DEFAULT 'Razorpay' 
        CHECK (payment_method IN ('Razorpay', 'UPI', 'Net Banking', 'Cash', 'Card')),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' 
        CHECK (status IN ('Paid', 'Pending', 'Overdue', 'Partially Paid')),
    transaction_reference VARCHAR(255) DEFAULT '',
    razorpay_order_id VARCHAR(255) DEFAULT '',
    razorpay_payment_id VARCHAR(255) DEFAULT '',
    razorpay_signature VARCHAR(255) DEFAULT '',
    receipt_number VARCHAR(100) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payments_agreement ON payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_property ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- =====================================================================
-- 6. MAINTENANCE REQUESTS TABLE
-- Repair tickets submitted by tenants and assigned to technicians
-- =====================================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL 
        CHECK (category IN ('Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Appliance', 'HVAC', 'Other')),
    priority VARCHAR(30) NOT NULL DEFAULT 'Medium' 
        CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    description TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(30) NOT NULL DEFAULT 'Open' 
        CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
    technician_name VARCHAR(150) DEFAULT '',
    technician_phone VARCHAR(30) DEFAULT '',
    technician_assigned_date TIMESTAMPTZ,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
    actual_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (actual_cost >= 0),
    resolution_notes TEXT DEFAULT '',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_ticket ON maintenance_requests(ticket_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);

-- =====================================================================
-- 7. EXPENSES TABLE
-- Property operational overhead (repairs, taxes, utilities, insurance)
-- =====================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL 
        CHECK (category IN ('Maintenance', 'Utility', 'Property Tax', 'Insurance', 'Management Fee', 'Legal & Compliance', 'Other')),
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    paid_to VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Net Banking',
    receipt_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- =====================================================================
-- 8. PROPERTY VISITS TABLE
-- Prospective tenant walkthroughs, scheduling, and agent tour feedback
-- =====================================================================
CREATE TABLE IF NOT EXISTS property_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    visitor_name VARCHAR(150) NOT NULL,
    visitor_phone VARCHAR(30) NOT NULL,
    visitor_email VARCHAR(255) DEFAULT '',
    visit_date DATE NOT NULL,
    visit_time VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled' 
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    feedback TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visits_property ON property_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_agent ON property_visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON property_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON property_visits(status);

-- =====================================================================
-- 9. NOTIFICATIONS TABLE
-- Real-time alerts for rent dues, renewals, tickets, and payment receipts
-- =====================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL' 
        CHECK (type IN (
            'RENT_DUE', 
            'PAYMENT_SUCCESS', 
            'LEASE_EXPIRY', 
            'LEASE_RENEWAL', 
            'MAINTENANCE_UPDATE', 
            'PROPERTY_ASSIGNED', 
            'NEW_TENANT', 
            'GENERAL'
        )),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT DEFAULT '',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- =====================================================================
-- 10. ACTIVITY LOGS TABLE
-- Audit trail for compliance, security events, logins, and mutations
-- =====================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) DEFAULT 'System',
    user_role VARCHAR(50) DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON activity_logs(module);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- Automatically updates updated_at timestamp upon every row modification
-- =====================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers across all mutable tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public' 
          AND table_name != 'activity_logs'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_update_%I_timestamp ON %I;
            CREATE TRIGGER trigger_update_%I_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;
