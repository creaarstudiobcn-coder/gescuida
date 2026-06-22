"use client";

import { useEffect, useState } from "react";
import { ZONAS_COBERTURA, ZONA_OTRA_PROVINCIA } from "@/lib/pricing";
import { Loading, ErrorCard, Notice } from "../_components/Feedback";
import { type Availability, type CuidadoraProfile } from "../_components/types";

const DAYS: { key: string; label: string }[] = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

// availability { lun:["09:00-14:00", ...] } <-> texto "09:00-14:00, 16:00-19:00"
function slotsToText(slots: string[] | undefined): string {
  return (slots ?? []).join(", ");
}
function textToSlots(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<CuidadoraProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado del formulario.
  const [zones, setZones] = useState<string[]>([]);
  const [otraProvincia, setOtraProvincia] = useState(false);
  const [otraZona, setOtraZona] = useState("");
  const [bio, setBio] = useState("");
  const [training, setTraining] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [dayText, setDayText] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/cuidadora/profile", { cache: "no-store" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const p = (await res.json()) as CuidadoraProfile;
        if (!active) return;
        setProfile(p);
        setZones(p.zones ?? []);
        setOtraZona(p.otraZona ?? "");
        setOtraProvincia(Boolean(p.otraZona));
        setBio(p.bio ?? "");
        setTraining(p.training ?? "");
        setPhotoUrl(p.photoUrl ?? "");
        setRateMin(p.rateMin != null ? String(p.rateMin) : "");
        setRateMax(p.rateMax != null ? String(p.rateMax) : "");
        const av: Availability = p.availability ?? {};
        const text: Record<string, string> = {};
        for (const d of DAYS) text[d.key] = slotsToText(av[d.key]);
        setDayText(text);
      } catch (e) {
        if (active) setLoadError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function toggleZone(m: string) {
    setZones((prev) => (prev.includes(m) ? prev.filter((z) => z !== m) : [...prev, m]));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const availability: Availability = {};
    for (const d of DAYS) {
      const slots = textToSlots(dayText[d.key] ?? "");
      if (slots.length) availability[d.key] = slots;
    }
    const parseRate = (v: string) => {
      const t = v.trim().replace(",", ".");
      if (t === "") return null;
      const n = Number(t);
      return Number.isFinite(n) ? n : null;
    };
    try {
      const res = await fetch("/api/cuidadora/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zones,
          otraZona: otraProvincia ? otraZona : "",
          bio,
          training,
          photoUrl,
          availability,
          rateMin: parseRate(rateMin),
          rateMax: parseRate(rateMax),
        }),
      });
      if (res.ok) {
        setNotice({ tone: "success", msg: "Perfil guardado correctamente." });
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setNotice({
          tone: "error",
          msg: j.error ?? "No hemos podido guardar los cambios. Inténtalo de nuevo.",
        });
      }
    } catch {
      setNotice({ tone: "error", msg: "Problema de conexión. Inténtalo de nuevo." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading label="Cargando tu perfil…" />;
  if (loadError && !profile) return <ErrorCard message={loadError} />;
  if (!profile) return null;

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-marino-800">Mi perfil</h1>
        <p className="mt-1 text-marino-500">Mantén tus datos al día para recibir mejores turnos.</p>
      </div>

      {/* Estado de verificación / suspensión */}
      <div className="flex flex-wrap items-center gap-2">
        {profile.verified ? (
          <span className="badge bg-salvia-100 text-salvia-700">✓ Verificada</span>
        ) : (
          <span className="badge bg-calido-100 text-calido-700">⏳ Pendiente de verificación</span>
        )}
        {profile.suspended && (
          <span className="badge bg-gray-200 text-gray-700">⛔ Cuenta suspendida</span>
        )}
      </div>

      {!profile.verified && (
        <div className="card border-calido-300 bg-calido-50 text-sm text-marino-700">
          Tu perfil está pendiente de verificación por administración. Puedes ver turnos, pero
          aceptarlos quedará disponible en cuanto te verifiquemos.
        </div>
      )}
      {profile.suspended && (
        <div className="card border-gray-300 bg-gray-50 text-sm text-marino-700" role="alert">
          Tu cuenta está suspendida. Ponte en contacto con administración para más información.
        </div>
      )}

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.msg}
        </Notice>
      )}

      {/* Municipios */}
      <div className="card space-y-3" role="group" aria-labelledby="grp-municipios">
        <p id="grp-municipios" className="label">Municipios donde trabajas</p>
        <p className="text-sm text-marino-500">
          Selecciona todas las zonas en las que puedes dar servicio.
        </p>
        <div className="flex flex-wrap gap-2">
          {ZONAS_COBERTURA.map((m) => {
            const active = zones.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleZone(m)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-salvia-500 bg-salvia-500 text-white"
                    : "border-marino-200 bg-white text-marino-600 hover:border-salvia-400"
                }`}
              >
                {m}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOtraProvincia((v) => !v)}
            aria-pressed={otraProvincia}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              otraProvincia
                ? "border-salvia-500 bg-salvia-500 text-white"
                : "border-marino-200 bg-white text-marino-600 hover:border-salvia-400"
            }`}
          >
            {ZONA_OTRA_PROVINCIA}
          </button>
        </div>
        {otraProvincia && (
          <div className="space-y-1">
            <label htmlFor="otraZona" className="label">
              ¿En qué ciudad o provincia?
            </label>
            <input
              id="otraZona"
              type="text"
              maxLength={120}
              className="input"
              placeholder="Ej. Valencia, Sevilla capital…"
              value={otraZona}
              onChange={(e) => setOtraZona(e.target.value)}
            />
          </div>
        )}
        {zones.length === 0 && !otraProvincia && (
          <p className="text-sm text-calido-600">Elige al menos un municipio para recibir turnos.</p>
        )}
      </div>

      {/* Foto */}
      <div className="card space-y-2">
        <label htmlFor="photoUrl" className="label">
          Foto de perfil (URL)
        </label>
        <input
          id="photoUrl"
          type="url"
          inputMode="url"
          className="input"
          placeholder="https://…"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
        />
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Vista previa de tu foto de perfil"
            className="mt-2 h-24 w-24 rounded-full object-cover ring-2 ring-salvia-200"
          />
        )}
      </div>

      {/* Bio */}
      <div className="card space-y-2">
        <label htmlFor="bio" className="label">
          Sobre ti
        </label>
        <textarea
          id="bio"
          className="input min-h-28"
          placeholder="Cuéntale a las familias quién eres y tu experiencia cuidando."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Formación */}
      <div className="card space-y-2">
        <label htmlFor="training" className="label">
          Formación y titulación
        </label>
        <textarea
          id="training"
          className="input min-h-24"
          placeholder="Cursos, títulos de auxiliar/geriatría, certificados…"
          value={training}
          onChange={(e) => setTraining(e.target.value)}
        />
      </div>

      {/* Tarifa por hora — la fija libremente la cuidadora */}
      <div className="card space-y-4" role="group" aria-labelledby="grp-tarifa">
        <p id="grp-tarifa" className="label">Tu tarifa por hora</p>
        <p className="text-sm text-marino-500">
          Tú decides tu precio. Indica un rango (desde / hasta) por hora. Es{" "}
          <span className="font-medium text-marino-700">opcional</span>: si lo dejas vacío, las
          familias verán <span className="font-medium text-marino-700">«A convenir»</span>. La
          plataforma no fija ninguna tarifa.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <label htmlFor="rateMin" className="label">
              Desde (€/h)
            </label>
            <input
              id="rateMin"
              type="number"
              min={0}
              step="0.5"
              inputMode="decimal"
              className="input no-spin"
              placeholder="p. ej. 12"
              value={rateMin}
              onChange={(e) => setRateMin(e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="rateMax" className="label">
              Hasta (€/h)
            </label>
            <input
              id="rateMax"
              type="number"
              min={0}
              step="0.5"
              inputMode="decimal"
              className="input no-spin"
              placeholder="p. ej. 16"
              value={rateMax}
              onChange={(e) => setRateMax(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-marino-50 px-3 py-2.5 text-xs text-marino-600">
          <span aria-hidden className="mt-px shrink-0 text-sm leading-none">
            💶
          </span>
          <span>
            El importe del cuidado lo acuerdas y cobras{" "}
            <strong className="text-marino-700">directamente de la familia</strong>. La plataforma
            no interviene en ese pago.
          </span>
        </div>
      </div>

      {/* Disponibilidad semanal */}
      <div className="card space-y-4" role="group" aria-labelledby="grp-disponibilidad">
        <p id="grp-disponibilidad" className="label">Disponibilidad semanal</p>
        <p className="text-sm text-marino-500">
          Indica tus franjas por día, separadas por comas. Ejemplo:{" "}
          <span className="font-medium text-marino-700">09:00-14:00, 16:00-19:00</span>
        </p>
        <div className="space-y-2.5">
          {DAYS.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <label
                htmlFor={`av-${d.key}`}
                className="w-24 shrink-0 text-sm font-semibold text-marino-700"
              >
                {d.label}
              </label>
              <input
                id={`av-${d.key}`}
                type="text"
                className="input min-w-0 flex-1 py-2.5"
                placeholder="Sin disponibilidad"
                value={dayText[d.key] ?? ""}
                onChange={(e) => setDayText((prev) => ({ ...prev, [d.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full text-lg disabled:opacity-50">
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
