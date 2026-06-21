import { Resend } from "resend";

// Envío de correos transaccionales con Resend.
//
// Configuración (variables de entorno):
//   · RESEND_API_KEY → clave API de https://resend.com (obligatoria para enviar de verdad)
//   · EMAIL_FROM     → remitente, p. ej. "GesCuida <no-responder@gescuida.es>"
//                      El dominio debe estar VERIFICADO en Resend (registros DNS).
//
// Si RESEND_API_KEY no está configurada, NO se rompe la app: en desarrollo se registra el
// contenido por consola (útil para probar el flujo antes de verificar el dominio).

const apiKey = process.env.RESEND_API_KEY?.trim();
const FROM = process.env.EMAIL_FROM?.trim() || "GesCuida <no-responder@gescuida.es>";

const resend = apiKey ? new Resend(apiKey) : null;

interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  if (!resend) {
    // Sin clave configurada: no enviamos, pero dejamos rastro para no bloquear el desarrollo.
    console.warn(
      `[email] RESEND_API_KEY no configurada — email NO enviado a ${to}.\n` +
        `        Asunto: ${subject}\n        ${text}`
    );
    return { ok: false, skipped: true };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error("[email] Resend devolvió error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] Error enviando con Resend:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendResult> {
  const subject = "Restablece tu contraseña — GesCuida";
  const text =
    `Has solicitado restablecer tu contraseña en GesCuida.\n\n` +
    `Abre este enlace para crear una nueva contraseña (caduca en 1 hora):\n${resetUrl}\n\n` +
    `Si no has sido tú, ignora este correo: tu contraseña no cambiará.`;
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2d3d">
    <h1 style="font-size:20px;color:#1f5e44">Restablece tu contraseña</h1>
    <p>Has solicitado restablecer tu contraseña en <strong>GesCuida</strong>.</p>
    <p>Pulsa el botón para crear una nueva contraseña. El enlace caduca en <strong>1 hora</strong>.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${resetUrl}"
         style="background:#2E9B72;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">
        Crear nueva contraseña
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
      <a href="${resetUrl}" style="color:#2E9B72;word-break:break-all">${resetUrl}</a>
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="font-size:13px;color:#6b7280">
      Si no has solicitado este cambio, ignora este correo: tu contraseña seguirá igual.
    </p>
  </div>`;
  return send(to, subject, html, text);
}

// Aviso a la cuidadora de que el equipo de GesCuida le ha escrito un mensaje en la plataforma.
// No incluye el contenido del mensaje: solo invita a entrar al panel a leerlo y responder.
export async function sendNewMessageEmail(
  to: string,
  name: string,
  panelUrl: string
): Promise<SendResult> {
  const subject = "Tienes un mensaje nuevo — GesCuida";
  const saludo = name ? `Hola ${name}:` : "Hola:";
  const text =
    `${saludo}\n\n` +
    `El equipo de GesCuida te ha enviado un mensaje en la plataforma.\n\n` +
    `Entra en tu panel para leerlo y responder:\n${panelUrl}\n\n` +
    `Un saludo,\nEquipo GesCuida`;
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2d3d">
    <h1 style="font-size:20px;color:#1f5e44">Tienes un mensaje nuevo</h1>
    <p>${saludo}</p>
    <p>El equipo de <strong>GesCuida</strong> te ha enviado un mensaje en la plataforma.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${panelUrl}"
         style="background:#2E9B72;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">
        Leer y responder
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
      <a href="${panelUrl}" style="color:#2E9B72;word-break:break-all">${panelUrl}</a>
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="font-size:13px;color:#6b7280">
      Recibes este aviso porque tienes una cuenta de cuidadora en GesCuida.
    </p>
  </div>`;
  return send(to, subject, html, text);
}

// Aviso al ADMIN de que un visitante ha escrito por el chat de la web mientras no estaba
// conectado. Incluye el nombre/email del visitante y un extracto para poder priorizar.
export async function sendChatNotificationEmail(
  to: string,
  opts: { visitorName?: string | null; visitorEmail?: string | null; preview: string; panelUrl: string }
): Promise<SendResult> {
  const { visitorName, visitorEmail, preview, panelUrl } = opts;
  const quien = visitorName?.trim() || "Un visitante";
  const contacto = visitorEmail?.trim() ? ` (${visitorEmail.trim()})` : "";
  const subject = "Nuevo mensaje en el chat de la web — GesCuida";
  const text =
    `${quien}${contacto} te ha escrito por el chat de la web:\n\n` +
    `"${preview}"\n\n` +
    `Entra en el panel para responder:\n${panelUrl}\n\n` +
    `Equipo GesCuida`;
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2d3d">
    <h1 style="font-size:20px;color:#1f5e44">Nuevo mensaje en el chat de la web</h1>
    <p><strong>${quien}</strong>${contacto} te ha escrito:</p>
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid #2E9B72;background:#f0faf5;border-radius:6px;color:#1f2d3d">
      ${preview}
    </blockquote>
    <p style="text-align:center;margin:28px 0">
      <a href="${panelUrl}"
         style="background:#2E9B72;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">
        Responder en el panel
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
      <a href="${panelUrl}" style="color:#2E9B72;word-break:break-all">${panelUrl}</a>
    </p>
  </div>`;
  return send(to, subject, html, text);
}
