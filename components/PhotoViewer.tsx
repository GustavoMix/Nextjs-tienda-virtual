"use client";

import { useEffect, useRef, useState } from "react";
import Spin360 from "./Spin360";
import { src } from "./ui";

type Mode = "360" | "3d" | "zoom";
type Props = { images: string[]; frames?: string[]; start: number; startMode?: Mode; alt: string; onClose: () => void };

// iPhone pide permiso para usar el giroscopio; debe llamarse dentro de un toque del usuario.
export async function askGyroPermission() {
  const DOE = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as unknown as
    | { requestPermission?: () => Promise<string> }
    | undefined;
  try {
    await DOE?.requestPermission?.();
  } catch {}
}

const THICK = 18; // grosor del "objeto" 3D en px

// Visor 3D a pantalla completa:
// - La foto es un objeto 3D con grosor que se gira con el dedo (con inercia)
// - También se mueve al inclinar el celular (giroscopio)
// - Si no lo tocas, gira solo despacio
// - Botón 🔍 para ver la foto plana y acercar detalles
export default function PhotoViewer({ images, frames, start, startMode = "3d", alt, onClose }: Props) {
  const [i, setI] = useState(start);
  const [mode, setMode] = useState<Mode>(startMode === "360" && frames ? "360" : startMode);
  const [size, setSize] = useState(320);
  const [hint, setHint] = useState(true);

  const stage = useRef<HTMLDivElement>(null);
  const obj = useRef<HTMLDivElement>(null);
  const shine = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const st = useRef({
    rx: -10, ry: -25, vx: 0, vy: 0, gx: 0, gy: 0,
    dragging: false, lastX: 0, lastY: 0, idleSince: 0,
  });

  // zoom (modo plano)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [panning, setPanning] = useState(false);

  const next = images[(i + 1) % images.length];
  const go = (d: number) => {
    setI((n) => (n + d + images.length) % images.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Tamaño del objeto según la pantalla
  useEffect(() => {
    const fit = () => setSize(Math.round(Math.min(window.innerWidth - 56, window.innerHeight - 230, 620)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Teclado + bloquear scroll del fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setHint(false), 3500);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Giroscopio
  useEffect(() => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      st.current.gy = Math.max(-30, Math.min(30, e.gamma)) * 0.9;
      st.current.gx = -Math.max(-30, Math.min(30, e.beta - 45)) * 0.6;
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, []);

  // Bucle de animación: inercia, giro automático y dibujo
  useEffect(() => {
    if (mode !== "3d") return;
    let raf = 0;
    st.current.idleSince = performance.now();
    const frame = (now: number) => {
      const s = st.current;
      if (!s.dragging) {
        s.ry += s.vy;
        s.rx += s.vx;
        s.vy *= 0.94;
        s.vx *= 0.9;
        const still = Math.abs(s.vy) < 0.05 && Math.abs(s.vx) < 0.05;
        if (still && now - s.idleSince > 1800) {
          s.ry += 0.35; // giro automático lento
          s.rx += (-10 - s.rx) * 0.03; // vuelve a una vista ligeramente desde arriba
        }
      }
      s.rx = Math.max(-55, Math.min(55, s.rx));
      const rx = s.rx + s.gx;
      const ry = s.ry + s.gy;
      if (obj.current) obj.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      // brillo que se mueve con el ángulo
      const a = ((ry % 360) + 360) % 360;
      const front = a < 90 || a > 270;
      const lx = 50 - Math.sin((ry * Math.PI) / 180) * 60;
      const ly = 50 + Math.sin((rx * Math.PI) / 180) * 60;
      if (shine.current)
        shine.current.style.background = `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,${front ? 0.45 : 0.2}), transparent 60%)`;
      if (shadow.current) {
        const k = Math.abs(Math.cos((ry * Math.PI) / 180));
        shadow.current.style.transform = `scaleX(${0.35 + 0.65 * k})`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // Dedo / mouse en modo 3D
  const down3d = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const s = st.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.vx = s.vy = 0;
    setHint(false);
  };
  const move3d = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.ry += dx * 0.45;
    s.rx -= dy * 0.35;
    s.vy = dx * 0.45;
    s.vx = -dy * 0.35;
  };
  const up3d = () => {
    st.current.dragging = false;
    st.current.idleSince = performance.now();
  };

  // Dedo / mouse en modo zoom
  const downZoom = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setPanning(true);
  };
  const moveZoom = (e: React.PointerEvent) => {
    const p = panStart.current;
    if (!p || zoom === 1) return;
    const m = (size * (zoom - 1)) / 2;
    setPan({
      x: Math.max(-m, Math.min(m, p.px + e.clientX - p.x)),
      y: Math.max(-m, Math.min(m, p.py + e.clientY - p.y)),
    });
  };
  const upZoom = (e: React.PointerEvent) => {
    const p = panStart.current;
    panStart.current = null;
    setPanning(false);
    if (p && zoom === 1 && Math.abs(e.clientX - p.x) > 50 && images.length > 1) go(e.clientX < p.x ? 1 : -1);
  };
  const toggleZoomAt = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setZoom(2.5);
    setPan({ x: (r.width / 2 - (e.clientX - r.left)) * 1.5, y: (r.height / 2 - (e.clientY - r.top)) * 1.5 });
  };

  const btn = "grid h-11 min-w-11 place-items-center rounded-full bg-white/15 px-3 text-white backdrop-blur transition hover:bg-white/25";
  const half = THICK / 2;
  const face = "absolute inset-0 overflow-hidden rounded-[6px] [backface-visibility:hidden]";
  const edge = (u: string): React.CSSProperties => ({
    backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url("${src(u)}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(ellipse_at_center,#2a2a2e_0%,#050505_75%)]" role="dialog" aria-label={`Fotos de ${alt}`}>
      {/* Barra superior */}
      <div className="relative z-10 flex items-center justify-between p-3 text-white">
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums">
          {mode === "360" ? "Vista 360°" : `${i + 1} / ${images.length}`}
        </span>
        <div className="flex gap-2">
          <div className="flex rounded-full bg-white/15 p-1 backdrop-blur">
            {([...(frames ? (["360"] as const) : []), "3d", "zoom"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className={`h-9 rounded-full px-3.5 text-sm font-bold text-white transition ${mode === m ? "bg-[#25D366] !text-stone-950" : ""}`}
              >
                {m === "360" ? "360°" : m === "3d" ? "3D" : "🔍"}
              </button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className={`${btn} text-2xl`}>
            ×
          </button>
        </div>
      </div>

      {/* Escena */}
      <div className="relative flex-1">
        {mode === "360" && frames ? (
          <div className="absolute inset-0 grid place-items-center">
            <Spin360 frames={frames} alt={alt} fullscreen className="aspect-square w-[min(calc(100vw-24px),calc(100dvh-190px))] rounded-2xl" />
          </div>
        ) : mode === "3d" ? (
          <div
            ref={stage}
            className="absolute inset-0 grid cursor-grab touch-none select-none place-items-center active:cursor-grabbing"
            style={{ perspective: "1100px" }}
            onPointerDown={down3d}
            onPointerMove={move3d}
            onPointerUp={up3d}
            onPointerCancel={up3d}
          >
            <div className="relative" style={{ width: size, height: size }}>
              {/* sombra en el piso */}
              <div
                ref={shadow}
                className="pointer-events-none absolute left-[10%] right-[10%] h-8 rounded-[50%] bg-black/60 blur-xl"
                style={{ top: size + 28 }}
              />
              <div ref={obj} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {/* frente */}
                <div className={face} style={{ transform: `translateZ(${half}px)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src(images[i])} alt={`${alt} – foto ${i + 1}`} draggable={false} className="h-full w-full object-cover" />
                  <div ref={shine} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
                </div>
                {/* atrás: la siguiente foto */}
                <div className={face} style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src(next)} alt="" draggable={false} className="h-full w-full object-cover" />
                </div>
                {/* bordes (grosor) */}
                <div className="absolute top-0" style={{ ...edge(images[i]), width: THICK, height: size, left: size / 2 - half, transform: `rotateY(90deg) translateZ(${size / 2}px)` }} />
                <div className="absolute top-0" style={{ ...edge(images[i]), width: THICK, height: size, left: size / 2 - half, transform: `rotateY(-90deg) translateZ(${size / 2}px)` }} />
                <div className="absolute left-0" style={{ ...edge(images[i]), width: size, height: THICK, top: size / 2 - half, transform: `rotateX(90deg) translateZ(${size / 2}px)` }} />
                <div className="absolute left-0" style={{ ...edge(images[i]), width: size, height: THICK, top: size / 2 - half, transform: `rotateX(-90deg) translateZ(${size / 2}px)` }} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0 grid touch-none select-none place-items-center overflow-hidden"
            onPointerDown={downZoom}
            onPointerMove={moveZoom}
            onPointerUp={upZoom}
            onDoubleClick={toggleZoomAt}
          >
            <div
              className={panning ? "" : "transition-transform duration-200"}
              style={{ width: size, height: size, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(images[i])} alt={`${alt} – foto ${i + 1}`} draggable={false} className="h-full w-full rounded-xl object-contain" />
            </div>
          </div>
        )}

        {images.length > 1 && mode !== "360" && (
          <>
            <button onClick={() => go(-1)} aria-label="Foto anterior" className={`${btn} absolute left-3 top-1/2 z-10 -translate-y-1/2 text-2xl`}>
              ‹
            </button>
            <button onClick={() => go(1)} aria-label="Foto siguiente" className={`${btn} absolute right-3 top-1/2 z-10 -translate-y-1/2 text-2xl`}>
              ›
            </button>
          </>
        )}

        {hint && mode === "3d" && !frames && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <span className="animate-pulse rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">👆 Gira con el dedo</span>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      <div className="relative z-10 flex justify-center gap-2 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))]">
        {images.map((u, n) => (
          <button
            key={u}
            onClick={() => {
              setI(n);
              if (mode === "360") setMode("3d");
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            aria-label={`Ver foto ${n + 1}`}
            className={`h-12 w-12 overflow-hidden rounded-lg ring-2 transition ${n === i && mode !== "360" ? "ring-[#25D366]" : "opacity-50 ring-transparent"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(u)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
