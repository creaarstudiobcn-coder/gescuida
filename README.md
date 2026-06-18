# 🌊 Cuidado Mataró

Marketplace de tres lados para el **cuidado de personas mayores a domicilio** en Mataró y el Maresme. Las familias **reservan y pagan desde el móvil**, las cuidadoras **aceptan turnos** como en una app de reparto, y el administrador **supervisa todo en tiempo real**.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **PostgreSQL** + **Prisma ORM**
- **NextAuth (Auth.js v5)** con roles (familia / cuidadora / admin)
- **Stripe** — suscripción mensual de acceso a la plataforma (familias) + webhooks
- **Tailwind CSS** — mobile-first, accesible, paleta cálida marino/salvia/crema/naranja
- Preparado para **Vercel** (incluye `vercel.json` con cron de alertas)

---

## 1. Requisitos

- Node.js 18.18+ (probado con Node 24)
- Una base de datos PostgreSQL → opción A (Docker, local) u opción B (Supabase, nube)
- Una cuenta de **Stripe** (modo test) para los pagos

---

## 2. Instalación

```bash
npm install
cp .env.example .env.local   # y rellena los valores (ver abajo)
```

### Genera los secretos
```bash
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -hex 32      # → ENCRYPTION_KEY (cifrado de datos de salud, RGPD)
```

---

## 3. Base de datos

### Opción A — Postgres local con Docker (recomendado para empezar)
```bash
docker compose up -d
# DATABASE_URL y DIRECT_URL ya valen con los valores por defecto del .env.example
```

### Opción B — Supabase (nube, gratis)
1. Crea un proyecto en https://supabase.com
2. Ve a **Project Settings → Database → Connection string**:
   - `DATABASE_URL` → cadena en modo **Transaction** (puerto 6543, con `?pgbouncer=true`)
   - `DIRECT_URL` → cadena **directa** (puerto 5432) — la usa Prisma para migraciones
3. Pega ambas en `.env.local`.

### Crea las tablas y los datos de demostración
```bash
npm run db:push     # crea el esquema en la BD (o: npm run db:migrate)
npm run db:seed     # planes + usuarios y turnos de ejemplo
```

**Cuentas de demostración** que crea el seed:
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Familia | `familia@demo.es` | `familia1234` |
| Cuidadora | `cuidadora@demo.es` | `cuidadora1234` |
| Admin | `admin@cuidadomataro.es` | `admin1234` |

---

## 4. Arrancar en local
```bash
npm run dev
# http://localhost:3000
```
- `/` landing · `/register` · `/login`
- Tras entrar, cada rol va a su panel: `/familia`, `/cuidadora`, `/admin`.
- `npm run db:studio` abre Prisma Studio para inspeccionar la BD.

---

## 5. Stripe (pagos)

### a) Crea la cuenta y las claves
1. Regístrate en https://stripe.com (usa el **modo test**).
2. **Developers → API keys**:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`

### b) Crea los DOS productos/precios de acceso (suscripción mensual)
Modelo **plataforma de conexión**: dos planes de acceso para familias.
En **Products → Add product**, crea **dos** productos con precio **recurrente mensual**:
| Producto | Precio | Contactos/mes |
|----------|--------|---------------|
| Plan Básico   | 29,99 €/mes | 3  |
| Plan Completo | 69 €/mes    | 10 |

Copia cada **Price ID** (`price_...`) a:
```
STRIPE_PRICE_BASICO="price_..."
STRIPE_PRICE_COMPLETO="price_..."
```
Precios y límites se controlan con `PLAN_BASICO_PRECIO` / `PLAN_BASICO_CONTACTOS` /
`PLAN_COMPLETO_PRECIO` / `PLAN_COMPLETO_CONTACTOS` (y sus variantes `NEXT_PUBLIC_` para la UI).
Las cuidadoras **no pagan**: su registro y uso son gratuitos, sin límite de clientes.

> Los planes antiguos (cuota única ACCESO; agencia por horas Tranquilidad/Hogar) quedan archivados en el código por si se recuperan.

### c) Webhooks (activan/desactivan el acceso según el pago)
En local, con la [CLI de Stripe](https://stripe.com/docs/stripe-cli):
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copia el "whsec_..." que imprime → STRIPE_WEBHOOK_SECRET
```
En producción: **Developers → Webhooks → Add endpoint** → `https://TU-DOMINIO/api/stripe/webhook`, escuchando:
`checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`.

---

## 6. Despliegue en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. Configura todas las variables de entorno del `.env.example` en **Vercel → Settings → Environment Variables** (usa una BD en nube, p.ej. Supabase).
3. `NEXT_PUBLIC_APP_URL` y `NEXTAUTH_URL` = tu dominio de producción.
4. Crea el webhook de Stripe apuntando a tu dominio (paso 5c).
5. El `vercel.json` ya define un **cron** que llama a `/api/cron/alerts` cada 30 min (marca turnos sin cubrir). Protégelo con `CRON_SECRET` si quieres (Vercel lo envía como `Authorization: Bearer`).
6. El `build` ejecuta `prisma generate` automáticamente. Ejecuta `npm run db:migrate deploy` (o `db:push`) contra la BD de producción una vez.

---

## 7. Cómo funciona el flujo central

1. **La familia reserva** una visita (elige persona, día, franja y duración). Requiere la **cuota de acceso activa** (sin límite de horas). El turno queda **PENDIENTE** ("buscando cuidadora").
2. Las **cuidadoras cercanas** (de esa zona) ven el turno con la **zona aproximada** (sin dirección ni datos de salud). Pueden **aceptar o rechazar libremente** (modelo plataforma, no laboral: se guarda constancia de la voluntariedad con timestamp).
3. Al aceptarlo, el turno pasa a **CONFIRMADO**: la familia ve "confirmada con [nombre]", la cuidadora lo tiene en su agenda (y ya ve la dirección completa), y el **admin** lo ve cubierto. Todo en **tiempo real** (polling cada pocos segundos).
4. Si nadie lo acepta antes del plazo (`ALERT_HOURS_UNCOVERED`), salta una **alerta al admin**, que puede **asignar manualmente** una cuidadora.

### Acceso y pagos (modelo plataforma de conexión)
- **Familias**: eligen plan de **acceso a la plataforma** — **Básico** (29,99 €/mes, 3 contactos) o **Completo** (69 €/mes, 10 contactos). Da acceso a buscar cuidadoras, reservar visitas, coordinar y mensajearse. **No es el pago del servicio de cuidado.**
- **Límite de contactos**: cada familia puede contactar (mensajear) a un nº limitado de **cuidadoras distintas** por ciclo mensual, según su plan. Volver a hablar con una ya contactada no consume; el contador se reinicia cada ciclo. Al llegar al límite, se ofrece subir de plan.
- **Cuidadoras**: registro y uso **gratuitos**, sin cuotas ni comisiones, **sin límite** de clientes.
- **El cuidado** se acuerda y se **paga directamente entre familia y cuidadora**. Tarifas de **referencia** (informativas, no las cobra la plataforma): **19 €/h** (L-V), **22 €/h** (sáb), **25 €/h** (dom).
- El webhook de Stripe **activa/ajusta** el plan y su límite al pagar, y **bloquea** el acceso (PAST_DUE/CANCELED) si la cuota falla. Al **subir de plan**, cancela la suscripción anterior en Stripe para no duplicar el cobro.

---

## 8. Seguridad y RGPD (datos de salud)

- **Control de acceso por rol** (middleware + comprobaciones en cada endpoint): cada usuario solo ve lo suyo.
- **Cifrado** (AES-256-GCM) de los campos sensibles: dirección, necesidades y notas de la persona a cuidar (`ENCRYPTION_KEY`).
- **Consentimiento explícito** en el registro.
- A las cuidadoras **nunca** se les muestra la dirección completa ni los datos de salud **hasta que aceptan** el turno; antes solo ven la zona aproximada.
- Aviso de privacidad en `/privacidad`.

---

## 9. Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de producción (incluye `prisma generate`) |
| `npm run db:push` | crea/actualiza el esquema en la BD |
| `npm run db:migrate` | crea una migración (historial) |
| `npm run db:seed` | datos de demostración |
| `npm run db:studio` | explorador visual de la BD |

---

## 10. Modelo de datos (resumen)

`User` (con `role`) · `CareRecipient` (persona a cuidar, datos cifrados) · `Plan` · `Subscription` (vinculada a Stripe) · `ExtraHoursPurchase` · `Shift` (turno/reserva, estados PENDIENTE/CONFIRMADO/COMPLETADO/CANCELADO) · `ShiftResponse` (constancia de aceptación/rechazo voluntario) · `CaregiverProfile` (zonas, disponibilidad, verificada) · `Payment` · `Message`.

Esquema completo en `prisma/schema.prisma`.
