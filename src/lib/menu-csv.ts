export type MenuCsvRow = {
  category: string;
  name: string;
  price: number;
  description: string;
  ingredients: string;
  calories: number | null;
};

const HEADER_ALIASES: Record<string, keyof MenuCsvRow | "skip"> = {
  categoria: "category",
  category: "category",
  nombre: "name",
  name: "name",
  producto: "name",
  platillo: "name",
  precio: "price",
  price: "price",
  descripcion: "description",
  description: "description",
  ingredientes: "ingredients",
  ingredients: "ingredients",
  calorias: "calories",
  calories: "calories",
};

export const MENU_CSV_TEMPLATE = `categoria,nombre,precio,descripcion,ingredientes,calorias
Entradas,Guacamole Natural,229,Aguacate fresco con limón y cilantro,Aguacate; cebolla; cilantro; limón,280
Cortes,Ribeye 400g,589,Corte a la parrilla,Ribeye; sal de mar,
Postres,Flan de la casa,119,Flan casero,,320
`;

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[$\s]/g, "").replace(",", ".");
  return Number(cleaned);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function parseMenuCsv(text: string): {
  rows: MenuCsvRow[];
  errors: string[];
} {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return { rows: [], errors: ["El CSV debe tener encabezado y al menos una fila."] };
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const mapped = headers.map((h) => HEADER_ALIASES[h] || null);

  if (!mapped.includes("category") || !mapped.includes("name") || !mapped.includes("price")) {
    return {
      rows: [],
      errors: [
        "Faltan columnas. Usa: categoria,nombre,precio,descripcion,ingredientes,calorias",
      ],
    };
  }

  const rows: MenuCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const raw: Record<string, string> = {};
    mapped.forEach((key, index) => {
      if (key && key !== "skip") raw[key] = cells[index] || "";
    });

    const category = String(raw.category || "").trim();
    const name = String(raw.name || "").trim();
    const price = parsePrice(String(raw.price || ""));

    if (!category || !name || Number.isNaN(price) || price < 0) {
      errors.push(`Fila ${i + 1}: categoría, nombre y precio válidos son obligatorios.`);
      continue;
    }

    const caloriesRaw = String(raw.calories || "").trim();
    rows.push({
      category,
      name,
      price,
      description: String(raw.description || "").trim(),
      ingredients: String(raw.ingredients || "").trim(),
      calories:
        caloriesRaw === "" || Number.isNaN(Number(caloriesRaw))
          ? null
          : Number(caloriesRaw),
    });
  }

  return { rows, errors };
}
