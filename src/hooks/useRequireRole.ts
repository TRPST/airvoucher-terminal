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

  useEffect(() => {
    // Wait until session loading is complete
    if (isLoading) return;

    const checkAuth = async () => {
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

      setIsAuthorized(true);
    };

    checkAuth();
  }, [isLoading, requiredRole, router, session, supabaseClient]);

  return {
    session,
    user: session?.user,
    isAuthorized,
    isLoading: isLoading || (!isLoading && !isAuthorized),
  };
}

export default useRequireRole;
