// Import and re-export with namespaces to avoid name conflicts
import * as AdminActions from './adminActions';
import * as RetailerActions from './retailerActions';
import * as AgentActions from './agentActions';
import * as UserActions from './userActions';
import * as TerminalActions from './terminalActions';
import * as CashierActions from './cashierActions';

// Export namespaces
export {
  AdminActions,
  RetailerActions,
  AgentActions,
  UserActions,
  TerminalActions,
  CashierActions,
};

// Alternatively, we can selectively re-export specific items
// Admin exports
export type {
  Retailer as AdminRetailer,
  Agent,
  Terminal as AdminTerminal,
  VoucherInventory,
  CommissionGroup,
  CommissionRate,
  SalesReport,
  EarningsSummary,
  InventoryReport,
  ProfileData,
  RetailerData,
  NetworkProvider,
  VoucherCategory,
  DataDuration,
  VoucherType as EnhancedVoucherType,
} from './adminActions';

export {
  fetchRetailers,
  createRetailer,
  updateRetailer,
  updateRetailerBalance,
  fetchAgents,
  fetchAllAgents,
  fetchAgentById,
  updateAgent,
  fetchAgentRetailers,
  createAgent,
  assignRetailerToAgent,
  unassignRetailerFromAgent,
  fetchUnassignedRetailers,
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
} from './adminActions';

// Retailer exports
export type {
  RetailerProfile,
  VoucherType,
  Terminal as RetailerTerminal,
  Sale as RetailerSale,
} from './retailerActions';

export {
  fetchMyRetailer,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  sellVoucher,
  fetchSalesHistory,
  fetchTerminals as fetchRetailerTerminals,
  fetchCommissionRate,
  fetchRetailerCommissionData,
} from './retailerActions';

// Terminal exports
export type { TerminalProfile, VoucherType as TerminalVoucherType } from './terminalActions';

export {
  fetchTerminalProfile,
  fetchAvailableVoucherTypes as fetchTerminalVoucherTypes,
  fetchVoucherInventoryByType as fetchTerminalVoucherInventoryByType,
  fetchRetailerCommissionData as fetchTerminalCommissionData,
  sellVoucher as sellTerminalVoucher,
  fetchSalesHistory as fetchTerminalSalesHistory,
  fetchVoucherTypesByNetwork,
  fetchVoucherTypesByNetworkAndCategory,
  fetchVoucherTypesByNetworkCategoryAndDuration,
} from './terminalActions';

// Agent exports
export type { AgentRetailer, AgentStatement } from './agentActions';

// User exports
export type { UserProfile } from './userActions';

export { getUserRole, getUserProfile, signOutUser } from './userActions';

export { fetchMyRetailers, fetchAgentStatements, fetchAgentSummary } from './agentActions';

// Cashier exports
export type { CashierTerminalProfile } from './cashierActions';

export { fetchCashierTerminal, fetchCashierSalesHistory } from './cashierActions';
