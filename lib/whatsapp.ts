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

type Choice = { qty?: number; size?: string; color?: string; link?: string };

// Enlace para pedir un producto concreto (con talla, color y cantidad si se eligieron)
export const productWhatsAppUrl = (p: Product, { qty = 1, size, color, link }: Choice = {}) =>
  wa(
    [
      "¡Hola! 👋 Me interesa este producto:",
      "",
      `🛍️ ${p.name}${p.brand ? ` (${p.brand})` : ""}`,
      p.condition && `Estado: ${p.condition}`,
      p.measure && `Medida: ${p.measure}`,
      size && `Talla: ${size}`,
      color && `Color: ${color}`,
      `Cantidad: ${qty}`,
      `Precio: ${money(p.price * qty)}`,
      link && `Link: ${link}`,
      "",
      "¿Está disponible?",
    ]
      .filter((l) => typeof l === "string")
      .join("\n")
  );

// Producto reservado: pedir que le avisen si se libera
export const reservedWhatsAppUrl = (p: Product, link?: string) =>
  wa(
    `¡Hola! 👋 Vi que la ${p.name} está reservada.${link ? `\n${link}` : ""}\n\nSi se libera, ¿me avisas? Me interesa.`
  );

// Producto vendido: preguntar por uno parecido
export const similarWhatsAppUrl = (p: Product) =>
  wa(`¡Hola! 👋 Vi que la ${p.name} ya se vendió. ¿Tienes otra parecida?`);

// Enlace de contacto general
export const contactWhatsAppUrl = () =>
  wa("¡Hola! 👋 Vi tu tienda y quiero hacer una consulta.");
