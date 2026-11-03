import { CURRENCY, LOCALE, WHATSAPP_NUMBER } from "./config";
import type { Product } from "./products";

export const money = (n: number) =>
  new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(n);

const wa = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Enlace para pedir un producto concreto
export const productWhatsAppUrl = (p: Product, qty = 1) =>
  wa(
    `¡Hola! 👋 Me interesa este producto:\n\n🛍️ ${p.name}\nCantidad: ${qty}\nPrecio: ${money(p.price * qty)}\n\n¿Está disponible?`
  );

// Enlace de contacto general
export const contactWhatsAppUrl = () =>
  wa("¡Hola! 👋 Vi tu tienda y quiero hacer una consulta.");
