"use client";

import { useEffect, useRef, useState } from "react";
import { src } from "./ui";

type Props = {
  frames: string[]; // fotos tomadas girando alrededor del producto, en orden
  alt: string;
  className?: string;
  fullscreen?: boolean; // en pantalla completa el dedo no hace scroll
};

// Vista 360°: al deslizar el dedo pasa de una foto a la siguiente con un fundido rápido,
// así parece que el producto gira. Si no se toca, gira solo. También responde al giroscopio.
export default function Spin360({ frames, alt, className = "", fullscreen = false }: Props) {
  const n = frames.length;
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [touched, setTouched] = useState(false);
  const st = useRef({ pos: 0, vel: 0, dragging: false, lastX: 0, idleSince: 0, gyro: 0, shown: 0 });

  // Fotos que ya estaban en caché cargan antes de que React escuche onLoad: contarlas
  useEffect(() => {
    const done = imgs.current.filter((img) => img?.complete).length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (done) setLoaded((x) => Math.max(x, done));
  }, []);

  // Giroscopio: inclinar el celular a los lados gira el producto
  useEffect(() => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      st.current.gyro = (Math.max(-40, Math.min(40, e.gamma)) / 40) * (n / 4);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [n]);

  // Animación: inercia + giro automático + cambio de foto
  useEffect(() => {
    let raf = 0;
    st.current.idleSince = performance.now();
    const frame = (now: number) => {
      const s = st.current;
      if (!s.dragging) {
        s.pos += s.vel;
        s.vel *= 0.93;
        if (Math.abs(s.vel) < 0.01 && now - s.idleSince > 1500) s.pos += n / 480; // ~1 vuelta cada 8 s
      }
      // Muestra un solo ángulo (sin efecto fantasma). El nuevo aparece con un fundido rápido
      // encima del anterior.
      const idx = ((Math.round(s.pos + s.gyro) % n) + n) % n;
      if (idx !== s.shown) {
        const prev = s.shown;
        imgs.current.forEach((img, j) => {
          if (!img) return;
          if (j === idx) {
            img.style.zIndex = "2";
            img.style.opacity = "1";
          } else if (j === prev) {
            img.style.zIndex = "1";
            img.style.opacity = "1";
          } else {
            img.style.zIndex = "0";
            img.style.opacity = "0";
          }
        });
        s.shown = idx;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  const perPx = () => n / ((box.current?.clientWidth ?? 300) * 0.9); // ancho completo ≈ 1 vuelta

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    Object.assign(st.current, { dragging: true, lastX: e.clientX, vel: 0 });
    setTouched(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.pos -= dx * perPx();
    s.vel = -dx * perPx();
  };
  const onUp = () => {
    st.current.dragging = false;
    st.current.idleSince = performance.now();
  };

  const ready = loaded >= n;

  return (
    <div
      ref={box}
      className={`relative cursor-ew-resize select-none overflow-hidden ${fullscreen ? "touch-none" : "touch-pan-y"} ${className}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {frames.map((u, j) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={u}
          ref={(el) => {
            imgs.current[j] = el;
          }}
          src={src(u)}
          alt={j === 0 ? `${alt} – vista 360°` : ""}
          draggable={false}
          onLoad={() => setLoaded((x) => Math.min(n, x + 1))}
          onError={() => setLoaded((x) => Math.min(n, x + 1))}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-75 ease-out"
          style={{ opacity: j === 0 ? 1 : 0, zIndex: j === 0 ? 2 : 0 }}
        />
      ))}

      {!ready && (
        <div className="absolute inset-x-0 bottom-3 z-10 mx-auto w-40 overflow-hidden rounded-full bg-black/40">
          <div className="h-1.5 bg-[#25D366] transition-all" style={{ width: `${(loaded / n) * 100}%` }} />
        </div>
      )}

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
        360°
      </span>
      {!touched && ready && (
        <span className="pointer-events-none absolute inset-x-0 top-1/2 z-10 mx-auto w-fit -translate-y-1/2 animate-pulse rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">
          ↔ Desliza para girar
        </span>
      )}
    </div>
  );
}
