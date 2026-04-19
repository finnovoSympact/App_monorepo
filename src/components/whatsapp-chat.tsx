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

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="border-border/60 flex h-full flex-col overflow-hidden rounded-xl border bg-[#0a1929]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#1a2f45] px-4 py-3">
        <div className="bg-[var(--linear-brand)] flex size-8 items-center justify-center rounded-full text-xs font-bold text-white">
          S
        </div>
        <div>
          <p className="text-sm font-medium text-white">Sanad</p>
          <p className="text-xs text-green-400">En ligne</p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-[#005c4b] text-white" : "bg-[#1f2c34] text-white"}`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-[#1f2c34] px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Security disclaimer — never share CIN/bank details in chat */}
      <div className="flex items-start gap-2 border-t border-white/10 bg-[#0d2137] px-4 py-2.5">
        <span className="mt-0.5 text-[10px] leading-relaxed text-amber-400/80">
          🔒 For your security, <strong>never type your CIN number or exact bank details</strong> here.
          Sensitive documents are collected via a secure, Tunisian-hosted link.
        </span>
      </div>
      {/* Input */}
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#1a2f45] px-4 py-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
          placeholder="Message…"
          className="flex-1 border-none bg-[#2a3f55] text-white placeholder:text-gray-400"
        />
        <Button
          size="icon"
          onClick={() => {
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
          className="bg-[var(--linear-brand)] hover:bg-[var(--linear-accent)] rounded-full"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
