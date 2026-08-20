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

    return {
      x: (col - row) * (ISO.tileW / 2),
      y:
        (col + row) * (ISO.tileH / 2) -
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
          fill: "var(--map-ground-fill)",
stroke: "var(--map-outline)",
          "stroke-width": 3,
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

  function buildBlock(
    parent,
    c1,
    r1,
    c2,
    r2,
    height,
    id,
    active,
    onClick
  ) {

    const AA = { c: c1, r: r1 };
    const BA = { c: c2, r: r1 };
    const BB = { c: c2, r: r2 };
    const AB = { c: c1, r: r2 };

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
  active ? "var(--accent)" : "var(--map-3d-stroke)";
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

  function render3D(
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

    const treesBack =
      el(
        "g",
        { class: "layer-trees-back" },
        container
      );

    const buildings =
      el(
        "g",
        { class: "layer-buildings" },
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

    const sorted =
      [...(data.buildings || [])].sort(
        (a, b) => {

          const ca =
            a.rect[0] +
            a.rect[2] +
            a.rect[1] +
            a.rect[3];

          const cb =
            b.rect[0] +
            b.rect[2] +
            b.rect[1] +
            b.rect[3];

          return ca - cb;
        }
      );

    sorted.forEach(building => {

      const [
        c1,
        r1,
        c2,
        r2
      ] = building.rect;

      const active =
        building.id === activeId;

      const height =
        building.height || 0.9;

      buildBlock(
        buildings,
        c1,
        r1,
        c2,
        r2,
        height,
        building.id,
        active,
        onBuildingClick
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
          "font-family":
            "Anton, sans-serif",
          "font-size": 12,
          fill:
  active
    ? "#ff7a1a"
    : mapColor("--map-text", "#eef1f0"),
          style:
            "pointer-events:none;"
        },
        labels
      ).textContent =
        building.code;
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

  const svg = opts.svg;
  const parentCanvas = svg.closest(".am-map-canvas");
     

  if (!svg) {
    console.error("MapEngine: SVG element nebyl nalezen.");
    return {
      redraw: () => {},
      setPlayer: () => {}
    };
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

  if (parentCanvas && !parentCanvas.querySelector(".am-map-controls")) {

    const controls = document.createElement("div");

    controls.className = "am-map-controls";

    controls.innerHTML = `
      <button type="button" id="am-zoom-in" title="Přiblížit">+</button>
      <button type="button" id="am-zoom-out" title="Oddálit">−</button>
      <button type="button" id="am-rotate" title="Otočit o 90° (nebo Alt+tažení myší / dvěma prsty pro plynulé natočení)">⟲</button>
      <button type="button" id="am-reset" title="Obnovit pohled">⌂</button>
    `;

    parentCanvas.appendChild(controls);

    const zoomIn = controls.querySelector("#am-zoom-in");
    const zoomOut = controls.querySelector("#am-zoom-out");
    const rotate = controls.querySelector("#am-rotate");
    const reset = controls.querySelector("#am-reset");

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

    rotate.addEventListener("click", e => {
      e.stopPropagation();

      userAdjusted = true;

      rotation = (rotation + 90) % 360;

      updateTransform();
    });

    reset.addEventListener("click", e => {
      e.stopPropagation();

      resetTransform();
    });
  }

  /* =========================================================
     TRANSFORMACE
     ========================================================= */

  function updateTransform() {

    viewport.setAttribute(
      "transform",
      `
        translate(${translateX} ${translateY})
        scale(${scale})
        rotate(${rotation})
      `
    );
  }

  /*
     KLÍČOVÁ OPRAVA:
     SVG viewBox se VŽDY nastaví přesně na skutečnou velikost
     kontejneru v pixelech. Veškeré přiblížení/posun/otočení pak
     řeší výhradně JS transform na <g class="am-map-viewport">.
     Dřív se o scale "dělil" jak nativní viewBox (přes
     preserveAspectRatio), tak tento JS transform zároveň — což
     mapu efektivně zvětšovalo 2x a "vylévalo" ji mimo obrazovku.
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
      Math.max(0.4, oldScale * factor),
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

  let mapWidth = 1000;
  let mapHeight = 750;

  /*
     2D mapa má rozměry přímo z viewBoxu.
  */

  if (mode === "2d") {

    const viewBox =
      opts.data.viewBoxFlat ||
      "0 0 1360 800";

    const parts =
      viewBox.split(/\s+/).map(Number);

    mapWidth = parts[2];
    mapHeight = parts[3];

  } else {

    /*
       U 3D si vezmeme skutečný bounding box.
    */

    try {

      const bbox =
        viewport.getBBox();

      mapWidth = bbox.width;
      mapHeight = bbox.height;

    } catch (err) {

      mapWidth = 1000;
      mapHeight = 700;

    }
  }

  const scaleX =
    availableWidth / mapWidth;

  const scaleY =
    availableHeight / mapHeight;

  /*
     Vždy použijeme MENŠÍ hodnotu.
     Tím pádem mapa nikdy nevyleze z okna.
  */

  scale =
    Math.min(scaleX, scaleY);

  /*
     Trochu rozumnější limity.
  */

  scale =
    Math.min(
      Math.max(scale, 0.15),
      2
    );

  /*
     Počítáme skutečný rozměr mapy po zoomu.
  */

  const finalWidth =
    mapWidth * scale;

  const finalHeight =
    mapHeight * scale;

  /*
     Vycentrování mapy v okně.
  */

  translateX =
    (rect.w - finalWidth) / 2;

  translateY =
    (rect.h - finalHeight) / 2;

  updateTransform();

}
function resetTransform() {

  rotation = 0;
  userAdjusted = false;

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
       Alt + tažení = plynulé otočení mapy (štelování),
       obyčejné tažení = posun.
    */

    if (e.altKey) {

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

      updateTransform();
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
     ========================================================= */

  let touchStartX = 0;
  let touchStartY = 0;
  let initialPinchDist = null;
  let initialPinchAngle = null;
  let initialPinchRotation = 0;

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

        initialPinchDist =
          metrics.dist;

        initialPinchAngle =
          metrics.angle;

        initialPinchRotation =
          rotation;
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
        initialPinchDist
      ) {

        const metrics =
          getPinchMetrics(e);

        const factor =
          metrics.dist / initialPinchDist;

        applyZoomAt(
          factor,
          metrics.centerX,
          metrics.centerY
        );

        initialPinchDist =
          metrics.dist;

        if (initialPinchAngle !== null) {

          const angleDelta =
            metrics.angle - initialPinchAngle;

          rotation =
            initialPinchRotation + angleDelta;

          updateTransform();
        }
      }
    },
    { passive: true }
  );

  svg.addEventListener("touchend", () => {

    isDragging = false;
    initialPinchDist = null;
    initialPinchAngle = null;

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
        playerPos
      );
    }

    updateTransform();

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

      draw();
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

      draw();
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
  setPlayer
};
}

  return {
    init
  };

})();
