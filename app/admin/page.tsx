import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const products = await getProducts();
  return <AdminApp initialProducts={products} />;
}
