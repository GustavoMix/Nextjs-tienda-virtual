import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProduct, getProducts } from "@/lib/products";
import { STORE_NAME } from "@/lib/config";

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
    openGraph: { title: p.name, description: p.description, images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[id]">) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();
  return <ProductDetail p={p} />;
}
