import supabase from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

export type Retailer = {
  id: string;
  name: string;
  balance: number;
  credit_limit: number;
  credit_used: number;
  commission_balance: number;
  status: "active" | "suspended" | "inactive";
  full_name: string;
  email: string;
  agent_name?: string;
  commission_group_name?: string;
  agent_profile_id?: string;
  commission_group_id?: string;
};

export type Terminal = {
  id: string;
  name: string;
  last_active: string | null;
  status: "active" | "inactive";
  auth_user_id: string;
  email: string;
};

export type VoucherInventory = {
  id: string;
  amount: number;
  pin: string;
  serial_number: string | null;
  expiry_date: string | null;
  status: "available" | "sold" | "disabled";
  voucher_type_name: string;
};

export type CommissionGroup = {
  id: string;
  name: string;
  rates: CommissionRate[];
};

export type CommissionRate = {
  id: string;
  voucher_type_id: string;
  retailer_pct: number;
  agent_pct: number;
  voucher_type_name?: string;
};

export type SalesReport = {
  id: string;
  created_at: string;
  terminal_name: string;
  retailer_name: string;
  voucher_type: string;
  amount: number;
  retailer_commission: number;
  agent_commission: number;
};

export type EarningsSummary = {
  voucher_type: string;
  total_sales: number;
  total_amount: number;
  retailer_commission: number;
  agent_commission: number;
  platform_commission: number;
};

export type InventoryReport = {
  voucher_type: string;
  available: number;
  sold: number;
  disabled: number;
};

export type ProfileData = {
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "retailer" | "agent" | "terminal";
};

export type RetailerData = {
  name: string;
  contact_name?: string;
  contact_email?: string;
  location?: string;
  agent_profile_id?: string;
  commission_group_id?: string;
  credit_limit?: number;
  status?: "active" | "suspended" | "inactive";
};

/**
 * Fetch all retailers with their profile and agent information
 */
export async function fetchRetailers(): Promise<{
  data: Retailer[] | null;
  error: PostgrestError | Error | null;
}> {
  try {
    console.log("Fetching retailers from Supabase");

    const { data, error } = await supabase.from("retailers").select(`
        id,
        name,
        balance,
        credit_limit,
        credit_used,
        commission_balance,
        status,
        agent_profile_id,
        commission_group_id,
        profiles!retailers_user_profile_id_fkey(full_name, email),
        agent_profiles:profiles!retailers_agent_profile_id_fkey(id, full_name),
        commission_groups(id, name)
      `);

    if (error) {
      console.error("Supabase error when fetching retailers:", error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      console.log("No retailers found in the database");
      // In development, return mock data for testing
      if (process.env.NODE_ENV === "development") {
        const mockRetailers: Retailer[] = [
          {
            id: "mock-retailer-1",
            name: "Dev Test Retailer",
            balance: 1000,
            credit_limit: 5000,
            credit_used: 200,
            commission_balance: 150,
            status: "active",
            full_name: "Dev User",
            email: "dev@example.com",
            agent_name: "Dev Agent",
            commission_group_name: "Standard",
            agent_profile_id: "mock-agent-1",
            commission_group_id: "mock-group-1",
          },
        ];
        return { data: mockRetailers, error: null };
      }

      return { data: [], error: null };
    }

    console.log(`Found ${data.length} retailers`);

    // Transform the data to match the Retailer type
    const retailers = data.map((retailer) => ({
      id: retailer.id,
      name: retailer.name,
      balance: retailer.balance || 0,
      credit_limit: retailer.credit_limit || 0,
      credit_used: retailer.credit_used || 0,
      commission_balance: retailer.commission_balance || 0,
      status: retailer.status as "active" | "suspended" | "inactive",
      full_name: retailer.profiles?.[0]?.full_name || "",
      email: retailer.profiles?.[0]?.email || "",
      agent_name: retailer.agent_profiles?.[0]?.full_name,
      commission_group_name: retailer.commission_groups?.[0]?.name,
      agent_profile_id: retailer.agent_profile_id, // Original field from retailer
      commission_group_id: retailer.commission_group_id, // Original field from retailer
    }));

    return { data: retailers, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchRetailers:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Create a new retailer with a profile
 */
export async function createRetailer(
  profileData: ProfileData,
  retailerData: RetailerData
): Promise<{
  data: { id: string } | null;
  error: PostgrestError | Error | null;
}> {
  // Start a Supabase transaction
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .insert({
      full_name: profileData.full_name,
      email: profileData.email,
      phone: profileData.phone,
      role: "retailer",
    })
    .select("id")
    .single();

  if (profileError) {
    return { data: null, error: profileError };
  }

  const { data: retailer, error: retailerError } = await supabase
    .from("retailers")
    .insert({
      user_profile_id: profiles.id,
      name: retailerData.name,
      contact_name: retailerData.contact_name,
      contact_email: retailerData.contact_email,
      location: retailerData.location,
      agent_profile_id: retailerData.agent_profile_id,
      commission_group_id: retailerData.commission_group_id,
      credit_limit: retailerData.credit_limit || 0,
      status: retailerData.status || "active",
    })
    .select("id")
    .single();

  if (retailerError) {
    return { data: null, error: retailerError };
  }

  return { data: retailer, error: null };
}

/**
 * Update an existing retailer
 */
export async function updateRetailer(
  id: string,
  updates: Partial<RetailerData>
): Promise<{
  data: { id: string } | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("retailers")
    .update(updates)
    .eq("id", id)
    .select("id")
    .single();

  return { data, error };
}

/**
 * Fetch terminals for a specific retailer
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
      status,
      auth_user_id,
      profiles!inner (email)
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
    auth_user_id: terminal.auth_user_id,
    email: terminal.profiles?.[0]?.email || "",
  }));

  return { data: terminals, error: null };
}

/**
 * Create a new terminal for a retailer
 */
export async function createTerminal(
  retailerId: string,
  name: string,
  email: string
): Promise<{
  data: { id: string } | null;
  error: PostgrestError | Error | null;
}> {
  // Create a profile for the terminal
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      email,
      full_name: `${name} Terminal`,
      role: "terminal",
    })
    .select("id")
    .single();

  if (profileError) {
    return { data: null, error: profileError };
  }

  // Create the terminal linked to the profile and retailer
  const { data: terminal, error: terminalError } = await supabase
    .from("terminals")
    .insert({
      retailer_id: retailerId,
      auth_user_id: profile.id,
      name,
      status: "active",
    })
    .select("id")
    .single();

  if (terminalError) {
    return { data: null, error: terminalError };
  }

  return { data: terminal, error: null };
}

/**
 * Fetch voucher inventory with voucher type names
 */
export async function fetchVoucherInventory(): Promise<{
  data: VoucherInventory[] | null;
  error: PostgrestError | null;
}> {
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
): Promise<{
  data: { count: number } | null;
  error: PostgrestError | null;
}> {
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
export async function disableVoucher(id: string): Promise<{
  data: { id: string } | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("voucher_inventory")
    .update({ status: "disabled" })
    .eq("id", id)
    .select("id")
    .single();

  return { data, error };
}

/**
 * Fetch all commission groups with their rates
 */
export async function fetchCommissionGroups(): Promise<{
  data: CommissionGroup[] | null;
  error: PostgrestError | null;
}> {
  const { data: groups, error: groupsError } = await supabase
    .from("commission_groups")
    .select("id, name");

  if (groupsError) {
    return { data: null, error: groupsError };
  }

  // For each group, fetch its rates
  const result: CommissionGroup[] = [];

  for (const group of groups) {
    const { data: rates, error: ratesError } = await supabase
      .from("commission_group_rates")
      .select(
        `
        id,
        voucher_type_id,
        retailer_pct,
        agent_pct,
        voucher_types!inner (name)
      `
      )
      .eq("commission_group_id", group.id);

    if (ratesError) {
      return { data: null, error: ratesError };
    }

    // Transform the rates data
    const transformedRates = rates.map((rate) => ({
      id: rate.id,
      voucher_type_id: rate.voucher_type_id,
      retailer_pct: rate.retailer_pct,
      agent_pct: rate.agent_pct,
      voucher_type_name: rate.voucher_types?.[0]?.name,
    }));

    result.push({
      id: group.id,
      name: group.name,
      rates: transformedRates,
    });
  }

  return { data: result, error: null };
}

/**
 * Upsert a commission rate for a group and voucher type
 */
export async function upsertCommissionRate(
  groupId: string,
  typeId: string,
  retailerPct: number,
  agentPct: number
): Promise<{
  data: { id: string } | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("commission_group_rates")
    .upsert(
      {
        commission_group_id: groupId,
        voucher_type_id: typeId,
        retailer_pct: retailerPct,
        agent_pct: agentPct,
      },
      {
        onConflict: "commission_group_id,voucher_type_id",
      }
    )
    .select("id")
    .single();

  return { data, error };
}

/**
 * Fetch sales report with optional date filtering
 */
export async function fetchSalesReport({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  data: SalesReport[] | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("sales").select(`
      id,
      created_at,
      sale_amount,
      retailer_commission,
      agent_commission,
      terminals!inner (
        name,
        retailers!inner (name)
      ),
      voucher_inventory!inner (
        voucher_types!inner (name)
      )
    `);

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  // Transform the data to match the SalesReport type
  const salesReport = data.map((sale) => ({
    id: sale.id,
    created_at: sale.created_at,
    terminal_name: sale.terminals?.[0]?.name || "",
    retailer_name: sale.terminals?.[0]?.retailers?.[0]?.name || "",
    voucher_type: sale.voucher_inventory?.[0]?.voucher_types?.[0]?.name || "",
    amount: sale.sale_amount,
    retailer_commission: sale.retailer_commission,
    agent_commission: sale.agent_commission,
  }));

  return { data: salesReport, error: null };
}

/**
 * Fetch earnings summary with optional date filtering
 */
export async function fetchEarningsSummary({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  data: EarningsSummary[] | null;
  error: PostgrestError | Error | null;
}> {
  // This is a complex query, so we'll use a custom SQL function or client-side aggregation
  let query = supabase.from("sales").select(`
      sale_amount,
      retailer_commission,
      agent_commission,
      voucher_inventory!inner (
        voucher_types!inner (name)
      )
    `);

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  // Client-side aggregation to calculate summaries by voucher type
  const summaryMap = new Map<string, EarningsSummary>();

  for (const sale of data) {
    const voucherType =
      sale.voucher_inventory?.[0]?.voucher_types?.[0]?.name || "Unknown";
    const amount = sale.sale_amount || 0;
    const retailerCommission = sale.retailer_commission || 0;
    const agentCommission = sale.agent_commission || 0;

    // Calculate platform commission (could be determined by your business logic)
    const platformCommission = amount * 0.02; // Example: 2% platform fee

    if (!summaryMap.has(voucherType)) {
      summaryMap.set(voucherType, {
        voucher_type: voucherType,
        total_sales: 0,
        total_amount: 0,
        retailer_commission: 0,
        agent_commission: 0,
        platform_commission: 0,
      });
    }

    const summary = summaryMap.get(voucherType)!;
    summary.total_sales += 1;
    summary.total_amount += amount;
    summary.retailer_commission += retailerCommission;
    summary.agent_commission += agentCommission;
    summary.platform_commission += platformCommission;
  }

  return { data: Array.from(summaryMap.values()), error: null };
}

/**
 * Fetch inventory report with counts by status and voucher type
 */
export async function fetchInventoryReport(): Promise<{
  data: InventoryReport[] | null;
  error: PostgrestError | Error | null;
}> {
  const { data, error } = await supabase.from("voucher_inventory").select(`
      status,
      voucher_types!inner (name)
    `);

  if (error) {
    return { data: null, error };
  }

  // Client-side aggregation to count vouchers by type and status
  const reportMap = new Map<string, InventoryReport>();

  for (const voucher of data) {
    const voucherType = voucher.voucher_types?.[0]?.name || "Unknown";

    if (!reportMap.has(voucherType)) {
      reportMap.set(voucherType, {
        voucher_type: voucherType,
        available: 0,
        sold: 0,
        disabled: 0,
      });
    }

    const report = reportMap.get(voucherType)!;

    if (voucher.status === "available") {
      report.available += 1;
    } else if (voucher.status === "sold") {
      report.sold += 1;
    } else if (voucher.status === "disabled") {
      report.disabled += 1;
    }
  }

  return { data: Array.from(reportMap.values()), error: null };
}
