// WhatsApp-style chat UI for the Layer 1 simulator
// TODO §7: full implementation with profile panel + persona switcher + escalation banner
"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMessage = { role: "user" | "assistant"; text: string; ts: number };

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isTyping?: boolean;
}

export function WhatsappChat({ messages, onSend, isTyping }: Props) {
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 overflow-hidden bg-[#0a1929]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#1a2f45] px-4 py-3">
        <div className="size-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">S</div>
        <div><p className="text-sm font-medium text-white">Sanad</p><p className="text-xs text-green-400">En ligne</p></div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-[#005c4b] text-white" : "bg-[#1f2c34] text-white"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-[#1f2c34] px-4 py-3">
              <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#1a2f45] px-4 py-3">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onSend(input); setInput(""); } }} placeholder="Message…" className="flex-1 bg-[#2a3f55] border-none text-white placeholder:text-gray-400" />
        <Button size="icon" onClick={() => { if (input.trim()) { onSend(input); setInput(""); } }} className="rounded-full bg-brand-500 hover:bg-brand-600">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
