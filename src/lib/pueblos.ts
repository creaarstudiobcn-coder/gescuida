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
      "Barcelona es la ciudad más grande de Cataluña, y en una ciudad de este tamaño son muchas las familias que, en algún momento, necesitan ayuda para cuidar de un mayor en casa. No faltan opciones, pero precisamente por eso cuesta saber por dónde empezar y en quién confiar. GesCuida simplifica esa primera búsqueda: te pone en contacto directo con cuidadoras que trabajan en Barcelona, sin agencias de por medio.",
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
        "Al ser la ciudad más grande de Cataluña y estar muy bien comunicada por transporte público, Barcelona es un buen sitio para darte a conocer y encontrar trabajo cerca de casa.",
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
        "Al ser una de las ciudades más pobladas del área metropolitana y estar pegada a Barcelona y Sant Adrià, cubrir Badalona y su entorno te ayuda a encontrar trabajo cerca de casa.",
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
    slug: "santa-coloma-de-gramenet",
    name: "Santa Coloma de Gramenet",
    geo: "interior",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en Santa Coloma de Gramenet — GesCuida",
    seoDescription:
      "Encuentra cuidadora para una persona mayor en Santa Coloma de Gramenet. Conecta con cuidadoras independientes del área metropolitana; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Encajada entre el río Besòs y la sierra de Marina, justo al norte de Barcelona, Santa Coloma de Gramenet es una ciudad compacta y muy habitada del Barcelonès. En un núcleo tan concentrado casi todo queda a mano; encontrar una cuidadora de confianza para un mayor también debería serlo, y para eso está GesCuida.",
    sections: [
      {
        h2: "Cuidar de los mayores de Santa Coloma sin que dejen su entorno",
        body: [
          "Lo habitual es querer que un padre o una madre sigan en su piso de siempre, con sus vecinos y sus costumbres. A veces basta con compañía y una mano con las tareas; otras hace falta una atención más continuada. En una ciudad tan compacta, una cuidadora que viva cerca puede acudir con facilidad y mantener una rutina estable.",
          "GesCuida se limita a conectar: te muestra cuidadoras que trabajan en Santa Coloma, hablas con ellas por el chat y decides tú. El cuidado y su precio se acuerdan directamente con la cuidadora.",
        ],
      },
      {
        h2: "Pegada a Barcelona, con cuidadoras de la zona",
        body: [
          "Por su situación, lindando con Barcelona y Badalona, muchas cuidadoras de Santa Coloma cubren también los municipios vecinos. Eso amplía tus opciones a la hora de encontrar a alguien que encaje con los horarios y las necesidades de tu familiar.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Santa Coloma de Gramenet?",
      body: [
        "Compara cuidadoras que trabajan en la ciudad, habla con ellas y elige tú a la persona adecuada. Nadie te impone un nombre ni un horario.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma para encontrarla.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Santa Coloma de Gramenet?",
      body: [
        "Regístrate gratis, pon tu propia tarifa por hora e indica las zonas que cubres. Recibirás solicitudes de familias de la ciudad y aceptarás solo los turnos que te encajen.",
        "Al estar pegada a Barcelona y Badalona, definir una zona amplia te ayuda a recibir más solicitudes cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de Santa Coloma de Gramenet.",
    cuidadoras: "¿Cuidas mayores en Santa Coloma? Regístrate gratis y recibe solicitudes de familias.",
    faq: [
      {
        q: "¿GesCuida es una agencia?",
        a: "No. Somos una plataforma de conexión con cuidadoras independientes. No las empleamos ni prestamos el cuidado; ese acuerdo es directamente entre la familia y la cuidadora.",
      },
    ],
  },

  {
    slug: "sant-adria-de-besos",
    name: "Sant Adrià de Besòs",
    geo: "costero",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en Sant Adrià de Besòs — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Sant Adrià de Besòs. Te conectamos con cuidadoras del área metropolitana; eliges, contactas y acuerdas el cuidado directamente.",
    hero:
      "Allí donde el río Besòs llega al mar, entre Barcelona y Badalona, Sant Adrià de Besòs es un municipio pequeño en superficie pero plenamente metropolitano. Sus familias, como las de cualquier ciudad, buscan llegado el momento cómo cuidar de un mayor en casa; GesCuida les acerca a cuidadoras de la zona para conseguirlo.",
    sections: [
      {
        h2: "Ayuda a domicilio en Sant Adrià de Besòs",
        body: [
          "Que una persona mayor pueda quedarse en su hogar, cerca de los suyos, suele ser lo que más tranquilidad da a toda la familia. Con la ayuda adecuada —unas horas de compañía o una atención más completa— es posible mantener esa rutina sin grandes cambios.",
          "Nuestro papel es ponerte en contacto con cuidadoras que trabajan en Sant Adrià y su entorno. Ni asignamos a nadie ni cobramos el cuidado: eliges tú y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Un municipio bien conectado",
        body: [
          "Por su tamaño contenido y su posición entre dos grandes ciudades, en Sant Adrià es habitual que las cuidadoras cubran también Barcelona o Badalona. Para tu familia, eso significa más posibilidades de encontrar a alguien que pueda venir con regularidad.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Sant Adrià de Besòs?",
      body: [
        "Conecta con cuidadoras que trabajan en Sant Adrià y los municipios de al lado. Comparas perfiles, hablas con ellas y eliges con quién seguir.",
        "El cuidado y su tarifa los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Sant Adrià de Besòs?",
      body: [
        "El registro es gratuito: fijas tu tarifa, eliges tus turnos e indicas tus zonas. Recibirás solicitudes de familias de Sant Adrià y alrededores.",
        "Cubrir también Barcelona o Badalona, tan cerca, te ayuda a encontrar trabajo estable sin alejarte de casa.",
      ],
    },
    familias: "Encuentra una cuidadora cercana en Sant Adrià de Besòs.",
    cuidadoras: "¿Cuidas mayores en Sant Adrià? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "l-hospitalet-de-llobregat",
    name: "L'Hospitalet de Llobregat",
    geo: "interior",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en L'Hospitalet de Llobregat — GesCuida",
    seoDescription:
      "¿Buscas cuidadora para un mayor en L'Hospitalet de Llobregat? Conecta con cuidadoras independientes de la ciudad y del área metropolitana; tú eliges y acuerdas el cuidado.",
    hero:
      "L'Hospitalet de Llobregat es la segunda ciudad más poblada de Cataluña, pegada a Barcelona y con una densidad de población muy alta. En una ciudad tan grande y compacta, el reto de las familias no es la falta de cuidadoras, sino dar con la persona adecuada; GesCuida facilita esa búsqueda sin agencias de por medio.",
    sections: [
      {
        h2: "Cuidado de mayores a domicilio en L'Hospitalet",
        body: [
          "Compañía durante unas horas, ayuda con la casa y las comidas, acompañamiento a las visitas médicas o una atención más constante: las necesidades cambian de una familia a otra, pero la idea es siempre la misma, que la persona mayor siga en su hogar.",
          "GesCuida te muestra cuidadoras que trabajan en L'Hospitalet; comparas, hablas con ellas y decides. El acuerdo del cuidado —tareas, horarios y tarifa— se cierra directamente con la cuidadora.",
        ],
      },
      {
        h2: "Una ciudad de barrios, cuidadoras cerca",
        body: [
          "L'Hospitalet se vive muy por barrios, y en el cuidado de un mayor la cercanía cuenta: cada cuidadora indica las zonas que cubre para que encuentres a alguien que pueda acudir con regularidad.",
        ],
      },
      {
        h2: "La cuota y el cuidado, por separado",
        body: [
          "Cada cuidadora pone su propia tarifa por hora y la acuerdas con ella. GesCuida no añade ningún recargo al cuidado: la cuota mensual es solo por usar la plataforma para encontrar y contactar cuidadoras.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en L'Hospitalet de Llobregat?",
      body: [
        "Encuentra una cuidadora que trabaje en tu zona de la ciudad. Ves varios perfiles, hablas con ellas por el chat y eliges tú con quién seguir.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en L'Hospitalet de Llobregat?",
      body: [
        "Regístrate gratis, pon tu tarifa por hora e indica las zonas de la ciudad que cubres. Aceptas solo los turnos que te encajan.",
        "Al ser una ciudad grande y muy bien comunicada, es un buen punto para darte a conocer y encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de L'Hospitalet.",
    cuidadoras: "¿Cuidas mayores en L'Hospitalet? Regístrate gratis y recibe solicitudes de familias.",
    faq: [
      {
        q: "¿Hay cuidadoras en todos los barrios de L'Hospitalet?",
        a: "Cada cuidadora indica las zonas que cubre. En la página verás las que tienen L'Hospitalet entre sus áreas de trabajo; si aún no hay ninguna en tu zona, te lo decimos con sinceridad y te avisamos en cuanto la haya.",
      },
    ],
  },

  {
    slug: "cornella-de-llobregat",
    name: "Cornellà de Llobregat",
    geo: "interior",
    comarca: "Baix Llobregat",
    regionLabel: "Baix Llobregat · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en Cornellà de Llobregat — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Cornellà de Llobregat. Te conectamos con cuidadoras del área metropolitana; eliges, contactas y acuerdas el cuidado directamente.",
    hero:
      "Cornellà de Llobregat es una de las ciudades de referencia del Baix Llobregat, muy bien comunicada y a las puertas de Barcelona. Esa buena conexión, que tanto facilita el día a día, también ayuda cuando una familia necesita encontrar a alguien que cuide de un mayor en casa. GesCuida hace de puente con cuidadoras de la zona.",
    sections: [
      {
        h2: "Acompañar a los mayores de Cornellà en su casa",
        body: [
          "Mantener a una persona mayor en su entorno, con su ritmo y su gente, suele ser la mejor decisión para su bienestar. Muchas veces solo hace falta la ayuda justa: alguien de confianza que acuda al domicilio de forma regular.",
          "GesCuida te conecta con cuidadoras que trabajan en Cornellà y los municipios vecinos. No empleamos a nadie ni cobramos el cuidado: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Bien comunicada, más opciones",
        body: [
          "Cornellà es un punto bien conectado del Baix Llobregat, así que muchas cuidadoras se desplazan con facilidad entre los municipios cercanos. Para tu familia, eso se traduce en más posibilidades de encontrar a alguien disponible para tu horario.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Cornellà de Llobregat?",
      body: [
        "Conecta con cuidadoras que trabajan en Cornellà y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Cornellà de Llobregat?",
      body: [
        "Regístrate gratis, decide tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Cornellà y de los municipios vecinos.",
        "Estar en un punto tan bien comunicado del Baix Llobregat facilita cubrir una zona amplia y encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Cornellà de Llobregat.",
    cuidadoras: "¿Cuidas mayores en Cornellà? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "sant-boi-de-llobregat",
    name: "Sant Boi de Llobregat",
    geo: "interior",
    comarca: "Baix Llobregat",
    regionLabel: "Baix Llobregat · àrea metropolitana",
    seoTitle: "Cuidadora de mayores en Sant Boi de Llobregat — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Sant Boi de Llobregat, junto al río Llobregat. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "A orillas del río Llobregat y junto a los espacios agrarios de su delta, Sant Boi de Llobregat conserva un carácter de ciudad con vida propia dentro del área metropolitana. Para las familias que cuidan aquí de un mayor, GesCuida es la forma de encontrar cuidadoras de la zona sin recurrir a una agencia.",
    sections: [
      {
        h2: "Cuidado a domicilio en Sant Boi",
        body: [
          "Cada situación pide una cosa distinta: a veces compañía y supervisión unas horas, a veces una ayuda continuada con la higiene, las comidas o la medicación. Lo que no cambia es la tranquilidad de contar con una cuidadora cercana que pueda mantener una rutina estable.",
          "GesCuida te muestra cuidadoras que trabajan en Sant Boi y alrededores; tú comparas, hablas con ellas y eliges. El cuidado y su tarifa se acuerdan directamente con la cuidadora.",
        ],
      },
      {
        h2: "Ciudad con identidad, dentro del área metropolitana",
        body: [
          "Sant Boi combina su propia vida de ciudad con una buena conexión al resto del Baix Llobregat y a Barcelona. Por eso muchas cuidadoras cubren también municipios vecinos, lo que amplía las opciones de tu familia.",
        ],
      },
      {
        h2: "Sin sobreprecios sobre el cuidado",
        body: [
          "La tarifa por hora la pone cada cuidadora y la acuerdas con ella. GesCuida no añade recargos: tu cuota es solo por usar la plataforma para encontrar y contactar cuidadoras de Sant Boi.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Sant Boi de Llobregat?",
      body: [
        "Encuentra una cuidadora que trabaje en Sant Boi y su entorno. Comparas perfiles, hablas con ellas y eliges tú.",
        "El cuidado lo acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Sant Boi de Llobregat?",
      body: [
        "Regístrate gratis, pon tu tarifa e indica tus zonas. Recibirás solicitudes de familias de Sant Boi y de los municipios cercanos.",
        "Cubrir también el resto del Baix Llobregat te ayuda a recibir más solicitudes cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Sant Boi de Llobregat.",
    cuidadoras: "¿Cuidas mayores en Sant Boi? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "el-prat-de-llobregat",
    name: "El Prat de Llobregat",
    geo: "costero",
    comarca: "Baix Llobregat",
    regionLabel: "Baix Llobregat · delta",
    seoTitle: "Cuidadora de mayores en El Prat de Llobregat — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en El Prat de Llobregat, en el delta del Llobregat. Te conectamos con cuidadoras de la zona; eliges y acuerdas el cuidado directamente.",
    hero:
      "El Prat de Llobregat se extiende por el delta del río Llobregat, entre espacios naturales protegidos y el aeropuerto que lleva su nombre. Es una ciudad llana, abierta y bien comunicada del área metropolitana, donde muchas familias quieren que sus mayores envejezcan en casa. GesCuida les ayuda a encontrar cuidadoras de la zona.",
    sections: [
      {
        h2: "Que tu mayor siga en casa, en El Prat",
        body: [
          "A veces lo que se necesita es compañía y una mano con el día a día; otras, una atención más constante. En cualquier caso, una cuidadora cercana permite mantener las rutinas de la persona mayor sin sacarla de su entorno.",
          "Nosotros solo hacemos la conexión: te enseñamos cuidadoras que trabajan en El Prat, hablas con ellas y eliges. El acuerdo del cuidado y su precio es directamente con la cuidadora.",
        ],
      },
      {
        h2: "Una ciudad llana y bien comunicada",
        body: [
          "El terreno llano del delta y la buena conexión de El Prat facilitan que una cuidadora se desplace por la ciudad y los municipios vecinos. Esa movilidad ayuda a encontrar a alguien que pueda venir con regularidad.",
        ],
      },
      {
        h2: "La cuota y el cuidado, separados",
        body: [
          "Cada cuidadora fija su tarifa por hora y la acuerdas con ella. GesCuida no cobra el cuidado: tu cuota mensual es solo por usar la plataforma para contactar cuidadoras.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en El Prat de Llobregat?",
      body: [
        "Conecta con cuidadoras que trabajan en El Prat y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su tarifa los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en El Prat de Llobregat?",
      body: [
        "Regístrate gratis, pon tu tarifa e indica tus zonas. Recibirás solicitudes de familias de El Prat y de los municipios cercanos.",
        "Al estar tan bien comunicada, cubrir El Prat y su entorno te facilita encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en El Prat de Llobregat.",
    cuidadoras: "¿Cuidas mayores en El Prat? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "sabadell",
    name: "Sabadell",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · capital",
    seoTitle: "Cuidadora de mayores en Sabadell | Ayuda a domicilio — GesCuida",
    seoDescription:
      "¿Buscas cuidadora para un mayor en Sabadell? Conecta con cuidadoras independientes de la capital del Vallès Occidental; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Sabadell, junto al río Ripoll, es una de las grandes ciudades del interior de la provincia y co-capital del Vallès Occidental. Con un pasado industrial muy marcado y una larga tradición de ciudad trabajadora, hoy son muchas sus familias que buscan ayuda para cuidar de un mayor en casa. GesCuida las conecta con cuidadoras de la zona.",
    sections: [
      {
        h2: "Ayuda a domicilio para personas mayores en Sabadell",
        body: [
          "Cuando un familiar empieza a necesitar compañía o una atención más constante, lo natural es querer que siga en su propia casa, en su barrio de siempre. El primer paso suele ser el mismo: encontrar una cuidadora de confianza.",
          "GesCuida reúne a cuidadoras que trabajan en Sabadell y te da las herramientas para contactar con ellas, ver cómo trabajan y acordar los detalles. No te asignamos a nadie: eres tú quien elige.",
        ],
      },
      {
        h2: "Una ciudad grande, mejor con cuidadoras de la zona",
        body: [
          "Sabadell es una ciudad extensa y se vive por barrios. Una cuidadora que se mueva por tu zona llega antes y puede mantener una rutina estable; por eso cada una indica las áreas que cubre.",
        ],
      },
      {
        h2: "Transparencia en el precio",
        body: [
          "Cada cuidadora pone su tarifa por hora y la acuerdas con ella. GesCuida no añade sobreprecio al cuidado: la cuota es solo por usar la plataforma para encontrar y contactar cuidadoras.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Sabadell?",
      body: [
        "Encuentra una cuidadora que trabaje en tu zona de la ciudad. Comparas varios perfiles, hablas con ellas por el chat y eliges tú con quién seguir.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Sabadell?",
      body: [
        "Regístrate gratis, pon tu propia tarifa por hora e indica las zonas de Sabadell que cubres. Aceptas solo los turnos que te encajan.",
        "Al ser una de las ciudades más grandes del interior y co-capital de comarca, es un buen punto para darte a conocer y encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de Sabadell.",
    cuidadoras: "¿Cuidas mayores en Sabadell? Regístrate gratis y recibe solicitudes de familias.",
    faq: [
      {
        q: "¿GesCuida es una agencia de cuidadoras?",
        a: "No. Somos una plataforma de conexión con cuidadoras independientes de Sabadell y la comarca. No las empleamos ni prestamos el servicio; el acuerdo del cuidado es entre la familia y la cuidadora.",
      },
    ],
  },

  {
    slug: "terrassa",
    name: "Terrassa",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · capital",
    seoTitle: "Cuidadora de mayores en Terrassa | Ayuda a domicilio — GesCuida",
    seoDescription:
      "Encuentra cuidadora para una persona mayor en Terrassa, co-capital del Vallès Occidental. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Terrassa, a los pies del macizo de Sant Llorenç del Munt, es una de las mayores ciudades del interior de la provincia y co-capital del Vallès Occidental, conocida por su patrimonio industrial y modernista. En una ciudad de su tamaño, encontrar una cuidadora de confianza para un mayor es más sencillo si amplías la búsqueda; eso hace GesCuida.",
    sections: [
      {
        h2: "Cuidado de mayores a domicilio en Terrassa",
        body: [
          "Que un padre o una madre puedan quedarse en su casa, con sus cosas y su rutina, suele dar tranquilidad a toda la familia. Para lograrlo muchas veces basta con la ayuda adecuada: compañía unas horas o un acompañamiento más completo cuando hace falta.",
          "GesCuida conecta a las familias de Terrassa con cuidadoras que trabajan en la ciudad. Ni asignamos cuidadoras ni cobramos el cuidado: eliges tú y lo acuerdas directamente con ella.",
        ],
      },
      {
        h2: "Cuidadoras cerca de tu barrio",
        body: [
          "Terrassa es amplia y se organiza por barrios. La cercanía importa en el cuidado de un mayor: por eso cada cuidadora indica las zonas que cubre, para que encuentres a alguien que pueda acudir con regularidad.",
        ],
      },
      {
        h2: "La cuota y el cuidado van por separado",
        body: [
          "La tarifa por hora la fija cada cuidadora y la acuerdas con ella. GesCuida no añade ningún recargo: tu cuota mensual es solo por usar la plataforma.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Terrassa?",
      body: [
        "Conecta con cuidadoras que trabajan en tu zona de la ciudad. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Terrassa?",
      body: [
        "Regístrate gratis, decide tu tarifa por hora e indica las zonas de Terrassa que cubres. Eliges los turnos que aceptas.",
        "Al ser una gran ciudad y co-capital de comarca, es un buen sitio para darte a conocer y encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de Terrassa.",
    cuidadoras: "¿Cuidas mayores en Terrassa? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "granollers",
    name: "Granollers",
    geo: "interior",
    comarca: "Vallès Oriental",
    regionLabel: "Vallès Oriental · capital",
    seoTitle: "Cuidadora de mayores en Granollers — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Granollers, capital del Vallès Oriental. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente, sin agencias.",
    hero:
      "Granollers es la capital del Vallès Oriental y un histórico centro comercial de la comarca, con un mercado semanal de siglos de tradición. Como cabecera de una zona amplia, atrae a gente de los pueblos del entorno; esa misma centralidad ayuda a las familias a encontrar cuidadoras de confianza para sus mayores, y GesCuida lo facilita.",
    sections: [
      {
        h2: "Acompañar a los mayores de Granollers en su casa",
        body: [
          "Mantener a una persona mayor en su hogar, con su ritmo y su gente, suele ser lo mejor para ella. A menudo solo hace falta una mano de confianza: compañía, ayuda con la casa o una atención más continuada.",
          "GesCuida te conecta con cuidadoras que trabajan en Granollers y en los municipios del Vallès Oriental. No intervenimos en el cuidado ni lo cobramos: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Capital de comarca, cuidadoras del entorno",
        body: [
          "Por ser cabecera del Vallès Oriental, en Granollers es habitual que las cuidadoras cubran también los pueblos cercanos. Para tu familia, eso amplía las posibilidades de encontrar a alguien disponible para vuestro horario.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Granollers?",
      body: [
        "Encuentra una cuidadora que trabaje en Granollers y su entorno. Comparas perfiles, hablas con ellas y eliges tú.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Granollers?",
      body: [
        "Regístrate gratis, pon tu tarifa e indica tus zonas. Recibirás solicitudes de familias de Granollers y de los pueblos del Vallès Oriental.",
        "Al ser la capital de la comarca, cubrir la ciudad y su entorno te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Granollers.",
    cuidadoras: "¿Cuidas mayores en Granollers? Regístrate gratis y empieza a recibir solicitudes.",
    faq: [
      {
        q: "¿Y si la cuidadora viene de un pueblo cercano?",
        a: "Es habitual: al ser Granollers capital de comarca, muchas cuidadoras cubren la ciudad y los municipios del entorno. En la página verás quién tiene Granollers entre sus zonas de trabajo.",
      },
    ],
  },

  {
    slug: "cerdanyola-del-valles",
    name: "Cerdanyola del Vallès",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · interior",
    seoTitle: "Cuidadora de mayores en Cerdanyola del Vallès — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Cerdanyola del Vallès, junto a Collserola y la UAB. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Cerdanyola del Vallès se sitúa entre la sierra de Collserola y la llanura del Vallès, y es conocida por acoger el campus de la Universitat Autònoma de Barcelona. Más allá de la vida universitaria, es una ciudad donde residen y envejecen muchas familias; GesCuida las ayuda a encontrar cuidadoras de confianza en la zona.",
    sections: [
      {
        h2: "Cuidado a domicilio en Cerdanyola del Vallès",
        body: [
          "A veces basta con compañía y supervisión unas horas; otras hace falta una ayuda más constante con la higiene, las comidas o la medicación. Contar con una cuidadora cercana permite mantener una rutina estable sin sacar a la persona mayor de su entorno.",
          "GesCuida se limita a conectar: te muestra cuidadoras que trabajan en Cerdanyola y alrededores, y eres tú quien elige y acuerda con ellas el cuidado y su precio.",
        ],
      },
      {
        h2: "Bien conectada con el Vallès y Barcelona",
        body: [
          "Por su posición y sus buenas conexiones, muchas cuidadoras de Cerdanyola cubren también municipios vecinos como Sabadell o Barcelona. Esa movilidad amplía las opciones de tu familia para encontrar a alguien disponible.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Cerdanyola del Vallès?",
      body: [
        "Conecta con cuidadoras que trabajan en Cerdanyola y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su tarifa los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Cerdanyola del Vallès?",
      body: [
        "Regístrate gratis, pon tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Cerdanyola y alrededores.",
        "Estar bien conectada con el resto del Vallès y con Barcelona facilita cubrir una zona amplia y encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Cerdanyola del Vallès.",
    cuidadoras: "¿Cuidas mayores en Cerdanyola? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "mollet-del-valles",
    name: "Mollet del Vallès",
    geo: "interior",
    comarca: "Vallès Oriental",
    regionLabel: "Vallès Oriental · interior",
    seoTitle: "Cuidadora de mayores en Mollet del Vallès — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Mollet del Vallès. Te conectamos con cuidadoras de la zona; eliges, contactas y acuerdas el cuidado directamente, sin intermediarios.",
    hero:
      "Mollet del Vallès es un importante nudo de comunicaciones del Vallès Oriental, donde se cruzan varias vías que conectan la comarca con Barcelona y el resto del Vallès. Esa accesibilidad facilita la vida diaria y también la búsqueda de una cuidadora para un mayor; GesCuida pone en contacto a las familias con cuidadoras de la zona.",
    sections: [
      {
        h2: "Ayuda a domicilio para mayores en Mollet",
        body: [
          "Compañía unas horas, ayuda con las tareas del día o una atención más continuada: las necesidades varían, pero la idea es siempre que la persona mayor siga en su casa. Una cuidadora cercana lo hace posible.",
          "GesCuida te muestra cuidadoras que trabajan en Mollet y los municipios vecinos. No empleamos a nadie ni cobramos el cuidado: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Un cruce de caminos, a tu favor",
        body: [
          "La buena conexión de Mollet hace que muchas cuidadoras se desplacen con facilidad por la comarca. Para tu familia, eso significa más posibilidades de encontrar a alguien que pueda venir con regularidad.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Mollet del Vallès?",
      body: [
        "Encuentra una cuidadora que trabaje en Mollet y su entorno. Comparas perfiles, hablas con ellas y eliges tú.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Mollet del Vallès?",
      body: [
        "Regístrate gratis, pon tu tarifa e indica tus zonas. Recibirás solicitudes de familias de Mollet y de los municipios cercanos.",
        "Al ser un punto tan bien comunicado, cubrir Mollet y su entorno te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Mollet del Vallès.",
    cuidadoras: "¿Cuidas mayores en Mollet? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "rubi",
    name: "Rubí",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · interior",
    seoTitle: "Cuidadora de mayores en Rubí — GesCuida",
    seoDescription:
      "Cuidadoras de mayores en Rubí, en el Vallès Occidental. Conecta con cuidadoras independientes de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Rubí es una de las ciudades de mayor tamaño del Vallès Occidental, con un tejido residencial e industrial que ha crecido mucho con los años. En una ciudad así de extensa, dar con una cuidadora de confianza para un mayor es más fácil si la búsqueda va más allá del propio barrio, y eso es justo lo que ofrece GesCuida.",
    sections: [
      {
        h2: "Que tu mayor siga en casa, en Rubí",
        body: [
          "Lo importante suele ser que la persona mayor permanezca en su hogar, con sus rutinas y su gente. Según el caso, hará falta compañía y supervisión unas horas o una atención más continuada; en ambos, una cuidadora cercana marca la diferencia.",
          "Nosotros solo hacemos de puente: te mostramos cuidadoras que trabajan en Rubí y alrededores, hablas con ellas y eliges. El cuidado y su tarifa se acuerdan directamente con la cuidadora.",
        ],
      },
      {
        h2: "Una ciudad extensa, cuidadoras de la zona",
        body: [
          "Como Rubí es grande y se reparte por distintas zonas, conviene que la cuidadora conozca el entorno y pueda desplazarse con soltura. Cada una indica las áreas que cubre para que encuentres a alguien que llegue a tu domicilio con regularidad.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Rubí?",
      body: [
        "Conecta con cuidadoras que trabajan en Rubí y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Rubí?",
      body: [
        "Regístrate gratis, decide tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Rubí y de los municipios cercanos.",
        "Definir una zona amplia dentro del Vallès Occidental te ayuda a recibir más solicitudes cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en tu zona de Rubí.",
    cuidadoras: "¿Cuidas mayores en Rubí? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "manresa",
    name: "Manresa",
    geo: "interior",
    comarca: "Bages",
    regionLabel: "Bages · capital",
    seoTitle: "Cuidadora de mayores en Manresa — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Manresa, capital del Bages. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente, sin agencias.",
    hero:
      "Manresa, a orillas del Cardener y presidida por la basílica de la Seu, es la capital del Bages y un punto de referencia en el centro de Cataluña. Como cabecera de comarca, reúne a gente de toda la zona; esa centralidad ayuda a las familias a encontrar cuidadoras de confianza para sus mayores, y GesCuida lo hace posible.",
    sections: [
      {
        h2: "Ayuda a domicilio para mayores en Manresa",
        body: [
          "Cuando un familiar necesita compañía, una mano con el día a día o una atención más constante, lo natural es querer que siga en su casa de siempre. El primer reto suele ser encontrar a la persona de confianza adecuada.",
          "GesCuida reúne a cuidadoras que trabajan en Manresa y te da las herramientas para contactar con ellas y acordar los detalles. No te asignamos a nadie: eres tú quien elige.",
        ],
      },
      {
        h2: "Capital del Bages, cuidadoras del entorno",
        body: [
          "Por ser cabecera de comarca, en Manresa es habitual que las cuidadoras cubran también los pueblos del Bages cercanos. Para tu familia, eso amplía las posibilidades de dar con alguien disponible para vuestro horario.",
        ],
      },
      {
        h2: "La cuota y el cuidado, por separado",
        body: [
          "Cada cuidadora pone su tarifa por hora y la acuerdas con ella. GesCuida no añade recargo al cuidado: la cuota es solo por usar la plataforma para encontrar y contactar cuidadoras.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Manresa?",
      body: [
        "Encuentra una cuidadora que trabaje en Manresa y su entorno. Comparas perfiles, hablas con ellas por el chat y eliges tú con quién seguir.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Manresa?",
      body: [
        "Regístrate gratis, pon tu propia tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Manresa y de los pueblos del Bages.",
        "Al ser capital de comarca, cubrir la ciudad y su entorno te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Manresa.",
    cuidadoras: "¿Cuidas mayores en Manresa? Regístrate gratis y empieza a recibir solicitudes.",
    faq: [
      {
        q: "¿Hay cuidadoras de los pueblos del Bages?",
        a: "Al ser Manresa capital de comarca, muchas cuidadoras cubren la ciudad y los municipios cercanos del Bages. En la página verás quién tiene Manresa entre sus zonas de trabajo; si todavía no hay nadie, te lo decimos sin inventar nada.",
      },
    ],
  },

  {
    slug: "vilanova-i-la-geltru",
    name: "Vilanova i la Geltrú",
    geo: "costero",
    comarca: "Garraf",
    regionLabel: "Garraf · capital",
    seoTitle: "Cuidadora de mayores en Vilanova i la Geltrú — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Vilanova i la Geltrú, capital del Garraf. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente.",
    hero:
      "Vilanova i la Geltrú, con su puerto pesquero y su animada vida marinera, es la capital del Garraf y una de las principales ciudades de la costa al sur de Barcelona. Más allá del mar y del Carnaval que la hace famosa, es un municipio donde la gente vive y envejece todo el año; GesCuida ayuda a sus familias a encontrar cuidadoras de confianza.",
    sections: [
      {
        h2: "Cuidar de los mayores de Vilanova en su casa",
        body: [
          "Que una persona mayor pueda quedarse en su hogar, cerca del puerto y de la gente de siempre, suele ser lo mejor para ella. A menudo basta con la ayuda adecuada: compañía, una mano con la casa o una atención más continuada.",
          "GesCuida te muestra cuidadoras que trabajan en Vilanova i la Geltrú y su entorno. Tú eliges con quién seguir; el cuidado y su tarifa se acuerdan directamente con la cuidadora, sin que nosotros intervengamos.",
        ],
      },
      {
        h2: "Capital del Garraf, cuidado todo el año",
        body: [
          "Como cabecera de comarca, Vilanova mantiene su actividad al margen de la temporada turística. El cuidado de un mayor es una necesidad estable, y así lo tratamos: conectamos a familias y cuidadoras durante todo el año.",
        ],
      },
      {
        h2: "Cercanía y continuidad",
        body: [
          "Una cuidadora del propio Vilanova o de los alrededores llega antes, conoce la ciudad y puede mantener una rutina estable. Esa constancia es clave cuando se cuida a una persona mayor día tras día.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Vilanova i la Geltrú?",
      body: [
        "Conecta con cuidadoras que trabajan en Vilanova y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Vilanova i la Geltrú?",
      body: [
        "Regístrate gratis, pon tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Vilanova durante todo el año, no solo en temporada.",
        "Al ser capital del Garraf, cubrir la ciudad y los pueblos cercanos te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Vilanova i la Geltrú.",
    cuidadoras: "¿Cuidas mayores en Vilanova? Regístrate gratis y empieza a recibir solicitudes.",
    faq: [
      {
        q: "¿Solo hay cuidadoras en temporada?",
        a: "No. GesCuida conecta a familias y cuidadoras durante todo el año, al margen de la temporada turística. El cuidado de un mayor es una necesidad estable.",
      },
    ],
  },

  {
    slug: "vic",
    name: "Vic",
    geo: "interior",
    comarca: "Osona",
    regionLabel: "Osona · capital",
    seoTitle: "Cuidadora de mayores en Vic — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Vic, capital de Osona. Conecta con cuidadoras de la zona; tú eliges, contactas y acuerdas el cuidado directamente, sin agencias.",
    hero:
      "En el corazón de la plana de Osona, Vic es la capital de la comarca y un centro histórico de mercado, con una gran plaza Mayor que cada semana se llena de paradas. Como cabecera de una zona muy ligada al campo y a los pueblos del entorno, Vic reúne a gente de toda la plana; GesCuida ayuda a sus familias a encontrar cuidadoras de confianza para sus mayores.",
    sections: [
      {
        h2: "Ayuda a domicilio para mayores en Vic",
        body: [
          "Mantener a un familiar en su casa, con su ritmo y sus costumbres, suele ser lo que más tranquilidad da. A veces hace falta compañía y supervisión unas horas; otras, una atención más continuada con el día a día.",
          "GesCuida te conecta con cuidadoras que trabajan en Vic y en los pueblos de la plana de Osona. No asignamos cuidadoras ni cobramos el cuidado: eliges tú y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Capital de comarca, cuidadoras de la plana",
        body: [
          "Por ser cabecera de Osona, en Vic es habitual que las cuidadoras cubran también los municipios cercanos de la plana. Para tu familia, eso amplía las posibilidades de encontrar a alguien que pueda venir con regularidad.",
        ],
      },
      {
        h2: "La cuota y el cuidado, separados",
        body: [
          "La tarifa por hora la pone cada cuidadora y la acuerdas con ella. GesCuida no añade recargo: tu cuota es solo por usar la plataforma para encontrar y contactar cuidadoras.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Vic?",
      body: [
        "Encuentra una cuidadora que trabaje en Vic y su entorno. Comparas perfiles, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado lo acuerdas directamente con la cuidadora; tu cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Vic?",
      body: [
        "Regístrate gratis, pon tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Vic y de los pueblos de la plana de Osona.",
        "Al ser capital de comarca, cubrir la ciudad y su entorno te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Vic.",
    cuidadoras: "¿Cuidas mayores en Vic? Regístrate gratis y empieza a recibir solicitudes.",
  },

  {
    slug: "igualada",
    name: "Igualada",
    geo: "interior",
    comarca: "Anoia",
    regionLabel: "Anoia · capital",
    seoTitle: "Cuidadora de mayores en Igualada — GesCuida",
    seoDescription:
      "Cuidadoras de personas mayores en Igualada, capital de la Anoia. Conecta con cuidadoras de la zona; tú eliges y acuerdas el cuidado directamente, sin intermediarios.",
    hero:
      "Junto al río Anoia y con una larga tradición ligada al cuero, Igualada es la capital de la comarca de la Anoia, en el interior de la provincia. Como cabecera de una zona amplia, atrae a habitantes de muchos pueblos del entorno; esa centralidad ayuda a las familias a encontrar cuidadoras de confianza para sus mayores, y GesCuida lo facilita.",
    sections: [
      {
        h2: "Cuidado de mayores a domicilio en Igualada",
        body: [
          "Lo habitual es querer que un padre o una madre sigan en su casa, con su gente y sus rutinas. Según el caso, hará falta compañía unas horas o una atención más continuada; en ambos, contar con una cuidadora cercana es una gran ayuda.",
          "GesCuida te muestra cuidadoras que trabajan en Igualada y en los pueblos de la Anoia. Ni asignamos cuidadoras ni cobramos el cuidado: tú eliges y lo acuerdas directamente con la cuidadora.",
        ],
      },
      {
        h2: "Capital de la Anoia, cuidadoras del entorno",
        body: [
          "Por ser cabecera de comarca, en Igualada es frecuente que las cuidadoras cubran también los municipios cercanos. Eso amplía las opciones de tu familia para dar con alguien disponible para vuestro horario.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "¿Buscas cuidadora para un mayor en Igualada?",
      body: [
        "Conecta con cuidadoras que trabajan en Igualada y su entorno. Comparas, hablas con ellas y eliges tú a la persona adecuada.",
        "El cuidado y su precio los acuerdas directamente con la cuidadora; la cuota solo cubre el uso de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "¿Eres cuidadora en Igualada?",
      body: [
        "Regístrate gratis, decide tu tarifa por hora e indica tus zonas. Recibirás solicitudes de familias de Igualada y de los pueblos de la Anoia.",
        "Al ser capital de comarca, cubrir la ciudad y su entorno te ayuda a encontrar trabajo cerca de casa.",
      ],
    },
    familias: "Encuentra una cuidadora de confianza en Igualada.",
    cuidadoras: "¿Cuidas mayores en Igualada? Regístrate gratis y empieza a recibir solicitudes.",
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
