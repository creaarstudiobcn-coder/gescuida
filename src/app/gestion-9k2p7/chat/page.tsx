"use client";

import { useEffect, useState } from "react";
import { usePolling } from "@/components/usePolling";
import { fmtTime } from "@/lib/format";

interface SessionItem {
  id: string;
  name: string | null;
  email: string | null;
  lastBody: string;
  lastAt: string;
  unread: number;
  blocked: boolean;
  spam: boolean;
  spamReasons: string[];
}

interface Msg {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface Thread {
  id: string;
  name: string | null;
  email: string | null;
  messages: Msg[];
}

export default function AdminChatPage() {
  const { data, loading, refresh } = usePolling<SessionItem[]>("/api/chat/admin", 6000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verSpam, setVerSpam] = useState(false);

  // Latido de presencia: mientras esta página esté abierta, el visitante nos ve "en línea".
  useEffect(() => {
    const ping = () => fetch("/api/chat/heartbeat", { method: "POST" }).catch(() => {});
    ping();
    const id = setInterval(ping, 30_000);
    return () => clearInterval(id);
  }, []);

  const todas = data ?? [];
  const descartadas = todas.filter((s) => s.spam || s.blocked);
  // Por defecto la bandeja solo enseña lo que parece una conversación de verdad.
  const sessions = verSpam ? todas : todas.filter((s) => !s.spam && !s.blocked);
  const activeId =
    selectedId && sessions.some((s) => s.id === selectedId)
      ? selectedId
      : sessions[0]?.id ?? null;
  const active = sessions.find((s) => s.id === activeId) ?? null;

  // Silencia o reactiva los avisos por email de una conversación.
  async function toggleBlock(sessionId: string, blocked: boolean) {
    await fetch("/api/chat/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, blocked }),
    });
    refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Chat de la web 💬</h1>
        <p className="mt-1 text-marino-500">
          Mensajes que llegan desde el chat de la web. Mientras tengas esta página abierta, los
          visitantes te ven <strong>en línea</strong>. Si la cierras, recibirás un aviso por email.
        </p>
        <p className="mt-1 text-sm text-marino-400">
          Los mensajes que parecen spam se guardan igual, pero <strong>no te avisan por email</strong>.
          Si uno cuela, silencia la conversación y no volverá a avisarte.
        </p>
        {descartadas.length > 0 && (
          <button
            type="button"
            onClick={() => setVerSpam((v) => !v)}
            className="mt-2 text-sm text-calido-700 underline"
          >
            {verSpam
              ? "Ocultar spam y silenciadas"
              : `Ver spam y silenciadas (${descartadas.length})`}
          </button>
        )}
      </div>

      {loading && !data ? (
        <p className="text-marino-400">Cargando…</p>
      ) : sessions.length === 0 ? (
        <div className="card text-center text-marino-500">
          {todas.length === 0
            ? "Todavía no hay conversaciones. Cuando alguien escriba por el chat de la web, aparecerá aquí."
            : "Ninguna conversación pendiente. El resto está marcado como spam o silenciado."}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          {/* Lista de conversaciones */}
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    s.id === activeId
                      ? "border-calido-400 bg-calido-50"
                      : "border-marino-100 bg-white hover:bg-crema-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-marino-800">
                      {s.name?.trim() || s.email || "Visitante"}
                    </span>
                    {s.unread > 0 && (
                      <span className="badge bg-calido-500 px-2 py-0.5 text-xs text-white">
                        {s.unread}
                      </span>
                    )}
                  </div>
                  {(s.spam || s.blocked) && (
                    <p className="mt-1 text-[11px] font-semibold text-marino-400">
                      {s.blocked ? "🔕 Silenciada" : "🚩 Posible spam"}
                      {s.spam && s.spamReasons.length > 0 && ` · ${s.spamReasons.join(", ")}`}
                    </p>
                  )}
                  <p className="mt-0.5 truncate text-sm text-marino-500">{s.lastBody}</p>
                  <p className="mt-0.5 text-[11px] text-marino-400">{fmtTime(s.lastAt)}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* Hilo activo */}
          <div>
            {active && (
              <>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-marino-800">
                      {active.name?.trim() || "Visitante"}
                    </h2>
                    {active.email && (
                      <a href={`mailto:${active.email}`} className="text-sm text-calido-700 underline">
                        {active.email}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBlock(active.id, !active.blocked)}
                    className="rounded-lg border border-marino-200 px-3 py-1.5 text-sm text-marino-600 transition hover:bg-crema-50"
                  >
                    {active.blocked ? "🔔 Volver a avisarme" : "🔕 No avisarme de esta"}
                  </button>
                </div>
                <AdminChatThread sessionId={active.id} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminChatThread({ sessionId }: { sessionId: string }) {
  const { data, refresh } = usePolling<Thread>(`/api/chat/admin?sessionId=${sessionId}`, 4000);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = data?.messages ?? [];

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/chat/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, body }),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      refresh();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "No se ha podido enviar la respuesta.");
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-marino-100 bg-crema-50">
      <div className="max-h-[26rem] min-h-[12rem] space-y-2 overflow-y-auto p-3" aria-live="polite">
        {messages.length === 0 && (
          <p className="py-4 text-center text-sm text-marino-400">Sin mensajes.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.fromAdmin
                  ? "bg-calido-500 text-white"
                  : "border border-marino-100 bg-white text-marino-800"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={`mt-0.5 text-[10px] ${m.fromAdmin ? "text-white/70" : "text-marino-400"}`}>
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
      <form onSubmit={send} className="flex gap-2 border-t border-marino-100 p-2">
        <input
          className="input flex-1 py-2"
          placeholder="Escribe tu respuesta…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Respuesta"
        />
        <button type="submit" className="btn-primary px-4 py-2" disabled={sending}>
          Enviar
        </button>
      </form>
    </div>
  );
}
