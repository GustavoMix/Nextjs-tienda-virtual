"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("tema", dark ? "oscuro" : "claro");
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar modo claro / oscuro"
      title="Modo claro / oscuro"
      className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-lg transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
