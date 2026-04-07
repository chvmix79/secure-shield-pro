import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivateRoute } from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Diagnostico from "./pages/Diagnostico";
import Riesgos from "./pages/Riesgos";
import Acciones from "./pages/Acciones";
import Evidencias from "./pages/Evidencias";
import Alertas from "./pages/Alertas";
import Capacitacion from "./pages/Capacitacion";
import Empresa from "./pages/Empresa";
import Historial from "./pages/Historial";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Usuarios from "./pages/Usuarios";
import NotFound from "./pages/NotFound";
import PhishingSimulations from "./pages/PhishingSimulations";
import PhishingFeedback from "./pages/PhishingFeedback";
import Marketplace from "./pages/Marketplace";
import Microsoft365 from "./pages/Microsoft365";
import Vulnerabilidades from "./pages/Vulnerabilidades";
import { ChatCiberseguridad, ChatAuditor } from "./pages/ChatExpert";
import DocumentosCumplimiento from "./pages/DocumentosCumplimiento";
import Planes from "./pages/Planes";
import CuentaBloqueada from "./pages/CuentaBloqueada";
import SobreCHV from "./pages/SobreCHV";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ── Rutas PÚBLICAS ── */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/bloqueado" element={<CuentaBloqueada />} />
          <Route path="/phishing-feedback" element={<PhishingFeedback />} />

          {/* ── Rutas PROTEGIDAS — requieren sesión activa ── */}
          <Route path="/empresa" element={<PrivateRoute><Empresa /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/diagnostico" element={<PrivateRoute><Diagnostico /></PrivateRoute>} />
          <Route path="/historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
          <Route path="/riesgos" element={<PrivateRoute><Riesgos /></PrivateRoute>} />
          <Route path="/acciones" element={<PrivateRoute><Acciones /></PrivateRoute>} />
          <Route path="/evidencias" element={<PrivateRoute><Evidencias /></PrivateRoute>} />
          <Route path="/alertas" element={<PrivateRoute><Alertas /></PrivateRoute>} />
          <Route path="/capacitacion" element={<PrivateRoute><Capacitacion /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/phishing" element={<PrivateRoute><PhishingSimulations /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/microsoft365" element={<PrivateRoute><Microsoft365 /></PrivateRoute>} />
          <Route path="/vulnerabilidades" element={<PrivateRoute><Vulnerabilidades /></PrivateRoute>} />
          <Route path="/chat-ciberseguridad" element={<PrivateRoute><ChatCiberseguridad /></PrivateRoute>} />
          <Route path="/chat-auditor" element={<PrivateRoute><ChatAuditor /></PrivateRoute>} />
          <Route path="/documentos" element={<PrivateRoute><DocumentosCumplimiento /></PrivateRoute>} />
          <Route path="/planes" element={<PrivateRoute><Planes /></PrivateRoute>} />
          <Route path="/sobre-chv" element={<PrivateRoute><SobreCHV /></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
