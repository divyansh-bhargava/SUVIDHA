import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { VoiceAssistantProvider } from "@/contexts/VoiceAssistantContext";
import VoiceAssistantProviderWrapper from "@/components/voice/VoiceAssistantProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ServicePage from "./pages/ServicePage";
import ComplaintRegister from "./pages/ComplaintRegister";
import StatusTracking from "./pages/StatusTracking";
import Documents from "./pages/Documents";
import AdminDashboard from "./pages/AdminDashboard";
import SuvidhaRegistration from "./pages/SuvidhaRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceAssistantProvider>
            <VoiceAssistantProviderWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/register" element={<SuvidhaRegistration />} />
                <Route path="/service/:serviceType" element={<ServicePage />} />
                <Route path="/complaint/register" element={<ComplaintRegister />} />
                <Route path="/status" element={<StatusTracking />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </VoiceAssistantProviderWrapper>
          </VoiceAssistantProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
