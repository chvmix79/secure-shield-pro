import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MessageCircle, Send, Bot, User, Lightbulb, FileCheck, Shield, BookOpen, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatExpertProps {
  mode: "ciberseguridad" | "auditor";
}

const expertPrompts = {
  ciberseguridad: {
    name: "Experto en Ciberseguridad",
    description: "Recibe recomendaciones personalizadas basadas en tu diagnóstico",
    icon: "🛡️",
    color: "text-primary",
    suggestions: [
      "¿Cuáles son mis principales vulnerabilidades?",
      "¿Qué acciones debo tomar primero?",
      "¿Cómo puedo mejorar mi puntuación de seguridad?",
      "¿Qué herramientas gratuitas me recomiendan?",
      "¿Cada cuánto debo hacer un diagnóstico?"
    ]
  },
  auditor: {
    name: "Experto Auditor ISO 27001",
    description: "Prepárate para certificaciones y auditorías de seguridad",
    icon: "📋",
    color: "text-warning",
    suggestions: [
      "¿Qué documentos necesito para ISO 27001?",
      "¿Cuáles son los controles mandatory del Anexo A?",
      "¿Cómo hacer una evaluación de riesgos?",
      "¿Qué es el Statement of Applicability?",
      "¿Cómo preparar una auditoría interna?"
    ]
  }
};

export default function ChatExpert({ mode }: ChatExpertProps) {
  const { empresa } = useEmpresa();
  const expert = expertPrompts[mode];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !empresa?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          empresa_id: empresa.id 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "Lo siento, no pude procesar tu solicitud en este momento.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      toast.error("Hubo un error al conectar con el servidor de IA");
      
      // Fallback message
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, parece que hay un problema técnico con la conexión al experto. Por favor, intenta de nuevo más tarde o revisa tu panel de acciones.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const currentExpert = expertPrompts[mode];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              {currentExpert.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {currentExpert.name}
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">SISTEMA IA</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">{currentExpert.description}</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden card-glass border-primary/10 relative">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bot size={32} className={currentExpert.color} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">¡Hola! Soy {currentExpert.name}</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-8">
                  {mode === "ciberseguridad" 
                    ? "He analizado tus datos de seguridad. Puedo darte consejos específicos sobre tus vulnerabilidades actuales. ¿Qué quieres saber?"
                    : "Estoy preparado para guiarte en tu proceso de certificación ISO 27001. Pregúntame sobre cualquier anexo o política."}
                </p>
                
                {showSuggestions && (
                  <div className="space-y-3 w-full max-w-sm">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Sugerencias inteligentes</p>
                    <div className="flex flex-col gap-2">
                      {currentExpert.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-left justify-start h-auto py-2 px-4 hover:border-primary/50 transition-colors"
                          onClick={() => handleSuggestion(suggestion)}
                        >
                          <Lightbulb size={14} className="mr-3 text-warning shrink-0" />
                          <span className="text-xs">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto w-full">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-12"
                          : "bg-muted text-foreground mr-12 border border-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <Bot size={16} className={currentExpert.color + " mt-1 shrink-0"} />
                        )}
                        <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3 border border-primary/5 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Bot size={16} className={currentExpert.color} />
                        <span className="text-sm text-muted-foreground">Analizando tu infraestructura...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Input
                placeholder={mode === "ciberseguridad" 
                  ? "Consulta sobre tus riesgos..." 
                  : "Pregunta sobre normativas..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 h-11 bg-background/50 border-primary/10"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || loading || !empresa}
                className="h-11 w-11 p-0 bg-primary hover:bg-primary/90"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export function ChatCiberseguridad() {
  return <ChatExpert mode="ciberseguridad" />;
}

export function ChatAuditor() {
  return <ChatExpert mode="auditor" />;
}
