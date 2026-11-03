"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { contactWhatsAppUrl, money, productWhatsAppUrl } from "@/lib/whatsapp";
import { BASE_PATH, STORE_NAME, STORE_TAGLINE } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";

const src = (s: string) => (s.startsWith("/") ? BASE_PATH + s : s);

const WaIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.3-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
  </svg>
);

function Photo({ p, className }: { p: Product; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!p.image || broken)
    return <div className={`${className} grid place-items-center bg-stone-200 text-5xl dark:bg-stone-800`}>📦</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src(p.image)} alt={p.name} loading="lazy" onError={() => setBroken(true)} className={`${className} object-cover`} />
  );
}

export default function Store({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const [sel, setSel] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);

  const cats = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))],
    [products]
  );
  const shown = products.filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      (p.name + " " + p.description).toLowerCase().includes(q.trim().toLowerCase())
  );

  const open = (p: Product) => {
    setSel(p);
    setQty(1);
  };

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sel]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Encabezado fijo: nombre, tema, contacto, buscador y categorías */}
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-stone-800/80 dark:bg-stone-950/90">
        <div className="mx-auto max-w-5xl px-3 pb-2.5 pt-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold leading-tight tracking-tight">{STORE_NAME}</p>
              <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">{STORE_TAGLINE}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <a
                href={contactWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-sm font-bold text-stone-950 transition hover:brightness-95"
              >
                <WaIcon className="h-4 w-4" /> Escríbenos
              </a>
            </div>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍  Buscar producto…"
            aria-label="Buscar producto"
            className="mt-2.5 w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2.5 text-[15px] outline-none ring-[#25D366] focus:ring-2 dark:border-stone-800 dark:bg-stone-900"
          />
          {cats.length > 2 && (
            <div className="-mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] sm:-mx-4 sm:px-4">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    c === cat
                      ? "bg-[#25D366] text-stone-950"
                      : "bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 pb-24 pt-3 sm:px-4 sm:pt-5">
        <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 dark:text-stone-400">
          <span className="h-2 w-2 rounded-full bg-[#25D366]" />
          {shown.length} {shown.length === 1 ? "producto disponible" : "productos disponibles"}
        </p>

        {shown.length === 0 && (
          <p className="py-16 text-center text-stone-500">No encontramos productos con esa búsqueda.</p>
        )}

        {/* Productos: 2 columnas en celular, 3–4 en pantallas grandes */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {shown.map((p) => {
            const soldOut = p.available === false;
            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition hover:ring-stone-300 dark:bg-stone-900 dark:ring-stone-800 dark:hover:ring-stone-700"
              >
                <button onClick={() => open(p)} className="relative block" aria-label={`Ver ${p.name}`}>
                  <Photo p={p} className={`aspect-square w-full ${soldOut ? "opacity-50 grayscale" : ""}`} />
                  {soldOut && (
                    <span className="absolute left-2 top-2 rounded-full bg-stone-950/80 px-2 py-0.5 text-[11px] font-bold text-white">
                      Agotado
                    </span>
                  )}
                </button>
                <div className="flex flex-1 flex-col p-2.5">
                  <button onClick={() => open(p)} className="text-left">
                    <h2 className="line-clamp-2 text-[14px] font-semibold leading-snug">{p.name}</h2>
                  </button>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <p className="text-[17px] font-extrabold tabular-nums">{money(p.price)}</p>
                    <a
                      href={soldOut ? undefined : productWhatsAppUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={soldOut}
                      aria-label={`Pedir ${p.name} por WhatsApp`}
                      className={`flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-bold transition active:scale-95 ${
                        soldOut
                          ? "pointer-events-none bg-stone-200 text-stone-400 dark:bg-stone-800"
                          : "bg-[#25D366] text-stone-950 hover:brightness-95"
                      }`}
                    >
                      <WaIcon className="h-4 w-4" /> Pedir
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
          ¿No encuentras lo que buscas?{" "}
          <a href={contactWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 underline dark:text-[#25D366]">
            Escríbenos por WhatsApp
          </a>
        </p>
      </main>

      {/* Botón flotante de WhatsApp */}
      <a
        href={contactWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-4 right-4 z-10 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"
      >
        <WaIcon className="h-7 w-7" />
      </a>

      {/* Detalle del producto */}
      {sel && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={() => setSel(null)}>
          <div
            role="dialog"
            aria-label={sel.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white dark:bg-stone-900 sm:rounded-3xl"
          >
            <div className="relative">
              <Photo p={sel} className="aspect-square w-full" />
              <button
                onClick={() => setSel(null)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-stone-900 shadow"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 p-5">
              {sel.category && (
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{sel.category}</p>
              )}
              <h2 className="text-2xl font-extrabold leading-tight">{sel.name}</h2>
              <p className="text-stone-600 dark:text-stone-300">{sel.description}</p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-3xl font-extrabold">{money(sel.price * qty)}</p>
                <div className="flex items-center gap-3 rounded-full bg-stone-100 p-1 dark:bg-stone-800">
                  <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Menos" className="h-9 w-9 rounded-full bg-white text-lg font-bold shadow-sm dark:bg-stone-700">−</button>
                  <span className="w-5 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty((n) => n + 1)} aria-label="Más" className="h-9 w-9 rounded-full bg-white text-lg font-bold shadow-sm dark:bg-stone-700">+</button>
                </div>
              </div>
              {sel.available === false ? (
                <p className="rounded-2xl bg-stone-100 py-4 text-center font-semibold text-stone-500 dark:bg-stone-800">Agotado por ahora</p>
              ) : (
                <a
                  href={productWhatsAppUrl(sel, qty)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-lg font-bold text-stone-950 transition hover:brightness-95"
                >
                  <WaIcon /> Pedir por WhatsApp
                </a>
              )}
              <p className="text-center text-xs text-stone-500 dark:text-stone-400">
                Se abre WhatsApp con tu pedido listo. Coordinamos pago y entrega por chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
