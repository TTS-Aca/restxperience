export type MenuSeedItem = {
  category: string;
  name: string;
  price: number;
  description?: string;
  ingredients?: string;
  calories?: number;
};

export const MENU_SEED: MenuSeedItem[] = [
  // Bebidas - Cervezas
  { category: "Bebidas - Cervezas", name: "Tecate", price: 79, description: "Cerveza clara refrescante, ideal para acompañar cortes.", calories: 140 },
  { category: "Bebidas - Cervezas", name: "Tecate Light", price: 79, description: "Versión ligera con el mismo carácter.", calories: 95 },
  { category: "Bebidas - Cervezas", name: "Indio", price: 79, description: "Cerveza ámbar con cuerpo suave.", calories: 145 },
  { category: "Bebidas - Cervezas", name: "XX Lager", price: 89, description: "Lager clásica de sabor limpio.", calories: 150 },
  { category: "Bebidas - Cervezas", name: "XX Lager Ambar", price: 89, description: "Toque tostado y malteado.", calories: 155 },
  { category: "Bebidas - Cervezas", name: "Amstel Ultra", price: 95, description: "Ligera y baja en carbohidratos.", calories: 85 },
  { category: "Bebidas - Cervezas", name: "Bohemia Oscura", price: 95, description: "Oscura con notas a caramelo.", calories: 160 },
  { category: "Bebidas - Cervezas", name: "Bohemia Clara", price: 95, description: "Clara premium de perfil elegante.", calories: 150 },
  { category: "Bebidas - Cervezas", name: "Bohemia Cristal", price: 95, description: "Cristalina y suave al paladar.", calories: 145 },
  { category: "Bebidas - Cervezas", name: "Miller", price: 99, description: "Lager americana suave.", calories: 140 },
  { category: "Bebidas - Cervezas", name: "Heineken", price: 99, description: "Ícono internacional, fresca y balanceada.", calories: 142 },
  { category: "Bebidas - Cervezas", name: "Heineken Silver", price: 99, description: "Más ligera, con final limpio.", calories: 120 },
  { category: "Bebidas - Cervezas", name: "Strongbow Honey", price: 99, description: "Sidra con miel, dulce y fresca.", calories: 180 },
  { category: "Bebidas - Cervezas", name: "Strongbow Gold Apple", price: 99, description: "Sidra de manzana dorada.", calories: 175 },
  { category: "Bebidas - Cervezas", name: "Strongbow Red Berries", price: 99, description: "Sidra con frutos rojos.", calories: 178 },
  { category: "Bebidas - Cervezas", name: "Strongbow Rose", price: 99, description: "Sidra rosada, aromática.", calories: 176 },
  { category: "Bebidas - Cervezas", name: "Vaso Michelado", price: 39, description: "Preparación clásica para tu cerveza.", calories: 20 },
  { category: "Bebidas - Cervezas", name: "Vaso Cubano", price: 49, description: "Estilo cubano con un toque especial.", calories: 25 },
  { category: "Bebidas - Cervezas", name: "Clamato", price: 55, description: "Base clásica para micheladas.", calories: 45 },
  { category: "Bebidas - Cervezas", name: "Vaso Michelato", price: 59, description: "Michelado con clamato.", calories: 50 },

  // Bebidas - Cervezas Importadas
  { category: "Bebidas - Cervezas Importadas", name: "Nolfas Engelman IPA (500ml)", price: 69, description: "IPA importada de perfil aromático.", calories: 210 },

  // Bebidas - Refrescos
  { category: "Bebidas - Refrescos", name: "Coca cola", price: 69, calories: 140 },
  { category: "Bebidas - Refrescos", name: "Coca cola light", price: 69, calories: 1 },
  { category: "Bebidas - Refrescos", name: "Coca cola sin azucar", price: 69, calories: 0 },
  { category: "Bebidas - Refrescos", name: "Yoli", price: 69, calories: 130 },
  { category: "Bebidas - Refrescos", name: "Fanta", price: 69, calories: 145 },
  { category: "Bebidas - Refrescos", name: "Delaware punch", price: 69, calories: 140 },
  { category: "Bebidas - Refrescos", name: "Sprite", price: 69, calories: 140 },
  { category: "Bebidas - Refrescos", name: "Sidral", price: 69, calories: 135 },
  { category: "Bebidas - Refrescos", name: "Fuze tea", price: 69, calories: 90 },
  { category: "Bebidas - Refrescos", name: "Botella de agua", price: 49, calories: 0 },
  { category: "Bebidas - Refrescos", name: "Topo chico", price: 79, calories: 0 },
  { category: "Bebidas - Refrescos", name: "Perrier", price: 99, calories: 0 },
  { category: "Bebidas - Refrescos", name: "Limonada (400ml)", price: 99, description: "Natural, fresca y equilibrada.", calories: 90 },
  { category: "Bebidas - Refrescos", name: "Naranjada (400ml)", price: 99, description: "Jugo de naranja recién preparado.", calories: 110 },
  { category: "Bebidas - Refrescos", name: "Jarra de limonada (1.7L)", price: 239, description: "Para compartir en la mesa.", calories: 380 },
  { category: "Bebidas - Refrescos", name: "Jarra de naranjada (1.7L)", price: 239, description: "Para compartir en la mesa.", calories: 460 },

  // Bebidas - Calientes
  { category: "Bebidas - Calientes", name: "Te (250ml)", price: 59, calories: 2 },
  { category: "Bebidas - Calientes", name: "Cafe americano (220ml)", price: 75, calories: 5 },
  { category: "Bebidas - Calientes", name: "Cafe descafeinado (220ml)", price: 75, calories: 5 },
  { category: "Bebidas - Calientes", name: "Cafe capuccino (250ml)", price: 89, calories: 120 },
  { category: "Bebidas - Calientes", name: "Cafe expresso (250ml)", price: 89, calories: 15 },

  // Otras Alternativas
  { category: "Otras Alternativas", name: "Pechuga a las Finas Hierbas (250 gr)", price: 329, description: "Pechuga jugosa con hierbas aromáticas.", ingredients: "Pechuga de pollo, finas hierbas, mantequilla", calories: 420 },
  { category: "Otras Alternativas", name: "Fajitas de Pollo Empanizadas", price: 379, description: "Crujientes por fuera, jugosas por dentro.", ingredients: "Pollo, pan rallado, especias", calories: 580 },
  { category: "Otras Alternativas", name: "Discada Nortena (250 gr)", price: 379, description: "Clásico norteño a la discada.", ingredients: "Carne mixta, chorizo, verduras", calories: 520 },
  { category: "Otras Alternativas", name: "Tacos de Flecha Nortena", price: 379, description: "Tacos con el sabor de la flecha norteña.", ingredients: "Carne asada, tortillas, cebolla, cilantro", calories: 610 },
  { category: "Otras Alternativas", name: "Salmon Punto 55", price: 529, description: "Salmón a la firma de la casa.", ingredients: "Salmón, mantequilla, limón, hierbas", calories: 490 },
  { category: "Otras Alternativas", name: "Cabrito Rinonada", price: 709, description: "Corte selecto de cabrito.", ingredients: "Cabrito riñonada, sal de mar, fuego vivo", calories: 650 },
  { category: "Otras Alternativas", name: "Cabrito Espaldilla", price: 749, description: "Espaldilla tierna a la parrilla.", ingredients: "Cabrito espaldilla", calories: 680 },
  { category: "Otras Alternativas", name: "Cabrito Pierna", price: 789, description: "Pierna de cabrito con cocción perfecta.", ingredients: "Cabrito pierna", calories: 700 },

  // Complementos
  { category: "Complementos", name: "Chiles Toreados", price: 99, calories: 40 },
  { category: "Complementos", name: "Porcion de Ensalada Mixta", price: 99, calories: 80 },
  { category: "Complementos", name: "Verduras a la Parrilla", price: 99, calories: 90 },
  { category: "Complementos", name: "Papas a la Francesa", price: 99, calories: 320 },
  { category: "Complementos", name: "Pure de Papas", price: 99, calories: 250 },
  { category: "Complementos", name: "Esparragos", price: 119, calories: 60 },
  { category: "Complementos", name: "Pan de ajo gratinado", price: 129, calories: 280 },
  { category: "Complementos", name: "Papa al Horno", price: 149, calories: 290 },
  { category: "Complementos", name: "Jalapeno Poppers", price: 149, calories: 340 },
  { category: "Complementos", name: "Jugo de Carne 1/2 Litro", price: 159, calories: 80 },
  { category: "Complementos", name: "Jugo de Carne 1 Litro", price: 299, calories: 160 },

  // Postres
  { category: "Postres", name: "Brownie con Helado", price: 159, description: "Brownie caliente con helado cremoso.", calories: 520 },
  { category: "Postres", name: "Pastel de Zanahoria", price: 189, description: "Esponjoso con frosting de queso crema.", calories: 450 },
  { category: "Postres", name: "Crumble de Manzana", price: 199, description: "Manzana horneada con crumble dorado.", calories: 410 },
  { category: "Postres", name: "Tarta de Limon", price: 199, description: "Ácida y dulce en equilibrio.", calories: 380 },
  { category: "Postres", name: "Volcan de Chocolate", price: 199, description: "Centro líquido de chocolate intenso.", calories: 480 },
  { category: "Postres", name: "Tiramisu Punto 55", price: 229, description: "Clásico italiano a nuestra manera.", calories: 430 },
  { category: "Postres", name: "Tarta de Chocolate Blanco y Frambuesa", price: 229, description: "Contraste cremoso y fresco.", calories: 460 },

  // Cortes - Una guarnicion
  { category: "Cortes - Una guarnicion", name: "Prime Rib (350 gr)", price: 549, description: "Costilla premium, jugosa y marmoleada. Incluye una guarnición.", ingredients: "Prime rib, sal de mar", calories: 720 },
  { category: "Cortes - Una guarnicion", name: "T-Bone (350 gr)", price: 549, description: "Lo mejor de dos mundos en un solo corte. Incluye una guarnición.", ingredients: "T-Bone", calories: 750 },
  { category: "Cortes - Una guarnicion", name: "Top Sirloin (400 gr)", price: 589, description: "Sabor intenso y textura firme. Incluye una guarnición.", ingredients: "Top sirloin", calories: 680 },
  { category: "Cortes - Una guarnicion", name: "New York (350 gr)", price: 589, description: "Clásico strip steak. Incluye una guarnición.", ingredients: "New York strip", calories: 700 },
  { category: "Cortes - Una guarnicion", name: "Ladrillo de Filete (400 gr)", price: 609, description: "Filete en presentación ladrillo. Incluye una guarnición.", ingredients: "Filete", calories: 650 },
  { category: "Cortes - Una guarnicion", name: "Picana (300 gr)", price: 609, description: "Corte brasileño con excelente grasa. Incluye una guarnición.", ingredients: "Picanha", calories: 690 },
  { category: "Cortes - Una guarnicion", name: "Tablita / Cabreria (300 gr)", price: 609, description: "Corte de asador tradicional. Incluye una guarnición.", ingredients: "Cabrería", calories: 710 },
  { category: "Cortes - Una guarnicion", name: "Aguja Nortena (350 gr)", price: 629, description: "Sabor norteño auténtico. Incluye una guarnición.", ingredients: "Aguja norteña", calories: 730 },
  { category: "Cortes - Una guarnicion", name: "Rib Eye (350 gr)", price: 699, description: "El favorito por marmoleo y jugosidad. Incluye una guarnición.", ingredients: "Rib eye", calories: 780 },

  // Carne Para Asar
  { category: "Carne Para Asar", name: "Individual (250 gr)", price: 469, description: "Porción individual de carne para asar.", calories: 550 },
  { category: "Carne Para Asar", name: "Duo (500 gr)", price: 839, description: "Para dos personas.", calories: 1100 },
  { category: "Carne Para Asar", name: "Familiar (1Kg)", price: 1649, description: "Para compartir en familia.", calories: 2200 },

  // Arrachera
  { category: "Arrachera", name: "Individual (250 gr)", price: 549, description: "Arrachera marinada al estilo de la casa.", calories: 580 },
  { category: "Arrachera", name: "Duo (500 gr)", price: 999, description: "Para dos personas.", calories: 1160 },
  { category: "Arrachera", name: "Familiar (1Kg)", price: 1899, description: "Para compartir en familia.", calories: 2320 },

  // Cortes - Dos guarniciones
  { category: "Cortes - Dos guarniciones", name: "Porterhouse (500 gr)", price: 1219, description: "Imponente porterhouse. Incluye dos guarniciones.", calories: 980 },
  { category: "Cortes - Dos guarniciones", name: "Cowboy (500 gr)", price: 1219, description: "Rib eye con hueso al estilo cowboy. Incluye dos guarniciones.", calories: 1050 },

  // Cortes - Cuatro guarniciones
  { category: "Cortes - Cuatro guarniciones", name: "Cowboy (900 gr)", price: 2399, description: "Edición generosa para la mesa. Incluye cuatro guarniciones.", calories: 1800 },
  { category: "Cortes - Cuatro guarniciones", name: "Porterhouse (1kg)", price: 2399, description: "Porterhouse de un kilo. Incluye cuatro guarniciones.", calories: 1900 },
  { category: "Cortes - Cuatro guarniciones", name: "Tomahawk (1.5 kg aprox)", price: 3099, description: "El show de la parrilla. Incluye cuatro guarniciones.", calories: 2800 },

  // Rubs
  { category: "Rubs", name: "Potencia tu corte (Chipinque/Cafe/Rojo/Doble black/Grill master/De la costa)", price: 49, description: "Elige tu rub favorito para potenciar el corte.", calories: 15 },

  // Hamburguesas
  { category: "Hamburguesas", name: "Hamburguesa Clasica", price: 309, description: "Carne, queso, vegetales frescos.", ingredients: "Carne de res, pan brioche, queso, lechuga, tomate", calories: 720 },
  { category: "Hamburguesas", name: "Hamburguesa San Juan", price: 329, description: "Especialidad San Juan.", ingredients: "Carne de res, queso, aderezo de la casa", calories: 780 },
  { category: "Hamburguesas", name: "Hamburguesa Punto 55", price: 339, description: "La firma de la casa en pan.", ingredients: "Carne de res, queso, tocino, salsa especial", calories: 820 },
  { category: "Hamburguesas", name: "Hamburguesa Bacon", price: 339, description: "Con abundante tocino crujiente.", ingredients: "Carne, bacon, queso", calories: 860 },
  { category: "Hamburguesas", name: "Hamburguesa Andy's", price: 339, description: "Receta especial Andy's.", calories: 800 },
  { category: "Hamburguesas", name: "Hamburguesa Hawaiana", price: 339, description: "Toque dulce con piña.", ingredients: "Carne, piña, queso", calories: 790 },
  { category: "Hamburguesas", name: "Hamburguesa Regia", price: 389, description: "La más cargada, estilo regio.", calories: 920 },

  // Entradas
  { category: "Entradas", name: "Crema de la Casa", price: 149, description: "Crema del día, reconfortante.", calories: 280 },
  { category: "Entradas", name: "Guacamole Natural", price: 229, description: "Aguacate fresco preparado al momento.", ingredients: "Aguacate, tomate, cebolla, cilantro, limón", calories: 320 },
  { category: "Entradas", name: "Guacamole con Chicharron San Juan", price: 289, description: "Guacamole con chicharrón crocante.", calories: 480 },
  { category: "Entradas", name: "Queso Fundido Natural", price: 169, description: "Queso derretido para compartir.", calories: 420 },
  { category: "Entradas", name: "Queso Fundido con Chistorra", price: 229, description: "Con chistorra aromática.", calories: 520 },
  { category: "Entradas", name: "Queso Fundido con Champinones", price: 229, description: "Con champiñones salteados.", calories: 480 },
  { category: "Entradas", name: "Queso Fundido con Chorizo Argentino", price: 229, description: "Con chorizo argentino.", calories: 540 },
  { category: "Entradas", name: "Queso Fundido con Chicharron San Juan", price: 269, description: "Con chicharrón San Juan.", calories: 560 },
  { category: "Entradas", name: "Queso Provolone", price: 269, description: "Provolone a la plancha.", calories: 500 },
  { category: "Entradas", name: "Tacos de Chicharron San Juan", price: 249, description: "Tacos crujientes de chicharrón.", calories: 620 },
  { category: "Entradas", name: "Tacos de Discada", price: 249, description: "Tacos de discada norteña.", calories: 580 },
  { category: "Entradas", name: "Tacos de Arrachera", price: 349, description: "Arrachera en tortilla caliente.", calories: 640 },
  { category: "Entradas", name: "Tacos de Rib Eye", price: 379, description: "Rib eye en taco, puro lujo.", calories: 680 },
  { category: "Entradas", name: "Orden de Tuetanos", price: 369, description: "Tuétanos asados con acompañamientos.", calories: 720 },

  // Ensaladas
  { category: "Ensaladas", name: "Ensalada Mixta", price: 159, description: "Verduras frescas de temporada.", calories: 180 },
  { category: "Ensaladas", name: "Ensalada Mixta con Carne para Asar", price: 249, calories: 380 },
  { category: "Ensaladas", name: "Ensalada Mixta con Pechuga de Pollo", price: 249, calories: 340 },
  { category: "Ensaladas", name: "Ensalada Mixta con Arrachera San Juan", price: 329, calories: 420 },
  { category: "Ensaladas", name: "Ensalada Punto 55", price: 309, description: "La ensalada firma de la casa.", calories: 360 },
  { category: "Ensaladas", name: "Ensalada Bacon-Cheese", price: 309, calories: 450 },
  { category: "Ensaladas", name: "Ensalada Cesar", price: 309, calories: 380 },
  { category: "Ensaladas", name: "Ensalada Cesar con Pechuga de Pollo", price: 379, calories: 480 },

  // Menu Infantil
  { category: "Menu Infantil", name: "Malteada (Fresa/Vainilla/Oreo)", price: 119, description: "Elige tu sabor favorito.", calories: 350 },
  { category: "Menu Infantil", name: "Nuggets de Pollo", price: 139, calories: 420 },
  { category: "Menu Infantil", name: "Hamburguesa Con Queso", price: 149, calories: 480 },
  { category: "Menu Infantil", name: "Mini fajitas de pollo", price: 189, calories: 390 },
];

export const CATEGORY_ORDER = [
  "Entradas",
  "Ensaladas",
  "Hamburguesas",
  "Cortes - Una guarnicion",
  "Cortes - Dos guarniciones",
  "Cortes - Cuatro guarniciones",
  "Carne Para Asar",
  "Arrachera",
  "Otras Alternativas",
  "Complementos",
  "Rubs",
  "Postres",
  "Menu Infantil",
  "Bebidas - Cervezas",
  "Bebidas - Cervezas Importadas",
  "Bebidas - Refrescos",
  "Bebidas - Calientes",
];
