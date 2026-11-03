export type Product = {
  id: string; // también es el link: /producto/<id>  (sin espacios ni tildes)
  name: string;
  brand?: string;
  category?: string;
  price: number;
  oldPrice?: number; // precio anterior tachado (opcional, para ofertas)
  description: string;
  images: string[]; // 1 a 3+ fotos: "/productos/mi-foto.jpg" (carpeta public/productos) o URL completa
  sizes?: string[]; // tallas o medidas para elegir
  colors?: string[]; // colores para elegir
  available?: boolean; // false = "Agotado"
};

// 👇 Productos de DEMOSTRACIÓN con fotos de Unsplash. Reemplázalos por los tuyos.
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop&q=75&auto=format`;

const PRODUCTS: Product[] = [
  {
    id: "zapatillas-deportivas",
    name: "Zapatillas deportivas",
    brand: "Nike",
    category: "Calzado",
    price: 350,
    oldPrice: 420,
    description: "Cómodas y livianas, ideales para el día a día o para entrenar. Suela con buena amortiguación.",
    images: [u("1542291026-7eec264c27ff"), u("1460353581641-37baddab0fa2"), u("1606107557195-0e29a4b5b4aa")],
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Rojo", "Negro", "Blanco"],
  },
  {
    id: "reloj-clasico",
    name: "Reloj clásico",
    brand: "Casio",
    category: "Accesorios",
    price: 280,
    description: "Diseño elegante con correa de cuero. Perfecto para uso diario o para regalo.",
    images: [u("1523275335684-37898b6baf30"), u("1524592094714-0f0654e20314"), u("1522312346375-d1a52e2b99b3")],
    colors: ["Café", "Negro"],
  },
  {
    id: "audifonos-inalambricos",
    name: "Audífonos inalámbricos",
    brand: "Sony",
    category: "Tecnología",
    price: 220,
    description: "Bluetooth, buena batería y sonido potente con bajos marcados. Incluye cable de carga.",
    images: [u("1505740420928-5e560c06d30e"), u("1583394838336-acd977736f90"), u("1484704849700-f032a568e944")],
    colors: ["Negro", "Blanco"],
  },
  {
    id: "lentes-de-sol",
    name: "Lentes de sol",
    brand: "Ray-Ban",
    category: "Accesorios",
    price: 120,
    oldPrice: 150,
    description: "Protección UV400 y marco resistente. Incluye estuche y paño de limpieza.",
    images: [u("1572635196237-14b3f281503f"), u("1511499767150-a48a237f0083"), u("1577803645773-f96470509666")],
    colors: ["Negro", "Carey"],
  },
  {
    id: "mochila-urbana",
    name: "Mochila urbana",
    brand: "Totto",
    category: "Accesorios",
    price: 180,
    description: "Espaciosa, con compartimento acolchado para laptop y bolsillos laterales.",
    images: [u("1553062407-98eeb64c6a62"), u("1622560480605-d83c853bc5c3"), u("1581605405669-fcdf81165afa")],
    sizes: ["20 L", "30 L"],
    colors: ["Negro", "Gris"],
  },
  {
    id: "camara-instantanea",
    name: "Cámara instantánea",
    brand: "Fujifilm",
    category: "Tecnología",
    price: 650,
    description: "Fotos al momento para tus mejores recuerdos. Fácil de usar, ideal para regalo.",
    images: [u("1526170375885-4d8ecf77b99f"), u("1502920917128-1aa500764cbd"), u("1510127034890-ba27508e9f1c")],
    colors: ["Celeste", "Rosado", "Blanco"],
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
