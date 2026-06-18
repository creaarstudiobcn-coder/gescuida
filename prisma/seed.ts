import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACCESS_PLANS } from "../src/lib/pricing";
import { encrypt } from "../src/lib/encryption";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos de demostración…");

  // ── Dos planes de ACCESO a la plataforma: Básico y Completo ──
  const planBasico = await prisma.plan.upsert({
    where: { key: "BASICO" },
    update: { name: ACCESS_PLANS.BASICO.name, monthlyHours: 0, priceCents: ACCESS_PLANS.BASICO.priceCents },
    create: {
      key: "BASICO",
      name: ACCESS_PLANS.BASICO.name,
      monthlyHours: 0,
      priceCents: ACCESS_PLANS.BASICO.priceCents,
      stripePriceId: process.env.STRIPE_PRICE_BASICO ?? null,
    },
  });
  await prisma.plan.upsert({
    where: { key: "COMPLETO" },
    update: { name: ACCESS_PLANS.COMPLETO.name, monthlyHours: 0, priceCents: ACCESS_PLANS.COMPLETO.priceCents },
    create: {
      key: "COMPLETO",
      name: ACCESS_PLANS.COMPLETO.name,
      monthlyHours: 0,
      priceCents: ACCESS_PLANS.COMPLETO.priceCents,
      stripePriceId: process.env.STRIPE_PRICE_COMPLETO ?? null,
    },
  });

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ── Admin ──
  await prisma.user.upsert({
    where: { email: "admin@cuidadomataro.es" },
    update: {},
    create: {
      email: "admin@cuidadomataro.es",
      passwordHash: hash("admin1234"),
      name: "Administración",
      role: "ADMIN",
      consentRGPD: true,
      consentAt: new Date(),
    },
  });

  // ── Familia demo + persona a cuidar + suscripción activa ──
  const familia = await prisma.user.upsert({
    where: { email: "familia@demo.es" },
    update: {},
    create: {
      email: "familia@demo.es",
      passwordHash: hash("familia1234"),
      name: "Marta García",
      phone: "600111222",
      role: "FAMILIA",
      consentRGPD: true,
      consentAt: new Date(),
    },
  });

  const abuela = await prisma.careRecipient.findFirst({
    where: { familyUserId: familia.id },
  });

  const recipient =
    abuela ??
    (await prisma.careRecipient.create({
      data: {
        familyUserId: familia.id,
        name: "Dolores García",
        age: 84,
        zone: "Mataró",
        addressEnc: encrypt("Carrer de Sant Josep, 12, 3r 2a, 08301 Mataró"),
        needsEnc: encrypt("Movilidad reducida. Ayuda con aseo, comida y medicación (mañanas)."),
        notesEnc: encrypt("Le gusta pasear por el paseo marítimo si hace buen tiempo."),
      },
    }));

  const now = new Date();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  // Familia demo suscrita al plan BÁSICO (3 contactos) — útil para probar el límite.
  await prisma.subscription.upsert({
    where: { id: `seed-sub-${familia.id}` },
    update: { planId: planBasico.id, status: "ACTIVE", hoursIncluded: 0 },
    create: {
      id: `seed-sub-${familia.id}`,
      familyUserId: familia.id,
      planId: planBasico.id,
      status: "ACTIVE",
      hoursIncluded: 0,
      currentPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1),
      currentPeriodEnd: periodEnd,
    },
  });

  // ── Cuidadoras demo (cada una fija su propia tarifa; Aicha la deja "a convenir") ──
  const cuidadoras = [
    {
      email: "cuidadora@demo.es",
      name: "Rosa Martín",
      zones: ["Mataró", "Argentona", "Cabrera de Mar"],
      verified: true,
      rateMinCents: 1300,
      rateMaxCents: 1600,
    },
    {
      email: "lucia@demo.es",
      name: "Lucía Ferrer",
      zones: ["Premià de Mar", "El Masnou", "Vilassar de Mar"],
      verified: true,
      rateMinCents: 1500,
      rateMaxCents: 1800,
    },
    {
      email: "nueva@demo.es",
      name: "Aicha Benali",
      zones: ["Mataró", "Sant Andreu de Llavaneres"],
      verified: false, // pendiente de verificar por el admin
      rateMinCents: null,
      rateMaxCents: null, // sin tarifa → "A convenir"
    },
  ];

  for (const c of cuidadoras) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash: hash("cuidadora1234"),
        name: c.name,
        role: "CUIDADORA",
        consentRGPD: true,
        consentAt: new Date(),
      },
    });
    await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {
        zones: c.zones,
        verified: c.verified,
        hourlyRateMinCents: c.rateMinCents,
        hourlyRateMaxCents: c.rateMaxCents,
      },
      create: {
        userId: user.id,
        zones: c.zones,
        bio: "Cuidadora con experiencia en acompañamiento a personas mayores.",
        training: "Certificado de profesionalidad en Atención Sociosanitaria.",
        verified: c.verified,
        verifiedAt: c.verified ? new Date() : null,
        hourlyRateMinCents: c.rateMinCents,
        hourlyRateMaxCents: c.rateMaxCents,
        availability: {
          lun: ["09:00-14:00", "16:00-19:00"],
          mar: ["09:00-14:00"],
          mie: ["09:00-14:00", "16:00-19:00"],
          jue: ["09:00-14:00"],
          vie: ["09:00-14:00"],
        },
      },
    });
  }

  // ── Turnos de ejemplo ──
  const mkDate = (daysFromNow: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const rosa = await prisma.user.findUniqueOrThrow({ where: { email: "cuidadora@demo.es" } });

  // Turno 1: pendiente (buscando cuidadora)
  const existing = await prisma.shift.count({ where: { familyUserId: familia.id } });
  if (existing === 0) {
    const s1 = mkDate(1, 10);
    const e1 = mkDate(1, 13);
    await prisma.shift.create({
      data: {
        careRecipientId: recipient.id,
        familyUserId: familia.id,
        start: s1,
        end: e1,
        durationHours: 3,
        dayType: "LABORABLE",
        zone: "Mataró",
        addressEnc: recipient.addressEnc,
        status: "PENDIENTE",
        careSummary: "Acompañamiento y ayuda con la comida.",
        alertDeadline: new Date(now.getTime() + 12 * 3600 * 1000),
      },
    });

    // Turno 2: confirmado con Rosa
    const s2 = mkDate(2, 9);
    const e2 = mkDate(2, 12);
    await prisma.shift.create({
      data: {
        careRecipientId: recipient.id,
        familyUserId: familia.id,
        caregiverUserId: rosa.id,
        start: s2,
        end: e2,
        durationHours: 3,
        dayType: "LABORABLE",
        zone: "Mataró",
        addressEnc: recipient.addressEnc,
        status: "CONFIRMADO",
        acceptedAt: new Date(),
        acceptanceVoluntary: true,
        careSummary: "Aseo matinal y paseo.",
      },
    });

    // Turno 3: completado
    const s3 = mkDate(-2, 10);
    const e3 = mkDate(-2, 12);
    await prisma.shift.create({
      data: {
        careRecipientId: recipient.id,
        familyUserId: familia.id,
        caregiverUserId: rosa.id,
        start: s3,
        end: e3,
        durationHours: 2,
        dayType: "LABORABLE",
        zone: "Mataró",
        addressEnc: recipient.addressEnc,
        status: "COMPLETADO",
        acceptedAt: mkDate(-3, 18),
        acceptanceVoluntary: true,
        completedAt: e3,
        careSummary: "Compañía y medicación.",
      },
    });
  }

  console.log("✅ Seed completado.");
  console.log("   Admin:     admin@cuidadomataro.es / admin1234");
  console.log("   Familia:   familia@demo.es / familia1234 (Plan Básico ACTIVO)");
  console.log("   Cuidadora: cuidadora@demo.es / cuidadora1234 (gratis)");
  console.log(
    `   Planes: Básico ${(ACCESS_PLANS.BASICO.priceCents / 100).toFixed(2)} €/mes ` +
      `(${ACCESS_PLANS.BASICO.contactLimit} contactos) · ` +
      `Completo ${(ACCESS_PLANS.COMPLETO.priceCents / 100).toFixed(2)} €/mes ` +
      `(${ACCESS_PLANS.COMPLETO.contactLimit} contactos)`
  );
  console.log("   Tarifas: las fija cada cuidadora (Rosa 13–16 €/h · Lucía 15–18 €/h · Aicha a convenir)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
