export type ChatMessage = { role: "user" | "assistant"; content: string };

type ProductHint = {
  name: string;
  price: number;
  category: string;
  description: string;
};

export function buildBotReply(
  input: string,
  dishOfDay: ProductHint | null,
  menuSample: ProductHint[],
  restaurantName: string
): string {
  const text = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/hola|buenas|hey|que tal|qué tal/.test(text)) {
    return `¡Hola! Qué gusto recibirte en ${restaurantName}. Estoy aquí para ayudarte a elegir algo rico. ${
      dishOfDay
        ? `Hoy te recomiendo especialmente nuestro platillo del día: ${dishOfDay.name} ($${dishOfDay.price}). `
        : ""
    }¿Se te antoja algo ligero, un buen corte, o prefieres empezar con una entrada?`;
  }

  if (/dia|día|recomend|suger|especial|platillo/.test(text) && dishOfDay) {
    return `Con mucho gusto. La comida del día es ${dishOfDay.name}${
      dishOfDay.description ? `: ${dishOfDay.description}` : ""
    }. Va en $${dishOfDay.price}. Si quieres, también puedo sugerirte un complemento o una bebida para acompañarlo.`;
  }

  if (/corte|carne|res|steak|rib|arrachera|asada/.test(text)) {
    const cuts = menuSample.filter((p) =>
      /corte|arrachera|carne|rib|porter|cowboy|tomahawk|sirloin|new york/i.test(
        `${p.category} ${p.name}`
      )
    );
    const picks = (cuts.length ? cuts : menuSample).slice(0, 3);
    return `Para un momento especial, te sugiero: ${picks
      .map((p) => `${p.name} ($${p.price})`)
      .join(", ")}. Si me dices si prefieres jugoso y marmoleado o más magro, afino la recomendación.`;
  }

  if (/hamburg|burger/.test(text)) {
    const items = menuSample
      .filter((p) => /hamburg/i.test(p.category + p.name))
      .slice(0, 3);
    return items.length
      ? `Nuestras hamburguesas están deliciosas. Te gustarán: ${items
          .map((p) => `${p.name} ($${p.price})`)
          .join(", ")}. ¿Bacon, clásica o la de la casa?`
      : `Tenemos hamburguesas bien servidas. Revisa la sección de Hamburguesas en el menú.`;
  }

  if (/entrada|antoj|compart/.test(text)) {
    const items = menuSample
      .filter((p) => /entrada/i.test(p.category))
      .slice(0, 3);
    return items.length
      ? `Para abrir el apetito: ${items
          .map((p) => p.name)
          .join(", ")}. El guacamole y el queso fundido nunca fallan para compartir.`
      : `Te recomiendo empezar con una entrada para compartir.`;
  }

  if (/postre|dulce|chocolate|pastel/.test(text)) {
    const items = menuSample
      .filter((p) => /postre/i.test(p.category))
      .slice(0, 3);
    return items.length
      ? `Para cerrar con broche de oro: ${items
          .map((p) => `${p.name} ($${p.price})`)
          .join(", ")}. El volcán de chocolate es un clásico.`
      : `Nuestros postres valen la pena; revisa la sección Postres.`;
  }

  if (/cerveza|bebida|refresco|tomar|sed/.test(text)) {
    return `Para beber tenemos cervezas nacionales e importadas, refrescos, limonadas y cafés. Si vas por un corte, una cerveza fría o un Topo Chico caen perfecto. ¿Qué se te antoja?`;
  }

  if (/ligero|ensalada|salud|light/.test(text)) {
    const items = menuSample
      .filter((p) => /ensalada/i.test(p.category))
      .slice(0, 3);
    return items.length
      ? `Si buscas algo más ligero: ${items
          .map((p) => p.name)
          .join(", ")}. También puedes pedir pechuga a las finas hierbas.`
      : `Las ensaladas y la pechuga a las finas hierbas son excelentes opciones ligeras.`;
  }

  if (/nino|niño|infantil|kids|hijo/.test(text)) {
    return `Para los pequeños tenemos menú infantil: nuggets, mini fajitas, hamburguesa con queso y malteadas. Dime qué les gusta y te ayudo.`;
  }

  if (/gracias|perfecto|listo/.test(text)) {
    return `Con mucho gusto. Cuando quieras, agrega al carrito desde el menú y el equipo te atienderá en tu mesa. ¡Buen provecho!`;
  }

  return `Claro, estoy para ayudarte. Puedes pedirme la comida del día, cortes, entradas, hamburguesas, postres o algo ligero. ${
    dishOfDay ? `Si no sabes por dónde empezar, hoy brilla el ${dishOfDay.name}.` : ""
  }`;
}
