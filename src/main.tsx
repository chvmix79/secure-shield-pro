import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // ErrorBoundary raíz: captura fallos globales que escapan de los boundaries de módulo.
  // reloadOnReset=true aquí es correcto — es el último recurso de la app.
  <ErrorBoundary reloadOnReset={true} moduleName="Aplicación Principal">
    <App />
  </ErrorBoundary>
);
