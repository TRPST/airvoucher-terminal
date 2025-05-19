import { VoucherType } from "@/actions/admin/commissionActions";

type ParsedVoucher = {
  voucher_type_id: string;
  amount: number;
  pin: string;
  serial_number?: string;
  expiry_date?: string;
};

type ParseResult = {
  vouchers: ParsedVoucher[];
  errors: string[];
  totalLines: number;
  validLines: number;
};

/**
 * Parse a voucher file and extract voucher data
 */
export function parseVoucherFile(
  fileContent: string,
  voucherTypes: VoucherType[]
): ParseResult {
  const lines = fileContent.split("\n").filter(line => line.trim().length > 0);
  const result: ParseResult = {
    vouchers: [],
    errors: [],
    totalLines: lines.length,
    validLines: 0
  };
  
  if (lines.length === 0) {
    result.errors.push("File is empty");
    return result;
  }

  // Sample first line to determine format
  const firstLine = lines[0];
  
  if (firstLine.startsWith("D|") && firstLine.includes("RINGA")) {
    return parseRingaFormat(lines, voucherTypes, result);
  } else if (firstLine.startsWith("D|") && firstLine.includes("HWB")) {
    return parseHollywoodbetsFormat(lines, voucherTypes, result);
  } else if (firstLine.startsWith("Easyload")) {
    return parseEasyloadFormat(lines, voucherTypes, result);
  } else {
    result.errors.push("Unknown file format. Expected Ringa, Hollywoodbets, or Easyload format.");
    return result;
  }
}

/**
 * Parse Ringa format voucher file
 * Format: D|RINGA0100|100.00|0|100.00|01/06/2026|127465|RT09C1044798F43|2691290788475827
 */
function parseRingaFormat(
  lines: string[],
  voucherTypes: VoucherType[],
  result: ParseResult
): ParseResult {
  // Find Ringa voucher type ID
  const ringaType = voucherTypes.find(type => type.name === "Ringa");
  if (!ringaType) {
    result.errors.push("Ringa voucher type not found in database");
    return result;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip non-voucher lines or header lines (starting with 'H')
    if (!line.startsWith("D|") || !line.includes("RINGA")) {
      continue;
    }

    try {
      const columns = line.split("|");
      if (columns.length < 9) {
        result.errors.push(`Line ${i + 1}: Insufficient columns`);
        continue;
      }

      // Extract relevant data
      const amount = parseFloat(columns[2]);
      const expiryDateParts = columns[5].split("/");
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const expiryDate = `${expiryDateParts[2]}-${expiryDateParts[1]}-${expiryDateParts[0]}`;
      const serialNumber = columns[columns.length - 2];
      const pin = columns[columns.length - 1];

      if (isNaN(amount)) {
        result.errors.push(`Line ${i + 1}: Invalid amount`);
        continue;
      }

      result.vouchers.push({
        voucher_type_id: ringaType.id,
        amount,
        pin,
        serial_number: serialNumber,
        expiry_date: expiryDate
      });
      
      result.validLines++;
    } catch (error) {
      result.errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return result;
}

/**
 * Parse Hollywoodbets format voucher file
 * Format: D|HWB000010|10.00|1095|10|02/05/2027|39942|1359713349|00186831686370119
 */
function parseHollywoodbetsFormat(
  lines: string[],
  voucherTypes: VoucherType[],
  result: ParseResult
): ParseResult {
  // Find Hollywoodbets voucher type ID
  const hwbType = voucherTypes.find(type => type.name === "Hollywoodbets");
  if (!hwbType) {
    result.errors.push("Hollywoodbets voucher type not found in database");
    return result;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip non-voucher lines or header lines
    if (!line.startsWith("D|") || !line.includes("HWB")) {
      continue;
    }

    try {
      const columns = line.split("|");
      if (columns.length < 9) {
        result.errors.push(`Line ${i + 1}: Insufficient columns`);
        continue;
      }

      // Extract relevant data
      const amount = parseFloat(columns[2]);
      const expiryDateParts = columns[5].split("/");
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const expiryDate = `${expiryDateParts[2]}-${expiryDateParts[1]}-${expiryDateParts[0]}`;
      const serialNumber = columns[columns.length - 2];
      const pin = columns[columns.length - 1];

      if (isNaN(amount)) {
        result.errors.push(`Line ${i + 1}: Invalid amount`);
        continue;
      }

      result.vouchers.push({
        voucher_type_id: hwbType.id,
        amount,
        pin,
        serial_number: serialNumber,
        expiry_date: expiryDate
      });
      
      result.validLines++;
    } catch (error) {
      result.errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return result;
}

/**
 * Parse Easyload format voucher file
 * Format: Easyload,5,25357070837651,00100050000096969531,20270822
 */
function parseEasyloadFormat(
  lines: string[],
  voucherTypes: VoucherType[],
  result: ParseResult
): ParseResult {
  // Find Easyload voucher type ID (note: lowercase 'l' in Easyload)
  const easyloadType = voucherTypes.find(type => type.name === "Easyload");
  if (!easyloadType) {
    result.errors.push("Easyload voucher type not found in database");
    return result;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip non-voucher lines
    if (!line.startsWith("Easyload")) {
      continue;
    }

    try {
      const columns = line.split(",");
      if (columns.length < 5) {
        result.errors.push(`Line ${i + 1}: Insufficient columns`);
        continue;
      }

      // Extract relevant data
      const amount = parseFloat(columns[1]);
      const serialNumber = columns[2];
      const pin = columns[3];
      const expiryDateStr = columns[4];
      
      // Convert YYYYMMDD to YYYY-MM-DD
      const expiryDate = `${expiryDateStr.substring(0, 4)}-${expiryDateStr.substring(4, 6)}-${expiryDateStr.substring(6, 8)}`;

      if (isNaN(amount)) {
        result.errors.push(`Line ${i + 1}: Invalid amount`);
        continue;
      }

      result.vouchers.push({
        voucher_type_id: easyloadType.id,
        amount,
        pin,
        serial_number: serialNumber,
        expiry_date: expiryDate
      });
      
      result.validLines++;
    } catch (error) {
      result.errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return result;
}

export function getVoucherTypeNameFromFile(fileContent: string): string | null {
  const lines = fileContent.split("\n").filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    return null;
  }

  const firstLine = lines[0];
  
  if (firstLine.startsWith("D|") && firstLine.includes("RINGA")) {
    return "Ringa";
  } else if (firstLine.startsWith("D|") && firstLine.includes("HWB")) {
    return "Hollywoodbets";
  } else if (firstLine.startsWith("Easyload")) {
    return "Easyload";
  }
  
  return null;
}
