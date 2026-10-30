import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Tenant } from '../models/Tenant';
import { RentalAgreement } from '../models/RentalAgreement';
import { Payment } from '../models/Payment';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Expense } from '../models/Expense';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { PropertyVisit } from '../models/PropertyVisit';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Tenant.deleteMany({}),
      RentalAgreement.deleteMany({}),
      Payment.deleteMany({}),
      MaintenanceRequest.deleteMany({}),
      Expense.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
      PropertyVisit.deleteMany({}),
    ]);

    console.log('[Seed] Cleared existing records.');

    // 1. Create Demo Users
    const admin = new User({
      name: 'Anand Verma',
      email: 'admin@propertyhub.in',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      address: { street: 'MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    });
    await admin.save();

    const owner = new User({
      name: 'Rajesh Sharma',
      email: 'owner@propertyhub.in',
      password: 'Owner@123',
      role: 'PROPERTY_OWNER',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      address: { street: 'Jubilee Hills Road No. 36', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
    });
    await owner.save();

    const manager = new User({
      name: 'Pooja Mehta',
      email: 'manager@propertyhub.in',
      password: 'Manager@123',
      role: 'PROPERTY_MANAGER',
      phone: '+91 98222 33445',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      address: { street: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    });
    await manager.save();

    const agent = new User({
      name: 'Vikram Singh',
      email: 'agent@propertyhub.in',
      password: 'Agent@123',
      role: 'AGENT',
      phone: '+91 98333 44556',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      address: { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    });
    await agent.save();

    const tenantUser = new User({
      name: 'Aarav Patel',
      email: 'tenant@propertyhub.in',
      password: 'Tenant@123',
      role: 'TENANT',
      phone: '+91 98444 55667',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
      address: { street: 'Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
    });
    await tenantUser.save();

    const tenantUser2 = new User({
      name: 'Sneha Kulkarni',
      email: 'sneha@example.com',
      password: 'Password@123',
      role: 'TENANT',
      phone: '+91 98555 66778',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      address: { street: 'Hiranandani Estate', city: 'Thane', state: 'Maharashtra', pincode: '400607' },
    });
    await tenantUser2.save();

    console.log('[Seed] Users created successfully.');

    // 2. Create Properties
    const prop1 = await Property.create({
      title: 'Sobha Silicon Oasis 3BHK Luxury Flat',
      description: 'Ultra-luxurious 3-bedroom apartment facing the pool with Italian marble flooring, modular kitchen, and centralized AC.',
      propertyType: 'Apartment',
      ownerId: owner._id,
      managerId: manager._id,
      assignedAgentId: agent._id,
      address: 'Tower 4, 12th Floor, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      bedrooms: 3,
      bathrooms: 3,
      builtUpArea: 1850,
      furnishingStatus: 'Furnished',
      amenities: ['Gym', 'Swimming Pool', '24/7 Security', 'Clubhouse', 'Power Backup', 'Lift', 'Parking'],
      monthlyRent: 55000,
      securityDeposit: 250000,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      ],
      availabilityStatus: 'Occupied',
    });

    const prop2 = await Property.create({
      title: 'Prestige Lakeside Habitat Villa',
      description: 'Spacious independent 4BHK duplex villa with a private garden, EV charging point, and solar heating.',
      propertyType: 'Villa',
      ownerId: owner._id,
      managerId: manager._id,
      assignedAgentId: agent._id,
      address: 'Villa 42, Varthur - Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560087',
      bedrooms: 4,
      bathrooms: 4,
      builtUpArea: 3200,
      furnishingStatus: 'Semi-Furnished',
      amenities: ['Private Garden', 'Swimming Pool', 'Tennis Court', 'Power Backup', 'EV Charging', '24/7 Security'],
      monthlyRent: 95000,
      securityDeposit: 500000,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      ],
      availabilityStatus: 'Occupied',
    });

    const prop3 = await Property.create({
      title: 'Bandra Sea Breeze 2BHK Apartment',
      description: 'Sea-facing modern 2BHK with balcony in prime Bandra location near Bandstand. Fully furnished with designer interiors.',
      propertyType: 'Apartment',
      ownerId: owner._id,
      managerId: manager._id,
      assignedAgentId: agent._id,
      address: 'Perry Cross Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      bedrooms: 2,
      bathrooms: 2,
      builtUpArea: 1100,
      furnishingStatus: 'Furnished',
      amenities: ['Sea View', 'Lift', '24/7 Security', 'Modular Kitchen', 'Reserved Parking'],
      monthlyRent: 85000,
      securityDeposit: 300000,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      availabilityStatus: 'Available',
    });

    const prop4 = await Property.create({
      title: 'Cyber Towers Tech Park Commercial Office',
      description: 'Plug-and-play Grade-A commercial office space with 45 workstations, conference room, reception, and high-speed fiber.',
      propertyType: 'Office',
      ownerId: owner._id,
      managerId: manager._id,
      assignedAgentId: agent._id,
      address: '7th Floor, Mindspace IT Park, Hitec City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      bedrooms: 0,
      bathrooms: 3,
      builtUpArea: 2500,
      furnishingStatus: 'Furnished',
      amenities: ['Centralized AC', 'Cafeteria', 'Conference Room', '100% Power Backup', 'Visitor Parking', 'Fiber Internet'],
      monthlyRent: 120000,
      securityDeposit: 600000,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
      ],
      availabilityStatus: 'Available',
    });

    console.log('[Seed] Properties created successfully.');

    // 3. Create Tenants
    const tenant1 = await Tenant.create({
      userId: tenantUser._id,
      propertyId: prop1._id,
      emergencyContact: {
        name: 'Ramesh Patel',
        relationship: 'Father',
        phone: '+91 99887 76655',
      },
      employmentDetails: {
        employerName: 'Infosys BPM',
        designation: 'Senior Lead Engineer',
        monthlyIncome: 180000,
      },
      identityProof: {
        idType: 'Aadhaar',
        idNumber: 'XXXX-XXXX-7842',
        isVerified: true,
      },
      status: 'Active',
      leaseStartDate: new Date('2026-01-01'),
      leaseEndDate: new Date('2026-11-30'),
    });

    const tenant2 = await Tenant.create({
      userId: tenantUser2._id,
      propertyId: prop2._id,
      emergencyContact: {
        name: 'Sunil Kulkarni',
        relationship: 'Brother',
        phone: '+91 99112 23344',
      },
      employmentDetails: {
        employerName: 'Goldman Sachs India',
        designation: 'VP Finance',
        monthlyIncome: 320000,
      },
      identityProof: {
        idType: 'PAN',
        idNumber: 'ABCDE1234F',
        isVerified: true,
      },
      status: 'Active',
      leaseStartDate: new Date('2026-02-01'),
      leaseEndDate: new Date('2027-01-31'),
    });

    // Link tenant to properties
    prop1.currentTenantId = tenant1._id as any;
    await prop1.save();

    prop2.currentTenantId = tenant2._id as any;
    await prop2.save();

    console.log('[Seed] Tenants linked to properties.');

    // 4. Create Rental Agreements
    const agreement1 = await RentalAgreement.create({
      agreementNumber: 'AGR-2026-1001',
      propertyId: prop1._id,
      ownerId: owner._id,
      tenantId: tenant1._id,
      leaseStartDate: new Date('2026-01-01'),
      leaseEndDate: new Date('2026-11-30'),
      monthlyRent: 55000,
      securityDeposit: 250000,
      paymentDueDay: 5,
      agreementStatus: 'Active',
      termsAndConditions: 'Standard 11-month lease agreement. 2 months notice period required before vacation.',
    });

    const agreement2 = await RentalAgreement.create({
      agreementNumber: 'AGR-2026-1002',
      propertyId: prop2._id,
      ownerId: owner._id,
      tenantId: tenant2._id,
      leaseStartDate: new Date('2026-02-01'),
      leaseEndDate: new Date('2027-01-31'),
      monthlyRent: 95000,
      securityDeposit: 500000,
      paymentDueDay: 5,
      agreementStatus: 'Active',
      termsAndConditions: 'Villa tenancy contract with maintenance covenants.',
    });

    console.log('[Seed] Agreements generated.');

    // 5. Create Payments
    await Payment.create([
      {
        invoiceNumber: 'INV-2026-8801',
        agreementId: agreement1._id,
        propertyId: prop1._id,
        tenantId: tenant1._id,
        amount: 55000,
        paymentMonth: 'September 2026',
        dueDate: new Date('2026-09-05'),
        paidDate: new Date('2026-09-04'),
        paymentMethod: 'UPI',
        status: 'Paid',
        transactionReference: 'UPI/260904/873412',
        razorpayPaymentId: 'pay_sim_0987123',
        receiptNumber: 'RCP-8801',
      },
      {
        invoiceNumber: 'INV-2026-8802',
        agreementId: agreement1._id,
        propertyId: prop1._id,
        tenantId: tenant1._id,
        amount: 55000,
        paymentMonth: 'October 2026',
        dueDate: new Date('2026-10-05'),
        status: 'Pending',
        paymentMethod: 'Razorpay',
        notes: 'Monthly rent for October 2026 due on 5th',
      },
      {
        invoiceNumber: 'INV-2026-8803',
        agreementId: agreement2._id,
        propertyId: prop2._id,
        tenantId: tenant2._id,
        amount: 95000,
        paymentMonth: 'October 2026',
        dueDate: new Date('2026-10-05'),
        paidDate: new Date('2026-10-03'),
        paymentMethod: 'Net Banking',
        status: 'Paid',
        transactionReference: 'NEFT/HDFC/20261003/991',
        razorpayPaymentId: 'pay_sim_9912034',
        receiptNumber: 'RCP-8803',
      },
    ]);

    console.log('[Seed] Invoices and rent payments recorded.');

    // 6. Maintenance Requests
    await MaintenanceRequest.create([
      {
        ticketNumber: 'TKT-2026-4401',
        propertyId: prop1._id,
        tenantId: tenant1._id,
        category: 'Plumbing',
        priority: 'High',
        description: 'Master bathroom shower diverter is leaking water into the dry area.',
        status: 'Assigned',
        assignedTechnician: {
          name: 'Suresh Kumar Plumber',
          phone: '+91 97711 22334',
          assignedDate: new Date(),
        },
        estimatedCost: 1500,
        actualCost: 0,
      },
      {
        ticketNumber: 'TKT-2026-4402',
        propertyId: prop2._id,
        tenantId: tenant2._id,
        category: 'Electrical',
        priority: 'Medium',
        description: 'Living room inverter battery backup alert beep on heavy load.',
        status: 'Resolved',
        assignedTechnician: {
          name: 'Nitin Electricals',
          phone: '+91 96622 33445',
          assignedDate: new Date('2026-09-12'),
        },
        estimatedCost: 2500,
        actualCost: 2200,
        resolutionNotes: 'Replaced inverter relay and tightened terminal connections.',
        resolvedAt: new Date('2026-09-14'),
      },
    ]);

    // 7. Property Expenses
    await Expense.create([
      {
        propertyId: prop1._id,
        category: 'Maintenance',
        title: 'Apartment Society Maintenance Q3 2026',
        amount: 14500,
        expenseDate: new Date('2026-09-01'),
        paidTo: 'Sobha Silicon Oasis Apartment Association',
        paymentMethod: 'Net Banking',
        notes: 'Quarterly maintenance covering water, lifts, security, and clubhouse.',
        createdBy: owner._id,
      },
      {
        propertyId: prop2._id,
        category: 'Property Tax',
        title: 'BBMP Property Tax Assessment FY 2026-27',
        amount: 18200,
        expenseDate: new Date('2026-05-15'),
        paidTo: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
        paymentMethod: 'Net Banking',
        notes: 'Annual property tax payment for Villa 42',
        createdBy: owner._id,
      },
    ]);

    // 8. In-App Notifications
    await Notification.create([
      {
        recipientId: tenantUser._id,
        title: 'Rent Due Reminder',
        message: 'Your rent of ₹55,000 for October 2026 is due on 05-10-2026.',
        type: 'RENT_DUE',
        linkUrl: '/payments',
      },
      {
        recipientId: owner._id,
        title: 'Rent Collected',
        message: 'Sneha Kulkarni has successfully paid ₹95,000 for Prestige Lakeside Habitat Villa.',
        type: 'PAYMENT_SUCCESS',
        linkUrl: '/payments',
      },
      {
        recipientId: manager._id,
        title: 'New Maintenance Ticket',
        message: 'New Plumbing ticket TKT-2026-4401 raised for Sobha Silicon Oasis.',
        type: 'MAINTENANCE_UPDATE',
        linkUrl: '/maintenance',
      },
    ]);

    // 9. Property Visits
    await PropertyVisit.create([
      {
        propertyId: prop3._id,
        agentId: agent._id,
        visitorName: 'Rohan Mehra',
        visitorPhone: '+91 98989 89898',
        visitorEmail: 'rohan.mehra@gmail.com',
        visitDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        visitTime: '04:30 PM',
        status: 'Scheduled',
        feedback: 'Prospective tenant relocating to Mumbai next month.',
      },
    ]);

    // 10. Activity Logs
    await ActivityLog.create([
      {
        userId: admin._id,
        userName: admin.name,
        userRole: admin.role,
        action: 'SYSTEM_INITIALIZED',
        module: 'SYSTEM',
        details: 'PropertyHub platform initialized with full sample dataset.',
      },
    ]);

    console.log('[Seed] Database successfully populated with realistic Indian sample data!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// Self-executing runner if run directly via ts-node
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
