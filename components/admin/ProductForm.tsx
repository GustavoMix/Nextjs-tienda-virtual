"use client";

import { useState } from "react";
import { CONDITIONS, STATUSES, statusOf, type Condition, type Product, type Status } from "@/lib/products";
import { src } from "../ui";

const field =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 outline-none ring-[#25D366] focus:ring-2 dark:border-stone-800 dark:bg-stone-950";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product?: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [condition, setCondition] = useState<Condition>(product?.condition ?? "Como nuevo");
  const [measure, setMeasure] = useState(product?.measure ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [frames, setFrames] = useState<string[]>(product?.images360 ?? []);
  const [status, setStatus] = useState<Status>(product ? statusOf(product) : "disponible");
  const [error, setError] = useState("");

  // Prototipo: las fotos se muestran solo en este navegador. Con Supabase se subirán a Storage.
  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((imgs) => [...imgs, ...urls].slice(0, 3));
  };

  // Fotos 360°: se ordenan por nombre de archivo (el orden en que las tomaste)
  const addFrames = (files: FileList | null) => {
    if (!files) return;
    const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFrames(sorted.map((f) => URL.createObjectURL(f)).slice(0, 72));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return setError("Pon al menos el nombre y el precio.");
    onSave({
      ...product,
      id: product?.id ?? (slug(name) || String(Date.now())),
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      price: Number(price),
      description: description.trim(),
      images,
      images360: frames.length > 1 ? frames : undefined,
      condition,
      measure: measure.trim() || undefined,
      stock: product?.stock ?? 1,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-stone-900 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{product ? "Editar producto" : "Nuevo producto"}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-xl dark:bg-stone-800">×</button>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold">Fotos (hasta 3)</p>
          <div className="flex gap-2">
            {images.map((u, i) => (
              <div key={u} className="relative h-20 w-20 overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(u)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-sm text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-stone-300 text-2xl text-stone-400 dark:border-stone-700">
                +
                <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
              </label>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-stone-100 p-3 dark:bg-stone-800">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Vista 360° <span className="font-normal text-stone-500 dark:text-stone-400">(opcional)</span></p>
            {frames.length > 0 && (
              <button type="button" onClick={() => setFrames([])} className="text-xs font-semibold text-red-500">
                Quitar
              </button>
            )}
          </div>
          {frames.length > 0 ? (
            <div className="mt-2 flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
              {frames.slice(0, 8).map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={src(u)} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              ))}
              <span className="shrink-0 pl-1 text-xs font-semibold">{frames.length} fotos ✓</span>
            </div>
          ) : (
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 py-3 text-sm font-semibold text-stone-500 dark:border-stone-600 dark:text-stone-400">
              ↻ Subir fotos girando (12 a 36)
              <input id="frames" type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFrames(e.target.files)} />
            </label>
          )}
          <p className="mt-2 text-[11px] leading-snug text-stone-500 dark:text-stone-400">
            Pon la manta doblada sobre una silla giratoria o una mesa. Deja el celular fijo y toma una foto cada vez que la giras
            un poquito (24 fotos ≈ cada 15°), con la misma luz.
          </p>
        </div>

        <input id="name" placeholder="Nombre del producto *" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        <div className="grid grid-cols-2 gap-2">
          <input id="price" type="number" inputMode="numeric" min="0" placeholder="Precio Bs *" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
          <input id="brand" placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} className={field} />
        </div>
        <input id="category" placeholder="Categoría (ej. Infantil, Navidad)" value={category} onChange={(e) => setCategory(e.target.value)} className={field} />
        <textarea id="description" rows={3} placeholder="Descripción corta" value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        <div>
          <p className="mb-1.5 text-sm font-semibold">Estado</p>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`rounded-xl py-2.5 text-sm font-semibold ring-1 ${
                  condition === c ? "bg-[#25D366] text-stone-950 ring-[#25D366]" : "ring-stone-200 dark:ring-stone-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <input id="measure" placeholder="Medida (ej. 2 plazas · 180×220 cm)" value={measure} onChange={(e) => setMeasure(e.target.value)} className={field} />

        <div>
          <p className="mb-1.5 text-sm font-semibold">Situación</p>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setStatus(o.id)}
                className={`rounded-xl py-2.5 text-sm font-semibold ring-1 ${
                  status === o.id ? "bg-[#25D366] text-stone-950 ring-[#25D366]" : "ring-stone-200 dark:ring-stone-700"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-xl bg-[#25D366] py-3.5 font-bold text-stone-950 hover:brightness-95">Guardar</button>
      </form>
    </div>
  );
}
