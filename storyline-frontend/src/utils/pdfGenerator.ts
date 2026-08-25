import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert image URL to Base64 to embed in PDF
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.addEventListener('error', (err) => reject(err));
    reader.readAsDataURL(blob);
  });
};

export const generateQuotationPdf = async (quotation: any, clientName: string) => {
  const doc = new jsPDF();
  const primaryColor = '#6366F1'; // Indigo-500
  
  // Load Logo
  try {
    const logoBase64 = await getBase64ImageFromUrl('/pwa-512x512.png');
    // Add logo (x, y, width, height)
    doc.addImage(logoBase64, 'PNG', 14, 15, 30, 30);
  } catch (error) {
    console.error('Failed to load logo for PDF', error);
  }

  // Header Text
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text('QUOTATION', 140, 25);
  
  doc.setFontSize(10);
  doc.setTextColor('#333333');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 32);
  doc.text(`Quote No: ${quotation.quoteNumber || 'DRAFT'}`, 140, 38);
  doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 140, 44);

  // Company Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Storyline Events', 14, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Pune, Maharashtra', 14, 61);
  doc.text('Phone: +91 9518780272', 14, 67);
  doc.text('Email: info@storyline.com', 14, 73);

  // Client Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Quotation For:', 140, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${clientName}`, 140, 61);
  doc.text(`Event: ${quotation.eventName}`, 140, 67);
  if (quotation.eventDate) doc.text(`Event Date: ${quotation.eventDate}`, 140, 73);
  if (quotation.venue) doc.text(`Venue: ${quotation.venue}`, 140, 79);

  // Items Table
  const tableData = quotation.items.map((item: any, index: number) => [
    index + 1,
    item.description,
    item.quantity,
    `Rs ${item.unitPrice.toLocaleString()}`,
    `${item.taxPercent || 0}%`,
    `Rs ${((item.quantity * item.unitPrice) * (1 + (item.taxPercent || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: 90,
    headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
    bodyStyles: { textColor: '#333333' },
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Tax', 'Total']],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 40, halign: 'right' },
    },
  });

  // Calculate Totals using autoTable finalY
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const subtotal = quotation.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const tax = quotation.items.reduce((acc: number, item: any) => acc + ((item.quantity * item.unitPrice) * (item.taxPercent || 0) / 100), 0);
  const grandTotal = subtotal + tax - (quotation.discountAmount || 0);

  doc.text('Subtotal:', 140, finalY);
  doc.text(`Rs ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });
  
  doc.text('Tax:', 140, finalY + 6);
  doc.text(`Rs ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 6, { align: 'right' });
  
  if (quotation.discountAmount > 0) {
    doc.text('Discount:', 140, finalY + 12);
    doc.text(`- Rs ${quotation.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 12, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const totalY = quotation.discountAmount > 0 ? finalY + 20 : finalY + 14;
  doc.text('Grand Total:', 140, totalY);
  doc.text(`Rs ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, totalY, { align: 'right' });

  // Footer / Terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#777777');
  const footerY = 270;
  doc.text('Terms & Conditions', 14, footerY);
  doc.text('1. 50% advance payment required to confirm the booking.', 14, footerY + 6);
  doc.text('2. Balance 50% to be cleared 2 days prior to the event.', 14, footerY + 12);
  doc.text('3. Quotation is valid for 30 days from the date of issue.', 14, footerY + 18);
  
  doc.text('Authorized Signature', 160, footerY + 12);
  doc.line(155, footerY + 14, 195, footerY + 14);

  return doc;
};
