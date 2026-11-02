# Tienda virtual (Next.js + WhatsApp)

Tienda simple: catálogo de productos, carrito y botón **"Pedir por WhatsApp"** que te manda el pedido armado a tu número.

## Empezar
```bash
npm install
cp .env.example .env.local   # pon tu número de WhatsApp (código de país, solo dígitos)
npm run dev                  # http://localhost:3000
```

## Subir tus productos
1. Guarda las fotos (las de Facebook) en `public/productos/`.
2. Edita `lib/products.ts` y agrega cada producto:
   `{ id: "5", name: "Mi producto", description: "...", price: 120, image: "/productos/foto.jpg" }`
3. Nombre y moneda de la tienda: `lib/config.ts`.

## Después: Supabase
Toda la tienda lee productos con `getProducts()` en `lib/products.ts`. Para migrar:
1. `npm i @supabase/supabase-js`, crea tabla `products` (`id`, `name`, `description`, `price`, `image`).
2. Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
3. Reemplaza el cuerpo de `getProducts()` por:
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
1. En GitHub: **Settings → Pages → Source: GitHub Actions**.
2. (Opcional) **Settings → Secrets and variables → Actions → Variables**: crea `WHATSAPP_NUMBER` con tu número.
3. Tu tienda quedará en `https://TU-USUARIO.github.io/nextjs-tienda-virtual/`.
