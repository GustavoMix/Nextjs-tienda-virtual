export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string; // ruta en /public/productos/... o URL completa
};

// 👇 Aquí subes tus productos de Facebook.
// Pon las fotos en /public/productos y usa image: "/productos/mi-foto.jpg"
const PRODUCTS: Product[] = [
  { id: "1", name: "Producto de ejemplo 1", description: "Descripción corta del producto.", price: 150 },
  { id: "2", name: "Producto de ejemplo 2", description: "Descripción corta del producto.", price: 280 },
  { id: "3", name: "Producto de ejemplo 3", description: "Descripción corta del producto.", price: 99 },
  { id: "4", name: "Producto de ejemplo 4", description: "Descripción corta del producto.", price: 450 },
];

// Toda la tienda lee los productos desde aquí.
// Cuando metas Supabase solo cambias el cuerpo de esta función (ver README).
export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}
