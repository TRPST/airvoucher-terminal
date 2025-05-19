import supabase from "@/lib/supabaseClient";
import { VoucherInventory, ResponseType } from "../types/adminTypes";

/**
 * Fetch voucher inventory with voucher type names
 */
export async function fetchVoucherInventory(): Promise<
  ResponseType<VoucherInventory[]>
> {
  // First, get all voucher types to use as a lookup table
  const { data: voucherTypes, error: typesError } = await supabase
    .from("voucher_types")
    .select("id, name");

  if (typesError) {
    return { data: null, error: typesError };
  }

  console.log("Voucher types from database:", voucherTypes);

  // Create a lookup map for voucher type names by ID
  const typeNameMap = new Map<string, string>();
  voucherTypes.forEach((type) => {
    typeNameMap.set(type.id, type.name);
  });
  
  console.log("Voucher type mapping:", Object.fromEntries(typeNameMap.entries()));

  // Now get all voucher inventory using pagination to overcome Supabase's default 1000 row limit
  let allData: any[] = [];
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;
  
  while (hasMore) {
    const { data: pageData, error: pageError } = await supabase
      .from("voucher_inventory")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (pageError) {
      return { data: null, error: pageError };
    }
    
    if (pageData.length > 0) {
      allData = [...allData, ...pageData];
      page++;
      console.log(`Fetched page ${page} with ${pageData.length} records. Total records: ${allData.length}`);
    } else {
      hasMore = false;
    }
    
    // Safety check to prevent infinite loops
    if (page > 20) {
      console.warn("Stopped pagination after 20 pages to prevent infinite loops");
      hasMore = false;
    }
  }
  
  const data = allData;

  if (data.length === 0) {
    return { 
      data: null, 
      error: new Error("No voucher inventory data found") 
    };
  }

  // Log the unique voucher type IDs in the inventory
  const uniqueTypeIds = [...new Set(data.map(v => v.voucher_type_id))];
  console.log("Unique voucher type IDs in inventory:", uniqueTypeIds);
  
  // Check for any vouchers with type IDs not in our mapping
  const unmappedTypeIds = uniqueTypeIds.filter(id => !typeNameMap.has(id));
  if (unmappedTypeIds.length > 0) {
    console.warn("Found vouchers with unmapped type IDs:", unmappedTypeIds);
  }
  
  // Log high-value vouchers directly from the database
  const highValueVouchers = data.filter(v => v.amount >= 100);
  console.log(`Found ${highValueVouchers.length} high-value vouchers (≥ R100) in database:`, 
    highValueVouchers.map(v => ({ 
      id: v.id, 
      amount: v.amount, 
      type_id: v.voucher_type_id,
      type_name: typeNameMap.get(v.voucher_type_id) || "UNKNOWN" 
    }))
  );

  // Transform the data to match the VoucherInventory type, using the lookup table
  const inventory = data.map((voucher) => ({
    id: voucher.id,
    amount: voucher.amount,
    pin: voucher.pin,
    serial_number: voucher.serial_number,
    expiry_date: voucher.expiry_date,
    status: voucher.status as "available" | "sold" | "disabled",
    voucher_type_name: typeNameMap.get(voucher.voucher_type_id) || "",
  }));

  // Log high-value vouchers after transformation
  const highValueInventory = inventory.filter(v => v.amount >= 100);
  console.log(`Found ${highValueInventory.length} high-value vouchers after transformation:`);
  
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
