# Tienda virtual (Next.js + WhatsApp)

Tienda simple: catálogo de productos, carrito y botón **"Pedir por WhatsApp"** que te manda el pedido armado a tu número.

## Empezar
```bash
npm install
cp .env.example .env.local   # pon tu número de WhatsApp (código de país, solo dígitos)
npm run dev                  # http://localhost:3000
```

## Subir tus productos
Ahora hay 6 mantas de demostración con dibujos de ejemplo (`public/productos/manta-*.svg`).
1. Guarda las fotos (las de Facebook) en `public/productos/`.
2. Edita `lib/products.ts`. Cada producto tiene su propia página en `/producto/<id>`:
```ts
{
  id: "manta-stitch",                     // el link (sin espacios ni tildes)
  name: "Manta Stitch",
  category: "Infantil",
  price: 100,
  oldPrice: 180,                          // opcional: precio anterior tachado
  condition: "Como nuevo",                // Nuevo | Como nuevo | Buen estado | Usado
  measure: "1½ plazas · 150×200 cm",
  stock: 1,                               // 1 = muestra "Única unidad"
  description: "Texto corto del producto.",
  images: ["/productos/stitch-1.jpg", "/productos/stitch-2.jpg", "/productos/stitch-3.jpg"],
  status: "disponible",                   // "disponible" | "reservado" | "vendido"
}
```
3. Nombre, número de WhatsApp, moneda y datos de entrega/pago: `lib/config.ts`.

## Después: Supabase
Toda la tienda lee productos con `getProducts()` en `lib/products.ts`. Para migrar:
1. `npm i @supabase/supabase-js`, crea tabla `products` (`id`, `name`, `description`, `price`, `image`).
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
3. Reemplaza el cuerpo de `getProducts()` y `getProduct(id)`. Por ejemplo:
```ts
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export async function getProducts() {
  const { data } = await supabase.from("products").select("*").order("id");
  return (data ?? []) as Product[];
}
```
Las imágenes pueden ir en Supabase Storage (usa la URL pública en `image`).

## Publicar en GitHub Pages
El workflow `.github/workflows/pages.yml` publica solo en cada push.
1. Ya está activado: GitHub Pages sirve la rama `gh-pages`, que el workflow actualiza en cada push.
2. (Opcional) **Settings → Secrets and variables → Actions → Variables**: crea `WHATSAPP_NUMBER` con tu número.
3. Tu tienda quedará en https://gustavomix.github.io/Nextjs-tienda-virtual/.

## Panel de admin (prototipo)
- Entra en `/admin` (o con el link "Ingresar como admin" al final de la tienda).
- **Ahora es solo la interfaz:** acepta cualquier correo/contraseña y los cambios no se guardan.
- Para hacerlo real con Supabase:
  1. **Login:** cambia las funciones de `lib/auth.ts` por Supabase Auth (`signInWithPassword`, `signOut`, `getUser`) y crea tu usuario admin en Supabase.
  2. **Guardar productos:** en `components/admin/AdminApp.tsx`, `save`, `toggle` y `remove` deben hacer `insert/update/delete` en la tabla `products`.
  3. **Fotos:** en `components/admin/ProductForm.tsx`, sube los archivos a Supabase Storage y guarda la URL pública en `images`.
  4. **Seguridad:** activa RLS en `products`: lectura pública y escritura solo para el admin.
