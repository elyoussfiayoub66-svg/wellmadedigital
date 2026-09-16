import QRCode from 'qrcode';

export const generateStyledPDF = async ({
  title,
  reference,
  date,
  dueDate,
  status,
  items,
  subtotal,
  discount,
  finalPrice,
  clientName,
  clientAddress,
  agencyName = 'wellmadedigitale',
  agencyEmail,
  agencyPhone,
  agencyAddress,
  bankName,
  rib
}) => {
  try {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Beige Background like the image
    doc.setFillColor(245, 242, 234); // #F5F2EA
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Setup colors
    const textColor = [20, 20, 20];
    const brandRed = [229, 30, 37]; // Red like INVOICE text in image

    // Add Logo (favicon)
    try {
      const getBase64Image = (url) => {
        return new Promise((resolve, reject) => {
          let img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = url;
        });
      };
      
      const logoBase64 = await getBase64Image('/assets/favicon.png'); // Try standard Next.js public/assets path
      doc.addImage(logoBase64, 'PNG', 14, 15, 10, 10);
      
      // Brand text
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text(agencyName.toLowerCase(), 26, 23);
    } catch(e) {
      console.error("Logo fetch failed", e);
      // Fallback
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text(agencyName.toUpperCase(), 14, 23);
    }

    // Top Right Title (INVOICE / PROJECT ESTIMATE)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandRed);
    doc.text(title.toUpperCase(), pageWidth - 14, 23, { align: 'right' });

    // Section 1: Agency & Contact
    let startY = 45;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text(agencyName, 14, startY);
    
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(agencyAddress || 'Casablanca, Morocco', 80);
    doc.text(addressLines, 14, startY + 5);

    doc.setFont("helvetica", "bold");
    doc.text("Contact", pageWidth / 2, startY);
    doc.setFont("helvetica", "normal");
    doc.text(agencyPhone || '+212 600 000 000', pageWidth / 2, startY + 5);
    doc.text(agencyEmail || 'hello@wellmadedigital.com', pageWidth / 2, startY + 10);

    startY += 20;

    // Separator line
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(14, startY, pageWidth - 14, startY);

    startY += 8;

    // Section 2: Amounts and Dates
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Due Amount", 14, startY);
    doc.text("Due Date", 70, startY);
    doc.text("Reference #", pageWidth / 2, startY);
    doc.text("Date", pageWidth - 14, startY, { align: 'right' });

    startY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${finalPrice.toLocaleString()} MAD`, 14, startY);
    doc.text(dueDate || 'Upon receipt', 70, startY);
    doc.text(reference, pageWidth / 2, startY);
    doc.text(date, pageWidth - 14, startY, { align: 'right' });

    startY += 8;
    
    // Separator line
    doc.line(14, startY, pageWidth - 14, startY);

    startY += 8;

    // Section 3: Invoice To
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice To", 14, startY);
    
    startY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "Client", 14, startY);
    if (clientAddress) {
      const cLines = doc.splitTextToSize(clientAddress, 80);
      doc.text(cLines, 14, startY + 5);
    }

    startY += 25;

    // Table
    autoTable(doc, {
      startY: startY,
      head: [['#', 'Desc. of Goods/Services', 'Qty.', 'Rate', 'Dis.', 'Total (MAD)']],
      body: items.map((it, idx) => [
        idx + 1,
        it.desc,
        it.qty > 0 ? it.qty : '-',
        it.rate > 0 ? it.rate.toLocaleString() : '-',
        it.discount || 0,
        it.total.toLocaleString()
      ]),
      theme: 'plain',
      styles: {
        fillColor: false,
        textColor: 20,
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fontStyle: 'bold',
        textColor: 20,
        lineWidth: { bottom: 0.3 },
        lineColor: 0
      },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.row.index === items.length - 1) {
          data.cell.styles.lineWidth = { bottom: 0.3 };
          data.cell.styles.lineColor = 0;
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Totals section (right side)
    const rightColX = pageWidth - 60;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Sub Total", rightColX, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`${subtotal.toLocaleString()} MAD`, pageWidth - 14, finalY, { align: 'right' });

    if (discount > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Discount", rightColX, finalY + 7);
      doc.setFont("helvetica", "normal");
      doc.text(`-${discount.toLocaleString()} MAD`, pageWidth - 14, finalY + 7, { align: 'right' });
    }

    // Grand Total
    const totalY = finalY + (discount > 0 ? 14 : 7);
    doc.setLineWidth(0.3);
    doc.line(rightColX, totalY - 4, pageWidth - 14, totalY - 4);
    
    doc.setFont("helvetica", "bold");
    doc.text("Total", rightColX, totalY + 2);
    doc.text(`${finalPrice.toLocaleString()} MAD`, pageWidth - 14, totalY + 2, { align: 'right' });
    
    doc.line(rightColX, totalY + 6, pageWidth - 14, totalY + 6);

    // Payment Method (Left side)
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Bank Transfer", 14, finalY + 5);

    // Signatures
    let signY = totalY + 30;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Accepted By", 14, signY);
    doc.text("Signature", pageWidth - 60, signY);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "Client", 14, signY + 4);
    doc.text(agencyName, pageWidth - 60, signY + 4);

    // Footer - Bank Details & QR Code
    let footerY = pageHeight - 45;
    
    doc.line(14, footerY, pageWidth - 14, footerY);
    
    footerY += 5;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Info", 14, footerY + 3);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Bank Name", 14, footerY + 10);
    doc.text("RIB / IBAN", 14, footerY + 15);
    
    doc.setFont("helvetica", "normal");
    doc.text(bankName || "CIH Bank", 45, footerY + 10);
    doc.text(rib || "000000000000000000000000", 45, footerY + 15);

    // Generate QR Code containing payment info
    const qrData = `PAYMENT INFO\nAgency: ${agencyName}\nBank: ${bankName || "N/A"}\nRIB: ${rib || "N/A"}\nAmount: ${finalPrice} MAD`;
    const qrDataUrl = await QRCode.toDataURL(qrData, { 
      width: 80, 
      margin: 0,
      color: { dark: '#141414', light: '#F5F2EA' } 
    });
    
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 45, footerY + 2, 28, 28);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(`Name: ${agencyName}`, pageWidth - 45, footerY + 34);

    // Save
    doc.save(`${title.replace(/\s+/g, '_')}_${reference}.pdf`);
  } catch (err) {
    console.error("Error generating styled PDF:", err);
    throw err;
  }
};
