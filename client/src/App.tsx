import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StylistDashboard from "@/pages/stylist-dashboard";
import BookAppointment from "@/pages/book-appointment";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={StylistDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/book" component={BookAppointment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
