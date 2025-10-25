import * as XLSX from "xlsx";

export function handleDownloadTemplate() {
  const workbook = XLSX.utils.book_new();

  // Create data with ONLY headers - no sample data rows
  const data = [
    [
      "Material Code", "Material Description", "Serial Number", "Equipment",
      "Current Customer", "End Customer", "CustWarrantyStart", "CustWarrantyEnd",
      "DealerWarrantyStart", "DealerWarrantyEnd", "Dealer", "PAL number", "IR Number", "Status",
    ]
    // Removed all sample data rows - template will be completely empty
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
  
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E3F2FD" } },
    };
  }

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // Material Code
    { wch: 25 }, // Material Description
    { wch: 15 }, // Serial Number
    { wch: 12 }, // Equipment
    { wch: 18 }, // Current Customer
    { wch: 15 }, // End Customer
    { wch: 18 }, // CustWarrantyStart
    { wch: 16 }, // CustWarrantyEnd
    { wch: 20 }, // DealerWarrantyStart
    { wch: 18 }, // DealerWarrantyEnd
    { wch: 12 }, // Dealer
    { wch: 12 }, // PAL number
    { wch: 12 }, // IR Number
    { wch: 10 }  // Status
  ];
  
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Template");
  XLSX.writeFile(workbook, "equipment_bulk_upload_template.xlsx");
}
