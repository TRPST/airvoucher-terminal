import { createAdminClient } from '@/utils/supabase/admin';

export interface ElectricityPaymentData {
  accountNumber: string;
  meterNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  reference: string;
  terminalId: string;
  retailerId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  glocellResponse?: any;
}

export interface ElectricityPaymentRecord {
  id: string;
  account_number: string;
  meter_number: string;
  customer_name: string;
  customer_phone?: string;
  amount: number;
  reference: string;
  terminal_id: string;
  retailer_id: string;
  payment_status: string;
  glocell_response?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Records an electricity payment in the database
 */
export const recordElectricityPayment = async (
  paymentData: ElectricityPaymentData
): Promise<{ data: ElectricityPaymentRecord | null; error: Error | null }> => {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('electricity_payments')
      .insert({
        account_number: paymentData.accountNumber,
        meter_number: paymentData.meterNumber,
        customer_name: paymentData.customerName,
        customer_phone: paymentData.customerPhone,
        amount: paymentData.amount,
        reference: paymentData.reference,
        terminal_id: paymentData.terminalId,
        retailer_id: paymentData.retailerId,
        payment_status: paymentData.paymentStatus,
        glocell_response: paymentData.glocellResponse,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording electricity payment:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in recordElectricityPayment:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

/**
 * Updates the status of an electricity payment
 */
export const updateElectricityPaymentStatus = async (
  paymentId: string,
  status: 'pending' | 'completed' | 'failed',
  glocellResponse?: any
): Promise<{ data: ElectricityPaymentRecord | null; error: Error | null }> => {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('electricity_payments')
      .update({
        payment_status: status,
        glocell_response: glocellResponse,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating electricity payment status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in updateElectricityPaymentStatus:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

/**
 * Gets electricity payment history for a terminal
 */
export const getElectricityPaymentHistory = async (
  terminalId: string,
  limit: number = 50
): Promise<{ data: ElectricityPaymentRecord[] | null; error: Error | null }> => {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from('electricity_payments')
      .select('*')
      .eq('terminal_id', terminalId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching electricity payment history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getElectricityPaymentHistory:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};
