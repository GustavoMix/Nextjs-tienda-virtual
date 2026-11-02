"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { buildWhatsAppUrl, money, type CartItem } from "@/lib/whatsapp";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/config";

const KEY = "tienda-carrito";

export default function Store({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

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

  const items: CartItem[] = useMemo(
    () =>
      products
        .filter((p) => cart[p.id] > 0)
        .map((p) => ({ product: p, qty: cart[p.id] })),
    [products, cart]
  );
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  const change = (id: string, d: number) =>
    setCart((c) => {
      const q = Math.max(0, (c[id] ?? 0) + d);
      const next = { ...c, [id]: q };
      if (q === 0) delete next[id];
      return next;
    });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div>
          <h1 className="text-xl font-bold">{STORE_NAME}</h1>
          <p className="text-xs text-neutral-500">{STORE_TAGLINE}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white"
        >
          🛒 Carrito ({count})
        </button>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-white">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-neutral-200 text-4xl">📦</div>
            )}
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h2 className="font-semibold leading-tight">{p.name}</h2>
              <p className="text-sm text-neutral-500">{p.description}</p>
              <p className="mt-auto pt-2 text-lg font-bold">{money(p.price)}</p>
              <button
                onClick={() => change(p.id, 1)}
                className="mt-1 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white active:scale-95"
              >
                Agregar
              </button>
            </div>
          </article>
        ))}
      </main>

      {open && (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="flex h-full w-full max-w-sm flex-col bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Tu pedido</h2>
              <button onClick={() => setOpen(false)} className="text-2xl leading-none">×</button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {items.length === 0 && <p className="text-neutral-500">Tu carrito está vacío.</p>}
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-neutral-500">{money(product.price * qty)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => change(product.id, -1)} className="h-8 w-8 rounded-full border">−</button>
                    <span className="w-5 text-center">{qty}</span>
                    <button onClick={() => change(product.id, 1)} className="h-8 w-8 rounded-full border">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3">
              <p className="mb-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </p>
              <a
                href={items.length ? buildWhatsAppUrl(items) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!items.length}
                className={`block rounded-lg py-3 text-center font-semibold text-white ${
                  items.length ? "bg-green-600" : "pointer-events-none bg-neutral-300"
                }`}
              >
                Pedir por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
