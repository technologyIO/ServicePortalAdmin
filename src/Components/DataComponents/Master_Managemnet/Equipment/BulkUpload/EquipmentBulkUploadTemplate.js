import * as XLSX from "xlsx";

export function handleDownloadTemplate() {
  const workbook = XLSX.utils.book_new();

  const data = [
    [
      "Material Code", "Material Description", "Serial Number", "Equipment",
      "Current Customer", "End Customer", "CustWarrantyStart", "CustWarrantyEnd",
      "DealerWarrantyStart", "DealerWarrantyEnd", "Dealer", "PAL number", "IR Number", "Status",
    ],
    [
      "PROD001", "Sample Product", "SN12345", "EQ001", "CUST001", "ENDCUST001",
      "2024-01-01", "2025-01-01", "2025-01-01", "2026-01-01", "DEALER001", "PAL001", "IR001", "Active",
    ],
    [
      "PROD002", "Another Product", "SN12346", "EQ002", "CUST002", "ENDCUST002", 
      "2024-02-01", "2025-02-01", "", "", "DEALER002", "PAL002", "IR002", "Active",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E3F2FD" } },
    };
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Template");
  XLSX.writeFile(workbook, "equipment_bulk_upload_template.xlsx");
}
