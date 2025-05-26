"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/router";
import { getUserRole, signOutUser } from "@/actions/userActions";

interface CustomAuthProps {
  role: string;
}

export function CustomAuth({ role }: CustomAuthProps) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get user's role from profiles table
  const getUserRoleFromProfile = async (userId: string) => {
    const { data, error } = await getUserRole(userId);
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log("User signed in successfully:", data.user.id);
        
        // Get user's role from profiles table
        const userRole = await getUserRoleFromProfile(data.user.id);
        console.log(`User role from profiles table: ${userRole}`);
        
        if (userRole && role) {
          if (userRole === role) {
            // Role matches, redirect to dashboard
            console.log(`User has correct role (${userRole}), redirecting to dashboard...`);
            await router.push(`/${role}`);
          } else {
            // Role doesn't match, sign them out
            console.log(`User has role ${userRole} but trying to access ${role} portal. Access denied.`);
            const { error: signOutError } = await signOutUser();
            if (signOutError) {
              console.error("Error signing out:", signOutError);
            }
            setError(`Access denied. You don't have permission to access the ${role} portal.`);
          }
        } else if (!userRole) {
          // No role found in profiles table
          console.log("No role found in user profile. Access denied.");
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          setError("Your account doesn't have access permissions. Please contact an administrator.");
        }
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              <span>Signing in...</span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </div>
  );
} 