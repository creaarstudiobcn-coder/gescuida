"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { usePolling } from "./usePolling";
import { useRecaptcha } from "./useRecaptcha";
import { fmtTime } from "@/lib/format";

interface Msg {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface ChatState {
  online: boolean;
  needsContact: boolean;
  name: string | null;
  messages: Msg[];
}

// Chat de soporte propio (reemplaza a Crisp). Botón flotante + panel.
// "Casi en vivo" por polling cada 4 s mientras está abierto. Cuando el admin no está
// conectado, el mensaje se guarda igual y le llega un aviso por email (Resend).
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // No mostrar el widget dentro del panel de administración.
  if (pathname?.startsWith("/gestion-9k2p7")) return null;

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat de ayuda"}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-marino-700 text-2xl text-white shadow-xl transition hover:bg-marino-800"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { data, refresh } = usePolling<ChatState>("/api/chat", 4000);
  const { execute } = useRecaptcha();
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const online = data?.online ?? false;
  const needsContact = data?.needsContact ?? false;
  const messages = data?.messages ?? [];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    if (needsContact && !email.trim()) {
      setError("Déjanos tu email para poder responderte.");
      return;
    }
    setSending(true);
    setError(null);
    const recaptchaToken = await execute("chat");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        needsContact
          ? { body, name: name.trim() || undefined, email: email.trim(), recaptchaToken }
          : { body, recaptchaToken }
      ),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      refresh();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "No se ha podido enviar el mensaje.");
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex h-[30rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-marino-100 bg-crema-50 shadow-2xl">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2 bg-marino-700 px-4 py-3 text-white">
        <div>
          <p className="font-bold">Chat con GesCuida</p>
          <p className="flex items-center gap-1.5 text-xs text-white/80">
            <span className={`inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-white/40"}`} />
            {online ? "Estamos en línea" : "Te responderemos por email"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar chat"
          className="rounded-lg px-2 py-1 text-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        <p className="rounded-xl bg-salvia-50 px-3 py-2 text-center text-xs text-marino-600">
          ¿Tienes dudas sobre cuidadoras o sobre la plataforma? Escríbenos y te ayudamos.
        </p>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.fromAdmin
                  ? "border border-marino-100 bg-white text-marino-800"
                  : "bg-calido-500 text-white"
              }`}
            >
              {m.fromAdmin && <p className="text-xs font-semibold opacity-70">GesCuida</p>}
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={`mt-0.5 text-[10px] ${m.fromAdmin ? "text-marino-400" : "text-white/70"}`}>
                {fmtTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="border-t border-calido-200 bg-calido-50 px-3 py-2 text-sm text-calido-800" role="alert">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={send} className="space-y-2 border-t border-marino-100 p-2">
        {needsContact && (
          <div className="space-y-2">
            <input
              className="input w-full py-2 text-sm"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Tu nombre"
            />
            <input
              type="email"
              className="input w-full py-2 text-sm"
              placeholder="Tu email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Tu email"
              required
            />
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1 py-2 text-sm"
            placeholder="Escribe un mensaje…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Mensaje"
          />
          <button type="submit" className="btn-primary px-4 py-2" disabled={sending}>
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
