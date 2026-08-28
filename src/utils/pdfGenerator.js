import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BANK_DETAILS, TERMS_AND_CONDITIONS, LOGO_BASE64, STAMP_BASE64 } from '../config/constants';

// Helper to convert number to words (Indian Numbering System)
const numberToWords = (num) => {
  const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  
  if (num === 0) return 'ZERO RUPEES ONLY';
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'OVERFLOW';
  
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'RUPEES ONLY' : 'RUPEES ONLY';
  
  return str.trim();
};

export default function generatePDF(data, isPreview = false) {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // -- 1. HEADER --
  // Logo
  if (LOGO_BASE64) {
    doc.addImage(LOGO_BASE64, 'PNG', 40, 30, 95, 50);
  }
  
  // Company Title & Address
  doc.setTextColor(0, 32, 96);
  doc.setFontSize(22);
  doc.text("AMJ ENTERPRISES", pageWidth / 2, 50, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("#146/1 & 146/2, SITE NO 201, KINGSTONCOUNTY,", pageWidth / 2, 65, { align: 'center' });
  doc.text("YARAPPANAHALLI VILLAGE, BIDARAHALLI HOBLI, BANGALORE-562149", pageWidth / 2, 77, { align: 'center' });

  // -- 2. INVOICE META HEADER --
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  // Top border line
  doc.line(40, 95, pageWidth - 40, 95);
  doc.text("GSTIN : 29ACHFA1225E1ZS", 45, 110);
  doc.text("TAX INVOICE", pageWidth / 2, 110, { align: 'center' });
  doc.text("ORIGINAL FOR RECIPIENT", pageWidth - 45, 110, { align: 'right' });
  doc.line(40, 117, pageWidth - 40, 117);

  // -- 3. CUSTOMER DETAILS GRID --
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
    } catch { return dateStr; }
  };

  autoTable(doc, {
    startY: 117,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 5,
      textColor: [0, 0, 0],
      lineColor: [0, 112, 192],
      lineWidth: 0.5,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 90, fontStyle: 'bold' },
      1: { cellWidth: 150 },
      2: { cellWidth: 90 },
      3: { cellWidth: 70 },
      4: { cellWidth: 60 },
      5: { cellWidth: 55 }
    },
    body: [
      [
        { content: 'CUSTOMER DETAIL', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'Invoice No.', styles: { fontStyle: 'normal' } },
        { content: data.invoiceNumber, styles: { fontStyle: 'bold' } },
        { content: 'Invoice Date', styles: { fontStyle: 'normal' } },
        { content: formatDate(data.invoiceDate), styles: { fontStyle: 'bold' } }
      ],
      [
        { content: 'Consignee(Ship to)', styles: { fontStyle: 'bold' } },
        { content: data.consignee.name },
        { content: 'Status' },
        { content: 'Original', colSpan: 3 }
      ],
      [
        { content: 'Address', styles: { fontStyle: 'bold' } },
        { content: data.consignee.address },
        { content: 'Vehicle No.' },
        { content: data.dispatch.vehicleNo, colSpan: 3 }
      ],
      [
        { content: 'GSTIN', styles: { fontStyle: 'bold' } },
        { content: data.consignee.gstin },
        { content: 'Dispatch\nthrough', rowSpan: 2 },
        { content: data.dispatch.through, colSpan: 3, rowSpan: 2 }
      ],
      [
        { content: 'STATE', styles: { fontStyle: 'bold' } },
        { content: data.consignee.state }
      ],
      [
        { content: 'Buyer(Bill to)', styles: { fontStyle: 'bold' } },
        { content: data.buyer.name },
        { content: 'Due Date' },
        { content: formatDate(data.dueDate), colSpan: 3 }
      ],
      [
        { content: 'Address', styles: { fontStyle: 'bold' } },
        { content: data.buyer.address },
        { content: 'Dispatch Document No & Date', colSpan: 2 },
        { content: data.dispatch.docNoDate, colSpan: 2 }
      ],
      [
        { content: 'GSTIN', styles: { fontStyle: 'bold' } },
        { content: data.buyer.gstin },
        { content: 'Destination', colSpan: 2 },
        { content: data.dispatch.destination, colSpan: 2 }
      ]
    ]
  });

  let finalY = doc.lastAutoTable.finalY;

  // -- 4. ITEMS TABLE --
  const isCgst = data.taxType === 'CGST_SGST';

  const itemRows = data.items.map((item, index) => {
    const q = parseFloat(item.qty) || 0;
    const r = parseFloat(item.rate) || 0;
    const unit = item.unit || 'KGS';
    const tv = parseFloat(item.taxableValue) || 0;
    const taxAmount = Math.round(tv * 0.18);
    const lineTotal = tv + taxAmount;

    if (isCgst) {
      const cgstAmt = Math.round(taxAmount / 2);
      const sgstAmt = taxAmount - cgstAmt;
      return [
        (index + 1).toString(),
        item.desc,
        item.hsn,
        `${q}\n${unit}`,
        r.toString(),
        tv.toFixed(0),
        '9%',
        cgstAmt.toFixed(0),
        '9%',
        sgstAmt.toFixed(0),
        lineTotal.toFixed(0)
      ];
    }

    return [
      (index + 1).toString(),
      item.desc,
      item.hsn,
      `${q}\n${unit}`,
      r.toString(),
      tv.toFixed(0),
      '18%',
      taxAmount.toFixed(0),
      lineTotal.toFixed(0)
    ];
  });

  // Add empty rows for E-way bill and Dispatch From to match screenshot
  const emptyRow = isCgst ? ['', '', '', '', '', '', '', '', '', '', ''] : ['', '', '', '', '', '', '', '', ''];
  const ewayRow = [...emptyRow];
  ewayRow[1] = `E-Way Bill No: ${data.dispatch.ewayBillNo || ''}`;
  const dispatchRow = [...emptyRow];
  dispatchRow[1] = `Dispatch From: ${data.dispatch?.dispatchFrom || ''}`;
  
  itemRows.push(ewayRow);
  itemRows.push(dispatchRow);

  autoTable(doc, {
    startY: finalY,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 5,
      textColor: [0, 0, 0],
      lineColor: [0, 112, 192],
      lineWidth: 0.5
    },
    columnStyles: isCgst ? {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 125 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 50 },
      6: { cellWidth: 25 },
      7: { cellWidth: 35 },
      8: { cellWidth: 25 },
      9: { cellWidth: 45 },
      10: { cellWidth: 50 }
    } : {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 145 },
      2: { cellWidth: 60 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 50 },
      6: { cellWidth: 35 },
      7: { cellWidth: 55 },
      8: { cellWidth: 60 }
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    head: isCgst ? [
      [
        { content: 'Sr.\nNo.', rowSpan: 2 },
        { content: 'Name of Product / Service', rowSpan: 2 },
        { content: 'HSN / SAC', rowSpan: 2 },
        { content: 'Qty', rowSpan: 2 },
        { content: 'Rate', rowSpan: 2 },
        { content: 'Taxable Value', rowSpan: 2 },
        { content: 'CGST', colSpan: 2 },
        { content: 'SGST', colSpan: 2 },
        { content: 'Total', rowSpan: 2 }
      ],
      [
        { content: '%' }, { content: 'Amount' },
        { content: '%' }, { content: 'Amount' }
      ]
    ] : [
      [
        { content: 'Sr.\nNo.', rowSpan: 2 },
        { content: 'Name of Product / Service', rowSpan: 2 },
        { content: 'HSN / SAC', rowSpan: 2 },
        { content: 'Qty', rowSpan: 2 },
        { content: 'Rate', rowSpan: 2 },
        { content: 'Taxable Value', rowSpan: 2 },
        { content: 'IGST', colSpan: 2 },
        { content: 'Total', rowSpan: 2 }
      ],
      [
        { content: '%' },
        { content: 'Amount' }
      ]
    ],
    body: itemRows,
    foot: [
      isCgst ? [
        { content: 'Total', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: data.items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0) + '\n' + (data.items[0]?.unit || 'KGS') },
        { content: data.items.length === 1 ? data.items[0].rate.toString() : '' },
        { content: data.totals.totalTaxableValue.toFixed(0) },
        { content: '9%' },
        { content: data.totals.cgst.toFixed(0) },
        { content: '9%' },
        { content: data.totals.sgst.toFixed(0) },
        { content: (data.totals.invoiceTotal - (data.totals.tcs || 0)).toFixed(0) }
      ] : [
        { content: 'Total', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: data.items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0) + '\n' + (data.items[0]?.unit || 'KGS') },
        { content: data.items.length === 1 ? data.items[0].rate.toString() : '' },
        { content: data.totals.totalTaxableValue.toFixed(0) },
        { content: '18%' },
        { content: (data.totals.igst || data.totals.gst).toFixed(0) },
        { content: (data.totals.invoiceTotal - (data.totals.tcs || 0)).toFixed(0) }
      ]
    ]
  });

  finalY = doc.lastAutoTable.finalY;

  // -- 5. FOOTER DETAILS --

  const taxRows = [];
  if (isCgst) {
    taxRows.push([
      { content: 'CGST', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: data.totals.cgst.toFixed(0), styles: { halign: 'right' } }
    ]);
    taxRows.push([
      { content: 'SGST', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: data.totals.sgst.toFixed(0), styles: { halign: 'right' } }
    ]);
  } else {
    taxRows.push([
      { content: 'IGST', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: (data.totals.igst || data.totals.gst).toFixed(0), styles: { halign: 'right' } }
    ]);
  }
  
  if (data.applyTcs) {
    taxRows.push([
      { content: 'TCS', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: (data.totals.tcs || 0).toFixed(0), styles: { halign: 'right' } }
    ]);
  }

  autoTable(doc, {
    startY: finalY,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 5,
      textColor: [0, 0, 0],
      lineColor: [0, 112, 192],
      lineWidth: 0.5,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 185 },
      2: { cellWidth: 140 },
      3: { cellWidth: 120 }
    },
    body: [
      [
        { content: 'Total in words\n\n' + numberToWords(Math.round(data.totals.invoiceTotal)), colSpan: 2, rowSpan: 1 + taxRows.length },
        { content: 'Taxable Amount', styles: { fontStyle: 'bold' } },
        { content: data.totals.totalTaxableValue.toFixed(0), styles: { halign: 'right' } }
      ],
      ...taxRows,
      [
        { content: 'Bank Details', colSpan: 2, styles: { fontStyle: 'bold' } },
        { content: 'Total Amount After Tax', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: data.totals.invoiceTotal.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } }
      ],
      [
        { content: `Name\t\t\t${BANK_DETAILS.BANK_NAME}`, colSpan: 2 },
        { content: '(E & O.E.)', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } }
      ],
      [
        { content: TERMS_AND_CONDITIONS[2], colSpan: 2 },
        { content: 'Authorised Signatory', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } }
      ],
      [
        { content: `Branch\t\t\t${BANK_DETAILS.BRANCH}\nAcc. Name\t\t${BANK_DETAILS.ACCOUNT_NAME} Acc. Number\n\t\t\t\t${BANK_DETAILS.ACCOUNT_NUMBER}\nIFSC\t\t\t\t${BANK_DETAILS.IFSC}\nUPI ID\n\n\t\t\t\t\t\t\tPay using UPI`, colSpan: 2 },
        { content: 'Certified that the particulars given above are true and correct.\nFor AMJ ENTERPRISES\n\n\n\n\n\n\n', colSpan: 2, rowSpan: 2, styles: { halign: 'center', fontStyle: 'bold', valign: 'top' } }
      ],
      [
        { content: 'Terms and Conditions\n\n' + TERMS_AND_CONDITIONS[0] + '\n' + TERMS_AND_CONDITIONS[1], colSpan: 2 }
      ]
    ],
    didDrawCell: (hookData) => {
      if (hookData.section === 'body' && hookData.cell.text.join('\n').includes('For AMJ ENTERPRISES')) {
        if (STAMP_BASE64) {
          const imgWidth = 100;
          const imgHeight = 60;
          const x = hookData.cell.x + (hookData.cell.width / 2) - (imgWidth / 2);
          const y = hookData.cell.y + 45; // Pushed down so it doesn't cover text
          doc.addImage(STAMP_BASE64, 'PNG', x, y, imgWidth, imgHeight);
        }
      }
    }
  });

  if (isPreview) {
    return doc.output('datauristring');
  }
  doc.save(`${data.invoiceNumber}.pdf`);
}
