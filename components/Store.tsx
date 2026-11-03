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
      {/* Barra fija mínima: nombre, tema y WhatsApp */}
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-stone-800/80 dark:bg-stone-950/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2.5 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-tight tracking-tight">{STORE_NAME}</p>
            <p className="truncate text-[11px] leading-tight text-stone-500 dark:text-stone-400">{STORE_TAGLINE}</p>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍  Buscar…"
            aria-label="Buscar producto"
            className="hidden h-10 w-72 rounded-full bg-stone-100 px-4 text-sm outline-none ring-[#25D366] focus:ring-2 dark:bg-stone-900 md:block"
          />
          <ThemeToggle />
          <a
            href={contactWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-sm font-bold text-stone-950 transition hover:brightness-95 sm:px-4"
          >
            <WaIcon className="h-5 w-5" /> <span className="hidden min-[380px]:inline">Escríbenos</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-2 pb-6 pt-2.5 sm:px-4 sm:pt-4">
        {/* Buscador (celular) y categorías: se van al hacer scroll para dejar espacio a los productos */}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍  Buscar producto…"
          aria-label="Buscar producto"
          className="h-11 w-full rounded-full bg-white px-4 text-[15px] outline-none ring-1 ring-stone-200 focus:ring-2 focus:ring-[#25D366] dark:bg-stone-900 dark:ring-stone-800 md:hidden"
        />
        <div className="-mx-2 mt-2 flex items-center gap-1.5 overflow-x-auto px-2 pb-0.5 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:mt-0">
          {cats.length > 2 &&
            cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  c === cat
                    ? "bg-[#25D366] text-stone-950"
                    : "bg-white text-stone-600 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800"
                }`}
              >
                {c}
              </button>
            ))}
          <span className="ml-auto hidden shrink-0 pl-2 text-xs font-semibold sm:inline text-stone-500 dark:text-stone-400">
            <span className="text-[#25D366]">●</span> {shown.length} disponibles
          </span>
        </div>

        {shown.length === 0 && (
          <p className="py-16 text-center text-stone-500">No encontramos productos con esa búsqueda.</p>
        )}

        {/* Productos: 2 columnas en celular, hasta 5 en pantallas grandes */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {shown.map((p) => {
            const soldOut = p.available === false;
            const off = !soldOut && p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition hover:ring-stone-300 dark:bg-stone-900 dark:ring-stone-800 dark:hover:ring-stone-700"
              >
                <Link href={`/producto/${p.id}`} className="relative block overflow-hidden" aria-label={`Ver ${p.name}`}>
                  <Photo
                    url={p.images[0]}
                    alt={p.name}
                    className={`aspect-[4/5] w-full transition duration-300 group-hover:scale-[1.03] ${soldOut ? "opacity-50 grayscale" : ""}`}
                  />
                  {soldOut && (
                    <span className="absolute left-2 top-2 rounded-full bg-stone-950/80 px-2 py-0.5 text-[11px] font-bold text-white">Agotado</span>
                  )}
                  {off > 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">-{off}%</span>
                  )}
                  {p.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                      📷 {p.images.length}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
                  <Link href={`/producto/${p.id}`}>
                    <h2 className="line-clamp-2 text-[14px] font-semibold leading-snug">
                      {p.brand && <span className="text-stone-500 dark:text-stone-400">{p.brand} · </span>}
                      {p.name}
                    </h2>
                  </Link>
                  <div className="mt-auto flex items-end justify-between gap-1.5 pt-1.5">
                    <div className="min-w-0 leading-tight">
                      {off > 0 && <p className="text-[11px] text-stone-400 line-through tabular-nums">{money(p.oldPrice!)}</p>}
                      <p className="text-[17px] font-extrabold tabular-nums">{money(p.price)}</p>
                    </div>
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

        <footer className="mt-6 flex flex-col items-center gap-3 border-t border-stone-200 pt-5 text-center text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <p>
            ¿No encuentras lo que buscas?{" "}
            <a href={contactWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 underline dark:text-[#25D366]">
              Escríbenos
            </a>
          </p>
          <Link href="/admin" className="text-xs text-stone-400 hover:underline dark:text-stone-600">
            Ingresar como admin
          </Link>
        </footer>
      </main>
    </div>
  );
}
