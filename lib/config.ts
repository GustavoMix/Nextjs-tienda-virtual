// Configuración de la tienda. Cambia estos valores a los tuyos.
export const STORE_NAME = "Mi Tienda";
export const STORE_TAGLINE = "Pide fácil por WhatsApp";

// Número con código de país, solo dígitos. Ej. México: 521234567890, Perú: 51987654321
// Se puede definir en .env.local con NEXT_PUBLIC_WHATSAPP_NUMBER
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "521234567890";

export const CURRENCY = "MXN"; // cambia a PEN, COP, USD, etc.
export const LOCALE = "es-MX";

// Prefijo para rutas de imágenes cuando el sitio vive en una subcarpeta (GitHub Pages)
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
