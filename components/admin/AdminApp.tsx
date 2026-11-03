"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUSES, statusOf, type Product, type Status } from "@/lib/products";
import { getUser, signIn, signOut, type AdminUser } from "@/lib/auth";
import { money } from "@/lib/whatsapp";
import { BASE_PATH, STORE_NAME } from "@/lib/config";
import ThemeToggle from "../ThemeToggle";
import { Photo } from "../ui";
import ProductForm from "./ProductForm";

const field =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 outline-none ring-[#25D366] focus:ring-2 dark:border-stone-800 dark:bg-stone-900";

function Login({ onLogin }: { onLogin: (u: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-4 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            onLogin(await signIn(email, password));
          } catch (err) {
            setError((err as Error).message);
          }
        }}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
      >
        <div className="text-center">
          <p className="text-3xl">🔐</p>
          <h1 className="mt-2 text-xl font-extrabold">Ingresar como admin</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">{STORE_NAME}</p>
        </div>
        <input id="email" type="email" placeholder="Correo" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        <input id="password" type="password" placeholder="Contraseña" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded-xl bg-[#25D366] py-3 font-bold text-stone-950 hover:brightness-95">Ingresar</button>
        <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          Modo prototipo: entra con cualquier correo y contraseña. El login real llegará con Supabase.
        </p>
        <Link href="/" className="block text-center text-sm text-stone-500 underline dark:text-stone-400">
          ← Volver a la tienda
        </Link>
      </form>
    </div>
  );
}

export default function AdminApp({ initialProducts }: { initialProducts: Product[] }) {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  // Copia el link directo del producto para pegarlo en Facebook / WhatsApp
  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${BASE_PATH}/producto/${id}/`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copia el link:", url);
    }
    setCopied(id);
    setTimeout(() => setCopied(""), 1600);
  };

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  if (user === undefined) return <div className="min-h-screen bg-stone-50 dark:bg-stone-950" />;
  if (!user) return <Login onLogin={setUser} />;

  const save = (p: Product) => {
    setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]));
    setEditing(null);
  };
  const setStatus = (id: string, status: Status) =>
    setProducts((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
  const remove = (id: string) => {
    setProducts((list) => list.filter((x) => x.id !== id));
    setConfirmId(null);
  };

  const count = (st: Status) => products.filter((p) => statusOf(p) === st).length;

  return (
    <div className="min-h-screen bg-stone-50 pb-16 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-stone-800/80 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <div className="min-w-0">
            <p className="truncate font-extrabold">Panel · {STORE_NAME}</p>
            <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">{user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="flex h-10 items-center rounded-full bg-stone-100 px-3.5 text-sm font-semibold dark:bg-stone-900">
              Ver tienda
            </Link>
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
              }}
              className="flex h-10 items-center rounded-full px-3 text-sm font-semibold text-red-500"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-3 pt-4 sm:px-4">
        <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          🧪 <b>Prototipo:</b> los cambios de aquí no se guardan todavía (se pierden al recargar). Se guardarán cuando conectemos Supabase.
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          {STATUSES.map((st) => [st.plural, count(st.id)] as const).map(([label, n]) => (
            <div key={label} className="rounded-2xl bg-white p-3 ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
              <p className="text-2xl font-extrabold tabular-nums">{n}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setEditing("new")}
          className="w-full rounded-2xl bg-[#25D366] py-3.5 font-bold text-stone-950 hover:brightness-95"
        >
          + Agregar producto
        </button>

        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 dark:divide-stone-800 dark:bg-stone-900 dark:ring-stone-800">
          {products.map((p) => {
            const st = statusOf(p);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
                <Photo url={p.images[0]} alt={p.name} className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-sm text-stone-500 tabular-nums dark:text-stone-400">
                    {money(p.price)}
                    {p.condition && ` · ${p.condition}`}
                  </p>
                </div>
                {confirmId === p.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => remove(p.id)} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white">Eliminar</button>
                    <button onClick={() => setConfirmId(null)} className="rounded-lg px-2 py-2 text-xs font-semibold">No</button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => copyLink(p.id)} aria-label={`Copiar link de ${p.name}`} title="Copiar link" className="grid h-9 w-9 place-items-center rounded-lg bg-stone-100 dark:bg-stone-800">
                      {copied === p.id ? "✅" : "🔗"}
                    </button>
                    <button onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`} className="grid h-9 w-9 place-items-center rounded-lg bg-stone-100 dark:bg-stone-800">✏️</button>
                    <button onClick={() => setConfirmId(p.id)} aria-label={`Eliminar ${p.name}`} className="grid h-9 w-9 place-items-center rounded-lg bg-stone-100 dark:bg-stone-800">🗑️</button>
                  </div>
                )}
                  <div className="flex basis-full gap-1.5 pl-[68px]">
                  {STATUSES.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setStatus(p.id, o.id)}
                      className={`rounded-full px-2.5 py-1 text-[12px] font-bold transition ${
                        st === o.id
                          ? o.id === "disponible"
                            ? "bg-[#25D366] text-stone-950"
                            : o.id === "reservado"
                              ? "bg-amber-400 text-stone-950"
                              : "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                          : "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
          {products.length === 0 && <li className="p-8 text-center text-stone-500">No hay productos. Agrega el primero.</li>}
        </ul>
      </main>

      {editing && (
        <ProductForm product={editing === "new" ? undefined : editing} onSave={save} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
