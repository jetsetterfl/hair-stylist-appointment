import { Switch, Route, Redirect } from "wouter";
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
      <Route path="/">
        <Redirect to="/auth" />
      </Route>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={StylistDashboard} />
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