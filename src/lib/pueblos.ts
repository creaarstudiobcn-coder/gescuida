// Contenido SEO local por municipio → /cuidadoras/[pueblo].
//
// Cobertura: los 15 municipios del Maresme + las ciudades grandes de la provincia de Barcelona.
//
// REGLAS DE CONTENIDO:
//  · `name` debe coincidir EXACTAMENTE con la cadena de zonas (MUNICIPIOS, src/lib/pricing.ts),
//    porque es la que se guarda en CaregiverProfile.zones y con la que filtramos en la BD.
//  · Cada municipio tiene texto ÚNICO (redacción, estructura y enfoque distintos). Las secciones
//    (número y encabezados) varían por ciudad a propósito: no es un molde clonado.
//  · Solo datos REALES y verificables (comarca, provincia de Barcelona, área metropolitana o
//    interior, costero o no, tamaño relativo). NADA de barrios, residencias o cifras inventadas.
//  · Cada página capta a LOS DOS PÚBLICOS: familias (paraFamilias) y cuidadoras (paraCuidadoras),
//    con texto adaptado a cada uno.

export interface PuebloSeo {
  slug: string; // URL: /cuidadoras/<slug>
  name: string; // nombre y, a la vez, cadena exacta de la zona en BD (CaregiverProfile.zones)
  geo: "costero" | "interior"; // dato real verificable (por el nombre/ubicación del municipio)
  comarca?: string; // comarca real (default "Maresme"); usado en Schema.org y en el badge
  regionLabel?: string; // etiqueta del badge (override); si no, se deriva de comarca + geo
  seoTitle: string; // <title> único
  seoDescription: string; // meta description única
  hero: string; // párrafo de entrada (H1 va aparte, fijo por plantilla)
  sections: { h2: string; body: string[] }[]; // estructura variable por ciudad
  // Secciones prominentes para cada público (texto único por ciudad). Si no se definen, se usan
  // las frases cortas `familias`/`cuidadoras` como respaldo.
  paraFamilias?: { titulo?: string; body: string[] };
  paraCuidadoras?: { titulo?: string; body: string[] };
  familias: string; // frase de respaldo para la sección de familias (única)
  cuidadoras: string; // frase de respaldo para la sección de cuidadoras (única)
  faq?: { q: string; a: string }[];
}

export const PUEBLOS_SEO: PuebloSeo[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    geo: "costero",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · capital",
    seoTitle: "Cuidadora de mayores en Barcelona | Ayuda a domicilio — GesCuida",
    seoDescription:
      "¿Buscas cuidadora para una persona mayor en Barcelona? Conecta con cuidadoras independientes de la ciudad. Tú eliges, contactas y acuerdas el cuidado directamente, sin agencias.",
    hero:
      "Barcelona es la ciudad más grande de Cataluña y la que más familias tiene cuidando de un mayor en casa. En una ciudad de este tamaño no faltan opciones, pero precisamente por eso cuesta saber por dónde empezar y en quién confiar. GesCuida simplifica esa primera búsqueda: te pone en contacto directo con cuidadoras que trabajan en Barcelona, sin agencias de por medio.",
    sections: [
      {
        h2: "Ayuda a domicilio para personas mayores en Barcelona",
        body: [
          "Cuando un padre, una madre o un abuelo empieza a necesitar compañía, ayuda con las tareas del día o una atención más constante, lo habitual es querer que siga en su propia casa, en su barrio de siempre. En una ciudad tan grande como Barcelona, el reto no es que falten cuidadoras, sino encontrar a la persona adecuada entre muchas.",
          "GesCuida resuelve esa parte. Reunimos a cuidadoras que trabajan por los distintos barrios y distritos de la ciudad, y te damos las herramientas para contactar con ellas, ver cómo trabajan y acordar directamente los detalles. No somos una agencia que te asigna a alguien: eres tú quien elige.",
        ],
      },
      {
        h2: "Una ciudad grande, cuidadoras cerca de tu zona",
        body: [
          "Barcelona se vive por barrios, y en el cuidado de un mayor la cercanía importa: una cuidadora que se mueve por tu zona llega antes y puede mantener una rutina estable. Por eso cada cuidadora indica las áreas de la ciudad que cubre, para que encuentres a alguien que pueda acudir al domicilio con regularidad.",
          "Además, al estar todo bien comunicado por transporte público, muchas cuidadoras se desplazan con facilidad entre distritos, lo que amplía tus opciones reales.",
        ],
      },
      {
        h2: "Transparencia: la cuota y el cuidado van por separado",
        body: [
          "Cada cuidadora fija su propia tarifa por hora y la acuerdas directamente con ella; GesCuida no añade ningún sobreprecio al cuidado. Tu cuota mensual es solo por usar la plataforma para encontrar y contactar cuidadoras. Así sabes siempre qué pagas y a quién.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Barcelona?",
      body: [
        "Encuentra a una cuidadora de confianza que trabaje en tu zona de la ciudad. Ves varios perfiles, hablas con ellas por el chat y eliges tú con quién seguir, sin que nadie te imponga un nombre ni un horario.",
        "El cuidado lo acuerdas directamente con la cuidadora: tareas, horarios y tarifa. Tu cuota es solo por usar la plataforma; el resto lo decides tú.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Barcelona?",
      body: [
        "Regístrate gratis y empieza a recibir solicitudes de familias de la ciudad. Tú pones tu tarifa por hora, indicas las zonas de Barcelona que cubres y aceptas solo los turnos que te encajan.",
        "Barcelona concentra una gran parte de la demanda de cuidado a domicilio de toda Cataluña: es un buen sitio para darte a conocer y encontrar trabajo estable cerca de casa.",
      ],
    },
    familias: "Encuentra hoy una cuidadora de confianza en tu zona de Barcelona.",
    cuidadoras: "¿Cuidas mayores en Barcelona? Regístrate gratis y recibe solicitudes de familias.",
    faq: [
      {
        q: "¿GesCuida es una agencia de cuidadoras?",
        a: "No. Somos una plataforma de conexión: te ponemos en contacto con cuidadoras independientes que trabajan en Barcelona. No las empleamos ni prestamos el servicio de cuidado; ese acuerdo es directamente entre la familia y la cuidadora.",
      },
      {
        q: "¿Hay cuidadoras en todos los barrios de Barcelona?",
        a: "Cada cuidadora indica las zonas de la ciudad que cubre. En la página verás las que tienen Barcelona entre sus áreas de trabajo; si todavía no hay ninguna disponible en tu zona concreta, te lo decimos con sinceridad y te avisamos en cuanto la haya.",
      },
      {
        q: "¿Cuánto cuesta el cuidado en Barcelona?",
        a: "El precio lo fija cada cuidadora según su tarifa por hora, y lo acuerdas con ella. La cuota de GesCuida es aparte y solo cubre el uso de la plataforma para encontrar y contactar cuidadoras.",
      },
    ],
  },

  {
    slug: "badalona",
    name: "Badalona",
    geo: "costero",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en Badalona | Ayuda a domicilio — GesCuida",
    seoDescription:
      "Encuentra cuidadora para una persona mayor en Badalona. Conecta con cuidadoras independientes de la ciudad y del área metropolitana; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Badalona es una de las ciudades más pobladas de Cataluña, pegada a Barcelona y abierta al mar. Con tanta gente, son muchas las familias que en algún momento necesitan una mano para cuidar de un mayor en casa. GesCuida les acerca a cuidadoras que ya trabajan en Badalona y su entorno, sin pasar por una agencia.",
    sections: [
      {
        h2: "Cuidado de mayores a domicilio en Badalona",
        body: [
          "A veces basta con compañía y ayuda unas horas; otras hace falta una atención más continuada con la higiene, las comidas o la medicación. En ambos casos, lo que más tranquiliza es contar con alguien de confianza que pueda acudir al domicilio con regularidad y mantener a la persona mayor en su casa de siempre.",
          "GesCuida te muestra cuidadoras que trabajan en Badalona; tú comparas, hablas con ellas por el chat y decides. Ni asignamos cuidadoras ni cobramos el cuidado: el acuerdo —tareas, horarios y tarifa— se cierra directamente entre la familia y la cuidadora.",
        ],
      },
      {
        h2: "Una gran ciudad, mejor con cuidadoras de la zona",
        body: [
          "Badalona es extensa y se vive por barrios, así que una cuidadora que se mueva por tu zona es una ventaja real: llega antes, conoce el entorno y puede mantener una rutina estable. Y al estar dentro del área metropolitana y bien comunicada con Barcelona y Sant Adrià, muchas cuidadoras cubren varios municipios cercanos.",
        ],
      },
      {
        h2: "Sin sobreprecios sobre el cuidado",
        body: [
          "Cada cuidadora pone su propia tarifa por hora y la acuerdas con ella. GesCuida no añade ningún recargo al cuidado: tu cuota mensual es solo por usar la plataforma para encontrar y contactar cuidadoras de Badalona.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Badalona?",
      body: [
        "Conecta con cuidadoras que trabajan en Badalona y su entorno. Comparas varios perfiles, hablas con ellas y eliges tú a la persona adecuada, sin que nadie te la imponga.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora. Tu cuota solo cubre el uso de la plataforma para encontrarla.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Badalona?",
      body: [
        "Regístrate gratis y recibe solicitudes de familias de Badalona y los municipios vecinos. Tú decides tu tarifa por hora, las zonas que cubres y los turnos que aceptas.",
        "Al ser una de las ciudades más grandes del área metropolitana, en Badalona hay una demanda constante de cuidado a domicilio: una buena base para encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de Badalona.",
    cuidadoras: "¿Cuidas mayores en Badalona? Regístrate gratis y empieza a recibir solicitudes.",
    faq: [
      {
        q: "¿Las cuidadoras son de Badalona?",
        a: "Trabajamos con cuidadoras del área metropolitana. En la página verás las que tienen Badalona entre sus zonas de trabajo; si aún no hay ninguna registrada en tu zona, te lo decimos con sinceridad y te avisamos en cuanto la haya.",
      },
      {
        q: "¿Qué incluye la cuota de GesCuida?",
        a: "Solo el uso de la plataforma para contactar con cuidadoras. El cuidado en sí lo acuerdas y lo pagas directamente con la cuidadora que elijas.",
      },
    ],
  },

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

  {
    slug: "premia-de-mar",
    name: "Premià de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Premià de Mar — GesCuida",
    seoDescription:
      "Encuentra cuidadora de personas mayores en Premià de Mar. Te conectamos con cuidadoras independientes del Baix Maresme; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Premià de Mar es uno de los municipios más vivos y poblados de la costa del Maresme, a un paso de Barcelona. En un pueblo tan compacto, encontrar quien eche una mano con un mayor no debería ser complicado: en GesCuida te acercamos a cuidadoras que ya trabajan en Premià y en los pueblos de al lado.",
    sections: [
      {
        h2: "Cuidado de mayores sin salir de Premià de Mar",
        body: [
          "Tener a alguien de confianza que pueda acudir al domicilio, acompañar en las salidas o ayudar con las rutinas del día cambia mucho la vida de una familia. Y cuando la cuidadora vive cerca, todo es más fácil: llega antes, conoce el entorno y puede mantener una atención regular.",
          "En GesCuida no asignamos a nadie ni hacemos de intermediarios del cuidado. Te mostramos cuidadoras de la zona, hablas con ellas y decides. El acuerdo —horarios, tareas y tarifa— lo cerráis vosotros.",
        ],
      },
      {
        h2: "Lo que te llevas con GesCuida",
        body: [
          "Eliges sin presión, comparando varias cuidadoras del Baix Maresme. Pagas una cuota por usar la plataforma, no un recargo sobre el cuidado: la tarifa por hora la pone cada cuidadora. Y al ser todo gente de la zona, es más sencillo encontrar continuidad.",
        ],
      },
      {
        h2: "Cuidadoras de Premià y alrededores",
        body: [
          "Si cuidas a personas mayores y te mueves por Premià de Mar, el registro es gratuito. Recibes solicitudes de familias cercanas y tú decides qué turnos te encajan. En una población tan grande y bien comunicada, las oportunidades no faltan.",
        ],
      },
    ],
    familias: "Busca hoy una cuidadora que viva cerca, en Premià de Mar o el Baix Maresme.",
    cuidadoras: "¿Cuidas en Premià de Mar? Recibe avisos de familias de tu propio pueblo.",
    faq: [
      {
        q: "¿Las cuidadoras son de Premià de Mar?",
        a: "Trabajamos con cuidadoras de todo el Maresme. En la página verás las que tienen Premià de Mar entre sus zonas; si aún no hay ninguna registrada aquí, te lo decimos con sinceridad y te avisamos en cuanto la haya.",
      },
      {
        q: "¿Qué incluye la cuota de GesCuida?",
        a: "Solo el uso de la plataforma para contactar con cuidadoras. El cuidado en sí lo acuerdas y lo pagas directamente con la cuidadora que elijas.",
      },
    ],
  },

  {
    slug: "el-masnou",
    name: "El Masnou",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en El Masnou — GesCuida",
    seoDescription:
      "¿Necesitas una cuidadora para un mayor en El Masnou? Conecta con cuidadoras independientes del Maresme. Tú decides con quién y acuerdas el cuidado directamente.",
    hero:
      "Con su puerto y su larga tradición marinera, El Masnou es uno de esos pueblos del Maresme donde la gente echa raíces y quiere envejecer en casa, cerca del mar de siempre. GesCuida ayuda a las familias del municipio a encontrar cuidadoras de la zona para hacerlo posible.",
    sections: [
      {
        h2: "Acompañar a los mayores de El Masnou en su propia casa",
        body: [
          "No siempre hace falta un gran cambio: a veces basta con compañía unas horas, ayuda para la compra o una mano con el aseo y las comidas. Lo importante es que esa persona siga en su entorno, con sus vecinos y sus costumbres.",
          "Nuestro papel es ponerte en contacto con cuidadoras que trabajan en El Masnou y los municipios vecinos. Ni te imponemos a nadie ni cobramos el cuidado: eliges tú y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "¿Cuidas en El Masnou? Date a conocer",
        body: [
          "Si te dedicas al cuidado de mayores y vives o trabajas en El Masnou, registrarte es gratis. Te llegan solicitudes de familias cercanas, fijas tu propia tarifa y aceptas solo los turnos que puedas asumir. Estar cerca, en un municipio bien conectado con Barcelona y la costa, es una ventaja para encontrar trabajo estable.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora de confianza en El Masnou, sin agencias de por medio.",
    cuidadoras: "Vives en El Masnou y cuidas mayores: empieza a recibir solicitudes hoy.",
    faq: [
      {
        q: "¿GesCuida emplea a las cuidadoras?",
        a: "No. Somos una plataforma de conexión: las cuidadoras son profesionales independientes. No las contratamos ni prestamos el servicio; te ayudamos a encontrarlas y a contactarlas.",
      },
    ],
  },

  {
    slug: "vilassar-de-mar",
    name: "Vilassar de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Vilassar de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Vilassar de Mar. Te conectamos con cuidadoras del Maresme; eliges, contactas y acuerdas el cuidado directamente, sin intermediarios.",
    hero:
      "Vilassar de Mar es un pueblo costero del Maresme con una fuerte tradición ligada a la horticultura y la flor. Aquí, como en toda la comarca, muchas familias quieren que sus mayores sigan en casa el mayor tiempo posible. GesCuida les acerca a cuidadoras de la zona para conseguirlo.",
    sections: [
      {
        h2: "Ayuda a domicilio para mayores en Vilassar de Mar",
        body: [
          "Cada situación es distinta: hay quien necesita compañía y vigilancia unas horas, y quien requiere una atención más continuada. Lo que no cambia es la tranquilidad de contar con alguien de confianza que pueda acudir al domicilio con regularidad.",
          "GesCuida te muestra cuidadoras que trabajan en Vilassar de Mar y alrededores. Tú comparas, hablas con ellas y decides; el cuidado —y su precio— se acuerda directamente entre la familia y la cuidadora.",
        ],
      },
      {
        h2: "Por qué funciona estar cerca",
        body: [
          "Una cuidadora de la zona no solo llega antes: conoce el pueblo, se mueve con facilidad y puede mantener una rutina estable con la persona mayor. Esa cercanía es, muchas veces, lo que marca la diferencia en el día a día.",
        ],
      },
      {
        h2: "Para cuidadoras de Vilassar de Mar",
        body: [
          "Si cuidas a personas mayores en Vilassar de Mar, apúntate gratis. Defines tu tarifa, eliges los turnos que aceptas y recibes solicitudes de familias de tu entorno más cercano.",
        ],
      },
    ],
    familias: "Conecta con cuidadoras que trabajan en Vilassar de Mar y el Maresme.",
    cuidadoras: "Cuida cerca de casa: recibe solicitudes de familias de Vilassar de Mar.",
  },

  {
    slug: "argentona",
    name: "Argentona",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Argentona — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Argentona, en el interior del Maresme junto a Mataró. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "A pocos minutos de Mataró pero ya tierra adentro, Argentona es un municipio del Maresme con carácter de pueblo y vida propia. Para las familias que cuidan de un mayor aquí, GesCuida es la forma de encontrar cuidadoras de la zona sin recurrir a una agencia.",
    sections: [
      {
        h2: "Cuidar de los mayores de Argentona, en su entorno",
        body: [
          "En un municipio de interior, donde las casas a veces quedan algo más repartidas, contar con una cuidadora que conozca la zona y pueda desplazarse con facilidad es especialmente útil. La idea es siempre la misma: que la persona mayor siga en su casa, con sus rutinas y su gente.",
          "GesCuida te conecta con cuidadoras que trabajan en Argentona y en la vecina Mataró. No intervenimos en el cuidado ni lo cobramos: eliges a la cuidadora y acordáis directamente horarios, tareas y tarifa.",
        ],
      },
      {
        h2: "¿Eres cuidadora en Argentona o en Mataró?",
        body: [
          "Por su cercanía a Mataró, capital de la comarca, las cuidadoras de Argentona pueden cubrir una zona amplia. Si te dedicas a esto, el registro es gratis: pones tu tarifa, eliges turnos y recibes solicitudes de familias de los alrededores.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora en Argentona o en la cercana Mataró.",
    cuidadoras: "Cuidas en Argentona: cubre también Mataró y multiplica tus oportunidades.",
    faq: [
      {
        q: "¿Y si no hay cuidadoras registradas en Argentona todavía?",
        a: "Te lo decimos con claridad y, al estar tan cerca de Mataró, es probable que encuentres cuidadoras que cubran ambos municipios. Regístrate como familia y te avisamos en cuanto haya disponibilidad en tu zona.",
      },
    ],
  },

  {
    slug: "cabrera-de-mar",
    name: "Cabrera de Mar",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Cabrera de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Cabrera de Mar, en el Baix Maresme. Te conectamos con cuidadoras de la zona; eliges y acuerdas el cuidado directamente.",
    hero:
      "Cabrera de Mar es un municipio pequeño del Baix Maresme, con su núcleo asentado tierra adentro entre Vilassar de Mar y Mataró. En los pueblos de tamaño reducido, el boca a boca no siempre basta para encontrar quien cuide de un mayor; GesCuida amplía esa búsqueda a las cuidadoras de toda la zona.",
    sections: [
      {
        h2: "Encontrar cuidadora en un pueblo pequeño",
        body: [
          "Que Cabrera sea un municipio pequeño no significa que tengas menos opciones. A través de GesCuida accedes a cuidadoras que trabajan en los pueblos colindantes y que pueden desplazarse hasta aquí sin problema.",
          "Como en el resto de la comarca, nosotros solo hacemos la conexión: te mostramos cuidadoras, hablas con ellas y eliges. El cuidado y su tarifa los acuerdas directamente con la persona que escojas.",
        ],
      },
      {
        h2: "Cuidadoras de la zona de Cabrera de Mar",
        body: [
          "Si cuidas a personas mayores y te mueves por Cabrera de Mar, Vilassar o Mataró, regístrate gratis. Definir una zona amplia te ayudará a recibir más solicitudes de familias cercanas.",
        ],
      },
    ],
    familias: "Amplía tu búsqueda: cuidadoras de Cabrera de Mar y los pueblos vecinos.",
    cuidadoras: "Cubre Cabrera de Mar y alrededores y recibe más solicitudes.",
  },

  {
    slug: "premia-de-dalt",
    name: "Premià de Dalt",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Premià de Dalt — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Premià de Dalt, en la parte alta del Baix Maresme. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Asomado a la falda de la sierra, justo por encima de Premià de Mar, Premià de Dalt es un municipio de interior tranquilo y residencial. Para sus familias, cuidar de un mayor en casa pasa por encontrar a alguien de confianza cerca; GesCuida ayuda a dar con esa persona.",
    sections: [
      {
        h2: "Cuidado a domicilio en la parte alta del Maresme",
        body: [
          "En los municipios de interior, con calles en cuesta y viviendas más dispersas, tener una cuidadora que conozca la zona y se mueva con soltura es una gran ayuda. El objetivo es que el mayor siga en su hogar, con su ritmo y sus costumbres.",
          "GesCuida te conecta con cuidadoras que trabajan en Premià de Dalt y en el cercano Premià de Mar. No empleamos a nadie ni cobramos el cuidado: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Cuidadoras entre Premià de Dalt y Premià de Mar",
        body: [
          "Los dos Premià están pegados, así que una cuidadora puede cubrir fácilmente ambos. Si te dedicas al cuidado de mayores, apúntate gratis, pon tu tarifa y recibe solicitudes de familias de la zona.",
        ],
      },
    ],
    familias: "Busca cuidadora en Premià de Dalt y su entorno más cercano.",
    cuidadoras: "Cuida en Premià de Dalt y de Mar a la vez: una zona, más solicitudes.",
    faq: [
      {
        q: "¿La cuidadora puede venir desde Premià de Mar?",
        a: "Sí. Muchas cuidadoras cubren tanto Premià de Dalt como Premià de Mar por su cercanía. En la página verás quién tiene tu municipio entre sus zonas de trabajo.",
      },
    ],
  },

  {
    slug: "vilassar-de-dalt",
    name: "Vilassar de Dalt",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Vilassar de Dalt — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Vilassar de Dalt, interior del Maresme. Te conectamos con cuidadoras de la zona; eliges, contactas y acuerdas el cuidado directamente.",
    hero:
      "Vilassar de Dalt es un pueblo de interior del Maresme, recostado en la sierra por encima de Vilassar de Mar. Conserva un aire tranquilo de villa con historia, y muchas de sus familias quieren que sus mayores envejezcan precisamente ahí, en casa. GesCuida les ayuda a encontrar cuidadoras de la zona.",
    sections: [
      {
        h2: "Que tu mayor siga en casa, en Vilassar de Dalt",
        body: [
          "A veces lo que se necesita es compañía y supervisión; otras, una ayuda más constante con la higiene, las comidas o la medicación. En cualquier caso, contar con una cuidadora cercana permite mantener una rutina estable sin sacar a la persona de su entorno.",
          "Nosotros nos limitamos a conectar: te enseñamos cuidadoras que trabajan en Vilassar de Dalt y alrededores, y eres tú quien elige y acuerda con ellas el cuidado y su precio.",
        ],
      },
      {
        h2: "Para cuidadoras de Vilassar de Dalt y la zona",
        body: [
          "Si cuidas a personas mayores por esta parte del Maresme, el registro es gratuito. Tú decides tu tarifa y tus turnos, y recibes solicitudes de familias de Vilassar de Dalt y los municipios vecinos.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora cercana en Vilassar de Dalt.",
    cuidadoras: "Recibe solicitudes de familias de Vilassar de Dalt y alrededores.",
  },

  {
    slug: "cabrils",
    name: "Cabrils",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Cabrils — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Cabrils, municipio residencial del interior del Maresme. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Cabrils es un municipio pequeño y residencial del interior del Maresme, de calles tranquilas y casas entre la vegetación. En un entorno así, dar con una cuidadora de confianza para un mayor es más fácil si amplías la búsqueda más allá del propio pueblo, y eso es justo lo que hace GesCuida.",
    sections: [
      {
        h2: "Cuidadoras para Cabrils y su entorno",
        body: [
          "En un pueblo residencial, con viviendas algo separadas, conviene que la cuidadora conozca la zona y pueda desplazarse con comodidad. GesCuida te pone en contacto con cuidadoras que trabajan en Cabrils y en los municipios cercanos como Vilassar o Premià.",
          "Nosotros solo hacemos de puente: te mostramos a las cuidadoras, hablas con ellas y eliges. El acuerdo del cuidado —tareas, horarios y tarifa— es directamente con la cuidadora.",
        ],
      },
      {
        h2: "¿Cuidas mayores cerca de Cabrils?",
        body: [
          "Si te dedicas al cuidado y cubres Cabrils y alrededores, apúntate gratis. Cuanto más amplia sea tu zona, más solicitudes de familias podrás recibir.",
        ],
      },
    ],
    familias: "Cuidadoras para Cabrils y los pueblos vecinos, a un clic.",
    cuidadoras: "Cubre Cabrils y su entorno y llega a más familias.",
    faq: [
      {
        q: "Cabrils es muy pequeño, ¿habrá cuidadoras?",
        a: "Trabajamos con cuidadoras de todo el Maresme, no solo del propio pueblo. Muchas cubren varios municipios cercanos, así que es habitual encontrar a alguien que pueda desplazarse a Cabrils. Si todavía no hay nadie, te lo decimos sin inventar cifras.",
      },
    ],
  },

  {
    slug: "arenys-de-mar",
    name: "Arenys de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Arenys de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Arenys de Mar. Te conectamos con cuidadoras del Maresme; eliges, contactas y acuerdas el cuidado directamente, sin agencias.",
    hero:
      "Con su puerto pesquero y una identidad marinera muy arraigada, Arenys de Mar es uno de los pueblos con más carácter del Maresme. Y como en todo pueblo con raíces, las familias quieren cuidar de sus mayores sin sacarlos de su sitio. GesCuida les conecta con cuidadoras de la zona para lograrlo.",
    sections: [
      {
        h2: "Cuidar de los mayores de Arenys sin que dejen su casa",
        body: [
          "Mantener a una persona mayor en su hogar, cerca del puerto y de la gente de toda la vida, suele ser la mejor opción para ella. A menudo solo hace falta una mano de confianza: compañía, ayuda con la casa o una atención más continuada.",
          "GesCuida te muestra cuidadoras que trabajan en Arenys de Mar y en los pueblos del entorno. Tú eliges con quién seguir; el cuidado y su tarifa los acuerdas directamente con la cuidadora, sin que nosotros intervengamos.",
        ],
      },
      {
        h2: "Cercanía, la gran ventaja",
        body: [
          "Una cuidadora del propio Arenys o de los alrededores llega antes, conoce el pueblo y puede mantener una rutina estable. En el cuidado de mayores, esa constancia vale mucho.",
        ],
      },
      {
        h2: "Para cuidadoras de Arenys de Mar",
        body: [
          "Si cuidas a personas mayores en Arenys, regístrate gratis. Pones tu tarifa, eliges tus turnos y recibes solicitudes de familias del pueblo y de la comarca.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora arraigada en Arenys de Mar y su entorno.",
    cuidadoras: "¿Cuidas en Arenys de Mar? Empieza a recibir solicitudes de familias cercanas.",
    faq: [
      {
        q: "¿Cómo sé que una cuidadora es de fiar?",
        a: "En la página verás su presentación, su formación y su tarifa, y podrás hablar con ella antes de decidir. GesCuida muestra a las cuidadoras verificadas por nuestro equipo, pero la decisión final, tras conocerla, es siempre tuya.",
      },
    ],
  },

  {
    slug: "canet-de-mar",
    name: "Canet de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Canet de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Canet de Mar, en la costa del Maresme. Conecta con cuidadoras independientes de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Canet de Mar es un pueblo costero del Maresme conocido por su huella modernista, que todavía se respira por sus calles. Más allá del patrimonio, es un municipio donde la gente vive y envejece junto al mar; GesCuida ayuda a sus familias a encontrar cuidadoras de confianza en la zona.",
    sections: [
      {
        h2: "Ayuda a domicilio para mayores en Canet de Mar",
        body: [
          "Que un familiar mayor pueda quedarse en su casa, con sus cosas y su rutina, suele ser lo que más tranquilidad da a todos. Para hacerlo posible muchas veces basta con la ayuda adecuada unas horas al día, o un acompañamiento más completo cuando hace falta.",
          "GesCuida conecta a las familias de Canet con cuidadoras que trabajan en el municipio y en los pueblos vecinos. Ni asignamos cuidadoras ni cobramos el cuidado: eliges tú y lo acuerdas directamente con ella.",
        ],
      },
      {
        h2: "¿Eres cuidadora en Canet de Mar?",
        body: [
          "Si te dedicas al cuidado de personas mayores y trabajas en Canet o cerca, el registro es gratuito. Fijas tu tarifa, decides qué turnos aceptas y recibes solicitudes de familias de la zona costera del Maresme.",
        ],
      },
    ],
    familias: "Conecta con cuidadoras de Canet de Mar, sin intermediarios.",
    cuidadoras: "Cuidas en Canet de Mar: date a conocer entre las familias del pueblo.",
  },

  {
    slug: "calella",
    name: "Calella",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Calella — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Calella, en el Alt Maresme. Te conectamos con cuidadoras de la zona; eliges, contactas y acuerdas el cuidado directamente.",
    hero:
      "Calella es uno de los grandes destinos turísticos de la costa del Maresme, pero detrás del verano hay un pueblo que vive todo el año, con sus vecinos mayores y sus familias. GesCuida está pensado para ellos: para encontrar cuidadoras de la zona que acompañen a esos mayores cuando lo necesitan.",
    sections: [
      {
        h2: "Más allá del turismo: cuidar a los mayores de Calella todo el año",
        body: [
          "Cuando pasa la temporada, queda el pueblo de siempre, y con él las familias que cuidan de un padre, una madre o un abuelo. Esos cuidados no entienden de calendario: hacen falta en enero igual que en agosto.",
          "GesCuida te conecta con cuidadoras que trabajan en Calella y en el Alt Maresme durante todo el año. Tú eliges a la persona y acordáis directamente el cuidado y su precio; nosotros solo facilitamos el contacto.",
        ],
      },
      {
        h2: "Por qué elegir una cuidadora de la zona",
        body: [
          "Una cuidadora que vive cerca conoce Calella, se desplaza con facilidad y puede mantener una atención regular. Esa estabilidad es clave cuando se cuida a una persona mayor día tras día.",
        ],
      },
      {
        h2: "Para cuidadoras de Calella y el Alt Maresme",
        body: [
          "Si cuidas a personas mayores en Calella o los pueblos del norte de la comarca, apúntate gratis. Defines tu tarifa, eliges tus turnos y recibes solicitudes de familias locales, no solo en temporada alta.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora en Calella para los doce meses del año.",
    cuidadoras: "Cuida en Calella todo el año: recibe solicitudes de familias locales.",
    faq: [
      {
        q: "¿Solo hay cuidadoras en verano?",
        a: "No. GesCuida conecta a familias y cuidadoras durante todo el año, al margen de la temporada turística. El cuidado de un mayor es una necesidad estable, y así lo tratamos.",
      },
    ],
  },

  {
    slug: "pineda-de-mar",
    name: "Pineda de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Pineda de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Pineda de Mar, en el Alt Maresme. Conecta con cuidadoras independientes de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "En el tramo norte de la costa del Maresme, Pineda de Mar combina vida de pueblo y ajetreo de temporada. Para las familias que residen aquí durante todo el año, cuidar de un mayor en casa es una prioridad; GesCuida les ayuda a encontrar cuidadoras de la zona.",
    sections: [
      {
        h2: "Cuidado a domicilio en Pineda de Mar",
        body: [
          "Compañía unas horas, ayuda con las tareas, acompañamiento a las visitas médicas o una atención más continua: las necesidades varían, pero la idea es siempre que la persona mayor siga en su hogar. Una cuidadora cercana lo hace posible.",
          "GesCuida te muestra cuidadoras que trabajan en Pineda de Mar y en el Alt Maresme. No empleamos a nadie ni cobramos el cuidado: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Cuidadoras del norte del Maresme",
        body: [
          "Si cuidas a personas mayores en Pineda o en los pueblos del entorno, regístrate gratis. Pones tu tarifa, eliges tus turnos y recibes solicitudes de familias de la zona durante todo el año.",
        ],
      },
    ],
    familias: "Busca una cuidadora de confianza en Pineda de Mar.",
    cuidadoras: "Cuidas en Pineda de Mar: conecta con familias de tu zona.",
    faq: [
      {
        q: "¿Qué pasa si todavía no hay cuidadoras en Pineda de Mar?",
        a: "Si aún no tenemos cuidadoras registradas en tu municipio, te lo decimos con honestidad, sin cifras inventadas. Como muchas cuidadoras cubren varios pueblos del Alt Maresme, es posible que encuentres a alguien cercano igualmente.",
      },
    ],
  },

  {
    slug: "malgrat-de-mar",
    name: "Malgrat de Mar",
    geo: "costero",
    seoTitle: "Cuidadora de mayores en Malgrat de Mar — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Malgrat de Mar, en el extremo norte del Maresme. Te conectamos con cuidadoras de la zona; eliges y acuerdas el cuidado directamente.",
    hero:
      "Malgrat de Mar marca el límite norte de la costa del Maresme, ya muy cerca de la desembocadura del Tordera. Es un municipio con vida propia más allá del turismo, y sus familias también buscan, llegado el momento, cómo cuidar de sus mayores en casa. Para eso está GesCuida.",
    sections: [
      {
        h2: "Acompañar a los mayores de Malgrat en su casa",
        body: [
          "Mantener a una persona mayor en su entorno, con sus rutinas y su gente, suele ser la mejor decisión para su bienestar. A menudo solo se necesita la ayuda adecuada: alguien de confianza que acuda al domicilio con regularidad.",
          "GesCuida conecta a las familias de Malgrat con cuidadoras que trabajan en la zona norte del Maresme. Tú eliges con quién seguir; el cuidado y su tarifa se acuerdan directamente con la cuidadora, sin que nosotros intervengamos.",
        ],
      },
      {
        h2: "Para cuidadoras de Malgrat de Mar y el entorno",
        body: [
          "Si cuidas a personas mayores en Malgrat o en los pueblos cercanos del Alt Maresme, el registro es gratis. Decides tu tarifa y tus turnos, y recibes solicitudes de familias de tu zona.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora cercana en Malgrat de Mar.",
    cuidadoras: "Cuidas en Malgrat de Mar: recibe solicitudes de familias del norte del Maresme.",
  },

  {
    slug: "tordera",
    name: "Tordera",
    geo: "interior",
    seoTitle: "Cuidadora de mayores en Tordera — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Tordera, en el extremo norte del Maresme junto al río. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Tordera se extiende tierra adentro en el extremo norte del Maresme, alrededor del río que le da nombre y que marca el límite de la comarca. Es un municipio amplio, con núcleos algo repartidos, donde encontrar una cuidadora de confianza para un mayor agradece una búsqueda bien organizada. GesCuida la facilita.",
    sections: [
      {
        h2: "Cuidado de mayores en un municipio extenso como Tordera",
        body: [
          "Cuando el término municipal es grande y las viviendas quedan más dispersas, conviene contar con una cuidadora que conozca la zona y pueda desplazarse con soltura. El objetivo no cambia: que la persona mayor permanezca en su casa, con su ritmo y sus costumbres.",
          "GesCuida te conecta con cuidadoras que trabajan en Tordera y en los municipios vecinos del norte de la comarca. No asignamos cuidadoras ni cobramos el cuidado: eliges tú y lo acuerdas directamente con ella.",
        ],
      },
      {
        h2: "Cercanía y continuidad",
        body: [
          "En un sitio extenso, una cuidadora cercana garantiza algo esencial: que pueda venir de forma regular y mantener una rutina estable con la persona mayor. Esa continuidad es la base de un buen cuidado.",
        ],
      },
      {
        h2: "¿Cuidas mayores en Tordera?",
        body: [
          "Si te dedicas al cuidado y cubres Tordera o su entorno, regístrate gratis. Defines una zona de trabajo amplia, pones tu tarifa y recibes solicitudes de familias cercanas.",
        ],
      },
    ],
    familias: "Encuentra una cuidadora que cubra tu zona en Tordera.",
    cuidadoras: "Cubre Tordera y los pueblos del norte y recibe más solicitudes.",
    faq: [
      {
        q: "Tordera es grande, ¿la cuidadora podrá venir a mi casa?",
        a: "En la página verás a las cuidadoras que tienen Tordera entre sus zonas de trabajo. Al definir su zona, cada cuidadora indica hasta dónde se desplaza; podrás hablar con ella para confirmar que llega a tu domicilio antes de decidir.",
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
