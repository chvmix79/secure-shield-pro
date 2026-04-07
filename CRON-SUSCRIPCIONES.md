# Configuración del Cron de Suscripciones

## Archivos creados/modificados:

### 1. Base de datos (`supabase/notificaciones.sql`)
- Tabla `notificaciones_suscripcion` para registrar notificaciones enviadas
- Columna `cuenta_bloqueada` en tabla `empresas`
- Columna `fecha_bloqueo` en tabla `empresas`

### 2. Edge Function (`supabase/functions/cron-suscripciones/index.ts`)
- Envía email de recordatorio 5 días antes del vencimiento
- Envía email de vencimiento inminente 2 días antes
- Bloquea la cuenta automáticamente 2 días después del vencimiento
- Envía email de cuenta bloqueada

## Cómo desplegar y configurar el cron:

### 1. Ejecutar SQL en Supabase
Ejecuta el contenido de `supabase/notificaciones.sql` en el SQL Editor de Supabase.

### 2. Desplegar la Edge Function
```bash
supabase functions deploy cron-suscripciones
```

### 3. Configurar el cron job
En Supabase Dashboard > Edge Functions > cron-suscripciones > Set up schedule

Programar para ejecutarse diariamente:
- Frequency: Daily
- Time: 09:00 (o la hora que prefieras)

O usando el CLI de Supabase:
```bash
supabase functions schedule cron-suscripciones "0 9 * * *"
```

## Flujo de notificaciones:

1. **5 días antes del vencimiento**: Email de recordatorio de renovación
2. **2 días antes del vencimiento**: Email de vencimiento inminente (última oportunidad)
3. **Día del vencimiento (2 días después)**: 
   - Cuenta se bloquea automáticamente
   - Email de cuenta bloqueada
   - Redirección a página de bloqueo al iniciar sesión

## Desbloqueo:
Cuando se aprueba una solicitud de pago en el admin, la cuenta se desbloquea automáticamente y se renueva por 30 días.
