import Store from "@/components/Store";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();
  return <Store products={products} />;
}
