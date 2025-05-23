import { supabase } from "@/lib/supabaseClient";

export interface CompleteVoucherSaleParams {
  voucher_inventory_id: string;
  retailer_id: string;
  terminal_id: string;
  voucher_type_id: string;
  sale_amount: number;
  retailer_commission_pct: number;
  agent_commission_pct: number;
}

export interface VoucherSaleReceipt {
  sale_id: string;
  voucher_code: string;
  serial_number: string;
  ref_number: string;
  retailer_name: string;
  terminal_name: string;
  terminal_id: string;
  product_name: string;
  sale_amount: number;
  retailer_commission: number;
  agent_commission: number;
  timestamp: string;
  instructions: string;
}

/**
 * Completes a voucher sale transaction by calling the Supabase RPC function
 * 
 * This function will:
 * 1. Mark the voucher as sold in voucher_inventory
 * 2. Create a new sale record
 * 3. Add a transaction record
 * 4. Update retailer balance and commission
 * 5. Update terminal last_active timestamp
 * 
 * All operations are performed in a single database transaction
 */
export const completeVoucherSale = async (
  params: CompleteVoucherSaleParams
): Promise<{ data: VoucherSaleReceipt | null; error: Error | null }> => {
  try {
    // Call the RPC function
    const { data, error } = await supabase.rpc('complete_voucher_sale', params);
    
    if (error) {
      console.error("Error completing voucher sale:", error);
      return { data: null, error };
    }
    
    if (!data) {
      return { 
        data: null, 
        error: new Error("Sale completed but no receipt data returned") 
      };
    }
    
    // Generate instructions based on product type
    // In a real implementation, these would come from the database
    // or be determined based on the voucher type
    let instructions = "Dial *136*(voucher number)#";
    if (data.product_name) {
      const productLower = data.product_name.toLowerCase();
      
      // Simple instruction generation based on product name
      if (productLower.includes("vodacom")) {
        instructions = "Dial *135*(voucher number)#";
      } else if (productLower.includes("mtn")) {
        instructions = "Dial *136*(voucher number)#";
      } else if (productLower.includes("telkom")) {
        instructions = "Dial *180*(voucher number)#";
      } else if (productLower.includes("cellc")) {
        instructions = "Dial *102*(voucher number)#";
      } else if (productLower.includes("netflix") || productLower.includes("showmax")) {
        instructions = "Visit provider website and enter code in 'Redeem Voucher' section";
      }
    }
    
    // Add instructions to the receipt
    const receiptData: VoucherSaleReceipt = {
      ...data,
      instructions
    };
    
    return { data: receiptData, error: null };
  } catch (err) {
    console.error("Unexpected error in completeVoucherSale:", err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)) 
    };
  }
};
