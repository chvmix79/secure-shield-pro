import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

// Estos valores serán provistos por el usuario en el .env
const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";
const TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || "common"; // 'common' para multitenant o ID específico
const REDIRECT_URI = import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + "/microsoft365";

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Scopes necesarios para el análisis de seguridad
export const loginRequest = {
  scopes: [
    "User.Read",
    "IdentityRiskEvent.Read.All",
    "SecurityEvents.Read.All",
    "SecurityEvents.ReadWrite.All",
    "Reports.Read.All",
    "DeviceManagementManagedDevices.Read.All"
  ],
};
