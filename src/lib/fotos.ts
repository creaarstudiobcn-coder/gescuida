// Catálogo de fotografías de la web, cada una con su texto alternativo.
//
// CRITERIO (importante, no tocar sin pensarlo):
// Estas fotos son ILUSTRATIVAS. GesCuida es una plataforma de conexión, NO una
// agencia: no emplea a las cuidadoras. Por eso ninguna de estas imágenes se usa
// nunca para representar a una cuidadora concreta dada de alta — las fichas de
// cuidadora salen siempre de `CaregiverProfile.photoUrl`, que sube ella misma.
// Aquí solo acompañan al texto.
//
// Los `alt` describen lo que SE VE en la foto, no lo que nos gustaría vender.
// Se han escrito mirando cada imagen, no leyendo el nombre del archivo.

import sofa from "../../public/fotos/cuidadora-abraza-a-senora-mayor-en-el-sofa.jpg";
import salon from "../../public/fotos/senora-mayor-riendo-en-el-salon-de-su-casa.jpg";
import andador from "../../public/fotos/cuidadora-ayuda-a-caminar-con-andador.jpg";
import calle from "../../public/fotos/senora-mayor-paseando-por-la-calle.jpg";
import parque from "../../public/fotos/senora-mayor-en-el-parque-con-su-cuidadora.jpg";
import hombro from "../../public/fotos/mano-de-la-cuidadora-en-el-hombro-de-una-senora-mayor.jpg";
import huerto from "../../public/fotos/personas-mayores-regando-un-huerto-con-su-cuidadora.jpg";

import type { StaticImageData } from "next/image";

export interface Foto {
  src: StaticImageData;
  /** Texto alternativo en castellano. Describe la escena, sin nombres propios. */
  alt: string;
  /** El mismo texto en catalán, para las páginas de /ca. */
  altCa: string;
}

export const FOTO_PORTADA: Foto = {
  src: sofa,
  alt: "Cuidadora abrazando a una señora mayor sentada en el sofá de su casa",
  altCa: "Cuidadora abraçant una senyora gran asseguda al sofà de casa seva",
};

export const FOTO_CONFIANZA: Foto = {
  src: hombro,
  alt: "Señora mayor en el sofá con las manos de su cuidadora apoyadas en el hombro",
  altCa: "Senyora gran al sofà amb les mans de la seva cuidadora recolzades a l'espatlla",
};

// Rotación para las páginas de municipio: cada pueblo recibe siempre la misma
// foto (elegida por su slug), pero pueblos distintos enseñan fotos distintas.
// Así ninguna página parece un calco de la de al lado.
export const FOTOS_MUNICIPIO: Foto[] = [
  {
    src: salon,
    alt: "Señora mayor con gafas riendo en el salón de su casa",
    altCa: "Senyora gran amb ulleres rient a la sala d'estar de casa seva",
  },
  {
    src: andador,
    alt: "Cuidadora ayudando a una señora mayor a sujetarse a un andador en su habitación",
    altCa: "Cuidadora ajudant una senyora gran a agafar-se a un caminador a la seva habitació",
  },
  {
    src: parque,
    alt: "Señora mayor sonriente al aire libre, con su cuidadora detrás",
    altCa: "Senyora gran somrient a l'aire lliure, amb la seva cuidadora al darrere",
  },
  {
    src: calle,
    alt: "Señora mayor con pañuelo azul sonriendo durante un paseo por la calle",
    altCa: "Senyora gran amb mocador blau somrient durant un passeig pel carrer",
  },
  {
    src: huerto,
    alt: "Dos personas mayores regando un huerto urbano acompañadas por su cuidadora",
    altCa: "Dues persones grans regant un hort urbà acompanyades per la seva cuidadora",
  },
  {
    src: hombro,
    alt: "Señora mayor en el sofá con las manos de su cuidadora apoyadas en el hombro",
    altCa: "Senyora gran al sofà amb les mans de la seva cuidadora recolzades a l'espatlla",
  },
];

// Reparto estable: la misma página recibe siempre la misma foto entre despliegues.
// (Nada de aleatorio: ver el porqué en las notas sobre marcadores aleatorios.)
export function fotoParaMunicipio(slug: string): Foto {
  let suma = 0;
  for (let i = 0; i < slug.length; i++) suma += slug.charCodeAt(i);
  return FOTOS_MUNICIPIO[suma % FOTOS_MUNICIPIO.length];
}
