# Database Tables Overview

## 1. **Commission Group Rates**
- **Table Name:** `commission_group_rates`
- **Description:** Stores commission rates for different groups and voucher types.
- **Fields:**
  - `id` (uuid): Unique identifier for each record.
  - `commission_group_id` (uuid): Foreign key referencing `commission_groups(id)`.
  - `voucher_type_id` (uuid): Foreign key referencing `voucher_types(id)`.
  - `retailer_pct` (numeric(5,2)): Percentage for retailers.
  - `agent_pct` (numeric(5,2)): Percentage for agents.
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.

## 2. **Commission Groups**
- **Table Name:** `commission_groups`
- **Description:** Contains different commission groups.
- **Fields:**
  - `id` (uuid): Unique identifier for each group.
  - `name` (text): Name of the commission group.
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.
  - `description` (text): Optional description of the group.

## 3. **Profiles**
- **Table Name:** `profiles`
- **Description:** Stores user profiles linked to the authentication system.
- **Fields:**
  - `id` (uuid): Unique identifier for each profile.
  - `role` (text): Role of the user (admin, retailer, agent).
  - `full_name` (text): Full name of the user.
  - `email` (text): Email address of the user.
  - `phone` (text): Optional phone number.
  - `avatar_url` (text): Optional URL for the user's avatar.
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.

## 4. **Retailers**
- **Table Name:** `retailers`
- **Description:** Contains information about retailers.
- **Fields:**
  - `id` (uuid): Unique identifier for each retailer.
  - `user_profile_id` (uuid): Foreign key referencing `profiles(id)`.
  - `name` (text): Name of the retailer.
  - `contact_name` (text): Optional contact person's name.
  - `contact_email` (text): Optional contact email.
  - `location` (text): Optional location of the retailer.
  - `agent_profile_id` (uuid): Foreign key referencing `profiles(id)`.
  - `commission_group_id` (uuid): Foreign key referencing `commission_groups(id)`.
  - `balance` (numeric(12,2)): Current balance of the retailer.
  - `credit_limit` (numeric(12,2)): Credit limit for the retailer.
  - `credit_used` (numeric(12,2)): Amount of credit used.
  - `commission_balance` (numeric(12,2)): Balance of commissions.
  - `status` (text): Current status of the retailer (active, suspended, inactive).
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.

## 5. **Sales**
- **Table Name:** `sales`
- **Description:** Records details of completed sales transactions.
- **Fields:**
  - `id` (uuid): Unique identifier for each sale.
  - `terminal_id` (uuid): Foreign key referencing `terminals(id)`.
  - `voucher_inventory_id` (uuid): Foreign key referencing `voucher_inventory(id)`.
  - `sale_amount` (numeric(12,2)): Amount of the sale.
  - `retailer_commission` (numeric(12,2)): Commission for the retailer.
  - `agent_commission` (numeric(12,2)): Commission for the agent.
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `profit` (numeric): Profit from the sale.

## 6. **Terminals**
- **Table Name:** `terminals`
- **Description:** Contains information about sales terminals.
- **Fields:**
  - `id` (uuid): Unique identifier for each terminal.
  - `retailer_id` (uuid): Foreign key referencing `retailers(id)`.
  - `name` (text): Name of the terminal.
  - `last_active` (timestamp with time zone): Timestamp of last activity.
  - `status` (text): Current status of the terminal (active, inactive).
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.

## 7. **Transactions**
- **Table Name:** `transactions`
- **Description:** Logs all financial transactions related to sales and retailer balances.
- **Fields:**
  - `id` (uuid): Unique identifier for each transaction.
  - `type` (text): Type of transaction (deposit, withdrawal, sale, etc.).
  - `amount` (numeric(12,2)): Amount involved in the transaction.
  - `balance_after` (numeric(12,2)): Balance after the transaction.
  - `retailer_id` (uuid): Foreign key referencing `retailers(id)`.
  - `agent_profile_id` (uuid): Foreign key referencing `profiles(id)`.
  - `sale_id` (uuid): Foreign key referencing `sales(id)`.
  - `notes` (text): Optional notes about the transaction.
  - `created_at` (timestamp with time zone): Timestamp of record creation.

## 8. **Voucher Inventory**
- **Table Name:** `voucher_inventory`
- **Description:** Manages the available vouchers for sale.
- **Fields:**
  - `id` (uuid): Unique identifier for each voucher.
  - `voucher_type_id` (uuid): Foreign key referencing `voucher_types(id)`.
  - `amount` (numeric(12,2)): Amount associated with the voucher.
  - `pin` (text): Unique pin for the voucher.
  - `serial_number` (text): Optional serial number.
  - `expiry_date` (date): Optional expiry date of the voucher.
  - `status` (text): Current status of the voucher (available, sold, disabled).
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `sold_at` (timestamp with time zone): Timestamp of when the voucher was sold.

## 9. **Voucher Types**
- **Table Name:** `voucher_types`
- **Description:** Defines different types of vouchers available for sale.
- **Fields:**
  - `id` (uuid): Unique identifier for each voucher type.
  - `name` (text): Name of the voucher type.
  - `supplier_commission_pct` (numeric(5,2)): Commission percentage for suppliers.
  - `created_at` (timestamp with time zone): Timestamp of record creation.
  - `updated_at` (timestamp with time zone): Timestamp of last update.

## Relationships
- **Profiles** are linked to **Retailers** through `user_profile_id`.
- **Retailers** can have multiple **Terminals** and are linked to **Sales** through `retailer_id`.
- **Sales** are linked to **Voucher Inventory** through `voucher_inventory_id`.
- **Transactions** can reference **Sales**, **Retailers**, and **Profiles** for agents.
- **Commission Group Rates** are linked to **Commission Groups** and **Voucher Types**.

This overview provides