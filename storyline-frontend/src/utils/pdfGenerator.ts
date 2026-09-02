import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert image URL to Base64 to embed in PDF
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
};

export const generateQuotationPdf = async (quotation: any, clientName: string) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ─── Colour Palette ────────────────────────────────────────────────────────
  const bgColor      = '#F5F0EB';   // Warm cream pastel background
  const accentColor  = '#8B6F5E';   // Warm brown accent (readable on cream)
  const accentLight  = '#D4B8A8';   // Soft muted rose for dividers
  const headBg       = '#6B5347';   // Deep warm brown – table header
  const textDark     = '#2C2217';   // Near-black for main text
  const textMid      = '#5C4A3A';   // Mid-brown for secondary text
  const textLight    = '#8B7A6B';   // Light brown for captions/labels
  const rowAlt       = '#EDE6DF';   // Slightly darker cream for alternate rows

  // ─── Page Background ───────────────────────────────────────────────────────
  doc.setFillColor(bgColor);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ─── Top accent bar ────────────────────────────────────────────────────────
  doc.setFillColor(headBg);
  doc.rect(0, 0, pageW, 8, 'F');

  // Thin gold line below header bar
  doc.setFillColor(accentLight);
  doc.rect(0, 8, pageW, 1.5, 'F');

  // ─── Logo (pwa-192x192.png) ────────────────────────────────────────────────
  try {
    const logoBase64 = await getBase64ImageFromUrl('/pwa-192x192.png');
    // Square logo with rounded feel — no circular crop
    doc.addImage(logoBase64, 'PNG', 12, 14, 36, 36);
  } catch (error) {
    console.error('Failed to load logo for PDF', error);
  }

  // ─── QUOTATION title (right side) ─────────────────────────────────────────
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headBg);
  doc.text('QUOTATION', pageW - 14, 26, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMid);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, 34, { align: 'right' });
  doc.text(`Quote No: ${quotation.quoteNumber || 'DRAFT'}`, pageW - 14, 40, { align: 'right' });
  doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`, pageW - 14, 46, { align: 'right' });

  // ─── Horizontal divider ────────────────────────────────────────────────────
  doc.setDrawColor(accentLight);
  doc.setLineWidth(0.5);
  doc.line(12, 55, pageW - 12, 55);

  // ─── Company Info (left) ───────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark);
  doc.text('Storyline Design and Events', 12, 63);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMid);
  doc.text('Pune, Maharashtra', 12, 69);
  doc.text('Phone: +91 9518780272  |  9307195947', 12, 75);
  doc.text('Email: storylinedesignandevents@gmail.com', 12, 81);

  // ─── Client Info (right) ──────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor);
  doc.text('BILL TO', 130, 63);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark);
  doc.text(clientName, 130, 69);

  doc.setTextColor(textMid);
  doc.text(`Event: ${quotation.eventName || '—'}`, 130, 75);
  if (quotation.eventDate) doc.text(`Event Date: ${quotation.eventDate}`, 130, 81);
  if (quotation.venue)     doc.text(`Venue: ${quotation.venue}`, 130, 87);

  // ─── Items Table ───────────────────────────────────────────────────────────
  const tableData = quotation.items.map((item: any, index: number) => [
    index + 1,
    item.description,
    item.quantity,
    `Rs ${item.unitPrice.toLocaleString('en-IN')}`,
    `${item.taxPercent || 0}%`,
    `Rs ${((item.quantity * item.unitPrice) * (1 + (item.taxPercent || 0) / 100))
      .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: 95,
    headStyles: {
      fillColor: headBg,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: '#FDFAF7',
      textColor: textDark,
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: rowAlt },
    head: [[
      { content: '#',           styles: { halign: 'center' } },
      { content: 'Description', styles: { halign: 'left'   } },
      { content: 'Qty',         styles: { halign: 'center' } },
      { content: 'Unit Price',  styles: { halign: 'right'  } },
      { content: 'Tax',         styles: { halign: 'center' } },
      { content: 'Total',       styles: { halign: 'right'  } },
    ]],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 38, halign: 'right' },
    },
  });

  // ─── Totals ────────────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const subtotal    = quotation.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const tax         = quotation.items.reduce((acc: number, item: any) => acc + ((item.quantity * item.unitPrice) * (item.taxPercent || 0) / 100), 0);
  const grandTotal  = subtotal + tax - (quotation.discountAmount || 0);

  // Totals box background
  doc.setFillColor('#EDE3DA');
  doc.roundedRect(120, finalY - 4, pageW - 132, quotation.discountAmount > 0 ? 36 : 29, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMid);
  doc.text('Subtotal:', 130, finalY + 2);
  doc.text(`Rs ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY + 2, { align: 'right' });

  doc.text('GST / Tax:', 130, finalY + 9);
  doc.text(`Rs ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY + 9, { align: 'right' });

  let grandY = finalY + 16;
  if (quotation.discountAmount > 0) {
    doc.setTextColor('#B85C38');
    doc.text('Discount:', 130, finalY + 16);
    doc.text(`- Rs ${quotation.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, finalY + 16, { align: 'right' });
    grandY = finalY + 23;
  }

  // Grand Total line
  doc.setDrawColor(accentLight);
  doc.setLineWidth(0.4);
  doc.line(122, grandY - 2, pageW - 14, grandY - 2);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headBg);
  doc.text('GRAND TOTAL:', 130, grandY + 5);
  doc.text(`Rs ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageW - 14, grandY + 5, { align: 'right' });

  // ─── Terms & Conditions ────────────────────────────────────────────────────
  const termsY = grandY + 22;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor);
  doc.text('Terms & Conditions:', 12, termsY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textLight);
  const termsText = [
    '1. This is an estimation, not a final quotation. Prices may vary as per client requirements.',
    '2. 50% advance payment is compulsory to confirm the booking.',
    '3. 25% payment is due at the time of execution.',
    '4. Remaining 25% payment is due immediately after execution.',
  ];
  doc.text(termsText, 12, termsY + 7);

  // ─── Signature ─────────────────────────────────────────────────────────────
  doc.setDrawColor(accentLight);
  doc.setLineWidth(0.4);
  doc.line(140, pageH - 28, pageW - 14, pageH - 28);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMid);
  doc.text('Authorized Signature', (140 + pageW - 14) / 2, pageH - 22, { align: 'center' });
  doc.text('Storyline Design and Events', (140 + pageW - 14) / 2, pageH - 16, { align: 'center' });

  // ─── Bottom accent bar ─────────────────────────────────────────────────────
  doc.setFillColor(headBg);
  doc.rect(0, pageH - 8, pageW, 8, 'F');
  doc.setFillColor(accentLight);
  doc.rect(0, pageH - 9.5, pageW, 1.5, 'F');

  // Footer text centered in bottom bar
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#FFFFFF');
  doc.text('Thank you for choosing Storyline Design and Events!', pageW / 2, pageH - 3, { align: 'center' });

  return doc;
};
