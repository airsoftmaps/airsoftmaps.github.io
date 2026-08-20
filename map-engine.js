/* ==========================================================================
   AIRSOFT MAPS — map-engine.js
   Obecný engine pro vykreslení 2D půdorysu a 3D izometrického pohledu
   hřiště z jedněch dat (viz např. dalov.html -> FIELD_DATA).
   Pro nové hřiště: zkopíruj dalov.html, přepiš FIELD_DATA a obrázek/y.
   ========================================================================== */

const MapEngine = (function () {

  const SVG_NS = "http://www.w3.org/2000/svg";

  const FLAT = { originX: 70, originY: 60, colW: 88, rowH: 98 };
  const ISO  = { tileW: 108, tileH: 62, heightScale: 42 };

  function el(name, attrs, parent) {
    const e = document.createElementNS(SVG_NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------- 2D projekce ---------------- */

  function flatPoint(col, row) {
    return { x: FLAT.originX + col * FLAT.colW, y: FLAT.originY + row * FLAT.rowH };
  }

  /* ---------------- 3D (izometrická) projekce ---------------- */

  function isoPoint(col, row, height) {
    const x = (col - row) * (ISO.tileW / 2);
    const y = (col + row) * (ISO.tileH / 2) - (height || 0) * ISO.heightScale;
    return { x, y };
  }

  function ptsToStr(pts) {
    return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  /* ======================================================================
     RENDER 2D
     ====================================================================== */

  function render2D(svg, data, lang, onBuildingClick, activeId) {
    svg.innerHTML = "";
    svg.setAttribute("viewBox", data.viewBoxFlat || "0 0 1360 800");

    const gGround = el("g", { class: "layer-ground" }, svg);
    const gRoads  = el("g", { class: "layer-roads" }, svg);
    const gBuild  = el("g", { class: "layer-buildings" }, svg);

    // hranice hřiště
    if (data.boundary) {
      const pts = data.boundary.map(([c, r]) => flatPoint(c, r));
      el("polygon", {
        points: ptsToStr(pts),
        fill: "rgba(255,255,255,.015)",
        stroke: "#eef1f0",
        "stroke-width": 3,
        "stroke-linejoin": "round"
      }, gGround);
    }

    // cesty
    (data.roads || []).forEach(road => {
      const pts = road.points.map(([c, r]) => flatPoint(c, r));
      el("polyline", {
        points: ptsToStr(pts),
        fill: "none",
        stroke: "#3a3f47",
        "stroke-width": 10,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, gRoads);
      el("polyline", {
        points: ptsToStr(pts),
        fill: "none",
        stroke: "#1a1c1f",
        "stroke-width": 4,
        "stroke-dasharray": "2 10",
        "stroke-linecap": "round"
      }, gRoads);
    });

    // vstupní šipka
    if (data.entrance) {
      const p = flatPoint(data.entrance.col, data.entrance.row);
      const g = el("g", { transform: `translate(${p.x},${p.y}) rotate(${data.entrance.angle || 0})` }, gGround);
      el("path", { d: "M-14,0 L10,0 M2,-8 L10,0 L2,8", stroke: "#ff7a1a", "stroke-width": 3, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    }

    // budovy
    data.buildings.forEach(b => {
      const [c1, r1, c2, r2] = b.rect;
      const p1 = flatPoint(c1, r1);
      const p2 = flatPoint(c2, r2);
      const w = p2.x - p1.x, h = p2.y - p1.y;
      const cx = p1.x + w / 2, cy = p1.y + h / 2;

      const g = el("g", {
        class: "am-building",
        "data-id": b.id,
        transform: b.rotate ? `rotate(${b.rotate} ${cx} ${cy})` : ""
      }, gBuild);

      const isActive = b.id === activeId;

      el("rect", {
        x: p1.x, y: p1.y, width: w, height: h,
        fill: isActive ? "rgba(255,122,26,.28)" : "rgba(238,241,240,.06)",
        stroke: isActive ? "#ff7a1a" : "#eef1f0",
        "stroke-width": isActive ? 3 : 2,
        rx: 2
      }, g);

      el("text", {
        x: cx, y: cy + 5,
        "text-anchor": "middle",
        "font-family": "Anton, sans-serif",
        "font-size": Math.max(11, Math.min(20, w / (b.code.length * 1.3))),
        fill: isActive ? "#ff7a1a" : "#eef1f0",
        style: "pointer-events:none;"
      }, g).textContent = b.code;

      g.style.cursor = "pointer";
      g.addEventListener("click", () => onBuildingClick(b.id));
    });
  }

  /* ======================================================================
     RENDER 3D (izometrické bloky + stromy)
     ====================================================================== */

  function buildBlock(g, c1, r1, c2, r2, height, id, isActive, onClick) {
    const AA = { c: c1, r: r1 }, BA = { c: c2, r: r1 }, BB = { c: c2, r: r2 }, AB = { c: c1, r: r2 };

    const topAA = isoPoint(AA.c, AA.r, height), topBA = isoPoint(BA.c, BA.r, height);
    const topBB = isoPoint(BB.c, BB.r, height), topAB = isoPoint(AB.c, AB.r, height);
    const baseBA = isoPoint(BA.c, BA.r, 0), baseBB = isoPoint(BB.c, BB.r, 0), baseAB = isoPoint(AB.c, AB.r, 0);

    const topColor    = isActive ? "#ffb066" : "#4a5058";
    const rightColor  = isActive ? "#e0812a" : "#2f333a";
    const frontColor  = isActive ? "#b5631a" : "#1c1f24";
    const strokeColor = isActive ? "#ff7a1a" : "#0a0b0d";

    const gb = el("g", { class: "am-building3d", "data-id": id, style: "cursor:pointer" }, g);

    el("polygon", { points: ptsToStr([topAA, topBA, topBB, topAB]), fill: topColor, stroke: strokeColor, "stroke-width": 1 }, gb);
    el("polygon", { points: ptsToStr([topBA, topBB, baseBB, baseBA]), fill: rightColor, stroke: strokeColor, "stroke-width": 1 }, gb);
    el("polygon", { points: ptsToStr([topBB, topAB, baseAB, baseBB]), fill: frontColor, stroke: strokeColor, "stroke-width": 1 }, gb);

    gb.addEventListener("click", () => onClick(id));
    return gb;
  }

  function render3D(svg, data, lang, onBuildingClick, activeId) {
    svg.innerHTML = "";

    const gGround = el("g", { class: "layer-ground" }, svg);
    const gTrees1 = el("g", { class: "layer-trees-back" }, svg);
    const gBuild  = el("g", { class: "layer-buildings" }, svg);
    const gTrees2 = el("g", { class: "layer-trees-front" }, svg);
    const gLabels = el("g", { class: "layer-labels" }, svg);

    if (data.boundary) {
      const pts = data.boundary.map(([c, r]) => isoPoint(c, r, 0));
      el("polygon", {
        points: ptsToStr(pts),
        fill: "none",
        stroke: "rgba(238,241,240,.18)",
        "stroke-width": 1.4,
        "stroke-dasharray": "4 5"
      }, gGround);
    }

    (data.roads || []).forEach(road => {
      const pts = road.points.map(([c, r]) => isoPoint(c, r, 0));
      el("polyline", { points: ptsToStr(pts), fill: "none", stroke: "#33383f", "stroke-width": 3 }, gGround);
    });

    (data.trees || []).forEach(([c, r], i) => {
      const layer = (i % 2 === 0) ? gTrees1 : gTrees2;
      const base = isoPoint(c, r, 0);
      const topH = 0.55 + (i % 3) * 0.12;
      const top = isoPoint(c, r, topH);
      const gt = el("g", {}, layer);
      el("line", { x1: base.x, y1: base.y, x2: top.x, y2: top.y, stroke: "#4a3624", "stroke-width": 2 }, gt);
      el("circle", { cx: top.x, cy: top.y - 6, r: 9 + (i % 3) * 1.5, fill: "#2f6b3f", opacity: .9 }, gt);
      el("circle", { cx: top.x - 4, cy: top.y - 10, r: 6, fill: "#3d8a52", opacity: .85 }, gt);
    });

    const sorted = [...data.buildings].sort((a, b) => {
      const ca = (a.rect[0] + a.rect[2] + a.rect[1] + a.rect[3]);
      const cb = (b.rect[0] + b.rect[2] + b.rect[1] + b.rect[3]);
      return ca - cb;
    });

    sorted.forEach(b => {
      const [c1, r1, c2, r2] = b.rect;
      const isActive = b.id === activeId;
      buildBlock(gBuild, c1, r1, c2, r2, b.height || 0.9, b.id, isActive, onBuildingClick);

      const topCenter = isoPoint((c1 + c2) / 2, (r1 + r2) / 2, b.height || 0.9);
      el("text", {
        x: topCenter.x, y: topCenter.y - 6,
        "text-anchor": "middle",
        "font-family": "Anton, sans-serif",
        "font-size": 12,
        fill: isActive ? "#ff7a1a" : "#eef1f0",
        style: "pointer-events:none;"
      }, gLabels).textContent = b.code;
    });

    const bbox = svg.getBBox();
    const pad = 40;
    svg.setAttribute("viewBox", `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`);
  }

  /* ======================================================================
     Sidebar list
     ====================================================================== */

  function renderList(listEl, data, lang, activeId, onSelect) {
    listEl.innerHTML = "";
    data.buildings.forEach(b => {
      const name = lang === "en" ? b.nameEn : b.name;
      const item = document.createElement("div");
      item.className = "am-poi" + (b.id === activeId ? " active" : "");
      item.innerHTML = `<span class="code">${b.code}</span><span>${name}</span>`;
      item.addEventListener("click", () => onSelect(b.id));
      listEl.appendChild(item);
    });
  }

  /* ======================================================================
     Public API
     ====================================================================== */

  function init(opts) {
    let mode = "2d";
    let activeId = null;

    function draw() {
      const lang = opts.getLang();
      if (mode === "2d") render2D(opts.svg, opts.data, lang, select, activeId);
      else render3D(opts.svg, opts.data, lang, select, activeId);
      renderList(opts.listEl, opts.data, lang, activeId, select);
    }

    function select(id) {
      activeId = (activeId === id) ? null : id;
      draw();
    }

    opts.mountModeToggle.btn2d.addEventListener("click", () => {
      mode = "2d";
      opts.mountModeToggle.btn2d.classList.add("active");
      opts.mountModeToggle.btn3d.classList.remove("active");
      draw();
    });
    opts.mountModeToggle.btn3d.addEventListener("click", () => {
      mode = "3d";
      opts.mountModeToggle.btn3d.classList.add("active");
      opts.mountModeToggle.btn2d.classList.remove("active");
      draw();
    });

    draw();
    return { redraw: draw };
  }

  return { init };
})();
