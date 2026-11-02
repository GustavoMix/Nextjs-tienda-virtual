import { CURRENCY, LOCALE, WHATSAPP_NUMBER } from "./config";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

export const money = (n: number) =>
  new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY }).format(n);

export function buildWhatsAppUrl(items: CartItem[]) {
  const lines = items.map(
    (i) => `• ${i.qty} x ${i.product.name} — ${money(i.product.price * i.qty)}`
  );
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const text = `Hola, quiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal: ${money(total)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
