# Database Summary

## Tables

### 1. commission_group_rates
- **Fields:**
  - `id` (uuid, Primary Key)
  - `commission_group_id` (uuid, Foreign Key)
  - `voucher_type_id` (uuid, Foreign Key)
  - `retailer_pct` (numeric(5,2))
  - `agent_pct` (numeric(5,2))
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)
- **Relationships:**
  - Foreign Key to `commission_groups(id)`
  - Foreign Key to `voucher_types(id)`

### 2. commission_groups
- **Fields:**
  - `id` (uuid, Primary Key)
  - `name` (text)
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)
  - `description` (text, Nullable)

### 3. profiles
- **Fields:**
  - `id` (uuid, Primary Key, Foreign Key)
  - `role` (text)
  - `full_name` (text)
  - `email` (text)
  - `phone` (text, Nullable)
  - `avatar_url` (text, Nullable)
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)
- **Relationships:**
  - Foreign Key to `auth.users(id)`

### 4. retailers
- **Fields:**
  - `id` (uuid, Primary Key)
  - `user_profile_id` (uuid, Foreign Key)
  - `name` (text)
  - `contact_name` (text, Nullable)
  - `contact_email` (text, Nullable)
  - `location` (text, Nullable)
  - `agent_profile_id` (uuid, Foreign Key, Nullable)
  - `commission_group_id` (uuid, Foreign Key, Nullable)
  - `balance` (numeric(12,2))
  - `credit_limit` (numeric(12,2))
  - `credit_used` (numeric(12,2))
  - `commission_balance` (numeric(12,2))
  - `status` (text)
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)
- **Relationships:**
  - Foreign Key to `profiles(id)`
  - Foreign Key to `commission_groups(id)`
  - Foreign Key to `profiles(id)` (for `agent_profile_id`)

### 5. sales
- **Fields:**
  - `id` (uuid, Primary Key)
  - `terminal_id` (uuid, Foreign Key, Nullable)
  - `voucher_inventory_id` (uuid, Foreign Key)
  - `sale_amount` (numeric(12,2))
  - `retailer_commission` (numeric(12,2))
  - `agent_commission` (numeric(12,2))
  - `created_at` (timestamp with time zone)
  - `profit` (numeric, Nullable)
  - `ref_number` (text)
  - `supplier_commission` (numeric)
- **Relationships:**
  - Foreign Key to `terminals(id)`
  - Foreign Key to `voucher_inventory(id)`

### 6. terminals
- **Fields:**
  - `id` (uuid, Primary Key)
  - `retailer_id` (uuid, Foreign Key)
  - `name` (text)
  - `last_active` (timestamp with time zone, Nullable)
  - `status` (text)
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)
  - `auth_user_id` (uuid, Foreign Key, Nullable)
  - `cashier_profile_id` (uuid, Foreign Key, Nullable)
- **Relationships:**
  - Foreign Key to `retailers(id)`
  - Foreign Key to `profiles(id)` (for `auth_user_id`)
  - Foreign Key to `profiles(id)` (for `cashier_profile_id`)

### 7. transactions
- **Fields:**
  - `id` (uuid, Primary Key)
  - `type` (text)
  - `amount` (numeric(12,2))
  - `balance_after` (numeric(12,2))
  - `retailer_id` (uuid, Foreign Key, Nullable)
  - `agent_profile_id` (uuid, Foreign Key, Nullable)
  - `sale_id` (uuid, Foreign Key, Nullable)
  - `notes` (text, Nullable)
  - `created_at` (timestamp with time zone)
- **Relationships:**
  - Foreign Key to `retailers(id)`
  - Foreign Key to `profiles(id)` (for `agent_profile_id`)
  - Foreign Key to `sales(id)`

### 8. voucher_inventory
- **Fields:**
  - `id` (uuid, Primary Key)
  - `voucher_type_id` (uuid, Foreign Key)
  - `amount` (numeric(12,2))
  - `pin` (text)
  - `serial_number` (text, Nullable)
  - `expiry_date` (date, Nullable)
  - `status` (text)
  - `created_at` (timestamp with time zone)
  - `sold_at` (timestamp with time zone, Nullable)
- **Relationships:**
  - Foreign Key to `voucher_types(id)`

### 9. voucher_types
- **Fields:**
  - `id` (uuid, Primary Key)
  - `name` (text)
  - `supplier_commission_pct` (numeric(5,2))
  - `created_at` (timestamp with time zone)
  - `updated_at` (timestamp with time zone)