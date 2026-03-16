import { useState, useRef, useEffect } from 'react';
import { MessageSquare, SendHorizonal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChatMessage from './components/ChatMessage';
import type { ChatMessageItem } from './components/ChatMessage';
import { assistantService } from '@/services/assistant.service';

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const { answer } = await assistantService.ask(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      // Error toast handled by global response interceptor (setupAxiosInterceptors.ts)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground text-sm mt-1">Ask questions about your events</p>
        </div>

        <div className="border rounded-xl shadow-sm bg-background overflow-hidden">
          {/* Chat area */}
          <div className="h-[calc(100vh-280px)] min-h-[300px] overflow-y-auto p-4 flex flex-col gap-2">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">Ask me anything about your events…</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}

            {isLoading && (
              <div className="flex justify-start" role="status" aria-label="Assistant is typing">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="border-t px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                maxLength={500}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input.trim().length === 0}
                aria-label="Send message"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
