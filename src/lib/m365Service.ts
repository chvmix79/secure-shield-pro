import { msalInstance, loginRequest } from "./msal";

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";

/**
 * Indica si el servicio está configurado con credenciales reales.
 * Si VITE_AZURE_CLIENT_ID es el valor por defecto (placeholder),
 * significa que NO está configurado.
 */
const AZURE_CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || "";
const IS_CONFIGURED = AZURE_CLIENT_ID && AZURE_CLIENT_ID !== "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";

export const m365Service = {
  /**
   * Retorna true si Azure AD está configurado con credenciales reales.
   */
  isConfigured(): boolean {
    return IS_CONFIGURED;
  },

  /**
   * Obtiene el token de acceso para Microsoft Graph.
   * Si no hay cuenta activa, intenta popup.
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const activeAccount = msalInstance.getActiveAccount();
      if (!activeAccount) {
        console.warn("[M365] No active Microsoft account. User needs to sign in first.");
        return null;
      }
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount
      });
      return response.accessToken;
    } catch (error) {
      console.warn("[M365] Silent token acquisition failed, trying popup:", error);
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error("[M365] Popup token acquisition failed:", popupError);
        return null;
      }
    }
  },

  /**
   * Hace una petición a Microsoft Graph.
   * Retorna null si hay error o no hay token.
   */
  async fetchFromGraph(endpoint: string): Promise<any | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${GRAPH_ENDPOINT}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.error(`[M365] Graph API error for ${endpoint}:`, response.statusText);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error(`[M365] Fetch error for ${endpoint}:`, error);
      return null;
    }
  },

  /**
   * Obtiene el Secure Score de Microsoft 365.
   * Retorna null si no está configurado o hay error.
   */
  async getSecureScore(): Promise<number | null> {
    if (!this.isConfigured()) {
      console.info("[M365] Azure not configured, returning mock data for Secure Score");
      return null;
    }

    try {
      const data = await this.fetchFromGraph("/security/secureScores");
      if (data?.value && data.value.length > 0) {
        const scoreData = data.value[0];
        const current = scoreData.currentScore || 0;
        const max = scoreData.maxScore || 100;
        return Math.round((current / max) * 100);
      }
      return null;
    } catch (error) {
      console.error("[M365] Error fetching secure score:", error);
      return null;
    }
  },

  /**
   * Obtiene estadísticas de MFA.
   * Retorna null si no está configurado o hay error.
   */
  async getMfaStats(): Promise<number | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const data = await this.fetchFromGraph("/reports/credentialUserRegistrationDetails");
      if (!data) return null;

      const users = data.value || [];
      if (users.length === 0) return null;

      const registered = users.filter((u: any) => u.isMfaRegistered).length;
      return Math.round((registered / users.length) * 100);
    } catch (error) {
      console.error("[M365] Error fetching MFA stats:", error);
      return null;
    }
  },

  /**
   * Obtiene estadísticas de dispositivos gestionados.
   * Retorna null si no está configurado o hay error.
   */
  async getManagedDevicesStats(): Promise<number | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const data = await this.fetchFromGraph("/deviceManagement/managedDevices");
      if (!data) return null;

      const devices = data.value || [];
      if (devices.length === 0) return null;

      const compliant = devices.filter((d: any) => d.complianceState === "compliant").length;
      return Math.round((compliant / devices.length) * 100);
    } catch (error) {
      console.error("[M365] Error fetching device stats:", error);
      return null;
    }
  },

  /**
   * Obtiene todas las estadísticas de M365.
   * Retorna objeto con valores reales o null si no está configurado.
   */
  async getAllStats(): Promise<{
    secureScore: number | null;
    mfaPercentage: number | null;
    deviceCompliance: number | null;
    isConfigured: boolean;
  }> {
    const [secureScore, mfaPercentage, deviceCompliance] = await Promise.all([
      this.getSecureScore(),
      this.getMfaStats(),
      this.getManagedDevicesStats(),
    ]);

    return {
      secureScore,
      mfaPercentage,
      deviceCompliance,
      isConfigured: this.isConfigured(),
    };
  },
};
