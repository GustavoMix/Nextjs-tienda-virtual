"use client";

import { useEffect, useRef, useState } from "react";
import { src } from "./ui";

type Props = { images: string[]; start: number; alt: string; onClose: () => void };

// Visor a pantalla completa:
// - Deslizar o flechas para cambiar de foto
// - Doble toque (o botón 🔍) para acercar; arrastrar para moverse
// - Modo 3D: la foto se inclina siguiendo el dedo/mouse o el movimiento del celular
export default function PhotoViewer({ images, start, alt, onClose }: Props) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode3d, setMode3d] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, lx: 50, ly: 50 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0, lx: 50, ly: 50 });
  };
  const go = (d: number) => {
    setI((n) => (n + d + images.length) % images.length);
    reset();
  };

  // Teclado y bloquear scroll de fondo
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

  // Modo 3D con el movimiento del celular (giroscopio)
  useEffect(() => {
    if (!mode3d) return;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const y = Math.max(-25, Math.min(25, e.gamma));
      const x = Math.max(-25, Math.min(25, e.beta - 45));
      setTilt({ x: -x, y, lx: 50 + y * 2, ly: 50 + x * 2 });
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [mode3d]);

  const toggle3d = async () => {
    reset();
    if (!mode3d) {
      // iPhone pide permiso para usar el giroscopio
      const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      try {
        await DOE?.requestPermission?.();
      } catch {}
    }
    setMode3d((m) => !m);
  };

  const zoomAt = (clientX: number, clientY: number) => {
    if (mode3d) return;
    if (zoom > 1) return reset();
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const z = 2.5;
    setZoom(z);
    setPan({ x: (r.width / 2 - (clientX - r.left)) * (z - 1), y: (r.height / 2 - (clientY - r.top)) * (z - 1) });
  };

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (mode3d && r) {
      // inclinar según la posición del dedo/mouse
      const fx = (e.clientX - r.left) / r.width - 0.5;
      const fy = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: -fy * 30, y: fx * 30, lx: (fx + 0.5) * 100, ly: (fy + 0.5) * 100 });
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (zoom > 1 && r) {
      const mx = (r.width * (zoom - 1)) / 2;
      const my = (r.height * (zoom - 1)) / 2;
      setPan({ x: Math.max(-mx, Math.min(mx, d.px + dx)), y: Math.max(-my, Math.min(my, d.py + dy)) });
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || mode3d || zoom > 1) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 50 && images.length > 1) go(dx < 0 ? 1 : -1);
  };

  const transform = mode3d
    ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(.86)`
    : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  const btn = "grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black" role="dialog" aria-label={`Fotos de ${alt}`}>
      <div className="flex items-center justify-between p-3 text-white">
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums">
          {i + 1} / {images.length}
        </span>
        <div className="flex gap-2">
          <button onClick={toggle3d} className={`${btn} w-auto px-4 text-sm font-bold ${mode3d ? "!bg-[#25D366] text-stone-950" : ""}`}>
            3D
          </button>
          {!mode3d && (
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
          )}
          <button onClick={onClose} aria-label="Cerrar" className={`${btn} text-2xl`}>
            ×
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
      <div
        ref={box}
        className="absolute inset-0 touch-none select-none overflow-hidden"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => mode3d && setTilt({ x: 0, y: 0, lx: 50, ly: 50 })}
        onDoubleClick={(e) => zoomAt(e.clientX, e.clientY)}
      >
        <div
          className={`absolute inset-0 grid place-items-center ${dragging && zoom > 1 ? "" : "transition-transform duration-200 ease-out"}`}
          style={{ transform, transformStyle: "preserve-3d" }}
        >
          <div className={`relative max-h-full max-w-full ${mode3d ? "overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,.7)]" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(images[i])} alt={`${alt} – foto ${i + 1}`} draggable={false} className="max-h-[calc(100dvh-140px)] w-auto min-w-[min(100vw,calc(100dvh-140px))] max-w-full object-contain" />
            {mode3d && (
              <div
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{ background: `radial-gradient(circle at ${tilt.lx}% ${tilt.ly}%, rgba(255,255,255,.65), transparent 55%)` }}
              />
            )}
          </div>
        </div>
      </div>

        {images.length > 1 && !mode3d && zoom === 1 && (
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
        {mode3d
          ? "Mueve el dedo sobre la foto o inclina el celular"
          : zoom > 1
            ? "Arrastra para mirar los detalles · doble toque para alejar"
            : "Desliza para cambiar · doble toque para acercar"}
      </p>
    </div>
  );
}
