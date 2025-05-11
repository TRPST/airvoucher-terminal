import supabase from "@/lib/supabaseClient";
import { VoucherInventory, ResponseType } from "../types/adminTypes";

/**
 * Fetch voucher inventory with voucher type names
 */
export async function fetchVoucherInventory(): Promise<
  ResponseType<VoucherInventory[]>
> {
  const { data, error } = await supabase.from("voucher_inventory").select(`
      id,
      amount,
      pin,
      serial_number,
      expiry_date,
      status,
      voucher_types!inner (name)
    `);

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match the VoucherInventory type
  const inventory = data.map((voucher) => ({
    id: voucher.id,
    amount: voucher.amount,
    pin: voucher.pin,
    serial_number: voucher.serial_number,
    expiry_date: voucher.expiry_date,
    status: voucher.status as "available" | "sold" | "disabled",
    voucher_type_name: voucher.voucher_types?.[0]?.name || "",
  }));

  return { data: inventory, error: null };
}

/**
 * Upload multiple vouchers to the inventory
 */
export async function uploadVouchers(
  vouchers: Array<{
    voucher_type_id: string;
    amount: number;
    pin: string;
    serial_number?: string;
    expiry_date?: string;
  }>
): Promise<ResponseType<{ count: number }>> {
  const { data, error } = await supabase.from("voucher_inventory").insert(
    vouchers.map((v) => ({
      ...v,
      status: "available",
    }))
  );

  if (error) {
    return { data: null, error };
  }

  return { data: { count: vouchers.length }, error: null };
}

/**
 * Disable a voucher in the inventory
 */
export async function disableVoucher(
  id: string
): Promise<ResponseType<{ id: string }>> {
  const { data, error } = await supabase
    .from("voucher_inventory")
    .update({ status: "disabled" })
    .eq("id", id)
    .select("id")
    .single();

  return { data, error };
}
