import supabase from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

export type RetailerProfile = {
  id: string;
  name: string;
  balance: number;
  credit_limit: number;
  credit_used: number;
  commission_balance: number;
  status: "active" | "suspended" | "inactive";
  user_profile_id: string;
  profile?: {
    full_name: string;
    email: string;
  };
};

export type VoucherType = {
  id: string;
  name: string;
  amount: number;
  count: number;
};

export type Terminal = {
  id: string;
  name: string;
  last_active: string | null;
  status: "active" | "inactive";
};

export type Sale = {
  id: string;
  created_at: string;
  sale_amount: number;
  retailer_commission: number;
  terminal_name: string;
  voucher_type: string;
  voucher_amount: number;
  pin: string;
  serial_number?: string;
};

/**
 * Fetch the retailer profile for the current user
 */
export async function fetchMyRetailer(userId: string): Promise<{
  data: RetailerProfile | null;
  error: PostgrestError | Error | null;
}> {
  try {
    console.log("Fetching retailer for user ID:", userId);

    const { data, error } = await supabase
      .from("retailers")
      .select(
        `
        id,
        name,
        balance,
        credit_limit,
        credit_used,
        commission_balance,
        status,
        user_profile_id,
        profiles!retailers_user_profile_id_fkey(full_name, email)
      `
      )
      .eq("user_profile_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      console.log("No retailer found for user ID:", userId);
      return {
        data: null,
        error: new Error("No retailer found for this user"),
      };
    }

    // Use the first retailer found (should be just one)
    const retailerData = data[0];

    // Transform the data to match the RetailerProfile type
    const retailer: RetailerProfile = {
      id: retailerData.id,
      name: retailerData.name,
      balance: retailerData.balance || 0,
      credit_limit: retailerData.credit_limit || 0,
      credit_used: retailerData.credit_used || 0,
      commission_balance: retailerData.commission_balance || 0,
      status: retailerData.status || "inactive",
      user_profile_id: retailerData.user_profile_id,
      profile: {
        full_name: retailerData.profiles?.[0]?.full_name || "",
        email: retailerData.profiles?.[0]?.email || "",
      },
    };

    console.log("Retailer found:", retailer.name);
    return { data: retailer, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchMyRetailer:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Fetch available voucher types with counts
 */
export async function fetchAvailableVoucherTypes(): Promise<{
  data: VoucherType[] | null;
  error: PostgrestError | Error | null;
}> {
  try {
    console.log("Fetching available voucher types");

    // Try RPC first if it exists
    try {
      const { data, error } = await supabase.rpc("get_available_voucher_types");

      if (!error && data) {
        console.log(`Found ${data.length} voucher types via RPC`);
        return { data, error: null };
      }
    } catch (rpcErr) {
      console.log("RPC not available, falling back to regular query", rpcErr);
    }

    // If RPC fails or doesn't exist, fall back to a regular query with client-side aggregation
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("voucher_inventory")
      .select(
        `
        voucher_type_id,
        amount,
        voucher_types(name)
      `
      )
      .eq("status", "available");

    if (inventoryError) {
      console.error("Error fetching voucher inventory:", inventoryError);

      // In development, return mock data
      if (process.env.NODE_ENV === "development") {
        console.log("Creating mock voucher types for development");
        return {
          data: [
            {
              id: "mock-voucher-type-1",
              name: "Vodacom 50",
              amount: 50,
              count: 5,
            },
            {
              id: "mock-voucher-type-2",
              name: "MTN 100",
              amount: 100,
              count: 3,
            },
            {
              id: "mock-voucher-type-3",
              name: "Telkom 30",
              amount: 30,
              count: 7,
            },
            {
              id: "mock-voucher-type-4",
              name: "Netflix Basic",
              amount: 99,
              count: 2,
            },
          ],
          error: null,
        };
      }

      return { data: null, error: inventoryError };
    }

    if (!inventoryData || inventoryData.length === 0) {
      console.log("No vouchers found in inventory");

      // In development, return mock data
      if (process.env.NODE_ENV === "development") {
        console.log("Creating mock voucher types for development");
        return {
          data: [
            {
              id: "mock-voucher-type-1",
              name: "Vodacom 50",
              amount: 50,
              count: 5,
            },
            {
              id: "mock-voucher-type-2",
              name: "MTN 100",
              amount: 100,
              count: 3,
            },
            {
              id: "mock-voucher-type-3",
              name: "Telkom 30",
              amount: 30,
              count: 7,
            },
            {
              id: "mock-voucher-type-4",
              name: "Netflix Basic",
              amount: 99,
              count: 2,
            },
          ],
          error: null,
        };
      }

      return { data: [], error: null };
    }

    // Client-side aggregation to count vouchers per type
    const voucherTypesMap = new Map<string, VoucherType>();

    for (const voucher of inventoryData) {
      const id = voucher.voucher_type_id;
      const typeName = voucher.voucher_types?.[0]?.name || "Unknown";
      const amount = voucher.amount;

      if (!voucherTypesMap.has(id)) {
        voucherTypesMap.set(id, {
          id,
          name: typeName,
          amount,
          count: 0,
        });
      }

      const type = voucherTypesMap.get(id)!;
      type.count += 1;
    }

    const result = Array.from(voucherTypesMap.values());
    console.log(`Found ${result.length} voucher types from inventory`);
    return { data: result, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchAvailableVoucherTypes:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Sell a voucher
 */
export async function sellVoucher({
  terminalId,
  voucherTypeId,
}: {
  terminalId: string;
  voucherTypeId: string;
}): Promise<{
  data: {
    sale_id: string;
    voucher: { pin: string; serial_number?: string };
  } | null;
  error: PostgrestError | Error | null;
}> {
  try {
    // Step 1: Begin a transaction
    // Note: Supabase JS client doesn't support transactions, so we'll use multiple queries
    // In a production app, this would ideally be a stored procedure in PostgreSQL

    // Step 2: Get one available voucher of the requested type
    const { data: voucher, error: voucherError } = await supabase
      .from("voucher_inventory")
      .select("id, amount, pin, serial_number, voucher_type_id")
      .eq("voucher_type_id", voucherTypeId)
      .eq("status", "available")
      .limit(1)
      .single();

    if (voucherError) {
      return { data: null, error: voucherError };
    }

    // Step 3: Get terminal and retailer information
    const { data: terminal, error: terminalError } = await supabase
      .from("terminals")
      .select("retailer_id")
      .eq("id", terminalId)
      .single();

    if (terminalError) {
      return { data: null, error: terminalError };
    }

    // Step 4: Get retailer and commission information
    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .select("id, agent_profile_id, commission_group_id")
      .eq("id", terminal.retailer_id)
      .single();

    if (retailerError) {
      return { data: null, error: retailerError };
    }

    // Step 5: Get commission rates for this retailer's group and voucher type
    const { data: commissionRate, error: rateError } = await supabase
      .from("commission_group_rates")
      .select("retailer_pct, agent_pct")
      .eq("commission_group_id", retailer.commission_group_id)
      .eq("voucher_type_id", voucherTypeId)
      .single();

    if (rateError) {
      return {
        data: null,
        error: new Error("Commission rate not found for this voucher type"),
      };
    }

    // Step 6: Calculate commissions
    const retailerCommission = voucher.amount * commissionRate.retailer_pct;
    const agentCommission = voucher.amount * commissionRate.agent_pct;

    // Step 7: Update voucher status to sold
    const { error: updateVoucherError } = await supabase
      .from("voucher_inventory")
      .update({
        status: "sold",
        sold_at: new Date().toISOString(),
      })
      .eq("id", voucher.id);

    if (updateVoucherError) {
      return { data: null, error: updateVoucherError };
    }

    // Step 8: Create a sale record
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        terminal_id: terminalId,
        voucher_inventory_id: voucher.id,
        sale_amount: voucher.amount,
        retailer_commission: retailerCommission,
        agent_commission: agentCommission,
      })
      .select("id")
      .single();

    if (saleError) {
      return { data: null, error: saleError };
    }

    // Step 9: Update retailer balance and commissions
    const { error: updateRetailerError } = await supabase
      .from("retailers")
      .update({
        balance: supabase.rpc("decrement", { x: voucher.amount }),
        credit_used: supabase.rpc("increment", { x: voucher.amount }),
        commission_balance: supabase.rpc("increment", {
          x: retailerCommission,
        }),
      })
      .eq("id", retailer.id);

    if (updateRetailerError) {
      return { data: null, error: updateRetailerError };
    }

    // Step 10: Create a transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        type: "sale",
        amount: voucher.amount,
        balance_after: supabase.rpc("get_retailer_balance", {
          retailer_id: retailer.id,
        }),
        retailer_id: retailer.id,
        agent_profile_id: retailer.agent_profile_id,
        sale_id: sale.id,
        notes: `Voucher sale of ${voucher.amount} via terminal ${terminalId}`,
      });

    if (transactionError) {
      return { data: null, error: transactionError };
    }

    // Return the sale info with voucher details
    return {
      data: {
        sale_id: sale.id,
        voucher: {
          pin: voucher.pin,
          serial_number: voucher.serial_number,
        },
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch sales history with optional filters
 */
export async function fetchSalesHistory({
  terminalId,
  startDate,
  endDate,
}: {
  terminalId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  data: Sale[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("sales").select(`
    id,
    created_at,
    sale_amount,
    retailer_commission,
    terminals(name),
    voucher_inventory(
      pin,
      serial_number,
      voucher_types(name),
      amount
    )
  `);

  if (terminalId) {
    query = query.eq("terminal_id", terminalId);
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  // Order by newest first
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match the Sale type
  const sales = data.map((sale) => ({
    id: sale.id,
    created_at: sale.created_at,
    sale_amount: sale.sale_amount,
    retailer_commission: sale.retailer_commission,
    terminal_name: sale.terminals?.[0]?.name || "",
    voucher_type: sale.voucher_inventory?.[0]?.voucher_types?.[0]?.name || "",
    voucher_amount: sale.voucher_inventory?.[0]?.amount || 0,
    pin: sale.voucher_inventory?.[0]?.pin || "",
    serial_number: sale.voucher_inventory?.[0]?.serial_number,
  }));

  return { data: sales, error: null };
}

/**
 * Fetch terminals for a retailer
 */
export async function fetchTerminals(retailerId: string): Promise<{
  data: Terminal[] | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("terminals")
    .select(
      `
      id,
      name,
      last_active,
      status
    `
    )
    .eq("retailer_id", retailerId);

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match the Terminal type
  const terminals = data.map((terminal) => ({
    id: terminal.id,
    name: terminal.name,
    last_active: terminal.last_active,
    status: terminal.status as "active" | "inactive",
  }));

  return { data: terminals, error: null };
}
