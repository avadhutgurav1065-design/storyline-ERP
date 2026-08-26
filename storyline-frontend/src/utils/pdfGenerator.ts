import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert image URL to Base64 to embed in PDF
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // We want a perfect circle, so we take the minimum dimension
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      
      // Create a circular clipping mask
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Draw the image centered
      const xOffset = (img.width - size) / 2;
      const yOffset = (img.height - size) / 2;
      ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);
      
      // Export as PNG (which supports transparency for the cropped corners)
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
};

export const generateQuotationPdf = async (quotation: any, clientName: string) => {
  const doc = new jsPDF();
  const primaryColor = '#C19A88'; // Slightly darker accent color for text
  
  // Page Background (Perfect match for the logo edges #E8C9BD)
  doc.setFillColor('#E8C9BD');
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

  // Stylish top border accent
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 6, 'F');

  // Load Logo
  try {
    const logoBase64 = await getBase64ImageFromUrl('/logo.jpg');
    // Add logo (now pre-cropped as a circular PNG)
    doc.addImage(logoBase64, 'PNG', 14, 15, 35, 35);
  } catch (error) {
    console.error('Failed to load logo for PDF', error);
  }

  // Header Text
  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.text('QUOTATION', 195, 28, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor('#555555');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 195, 36, { align: 'right' });
  doc.text(`Quote No: ${quotation.quoteNumber || 'DRAFT'}`, 195, 42, { align: 'right' });
  doc.text(`Valid Until: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}`, 195, 48, { align: 'right' });

  // Company Info (Right below logo)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#333333');
  doc.text('Storyline Design and Events', 14, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#777777');
  doc.text('Pune, Maharashtra', 14, 66);
  doc.text('Phone: +91 9518780272, 9307195947', 14, 72);
  doc.text('Email: storylinedesignandevents@gmail.com', 14, 78);

  // Client Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#333333');
  doc.text('Quotation For:', 130, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#555555');
  doc.text(`Client: ${clientName}`, 130, 66);
  doc.text(`Event: ${quotation.eventName}`, 130, 72);
  if (quotation.eventDate) doc.text(`Event Date: ${quotation.eventDate}`, 130, 78);
  if (quotation.venue) doc.text(`Venue: ${quotation.venue}`, 130, 84);

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
    startY: 95,
    headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
    bodyStyles: { fillColor: '#FFFFFF', textColor: '#333333' },
    alternateRowStyles: { fillColor: '#FAFAFA' },
    head: [[
      { content: '#', styles: { halign: 'left' } },
      { content: 'Description', styles: { halign: 'left' } },
      { content: 'Qty', styles: { halign: 'center' } },
      { content: 'Unit Price', styles: { halign: 'right' } },
      { content: 'Tax', styles: { halign: 'center' } },
      { content: 'Total', styles: { halign: 'right' } }
    ]],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 10, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 40, halign: 'right' },
    },
  });

  // Calculate Totals using autoTable finalY
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const subtotal = quotation.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const tax = quotation.items.reduce((acc: number, item: any) => acc + ((item.quantity * item.unitPrice) * (item.taxPercent || 0) / 100), 0);
  const grandTotal = subtotal + tax - (quotation.discountAmount || 0);

  doc.setTextColor('#555555');
  doc.text('Subtotal:', 140, finalY);
  doc.text(`Rs ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });
  
  doc.text('Tax:', 140, finalY + 6);
  doc.text(`Rs ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 6, { align: 'right' });
  
  if (quotation.discountAmount > 0) {
    doc.text('Discount:', 140, finalY + 12);
    doc.text(`- Rs ${quotation.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, finalY + 12, { align: 'right' });
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  const totalY = finalY + (quotation.discountAmount > 0 ? 20 : 14);
  doc.text('Grand Total:', 125, totalY);
  doc.text(`Rs ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 195, totalY, { align: 'right' });

  // Terms and Conditions
  const termsY = totalY + 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('Terms & Conditions:', 14, termsY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#777777');
  const termsText = [
    "1. This is an estimation, not a final quotation. Prices may increase or decrease according to client requirements.",
    "2. 50% advance payment is compulsory to confirm the booking.",
    "3. 25% payment is due at the time of execution.",
    "4. Remaining 25% payment is due immediately after execution."
  ];
  doc.text(termsText, 14, termsY + 6);

  doc.setFontSize(10);
  doc.setTextColor('#333333');
  doc.text('Authorized Signature', 160, 275);
  doc.line(155, 270, 195, 270);

  // Bottom Border Accent
  doc.setFillColor(primaryColor);
  doc.rect(0, doc.internal.pageSize.getHeight() - 6, doc.internal.pageSize.getWidth(), 6, 'F');

  return doc;
};
