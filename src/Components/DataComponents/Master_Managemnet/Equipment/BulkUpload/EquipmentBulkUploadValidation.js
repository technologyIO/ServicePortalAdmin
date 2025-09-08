import * as XLSX from "xlsx";

export async function validateFileStructure(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let headers = [];
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
          const text = e.target.result;
          const firstLine = text.split("\n")[0];
          const delimiter = fileName.endsWith(".tsv") ? "\t" : ",";
          headers = firstLine
            .split(delimiter)
            .map((h) => h.trim().replace(/"/g, ""));
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
          });
          headers = jsonData && jsonData ? jsonData : [];
        } else if (fileName.endsWith(".json")) {
          const data = JSON.parse(e.target.result);
          const records = Array.isArray(data) ? data : [data];
          headers = records.length > 0 ? Object.keys(records[0]) : [];
        }

        const normalizeText = (text) => {
          if (typeof text !== "string") {
            text = String(text || "");
          }
          return text
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/g, "");
        };

        const normalizedHeaders = headers.map(normalizeText);

        const requiredFields = {
          materialcode: [
            "materialcode", "material_code", "partnumber", "part_number", "partno", "productcode", "material",
          ],
          materialdescription: [
            "materialdescription", "material_description", "description", "product_description", "desc",
          ],
          serialnumber: [
            "serialnumber", "serial_number", "serial", "sn", "serialno", "Serial Number",
          ],
          equipmentid: [
            "equipment", "equipmentid", "equipment_id", "eqid", "eq_id",
          ],
          currentcustomer: [
            "currentcustomer", "current_customer", "customer_code", "customercode", "customer", "custcode", "curcustomer", "curcustomer",
          ],
          endcustomer: [
            "endcustomer", "end_customer", "final_customer", "end_user", "finalcustomer", "End customer",
          ],
          custWarrantystartdate: [
            "custwarrantystartdate", "custwarrantystart", "cust_warranty_start_date", "warranty_start",
            "customer_warranty_start", "customerwarrantystartdate", "customer_warranty_startdate",
            "customerwarrantystartdate", "customer warranty start date", "cus. wrty start",
          ],
          custWarrantyenddate: [
            "custwarrantyenddate", "custwarrantyend", "cust_warranty_end_date", "warranty_end",
            "customer_warranty_end", "customerwarrantyenddate", "customer_warranty_enddate",
            "customerwarrantyenddate", "customer warranty end date", "Cust. wrty end",
          ],
          dealer: [
            "dealer", "dealer_name", "dealername", "distributor", "partner", "vendor",
          ],
        };

        const foundFields = {};
        const mappedColumns = {};

        for (const [field, variations] of Object.entries(requiredFields)) {
          const foundVariation = variations.find((variation) => {
            const normalizedVariation = normalizeText(variation);
            return normalizedHeaders.some(
              (h) =>
                h === normalizedVariation ||
                h.includes(normalizedVariation) ||
                normalizedVariation.includes(h)
            );
          });

          foundFields[field] = !!foundVariation;

          if (foundVariation) {
            const actualHeader = headers.find((h) => {
              const normalizedHeader = normalizeText(h);
              const normalizedVariation = normalizeText(foundVariation);
              return (
                normalizedHeader === normalizedVariation ||
                normalizedHeader.includes(normalizedVariation) ||
                normalizedVariation.includes(normalizedHeader)
              );
            });

            if (actualHeader) {
              mappedColumns[field] = actualHeader;
            }
          }
        }

        const isValid = Object.values(foundFields).every(Boolean);
        const missingFields = Object.entries(foundFields)
          .filter(([field, found]) => !found)
          .map(([field]) => {
            const fieldLabels = {
              materialcode: "Material Code",
              materialdescription: "Material Description",
              serialnumber: "Serial Number",
              equipmentid: "Equipment ID",
              currentcustomer: "Current Customer",
              endcustomer: "End Customer",
              custWarrantystartdate: "Customer Warranty Start",
              custWarrantyenddate: "Customer Warranty End",
              dealer: "Dealer",
            };
            return fieldLabels[field] || field;
          });

        resolve({
          isValid,
          headers: headers,
          foundFields,
          mappedColumns,
          missingFields,
          totalRequired: Object.keys(requiredFields).length,
          foundRequired: Object.values(foundFields).filter(Boolean).length,
        });
      } catch (error) {
        resolve({
          isValid: false,
          error: `File parsing error: ${error.message}`,
          headers: [],
          foundFields: {},
          mappedColumns: {},
          missingFields: [],
          totalRequired: 9,
          foundRequired: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: "Failed to read file",
        headers: [],
        foundFields: {},
        mappedColumns: {},
        missingFields: [],
        totalRequired: 9,
        foundRequired: 0,
      });
    };

    if (
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".tsv")
    ) {
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}
