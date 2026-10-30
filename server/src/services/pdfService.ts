import PDFDocument from 'pdfkit';
import { IPayment } from '../models/Payment';

export const createReceiptPDF = (payment: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Banner
      doc.rect(0, 0, 612, 110).fill('#0f172a');

      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold')
        .text('PROPERTYHUB', 50, 35);
      doc.fontSize(10).font('Helvetica')
        .text('Smart Property Management System (India)', 50, 65);
      doc.fontSize(10).fillColor('#2dd4bf')
        .text('OFFICIAL RENT RECEIPT', 400, 45, { align: 'right' });

      // Invoice info block
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
        .text(`Receipt No: ${payment.receiptNumber || payment.invoiceNumber}`, 50, 130);
      doc.font('Helvetica').fontSize(10).fillColor('#64748b')
        .text(`Invoice Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`, 50, 145);
      doc.text(`Payment Date: ${payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN') : 'N/A'}`, 50, 160);

      doc.font('Helvetica-Bold').fillColor('#0f172a')
        .text(`Payment Status: ${payment.status.toUpperCase()}`, 350, 130, { align: 'right' });
      doc.font('Helvetica').fontSize(10).fillColor('#64748b')
        .text(`Rent Period: ${payment.paymentMonth}`, 350, 145, { align: 'right' });
      doc.text(`Txn Ref: ${payment.transactionReference || payment.razorpayPaymentId || 'N/A'}`, 350, 160, { align: 'right' });

      doc.moveTo(50, 185).lineTo(545, 185).stroke('#e2e8f0');

      // Tenant & Property Details
      const tenantUser = payment.tenantId?.userId || {};
      const property = payment.propertyId || {};
      const ownerUser = property.ownerId || {};

      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('TENANT DETAILS', 50, 200);
      doc.font('Helvetica').fontSize(10).fillColor('#334155')
        .text(`Name: ${tenantUser.name || 'Tenant'}`, 50, 220)
        .text(`Email: ${tenantUser.email || 'N/A'}`, 50, 235)
        .text(`Phone: ${tenantUser.phone || 'N/A'}`, 50, 250);

      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('PROPERTY DETAILS', 300, 200);
      doc.font('Helvetica').fontSize(10).fillColor('#334155')
        .text(`Property: ${property.title || 'Rental Unit'}`, 300, 220)
        .text(`Address: ${property.address || ''}, ${property.city || ''}`, 300, 235)
        .text(`Landlord: ${ownerUser.name || 'Property Owner'}`, 300, 250);

      // Line items table
      doc.rect(50, 290, 495, 30).fill('#f1f5f9');
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
        .text('DESCRIPTION', 60, 300)
        .text('PERIOD', 250, 300)
        .text('PAYMENT MODE', 370, 300)
        .text('AMOUNT (INR)', 460, 300);

      doc.rect(50, 320, 495, 45).fill('#ffffff').stroke('#e2e8f0');
      doc.fillColor('#1e293b').font('Helvetica').fontSize(10)
        .text('Residential Monthly Rent', 60, 335)
        .text(payment.paymentMonth, 250, 335)
        .text(payment.paymentMethod || 'Razorpay / UPI', 370, 335)
        .font('Helvetica-Bold')
        .text(`Rs. ${payment.amount.toLocaleString('en-IN')}`, 460, 335);

      // Total summary box
      doc.rect(330, 380, 215, 60).fill('#f8fafc').stroke('#cbd5e1');
      doc.fillColor('#475569').font('Helvetica').fontSize(11)
        .text('Total Amount Received:', 340, 395);
      doc.fillColor('#0f766e').font('Helvetica-Bold').fontSize(16)
        .text(`Rs. ${payment.amount.toLocaleString('en-IN')}/-`, 340, 415);

      // Footer notice
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
        .text(
          'This is a computer-generated tax-compliant digital rent receipt issued by PropertyHub. No signature is required.',
          50,
          720,
          { align: 'center', width: 495 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
