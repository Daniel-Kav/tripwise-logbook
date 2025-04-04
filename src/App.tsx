import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Index from "./pages/Index";
import TripPlanner from "./pages/TripPlanner";
import LogGenerator from "./pages/LogGenerator";
import TripHistory from "./pages/TripHistory";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { keepAliveService } from "./services/keepAliveService";

const queryClient = new QueryClient();

// Component to handle the keep-alive service
const KeepAliveManager = () => {
  useEffect(() => {
    // Start the keep-alive service when the component mounts
    console.log("Starting keep-alive service to prevent backend from sleeping...");
    const intervalId = keepAliveService.startKeepAlive();
    
    // Clean up the interval when the component unmounts
    return () => {
      keepAliveService.stopKeepAlive();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Keep-alive manager to ping the backend every 10 seconds */}
          <KeepAliveManager />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/trip-planner" 
              element={
                <PrivateRoute>
                  <TripPlanner />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/log-generator" 
              element={
                <PrivateRoute>
                  <LogGenerator />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/trip-history" 
              element={
                <PrivateRoute>
                  <TripHistory />
                </PrivateRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
