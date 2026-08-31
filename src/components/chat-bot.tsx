"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatBot({
  restaurantName,
  welcomeMessage,
  dishOfDayName,
}: {
  restaurantName: string;
  welcomeMessage: string;
  dishOfDayName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `${welcomeMessage}${
            dishOfDayName
              ? ` Hoy te puedo contar sobre ${dishOfDayName}, nuestra comida del día.`
              : ""
          } ¿Qué se te antoja?`,
        },
      ]);
    }
  }, [open, messages.length, welcomeMessage, dishOfDayName]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply || "Disculpa, ¿me lo puedes repetir?",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Parece que hubo un tropiezo. Intenta de nuevo en un momento.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="chat-fab"
        aria-label="Abrir asistente"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="glass-sheet fixed inset-x-3 bottom-24 z-40 flex h-[min(70vh,520px)] flex-col overflow-hidden rounded-3xl sm:inset-x-auto sm:right-4 sm:w-[360px]"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Anfitrión {restaurantName}
                </p>
                <p className="text-xs text-white/45">Te ayudo a elegir</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 p-2"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white/10 text-white/90"
                      : "ml-auto bg-[#c4a574]/25 text-white"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <form
              className="flex gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="¿Qué se te antoja?"
                className="input-glass flex-1"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-[#c4a574] p-3 text-[#1a1614] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
