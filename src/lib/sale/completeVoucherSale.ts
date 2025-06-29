import { createClient } from "@/utils/supabase/client";

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
  const supabase = createClient();
  
  try {
    // Call the RPC function with parameters in the exact order expected by the SQL function
    const { data, error } = await supabase.rpc('complete_voucher_sale', {
      voucher_inventory_id: params.voucher_inventory_id,
      retailer_id: params.retailer_id,
      terminal_id: params.terminal_id,
      in_voucher_type_id: params.voucher_type_id, // Note: parameter name difference!
      sale_amount: params.sale_amount,
      retailer_commission_pct: params.retailer_commission_pct,
      agent_commission_pct: params.agent_commission_pct,
    });

    if (error) {
      console.error('Error completing voucher sale:', error);
      return { data: null, error };
    }

    if (!data) {
      return {
        data: null,
        error: new Error('Sale completed but no receipt data returned'),
      };
    }

    // Generate instructions based on product type
    // In a real implementation, these would come from the database
    // or be determined based on the voucher type
    let instructions = 'Dial *136*(voucher number)#';
    if (data.product_name) {
      const productLower = data.product_name.toLowerCase();

      // Simple instruction generation based on product name
      if (productLower.includes('vodacom')) {
        instructions = 'Dial *135*(voucher number)#';
      } else if (productLower.includes('mtn')) {
        instructions = 'Dial *136*(voucher number)#';
      } else if (productLower.includes('telkom')) {
        instructions = 'Dial *180*(voucher number)#';
      } else if (productLower.includes('cellc')) {
        instructions = 'Dial *102*(voucher number)#';
      } else if (productLower.includes('netflix') || productLower.includes('showmax')) {
        instructions = "Visit provider website and enter code in 'Redeem Voucher' section";
      }
    }

    // Add instructions to the receipt
    const receiptData: VoucherSaleReceipt = {
      ...data,
      instructions,
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
