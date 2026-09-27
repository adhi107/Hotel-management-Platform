import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight, X } from 'lucide-react';
import api from '../../services/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; insights?: string[]; actions?: string[] }>>([
    {
      role: 'ai',
      text: 'Hello! I am your AURA Restaurant Operations AI Copilot. Ask me anything about your daily sales velocity, dish gross margins, inventory safety stocks, or menu optimizations.',
      insights: [
        'Today’s revenue pace is tracking 14.2% higher than yesterday.',
        'Cold-pressed juices and craft coffees have the highest gross margins.'
      ],
      actions: [
        'Show me our best selling dishes',
        'Which ingredients are low on stock?',
        'What is our average gross food margin?'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || query;
    if (!q.trim()) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/query', { query: q });
      const data = res.data.data;
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: data.answer,
          insights: data.insights,
          actions: data.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Sorry, I encountered an issue analyzing your telemetry data. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl glass-card-elevated rounded-2xl border border-aura-blue/40 shadow-2xl flex flex-col h-[550px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-aura-border flex items-center justify-between bg-aura-dark/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center text-white shadow-glow-blue">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>AURA AI Operations Copilot</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-aura-blue/20 text-aura-blue border border-aura-blue/40 font-semibold">
                  Tenant Grounded
                </span>
              </h3>
              <p className="text-[11px] text-aura-muted">Real-time analytical insights from your restaurant telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-aura-muted hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-aura-blue/20 border border-aura-blue/40 text-aura-blue flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2.5 ${
                m.role === 'user' 
                  ? 'bg-aura-blue text-white rounded-tr-none' 
                  : 'bg-aura-dark/80 border border-aura-border text-aura-text rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>

                {m.insights && m.insights.length > 0 && (
                  <div className="pt-2 border-t border-aura-border/40 space-y-1">
                    <p className="text-[10px] font-bold text-aura-blue uppercase">Key Insights</p>
                    {m.insights.map((ins, i) => (
                      <p key={i} className="text-[11px] text-aura-muted flex items-start gap-1.5">
                        <span className="text-aura-blue">•</span>
                        <span>{ins}</span>
                      </p>
                    ))}
                  </div>
                )}

                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 border-t border-aura-border/40 space-y-1.5">
                    <p className="text-[10px] font-bold text-aura-emerald uppercase">Suggested Next Questions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg bg-aura-card hover:bg-aura-blue/15 border border-aura-border text-[11px] text-aura-muted hover:text-white transition-all text-left"
                        >
                          {act} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-aura-blue/20 text-aura-blue flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-aura-dark border border-aura-border text-xs text-aura-muted animate-pulse">
                Analyzing restaurant telemetry and operational records...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-aura-border bg-aura-dark/70 flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot (e.g., Which items have low margin?)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-aura-card border border-aura-border text-xs text-white placeholder-aura-muted focus:outline-none focus:border-aura-blue"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl gradient-accent text-white text-xs font-bold shadow-glow-blue disabled:opacity-40 hover:opacity-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
