#!/usr/bin/env python3
"""Baut die Vereinsgebiete für die Deutschlandkarte und schreibt <projekt>/karte.js.

Jeder Landkreis gehört dem Verein, dessen Stadt am nächsten liegt. Die Gebiete folgen also echten Kreisgrenzen.
Ausgabe (Koordinaten im 1080er-Raster, Karte zentriert in der Box BOX):
  window.MAP = { outline, kreise: [path], teams: [{i, name, abbr, short, c1, c2, color, path, x, y, n}],
                 adj: {i: [j...]}, box }
Aufruf: python3 karte.py <projekt> [--box x,y,w,h]
"""
import json, math, os, sys
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

here = os.path.dirname(os.path.abspath(__file__))
proj = sys.argv[1]
box = [70, 380, 940, 1180]
if "--box" in sys.argv:
    box = [float(v) for v in sys.argv[sys.argv.index("--box") + 1].split(",")]

kreise = json.load(open(os.path.join(here, "../data/kreise.geo.json")))["features"]
vereine = json.load(open(os.path.join(here, "../data/vereine.json")))

K = math.cos(math.radians(51.2))
geoms = [shape(f["geometry"]).buffer(0) for f in kreise]
allg = unary_union(geoms)
minx, miny, maxx, maxy = allg.bounds
W, H = (maxx - minx) * K, (maxy - miny)
s = min(box[2] / W, box[3] / H)
ox = box[0] + (box[2] - W * s) / 2
oy = box[1] + (box[3] - H * s) / 2


def P(lon, lat):
    return ox + (lon - minx) * K * s, oy + (maxy - lat) * s


def path(g, tol=0.012):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == "Polygon" else list(g.geoms)
    out = []
    for p in polys:
        if p.area < 0.0004:
            continue
        # winzige Löcher weglassen, sonst entstehen weiße Sprenkel
        rings = [p.exterior] + [r for r in p.interiors if abs(__import__("shapely").geometry.Polygon(r).area) > 0.02]
        for ring in rings:
            pts = [P(x, y) for x, y in ring.coords]
            out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(out)


# Kreise den Vereinen zuordnen (Distanz in km-ähnlichen Einheiten)
owner = []
for g in geoms:
    c = g.representative_point()
    best = min(range(len(vereine)), key=lambda i: ((vereine[i][3] - c.x) * K) ** 2 + (vereine[i][4] - c.y) ** 2)
    owner.append(best)
# Vereine, deren Stadt in einem Kreis liegt, bekommen diesen Kreis sicher.
# Reihenfolge in vereine.json = Priorität (größerer Verein zuerst gewinnt die Stadt).
claimed = set()
for i, v in enumerate(vereine):
    pt = Point(v[3], v[4])
    for k, g in enumerate(geoms):
        if g.contains(pt) and k not in claimed:
            owner[k] = i
            claimed.add(k)
            break

teams = []
idx = {}
for i, v in enumerate(vereine):
    gs = [geoms[k] for k in range(len(geoms)) if owner[k] == i]
    if not gs:
        continue
    u = unary_union(gs).buffer(0.0005).buffer(-0.0005)
    idx[i] = len(teams)
    x, y = P(v[3], v[4])
    teams.append({"name": v[0], "abbr": v[1], "short": v[2], "c1": v[5], "c2": v[6],
                  "geom": u, "x": round(x, 1), "y": round(y, 1), "n": len(gs)})

# Nachbarn
adj = {i: [] for i in range(len(teams))}
for a in range(len(teams)):
    for b in range(a + 1, len(teams)):
        if teams[a]["geom"].buffer(0.01).intersects(teams[b]["geom"]):
            adj[a].append(b); adj[b].append(a)

# Kräftige Pastellfarben, Nachbarn unterschiedlich (gierige Färbung)
PAL = ["#ff6b8b", "#b57cf2", "#5aa9f0", "#3fd0c0", "#6fd36b", "#f7d046", "#ff9a4d", "#f26a5a", "#8d8cf2", "#3cc5e8", "#a3d94a", "#f78fd0"]
order = sorted(range(len(teams)), key=lambda i: -len(adj[i]))
col = {}
for i in order:
    used = {col.get(j) for j in adj[i]}
    for k, c in enumerate(PAL[(i * 5) % len(PAL):] + PAL[:(i * 5) % len(PAL)]):
        if c not in used:
            col[i] = c; break
    else:
        col[i] = PAL[i % len(PAL)]

out = {
    "box": box,
    "outline": path(allg, 0.006),
    "kreise": [path(g, 0.01) for g in geoms],
    "teams": [{"i": i, "name": t["name"], "abbr": t["abbr"], "short": t["short"], "c1": t["c1"], "c2": t["c2"],
               "color": col[i], "path": path(t["geom"]), "x": t["x"], "y": t["y"], "n": t["n"]} for i, t in enumerate(teams)],
    "adj": adj,
}
with open(os.path.join(proj, "karte.js"), "w", encoding="utf-8") as f:
    f.write("// automatisch erzeugt von karte.py\nwindow.MAP = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(f"{len(teams)} Vereine mit Gebiet, {os.path.getsize(os.path.join(proj, 'karte.js')) // 1024} KB")
print("ohne Gebiet:", [v[0] for i, v in enumerate(vereine) if i not in idx])
for i, t in enumerate(teams):
    print(i, t["short"], t["n"], [teams[j]["short"] for j in adj[i]][:8])
