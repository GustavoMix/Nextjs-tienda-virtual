"use client";

import { useState } from "react";
import { BASE_PATH } from "@/lib/config";

export const src = (s: string) => (s.startsWith("/") ? BASE_PATH + s : s);

export const WaIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.3-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
  </svg>
);

// Foto con respaldo: si no carga, muestra una caja
export function Photo({ url, alt, className }: { url?: string; alt: string; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken)
    return <div className={`${className} grid place-items-center bg-stone-200 text-5xl dark:bg-stone-800`}>📦</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src(url)} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`${className} object-cover`} />
  );
}
