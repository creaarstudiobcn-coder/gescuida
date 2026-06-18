"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MUNICIPIOS_MARESME, ACCESS_PLANS, formatEuros } from "@/lib/pricing";

type Role = "FAMILIA" | "CUIDADORA";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get("role") as Role) || "FAMILIA";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [zones, setZones] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleZone(z: string) {
    setZones((prev) => (prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Debes aceptar el tratamiento de datos (RGPD).");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role, consentRGPD: consent, zones }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "No se pudo crear la cuenta.");
      return;
    }
    // Inicia sesión automáticamente.
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/post-login");
    router.refresh();
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
        <h1 className="text-2xl font-bold text-marino-800">Crear cuenta</h1>

        {/* Selector de rol */}
        <div className="mt-4 grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de cuenta">
          {(["FAMILIA", "CUIDADORA"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                role === r
                  ? "border-calido-500 bg-calido-50 text-calido-700"
                  : "border-marino-200 text-marino-600"
              }`}
            >
              {r === "FAMILIA" ? "👪 Soy familia" : "🤝 Soy cuidadora"}
            </button>
          ))}
        </div>

        {/* Contexto de precios según el rol */}
        <p className="mt-3 rounded-xl bg-marino-50 px-3 py-2 text-sm text-marino-600">
          {role === "FAMILIA" ? (
            <>
              Las familias eligen plan de acceso:{" "}
              <strong>
                Básico {formatEuros(ACCESS_PLANS.BASICO.priceCents)}/mes (
                {ACCESS_PLANS.BASICO.contactLimit} contactos)
              </strong>{" "}
              o{" "}
              <strong>
                Completo {formatEuros(ACCESS_PLANS.COMPLETO.priceCents)}/mes (
                {ACCESS_PLANS.COMPLETO.contactLimit} contactos)
              </strong>
              . El cuidado se acuerda y se paga aparte con la cuidadora.
            </>
          ) : (
            <>
              Para cuidadoras es <strong>totalmente gratis</strong>: sin cuotas ni comisiones.
              Aceptas o rechazas turnos libremente y cobras tu tarifa directamente de la familia.
            </>
          )}
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Nombre completo
            </label>
            <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono <span className="font-normal text-marino-400">(opcional)</span>
            </label>
            <input id="phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Contraseña <span className="font-normal text-marino-400">(mín. 8)</span>
            </label>
            <input id="password" type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {role === "CUIDADORA" && (
            <fieldset>
              <legend className="label">¿En qué municipios trabajas?</legend>
              <div className="flex flex-wrap gap-2">
                {MUNICIPIOS_MARESME.map((z) => (
                  <button
                    type="button"
                    key={z}
                    onClick={() => toggleZone(z)}
                    aria-pressed={zones.includes(z)}
                    className={`badge border ${
                      zones.includes(z)
                        ? "border-salvia-500 bg-salvia-100 text-salvia-700"
                        : "border-marino-200 text-marino-500"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label className="flex items-start gap-3 rounded-xl bg-marino-50 p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 accent-calido-500"
            />
            <span className="text-sm text-marino-700">
              Acepto los{" "}
              <Link href="/terminos" className="underline" target="_blank">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="underline" target="_blank">
                Política de Privacidad
              </Link>
              , incluido el tratamiento de mis datos y, en su caso, de los datos de salud de la
              persona a cuidar (RGPD).
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-calido-50 px-3 py-2 text-calido-700">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-marino-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-calido-600 underline">
            Entra
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
