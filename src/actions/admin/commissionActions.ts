import supabase from "@/lib/supabaseClient";
import { CommissionGroup, ResponseType } from "../types/adminTypes";

/**
 * Fetch all commission groups with their rates
 */
export async function fetchCommissionGroups(): Promise<
  ResponseType<CommissionGroup[]>
> {
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
): Promise<ResponseType<{ id: string }>> {
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
