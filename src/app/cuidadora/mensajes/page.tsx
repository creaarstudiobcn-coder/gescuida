"use client";

import { useState } from "react";
import { usePolling } from "@/components/usePolling";
import { ChatThread } from "@/components/ChatThread";

interface Thread {
  userId: string;
  name: string;
  lastBody: string;
  lastAt: string;
  unread: number;
}

export default function MensajesPage() {
  const { data, loading } = usePolling<Thread[]>("/api/messages/threads", 8000);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const threads = data ?? [];
  // Si no hay selección manual, abrimos la primera conversación.
  const activeId = selectedId ?? threads[0]?.userId ?? null;
  const active = threads.find((t) => t.userId === activeId) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Mensajes 💬</h1>
        <p className="mt-1 text-marino-500">
          Aquí recibes los mensajes del equipo de GesCuida. Responde directamente desde aquí.
        </p>
      </div>

      {loading && !data ? (
        <p className="text-marino-400">Cargando…</p>
      ) : threads.length === 0 ? (
        <div className="card text-center text-marino-500">
          No tienes mensajes todavía. Cuando el equipo de GesCuida te escriba, lo verás aquí.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          {/* Lista de conversaciones */}
          <ul className="space-y-2">
            {threads.map((t) => (
              <li key={t.userId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.userId)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    t.userId === activeId
                      ? "border-calido-400 bg-calido-50"
                      : "border-marino-100 bg-white hover:bg-crema-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-marino-800">{t.name}</span>
                    {t.unread > 0 && (
                      <span className="badge bg-calido-500 px-2 py-0.5 text-xs text-white">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-marino-500">{t.lastBody}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* Hilo activo */}
          <div>
            {active && (
              <>
                <h2 className="mb-2 font-bold text-marino-800">{active.name}</h2>
                <ChatThread withUserId={active.userId} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
