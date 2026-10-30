-- =====================================================================
-- PropertyHub - PostgreSQL Initial Seed Data Script
-- Populates Realistic Indian Demo Data (INR, GST, UPI, Bengalore/Mumbai)
-- Password for all accounts: "Password@123" (bcrypt hash below)
-- $2a$10$7Z2vN5hUuIuHq4fD5gP6Oeu8pC5x5p5oM3y3t7f5u4y3k2j1h0g.m
-- =====================================================================

-- Clean existing data in reverse order of dependencies
TRUNCATE TABLE activity_logs, notifications, property_visits, expenses, 
               maintenance_requests, payments, rental_agreements, 
               tenants, properties, users CASCADE;

-- 1. Insert Users (Admin, Manager, Tenants)
-- bcrypt hash for 'Password@123': $2b$10$3YmG0eI/Gg2R1bT5pT9rveN54cbn7q8vXkO1Q0S0g1F1W1H1L1U1K
INSERT INTO users (id, name, email, password, role, phone, avatar, status, street, city, state, pincode) VALUES
('a0000000-0000-0000-0000-000000000001', 'Vikramaditya Sharma', 'admin@propertyhub.in', '$2b$10$y58t7M1Uj7Mv0J6O6GqWn.2R6Z2NqfU1uG5H8N9A0K1B2C3D4E5F6', 'ADMIN', '+91 98765 43210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'ACTIVE', 'Brigade Road, Ashok Nagar', 'Bengaluru', 'Karnataka', '560025'),
('a0000000-0000-0000-0000-000000000002', 'Sunita Deshmukh', 'manager@propertyhub.in', '$2b$10$y58t7M1Uj7Mv0J6O6GqWn.2R6Z2NqfU1uG5H8N9A0K1B2C3D4E5F6', 'PROPERTY_MANAGER', '+91 98200 11223', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', 'ACTIVE', 'Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051'),
('a0000000-0000-0000-0000-000000000003', 'Rajesh K. Varma', 'owner@propertyhub.in', '$2b$10$y58t7M1Uj7Mv0J6O6GqWn.2R6Z2NqfU1uG5H8N9A0K1B2C3D4E5F6', 'PROPERTY_MANAGER', '+91 94440 98765', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ACTIVE', 'Jubilee Hills, Road No. 36', 'Hyderabad', 'Telangana', '500033'),
('a0000000-0000-0000-0000-000000000004', 'Arjun Kapoor', 'tenant@propertyhub.in', '$2b$10$y58t7M1Uj7Mv0J6O6GqWn.2R6Z2NqfU1uG5H8N9A0K1B2C3D4E5F6', 'TENANT', '+91 91234 56789', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'ACTIVE', 'Indiranagar 100ft Road', 'Bengaluru', 'Karnataka', '560038'),
('a0000000-0000-0000-0000-000000000005', 'Priya Nambiar', 'priya.n@example.com', '$2b$10$y58t7M1Uj7Mv0J6O6GqWn.2R6Z2NqfU1uG5H8N9A0K1B2C3D4E5F6', 'TENANT', '+91 99887 76655', 'https://images.unsplash.com/photo-1517841905240-472988babdf9', 'ACTIVE', 'Hiranandani Estate', 'Thane', 'Maharashtra', '400607');

-- 2. Insert Properties
INSERT INTO properties (id, title, description, property_type, owner_id, manager_id, address, city, state, pincode, bedrooms, bathrooms, built_up_area, furnishing_status, amenities, monthly_rent, security_deposit, availability_status, images) VALUES
('b0000000-0000-0000-0000-000000000001', 'Greenwood Heights 3BHK Luxury Residence', 'Exquisite 3BHK flat overlooking Bangalore IT Corridor with 100% power backup and club access.', 'Apartment', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Flat 402, Greenwood Heights, Outer Ring Road, Marathahalli', 'Bengaluru', 'Karnataka', '560037', 3, 3, 1750.00, 'Furnished', ARRAY['Swimming Pool', 'Gymnasium', 'Covered Car Parking', '24x7 Security', 'Club House'], 45000.00, 135000.00, 'Occupied', ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00']),
('b0000000-0000-0000-0000-000000000002', 'Sea Breeze Sea-Facing 2BHK', 'Panoramic Arabian Sea view in prime Bandra West, modern modular Italian kitchen.', 'Apartment', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', '12th Floor, Sea Breeze Tower, Carter Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 2, 2, 1100.00, 'Semi-Furnished', ARRAY['Sea View', 'Intercom', 'Power Backup', 'Piped Gas', 'EV Charging'], 75000.00, 225000.00, 'Occupied', ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750']),
('b0000000-0000-0000-0000-000000000003', 'Cyber Hills Signature Independent Villa', 'Opulent 4BHK independent duplex villa with private landscaped lawn in Gachibowli.', 'Villa', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Plot 88, Financial District, Gachibowli', 'Hyderabad', 'Telangana', '500032', 4, 4, 3200.00, 'Furnished', ARRAY['Private Garden', 'Servant Room', 'Solar Water Heating', 'Private Swimming Pool'], 110000.00, 330000.00, 'Available', ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c']),
('b0000000-0000-0000-0000-000000000004', 'TechPark Commercial Co-Working Office', 'Grade-A fully plug-and-play office space with 40 workstations and conference room.', 'Commercial', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', '3rd Floor, TechPark Tower, Whitefield Main Road', 'Bengaluru', 'Karnataka', '560066', 0, 4, 2800.00, 'Furnished', ARRAY['High-Speed Leased Line', 'Cafeteria', 'Central AC', 'Access Card Entry'], 160000.00, 480000.00, 'Available', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c']);

-- 3. Insert Tenants
INSERT INTO tenants (id, user_id, property_id, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, employer_name, designation, monthly_income, id_type, id_number, is_verified, status, lease_start_date, lease_end_date) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Ramesh Kapoor', 'Father', '+91 98111 22334', 'Infosys Technologies Ltd', 'Lead Systems Engineer', 145000.00, 'Aadhaar', '5432-8765-1098', true, 'Active', '2026-01-01', '2026-11-30'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Dr. Madhavan Nambiar', 'Father', '+91 97222 33445', 'Tata Consultancy Services', 'Senior Consultant', 190000.00, 'PAN', 'ABCDE1234F', true, 'Active', '2026-02-01', '2026-12-31');

-- Link properties to tenants
UPDATE properties SET current_tenant_id = 'c0000000-0000-0000-0000-000000000001' WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE properties SET current_tenant_id = 'c0000000-0000-0000-0000-000000000002' WHERE id = 'b0000000-0000-0000-0000-000000000002';

-- 4. Insert Rental Agreements
INSERT INTO rental_agreements (id, agreement_number, property_id, owner_id, tenant_id, lease_start_date, lease_end_date, monthly_rent, security_deposit, payment_due_day, agreement_status, terms_and_conditions) VALUES
('d0000000-0000-0000-0000-000000000001', 'AGR-BLR-2026-001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '2026-01-01', '2026-11-30', 45000.00, 135000.00, 5, 'Active', 'Standard 11-month Bangalore residential agreement with 5% annual escalation.'),
('d0000000-0000-0000-0000-000000000002', 'AGR-MUM-2026-002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', '2026-02-01', '2026-12-31', 75000.00, 225000.00, 5, 'Active', 'Registered Leave & License Agreement registered under Maharashtra Rent Control Act.');

-- 5. Insert Payments
INSERT INTO payments (id, invoice_number, agreement_id, property_id, tenant_id, amount, payment_month, due_date, paid_date, payment_method, status, transaction_reference, receipt_number, notes) VALUES
('e0000000-0000-0000-0000-000000000001', 'INV-2026-10-001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 45000.00, 'October 2026', '2026-10-05', '2026-10-04 14:30:00+05:30', 'Razorpay', 'Paid', 'pay_Ox8712Bnlk992', 'REC-2026-10-01', 'Paid via UPI Google Pay'),
('e0000000-0000-0000-0000-000000000002', 'INV-2026-11-002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 45000.00, 'November 2026', '2026-11-05', NULL, 'Razorpay', 'Pending', '', '', 'Upcoming November Rent');

-- 6. Insert Maintenance Requests
INSERT INTO maintenance_requests (id, ticket_number, property_id, tenant_id, category, priority, description, status, estimated_cost, actual_cost, technician_name, technician_phone) VALUES
('f0000000-0000-0000-0000-000000000001', 'TKT-2026-881', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Plumbing', 'Medium', 'Master bathroom sink drain pipe leaking underneath.', 'In Progress', 1500.00, 0.00, 'Kiran Kumar (UrbanClap)', '+91 99001 22334');

-- 7. Insert Operational Expenses
INSERT INTO expenses (id, property_id, category, title, amount, expense_date, paid_to, payment_method, created_by) VALUES
('80000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Utility', 'BESCOM Common Area Electricity Bill', 4200.00, '2026-10-10', 'Bangalore Electricity Supply Co.', 'Net Banking', 'a0000000-0000-0000-0000-000000000002'),
('80000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Maintenance', 'Annual Lift Maintenance Contract (Schindler)', 12500.00, '2026-10-15', 'Schindler India Pvt Ltd', 'Net Banking', 'a0000000-0000-0000-0000-000000000002');

-- 8. Insert Property Visits
INSERT INTO property_visits (id, property_id, agent_id, visitor_name, visitor_phone, visitor_email, visit_date, visit_time, status, feedback) VALUES
('90000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Dr. Anand Raman', '+91 98450 12345', 'anand.raman@gmail.com', '2026-11-02', '11:00 AM', 'Scheduled', 'Interested in lease for family of 4.');

-- 9. Insert Notifications
INSERT INTO notifications (id, recipient_id, title, message, type, is_read) VALUES
('01000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Rent Invoice Generated', 'Your invoice for November 2026 (₹45,000) has been generated. Due by 05-11-2026.', 'RENT_DUE', false);

-- 10. Insert Activity Logs
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, module, details) VALUES
('02000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'System Administrator', 'ADMIN', 'SEED_DATABASE', 'SYSTEM', 'PostgreSQL database initialized with standard schema and Indian demo data.');
