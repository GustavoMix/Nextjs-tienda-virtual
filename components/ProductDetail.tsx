"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { money, productWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL, STORE_INFO, STORE_NAME } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";
import { WaIcon, src } from "./ui";

function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [broken, setBroken] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = images.filter((u) => !broken.includes(u));

  const go = (n: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  if (list.length === 0)
    return <div className="grid aspect-square w-full place-items-center bg-stone-200 text-7xl dark:bg-stone-800 sm:rounded-3xl">📦</div>;

  return (
    <div>
      <div className="relative">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setI(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto bg-stone-200 [scrollbar-width:none] dark:bg-stone-900 sm:rounded-3xl"
        >
          {list.map((u, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u}
              src={src(u)}
              alt={`${alt} – foto ${n + 1}`}
              loading={n === 0 ? "eager" : "lazy"}
              onError={() => setBroken((b) => [...b, u])}
              className="h-full w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        {list.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            {Math.min(i, list.length - 1) + 1} / {list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-2.5 flex gap-2 px-3 sm:px-0">
          {list.map((u, n) => (
            <button
              key={u}
              onClick={() => go(n)}
              aria-label={`Ver foto ${n + 1}`}
              className={`h-16 w-16 overflow-hidden rounded-xl ring-2 transition ${
                n === i ? "ring-[#25D366]" : "opacity-60 ring-transparent hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(u)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
  warn,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  warn?: boolean;
}) {
  return (
    <div>
      <p className={`mb-2 text-sm font-semibold ${warn ? "text-amber-500" : ""}`}>
        {label}
        {value ? <span className="font-normal text-stone-500 dark:text-stone-400">: {value}</span> : warn ? " ← elige una" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`min-w-11 rounded-xl px-3.5 py-2 text-sm font-semibold ring-1 transition ${
              value === o
                ? "bg-[#25D366] text-stone-950 ring-[#25D366]"
                : `bg-white ring-stone-200 hover:ring-stone-400 dark:bg-stone-900 dark:ring-stone-700 dark:hover:ring-stone-500 ${
                    warn ? "ring-amber-500 dark:ring-amber-500" : ""
                  }`
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail({ p }: { p: Product }) {
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [warn, setWarn] = useState(false);
  const [toast, setToast] = useState("");
  const sizesRef = useRef<HTMLDivElement>(null);

  const soldOut = p.available === false;
  const needsSize = !!p.sizes?.length && !size;
  const link = SITE_URL ? `${SITE_URL}/producto/${p.id}/` : undefined;
  const waUrl = productWhatsAppUrl(p, { size, color, link });
  const off = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) return await navigator.share({ title: p.name, url });
      await navigator.clipboard.writeText(url);
      flash("Link copiado ✓");
    } catch {}
  };

  const askSize = () => {
    setWarn(true);
    sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cta = soldOut ? (
    <span className="flex flex-1 items-center justify-center rounded-2xl bg-stone-200 py-3.5 font-bold text-stone-500 dark:bg-stone-800">
      Agotado por ahora
    </span>
  ) : needsSize ? (
    <button onClick={askSize} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-bold text-stone-950 opacity-90">
      <WaIcon /> Elige tu talla
    </button>
  ) : (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-bold text-stone-950 transition hover:brightness-95 active:scale-[.98]"
    >
      <WaIcon /> Pedir por WhatsApp
    </a>
  );

  return (
    <div className="relative min-h-screen bg-stone-50 pb-28 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* En celular los botones flotan sobre la foto; en computadora es una barra normal */}
      <header className="absolute inset-x-0 top-0 z-10 sm:sticky sm:border-b sm:border-stone-200/80 sm:bg-white/90 sm:backdrop-blur sm:dark:border-stone-800/80 sm:dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-2.5">
          <Link href="/" className="flex h-10 items-center gap-1 rounded-full text-sm font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black/45 text-xl text-white backdrop-blur sm:bg-stone-100 sm:text-stone-900 sm:dark:bg-stone-900 sm:dark:text-stone-100">‹</span>
            <span className="hidden truncate pl-1 sm:inline">{STORE_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={share}
              aria-label="Compartir producto"
              className="grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur sm:bg-stone-100 sm:text-stone-900 sm:dark:bg-stone-900 sm:dark:text-stone-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl sm:grid sm:grid-cols-2 sm:items-start sm:gap-8 sm:px-4 sm:pb-10 sm:pt-6 lg:grid-cols-[3fr_2fr]">
        <div className="sm:sticky sm:top-20"><Gallery images={p.images} alt={p.name} /></div>

        <div className="space-y-5 px-3 pt-4 sm:px-0 sm:pt-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {p.brand && <span className="text-stone-800 dark:text-stone-200">{p.brand}</span>}
              {p.brand && p.category && <span>·</span>}
              {p.category && <span>{p.category}</span>}
              <span
                className={`ml-auto rounded-full px-2 py-0.5 normal-case tracking-normal ${
                  soldOut ? "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300" : "bg-[#25D366]/15 text-emerald-600 dark:text-[#25D366]"
                }`}
              >
                {soldOut ? "Agotado" : "● Disponible"}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{p.name}</h1>
            <div className="flex items-baseline gap-2.5">
              <p className="text-3xl font-extrabold tabular-nums">{money(p.price)}</p>
              {off > 0 && (
                <>
                  <p className="text-lg text-stone-400 line-through tabular-nums">{money(p.oldPrice!)}</p>
                  <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">-{off}%</span>
                </>
              )}
            </div>
          </div>

          {!!p.sizes?.length && (
            <div ref={sizesRef}>
              <Chips label="Talla / medida" options={p.sizes} value={size} onChange={(v) => { setSize(v); setWarn(false); }} warn={warn && !size} />
            </div>
          )}
          {!!p.colors?.length && <Chips label="Color" options={p.colors} value={color} onChange={setColor} />}

          <div className="hidden sm:flex">{cta}</div>

          <p className="leading-relaxed text-stone-600 dark:text-stone-300">{p.description}</p>

          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
            {STORE_INFO.map((s) => (
              <span key={s.title}>
                {s.icon} {s.short}
              </span>
            ))}
          </p>
        </div>
      </main>

      {/* Barra fija abajo en celular: precio + botón de WhatsApp */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 px-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-lg font-extrabold leading-tight tabular-nums">{money(p.price)}</p>
          </div>
          {cta}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-stone-900">
          {toast}
        </div>
      )}
    </div>
  );
}
