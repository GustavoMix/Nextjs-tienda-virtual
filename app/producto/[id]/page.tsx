import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, getProducts } from "@/lib/products";
import { money } from "@/lib/whatsapp";
import { SITE_URL, STORE_NAME } from "@/lib/config";

// Se genera una página por producto al compilar (necesario para GitHub Pages)
export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return {};
  return {
    title: `${p.name} | ${STORE_NAME}`,
    description: p.description,
    // Vista previa al pegar el link en Facebook / WhatsApp (necesita la URL completa de la foto)
    openGraph: {
      title: `${p.name} · ${money(p.price)}`,
      description: p.description,
      url: SITE_URL ? `${SITE_URL}/producto/${p.id}/` : undefined,
      siteName: STORE_NAME,
      images: p.images.slice(0, 1).map((u) => (u.startsWith("/") ? SITE_URL + u : u)),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[id]">) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();
  return <ProductDetail p={p} />;
}
