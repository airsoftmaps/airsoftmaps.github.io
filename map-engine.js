/* ==========================================================================
   AIRSOFT MAPS — map-engine.js
   2D / 3D mapa
   Zoom / Pan / Rotation
   Mouse + Touch + Stylus přes Pointer Events
   ========================================================================== */

const MapEngine = (() => {

  const SVG_NS = "http://www.w3.org/2000/svg";

     function mapColor(variable, fallback) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();

    return value || fallback;
  }
   
  const FLAT = {
  originX: 70,
  originY: 60,
  colW: 88,
  rowH: 98
};

  const ISO = {
    tileW: 108,
    tileH: 62,
    heightScale: 42
  };

  /*
     Stav "orbitu" 3D pohledu — na rozdíl od dřívější verze se
     rotace NEaplikuje jako plochá SVG transformace nad hotovým
     obrázkem, ale přímo do výpočtu izometrických bodů (isoPoint).
     Díky tomu se model skutečně otáčí kolem svého vlastního středu
     v prostoru, ne kolem náhodného rohu obrazovky.
     Nastavuje se vždy na začátku render3D() pro daný snímek.
  */
  let __orbitDeg = 0;
  let __orbitCenter = { c: 0, r: 0 };

  function computeGridCenter(data) {

    let minC = Infinity, maxC = -Infinity;
    let minR = Infinity, maxR = -Infinity;

    const consider = (c, r) => {
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    };

    (data.boundary || []).forEach(([c, r]) => consider(c, r));

    (data.buildings || []).forEach(b => {
      consider(b.rect[0], b.rect[1]);
      consider(b.rect[2], b.rect[3]);
    });

    (data.walls || []).forEach(w => {
      consider(w.rect[0], w.rect[1]);
      consider(w.rect[2], w.rect[3]);
    });

    if (!Number.isFinite(minC)) {
      return { c: 0, r: 0 };
    }

    return {
      c: (minC + maxC) / 2,
      r: (minR + maxR) / 2
    };
  }

  function el(name, attrs = {}, parent) {

    const node =
      document.createElementNS(SVG_NS, name);

    for (const key in attrs) {
      node.setAttribute(key, attrs[key]);
    }

    if (parent) {
      parent.appendChild(node);
    }

    return node;
  }

  function flatPoint(col, row) {

    return {
      x: FLAT.originX + col * FLAT.colW,
      y: FLAT.originY + row * FLAT.rowH
    };
  }

  function isoPoint(col, row, height = 0) {

    let c = col;
    let r = row;

    if (__orbitDeg) {

      const rad = __orbitDeg * Math.PI / 180;

      const dc = col - __orbitCenter.c;
      const dr = row - __orbitCenter.r;

      c = __orbitCenter.c + dc * Math.cos(rad) - dr * Math.sin(rad);
      r = __orbitCenter.r + dc * Math.sin(rad) + dr * Math.cos(rad);
    }

    return {
      x: (c - r) * (ISO.tileW / 2),
      y:
        (c + r) * (ISO.tileH / 2) -
        height * ISO.heightScale
    };
  }

  function ptsToStr(points) {

    return points
      .map(p =>
        `${p.x.toFixed(1)},${p.y.toFixed(1)}`
      )
      .join(" ");
  }

  function drawPlayerDot(parent, point) {

    const g = el(
      "g",
      {
        class: "am-player-dot",
        "pointer-events": "none"
      },
      parent
    );

    el(
      "circle",
      {
        cx: point.x,
        cy: point.y,
        class: "am-player-pulse",
        r: 10
      },
      g
    );

    el(
      "circle",
      {
        cx: point.x,
        cy: point.y,
        r: 7,
        fill: "#4aa3ff",
        stroke: "#eef1f0",
        "stroke-width": 2
      },
      g
    );
  }

  /* ========================================================================
     2D
     ======================================================================== */

  function render2D(
    container,
    data,
    lang,
    onBuildingClick,
    activeId,
    playerPos
  ) {

    container.innerHTML = "";

    const ground =
      el("g", { class: "layer-ground" }, container);

    const roads =
      el("g", { class: "layer-roads" }, container);

const walls =
      el("g", { class: "layer-walls" }, container);
     
    const buildings =
      el("g", { class: "layer-buildings" }, container);

    if (data.boundary) {

      const points =
        data.boundary.map(([c, r]) =>
          flatPoint(c, r)
        );

      el(
  "polygon",
  {
    points: ptsToStr(points),
    fill: "none",
    stroke: mapColor("--map-outline", "#eef1f0"),
    "stroke-opacity": ".42",
    "stroke-width": 1.4,
    "stroke-dasharray": "4 5",
    "stroke-linejoin": "round"
  },
  ground
);
    }

    (data.roads || []).forEach(road => {

      const points =
        road.points.map(([c, r]) =>
          flatPoint(c, r)
        );

      el(
        "polyline",
        {
          points: ptsToStr(points),
          fill: "none",
          stroke: "var(--map-road)",
          "stroke-width": 10,
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        },
        roads
      );

      el(
        "polyline",
        {
          points: ptsToStr(points),
          fill: "none",
          stroke: "var(--map-road-inner)",
          "stroke-width": 4,
          "stroke-dasharray": "2 10",
          "stroke-linecap": "round"
        },
        roads
      );
    });

     (data.walls || []).forEach(wall => {

      const [c1, r1, c2, r2] = wall.rect;

      const p1 = flatPoint(c1, r1);
      const p2 = flatPoint(c2, r2);

      el(
        "rect",
        {
          x: Math.min(p1.x, p2.x),
          y: Math.min(p1.y, p2.y),
          width: Math.abs(p2.x - p1.x),
          height: Math.abs(p2.y - p1.y),
          fill: wall.color || mapColor("--map-outline", "#eef1f0"),
          opacity: wall.color ? 1 : .55
        },
        walls
      );
    });
    if (data.entrance) {

      const p =
        flatPoint(
          data.entrance.col,
          data.entrance.row
        );

      const g = el(
        "g",
        {
          transform:
            `translate(${p.x},${p.y}) ` +
            `rotate(${data.entrance.angle || 0})`,
          "pointer-events": "none"
        },
        ground
      );

      el(
        "path",
        {
          d: "M-14,0 L10,0 M2,-8 L10,0 L2,8",
          stroke: "#ff7a1a",
          "stroke-width": 3,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        },
        g
      );
    }

    (data.buildings || []).forEach(building => {

      const [c1, r1, c2, r2] =
        building.rect;

      const p1 =
        flatPoint(c1, r1);

      const p2 =
        flatPoint(c2, r2);

      const width =
        p2.x - p1.x;

      const height =
        p2.y - p1.y;

      const cx =
        p1.x + width / 2;

      const cy =
        p1.y + height / 2;

      const active =
        building.id === activeId;

      const group =
        el(
          "g",
          {
            class: "am-building",
            "data-id": building.id,
            transform:
              building.rotate
                ? `rotate(${building.rotate} ${cx} ${cy})`
                : ""
          },
          buildings
        );

      el(
        "rect",
        {
          x: p1.x,
          y: p1.y,
          width,
          height,
          fill:
  active
    ? "var(--accent-dim)"
    : "var(--map-building-fill)",

stroke:
  active
    ? "var(--accent)"
    : "var(--map-outline)",
          "stroke-width":
            active ? 3 : 2,
          rx: 2
        },
        group
      );

      el(
        "text",
        {
          x: cx,
          y: cy + 5,
          "text-anchor": "middle",
          "font-family":
            "Anton, sans-serif",
          "font-size":
            Math.max(
              11,
              Math.min(
                20,
                width /
                (building.code.length * 1.3)
              )
            ),
          fill:
  active
    ? "var(--accent)"
    : "var(--map-text)",
          style:
            "pointer-events:none;"
        },
        group
      ).textContent =
        building.code;

      group.style.cursor = "pointer";

      group.addEventListener(
        "click",
        e => {
          e.stopPropagation();
          onBuildingClick(building.id);
        }
      );
    });

    if (playerPos) {

      drawPlayerDot(
        el(
          "g",
          {
            class: "layer-player"
          },
          container
        ),
        flatPoint(
          playerPos.col,
          playerPos.row
        )
      );
    }
  }

  /* ========================================================================
     3D
     ======================================================================== */

  function rotateGridPoint(c, r, cx, cy, deg) {
    if (!deg) return { c, r };
    const rad = deg * Math.PI / 180;
    const dc = c - cx;
    const dr = r - cy;
    return {
      c: cx + dc * Math.cos(rad) - dr * Math.sin(rad),
      r: cy + dc * Math.sin(rad) + dr * Math.cos(rad)
    };
  }

  function buildBlock(
    parent,
    c1,
    r1,
    c2,
    r2,
    height,
    id,
    active,
    onClick,
    rotateDeg
  ) {
    const cx = (c1 + c2) / 2;
    const cy = (r1 + r2) / 2;
    const AA = rotateGridPoint(c1, r1, cx, cy, rotateDeg);
    const BA = rotateGridPoint(c2, r1, cx, cy, rotateDeg);
    const BB = rotateGridPoint(c2, r2, cx, cy, rotateDeg);
    const AB = rotateGridPoint(c1, r2, cx, cy, rotateDeg);
    const topAA =
      isoPoint(AA.c, AA.r, height);
    const topBA =
      isoPoint(BA.c, BA.r, height);
    const topBB =
      isoPoint(BB.c, BB.r, height);
    const topAB =
      isoPoint(AB.c, AB.r, height);
    const baseBA =
      isoPoint(BA.c, BA.r, 0);
    const baseBB =
      isoPoint(BB.c, BB.r, 0);
    const baseAB =
      isoPoint(AB.c, AB.r, 0);
    const group =
      el(
        "g",
        {
          class: "am-building3d",
          "data-id": id
        },
        parent
      );
    const topColor =
  active ? "var(--accent)" : "var(--map-3d-top)";
const rightColor =
  active ? "var(--accent)" : "var(--map-3d-right)";
const frontColor =
  active ? "var(--accent)" : "var(--map-3d-front)";
const strokeColor =
  active
    ? "var(--accent)"
    : "var(--map-outline)";
    el(
      "polygon",
      {
        points: ptsToStr([
          topAA,
          topBA,
          topBB,
          topAB
        ]),
        fill: topColor,
        stroke: strokeColor,
        "stroke-width": 1
      },
      group
    );
    el(
      "polygon",
      {
        points: ptsToStr([
          topBA,
          topBB,
          baseBB,
          baseBA
        ]),
        fill: rightColor,
        stroke: strokeColor,
        "stroke-width": 1
      },
      group
    );
    el(
      "polygon",
      {
        points: ptsToStr([
          topBB,
          topAB,
          baseAB,
          baseBB
        ]),
        fill: frontColor,
        stroke: strokeColor,
        "stroke-width": 1
      },
      group
    );
    group.style.cursor = "pointer";
    group.addEventListener(
      "click",
      e => {
        e.stopPropagation();
        onClick(id);
      }
    );
    return group;
  }
  function shadeHex(hex, factor) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const sr = Math.round(r * factor);
    const sg = Math.round(g * factor);
    const sb = Math.round(b * factor);
    return `rgb(${sr}, ${sg}, ${sb})`;
  }

  function buildWallBlock(parent, c1, r1, c2, r2, height, color) {

    const AA = { c: c1, r: r1 };
    const BA = { c: c2, r: r1 };
    const BB = { c: c2, r: r2 };
    const AB = { c: c1, r: r2 };

    const topAA = isoPoint(AA.c, AA.r, height);
    const topBA = isoPoint(BA.c, BA.r, height);
    const topBB = isoPoint(BB.c, BB.r, height);
    const topAB = isoPoint(AB.c, AB.r, height);

    const baseBA = isoPoint(BA.c, BA.r, 0);
    const baseBB = isoPoint(BB.c, BB.r, 0);
    const baseAB = isoPoint(AB.c, AB.r, 0);

    const group = el("g", { class: "am-wall3d" }, parent);

    const topColor = color ? color : mapColor("--map-3d-top", "#4a5058");
    const rightColor = color ? shadeHex(color, .72) : mapColor("--map-3d-right", "#2f333a");
    const frontColor = color ? shadeHex(color, .48) : mapColor("--map-3d-front", "#1c1f24");
    const strokeColor = mapColor("--map-outline", "#eef1f0");

    el("polygon", { points: ptsToStr([topAA, topBA, topBB, topAB]), fill: topColor, stroke: strokeColor, "stroke-width": 1 }, group);
    el("polygon", { points: ptsToStr([topBA, topBB, baseBB, baseBA]), fill: rightColor, stroke: strokeColor, "stroke-width": 1 }, group);
    el("polygon", { points: ptsToStr([topBB, topAB, baseAB, baseBB]), fill: frontColor, stroke: strokeColor, "stroke-width": 1 }, group);

    return group;
  }

  function splitWallSegments(wallList) {
    const pieces = [];
    (wallList || []).forEach(wall => {
      const [c1, r1, c2, r2] = wall.rect;
      const isHoriz = (c2 - c1) >= (r2 - r1);
      const len = isHoriz ? (c2 - c1) : (r2 - r1);
      const steps = Math.max(1, Math.ceil(len));
      const step = len / steps;
      for (let i = 0; i < steps; i++) {
        if (isHoriz) {
          pieces.push({
            rect: [c1 + i * step, r1, c1 + (i + 1) * step, r2],
            height: wall.height,
            color: wall.color
          });
        } else {
          pieces.push({
            rect: [c1, r1 + i * step, c2, r1 + (i + 1) * step],
            height: wall.height,
            color: wall.color
          });
        }
      }
    });
    return pieces;
  }

  function render3D(
    container,
    data,
    lang,
    onBuildingClick,
    activeId,
    playerPos,
    orbitDeg
  ) {

    container.innerHTML = "";

    /*
       Nastavíme stav orbitu pro TENTO snímek — všechny izometrické
       body (boundary, cesty, stromy, zdi, budovy, hráč, popisky)
       níže v této funkci pak automaticky počítají s otočením
       kolem skutečného středu modelu.
    */
    __orbitDeg = orbitDeg || 0;
    __orbitCenter = computeGridCenter(data);

    const ground =
      el("g", { class: "layer-ground" }, container);

    const treesBack =
      el(
        "g",
        { class: "layer-trees-back" },
        container
      );

    const structures =
      el(
        "g",
        { class: "layer-structures" },
        container
      );

    const treesFront =
      el(
        "g",
        { class: "layer-trees-front" },
        container
      );

    const labels =
      el(
        "g",
        { class: "layer-labels" },
        container
      );

if (data.boundary) {

      const points =
        data.boundary.map(([c, r]) =>
          isoPoint(c, r, 0)
        );

      el(
        "polygon",
        {
          points: ptsToStr(points),
          fill: mapColor("--map-ground-fill", "rgba(255,255,255,.02)"),
          stroke: "none"
        },
        ground
      );

      el(
        "polygon",
        {
          points: ptsToStr(points),
          fill: "none",
          stroke: mapColor("--map-outline", "#eef1f0"),
"stroke-opacity": ".18",
          "stroke-width": 1.4,
          "stroke-dasharray": "4 5"
        },
        ground
      );
    }

    (data.roads || []).forEach(road => {

      const points =
        road.points.map(([c, r]) =>
          isoPoint(c, r, 0)
        );

      el(
        "polyline",
        {
          points: ptsToStr(points),
          fill: "none",
          stroke: "var(--map-road)",
          "stroke-width": 3
        },
        ground
      );
    });

    (data.trees || []).forEach(
      ([c, r], index) => {

        const layer =
          index % 2 === 0
            ? treesBack
            : treesFront;

        const base =
          isoPoint(c, r, 0);

        const treeHeight =
          0.55 +
          (index % 3) * 0.12;

        const top =
          isoPoint(
            c,
            r,
            treeHeight
          );

        const group =
          el("g", {}, layer);

        el(
          "line",
          {
            x1: base.x,
            y1: base.y,
            x2: top.x,
            y2: top.y,
            stroke: "#4a3624",
            "stroke-width": 2
          },
          group
        );

        el(
          "circle",
          {
            cx: top.x,
            cy: top.y - 6,
            r: 9 + (index % 3) * 1.5,
            fill: "#2f6b3f",
            opacity: .9
          },
          group
        );

        el(
          "circle",
          {
            cx: top.x - 4,
            cy: top.y - 10,
            r: 6,
            fill: "#3d8a52",
            opacity: .85
          },
          group
        );
      }
    );

    /*
       Zdi i budovy jdou do JEDNÉ společné vrstvy (structures) a
       řadí se do hloubky společně — jinak by se budovy vždycky
       kreslily nad zdmi bez ohledu na skutečnou vzdálenost.
    */

    const wallItems = splitWallSegments(data.walls).map(w => ({
      type: "wall",
      depth: w.rect[0] + w.rect[2] + w.rect[1] + w.rect[3],
      data: w
    }));

    const buildingItems = (data.buildings || []).map(b => ({
      type: "building",
      depth: b.rect[0] + b.rect[2] + b.rect[1] + b.rect[3],
      data: b
    }));

    [...wallItems, ...buildingItems]
      .sort((a, b) => a.depth - b.depth)
      .forEach(item => {

        if (item.type === "wall") {

          const [c1, r1, c2, r2] = item.data.rect;

          buildWallBlock(
            structures,
            c1, r1, c2, r2,
            item.data.height || 0.9,
            item.data.color
          );

          return;
        }

        const building = item.data;
        const [c1, r1, c2, r2] = building.rect;
        const active = building.id === activeId;
        const height = building.height || 0.9;

          buildBlock(
          structures,
          c1, r1, c2, r2,
          height,
          building.id,
          active,
          onBuildingClick,
          building.rotate || 0
        );

        const center =
          isoPoint(
            (c1 + c2) / 2,
            (r1 + r2) / 2,
            height
          );

        el(
          "text",
          {
            x: center.x,
            y: center.y - 6,
            "text-anchor": "middle",
            "font-family": "Anton, sans-serif",
            "font-size": 12,
            fill:
              active
                ? "#ff7a1a"
                : mapColor("--map-text", "#eef1f0"),
            style: "pointer-events:none;"
          },
          labels
        ).textContent = building.code;
      });

    if (playerPos) {

      drawPlayerDot(
        el(
          "g",
          {
            class: "layer-player"
          },
          container
        ),
        isoPoint(
          playerPos.col,
          playerPos.row,
          .05
        )
      );
    }
  }

  /* ========================================================================
     SIDEBAR
     ======================================================================== */

  function renderList(
    listEl,
    data,
    lang,
    activeId,
    onSelect
  ) {

    listEl.innerHTML = "";

    (data.buildings || []).forEach(
      building => {

        const name =
          lang === "en"
            ? building.nameEn
            : building.name;

        const item =
          document.createElement("div");

        item.className =
          "am-poi" +
          (
            building.id === activeId
              ? " active"
              : ""
          );

        item.innerHTML = `
          <span class="code">
            ${building.code}
          </span>
          <span>${name}</span>
        `;

        item.addEventListener(
          "click",
          () => onSelect(building.id)
        );

        listEl.appendChild(item);
      }
    );
  }

  /* ========================================================================
     INIT
     ======================================================================== */

  function init(opts) {
  let mode = "2d";
  let activeId = null;
  let playerPos = null;

  let scale = 1;
  let rotation = 0;
  let translateX = 0;
  let translateY = 0;

  let userAdjusted = false;
  let resizeTimer = null;

  let isDragging = false;
  let isRotating = false;
  let startX = 0;
  let startY = 0;
  let rotateStartX = 0;
  let rotateStartRotation = 0;

  let rafPending = false;

  const svg = opts.svg;
  const parentCanvas = svg.closest(".am-map-canvas");
     

  if (!svg) {
    console.error("MapEngine: SVG element nebyl nalezen.");
    return {
      redraw: () => {},
      setPlayer: () => {},
      setCompassRotation: () => {}
    };
  }

  /*
     Redraw "na požádání" — svazuje víc rychlých volání (např.
     tažením prstu při rotaci) do jednoho vykreslení za snímek,
     ať to na telefonu nesekundá.
  */
  function requestDraw() {

    if (rafPending) return;

    rafPending = true;

    requestAnimationFrame(() => {
      rafPending = false;
      draw();
    });
  }

  /* =========================================================
     VIEWPORT
     ========================================================= */

  svg.innerHTML = "";

  const viewport = el(
    "g",
    { class: "am-map-viewport" },
    svg
  );

  /* =========================================================
     OVLÁDÁNÍ MAPY
     ========================================================= */

  let rotateBtnEl = null;

  if (parentCanvas && !parentCanvas.querySelector(".am-map-controls")) {

    const controls = document.createElement("div");

    controls.className = "am-map-controls";

    controls.innerHTML = `
      <button type="button" id="am-zoom-in" title="Přiblížit">+</button>
      <button type="button" id="am-zoom-out" title="Oddálit">−</button>
      <button type="button" id="am-rotate" title="Otočit o 90°">⟲</button>
      <button type="button" id="am-reset" title="Obnovit pohled">⌂</button>
    `;

    parentCanvas.appendChild(controls);

    const zoomIn = controls.querySelector("#am-zoom-in");
    const zoomOut = controls.querySelector("#am-zoom-out");
    const rotateBtn = controls.querySelector("#am-rotate");
    const reset = controls.querySelector("#am-reset");

    rotateBtnEl = rotateBtn;

    zoomIn.addEventListener("click", e => {
      e.stopPropagation();

      const r = svg.getBoundingClientRect();

      applyZoomAt(
        1.25,
        r.left + r.width / 2,
        r.top + r.height / 2
      );
    });

    zoomOut.addEventListener("click", e => {
      e.stopPropagation();

      const r = svg.getBoundingClientRect();

      applyZoomAt(
        0.8,
        r.left + r.width / 2,
        r.top + r.height / 2
      );
    });

    rotateBtn.addEventListener("click", e => {
      e.stopPropagation();

      if (mode !== "3d") return;

      userAdjusted = true;

      rotation = (rotation + 90) % 360;

      draw();
    });

    reset.addEventListener("click", e => {
      e.stopPropagation();

      resetTransform();
    });
  }

  function updateRotateBtnVisibility() {

    if (!rotateBtnEl) return;

    rotateBtnEl.style.display =
      mode === "3d" ? "" : "none";
  }

  /* =========================================================
     TRANSFORMACE

     Otočení (rotation) se od teď NEaplikuje tady jako plochá
     SVG transformace — to je počítáno přímo v isoPoint() při
     kreslení 3D scény (viz render3D / __orbitDeg výše). Tady
     zůstává jen posun a přiblížení.
     ========================================================= */

  function updateTransform() {

    viewport.setAttribute(
      "transform",
      `translate(${translateX} ${translateY}) scale(${scale})`
    );
  }

  /*
     KLÍČOVÁ OPRAVA:
     SVG viewBox se VŽDY nastaví přesně na skutečnou velikost
     kontejneru v pixelech. Veškeré přiblížení/posun pak řeší
     výhradně JS transform na <g class="am-map-viewport">.
  */

  function syncViewBox() {

    if (!parentCanvas) return { w: 0, h: 0 };

    const rect =
      parentCanvas.getBoundingClientRect();

    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    svg.setAttribute(
      "viewBox",
      `0 0 ${w} ${h}`
    );

    return { w, h };
  }

  function applyZoomAt(factor, clientX, clientY) {

    userAdjusted = true;

    const rect = svg.getBoundingClientRect();

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const oldScale = scale;

    const newScale = Math.min(
      Math.max(0.08, oldScale * factor),
      6
    );

    const actualFactor = newScale / oldScale;

    translateX =
      mouseX -
      (mouseX - translateX) * actualFactor;

    translateY =
      mouseY -
      (mouseY - translateY) * actualFactor;

    scale = newScale;

    updateTransform();
  }
function fitMapToWindow() {

  if (!parentCanvas) return;

  const rect = syncViewBox();

  const padding = 30;

  const availableWidth =
    Math.max(100, rect.w - padding * 2);

  const availableHeight =
    Math.max(100, rect.h - padding * 2);

  let mapX = 0;
  let mapY = 0;
  let mapWidth = 1000;
  let mapHeight = 750;

  /* =========================================================
     2D
     ========================================================= */

  if (mode === "2d") {

    const viewBox =
      opts.data.viewBoxFlat ||
      "0 0 1360 800";

    const parts =
      viewBox.split(/\s+/).map(Number);

    mapX = parts[0] || 0;
    mapY = parts[1] || 0;
    mapWidth = parts[2] || 1360;
    mapHeight = parts[3] || 800;

  }

  /* =========================================================
     3D
     ========================================================= */

  else {

    try {

      const bbox =
        viewport.getBBox();

      mapX = bbox.x;
      mapY = bbox.y;
      mapWidth = bbox.width;
      mapHeight = bbox.height;

    } catch (err) {

      mapX = 0;
      mapY = 0;
      mapWidth = 1000;
      mapHeight = 700;

    }
  }

  /* Bezpečnostní fallback */

  if (
    !Number.isFinite(mapX) ||
    !Number.isFinite(mapY) ||
    !Number.isFinite(mapWidth) ||
    !Number.isFinite(mapHeight) ||
    mapWidth <= 0 ||
    mapHeight <= 0
  ) {

    mapX = 0;
    mapY = 0;
    mapWidth = 1000;
    mapHeight = 700;
  }

  /* =========================================================
     VÝPOČET SCALE
     ========================================================= */

  const scaleX =
    availableWidth / mapWidth;

  const scaleY =
    availableHeight / mapHeight;

  scale =
    Math.min(scaleX, scaleY);

  scale =
    Math.min(
      Math.max(scale, 0.15),
      2
    );

  /* =========================================================
     SKUTEČNÉ CENTROVÁNÍ
     
     Důležité:
     mapX/mapY mohou být záporné.
     Proto nestačí pouze width/height.
     ========================================================= */

  const mapCenterX =
    mapX + mapWidth / 2;

  const mapCenterY =
    mapY + mapHeight / 2;

  translateX =
    rect.w / 2 -
    mapCenterX * scale;

  translateY =
    rect.h / 2 -
    mapCenterY * scale;

  updateTransform();
}
function resetTransform() {

  rotation = 0;
  userAdjusted = false;

  /*
     Rotace se teď peče přímo do geometrie, takže při návratu
     na 0° je potřeba scénu nejdřív překreslit (draw), a až
     pak dopočítat zarovnání/zoom (fitMapToWindow) — jinak by
     se chvíli zobrazovala stará, ještě pootočená geometrie.
  */
  draw();
  fitMapToWindow();
}

  /* =========================================================
     MYŠ
     ========================================================= */

  svg.addEventListener("mousedown", e => {

    if (
      e.target.closest(".am-building") ||
      e.target.closest(".am-building3d")
    ) {
      return;
    }

    userAdjusted = true;

    /*
       Alt + tažení = plynulé otočení mapy (štelování) — dává
       smysl jen ve 3D, kde skutečně otáčí model v prostoru.
       Ve 2D je rotace vypnutá.
    */

    if (e.altKey && mode === "3d") {

      isRotating = true;

      rotateStartX = e.clientX;
      rotateStartRotation = rotation;

      svg.style.cursor = "ew-resize";

      return;
    }

    isDragging = true;

    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    svg.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", e => {

    if (isRotating) {

      rotation =
        rotateStartRotation +
        (e.clientX - rotateStartX) * 0.4;

      requestDraw();
      return;
    }

    if (!isDragging) return;

    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    updateTransform();
  });

  window.addEventListener("mouseup", () => {

    isDragging = false;
    isRotating = false;

    svg.style.cursor = "default";
  });

  /* =========================================================
     KOLEČKO
     ========================================================= */

  svg.addEventListener(
    "wheel",
    e => {

      e.preventDefault();

      const factor =
        e.deltaY < 0 ? 1.15 : 0.85;

      applyZoomAt(
        factor,
        e.clientX,
        e.clientY
      );
    },
    { passive: false }
  );

  /* =========================================================
     TOUCH

     Pinch-zoom/pan/rotate je teď vždy počítán ZNOVU od pevného
     výchozího bodu gesta (zachyceného při dotyku druhého prstu),
     ne přírůstkově krok po kroku — díky tomu se drobné nepřesnosti
     nesčítají a mapa se při zoomu/rotaci neposouvá ("neujíždí").
     ========================================================= */

  let pinchStartDist = null;
  let pinchStartScale = 1;
  let pinchStartTranslateX = 0;
  let pinchStartTranslateY = 0;
  let pinchStartMidX = 0;
  let pinchStartMidY = 0;
  let pinchStartAngle = 0;
  let pinchStartRotation = 0;

  let touchStartX = 0;
  let touchStartY = 0;

  function getPinchMetrics(e) {

    const t1 = e.touches[0];
    const t2 = e.touches[1];

    return {
      dist: Math.hypot(
        t1.clientX - t2.clientX,
        t1.clientY - t2.clientY
      ),

      angle:
        Math.atan2(
          t2.clientY - t1.clientY,
          t2.clientX - t1.clientX
        ) * (180 / Math.PI),

      centerX:
        (t1.clientX + t2.clientX) / 2,

      centerY:
        (t1.clientY + t2.clientY) / 2
    };
  }

  svg.addEventListener(
    "touchstart",
    e => {

      userAdjusted = true;

      if (e.touches.length === 1) {

        isDragging = true;

        touchStartX =
          e.touches[0].clientX - translateX;

        touchStartY =
          e.touches[0].clientY - translateY;

      } else if (e.touches.length === 2) {

        isDragging = false;

        const metrics =
          getPinchMetrics(e);

        pinchStartDist = metrics.dist;
        pinchStartScale = scale;
        pinchStartTranslateX = translateX;
        pinchStartTranslateY = translateY;
        pinchStartMidX = metrics.centerX;
        pinchStartMidY = metrics.centerY;
        pinchStartAngle = metrics.angle;
        pinchStartRotation = rotation;
      }
    },
    { passive: true }
  );

  svg.addEventListener(
    "touchmove",
    e => {

      if (
        isDragging &&
        e.touches.length === 1
      ) {

        translateX =
          e.touches[0].clientX - touchStartX;

        translateY =
          e.touches[0].clientY - touchStartY;

        updateTransform();

      } else if (
        e.touches.length === 2 &&
        pinchStartDist
      ) {

        const metrics =
          getPinchMetrics(e);

        const rect =
          svg.getBoundingClientRect();

        const rawScale =
          pinchStartScale *
          (metrics.dist / pinchStartDist);

        const newScale =
          Math.min(Math.max(0.08, rawScale), 6);

        // bod v obsahu, který byl na začátku gesta pod prsty
        const startMidLocalX =
          pinchStartMidX - rect.left;

        const startMidLocalY =
          pinchStartMidY - rect.top;

        const contentX =
          (startMidLocalX - pinchStartTranslateX) /
          pinchStartScale;

        const contentY =
          (startMidLocalY - pinchStartTranslateY) /
          pinchStartScale;

        // kam se prsty přesunuly teď
        const curMidLocalX =
          metrics.centerX - rect.left;

        const curMidLocalY =
          metrics.centerY - rect.top;

        translateX =
          curMidLocalX - contentX * newScale;

        translateY =
          curMidLocalY - contentY * newScale;

        scale = newScale;

if (mode === "3d") {

          const angleDelta =
            metrics.angle - pinchStartAngle;

          rotation =
            pinchStartRotation + angleDelta;

          requestDraw();

        } else {

          updateTransform();
     }
      }
    },
    { passive: true }
  );

  svg.addEventListener("touchend", e => {

    if (e.touches.length === 0) {

      isDragging = false;
      pinchStartDist = null;
      pinchStartAngle = null;

    } else if (e.touches.length === 1) {

      // z pinche zbyl jeden prst — plynule pokračuj tažením
      pinchStartDist = null;
      pinchStartAngle = null;

      isDragging = true;

      touchStartX =
        e.touches[0].clientX - translateX;

      touchStartY =
        e.touches[0].clientY - translateY;
    }
  });

  /* =========================================================
     VYKRESLENÍ
     ========================================================= */

  function draw() {

    const lang = opts.getLang();

    syncViewBox();

    if (mode === "2d") {

      render2D(
        viewport,
        opts.data,
        lang,
        select,
        activeId,
        playerPos
      );

    } else {

      render3D(
        viewport,
        opts.data,
        lang,
        select,
        activeId,
        playerPos,
        rotation
      );
    }

    updateTransform();

    updateRotateBtnVisibility();

    renderList(
      opts.listEl,
      opts.data,
      lang,
      activeId,
      select
    );
  }

  /* =========================================================
     PLAYER
     ========================================================= */

  function setPlayer(pos) {

    playerPos = pos;

    draw();
  }

  /* =========================================================
     KOMPAS — automatické natočení mapy podle světové strany
     ========================================================= */

  function setCompassRotation(deg) {

    rotation = deg == null ? 0 : deg;

    if (mode === "3d") {
      requestDraw();
    }
  }

  /* =========================================================
     VÝBĚR BUDOV
     ========================================================= */

  function select(id) {

    activeId =
      activeId === id
        ? null
        : id;

    draw();
  }

  /* =========================================================
     2D / 3D
     ========================================================= */

  opts.mountModeToggle.btn2d.addEventListener(
    "click",
    e => {

      e.stopPropagation();

      mode = "2d";

      opts.mountModeToggle.btn2d
        .classList.add("active");

      opts.mountModeToggle.btn3d
        .classList.remove("active");

      resetTransform();
    }
  );

  opts.mountModeToggle.btn3d.addEventListener(
    "click",
    e => {

      e.stopPropagation();

      mode = "3d";

      opts.mountModeToggle.btn3d
        .classList.add("active");

      opts.mountModeToggle.btn2d
        .classList.remove("active");

      resetTransform();
    }
  );

  /* =========================================================
     ZMĚNA VELIKOSTI OKNA
     ========================================================= */

  function handleResize() {

    if (userAdjusted) {

      /*
         Uživatel si mapu ručně nastavil (přiblížil/pootočil) —
         jen udržíme viewBox v souladu se skutečnou velikostí
         plátna, ale jeho nastavení nepřepisujeme.
      */

      syncViewBox();
      updateTransform();

    } else {

      fitMapToWindow();
    }
  }

  window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(handleResize, 120);
  });

  /* =========================================================
     START
     ========================================================= */

  draw();

  function revealAfterFit() {

    fitMapToWindow();

    svg.classList.add("am-ready");

    /*
       ResizeObserver se připojuje až TEĎ, ne hned na startu.
       Jinak jeho první (okamžitý) callback při .observe() spustí
       další fitMapToWindow() ještě před tím, než se ustálí layout
       (fonty, loga) — a uživatel to vidí jako mapu, která se
       sama od sebe "zvětšuje a sjíždí".
    */

    if (window.ResizeObserver && parentCanvas) {

      const resizeObserver = new ResizeObserver(() => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(handleResize, 120);
      });

      resizeObserver.observe(parentCanvas);
    }
  }

  const fontsReady =
    (document.fonts && document.fonts.ready) ||
    Promise.resolve();

  fontsReady.then(() => {

    // dvojitý rAF = počkej, až prohlížeč skutečně dokončí layout
    requestAnimationFrame(() => {
      requestAnimationFrame(revealAfterFit);
    });
  });

return {
  redraw: draw,
  setPlayer,
  setCompassRotation
};
}

  return {
    init
  };

})();
