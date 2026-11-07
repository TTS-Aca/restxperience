const BY_CATEGORY: Record<string, string> = {
  Entradas: "/menu/guacamole.jpg",
  Ensaladas: "/menu/ensalada.jpg",
  Hamburguesas: "/menu/hamburguesa.jpg",
  "Cortes - Una guarnicion": "/menu/corte.jpg",
  "Cortes - Dos guarniciones": "/menu/tomahawk.jpg",
  "Cortes - Cuatro guarniciones": "/menu/tomahawk.jpg",
  "Carne Para Asar": "/menu/arrachera.jpg",
  Arrachera: "/menu/arrachera.jpg",
  "Otras Alternativas": "/menu/pollo.jpg",
  Complementos: "/menu/complementos.jpg",
  Rubs: "/menu/corte.jpg",
  Postres: "/menu/postre.jpg",
  "Menu Infantil": "/menu/infantil.jpg",
  "Bebidas - Cervezas": "/menu/cerveza.jpg",
  "Bebidas - Cervezas Importadas": "/menu/cerveza.jpg",
  "Bebidas - Refrescos": "/menu/refresco.jpg",
  "Bebidas - Calientes": "/menu/cafe.jpg",
};

const BY_NAME: [RegExp, string][] = [
  [/^crema/i, "/menu/crema.jpg"],
  [/queso/i, "/menu/queso.jpg"],
  [/tacos|discada/i, "/menu/tacos.jpg"],
  [/tuetano|cabrito/i, "/menu/corte.jpg"],
  [/salmon/i, "/menu/salmon.jpg"],
];

/** Foto de muestra para un platillo del menú de ejemplo. */
export function sampleImageFor(category: string, name: string): string | null {
  for (const [pattern, url] of BY_NAME) {
    if (pattern.test(name)) return url;
  }
  return BY_CATEGORY[category] ?? null;
}
