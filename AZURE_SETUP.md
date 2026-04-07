# Configuración de Microsoft 365 (Azure AD) — Guía Completa

Para que el análisis de seguridad funcione con **datos reales**, necesitas registrar una aplicación en Azure. Los datos "mock" (aleatorios) se usan solo cuando la API de Microsoft no está conectada.

---

## Paso 1: Registrar la Aplicación en Azure

1. Ve al [Portal de Azure](https://portal.azure.com/) e ingresa con una cuenta de **administrador**.
2. Busca **"Microsoft Entra ID"** (antes Azure Active Directory).
3. En el menú lateral, selecciona **"Registros de aplicaciones"** → **"Nuevo registro"**.
4. Configura:
   - **Nombre**: `CHV CyberDefense`
   - **Tipos de cuenta**: "Cuentas en cualquier directorio organizativo (Multiinquilino)"
   - **URI de redirección**: SPA → `https://tu-dominio.com/microsoft365` (o `http://localhost:5173/microsoft365` para desarrollo)
5. Haz clic en **Registrar**.

---

## Paso 2: Configurar Permisos de API (Scopes)

1. Entra a tu app registrada → **"Permisos de API"**.
2. Clic en **"Agregar un permiso"** → **"Microsoft Graph"** → **"Permisos delegados"**.
3. Agrega estos permisos:
   - `User.Read` — Leer perfil del usuario
   - `Reports.Read.All` — Estadísticas de MFA
   - `SecurityEvents.Read.All` — Secure Score
   - `SecurityEvents.ReadWrite.All` — Escribir eventos de seguridad
   - `DeviceManagementManagedDevices.Read.All` — Dispositivos gestionados
4. Clic en **"Agregar permisos"**.
5. ** IMPORTANTE**: Clic en **"Conceder consentimiento de administrador"** (botón arriba de la tabla). Sin esto, los permisos no funcionan.

---

## Paso 3: Obtener las Credenciales

En la página de tu app registrada, ve a **"Información general"** y copia:

| Campo |Dónde encontrarlo | Ejemplo |
|-------|-----------------|---------|
| **Application (client) ID** | Página de overview | `12345678-1234-1234-1234-123456789012` |
| **Directory (tenant) ID** | Página de overview | `87654321-4321-4321-4321-210987654321` |

---

## Paso 4: Configurar variables de entorno

Edita tu archivo `.env` (o crea `.env.production`):

```env
# Azure / Microsoft 365
VITE_AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789012
VITE_AZURE_TENANT_ID=87654321-4321-4321-4321-210987654321
VITE_AZURE_REDIRECT_URI=https://tu-dominio.com/microsoft365
```

### URLs de redirección por ambiente

| Ambiente | URL de redirección |
|----------|-------------------|
| Desarrollo | `http://localhost:5173/microsoft365` |
| Staging | `https://staging.tu-dominio.com/microsoft365` |
| Producción | `https://tu-dominio.com/microsoft365` |

---

## Paso 5: Verificar que funciona

1. Inicia sesión en CHV CyberDefense.
2. Ve a **Microsoft 365** en el menú.
3. Clic en **"Conectar con Microsoft"**.
4. Acepta los permisos.
5. Deberías ver datos reales de tu tenant (Secure Score, MFA %, dispositivos).

---

## Solución de Problemas

### "AADSTS50034: The application was not found"
→ El `VITE_AZURE_CLIENT_ID` es incorrecto. Verifica que coincida con el de Azure.

### "AADSTS700016: The application was not found in the directory"
→ El `VITE_AZURE_TENANT_ID` es incorrecto o la app no está disponible para ese tenant.

### Los datos siguen siendo aleatorios
→ Verifica que concediste **consentimiento de administrador** (Paso 2.5).

### "No active account found"
→ El usuario no ha iniciado sesión con Microsoft. Debe hacer clic en "Conectar con Microsoft" primero.

---

## Datos que se obtienen de Microsoft Graph

| Métrica | Endpoint de Graph | Notas |
|---------|------------------|-------|
| Secure Score | `/security/secureScores` | Porcentaje 0-100 |
| MFA Registrados | `/reports/credentialUserRegistrationDetails` | % de usuarios con 2FA |
| Dispositivos | `/deviceManagement/managedDevices` | % de dispositivos conformes |
| Licencias | `/subscribedSkus` | Estado de licencias M365 |

---

## NOTA sobre la versión gratuita

Si no configuras Azure (no pusiste `VITE_AZURE_CLIENT_ID`), la integración de Microsoft 365 mostrará **datos de ejemplo** (números aleatorios) para que puedas ver cómo funciona la interfaz. Esto es intencional para desarrollo y demos.

Para **producción**, es obligatorio usar datos reales de Microsoft Graph.
