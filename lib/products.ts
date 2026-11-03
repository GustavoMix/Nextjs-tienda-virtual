export type Condition = "Nuevo" | "Como nuevo" | "Buen estado" | "Usado";
export const CONDITIONS: Condition[] = ["Nuevo", "Como nuevo", "Buen estado", "Usado"];

export type Product = {
  id: string; // también es el link: /producto/<id>  (sin espacios ni tildes)
  name: string;
  brand?: string;
  category?: string;
  price: number;
  oldPrice?: number; // precio anterior tachado (opcional, para ofertas)
  description: string;
  images: string[]; // 1 a 3 fotos: "/productos/mi-foto.jpg" (carpeta public/productos) o URL completa
  condition?: Condition; // estado del producto (segunda mano)
  measure?: string; // medida fija, ej. "2 plazas · 180×220 cm"
  stock?: number; // 1 = "Única unidad"
  sizes?: string[]; // opcional: tallas para elegir (productos nuevos con varias tallas)
  colors?: string[]; // opcional: colores para elegir
  available?: boolean; // false = "Vendido"
};

// 👇 Productos de DEMOSTRACIÓN (dibujos de ejemplo en public/productos). Reemplázalos por los tuyos.
const img = (n: string) => [1, 2, 3].map((i) => `/productos/manta-${n}-${i}.svg`);

const PRODUCTS: Product[] = [
  {
    id: "manta-galaxia",
    name: "Manta Galaxia",
    category: "Infantil",
    price: 120,
    oldPrice: 220,
    condition: "Como nuevo",
    measure: "1½ plazas · 150×200 cm",
    stock: 1,
    description: "Polar suave con estrellas y planetas. Usada pocas veces, sin manchas ni bolitas.",
    images: img("galaxia"),
  },
  {
    id: "manta-navidena",
    name: "Manta Navideña",
    category: "Navidad",
    price: 90,
    condition: "Buen estado",
    measure: "2 plazas · 180×220 cm",
    stock: 1,
    description: "Ideal para diciembre. Tela gruesa y abrigadora, lavada y lista para usar.",
    images: img("navidad"),
  },
  {
    id: "manta-gamer",
    name: "Manta Gamer",
    category: "Juvenil",
    price: 110,
    oldPrice: 180,
    condition: "Como nuevo",
    measure: "1½ plazas · 150×200 cm",
    stock: 1,
    description: "Con controles de videojuego. Perfecta para el cuarto o para jugar en el sofá.",
    images: img("gamer"),
  },
  {
    id: "manta-gatitos",
    name: "Manta Gatitos",
    category: "Infantil",
    price: 80,
    condition: "Buen estado",
    measure: "1 plaza · 130×160 cm",
    stock: 1,
    description: "Colores pastel con gatitos. Muy suave, ideal para niños.",
    images: img("gatitos"),
  },
  {
    id: "manta-futbolera",
    name: "Manta Futbolera",
    category: "Juvenil",
    price: 95,
    condition: "Usado",
    measure: "1½ plazas · 150×200 cm",
    stock: 1,
    description: "Para los amantes del fútbol. Tiene uso, pero sin roturas. Precio de oportunidad.",
    images: img("futbol"),
  },
  {
    id: "manta-escocesa",
    name: "Manta Escocesa",
    category: "Clásica",
    price: 150,
    condition: "Nuevo",
    measure: "2 plazas · 180×220 cm",
    stock: 1,
    description: "Cuadros rojo y negro, estilo cabaña. Nueva, nunca usada, con etiqueta.",
    images: img("escocesa"),
  },
];

// Toda la tienda lee los productos desde aquí.
// Cuando metas Supabase solo cambias el cuerpo de estas funciones (ver README).
export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.id === id);
}
