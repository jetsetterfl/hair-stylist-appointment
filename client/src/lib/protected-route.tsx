import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type Role = "stylist" | "customer";

export function ProtectedRoute({
  path,
  component: Component,
  requireRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  requireRole?: Role;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Handle role-based access
  if (requireRole) {
    const isStyleOwner = user.isStyleOwner;
    const hasCorrectRole = (requireRole === "stylist" && isStyleOwner) || 
                          (requireRole === "customer" && !isStyleOwner);

    if (!hasCorrectRole) {
      return (
        <Route path={path}>
          <Redirect to={isStyleOwner ? "/dashboard" : "/book"} />
        </Route>
      );
    }
  }

  return <Component />;
}