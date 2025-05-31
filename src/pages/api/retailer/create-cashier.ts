import { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, terminalName, retailerId } = req.body;

    // Verify the requesting user is authorized (they should be a retailer)
    const supabase = createClient(req, res);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the user is a retailer and owns the retailer ID they're creating a terminal for
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('id')
      .eq('id', retailerId)
      .eq('user_profile_id', user.id)
      .single();

    if (retailerError || !retailer) {
      return res.status(403).json({ error: 'Forbidden: You can only create terminals for your own retailer account' });
    }

    // Create admin client with service role key
    const adminSupabase = createAdminClient();

    // Create user with admin API
    const { data: authData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'cashier',
        terminal_name: terminalName,
        retailer_id: retailerId,
      },
    });

    if (createError) {
      console.error('Error creating cashier auth user:', createError);
      return res.status(400).json({ error: createError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create cashier user' });
    }

    // Extract a name from the email or use a default
    const emailName = email.split('@')[0];
    const fullName = `${emailName.charAt(0).toUpperCase()}${emailName.slice(1)} (${terminalName})`;

    // Create profile for the cashier
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'cashier',
      });

    if (profileError) {
      console.error('Error creating cashier profile:', profileError);
      // Try to clean up the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    // Create the terminal linked to the retailer and cashier
    const { data: terminal, error: terminalError } = await adminSupabase
      .from('terminals')
      .insert({
        retailer_id: retailerId,
        name: terminalName,
        cashier_profile_id: authData.user.id,
        status: 'active',
      })
      .select()
      .single();

    if (terminalError) {
      console.error('Error creating terminal:', terminalError);
      // Try to clean up the user if terminal creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: terminalError.message });
    }

    return res.status(200).json({ 
      terminal: {
        id: terminal.id,
        name: terminal.name,
        last_active: terminal.last_active,
        status: terminal.status,
      },
      cashierId: authData.user.id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
