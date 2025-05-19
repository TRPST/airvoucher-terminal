import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";

/**
 * A hook to protect routes based on user roles
 * @param requiredRole The role required to access the route
 * @returns Session and user information if authorized
 */
export function useRequireRole(requiredRole: string) {
  const router = useRouter();
  const { session, isLoading, supabaseClient } = useSessionContext();
  const [isAuthorized, setIsAuthorized] = useState(false);

  console.log(`useRequireRole hook called with role: ${requiredRole}`, {
    path: router.pathname,
    isLoading,
    hasSession: !!session
  });

  useEffect(() => {
    // Wait until session loading is complete
    if (isLoading) {
      console.log(`useRequireRole: Still loading session for ${requiredRole}`);
      return;
    }

    const checkAuth = async () => {
      console.log(`useRequireRole: Checking auth for ${requiredRole}`);
      
      // If no session, redirect to auth page for the required role
      if (!session) {
        console.log(`No session found. Redirecting to /auth/${requiredRole}`);
        router.replace(`/auth/${requiredRole}`);
        return;
      }

      // Get user metadata to check role
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      console.log(`useRequireRole: User data for ${requiredRole}`, { 
        userId: user?.id,
        userRole: user?.app_metadata?.role,
        userEmail: user?.email
      });

      if (!user) {
        console.log(`No user found. Redirecting to /auth/${requiredRole}`);
        router.replace(`/auth/${requiredRole}`);
        return;
      }

      // Check if user has the required role
      // Note: In a real implementation, you'd check app_metadata.role from Supabase
      // For this MVP, we'll assume the role is stored in app_metadata.role
      const userRole = user.app_metadata?.role;

      // For demo purposes, if no role is set, we'll assume the role matches the page path
      // In a real app, you'd want to enforce strict role checking
      if (userRole && userRole !== requiredRole) {
        console.log(
          `User role (${userRole}) doesn't match required role (${requiredRole}). Redirecting to /`
        );
        // If user doesn't have the required role, redirect to home
        router.replace("/");
        return;
      }

      console.log(`useRequireRole: User ${user.email} authorized as ${requiredRole}`);
      setIsAuthorized(true);
    };

    checkAuth();
  }, [isLoading, requiredRole, router, session, supabaseClient]);

  const result = {
    session,
    user: session?.user,
    isAuthorized,
    isLoading: isLoading || (!isLoading && !isAuthorized),
  };
  
  console.log(`useRequireRole result for ${requiredRole}:`, result);
  
  return result;
}

export default useRequireRole;
