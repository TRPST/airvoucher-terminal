# AirVoucher Database Schema Overview

Use this document to provide Cline with full context on the Supabase tables and how they relate. This covers all core entities, their columns, data types, constraints, and foreign-key relationships.

---

## 1. `profiles`

Stores user metadata for all roles (admin, retailer, agent, terminal).

| Column       | Type          | Constraints                                      |
| ------------ | ------------- | ------------------------------------------------ |
| `id`         | `uuid`        | Primary Key, references `auth.users(id)`         |
| `role`       | `text`        | `'admin'`, `'retailer'`, `'agent'`, `'terminal'` |
| `full_name`  | `text`        | not null                                         |
| `email`      | `text`        | not null                                         |
| `phone`      | `text`        |                                                  |
| `avatar_url` | `text`        |                                                  |
| `created_at` | `timestamptz` | default `now()`                                  |
| `updated_at` | `timestamptz` | default `now()`, auto-updated on change          |

**Relations:**

- 1:1 with `auth.users` via `profiles.id = auth.users.id`.
- `retailers.user_profile_id` → `profiles.id`
- `terminals.auth_user_id` → `profiles.id`
- `retailers.agent_profile_id` → `profiles.id`
- `transactions.agent_profile_id` → `profiles.id`

---

## 2. `voucher_types`

Defines each voucher category and supplier commission rate.

| Column                     | Type           | Constraints     |
| -------------------------- | -------------- | --------------- |
| `id`                       | `uuid`         | Primary Key     |
| `name`                     | `text`         | not null        |
| `supplier_commission_pct`  | `numeric(5,2)` | not null, ≥ 0   |
| `created_at`, `updated_at` | `timestamptz`  | default `now()` |

**Relations:**

- `voucher_inventory.voucher_type_id` → `voucher_types.id`
- `commission_group_rates.voucher_type_id` → `voucher_types.id`

---

## 3. `commission_groups`

Defines named commission tiers that group multiple rate entries.

| Column                     | Type          | Constraints     |
| -------------------------- | ------------- | --------------- |
| `id`                       | `uuid`        | Primary Key     |
| `name`                     | `text`        | not null        |
| `created_at`, `updated_at` | `timestamptz` | default `now()` |

**Relations:**

- `retailers.commission_group_id` → `commission_groups.id`
- `commission_group_rates.commission_group_id` → `commission_groups.id`

---

## 4. `commission_group_rates`

Stores retailer & agent percentage splits for each voucher type, per group.

| Column                     | Type           | Constraints                 |
| -------------------------- | -------------- | --------------------------- |
| `id`                       | `uuid`         | Primary Key                 |
| `commission_group_id`      | `uuid`         | FK → `commission_groups.id` |
| `voucher_type_id`          | `uuid`         | FK → `voucher_types.id`     |
| `retailer_pct`             | `numeric(5,2)` | not null, ≥ 0               |
| `agent_pct`                | `numeric(5,2)` | not null, ≥ 0               |
| `created_at`, `updated_at` | `timestamptz`  | default `now()`             |

**Unique Constraint:** `(commission_group_id, voucher_type_id)`

---

## 5. `retailers`

Represents each merchant account, with balances and commission grouping.

| Column                     | Type            | Constraints                                                 |
| -------------------------- | --------------- | ----------------------------------------------------------- |
| `id`                       | `uuid`          | Primary Key                                                 |
| `user_profile_id`          | `uuid`          | FK → `profiles.id` (role = `retailer`)                      |
| `name`                     | `text`          | not null                                                    |
| `contact_name`             | `text`          |                                                             |
| `contact_email`            | `text`          |                                                             |
| `location`                 | `text`          |                                                             |
| `agent_profile_id`         | `uuid`          | FK → `profiles.id` (role = `agent`), nullable               |
| `commission_group_id`      | `uuid`          | FK → `commission_groups.id`, nullable                       |
| `balance`                  | `numeric(12,2)` | not null, default `0.00`                                    |
| `credit_limit`             | `numeric(12,2)` | not null, default `0.00`                                    |
| `credit_used`              | `numeric(12,2)` | not null, default `0.00`                                    |
| `commission_balance`       | `numeric(12,2)` | not null, default `0.00`                                    |
| `status`                   | `text`          | `'active'`, `'suspended'`, `'inactive'`, default `'active'` |
| `created_at`, `updated_at` | `timestamptz`   | default `now()`                                             |

**Relations:**

- `profiles` → `retailers.user_profile_id`
- `terminals.retailer_id` → `retailers.id`
- `sales` → retail via `sales.terminal_id → terminals → retailers.id`
- `transactions.retailer_id` → `retailers.id`

---

## 6. `terminals`

Defines each POS device or session under a retailer.

| Column                     | Type          | Constraints                            |
| -------------------------- | ------------- | -------------------------------------- |
| `id`                       | `uuid`        | Primary Key                            |
| `retailer_id`              | `uuid`        | FK → `retailers.id`                    |
| `auth_user_id`             | `uuid`        | FK → `profiles.id` (role = `terminal`) |
| `name`                     | `text`        | not null                               |
| `last_active`              | `timestamptz` |                                        |
| `status`                   | `text`        | `'active'`, `'inactive'`               |
| `created_at`, `updated_at` | `timestamptz` | default `now()`                        |

**Relations:**

- `sales.terminal_id` → `terminals.id`

---

## 7. `voucher_inventory`

Holds individual voucher codes, amounts, serials, and statuses.

| Column            | Type            | Constraints                           |
| ----------------- | --------------- | ------------------------------------- |
| `id`              | `uuid`          | Primary Key                           |
| `voucher_type_id` | `uuid`          | FK → `voucher_types.id`               |
| `amount`          | `numeric(12,2)` | not null                              |
| `pin`             | `text`          | not null, unique                      |
| `serial_number`   | `text`          |                                       |
| `expiry_date`     | `date`          |                                       |
| `status`          | `text`          | `'available'`, `'sold'`, `'disabled'` |
| `created_at`      | `timestamptz`   | default `now()`                       |
| `sold_at`         | `timestamptz`   |                                       |

**Relations:**

- `sales.voucher_inventory_id` → `voucher_inventory.id`

---

## 8. `sales`

Records each voucher sale transaction.

| Column                 | Type            | Constraints                 |
| ---------------------- | --------------- | --------------------------- |
| `id`                   | `uuid`          | Primary Key                 |
| `terminal_id`          | `uuid`          | FK → `terminals.id`         |
| `voucher_inventory_id` | `uuid`          | FK → `voucher_inventory.id` |
| `sale_amount`          | `numeric(12,2)` | not null                    |
| `retailer_commission`  | `numeric(12,2)` | not null                    |
| `agent_commission`     | `numeric(12,2)` | not null                    |
| `created_at`           | `timestamptz`   | default `now()`             |

**Relations:**

- `transactions.sale_id` → `sales.id`

---

## 9. `transactions`

General ledger for all financial events.

| Column             | Type            | Constraints                                                                                   |
| ------------------ | --------------- | --------------------------------------------------------------------------------------------- |
| `id`               | `uuid`          | Primary Key                                                                                   |
| `type`             | `text`          | Enum: `deposit`, `withdrawal`, `sale`, `commission_credit`, `commission_payout`, `adjustment` |
| `amount`           | `numeric(12,2)` | not null                                                                                      |
| `balance_after`    | `numeric(12,2)` | not null                                                                                      |
| `retailer_id`      | `uuid`          | FK → `retailers.id`, nullable                                                                 |
| `agent_profile_id` | `uuid`          | FK → `profiles.id` (role = `agent`), nullable                                                 |
| `sale_id`          | `uuid`          | FK → `sales.id`, nullable                                                                     |
| `notes`            | `text`          |                                                                                               |
| `created_at`       | `timestamptz`   | default `now()`                                                                               |

---

## Entity Relationship Summary

- **profiles** (1:1) **auth.users**
- **profiles** (1:∞) **retailers**, **terminals**
- **retailers** (1:∞) **terminals**, indirectly **sales** & **transactions**
- **terminals** (1:∞) **sales**
- **voucher_types** (1:∞) **voucher_inventory**, **commission_group_rates**
- **voucher_inventory** (1:∞) **sales**
- **commission_groups** (1:∞) **commission_group_rates**, **retailers**
- **commission_group_rates** links **commission_groups** ↔ **voucher_types**
- **sales** (1:∞) **transactions**

Use this schema breakdown to guide Cline in wiring up all data-access layers, ensuring each UI feature connects to the correct table and relationship.
