// Configuración de la tienda. Cambia estos valores a los tuyos.
export const STORE_NAME = "Mi Tienda";
export const STORE_TAGLINE = "Pide directo por WhatsApp";

// Número con código de país (Bolivia = 591), solo dígitos.
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59179592228";

export const CURRENCY = "BOB";
export const LOCALE = "es-BO";

// Prefijo para rutas de imágenes cuando el sitio vive en una subcarpeta (GitHub Pages)
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Información que aparece en cada producto (cámbiala por la tuya)
export const STORE_INFO = [
  { icon: "🚚", title: "Entregas", text: "En tu ciudad y envíos a todo Bolivia" },
  { icon: "💵", title: "Pago", text: "Efectivo, QR o transferencia" },
  { icon: "✅", title: "Garantía", text: "Producto nuevo y verificado" },
];

// Dirección pública de la tienda (se usa para poner el link del producto en el mensaje de WhatsApp)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
