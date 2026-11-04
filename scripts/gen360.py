# Genera 24 fotos "360°" de una manta doblada girando (para la demo)
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from mantas import THEMES, TEX

def frames(name, out, n=24):
    t = THEMES[name]
    A, B, H = 1.05, 0.72, 0.36           # medio ancho, medio fondo, medio alto
    pitch = math.radians(28); S = 315; cx, cy = 400, 390
    for k in range(n):
        yaw = 2 * math.pi * k / n
        def rot(p):
            x, y, z = p
            x, z = x*math.cos(yaw) + z*math.sin(yaw), -x*math.sin(yaw) + z*math.cos(yaw)
            y, z = y*math.cos(pitch) - z*math.sin(pitch), y*math.sin(pitch) + z*math.cos(pitch)
            return x, y, z
        def proj(p):
            x, y, z = rot(p); return (cx + x*S, cy - y*S)
        # caras: (esquina0, eje u, eje v, normal, tamaño u, tamaño v, tipo)
        faces = [
            ((-A, H, B), (2*A,0,0), (0,0,-2*B), (0,1,0), 2*A, 2*B, "top"),
            ((-A, H, B), (2*A,0,0), (0,-2*H,0), (0,0,1), 2*A, 2*H, "side"),
            ((A, H, -B), (-2*A,0,0), (0,-2*H,0), (0,0,-1), 2*A, 2*H, "side"),
            ((A, H, B), (0,0,-2*B), (0,-2*H,0), (1,0,0), 2*B, 2*H, "fold"),
            ((-A, H, -B), (0,0,2*B), (0,-2*H,0), (-1,0,0), 2*B, 2*H, "fold"),
        ]
        light = (-0.4, 0.8, 0.45)
        body = ""
        vis = []
        for f in faces:
            nx, ny, nz = rot(f[3])
            if nz > 0.001: vis.append((nz, f, (nx, ny, nz)))
        for nz, (p0, u, v, nrm, W, Hh, kind), rn in sorted(vis, key=lambda x: x[0]):
            P0 = proj(p0)
            P1 = proj((p0[0]+u[0], p0[1]+u[1], p0[2]+u[2]))
            P3 = proj((p0[0]+v[0], p0[1]+v[1], p0[2]+v[2]))
            w, h = W*200, Hh*200
            a, b = (P1[0]-P0[0])/w, (P1[1]-P0[1])/w
            c, d = (P3[0]-P0[0])/h, (P3[1]-P0[1])/h
            lum = max(0, rn[0]*light[0] + rn[1]*light[1] + rn[2]*light[2])
            dark = 0.55 - 0.5*lum
            g = f'<g transform="matrix({a:.4f} {b:.4f} {c:.4f} {d:.4f} {P0[0]:.1f} {P0[1]:.1f})">'
            g += f'<rect width="{w:.0f}" height="{h:.0f}" rx="10" fill="url(#p)"/><rect width="{w:.0f}" height="{h:.0f}" rx="10" fill="url(#tex)"/>'
            if kind != "top":
                for j in (1, 2):
                    y = h*j/3
                    g += f'<path d="M0 {y:.0f} Q{w/2:.0f} {y+8:.0f} {w:.0f} {y:.0f}" stroke="#000" stroke-opacity=".35" stroke-width="5" fill="none"/>'
                if kind == "fold":
                    g += f'<rect width="{w:.0f}" height="{h:.0f}" rx="10" fill="url(#roll)"/>'
            g += f'<rect width="{w:.0f}" height="{h:.0f}" rx="10" fill="#000" opacity="{max(0,dark):.2f}"/></g>'
            body += g
        defs = (f'<pattern id="p" width="192" height="192" patternUnits="userSpaceOnUse"><g transform="scale(1.6)"><rect width="120" height="120" fill="{t["bg"]}"/>{t["tile"]()}</g></pattern>'
                '<linearGradient id="roll" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>'
                '<radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#f4efe8"/><stop offset="1" stop-color="#d8cec1"/></radialGradient>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs>{TEX}{defs}</defs>'
               f'<rect width="800" height="800" fill="url(#bg)"/><ellipse cx="400" cy="{cy+215}" rx="360" ry="60" fill="#000" opacity=".18"/>'
               f'{body}</svg>')
        open(f"{out}/{name}-360-{k:02d}.svg", "w").write(svg)

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for nm in sys.argv[2:]: frames(nm, out)
print("ok")
