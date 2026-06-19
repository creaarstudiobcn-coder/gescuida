"use client";

import { useState } from "react";
import Link from "next/link";
import { useRecaptcha } from "@/components/useRecaptcha";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { execute } = useRecaptcha();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const recaptchaToken = await execute("forgot");
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No hemos podido procesar la solicitud.");
        return;
      }
      setSent(true);
    } catch {
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-6 flex justify-center" aria-label="GesCuida — inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/gescuida-logo-horizontal.svg"
          alt="GesCuida"
          width={170}
          height={48}
          className="h-11 w-auto sm:h-12"
        />
      </Link>
      <div className="card">
        {sent ? (
          <>
            <h1 className="text-2xl font-bold text-marino-800">Revisa tu correo</h1>
            <p className="mt-3 text-marino-700">
              Si ese email está registrado, te hemos enviado un enlace para restablecer la
              contraseña. Revisa también la carpeta de spam. El enlace caduca en 1 hora.
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-block w-full text-center">
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-marino-800">¿Olvidaste tu contraseña?</h1>
            <p className="mt-1 text-marino-600">
              Escribe tu email y te enviaremos un enlace para crear una nueva.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-calido-50 px-3 py-2 text-calido-700">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>

            <p className="mt-5 text-center text-marino-600">
              <Link href="/login" className="font-semibold text-calido-600 underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
