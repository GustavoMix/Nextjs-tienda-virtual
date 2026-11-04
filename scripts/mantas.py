# Genera ilustraciones SVG de mantas de ejemplo (3 vistas por manta)
import math, os, sys


def stars(n=26, seed=3, col="#fff"):
    import random; r = random.Random(seed); s = ""
    for _ in range(n):
        x, y, rad = r.uniform(0,120), r.uniform(0,120), r.uniform(.7,2.2)
        s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{col}" opacity="{r.uniform(.5,1):.2f}"/>'
    return s

def star5(cx, cy, R, col):
    pts = []
    for i in range(10):
        a = -math.pi/2 + i*math.pi/5; rr = R if i%2==0 else R*.45
        pts.append(f"{cx+rr*math.cos(a):.1f},{cy+rr*math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{col}"/>'

def flake(cx, cy, R, col):
    s = ""
    for i in range(3):
        a = i*math.pi/3
        s += f'<line x1="{cx-R*math.cos(a):.1f}" y1="{cy-R*math.sin(a):.1f}" x2="{cx+R*math.cos(a):.1f}" y2="{cy+R*math.sin(a):.1f}" stroke="{col}" stroke-width="2.4" stroke-linecap="round"/>'
    return s + f'<circle cx="{cx}" cy="{cy}" r="2.2" fill="{col}"/>'

def pad(cx, cy, col, acc):
    return (f'<rect x="{cx-16}" y="{cy-9}" width="32" height="18" rx="9" fill="{col}"/>'
            f'<rect x="{cx-11}" y="{cy-1.5}" width="8" height="3" fill="{acc}"/><rect x="{cx-8.5}" y="{cy-4}" width="3" height="8" fill="{acc}"/>'
            f'<circle cx="{cx+7}" cy="{cy-2.5}" r="2" fill="{acc}"/><circle cx="{cx+11}" cy="{cy+1.5}" r="2" fill="{acc}"/>')

def cat(cx, cy, col, eye):
    return (f'<polygon points="{cx-12},{cy-4} {cx-10},{cy-17} {cx-2},{cy-9}" fill="{col}"/>'
            f'<polygon points="{cx+12},{cy-4} {cx+10},{cy-17} {cx+2},{cy-9}" fill="{col}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="12" fill="{col}"/>'
            f'<circle cx="{cx-4.5}" cy="{cy-1}" r="1.8" fill="{eye}"/><circle cx="{cx+4.5}" cy="{cy-1}" r="1.8" fill="{eye}"/>'
            f'<polygon points="{cx-2},{cy+3} {cx+2},{cy+3} {cx},{cy+5}" fill="{eye}"/>')

def ball(cx, cy, R):
    pts = " ".join(f"{cx+R*.42*math.cos(-math.pi/2+i*2*math.pi/5):.1f},{cy+R*.42*math.sin(-math.pi/2+i*2*math.pi/5):.1f}" for i in range(5))
    return f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="#fff"/><polygon points="{pts}" fill="#1c1c1c"/>'

THEMES = {
  "galaxia": dict(bg="#141a46", tile=lambda: stars(30,7) + star5(30,40,7,"#ffd84a") + star5(90,95,5,"#ffd84a") +
      '<circle cx="80" cy="30" r="11" fill="#e96b8a"/><ellipse cx="80" cy="30" rx="18" ry="4" fill="none" stroke="#f6b3c4" stroke-width="2"/>' +
      '<circle cx="25" cy="95" r="7" fill="#4fc3f7"/>', fringe="#2a3270"),
  "navidad": dict(bg="#b3202c", tile=lambda: '<rect y="0" width="120" height="10" fill="#1f6b3a"/><rect y="60" width="120" height="10" fill="#1f6b3a"/>' +
      flake(30,35,10,"#fff") + flake(90,35,7,"#fff") + flake(60,95,10,"#fff") + star5(15,95,5,"#ffd84a") + star5(105,95,5,"#ffd84a"), fringe="#7d1520"),
  "gamer": dict(bg="#3b1d6e", tile=lambda: pad(32,32,"#7c4dff","#3b1d6e") + pad(90,90,"#00e5ff","#3b1d6e") +
      '<text x="80" y="40" font-family="monospace" font-weight="bold" font-size="13" fill="#ff4fa3">A</text><text x="22" y="98" font-family="monospace" font-weight="bold" font-size="13" fill="#ffd84a">B</text>', fringe="#26114a"),
  "gatitos": dict(bg="#f6c9d6", tile=lambda: cat(32,38,"#fff","#5b3b45") + cat(90,96,"#f39c6b","#5b3b45") +
      '<circle cx="88" cy="30" r="3" fill="#e87a9a"/><circle cx="28" cy="95" r="3" fill="#e87a9a"/>', fringe="#e7a3b8"),
  "futbol": dict(bg="#2e8b3e", tile=lambda: '<rect x="0" width="60" height="120" fill="#27793a"/>' + ball(30,32,11) + ball(90,92,11) +
      '<line x1="0" y1="60" x2="120" y2="60" stroke="#fff" stroke-width="2" opacity=".7"/>', fringe="#1e5f2b"),
  "escocesa": dict(bg="#a3161a", tile=lambda: '<rect x="20" width="30" height="120" fill="#111" opacity=".55"/><rect y="20" width="120" height="30" fill="#111" opacity=".55"/>'
      '<rect x="80" width="6" height="120" fill="#f2c94c" opacity=".8"/><rect y="80" width="120" height="6" fill="#f2c94c" opacity=".8"/>'
      '<rect x="100" width="3" height="120" fill="#fff" opacity=".6"/><rect y="100" width="120" height="3" fill="#fff" opacity=".6"/>', fringe="#6e0e11"),
}

def pattern(pid, t, scale):
    return (f'<pattern id="{pid}" width="{120*scale}" height="{120*scale}" patternUnits="userSpaceOnUse">'
            f'<g transform="scale({scale})"><rect width="120" height="120" fill="{t["bg"]}"/>{t["tile"]()}</g></pattern>')

TEX = ('<pattern id="tex" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="#000" stroke-width=".6" opacity=".12"/></pattern>'
       '<linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>')

def svg(body, defs, bg):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs>{TEX}{defs}</defs><rect width="800" height="800" fill="{bg}"/>{body}</svg>'

def fringe(x0, x1, y, col, down=True):
    s = ""; x = x0
    while x <= x1:
        s += f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y + (22 if down else -22)}" stroke="{col}" stroke-width="4" stroke-linecap="round"/>'; x += 12
    return s

def main(out):
  os.makedirs(out, exist_ok=True)
  for name, t in THEMES.items():
      # 1) Manta extendida sobre una cama/sofá
      d = pattern("p", t, 1.6)
      body = ('<rect x="0" y="600" width="800" height="200" fill="#6b4f3a"/>'
              '<path d="M90 110 Q400 80 710 110 L730 640 Q400 680 70 640 Z" fill="url(#p)"/>'
              '<path d="M90 110 Q400 80 710 110 L730 640 Q400 680 70 640 Z" fill="url(#tex)"/>'
              '<path d="M90 110 Q400 80 710 110 L730 640 Q400 680 70 640 Z" fill="url(#shade)"/>'
              '<path d="M260 100 Q280 380 240 655" stroke="#000" stroke-opacity=".12" stroke-width="18" fill="none"/>'
              '<path d="M540 98 Q520 380 560 660" stroke="#000" stroke-opacity=".10" stroke-width="18" fill="none"/>'
              + fringe(80, 720, 645, t["fringe"]))
      open(f"{out}/manta-{name}-1.svg","w").write(svg(body, d, "#e9e1d6"))
      # 2) Manta doblada
      d = pattern("p", t, 1.2)
      stack = ""
      for i,(y,h) in enumerate([(470,90),(380,90),(290,90)]):
          stack += (f'<rect x="170" y="{y}" width="460" height="{h}" rx="34" fill="url(#p)"/>'
                    f'<rect x="170" y="{y}" width="460" height="{h}" rx="34" fill="url(#tex)"/>'
                    f'<rect x="170" y="{y}" width="460" height="{h}" rx="34" fill="url(#shade)"/>'
                    f'<path d="M190 {y+h-6} Q400 {y+h+6} 610 {y+h-6}" stroke="#000" stroke-opacity=".25" stroke-width="6" fill="none"/>')
      body = ('<ellipse cx="400" cy="575" rx="290" ry="30" fill="#000" opacity=".18"/>' + stack)
      open(f"{out}/manta-{name}-2.svg","w").write(svg(body, d, "#d9cfc2"))
      # 3) Detalle de la tela
      d = pattern("p", t, 3.2)
      body = ('<rect width="800" height="800" fill="url(#p)"/><rect width="800" height="800" fill="url(#tex)"/>'
              '<rect width="800" height="800" fill="url(#shade)"/>' + fringe(0, 800, 800, t["fringe"], down=False))
      open(f"{out}/manta-{name}-3.svg","w").write(svg(body, d, t["bg"]))
  print("ok")

if __name__ == "__main__":
  main(sys.argv[1])
