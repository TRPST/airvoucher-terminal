import supabase from "@/lib/supabaseClient";
import {
  SalesReport,
  EarningsSummary,
  InventoryReport,
  ResponseType,
} from "../types/adminTypes";

/**
 * Fetch sales report with optional date filtering
 */
export async function fetchSalesReport({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}): Promise<ResponseType<SalesReport[]>> {
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
}): Promise<ResponseType<EarningsSummary[]>> {
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
export async function fetchInventoryReport(): Promise<
  ResponseType<InventoryReport[]>
> {
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
