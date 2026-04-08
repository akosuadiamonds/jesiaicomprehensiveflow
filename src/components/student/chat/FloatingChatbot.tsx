import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatbotProps {
  subject: string;
  strand: string;
  subStrand: string;
  classGrade: string;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  subject, strand, subStrand, classGrade
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          subject, strand, subStrand, classGrade,
        }),
      });

      if (resp.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
        return;
      }
      if (resp.status === 402) {
        toast.error('AI credits exhausted.');
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Failed to connect');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch { /* partial json */ }
        }
      }
    } catch (err: any) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center animate-fade-in"
          aria-label="Ask Jesi AI"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] h-[480px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm leading-tight">Jesi AI</p>
                <p className="text-[11px] opacity-90 leading-tight">{subject} • {subStrand}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2 opacity-70">
                <Sparkles className="h-8 w-8 text-amber-500" />
                <p className="text-sm font-medium text-foreground">Hi! I'm Jesi AI 👋</p>
                <p className="text-xs text-muted-foreground">
                  Ask me anything about <span className="font-semibold">{subStrand}</span> and I'll help you understand better!
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px]">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  'rounded-xl px-3 py-2 text-sm max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_p]:leading-relaxed [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2 items-center">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px]">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-xl px-3 py-2 rounded-bl-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 text-sm h-9"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
