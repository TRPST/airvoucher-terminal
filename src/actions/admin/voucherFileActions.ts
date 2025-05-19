import { parseVoucherFile } from "@/utils/voucherFileParser";
import { fetchVoucherTypes } from "./commissionActions";
import { uploadVouchers } from "./voucherActions";
import { ResponseType } from "../types/adminTypes";

export type UploadResult = {
  totalLines: number;
  validVouchers: number;
  errors: string[];
  voucherType: string;
};

/**
 * Process a voucher file and upload valid vouchers to the database
 */
export async function processVoucherFile(
  fileContent: string
): Promise<ResponseType<UploadResult>> {
  try {
    // Get voucher types
    const { data: voucherTypes, error: typesError } = await fetchVoucherTypes();
    
    if (typesError || !voucherTypes) {
      return {
        data: null,
        error: new Error(`Failed to fetch voucher types: ${typesError?.message || "Unknown error"}`)
      };
    }
    
    // Parse the file
    const result = parseVoucherFile(fileContent, voucherTypes);
    
    if (result.vouchers.length === 0) {
      return {
        data: {
          totalLines: result.totalLines,
          validVouchers: 0,
          errors: result.errors.length > 0 
            ? result.errors 
            : ["No valid vouchers found in the file"],
          voucherType: ""
        },
        error: null
      };
    }
    
    // Determine voucher type name based on the voucher_type_id of the first voucher
    const voucherType = voucherTypes.find(
      type => type.id === result.vouchers[0].voucher_type_id
    );
    
    // Upload vouchers to the database
    const { error: uploadError } = await uploadVouchers(result.vouchers);
    
    if (uploadError) {
      return {
        data: null,
        error: new Error(`Failed to upload vouchers: ${uploadError.message}`)
      };
    }
    
    // Return success result
    return {
      data: {
        totalLines: result.totalLines,
        validVouchers: result.vouchers.length,
        errors: result.errors,
        voucherType: voucherType?.name || "Unknown"
      },
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error 
        ? error 
        : new Error("An unknown error occurred while processing the voucher file")
    };
  }
}
