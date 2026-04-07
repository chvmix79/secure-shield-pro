export const documentTemplates = {
  "politica-seguridad": {
    nombre: "Política de Seguridad de la Información",
    norma: "ISO 27001:2022 - A.5.1",
    contenido: `POLÍTICA DE SEGURIDAD DE LA INFORMACIÓN

1. INTRODUCCIÓN
[Nombre de la Empresa], en adelante "la Empresa", reconoce la importancia de proteger su información y los activos de información de la organización. Esta política establece el marco general para la gestión de la seguridad de la información.

2. ALCANCE
Esta política aplica a:
- Todos los empleados de la Empresa
- Contratistas y personal tercero
- Sistemas de información y datos
- Infraestructura tecnológica
- Operaciones de negocio

3. OBJETIVOS DE SEGURIDAD
- Garantizar la confidencialidad, integridad y disponibilidad de la información
- Proteger los activos de información contra amenazas internas y externas
- Cumplir con los requisitos legales y regulatorios aplicables
- Establecer un marco de gestión de riesgos de seguridad

4. ROLOS Y RESPONSABILIDADES

4.1 Dirección
- Aprobar la política de seguridad
- Asignar recursos para la implementación
- Revisar periódicamente la efectividad

4.2 Responsable de Seguridad
- Gestionar el SGSI (Sistema de Gestión de Seguridad de la Información)
- Coordinar la implementación de controles
- Reportar sobre el estado de seguridad

4.3 Todos los empleados
- Cumplir con las políticas y procedimientos
- Reportar incidentes de seguridad
- Participar en capacitaciones

5. GESTIÓN DE RIESGOS
La Empresa establece un proceso de gestión de riesgos que incluye:
- Identificación de activos y amenazas
- Evaluación de vulnerabilidades
- Análisis de impacto
- Tratamiento de riesgos

6. CONTROLES DE SEGURIDAD
La Empresa implementa controles en las siguientes áreas:
- Control de acceso (identificación, autenticación, autorización)
- Cifrado de información sensible
- Gestión de dispositivos y medios
- Seguridad de redes y comunicaciones
- Gestión de incidentes
- Capacitación y conciencia

7. CUMPLIMIENTO NORMATIVO
Esta política se alinea con:
- ISO 27001:2022
- Ley 1581 de 2012 (Protección de Datos Colombia)
- GDPR (cuando aplique)
- Otras regulaciones aplicables

8. REVISIÓN Y MEJORA
Esta política será revisada anualmente y cuando ocurran cambios significativos en la organización o el entorno.

9. APROBACIÓN

_________________________
Nombre: [Gerente/Director]
Fecha: [Fecha de aprobación]
Firma: ___________________

---

Versión: 1.0
Fecha de creación: [Fecha]
Próxima revisión: [Fecha + 1 año]`
  },
  
  "politica-contraseñas": {
    nombre: "Política de Contraseñas",
    norma: "ISO 27001:2022 - A.8.3",
    contenido: `POLÍTICA DE CONTRASEÑAS

1. PROPÓSITO
Establecer los requisitos para la creación, uso y gestión de contraseñas que protejan los sistemas y datos de la Empresa.

2. ALCANCE
Aplica a todas las cuentas de usuario en sistemas de información de la Empresa.

3. REQUISITOS DE CONTRASEÑA

3.1 Longitud mínima
- Mínimo 12 caracteres

3.2 Complejidad
Debe incluir al menos:
- Letras mayúsculas (A-Z)
- Letras minúsculas (a-z)
- Números (0-9)
- Caracteres especiales (!@#$%^&*)

3.3 Historial
- No se pueden usar las últimas 12 contraseñas anteriores

3.4 Vigencia
- Cambio obligatorio cada 90 días
- Aviso de expiración 7 días antes

3.5 Bloqueo
- Cuenta bloqueada después de 5 intentos fallidos
- Bloqueo por 30 minutos o hasta que un administrador la desbloquee

4. RESTRICCIONES

4.1 Contraseñas prohibidas
- No usar información personal (nombre, fecha de nacimiento)
- No usar palabras del diccionario
- No usar secuencias (123456, abcdef)
- No usar el nombre de la empresa

4.2 Protección
- Las contraseñas nunca deben compartirse
- No escribir contraseñas en papel
- No almacenar en archivos o navegadores

5. GESTIÓN DE CONTRASEÑAS

5.1 Recuperación
- Proceso de verificación de identidad
- Correo electrónico verificado
- Preguntas de seguridad

5.2 Administradores
- Contraseñas de admin: mínimo 16 caracteres
- Cambio obligatorio cada 60 días
- Uso obligatorio de 2FA

6. CUMPLIMIENTO
El incumplimiento de esta política puede resultar en:
- Sanciones disciplinarias
- Revocación de accesos
- Notificaciones de seguridad

---

Aprobado por: [Nombre]
Fecha: [Fecha]`
  },

  "plan-respuesta-incidentes": {
    nombre: "Plan de Respuesta a Incidentes",
    norma: "ISO 27001:2022 - A.5.24",
    contenido: `PLAN DE RESPUESTA A INCIDENTES DE SEGURIDAD

1. PROPÓSITO
Establecer los procedimientos para detectar, responder y recuperarse de incidentes de seguridad de la información.

2. ALCANCE
Aplica a todos los incidentes de seguridad que afecten:
- Sistemas de información
- Datos de la empresa
- Servicios de tecnología
- Infraestructura

3. DEFINICIONES

3.1 Incidente de Seguridad
Evento que compromete la confidencialidad, integridad o disponibilidad de la información.

3.2 Tipos de incidentes
- Acceso no autorizado
- Uso indebido
- Negación de servicio
- Infección por malware
- Filtración de datos
- Phishing
- Ransomware

4. EQUIPO DE RESPUESTA

4.1 Miembros
- Responsable de Seguridad (Líder)
- Administrador de Sistemas
- Representante de Legal
- Comunicaciones

4.2 Contacto
- Email: seguridad@empresa.com
- Teléfono: [Número de emergencia]

5. PROCEDIMIENTO DE RESPUESTA

5.1 Fase 1: Detección y Análisis
- Identificar el incidente
- Determinarseveridad (Crítica/Alta/Media/Baja)
- Documentar hallazgos
- Notificar al equipo

5.2 Fase 2: Contención
- Aislar sistemas afectados
- Preservar evidencia
- Evitar propagación
- Activar plan de contingencia

5.3 Fase 3: Erradicación
- Eliminar amenaza
- Aplicar parches
- Fortalecer controles
- Verificar limpieza

5.4 Fase 4: Recuperación
- Restaurar servicios
- Verificar funcionamiento
- Monitorear comportamiento
- Retornar a operación normal

5.5 Fase 5: Lecciones Aprendidas
- Documentar incidente
- Analizar causa raíz
- Mejorar controles
- Actualizar procedimientos

6. ESCALAMIENTO

6.1 Niveles de severidad
- CRÍTICA: afecta operación completa, datos comprometidos → Escalar a Dirección
- ALTA: múltiples sistemas, datos en riesgo → Escalar a Gerencia
- MEDIA: sistema único,controlable → Equipo de IT
- BAJA: intento detectado, sin impacto → Monitorear

7. COMUNICACIÓN

7.1 Interno
- Notificar dentro de 1 hora a equipo de respuesta
- Reporte ejecutivo a dirección dentro de 24 horas

7.2 Externo
- Notificar a autoridades (si aplica) dentro de 72 horas
- Comunicar a afectados (si aplica)
- Preservar reputación

8. REGISTROS
Todos los incidentes deben documentarse en el sistema de gestión con:
- Fecha y hora de detección
- Descripción del incidente
- Severidad asignada
- Acciones tomadas
- Lecciones aprendidas

9. REVISIÓN
El plan se revisará anualmente y después de cada incidente mayor.

---

Aprobado por: [Nombre]
Fecha: [Fecha]
Próxima revisión: [Fecha + 1 año]`
  },

  "procedimiento-backup": {
    nombre: "Procedimiento de Gestión de Backups",
    norma: "ISO 27001:2022 - A.8.13",
    contenido: `PROCEDIMIENTO DE GESTIÓN DE BACKUPS

1. OBJETIVO
Establecer el proceso para realizar copias de seguridad de la información crítica de la Empresa.

2. ALCANCE
Aplica a todos los datos y sistemas clasificados como críticos.

3. RESPONSABILIDADES

3.1 Responsable de IT
- Ejecutar backups programados
- Verificar integridad
- Gestionar restauración

3.2 Responsable de Seguridad
- Definir políticas de retención
- Auditar proceso

4. REGLAS 3-2-1

- 3 copias de datos importantes
- 2 tipos diferentes de almacenamiento
- 1 copia fuera del sitio

5. FRECUENCIA DE BACKUP

5.1 Críticos (diario)
- Bases de datos
- Archivos de clientes
- Configuraciones de sistema

5.2 Importantes (semanal)
- Documentación
- Correos
- Registros

5.3 Referencia (mensual)
- Información histórica
- Backups completos

6. ALMACENAMIENTO

6.1 Local
- Disco externo encriptado
- Ubicación segura con acceso controlado

6.2 Remoto/Nube
- Encriptación AES-256
- Autenticación multifactor
- Ubicación geográfica diferente

7. VERIFICACIÓN

7.1 Pruebas mensuales
- Restaurar en ambiente de prueba
- Verificar integridad
- Documentar resultados

7.2 Checklist
- [ ] Backup completado exitosamente
- [ ] Verificación de checksum
- [ ] Almacenamiento en ubicación correcta
- [ ] Registro en bitácora

8. RECUPERACIÓN

8.1 RTO (Recovery Time Objective)
- Sistemas críticos: 4 horas
- Sistemas importantes: 24 horas
- Sistemas estándar: 72 horas

8.2 RPO (Recovery Point Objective)
- Datos críticos: 1 hora
- Datos importantes: 24 horas

9. RETENCIÓN

- Diario: 30 días
- Semanal: 90 días
- Mensual: 1 año
- Anual: 7 años

10. DOCUMENTACIÓN
Registrar en bitácora:
- Fecha y hora
- Tipo de backup
- Sistemas incluidos
- Persona responsable
- Verificación exitosa
- Ubicación de almacenamiento

---

Aprobado por: [Nombre]
Fecha: [Fecha]`
  },

  "politica-privacidad": {
    nombre: "Política de Privacidad / Aviso de Privacidad",
    norma: "Ley 1581/2012 Colombia - Art. 15",
    contenido: `AVISO DE PRIVACIDAD

En cumplimiento de la Ley 1581 de 2012 de Protección de Datos Personales y su decreto reglamentario 1377 de 2013, [Nombre de la Empresa] informa:

1. RESPONSABLE DEL TRATAMIENTO
- Razón Social: [Nombre de la Empresa]
- NIT: [Número]
- Dirección: [Dirección]
- Teléfono: [Teléfono]
- Email: [Email]

2. FINALIDAD DEL TRATAMIENTO
Los datos personales serán utilizados para:
- Prestación de servicios contratados
- Gestión administrativa y contable
- Comunicación sobre productos y servicios
- Cumplimiento de obligaciones legales
- Estudios de mercado y estadísticas

3. DERECHOS DEL TITULAR
Como titular de datos personales tiene derecho a:
- Conocer, actualizar y rectificar sus datos
- Solicitar prueba de la autorización
- Ser informado sobre el uso de sus datos
- Presentar quejas ante la SIC
- Revocar autorización
- Acceder gratuitamente a sus datos

4. PROCEDIMIENTO PARA EJERCER DERECHOS
Para ejercer sus derechos puede:
1. Enviar email a: [email]
2. Radicar solicitud escrita en nuestras oficinas
3. Llamar al: [teléfono]

La solicitud debe contener:
- Nombre completo del titular
- Número de identificación
- Descripción de los datos
- Finalidad del ejercicio del derecho

5. MEDIDAS DE SEGURIDAD
Implementamos medidas técnicas y organizativas para proteger sus datos:
- Cifrado de información sensible
- Control de acceso con autenticación
- Políticas de retención y eliminación
- Capacitación al personal

6. VIGENCIA
El tratamiento de datos se realizará por el tiempo necesario para cumplir las finalidades descritas, mientras exista relación contractual o legal, o hasta que el titular revoque la autorización.

7. AUTORIZACIÓN
Al proporcionar sus datos, usted autoriza expresamente a [Nombre de la Empresa] para el tratamiento de los mismos conforme a este aviso.

---

Fecha de última actualización: [Fecha]
Versión: 1.0`
  },

  "procedimiento-gestion-accesos": {
    nombre: "Procedimiento de Gestión de Accesos",
    norma: "ISO 27001:2022 - A.8.2",
    contenido: `PROCEDIMIENTO DE GESTIÓN DE ACCESOS

1. PROPÓSITO
Establecer el proceso para otorga, modificar y revoke accesos a los sistemas de información.

2. ALCANCE
Aplica a todos los usuarios (empleados, contratistas, terceros) y sistemas de la Empresa.

3. PRINCIPIOS

3.1 Mínimo Privilegio
- Acceso solo a lo necesario para función laboral
- Privilegios solo cuando sea requerido

3.2 Separación de Funciones
- Diferentes personas para funciones críticas
- Verificación de aprobación

4. CICLO DE VIDA DE ACCESOS

4.1 Solicitud
- Usuario solicita acceso mediante formulario
- Justificación clara de necesidad
- Aprobación del jefe inmediato

4.2 Aprobación
- Revisión de necesidad de negocio
- Verificación de autorización
- Documentación en sistema

4.3 Provisión
- Creación de cuenta
- Asignación de permisos según rol
- Envío de credenciales seguras

4.4 Revisión
- Revisión trimestral de accesos
- Verificación de vigencia laboral
- Confirmación de necesidad continua

4.5 Revocación
- Al terminar relación laboral
- Inmediata (máximo 24 horas)
- Desactivación de todas las cuentas

5. ROLES Y PERFILES

5.1 Roles predefinidos
- Administrador: acceso total
- Usuario estándar: acceso básico
- Usuario restringido: acceso mínimo
- Solo lectura: visualización

5.2 Personalización
- Excepciones documentadas
- Aprobación de Gerencia
- Vigencia limitada

6. CONTRASEÑAS

Ver Política de Contraseñas vigente.

7. ACCESO REMOTO

7.1 Requisitos
- VPN obligatoria
- 2FA obligatorio
- Sesiones con timeout

7.2 Restricciones
- No acceso desde redes no seguras
- Monitoreo de conexiones

8. MONITOREO

8.1 Registro
- Todos los accesos logueados
- Hora, usuario, recurso
- Fallos de autenticación

8.2 Auditoría
- Revisión mensual de logs
- Alertas por accesos anómalos

9. DOCUMENTACIÓN

Mantener registro de:
- Solicitudes de acceso
- Aprobaciones
- Modificaciones
- Revocaciones

---

Aprobado por: [Nombre]
Fecha: [Fecha]
Próxima revisión: [Fecha + 1 año]`
  }
};

export const getTemplate = (key: string) => {
  return documentTemplates[key as keyof typeof documentTemplates] || null;
};

export const getAllTemplates = () => {
  return Object.entries(documentTemplates).map(([key, value]) => ({
    key,
    nombre: value.nombre,
    norma: value.norma
  }));
};
