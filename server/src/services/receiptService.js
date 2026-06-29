const PDFDocument = require('pdfkit');

exports.generateReceiptPDF = (donation, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt_${donation.receiptId}.pdf`);

  // Pipe the PDF document directly to the response
  doc.pipe(res);

  // Styling and Content
  doc.fontSize(20).text('KindFund', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Donation Receipt', { align: 'center', underline: true });
  doc.moveDown(2);

  doc.fontSize(12);
  doc.text(`Receipt ID: ${donation.receiptId}`);
  doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  const donorName = donation.isAnonymous ? 'Anonymous Donor' : (donation.donor.name || 'Anonymous');
  doc.text(`Donor Name: ${donorName}`);
  
  // Handle case where campaign might not be fully populated but title exists
  const campaignTitle = typeof donation.campaign === 'object' ? donation.campaign.title : 'Campaign';
  doc.text(`Campaign: ${campaignTitle}`);
  doc.text(`Amount Donated: ${donation.amount}`);
  
  doc.moveDown(2);
  doc.text('Thank you for your generous support. Your contribution makes a difference.', { align: 'center' });

  // Disclaimer at the bottom
  doc.moveDown(4);
  doc.fontSize(10).fillColor('gray').text(
    '*** THIS IS A MOCK TRANSACTION ***\nKindFund is a demo platform. No real financial transactions were processed.',
    { align: 'center' }
  );

  doc.end();
};
