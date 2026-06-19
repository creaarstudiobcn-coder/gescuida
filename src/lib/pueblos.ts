// Contenido SEO local por municipio del Maresme → /cuidadoras/[pueblo].
//
// REGLAS DE CONTENIDO:
//  · `name` debe coincidir EXACTAMENTE con la cadena de MUNICIPIOS_MARESME (src/lib/pricing.ts),
//    porque es la que se guarda en CaregiverProfile.zones y con la que filtramos en la BD.
//  · Cada municipio tiene texto ÚNICO (redacción, estructura y enfoque distintos). Las secciones
//    (número y encabezados) varían por pueblo a propósito: no es un molde clonado.
//  · Solo datos REALES y verificables (pertenencia al Maresme/provincia de Barcelona, costero o
//    interior, tamaño aproximado). NADA de barrios, residencias, cifras de población inventadas.

export interface PuebloSeo {
  slug: string; // URL: /cuidadoras/<slug>
  name: string; // nombre y, a la vez, cadena exacta de la zona en BD (CaregiverProfile.zones)
  geo: "costero" | "interior"; // dato real verificable (por el nombre/ubicación del municipio)
  seoTitle: string; // <title> único
  seoDescription: string; // meta description única
  hero: string; // párrafo de entrada (H1 va aparte, fijo por plantilla)
  sections: { h2: string; body: string[] }[]; // estructura variable por pueblo
  familias: string; // frase de contexto para la CTA de familias (única)
  cuidadoras: string; // frase de contexto para la CTA de cuidadoras (única)
  faq?: { q: string; a: string }[];
}

export const PUEBLOS_SEO: PuebloSeo[] = [
  {
    slug: "mataro",
    name: "Mataró",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Mataró | Ayuda a domicilio — GesCuida",
    seoDescription:
      "¿Buscas cuidadora para una persona mayor en Mataró? Conecta con cuidadoras independientes de la capital del Maresme. Tú eliges, contactas y acuerdas el cuidado directamente.",
    hero:
      "Mataró es la capital del Maresme, y en una ciudad de su tamaño hay muchas familias que, en algún momento, necesitan una mano para cuidar de un padre, una madre o un abuelo en casa. GesCuida nace precisamente aquí: te ponemos en contacto con cuidadoras de la zona para que encuentres a la persona adecuada, sin agencias de por medio.",
    sections: [
      {
        h2: "Ayuda a domicilio para personas mayores en Mataró",
        body: [
          "Cuando un familiar empieza a necesitar compañía, ayuda con las tareas del día a día o una atención más constante, lo natural es querer que siga en su propia casa, en su barrio y con sus rutinas. El problema suele ser el mismo: ¿por dónde empiezo a buscar una cuidadora de confianza?",
          "GesCuida resuelve esa primera parte. Reunimos a cuidadoras que trabajan en Mataró y en el resto del Maresme, y te damos las herramientas para contactar con ellas, ver cómo trabajan y acordar directamente los detalles. No somos una agencia que te asigna a alguien: eres tú quien elige.",
        ],
      },
      {
        h2: "Por qué las familias de Mataró eligen GesCuida",
        body: [
          "Porque decides tú. Ves a varias cuidadoras de la zona, hablas con ellas por el chat y eliges con quién quieres seguir. Sin que nadie te imponga un nombre ni un horario.",
          "Porque es transparente. Cada cuidadora fija su propia tarifa por hora y la acuerdas con ella; nosotros no añadimos un sobreprecio al cuidado. Tu cuota mensual es solo por usar la plataforma y poder contactar.",
          "Porque es de aquí. Las cuidadoras conocen Mataró y se mueven por la comarca, así que es más fácil encontrar a alguien que pueda acudir al domicilio con regularidad.",
        ],
      },
      {
        h2: "¿Eres cuidadora en Mataró o alrededores?",
        body: [
          "Si te dedicas al cuidado de personas mayores y trabajas en Mataró, registrarte en GesCuida es gratis. Recibes solicitudes de familias de tu zona, decides qué visitas aceptas y eres tú quien pone su tarifa.",
          "Al ser la capital de la comarca y uno de los municipios más poblados del Maresme, Mataró concentra buena parte de la demanda: es un buen punto de partida para darte a conocer.",
        ],
      },
    ],
    familias:
      "Si cuidas de un mayor en Mataró, encuentra hoy a una cuidadora de la zona.",
    cuidadoras:
      "¿Eres cuidadora en Mataró? Date a conocer entre las familias de la ciudad.",
    faq: [
      {
        q: "¿GesCuida es una agencia de cuidadoras?",
        a: "No. Somos una plataforma de conexión: te ponemos en contacto con cuidadoras independientes de Mataró y el Maresme. No las empleamos ni prestamos el servicio de cuidado; ese acuerdo es directamente entre la familia y la cuidadora.",
      },
      {
        q: "¿Cuánto cuesta el cuidado en Mataró?",
        a: "El precio del cuidado lo fija cada cuidadora según su tarifa por hora, y lo acuerdas con ella. La cuota de GesCuida es aparte y solo cubre el uso de la plataforma para encontrar y contactar cuidadoras.",
      },
    ],
  },
];

const BY_SLUG = new Map(PUEBLOS_SEO.map((p) => [p.slug, p]));

export function getPueblo(slug: string): PuebloSeo | undefined {
  return BY_SLUG.get(slug);
}

export function pueblosSlugs(): string[] {
  return PUEBLOS_SEO.map((p) => p.slug);
}
