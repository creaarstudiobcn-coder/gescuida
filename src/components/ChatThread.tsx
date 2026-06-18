"use client";

import { useState } from "react";
import Link from "next/link";
import { usePolling } from "./usePolling";
import { useRecaptcha } from "./useRecaptcha";
import { fmtTime } from "@/lib/format";

interface Msg {
  id: string;
  body: string;
  createdAt: string;
  senderName: string;
  mine: boolean;
}

interface SendError {
  message: string;
  code?: string;
}

// Hilo de mensajería para un turno. Lo usan familia y cuidadora.
export function ChatThread({ shiftId }: { shiftId: string }) {
  const { data, refresh } = usePolling<Msg[]>(`/api/messages?shiftId=${shiftId}`, 4000);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<SendError | null>(null);
  const { execute } = useRecaptcha();

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setSendError(null);
    const recaptchaToken = await execute("message");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId, body, recaptchaToken }),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      refresh();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      setSendError({ message: j.error ?? "No se ha podido enviar el mensaje.", code: j.code });
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-marino-100 bg-crema-50">
      <div className="max-h-72 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {data && data.length === 0 && (
          <p className="py-4 text-center text-sm text-marino-400">
            No hay mensajes todavía. Escribe el primero.
          </p>
        )}
        {data?.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.mine
                  ? "bg-calido-500 text-white"
                  : "border border-marino-100 bg-white text-marino-800"
              }`}
            >
              {!m.mine && <p className="text-xs font-semibold opacity-70">{m.senderName}</p>}
              <p>{m.body}</p>
              <p className={`mt-0.5 text-[10px] ${m.mine ? "text-white/70" : "text-marino-400"}`}>
                {fmtTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
      {sendError && (
        <div
          className="border-t border-calido-200 bg-calido-50 px-3 py-2 text-sm text-calido-800"
          role="alert"
        >
          <p className="font-semibold">{sendError.message}</p>
          {sendError.code === "CONTACT_LIMIT" || sendError.code === "NO_SUBSCRIPTION" ? (
            <Link
              href="/familia/suscripcion"
              className="mt-1 inline-block font-semibold text-calido-700 underline"
            >
              {sendError.code === "CONTACT_LIMIT" ? "⬆️ Subir de plan" : "💳 Ver planes"}
            </Link>
          ) : null}
        </div>
      )}
      <form onSubmit={send} className="flex gap-2 border-t border-marino-100 p-2">
        <input
          className="input flex-1 py-2"
          placeholder="Escribe un mensaje…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Mensaje"
        />
        <button type="submit" className="btn-primary px-4 py-2" disabled={sending}>
          Enviar
        </button>
      </form>
    </div>
  );
}
