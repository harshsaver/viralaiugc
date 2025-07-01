import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import LandingWaitlist from "./pages/LandingWaitlist";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { MobileWarningModal } from "./components/MobileWarningModal";

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component to conditionally show the MobileWarningModal
const MobileWarningWrapper = () => {
  const location = useLocation();
  
  return <MobileWarningModal />;
};

const App = () => {
  console.log("APP: Initializing app");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingWaitlist />} />
            <Route path="/old-landing" element={<Landing />} />
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileWarningWrapper />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
