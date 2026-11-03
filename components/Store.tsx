"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { contactWhatsAppUrl, money, productWhatsAppUrl } from "@/lib/whatsapp";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";
import { Photo, WaIcon } from "./ui";

export default function Store({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const cats = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))],
    [products]
  );
  const shown = products.filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      (p.name + " " + p.description).toLowerCase().includes(q.trim().toLowerCase())
  );

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
                <Link href={`/producto/${p.id}`} className="relative block" aria-label={`Ver ${p.name}`}>
                  <Photo url={p.images[0]} alt={p.name} className={`aspect-square w-full ${soldOut ? "opacity-50 grayscale" : ""}`} />
                  {soldOut && (
                    <span className="absolute left-2 top-2 rounded-full bg-stone-950/80 px-2 py-0.5 text-[11px] font-bold text-white">
                      Agotado
                    </span>
                  )}
                  {!soldOut && p.oldPrice && p.oldPrice > p.price && (
                    <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                    </span>
                  )}
                  {p.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                      📷 {p.images.length}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-2.5">
                  <Link href={`/producto/${p.id}`} className="text-left">
                    {p.brand && (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{p.brand}</p>
                    )}
                    <h2 className="line-clamp-2 text-[14px] font-semibold leading-snug">{p.name}</h2>
                  </Link>
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
        <p className="mt-6 text-center">
          <Link href="/admin" className="text-xs text-stone-400 hover:underline dark:text-stone-600">
            Ingresar como admin
          </Link>
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

    </div>
  );
}
