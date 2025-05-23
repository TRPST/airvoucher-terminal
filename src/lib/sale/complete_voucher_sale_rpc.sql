-- Complete Voucher Sale Function
-- This function performs all necessary database operations for a voucher sale in a single transaction

CREATE OR REPLACE FUNCTION complete_voucher_sale(
  voucher_inventory_id UUID,
  retailer_id UUID,
  terminal_id UUID,
  voucher_type_id UUID,
  sale_amount NUMERIC(12,2),
  retailer_commission_pct NUMERIC(5,2),
  agent_commission_pct NUMERIC(5,2)
) RETURNS JSONB AS $$
DECLARE
  sale_id UUID;
  retailer_commission NUMERIC(12,2);
  agent_commission NUMERIC(12,2);
  voucher_pin TEXT;
  voucher_serial TEXT;
  retailer_balance NUMERIC(12,2);
  agent_profile_id UUID;
  terminal_name TEXT;
  retailer_name TEXT;
  product_name TEXT;
  ref_number TEXT;
  sale_timestamp TIMESTAMPTZ;
BEGIN
  -- Check if voucher is available
  PERFORM id FROM voucher_inventory 
    WHERE id = voucher_inventory_id 
    AND status = 'available';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher is not available for sale';
  END IF;
  
  -- Get retailer details and check sufficient balance
  SELECT r.balance, r.agent_profile_id, r.name 
    INTO retailer_balance, agent_profile_id, retailer_name
    FROM retailers r
    WHERE r.id = retailer_id;
  
  IF retailer_balance < sale_amount THEN
    RAISE EXCEPTION 'Insufficient balance to complete sale';
  END IF;

  -- Get terminal name
  SELECT name INTO terminal_name
    FROM terminals
    WHERE id = terminal_id;

  -- Get product name from voucher type
  SELECT name INTO product_name
    FROM voucher_types
    WHERE id = voucher_type_id;

  -- Calculate commissions
  retailer_commission := sale_amount * retailer_commission_pct;
  agent_commission := sale_amount * agent_commission_pct;
  
  -- Get voucher details
  SELECT pin, serial_number INTO voucher_pin, voucher_serial
    FROM voucher_inventory
    WHERE id = voucher_inventory_id;

  -- Generate reference number
  ref_number := 'REF-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || FLOOR(RANDOM() * 1000)::TEXT;
  
  -- Start transaction operations
  
  -- 1. Mark voucher as sold
  UPDATE voucher_inventory
  SET 
    status = 'sold',
    sold_at = NOW()
  WHERE id = voucher_inventory_id;
  
  -- 2. Create sale record
  INSERT INTO sales (
    terminal_id,
    voucher_inventory_id,
    sale_amount,
    retailer_commission,
    agent_commission
  ) VALUES (
    terminal_id,
    voucher_inventory_id,
    sale_amount,
    retailer_commission,
    agent_commission
  ) RETURNING id, created_at INTO sale_id, sale_timestamp;
  
  -- 3. Update retailer balance and commission
  UPDATE retailers
  SET 
    balance = balance - sale_amount,
    commission_balance = commission_balance + retailer_commission
  WHERE id = retailer_id;
  
  -- 4. Create transaction record
  INSERT INTO transactions (
    type,
    amount,
    balance_after,
    retailer_id,
    agent_profile_id,
    sale_id,
    notes
  ) VALUES (
    'sale',
    sale_amount,
    (SELECT balance FROM retailers WHERE id = retailer_id),
    retailer_id,
    agent_profile_id,
    sale_id,
    'Voucher sale of ' || sale_amount || ' via terminal ' || terminal_id
  );
  
  -- 5. Update terminal last_active
  UPDATE terminals
  SET last_active = NOW()
  WHERE id = terminal_id;
  
  -- Return receipt data
  RETURN jsonb_build_object(
    'sale_id', sale_id,
    'voucher_code', voucher_pin,
    'serial_number', voucher_serial,
    'ref_number', ref_number,
    'retailer_name', retailer_name,
    'terminal_name', terminal_name,
    'terminal_id', terminal_id,
    'product_name', product_name,
    'sale_amount', sale_amount,
    'retailer_commission', retailer_commission,
    'agent_commission', agent_commission,
    'timestamp', sale_timestamp
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This function needs to be executed in the Supabase SQL editor
-- After creating the function, you can call it from your code using:
-- supabase.rpc('complete_voucher_sale', { params... })
