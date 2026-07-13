import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import RKSNotes from "./pages/RKSNotes";
import Kalkibot from "./pages/Kalkibot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [activeApp, setActiveApp] = useState<"portal" | "notes" | "kalkibot">("portal");

  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;

    if (host.includes("rksnotes") || path.startsWith("/rksnotes")) {
      setActiveApp("notes");
    } else if (host.includes("kalkibot") || path.startsWith("/kalkibot")) {
      setActiveApp("kalkibot");
    }
  }, []);

  const renderRoot = () => {
    switch (activeApp) {
      case "notes":
        return <RKSNotes />;
      case "kalkibot":
        return <Kalkibot />;
      default:
        return <Index />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={renderRoot()} />
            <Route path="/rksnotes" element={<RKSNotes />} />
            <Route path="/kalkibot" element={<Kalkibot />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
