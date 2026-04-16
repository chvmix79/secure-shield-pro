import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EmpresaProvider } from "@/hooks/useEmpresa";
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

// QueryClient con configuración robusta anti-cascón:
// - retry: 1 (solo 1 reintento en caso de fallo, no infinito)
// - staleTime: 2 minutos (evita re-fetching innecesario al navegar entre módulos)
// - gcTime: 5 minutos (retiene datos en memoria para navegación rápida)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Helper: envuelve un page component en un ErrorBoundary aislado por módulo */
function ModuloBoundary({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary moduleName={name} reloadOnReset={false}>
      {children}
    </ErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* 
          EmpresaProvider DEBE estar dentro de BrowserRouter para que el contexto
          de empresa tenga acceso al router (useNavigate, useLocation, etc.).
          Estaba fuera en main.tsx — eso causaba desincronización de estado.
        */}
        <EmpresaProvider>
          <Routes>
            {/* ── Rutas PÚBLICAS ── */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/bloqueado" element={<CuentaBloqueada />} />
            <Route path="/phishing-feedback" element={<PhishingFeedback />} />

            {/* ── Rutas PROTEGIDAS — cada una en su propio ErrorBoundary de módulo ── */}
            <Route path="/empresa" element={<PrivateRoute><ModuloBoundary name="Empresa"><Empresa /></ModuloBoundary></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><ModuloBoundary name="Tablero Central"><Dashboard /></ModuloBoundary></PrivateRoute>} />
            <Route path="/diagnostico" element={<PrivateRoute><ModuloBoundary name="Diagnóstico"><Diagnostico /></ModuloBoundary></PrivateRoute>} />
            <Route path="/historial" element={<PrivateRoute><ModuloBoundary name="Historial"><Historial /></ModuloBoundary></PrivateRoute>} />
            <Route path="/riesgos" element={<PrivateRoute><ModuloBoundary name="Riesgos"><Riesgos /></ModuloBoundary></PrivateRoute>} />
            <Route path="/acciones" element={<PrivateRoute><ModuloBoundary name="Plan de Acción"><Acciones /></ModuloBoundary></PrivateRoute>} />
            <Route path="/evidencias" element={<PrivateRoute><ModuloBoundary name="Evidencias"><Evidencias /></ModuloBoundary></PrivateRoute>} />
            <Route path="/alertas" element={<PrivateRoute><ModuloBoundary name="Alertas"><Alertas /></ModuloBoundary></PrivateRoute>} />
            <Route path="/capacitacion" element={<PrivateRoute><ModuloBoundary name="Capacitación"><Capacitacion /></ModuloBoundary></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><ModuloBoundary name="Usuarios"><Usuarios /></ModuloBoundary></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><ModuloBoundary name="Administración"><Admin /></ModuloBoundary></PrivateRoute>} />
            <Route path="/phishing" element={<PrivateRoute><ModuloBoundary name="Phishing"><PhishingSimulations /></ModuloBoundary></PrivateRoute>} />
            <Route path="/marketplace" element={<PrivateRoute><ModuloBoundary name="Marketplace"><Marketplace /></ModuloBoundary></PrivateRoute>} />
            <Route path="/microsoft365" element={<PrivateRoute><ModuloBoundary name="Microsoft 365"><Microsoft365 /></ModuloBoundary></PrivateRoute>} />
            <Route path="/vulnerabilidades" element={<PrivateRoute><ModuloBoundary name="Vulnerabilidades"><Vulnerabilidades /></ModuloBoundary></PrivateRoute>} />
            <Route path="/chat-ciberseguridad" element={<PrivateRoute><ModuloBoundary name="Experto Ciberseguridad"><ChatCiberseguridad /></ModuloBoundary></PrivateRoute>} />
            <Route path="/chat-auditor" element={<PrivateRoute><ModuloBoundary name="Experto Auditor"><ChatAuditor /></ModuloBoundary></PrivateRoute>} />
            <Route path="/documentos" element={<PrivateRoute><ModuloBoundary name="Cumplimiento"><DocumentosCumplimiento /></ModuloBoundary></PrivateRoute>} />
            <Route path="/planes" element={<PrivateRoute><ModuloBoundary name="Planes"><Planes /></ModuloBoundary></PrivateRoute>} />
            <Route path="/sobre-chv" element={<PrivateRoute><ModuloBoundary name="Sobre CHV"><SobreCHV /></ModuloBoundary></PrivateRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </EmpresaProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
