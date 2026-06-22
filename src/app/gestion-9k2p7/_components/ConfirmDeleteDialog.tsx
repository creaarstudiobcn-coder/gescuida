"use client";

import { useState } from "react";

// Diálogo de confirmación para borrados PERMANENTES e irreversibles.
// Si se pasa `confirmWord`, el botón de borrar solo se habilita cuando el admin
// escribe ese texto exacto (p. ej. el nombre de la cuidadora) → evita borrados accidentales.
export function ConfirmDeleteDialog({
  open,
  title,
  message,
  confirmWord,
  confirmLabel = "Eliminar definitivamente",
  busy = false,
  error = null,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmWord?: string; // si se indica, hay que escribirlo para habilitar el botón
  confirmLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  if (!open) return null;

  const ready = !confirmWord || typed.trim() === confirmWord.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-marino-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-red-700">{title}</h2>
        <div className="mt-2 space-y-2 text-sm text-marino-600">{message}</div>

        {confirmWord && (
          <div className="mt-4">
            <label className="label" htmlFor="confirm-delete-input">
              Para confirmar, escribe <span className="font-bold text-marino-800">{confirmWord}</span>
            </label>
            <input
              id="confirm-delete-input"
              className="input mt-1"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoFocus
              disabled={busy}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-ghost px-4 py-2 text-sm"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={onConfirm}
            disabled={!ready || busy}
          >
            {busy ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
