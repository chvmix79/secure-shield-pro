import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { EmpresaProvider } from "./hooks/useEmpresa";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <EmpresaProvider>
    <App />
  </EmpresaProvider>
);
