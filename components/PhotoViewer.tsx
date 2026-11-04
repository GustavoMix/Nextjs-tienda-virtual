"use client";

import { useEffect, useRef, useState } from "react";
import { src } from "./ui";

type Props = { images: string[]; start: number; alt: string; onClose: () => void };

// Visor de fotos a pantalla completa:
// - Deslizar o flechas para cambiar de foto
// - Doble toque (o botón 🔍) para acercar y arrastrar para ver detalles
export default function PhotoViewer({ images, start, alt, onClose }: Props) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const go = (d: number) => {
    setI((n) => (n + d + images.length) % images.length);
    reset();
  };

  // Teclado + bloquear scroll del fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoomAt = (clientX: number, clientY: number) => {
    if (zoom > 1) return reset();
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const z = 2.5;
    setZoom(z);
    setPan({ x: (r.width / 2 - (clientX - r.left)) * (z - 1), y: (r.height / 2 - (clientY - r.top)) * (z - 1) });
  };

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setPanning(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const r = box.current?.getBoundingClientRect();
    if (!d || zoom === 1 || !r) return;
    const mx = (r.width * (zoom - 1)) / 2;
    const my = (r.height * (zoom - 1)) / 2;
    setPan({
      x: Math.max(-mx, Math.min(mx, d.px + e.clientX - d.x)),
      y: Math.max(-my, Math.min(my, d.py + e.clientY - d.y)),
    });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setPanning(false);
    if (d && zoom === 1 && Math.abs(e.clientX - d.x) > 50 && images.length > 1) go(e.clientX < d.x ? 1 : -1);
  };

  const btn = "grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black" role="dialog" aria-label={`Fotos de ${alt}`}>
      <div className="flex items-center justify-between p-3 text-white">
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums">
          {i + 1} / {images.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const r = box.current?.getBoundingClientRect();
              if (r) zoomAt(r.left + r.width / 2, r.top + r.height / 2);
            }}
            aria-label={zoom > 1 ? "Alejar" : "Acercar"}
            className={btn}
          >
            {zoom > 1 ? "−" : "🔍"}
          </button>
          <button onClick={onClose} aria-label="Cerrar" className={`${btn} text-2xl`}>
            ×
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={box}
          className="absolute inset-0 grid touch-none select-none place-items-center"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={(e) => zoomAt(e.clientX, e.clientY)}
        >
          <div
            className={panning && zoom > 1 ? "" : "transition-transform duration-200 ease-out"}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(images[i])}
              alt={`${alt} – foto ${i + 1}`}
              draggable={false}
              className="max-h-[calc(100dvh-150px)] w-auto min-w-[min(100vw,calc(100dvh-150px))] max-w-full object-contain"
            />
          </div>
        </div>

        {images.length > 1 && zoom === 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Foto anterior" className={`${btn} absolute left-3 top-1/2 -translate-y-1/2 text-2xl`}>
              ‹
            </button>
            <button onClick={() => go(1)} aria-label="Foto siguiente" className={`${btn} absolute right-3 top-1/2 -translate-y-1/2 text-2xl`}>
              ›
            </button>
          </>
        )}
      </div>

      <p className="p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] text-center text-xs text-white/60">
        {zoom > 1 ? "Arrastra para mirar los detalles · doble toque para alejar" : "Desliza para cambiar · doble toque para acercar"}
      </p>
    </div>
  );
}
