import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PayrollPersonalCardPdfInput = {
  filename: string;
  title: string;
  periodText: string;
  employee: Array<[string, string]>;
  summary: Array<[string, string]>;
  daily: string[][];
  financial: string[][];
  taxes: string[][];
  warnings: string[];
  documents: string[];
};

export function buildPersonalCardPdfSections(input: PayrollPersonalCardPdfInput) {
  return {
    employee: input.employee,
    summary: input.summary,
    dailyHeaders: ["DITA", "D.", "ORARET NGA PAJISJA", "ORË", "NORMALE", "SHTESË", "PUSHIM", "STATUSI / KODI"],
    daily: input.daily,
    financialHeaders: ["ZËRI", "SASIA", "TARIFA", "SHUMA"],
    financial: input.financial,
    taxHeaders: ["NGA", "DERI", "NORMA", "BAZA E APLIKUAR", "TATIMI"],
    taxes: input.taxes,
    warnings: input.warnings.length ? input.warnings : ["Asnjë vërejtje për këtë muaj."],
    documents: input.documents.length ? input.documents : ["Pa dokumente të bashkangjitura."],
  };
}

export function exportPayrollPersonalCardPdf(input: PayrollPersonalCardPdfInput) {
  const sections = buildPersonalCardPdfSections(input);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const footer = () => {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Sistemi Genit Cloud · Kartela Personale · Faqe ${page}/${pageCount}`, pageWidth - margin, pageHeight - 14, { align: "right" });
    }
  };
  const heading = (text: string, y: number) => {
    doc.setFontSize(11);
    doc.setTextColor(23, 37, 61);
    doc.text(text, margin, y);
  };

  doc.setFontSize(17);
  doc.setTextColor(23, 37, 61);
  doc.text(input.title, margin, 34);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(input.periodText, margin, 50);
  heading("① TË DHËNAT E PUNONJËSIT", 71);
  autoTable(doc, {
    body: Array.from({ length: Math.ceil(sections.employee.length / 2) }, (_, index) => {
      const left = sections.employee[index * 2] || ["", ""];
      const right = sections.employee[index * 2 + 1] || ["", ""];
      return [left[0], left[1], right[0], right[1]];
    }),
    startY: 78,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, lineColor: [203, 213, 225], lineWidth: 0.35 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252] }, 2: { fontStyle: "bold", fillColor: [248, 250, 252] } },
  });
  let y = (doc as any).lastAutoTable.finalY + 18;
  heading("② PËRMBLEDHJE MUJORE", y);
  autoTable(doc, {
    body: Array.from({ length: Math.ceil(sections.summary.length / 4) }, (_, index) => sections.summary.slice(index * 4, index * 4 + 4).flatMap(item => [item[0], item[1]])),
    startY: y + 7,
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 4, lineColor: [220, 227, 236], lineWidth: 0.3 },
    didParseCell: cell => { if (cell.column.index % 2 === 0) cell.cell.styles.fillColor = [248, 250, 252]; },
  });
  y = (doc as any).lastAutoTable.finalY + 18;
  heading("③ DETAJE DITORE", y);
  autoTable(doc, {
    head: [sections.dailyHeaders],
    body: sections.daily,
    startY: y + 7,
    margin: { left: margin, right: margin, bottom: 28 },
    styles: { fontSize: 6.7, cellPadding: 3, lineColor: [220, 227, 236], lineWidth: 0.25 },
    headStyles: { fillColor: [234, 240, 247], textColor: [23, 37, 61], fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { halign: "center" }, 1: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
  });

  doc.addPage("a4", "landscape");
  doc.setFontSize(13);
  doc.setTextColor(23, 37, 61);
  doc.text(input.title, margin, 30);
  heading("④ LLOGARITJA E PAGËS", 52);
  autoTable(doc, {
    head: [sections.financialHeaders], body: sections.financial, startY: 59, margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, lineColor: [203, 213, 225], lineWidth: 0.3 },
    headStyles: { fillColor: [234, 240, 247], textColor: [23, 37, 61], fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 18;
  heading("TATIMI SHKALLOR", y);
  autoTable(doc, {
    head: [sections.taxHeaders], body: sections.taxes, startY: y + 7, margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 4, lineColor: [203, 213, 225], lineWidth: 0.3 },
    headStyles: { fillColor: [234, 240, 247], textColor: [23, 37, 61], fontStyle: "bold" },
    columnStyles: { 0: { halign: "right" }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 18;
  heading("⑤ VËREJTJE & PARREGULLSI", y);
  autoTable(doc, { body: sections.warnings.map(item => [item]), startY: y + 7, margin: { left: margin, right: margin }, styles: { fontSize: 8, cellPadding: 4, lineColor: [253, 230, 138], lineWidth: 0.3, fillColor: [255, 251, 235] } });
  y = (doc as any).lastAutoTable.finalY + 18;
  heading("⑥ DOKUMENTET E BASHKANGJITURA", y);
  autoTable(doc, { body: sections.documents.map(item => [item]), startY: y + 7, margin: { left: margin, right: margin, bottom: 28 }, styles: { fontSize: 8, cellPadding: 4, lineColor: [203, 213, 225], lineWidth: 0.3 } });
  footer();
  doc.save(`${input.filename}.pdf`);
}
