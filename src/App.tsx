import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Diagnostico from "./pages/Diagnostico";
import Riesgos from "./pages/Riesgos";
import Acciones from "./pages/Acciones";
import Evidencias from "./pages/Evidencias";
import Alertas from "./pages/Alertas";
import Capacitacion from "./pages/Capacitacion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/riesgos" element={<Riesgos />} />
          <Route path="/acciones" element={<Acciones />} />
          <Route path="/evidencias" element={<Evidencias />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/capacitacion" element={<Capacitacion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
