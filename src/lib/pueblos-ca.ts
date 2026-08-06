import type { PuebloSeo } from "@/lib/pueblos";

/**
 * VERSIÓN EN CATALÁN — /ca/cuidadors/[poble].
 *
 * POR QUÉ. En 28 días entraron 4.747 impresiones desde consultas en catalán
 * («cuidadors igualada», «cuidador per hores gent gran», «ajuda a domicili
 * manresa») y CERO clics, con la web entera en castellano. Son el 42% de toda
 * la demanda de gescuida.es, la proporción más alta de las once webs del grupo
 * con este mismo problema.
 *
 * ALCANCE. Los siete municipios que concentran el 97% de esa demanda. Las 19
 * páginas que la reciben suman 4.747 impresiones y estas siete solas, 4.596.
 * Traducir los 35 municipios por 151 impresiones más no sale a cuenta hasta
 * saber si el catalán convierte.
 *
 * REGLAS heredadas de pueblos.ts y que aquí se mantienen: texto ÚNICO por
 * municipio —ni estructura ni redacción clonadas—, solo datos reales y
 * verificables, y las dos audiencias cubiertas (famílies i cuidadores).
 * `name` NO se traduce: es la cadena exacta con la que se filtra en la base de
 * datos (CaregiverProfile.zones). Traducirla dejaría las páginas sin cuidadoras.
 */

/** Los siete municipios con demanda real en catalán, por impresiones. */
export const POBLES_CA_SLUGS = [
  "mataro",
  "igualada",
  "badalona",
  "vilanova-i-la-geltru",
  "manresa",
  "sabadell",
  "terrassa",
] as const;

export const POBLES_CA: PuebloSeo[] = [
  {
    slug: "mataro",
    name: "Mataró",
    geo: "costero",
    comarca: "Maresme",
    regionLabel: "Maresme · capital",
    seoTitle: "Cuidadora de gent gran a Mataró | Ajuda a domicili — GesCuida",
    seoDescription:
      "Busques cuidadora per a una persona gran a Mataró? Contacta directament amb cuidadores de la ciutat i el Maresme. Tries tu, sense agències pel mig.",
    hero:
      "Mataró és la capital del Maresme i la ciutat més gran de la comarca, amb un teixit de famílies que fa temps que combina la feina amb la cura d'un pare o una mare grans. GesCuida us posa en contacte directe amb cuidadores que treballen a Mataró: sense intermediaris i decidint vosaltres amb qui parleu.",
    sections: [
      {
        h2: "Ajuda a domicili per a gent gran a Mataró",
        body: [
          "Quan una persona gran comença a necessitar companyia, ajuda amb les tasques del dia o una atenció més constant, el més habitual és voler que es quedi a casa seva, al seu barri de tota la vida. A Mataró hi ha cuidadores per fer-ho possible; la part difícil sempre és trobar la persona adequada.",
          "Aquí podeu veure qui treballa a la ciutat, quina experiència té i quina tarifa demana, i parlar-hi directament abans de decidir res.",
        ],
      },
      {
        h2: "Per hores, interna o de cap de setmana",
        body: [
          "No totes les famílies necessiten el mateix. Hi ha qui necessita un parell de matins per a la dutxa i la compra, i qui necessita una persona a casa cada nit. Cada cuidadora indica què fa i quan pot, i vosaltres compareu.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Mataró?",
      body: [
        "Contacteu amb cuidadores que treballen a Mataró i al Maresme. Compareu, hi parleu i trieu vosaltres.",
        "La cura i el preu els acordeu directament amb la cuidadora; la quota només cobreix l'ús de la plataforma.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Mataró?",
      body: [
        "Registra't gratis, decideix la teva tarifa per hora i indica les teves zones. Rebràs sol·licituds de famílies de Mataró i dels pobles del Maresme.",
        "Ser a la capital de comarca ajuda: moltes famílies dels municipis del voltant busquen algú que ja es mogui per aquí.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Mataró.",
    cuidadoras: "Cuides gent gran a Mataró? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "igualada",
    name: "Igualada",
    geo: "interior",
    comarca: "Anoia",
    regionLabel: "Anoia · capital",
    seoTitle: "Cuidadora de gent gran a Igualada | Ajuda a domicili — GesCuida",
    seoDescription:
      "Cuidadores per a gent gran a Igualada i a l'Anoia. Contacte directe, sense agències: compares, parles amb elles i tries tu qui entra a casa.",
    hero:
      "Igualada és la capital de l'Anoia i fa de centre de serveis per a tota una comarca d'interior. Això vol dir que moltes famílies dels pobles del voltant hi busquen el que no troben a casa seva, i la cura d'una persona gran n'és un exemple clar.",
    sections: [
      {
        h2: "Cuidadores a Igualada i als pobles de l'Anoia",
        body: [
          "En una comarca amb els pobles escampats, trobar algú que es desplaci no sempre és fàcil. A GesCuida cada cuidadora indica les zones on treballa, de manera que es veu de seguida qui pot arribar fins a casa vostra.",
          "La conversa és directa amb ella: què necessiteu, quantes hores i quin dia es comença.",
        ],
      },
      {
        h2: "Sense agència pel mig",
        body: [
          "El preu per hora l'acordeu vosaltres amb la cuidadora. Nosaltres no ens quedem cap comissió del servei; la quota cobreix només l'ús de la plataforma.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família d'Igualada?",
      body: [
        "Contacteu amb cuidadores que treballen a Igualada i al seu entorn. Compareu, hi parleu i trieu vosaltres la persona adequada.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Igualada?",
      body: [
        "Registra't gratis, decideix la teva tarifa i indica les zones. Rebràs sol·licituds de famílies d'Igualada i dels pobles de l'Anoia.",
        "Cobrir la capital i el seu entorn ajuda a trobar feina a prop de casa.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Igualada.",
    cuidadoras: "Cuides gent gran a Igualada? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "badalona",
    name: "Badalona",
    geo: "costero",
    comarca: "Barcelonès",
    regionLabel: "Barcelonès · àrea metropolitana",
    seoTitle: "Cuidadora de gent gran a Badalona | Ajuda a domicili — GesCuida",
    seoDescription:
      "Cuidadores per a persones grans a Badalona. Contacte directe amb cuidadores de la ciutat, sense agències. Compares tarifes i tries tu.",
    hero:
      "Badalona és una de les ciutats més grans de Catalunya i part de l'àrea metropolitana, amb barris de tota la vida on molta gent gran continua vivint a casa seva. En una ciutat així no falten cuidadores: el que costa és triar entre moltes.",
    sections: [
      {
        h2: "Ajuda a domicili a Badalona",
        body: [
          "Aquí veieu qui treballa a Badalona, què fa i quina tarifa demana, i hi parleu abans de decidir. Sense que ningú us assigni una persona que no heu triat.",
        ],
      },
      {
        h2: "A prop de casa, dins de la ciutat",
        body: [
          "En una ciutat gran, la distància entre barris compta. Cada cuidadora indica per on es mou, i això estalvia desplaçaments llargs que acaben afectant l'horari del servei.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Badalona?",
      body: [
        "Contacteu directament amb cuidadores que treballen a la vostra zona de Badalona i acordeu-hi les condicions.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Badalona?",
      body: [
        "Registra't gratis i indica els barris o zones on et mous. Rebràs sol·licituds de famílies de la ciutat.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Badalona.",
    cuidadoras: "Cuides gent gran a Badalona? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "vilanova-i-la-geltru",
    name: "Vilanova i la Geltrú",
    geo: "costero",
    comarca: "Garraf",
    regionLabel: "Garraf · capital",
    seoTitle: "Cuidadora de gent gran a Vilanova i la Geltrú | GesCuida",
    seoDescription:
      "Cuidadores per a gent gran a Vilanova i la Geltrú i al Garraf. Contacte directe, tarifes clares i tu tries la persona.",
    hero:
      "Vilanova i la Geltrú és la capital del Garraf i una ciutat que funciona tot l'any, no només a l'estiu. Moltes famílies d'aquí i dels municipis del voltant busquen ajuda per tenir cura d'un familiar gran sense treure'l de casa.",
    sections: [
      {
        h2: "Cuidadores a Vilanova i al Garraf",
        body: [
          "Cada cuidadora indica les zones on treballa, així que es veu de seguida qui cobreix Vilanova i qui arriba fins als pobles del costat.",
          "Hi parleu directament: horaris, tasques i tarifa es tanquen entre vosaltres.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Vilanova?",
      body: [
        "Compareu cuidadores que treballen a Vilanova i la Geltrú i trieu vosaltres amb qui voleu parlar.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Vilanova?",
      body: [
        "Registra't gratis, posa la teva tarifa i indica si et mous pel Garraf. Rebràs sol·licituds de famílies de la zona.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Vilanova i la Geltrú.",
    cuidadoras: "Cuides gent gran a Vilanova? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "manresa",
    name: "Manresa",
    geo: "interior",
    comarca: "Bages",
    regionLabel: "Bages · capital",
    seoTitle: "Cuidadora de gent gran a Manresa | Ajuda a domicili — GesCuida",
    seoDescription:
      "Cuidadores per a persones grans a Manresa i al Bages. Contacte directe amb cuidadores de la zona, sense agències pel mig.",
    hero:
      "Manresa és la capital del Bages i el centre de serveis d'una comarca gran i d'interior. Per a moltes famílies dels pobles del voltant, tot el que necessiten passa per aquí, i la cura d'una persona gran també.",
    sections: [
      {
        h2: "Ajuda a domicili a Manresa i al Bages",
        body: [
          "En una comarca on els pobles queden lluny els uns dels altres, saber qui es desplaça i fins on és la meitat de la feina. Cada cuidadora ho indica al seu perfil.",
          "La resta —hores, tasques i preu— ho acordeu directament amb ella.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Manresa?",
      body: [
        "Contacteu amb cuidadores que treballen a Manresa i als pobles del Bages, i decidiu vosaltres.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Manresa?",
      body: [
        "Registra't gratis i indica les teves zones del Bages. Rebràs sol·licituds de famílies de la comarca.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Manresa.",
    cuidadoras: "Cuides gent gran a Manresa? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "sabadell",
    name: "Sabadell",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · co-capital",
    seoTitle: "Cuidadora de gent gran a Sabadell | Ajuda a domicili — GesCuida",
    seoDescription:
      "Cuidadores per a gent gran a Sabadell. Contacte directe, tarifes acordades amb la cuidadora i tu tries qui entra a casa.",
    hero:
      "Sabadell és una de les ciutats més grans de Catalunya i comparteix la capitalitat del Vallès Occidental amb Terrassa. És un mercat local ampli, amb molta demanda concentrada i cuidadores que es mouen per tota la comarca.",
    sections: [
      {
        h2: "Cuidadores a Sabadell",
        body: [
          "Aquí podeu veure qui treballa a la ciutat, amb quina experiència i a quin preu, i parlar-hi abans de decidir. Sense agència que us assigni ningú.",
        ],
      },
      {
        h2: "Dins del Vallès, sense grans desplaçaments",
        body: [
          "Moltes cuidadores del Vallès cobreixen Sabadell i Terrassa alhora. Filtrar per zona evita perdre temps amb perfils que queden lluny.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Sabadell?",
      body: [
        "Compareu cuidadores que treballen a Sabadell i acordeu-hi directament les condicions.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Sabadell?",
      body: [
        "Registra't gratis, posa la teva tarifa i indica si cobreixes també els municipis del voltant.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Sabadell.",
    cuidadoras: "Cuides gent gran a Sabadell? Registra't gratis i comença a rebre sol·licituds.",
  },
  {
    slug: "terrassa",
    name: "Terrassa",
    geo: "interior",
    comarca: "Vallès Occidental",
    regionLabel: "Vallès Occidental · co-capital",
    seoTitle: "Cuidadora de gent gran a Terrassa | Ajuda a domicili — GesCuida",
    seoDescription:
      "Cuidadores per a persones grans a Terrassa. Contacte directe amb cuidadores de la ciutat i del Vallès, sense intermediaris.",
    hero:
      "Terrassa és, amb Sabadell, la ciutat gran del Vallès Occidental. Té barris amb població gran arrelada i famílies que volen que el seu familiar continuï a casa tant de temps com es pugui.",
    sections: [
      {
        h2: "Ajuda a domicili a Terrassa",
        body: [
          "Veieu qui treballa a Terrassa, què ofereix i quina tarifa demana, i hi parleu directament. Vosaltres decidiu amb qui.",
        ],
      },
      {
        h2: "Per hores o amb més presència",
        body: [
          "Hi ha situacions que es resolen amb unes hores al matí i n'hi ha que necessiten algú cada dia. Cada perfil indica la disponibilitat real, sense promeses genèriques.",
        ],
      },
    ],
    paraFamilias: {
      titulo: "Sou una família de Terrassa?",
      body: [
        "Contacteu amb cuidadores que treballen a Terrassa i acordeu-hi vosaltres el servei i el preu.",
      ],
    },
    paraCuidadoras: {
      titulo: "Ets cuidadora a Terrassa?",
      body: [
        "Registra't gratis i indica les teves zones del Vallès. Rebràs sol·licituds de famílies de la ciutat i del voltant.",
      ],
    },
    familias: "Troba una cuidadora de confiança a Terrassa.",
    cuidadoras: "Cuides gent gran a Terrassa? Registra't gratis i comença a rebre sol·licituds.",
  },
];

export const getPobleCa = (slug: string) => POBLES_CA.find((p) => p.slug === slug);
