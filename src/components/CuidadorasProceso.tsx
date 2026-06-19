"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sección de enganche para CUIDADORAS: explica el PROCESO real de conexión.
// Honestidad: no inventa familias ni ofertas; la única ficha mostrada es la de
// la propia cuidadora, etiquetada como "Ejemplo".
const PASOS = [
  {
    n: "1",
    icon: "📝",
    t: "Te registras gratis y creas tu perfil",
    d: "Subes tu foto, cuentas tu experiencia y marcas las zonas del Maresme donde trabajas. Es gratis para cuidadoras: sin cuotas ni comisiones.",
  },
  {
    n: "2",
    icon: "💶",
    t: "Pones tu tarifa y tus horarios",
    d: "Tú decides tu precio por hora y cuándo estás disponible. Por horas o como interna: como mejor te encaje.",
  },
  {
    n: "3",
    icon: "🔎",
    t: "Una familia de tu zona ve tu perfil",
    d: "Cuando una familia cercana busca cuidadora, tu perfil aparece con tu nombre, tu zona, tu tarifa y tu disponibilidad. Así es como te verán:",
    // El paso 3 incluye la tarjeta de ejemplo (ver más abajo).
    ejemplo: true,
  },
  {
    n: "4",
    icon: "💬",
    t: "Te contactan y acordáis el cuidado",
    d: "La familia te escribe por el chat. Habláis, os conocéis y acordáis el cuidado directamente con ella. Sin intermediarios y sin comisiones.",
  },
];

const BENEFICIOS = [
  "Tú pones tu precio",
  "Eliges tus horarios",
  "Cobras directo, sin comisiones",
  "Por horas o interna",
];

// Tarjeta de ejemplo del paso 3: representa la ficha de la PROPIA cuidadora,
// con datos genéricos y el sello "Ejemplo". No es una familia ni una oferta real.
function FichaEjemplo() {
  return (
    <div className="ficha-ejemplo relative mt-4 w-full max-w-sm rounded-2xl border border-marino-100 bg-white p-4 shadow-md">
      <span className="absolute -top-3 left-4 rounded-full bg-marino-800 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        Ejemplo · así te verán las familias
      </span>
      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-salvia-100 text-2xl"
          aria-hidden
        >
          🙂
        </div>
        <div>
          <p className="text-base font-extrabold text-marino-800">Tu nombre</p>
          <p className="text-sm text-marino-500">📍 Mataró · Maresme</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-salvia-50 px-2.5 py-1 text-xs font-semibold text-salvia-700">
          ✓ Verificado
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-crema-50 px-3 py-2">
          <dt className="text-marino-500">Tarifa</dt>
          <dd className="font-semibold text-marino-800">La que tú decidas</dd>
        </div>
        <div className="rounded-xl bg-crema-50 px-3 py-2">
          <dt className="text-marino-500">Disponibilidad</dt>
          <dd className="font-semibold text-marino-800">Mañanas y tardes</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-snug text-marino-400">
        Es una ilustración del funcionamiento: representa tu propia ficha, no una familia ni una
        oferta real.
      </p>
    </div>
  );
}

export function CuidadorasProceso() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    // Respeta a quien pide menos movimiento: sin animación, todo visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // gsap.context limita los selectores a esta sección y limpia al desmontar.
    const ctx = gsap.context(() => {
      // Cada paso entra con un fade + leve desplazamiento al hacer scroll.
      gsap.utils.toArray<HTMLElement>(".proceso-paso").forEach((paso) => {
        gsap.from(paso, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: paso, start: "top 85%", toggleActions: "play none none none" },
        });
      });

      // La ficha de ejemplo, además, con un sutil escalado.
      gsap.from(".ficha-ejemplo", {
        opacity: 0,
        scale: 0.96,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".ficha-ejemplo", start: "top 88%", toggleActions: "play none none none" },
      });

      // Los chips de beneficios entran escalonados.
      gsap.from(".proceso-chip", {
        opacity: 0,
        y: 14,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".proceso-beneficios", start: "top 90%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="mt-16">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-crema-50 to-salvia-50 px-6 py-12 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge bg-calido-100 text-calido-700">Para cuidadoras · gratis</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-marino-800 sm:text-4xl">
            Así te encontrará una familia en GesCuida
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-marino-600">
            Te explicamos el proceso real, paso a paso. Tú tienes el control en cada momento — sin
            cuotas y sin comisiones.
          </p>
        </div>

        {/* Pasos en zig-zag (alternados en escritorio, apilados en móvil) */}
        <ol className="mx-auto mt-10 max-w-3xl space-y-6">
          {PASOS.map((p, i) => (
            <li
              key={p.n}
              className={`proceso-paso flex flex-col gap-4 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-marino-100 sm:flex-row sm:items-start sm:gap-6 ${
                i % 2 === 1 ? "sm:flex-row-reverse sm:text-right" : ""
              }`}
            >
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-calido-500 text-lg font-extrabold text-white">
                  {p.n}
                </span>
                <span className="text-3xl" aria-hidden>
                  {p.icon}
                </span>
              </div>
              <div className={i % 2 === 1 ? "sm:flex sm:flex-col sm:items-end" : ""}>
                <h3 className="text-xl font-bold text-marino-800">{p.t}</h3>
                <p className="mt-2 text-marino-600">{p.d}</p>
                {p.ejemplo && <FichaEjemplo />}
              </div>
            </li>
          ))}
        </ol>

        {/* Beneficios reales */}
        <ul className="proceso-beneficios mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {BENEFICIOS.map((b) => (
            <li
              key={b}
              className="proceso-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-marino-700 shadow-sm ring-1 ring-salvia-200"
            >
              <span className="text-salvia-500" aria-hidden>
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/register?role=CUIDADORA"
            className="btn-primary px-8 py-4 text-lg shadow-md"
          >
            Inscríbete gratis
          </Link>
          <p className="mt-3 text-sm text-marino-500">
            Sin cuotas ni comisiones. Tardas menos de 2 minutos.
          </p>
        </div>
      </div>
    </section>
  );
}
