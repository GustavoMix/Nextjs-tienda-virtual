"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { buildWhatsAppUrl, money, type CartItem } from "@/lib/whatsapp";
import { BASE_PATH, STORE_NAME, STORE_TAGLINE } from "@/lib/config";

const KEY = "tienda-carrito";
const img = (src: string) => (src.startsWith("/") ? BASE_PATH + src : src);

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.3-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
  </svg>
);

export default function Store({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    // Leer el carrito guardado solo en el navegador (evita errores de hidratación)
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      setCart(JSON.parse(localStorage.getItem(KEY) ?? "{}"));
    } catch {}
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const items: CartItem[] = useMemo(
    () => products.filter((p) => cart[p.id] > 0).map((p) => ({ product: p, qty: cart[p.id] })),
    [products, cart]
  );
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shown = products.filter((p) =>
    (p.name + " " + p.description).toLowerCase().includes(q.trim().toLowerCase())
  );

  const change = (id: string, d: number) =>
    setCart((c) => {
      const qty = Math.max(0, (c[id] ?? 0) + d);
      const next = { ...c, [id]: qty };
      if (qty === 0) delete next[id];
      return next;
    });

  const add = (p: Product) => {
    change(p.id, 1);
    setToast(`✓ ${p.name} agregado`);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-lg text-white">🛍️</span>
            <span className="text-lg font-bold tracking-tight">{STORE_NAME}</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            🛒 Carrito
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-xs">{count}</span>
            )}
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 py-10 text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{STORE_TAGLINE}</h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-50">
          Elige tus productos, agrégalos al carrito y envía tu pedido directo a nuestro WhatsApp.
        </p>
        <ol className="mx-auto mt-5 flex max-w-md justify-center gap-4 text-xs text-emerald-50 sm:text-sm">
          <li>1️⃣ Elige</li>
          <li>2️⃣ Agrega al carrito</li>
          <li>3️⃣ Pide por WhatsApp</li>
        </ol>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Buscar producto..."
          className="mb-5 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none ring-emerald-500 focus:ring-2"
        />
        {shown.length === 0 && <p className="py-10 text-center text-stone-500">No encontramos productos con esa búsqueda.</p>}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => {
            const inCart = cart[p.id] ?? 0;
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-stone-100">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img(p.image)} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-5xl">📦</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h2 className="font-semibold leading-tight">{p.name}</h2>
                  <p className="line-clamp-2 text-xs text-stone-500 sm:text-sm">{p.description}</p>
                  <p className="mt-auto pt-2 text-lg font-extrabold text-emerald-700">{money(p.price)}</p>
                  {inCart > 0 ? (
                    <div className="mt-1 flex items-center justify-between rounded-xl bg-emerald-50 p-1">
                      <button onClick={() => change(p.id, -1)} className="h-9 w-9 rounded-lg bg-white font-bold shadow-sm">−</button>
                      <span className="font-semibold">{inCart}</span>
                      <button onClick={() => change(p.id, 1)} className="h-9 w-9 rounded-lg bg-white font-bold shadow-sm">+</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => add(p)}
                      className="mt-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
                    >
                      Agregar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {count > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed inset-x-4 bottom-4 z-10 mx-auto flex max-w-md items-center justify-between rounded-2xl bg-emerald-600 px-5 py-4 font-semibold text-white shadow-xl"
        >
          <span>Ver pedido ({count})</span>
          <span>{money(total)}</span>
        </button>
      )}

      {toast && (
        <div className="fixed left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/50" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-full max-w-sm flex-col bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Tu pedido</h2>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-xl">×</button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {items.length === 0 && (
                <div className="py-16 text-center text-stone-500">
                  <p className="text-5xl">🛒</p>
                  <p className="mt-2">Tu carrito está vacío.</p>
                </div>
              )}
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-sm font-semibold text-emerald-700">{money(product.price * qty)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => change(product.id, -1)} className="h-8 w-8 rounded-full border">−</button>
                    <span className="w-5 text-center">{qty}</span>
                    <button onClick={() => change(product.id, 1)} className="h-8 w-8 rounded-full border">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </p>
              <a
                href={items.length ? buildWhatsAppUrl(items) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!items.length}
                className={`flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white ${
                  items.length ? "bg-[#25D366] hover:brightness-95" : "pointer-events-none bg-stone-300"
                }`}
              >
                <WaIcon /> Pedir por WhatsApp
              </a>
              <p className="mt-2 text-center text-xs text-stone-500">Se abrirá WhatsApp con tu pedido listo para enviar.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
