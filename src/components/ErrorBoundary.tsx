import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  /** Si es true, el botón de reset recargará la página completa (uso en root). Por defecto false = solo resetea el estado del boundary. */
  reloadOnReset?: boolean;
  /** Callback opcional al resetear */
  onReset?: () => void;
  /** Nombre del módulo para mensajes de error más claros */
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const module = this.props.moduleName || 'desconocido';
    console.error(`[ErrorBoundary][${module}] Error no capturado:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
    if (this.props.reloadOnReset) {
      window.location.reload();
    }
    // Sin reloadOnReset solo resetea el estado — el módulo se re-renderiza sin recargar toda la app
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleReset}
          moduleName={this.props.moduleName}
        />
      );
    }

    return this.props.children;
  }
}
