// Import and re-export with namespaces to avoid name conflicts
import * as AdminActions from "./adminActions";
import * as RetailerActions from "./retailerActions";
import * as AgentActions from "./agentActions";

// Export namespaces
export { AdminActions, RetailerActions, AgentActions };

// Alternatively, we can selectively re-export specific items
// Admin exports
export type {
  Retailer as AdminRetailer,
  Terminal as AdminTerminal,
  VoucherInventory,
  CommissionGroup,
  CommissionRate,
  SalesReport,
  EarningsSummary,
  InventoryReport,
  ProfileData,
  RetailerData,
} from "./adminActions";

export {
  fetchRetailers,
  createRetailer,
  updateRetailer,
  fetchTerminals as fetchAdminTerminals,
  createTerminal,
  fetchVoucherInventory,
  uploadVouchers,
  disableVoucher,
  fetchCommissionGroups,
  upsertCommissionRate,
  fetchVoucherTypes,
  createCommissionGroup,
  createCommissionRates,
  fetchSalesReport,
  fetchEarningsSummary,
  fetchInventoryReport,
} from "./adminActions";

// Retailer exports
export type {
  RetailerProfile,
  VoucherType,
  Terminal as RetailerTerminal,
  Sale as RetailerSale,
} from "./retailerActions";

export {
  fetchMyRetailer,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  sellVoucher,
  fetchSalesHistory,
  fetchTerminals as fetchRetailerTerminals,
} from "./retailerActions";

// Agent exports
export type { AgentRetailer, AgentStatement } from "./agentActions";

export {
  fetchMyRetailers,
  fetchAgentStatements,
  fetchAgentSummary,
} from "./agentActions";
