export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string; // "/productos/mi-foto.jpg" (carpeta public/productos) o una URL completa
  category?: string;
  available?: boolean; // false = se muestra como "Agotado"
};

// 👇 Productos de DEMOSTRACIÓN con fotos de Unsplash. Reemplázalos por los tuyos.
// Pon tus fotos en /public/productos y usa image: "/productos/mi-foto.jpg"
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=700&h=700&fit=crop&q=75&auto=format`;

const PRODUCTS: Product[] = [
  { id: "1", name: "Zapatillas deportivas", description: "Cómodas y livianas, ideales para el día a día o para entrenar. Consulta tallas disponibles.", price: 350, category: "Calzado", image: u("1542291026-7eec264c27ff") },
  { id: "2", name: "Reloj clásico", description: "Diseño elegante con correa de cuero. Perfecto para regalo.", price: 280, category: "Accesorios", image: u("1523275335684-37898b6baf30") },
  { id: "3", name: "Audífonos inalámbricos", description: "Bluetooth, buena batería y sonido potente. Incluye cable de carga.", price: 220, category: "Tecnología", image: u("1505740420928-5e560c06d30e") },
  { id: "4", name: "Lentes de sol", description: "Protección UV400, marco resistente. Incluye estuche.", price: 120, category: "Accesorios", image: u("1572635196237-14b3f281503f") },
  { id: "5", name: "Mochila urbana", description: "Espaciosa, con compartimento para laptop y bolsillos laterales.", price: 180, category: "Accesorios", image: u("1553062407-98eeb64c6a62") },
  { id: "6", name: "Cámara instantánea", description: "Fotos al momento para tus mejores recuerdos. Consulta disponibilidad de rollos.", price: 650, category: "Tecnología", image: u("1526170375885-4d8ecf77b99f") },
];

// Toda la tienda lee los productos desde aquí.
// Cuando metas Supabase solo cambias el cuerpo de esta función (ver README).
export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}
