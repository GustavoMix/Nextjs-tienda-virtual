"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { src } from "../ui";

const field =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 outline-none ring-[#25D366] focus:ring-2 dark:border-stone-800 dark:bg-stone-950";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

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
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") ?? "");
  const [colors, setColors] = useState(product?.colors?.join(", ") ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [available, setAvailable] = useState(product?.available !== false);
  const [error, setError] = useState("");

  // Prototipo: las fotos se muestran solo en este navegador. Con Supabase se subirán a Storage.
  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((imgs) => [...imgs, ...urls].slice(0, 3));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return setError("Pon al menos el nombre y el precio.");
    onSave({
      id: product?.id ?? (slug(name) || String(Date.now())),
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      price: Number(price),
      description: description.trim(),
      images,
      sizes: list(sizes).length ? list(sizes) : undefined,
      colors: list(colors).length ? list(colors) : undefined,
      available,
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

        <input id="name" placeholder="Nombre del producto *" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        <div className="grid grid-cols-2 gap-2">
          <input id="price" type="number" inputMode="numeric" min="0" placeholder="Precio Bs *" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
          <input id="brand" placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} className={field} />
        </div>
        <input id="category" placeholder="Categoría (ej. Calzado)" value={category} onChange={(e) => setCategory(e.target.value)} className={field} />
        <textarea id="description" rows={3} placeholder="Descripción corta" value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        <input id="sizes" placeholder="Tallas, separadas por coma (ej. 38, 39, 40)" value={sizes} onChange={(e) => setSizes(e.target.value)} className={field} />
        <input id="colors" placeholder="Colores, separados por coma" value={colors} onChange={(e) => setColors(e.target.value)} className={field} />

        <label className="flex items-center justify-between rounded-xl bg-stone-100 px-3.5 py-3 dark:bg-stone-800">
          <span className="font-semibold">Disponible</span>
          <input id="available" type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-5 w-5 accent-[#25D366]" />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-xl bg-[#25D366] py-3.5 font-bold text-stone-950 hover:brightness-95">Guardar</button>
      </form>
    </div>
  );
}
