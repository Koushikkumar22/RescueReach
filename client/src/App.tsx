import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import EmergencyLocator from "@/pages/emergency-locator";
import NotFound from "@/pages/not-found";
import IncidentDetailPage from "@/pages/incident-detail"; // ✅ Add this import

function Router() {
  return (
    <Switch>
      <Route path="/" component={EmergencyLocator} />
      {/* ✅ Dynamic route for each incident */}
      <Route path="/incident/:id" component={IncidentDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
