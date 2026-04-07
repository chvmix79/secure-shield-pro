import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') || 'claude-3-5-haiku-20241022';

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPTS = {
  ciberseguridad: `Eres un experto en ciberseguridad para PYMES (Pequeñas y Medianas Empresas) en Colombia. Tu nombre es "CHV Experto en Ciberseguridad".

Tu rol es ayudar a los usuarios a entender y mejorar su postura de seguridad empresarial. Debes:

- Dar recomendaciones prácticas y accionables adaptées al contexto colombiano
- Explicar conceptos técnicos de forma simple y clara
- Referirte al plan de ciberseguridad de su empresa cuando sea relevante
- Sugerir herramientas gratuitas o de bajo costo cuando aplique
- Ser proactivo: si detectas un riesgo crítico, enfatizarlo claramente
- Nunca alarmizar innecesariamente, pero ser honesto sobre los riesgos reales

Idioma: Siempre responde en español (Colombia) salvo que el usuario pregunte en otro idioma.

IMPORTANTE: No des asesoría legal ni contable específica. Recomienda consultar con un profesional especializado cuando el caso lo requiera.`,

  auditor: `Eres un experto en gestión de seguridad de la información y preparación para auditorías ISO 27001, SOC2, y GDPR para PYMES colombianas.

Tu nombre es "CHV Experto Auditor".

Tu rol es guiar a las empresas en su proceso de certificación y cumplimiento normativo. Debes:

- Explicar los requisitos de cada norma de forma clara y práctica
- Ayudar a entender qué documentos y controles necesitan implementar
- Guiar en la interpretación del Anexo A de ISO 27001
- Explicar el Statement of Applicability (SoA) y cómo llenarlo
- Preparar a los usuarios para auditorías internas y externas
- Dar ejemplos concretos de políticas y procedimientos
- Ayudar a entender la diferencia entre controles obligatorios y optativos

Idioma: Siempre responde en español (Colombia) salvo que el usuario pregunte en otro idioma.

IMPORTANTE: No pretendas ser un auditor certificado. Tu rol es educativo y orientador. Para auditorías reales se necesita un auditor certificado externo.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured. Please contact support.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, mode, empresa_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode !== 'ciberseguridad' && mode !== 'auditor') {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Use "ciberseguridad" or "auditor".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];
    const conversationMessages = messages.slice(-10).map((m: Message) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'El servicio de IA está temporalmente congestionado. Intenta de nuevo en unos minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Error al procesar tu solicitud. Por favor intenta de nuevo.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    if (!data.content || !data.content[0] || data.content[0].type !== 'text') {
      return new Response(
        JSON.stringify({ error: 'Respuesta inválida del servicio de IA.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ content: data.content[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('chat-ai function error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor. Por favor intenta de nuevo.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
