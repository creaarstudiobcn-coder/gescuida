"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRecaptcha } from "@/components/useRecaptcha";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { execute } = useRecaptcha();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await execute("reset");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No hemos podido actualizar la contraseña.");
        return;
      }
      setDone(true);
      // Llevamos al login pasados unos segundos.
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4">
        <p className="rounded-lg bg-salvia-50 px-3 py-3 text-salvia-800">
          ✅ Contraseña actualizada. Te llevamos a iniciar sesión…
        </p>
        <Link href="/login" className="btn-primary mt-4 inline-block w-full text-center">
          Iniciar sesión ahora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="password">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Repite la contraseña
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-calido-50 px-3 py-2 text-calido-700">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
