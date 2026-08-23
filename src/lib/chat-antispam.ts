// Criba del chat de la web: decide si un mensaje huele a spam ANTES de avisar por email.
//
// REGLA DE ORO: el mensaje SIEMPRE se guarda. Aquí no se tira nada a la basura,
// solo se decide si merece interrumpir al admin con un correo. Un lead perdido
// cuesta mucho más que un correo de más, así que ante la duda: avisar.
// Lo único que se descarta sin guardar es el cebo (honeypot), que ningún humano
// puede rellenar, y las ráfagas por encima del límite.

export interface SpamVerdict {
  /** true = no se manda el aviso por email (el mensaje sí se guarda y sale en el panel). */
  spam: boolean;
  score: number;
  reasons: string[];
}

/** A partir de esta puntuación, el mensaje no genera aviso por email. */
export const SPAM_THRESHOLD = 4;

/** Máximo de mensajes que puede mandar un mismo hilo en la ventana de abajo. */
export const FLOOD_MAX_MESSAGES = 10;
export const FLOOD_WINDOW_MS = 10 * 60_000; // 10 minutos

/** Máximo de conversaciones NUEVAS por IP y hora (best-effort, en memoria). */
export const NEW_SESSIONS_PER_IP = 3;
export const NEW_SESSIONS_WINDOW_MS = 60 * 60_000;

// Enlaces: un visitante real casi nunca necesita pegar una URL en el chat.
const RE_URL =
  /(https?:\/\/|www\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9-]{2,}\.(com|net|org|ru|cn|xyz|top|click|shop|info|biz|online|site|live|icu|link|store)\b)/gi;

// Alfabetos que no se usan ni en castellano ni en catalán: cirílico, griego, hebreo,
// árabe, devanagari, georgiano, japonés, chino y coreano.
const RE_NO_LATINO =
  /[\u0400-\u04FF\u0500-\u052F\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u10A0-\u10FF\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/;

// Etiquetas HTML o BBCode incrustadas en el texto.
const RE_MARCADO = /<\s*(a|script|img|iframe|div|table)\b|\[url[=\]]|\[link[=\]]/i;

// Reclamos clásicos del spam de formularios (ya sin tildes, ver `normaliza`).
const CEBOS = [
  "seo", "backlink", "posicionamiento garantizado", "primera pagina de google",
  "trafico web", "visitas a tu web", "bitcoin", "cripto", "criptomoneda", "binance",
  "forex", "trading", "casino", "apuestas", "viagra", "cialis", "prestamo rapido",
  "credito rapido", "gana dinero", "ingresos pasivos", "trabajo desde casa",
  "oportunidad de negocio", "base de datos de correos", "envio masivo",
  "hackear", "hacked", "click here", "dear sir", "best regards", "increase your sales",
  "we can help you rank", "unsubscribe", "marketing agency", "web design services",
];

// Dominios de correo de usar y tirar.
const DESECHABLES = [
  "mailinator.com", "yopmail.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "temp-mail.org", "sharklasers.com", "trashmail.com",
  "getnada.com", "maildrop.cc", "dispostable.com", "fakeinbox.com",
];

// Palabras frecuentes de castellano y catalán. Si un texto largo no tiene NINGUNA,
// no está escrito en un idioma que atendamos.
const PALABRAS_ES_CA = [
  // Palabras funcionales (las lleva casi cualquier frase real)
  "el", "la", "los", "las", "lo", "un", "una", "unos", "unas", "de", "del", "al", "en",
  "es", "son", "esta", "estan", "hay", "no", "si", "se", "me", "mi", "te", "tu", "su",
  "yo", "el", "ella", "nos", "os", "ya", "y", "o", "pero", "porque", "como", "cuando",
  "donde", "quien", "cual", "cuanto", "cuanta", "muy", "mas", "menos", "tambien", "todo",
  "toda", "nada", "algo", "otro", "otra", "este", "esta", "eso", "aqui", "alli", "ahora",
  "hoy", "manana", "ayer", "bien", "mal", "por", "para", "con", "sin", "sobre", "desde",
  "hasta", "entre", "que", "quiero", "puedo", "tengo", "necesito", "seria", "podria",
  "gustaria", "estoy", "somos", "vosotros", "ustedes", "usted", "gracias", "hola", "buenas",
  "buenos", "adios", "favor", "porfa", "vale", "perdon", "disculpa",
  // Catalán
  "els", "les", "una", "amb", "per", "que", "com", "quan", "on", "qui", "quant", "molt",
  "mes", "tambe", "tot", "res", "aqui", "avui", "dema", "ahir", "be", "sense", "fins",
  "entre", "vull", "puc", "tinc", "necessito", "seria", "podria", "agradaria", "soc",
  "som", "gracies", "bones", "bon", "dia", "adeu", "si us plau", "perdo", "ja", "hi", "ho",
  // Vocabulario del negocio
  "cuidadora", "cuidador", "cuidado", "cuidar", "madre", "mare", "padre", "pare", "abuela",
  "abuelo", "avia", "avi", "senora", "senor", "precio", "preu", "plan", "hora", "horas",
  "hores", "informacion", "informacio", "ayuda", "ajuda", "servicio", "servei", "mataro",
  "maresme", "semana", "setmana", "mes", "dias", "familia", "casa", "domicilio", "domicili",
  "cita", "visita", "consulta", "contacto", "contacte", "telefono", "telefon", "email",
  "correo", "correu", "alta", "suscripcion", "subscripcio", "pago", "pagament", "factura",
];

function normaliza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // fuera tildes y diéresis
}

/**
 * Puntúa un mensaje del chat. No bloquea a nadie: solo decide si avisar por email.
 */
export function classifyChatMessage(
  body: string,
  ctx?: { name?: string | null; email?: string | null }
): SpamVerdict {
  const texto = body ?? "";
  const plano = normaliza(texto);
  const reasons: string[] = [];
  let score = 0;

  // ── Enlaces ──
  const urls = texto.match(RE_URL)?.length ?? 0;
  if (urls >= 2) {
    score += 5;
    reasons.push(`${urls} enlaces`);
  } else if (urls === 1) {
    score += 3;
    reasons.push("enlace");
  }

  // ── Alfabeto que no atendemos ──
  if (RE_NO_LATINO.test(texto)) {
    score += 4;
    reasons.push("alfabeto no latino");
  }

  // ── HTML / BBCode ──
  if (RE_MARCADO.test(texto)) {
    score += 3;
    reasons.push("marcado HTML");
  }

  // ── Reclamos de spam ──
  const cebos = CEBOS.filter((c) => plano.includes(c));
  if (cebos.length > 0) {
    score += Math.min(4, cebos.length * 2);
    reasons.push(`reclamo: ${cebos.slice(0, 3).join(", ")}`);
  }

  // ── Correo de usar y tirar ──
  const dominio = (ctx?.email ?? "").toLowerCase().split("@")[1]?.trim();
  if (dominio && DESECHABLES.includes(dominio)) {
    score += 2;
    reasons.push("correo desechable");
  }

  // ── Texto largo sin una sola palabra en castellano o catalán ──
  const palabras = plano.split(/[^a-z0-9]+/).filter(Boolean);
  if (plano.length >= 40 && !palabras.some((p) => PALABRAS_ES_CA.includes(p))) {
    score += 2;
    reasons.push("idioma no atendido");
  }

  // ── Gritos y teclas repetidas ──
  if (/(.)\1{6,}/.test(texto)) {
    score += 1;
    reasons.push("caracteres repetidos");
  }
  const letras = texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letras.length > 20 && letras.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "").length / letras.length > 0.7) {
    score += 1;
    reasons.push("todo en mayúsculas");
  }

  return { spam: score >= SPAM_THRESHOLD, score, reasons };
}

/** Escapa texto de un desconocido antes de meterlo en el HTML de un email. */
export function escapaHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
