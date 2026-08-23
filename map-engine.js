/* ==========================================================================
   AIRSOFT MAPS — map-engine.js

   2D / 3D mapa
   Zoom / Pan / Rotation
   Mouse + Touch + Stylus přes Pointer Events

   MOBIL:
   ☝ 1 prst  = pan
   🤏 2 prsty = zoom
   🔄 2 prsty = rotace
   🤏🔄 2 prsty = pan + zoom + rotace

   DESKTOP:
   🖱 drag = pan
   🖱 wheel = zoom
   ALT + drag = plynulá rotace
   ========================================================================== */

const MapEngine = (() => {

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ========================================================================
     ZÁKLADNÍ GEOMETRIE
     ======================================================================== */

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

  /* ========================================================================
     SVG HELPER
     ======================================================================== */

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

  /* ========================================================================
     BODY MAPY
     ======================================================================== */

  function flatPoint(col, row) {

    return {
      x: FLAT.originX + col * FLAT.colW,
      y: FLAT.originY + row * FLAT.rowH
    };
  }

  function isoPoint(col, row, height = 0) {

    return {
      x:
        (col - row) *
        (ISO.tileW / 2),

      y:
        (col + row) *
        (ISO.tileH / 2) -
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

  /* ========================================================================
     PLAYER DOT
     ======================================================================== */

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
      el(
        "g",
        { class: "layer-ground" },
        container
      );

    const roads =
      el(
        "g",
        { class: "layer-roads" },
        container
      );

    const buildings =
      el(
        "g",
        { class: "layer-buildings" },
        container
      );

    /* ----------------------------------------------------------------------
       HRANICE
       ---------------------------------------------------------------------- */

    if (data.boundary) {

      const points =
        data.boundary.map(([c, r]) =>
          flatPoint(c, r)
        );

      el(
        "polygon",
        {
          points: ptsToStr(points),
          fill: "rgba(255,255,255,.015)",
          stroke: "#eef1f0",
          "stroke-width": 3,
          "stroke-linejoin": "round"
        },
        ground
      );
    }

    /* ----------------------------------------------------------------------
       CESTY
       ---------------------------------------------------------------------- */

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
          stroke: "#3a3f47",
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
          stroke: "#1a1c1f",
          "stroke-width": 4,
          "stroke-dasharray": "2 10",
          "stroke-linecap": "round"
        },
        roads
      );
    });

    /* ----------------------------------------------------------------------
       VSTUP
       ---------------------------------------------------------------------- */

    if (data.entrance) {

      const p =
        flatPoint(
          data.entrance.col,
          data.entrance.row
        );

      const g =
        el(
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
          d:
            "M-14,0 L10,0 M2,-8 L10,0 L2,8",
          stroke: "#ff7a1a",
          "stroke-width": 3,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        },
        g
      );
    }

    /* ----------------------------------------------------------------------
       BUDOVY
       ---------------------------------------------------------------------- */

    (data.buildings || []).forEach(building => {

      const [
        c1,
        r1,
        c2,
        r2
      ] = building.rect;

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
              ? "rgba(255,122,26,.28)"
              : "rgba(238,241,240,.06)",

          stroke:
            active
              ? "#ff7a1a"
              : "#eef1f0",

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
          "font-family": "Anton, sans-serif",

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
              ? "#ff7a1a"
              : "#eef1f0",

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

          onBuildingClick(
            building.id
          );
        }
      );
    });

    /* ----------------------------------------------------------------------
       PLAYER
       ---------------------------------------------------------------------- */

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
     3D BUILDING
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

    const AA = {
      c: c1,
      r: r1
    };

    const BA = {
      c: c2,
      r: r1
    };

    const BB = {
      c: c2,
      r: r2
    };

    const AB = {
      c: c1,
      r: r2
    };

    const topAA =
      isoPoint(
        AA.c,
        AA.r,
        height
      );

    const topBA =
      isoPoint(
        BA.c,
        BA.r,
        height
      );

    const topBB =
      isoPoint(
        BB.c,
        BB.r,
        height
      );

    const topAB =
      isoPoint(
        AB.c,
        AB.r,
        height
      );

    const baseBA =
      isoPoint(
        BA.c,
        BA.r,
        0
      );

    const baseBB =
      isoPoint(
        BB.c,
        BB.r,
        0
      );

    const baseAB =
      isoPoint(
        AB.c,
        AB.r,
        0
      );

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
      active
        ? "#ffb066"
        : "#4a5058";

    const rightColor =
      active
        ? "#e0812a"
        : "#2f333a";

    const frontColor =
      active
        ? "#b5631a"
        : "#1c1f24";

    const strokeColor =
      active
        ? "#ff7a1a"
        : "#0a0b0d";

    /* TOP */

    el(
      "polygon",
      {
        points:
          ptsToStr([
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

    /* RIGHT */

    el(
      "polygon",
      {
        points:
          ptsToStr([
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

    /* FRONT */

    el(
      "polygon",
      {
        points:
          ptsToStr([
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

  /* ========================================================================
     3D
     ======================================================================== */

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
      el(
        "g",
        { class: "layer-ground" },
        container
      );

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

    /* ----------------------------------------------------------------------
       HRANICE
       ---------------------------------------------------------------------- */

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
          stroke: "rgba(238,241,240,.18)",
          "stroke-width": 1.4,
          "stroke-dasharray": "4 5"
        },
        ground
      );
    }

    /* ----------------------------------------------------------------------
       CESTY
       ---------------------------------------------------------------------- */

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
          stroke: "#33383f",
          "stroke-width": 3
        },
        ground
      );
    });

    /* ----------------------------------------------------------------------
       STROMY
       ---------------------------------------------------------------------- */

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
          el(
            "g",
            {},
            layer
          );

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
            r:
              9 +
              (index % 3) * 1.5,
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

    /* ----------------------------------------------------------------------
       SORT BUILDINGS
       ---------------------------------------------------------------------- */

    const sorted =
      [...(data.buildings || [])]
        .sort((a, b) => {

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
        });

    /* ----------------------------------------------------------------------
       BUILDINGS
       ---------------------------------------------------------------------- */

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
              : "#eef1f0",

          style:
            "pointer-events:none;"
        },
        labels
      ).textContent =
        building.code;
    });

    /* ----------------------------------------------------------------------
       PLAYER
       ---------------------------------------------------------------------- */

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
          () =>
            onSelect(
              building.id
            )
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

    const svg = opts.svg;

    const parentCanvas =
      svg
        ? svg.closest(".am-map-canvas")
        : null;

    if (!svg) {

      console.error(
        "MapEngine: SVG element nebyl nalezen."
      );

      return {
        redraw: () => {},
        setPlayer: () => {}
      };
    }

    /* ======================================================================
       MOBILNÍ CHOVÁNÍ
       ====================================================================== */

    /*
       Kriticky důležité:

       Browser nesmí během manipulace s mapou
       interpretovat gesto jako scroll / browser zoom.

       Pointer Events + touch-action:none
       nám umožní řídit gesto kompletně sami.
    */

    svg.style.touchAction = "none";
    svg.style.userSelect = "none";
    svg.style.webkitUserSelect = "none";
    svg.style.webkitTouchCallout = "none";

    /* ======================================================================
       VIEWPORT
       ====================================================================== */

    svg.innerHTML = "";

    const viewport =
      el(
        "g",
        {
          class: "am-map-viewport"
        },
        svg
      );

    /* ======================================================================
       OVLÁDACÍ TLAČÍTKA
       ====================================================================== */

    if (
      parentCanvas &&
      !parentCanvas.querySelector(
        ".am-map-controls"
      )
    ) {

      const controls =
        document.createElement("div");

      controls.className =
        "am-map-controls";

      controls.innerHTML = `
        <button
          type="button"
          id="am-zoom-in"
          title="Přiblížit"
        >+</button>

        <button
          type="button"
          id="am-zoom-out"
          title="Oddálit"
        >−</button>

        <button
          type="button"
          id="am-rotate"
          title="Otočit o 90°"
        >⟲</button>

        <button
          type="button"
          id="am-reset"
          title="Obnovit pohled"
        >⌂</button>
      `;

      parentCanvas.appendChild(
        controls
      );

      const zoomIn =
        controls.querySelector(
          "#am-zoom-in"
        );

      const zoomOut =
        controls.querySelector(
          "#am-zoom-out"
        );

      const rotate =
        controls.querySelector(
          "#am-rotate"
        );

      const reset =
        controls.querySelector(
          "#am-reset"
        );

      zoomIn.addEventListener(
        "click",
        e => {

          e.stopPropagation();

          const r =
            svg.getBoundingClientRect();

          applyZoomAt(
            1.25,
            r.left + r.width / 2,
            r.top + r.height / 2
          );
        }
      );

      zoomOut.addEventListener(
        "click",
        e => {

          e.stopPropagation();

          const r =
            svg.getBoundingClientRect();

          applyZoomAt(
            0.8,
            r.left + r.width / 2,
            r.top + r.height / 2
          );
        }
      );

      rotate.addEventListener(
        "click",
        e => {

          e.stopPropagation();

          userAdjusted = true;

          rotation =
            (rotation + 90) % 360;

          updateTransform();
        }
      );

      reset.addEventListener(
        "click",
        e => {

          e.stopPropagation();

          resetTransform();
        }
      );
    }

    /* ======================================================================
       TRANSFORMACE
       ====================================================================== */

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

    /* ======================================================================
       VIEWBOX
       ====================================================================== */

    function syncViewBox() {

      if (!parentCanvas) {

        return {
          w: 0,
          h: 0
        };
      }

      const rect =
        parentCanvas.getBoundingClientRect();

      const w =
        Math.max(
          1,
          Math.round(rect.width)
        );

      const h =
        Math.max(
          1,
          Math.round(rect.height)
        );

      svg.setAttribute(
        "viewBox",
        `0 0 ${w} ${h}`
      );

      return {
        w,
        h
      };
    }

    /* ======================================================================
       ZOOM
       ====================================================================== */

    function applyZoomAt(
      factor,
      clientX,
      clientY
    ) {

      userAdjusted = true;

      const rect =
        svg.getBoundingClientRect();

      const mouseX =
        clientX - rect.left;

      const mouseY =
        clientY - rect.top;

      const oldScale =
        scale;

      const newScale =
        Math.min(
          Math.max(
            0.4,
            oldScale * factor
          ),
          6
        );

      const actualFactor =
        newScale / oldScale;

      translateX =
        mouseX -
        (mouseX - translateX) *
        actualFactor;

      translateY =
        mouseY -
        (mouseY - translateY) *
        actualFactor;

      scale =
        newScale;

      updateTransform();
    }

    /* ======================================================================
       FIT MAP
       ====================================================================== */

    function fitMapToWindow() {

      if (!parentCanvas) return;

      const rect =
        syncViewBox();

      const padding = 30;

      const availableWidth =
        Math.max(
          100,
          rect.w - padding * 2
        );

      const availableHeight =
        Math.max(
          100,
          rect.h - padding * 2
        );

      let mapWidth = 1000;
      let mapHeight = 750;

      /* --------------------------------------------------------------------
         2D
         -------------------------------------------------------------------- */

      if (mode === "2d") {

        const viewBox =
          opts.data.viewBoxFlat ||
          "0 0 1360 800";

        const parts =
          viewBox
            .split(/\s+/)
            .map(Number);

        mapWidth =
          parts[2] || 1360;

        mapHeight =
          parts[3] || 800;
      }

      /* --------------------------------------------------------------------
         3D
         -------------------------------------------------------------------- */

      else {

        try {

          const bbox =
            viewport.getBBox();

          mapWidth =
            bbox.width;

          mapHeight =
            bbox.height;

        } catch (err) {

          mapWidth = 1000;
          mapHeight = 700;
        }
      }

      if (
        !Number.isFinite(mapWidth) ||
        !Number.isFinite(mapHeight) ||
        mapWidth <= 0 ||
        mapHeight <= 0
      ) {

        mapWidth = 1000;
        mapHeight = 700;
      }

      const scaleX =
        availableWidth /
        mapWidth;

      const scaleY =
        availableHeight /
        mapHeight;

      scale =
        Math.min(
          scaleX,
          scaleY
        );

      scale =
        Math.min(
          Math.max(
            scale,
            0.15
          ),
          2
        );

      const finalWidth =
        mapWidth * scale;

      const finalHeight =
        mapHeight * scale;

      translateX =
        (rect.w - finalWidth) / 2;

      translateY =
        (rect.h - finalHeight) / 2;

      rotation = 0;

      updateTransform();
    }

    function resetTransform() {

      rotation = 0;

      userAdjusted = false;

      fitMapToWindow();
    }

    /* ======================================================================
       DESKTOP + POINTER EVENTS
       ====================================================================== */

    /*
       Všechny vstupy:

       mouse
       touch
       stylus

       jdou přes Pointer Events.

       To je výrazně čistší než kombinace
       mousedown + touchstart + touchmove.
    */

    const pointers =
      new Map();

    let gestureMode =
      "none";

    let panStartX = 0;
    let panStartY = 0;

    let rotateStartX = 0;
    let rotateStartRotation = 0;

    let lastPinchDistance = null;
    let lastPinchAngle = null;
    let lastPinchCenterX = 0;
    let lastPinchCenterY = 0;

    /* ----------------------------------------------------------------------
       POINTER HELPERS
       ---------------------------------------------------------------------- */

    function getPointerArray() {

      return Array.from(
        pointers.values()
      );
    }

    function getTwoPointerMetrics() {

      const pts =
        getPointerArray();

      if (pts.length < 2) {
        return null;
      }

      const p1 = pts[0];
      const p2 = pts[1];

      const dx =
        p2.x - p1.x;

      const dy =
        p2.y - p1.y;

      return {

        distance:
          Math.hypot(dx, dy),

        angle:
          Math.atan2(
            dy,
            dx
          ) *
          180 /
          Math.PI,

        centerX:
          (p1.x + p2.x) / 2,

        centerY:
          (p1.y + p2.y) / 2
      };
    }

    function normalizeAngleDelta(delta) {

      while (delta > 180) {
        delta -= 360;
      }

      while (delta < -180) {
        delta += 360;
      }

      return delta;
    }

    /* ----------------------------------------------------------------------
       POINTER DOWN
       ---------------------------------------------------------------------- */

    svg.addEventListener(
      "pointerdown",
      e => {

        /*
           Myš:
           povolíme pouze levé tlačítko.

           Touch/stylus:
           button bývá 0.
        */

        if (
          e.pointerType === "mouse" &&
          e.button !== 0
        ) {
          return;
        }

        /*
           Pokud se dotkne budovy,
           necháme událost na budově.
        */

        if (
          e.target.closest(
            ".am-building"
          ) ||
          e.target.closest(
            ".am-building3d"
          )
        ) {
          return;
        }

        e.preventDefault();

        userAdjusted = true;

        pointers.set(
          e.pointerId,
          {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            type: e.pointerType
          }
        );

        try {
          svg.setPointerCapture(
            e.pointerId
          );
        } catch (_) {}

        /* ================================================================
           1 POINTER
           ================================================================ */

        if (pointers.size === 1) {

          gestureMode =
            e.altKey &&
            e.pointerType === "mouse"
              ? "rotate"
              : "pan";

          panStartX =
            e.clientX -
            translateX;

          panStartY =
            e.clientY -
            translateY;

          rotateStartX =
            e.clientX;

          rotateStartRotation =
            rotation;

          svg.style.cursor =
            gestureMode === "rotate"
              ? "ew-resize"
              : "grabbing";

          return;
        }

        /* ================================================================
           2 POINTERS
           ================================================================ */

        if (pointers.size === 2) {

          gestureMode =
            "pinch";

          const metrics =
            getTwoPointerMetrics();

          if (metrics) {

            lastPinchDistance =
              metrics.distance;

            lastPinchAngle =
              metrics.angle;

            lastPinchCenterX =
              metrics.centerX;

            lastPinchCenterY =
              metrics.centerY;
          }

          svg.style.cursor =
            "grabbing";
        }
      },
      {
        passive: false
      }
    );

    /* ----------------------------------------------------------------------
       POINTER MOVE
       ---------------------------------------------------------------------- */

    svg.addEventListener(
      "pointermove",
      e => {

        const pointer =
          pointers.get(
            e.pointerId
          );

        if (!pointer) {
          return;
        }

        e.preventDefault();

        pointer.x =
          e.clientX;

        pointer.y =
          e.clientY;

        /* ================================================================
           1 POINTER
           ================================================================ */

        if (
          pointers.size === 1 &&
          gestureMode === "pan"
        ) {

          translateX =
            e.clientX -
            panStartX;

          translateY =
            e.clientY -
            panStartY;

          updateTransform();

          return;
        }

        /* ================================================================
           ALT ROTACE
           ================================================================ */

        if (
          pointers.size === 1 &&
          gestureMode === "rotate"
        ) {

          rotation =
            rotateStartRotation +
            (
              e.clientX -
              rotateStartX
            ) *
            0.4;

          updateTransform();

          return;
        }

        /* ================================================================
           2 POINTERS
           ================================================================ */

        if (
          pointers.size === 2 &&
          gestureMode === "pinch"
        ) {

          const metrics =
            getTwoPointerMetrics();

          if (!metrics) {
            return;
          }

          /* --------------------------------------------------------------
             PAN
             -------------------------------------------------------------- */

          const centerDeltaX =
            metrics.centerX -
            lastPinchCenterX;

          const centerDeltaY =
            metrics.centerY -
            lastPinchCenterY;

          translateX +=
            centerDeltaX;

          translateY +=
            centerDeltaY;

          /* --------------------------------------------------------------
             ZOOM
             -------------------------------------------------------------- */

          if (
            lastPinchDistance &&
            lastPinchDistance > 0
          ) {

            const factor =
              metrics.distance /
              lastPinchDistance;

            applyZoomAt(
              factor,
              metrics.centerX,
              metrics.centerY
            );
          }

          /* --------------------------------------------------------------
             ROTACE
             -------------------------------------------------------------- */

          if (
            lastPinchAngle !== null
          ) {

            const angleDelta =
              normalizeAngleDelta(
                metrics.angle -
                lastPinchAngle
              );

            rotation +=
              angleDelta;
          }

          /* --------------------------------------------------------------
             ULOŽIT STAV PRO DALŠÍ FRAME
             -------------------------------------------------------------- */

          lastPinchDistance =
            metrics.distance;

          lastPinchAngle =
            metrics.angle;

          lastPinchCenterX =
            metrics.centerX;

          lastPinchCenterY =
            metrics.centerY;

          updateTransform();
        }
      },
      {
        passive: false
      }
    );

    /* ----------------------------------------------------------------------
       POINTER UP
       ---------------------------------------------------------------------- */

    function releasePointer(e) {

      pointers.delete(
        e.pointerId
      );

      try {

        if (
          svg.hasPointerCapture(
            e.pointerId
          )
        ) {

          svg.releasePointerCapture(
            e.pointerId
          );
        }

      } catch (_) {}

      /* ================================================================
         ŽÁDNÝ POINTER
         ================================================================ */

      if (pointers.size === 0) {

        gestureMode =
          "none";

        lastPinchDistance =
          null;

        lastPinchAngle =
          null;

        svg.style.cursor =
          "default";

        return;
      }

      /* ================================================================
         ZŮSTAL 1 POINTER
         ================================================================ */

      if (pointers.size === 1) {

        const remaining =
          getPointerArray()[0];

        /*
           Velmi důležité:

           Po skončení pinche nezačneme
           počítat pan ze starých souřadnic.

           Nastavíme nový začátek přesně
           na aktuální pozici prstu.

           Díky tomu mapa NEODSkočí.
        */

        gestureMode =
          "pan";

        panStartX =
          remaining.x -
          translateX;

        panStartY =
          remaining.y -
          translateY;

        lastPinchDistance =
          null;

        lastPinchAngle =
          null;

        lastPinchCenterX =
          remaining.x;

        lastPinchCenterY =
          remaining.y;

        svg.style.cursor =
          "grabbing";

        return;
      }

      /* ================================================================
         ZŮSTALY 2 POINTERY
         ================================================================ */

      if (pointers.size === 2) {

        gestureMode =
          "pinch";

        const metrics =
          getTwoPointerMetrics();

        if (metrics) {

          lastPinchDistance =
            metrics.distance;

          lastPinchAngle =
            metrics.angle;

          lastPinchCenterX =
            metrics.centerX;

          lastPinchCenterY =
            metrics.centerY;
        }
      }
    }

    svg.addEventListener(
      "pointerup",
      releasePointer,
      {
        passive: true
      }
    );

    svg.addEventListener(
      "pointercancel",
      releasePointer,
      {
        passive: true
      }
    );

    svg.addEventListener(
      "pointerleave",
      e => {

        /*
           U touch/stylus nic nerušíme.

           Pointer Capture zajišťuje,
           že gesto pokračuje i mimo SVG.
        */

        if (
          e.pointerType === "mouse" &&
          pointers.has(e.pointerId)
        ) {
          return;
        }
      }
    );

    /* ======================================================================
       KOLEČKO
       ====================================================================== */

    svg.addEventListener(
      "wheel",
      e => {

        e.preventDefault();

        const factor =
          e.deltaY < 0
            ? 1.15
            : 0.85;

        applyZoomAt(
          factor,
          e.clientX,
          e.clientY
        );
      },
      {
        passive: false
      }
    );

    /* ======================================================================
       VYKRESLENÍ
       ====================================================================== */

    function draw() {

      const lang =
        opts.getLang();

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

    /* ======================================================================
       PLAYER
       ====================================================================== */

    function setPlayer(pos) {

      playerPos =
        pos;

      draw();
    }

    /* ======================================================================
       VÝBĚR BUDOVY
       ====================================================================== */

    function select(id) {

      activeId =
        activeId === id
          ? null
          : id;

      draw();
    }

    /* ======================================================================
       2D / 3D
       ====================================================================== */

    opts.mountModeToggle.btn2d
      .addEventListener(
        "click",
        e => {

          e.stopPropagation();

          mode =
            "2d";

          opts.mountModeToggle.btn2d
            .classList.add(
              "active"
            );

          opts.mountModeToggle.btn3d
            .classList.remove(
              "active"
            );

          draw();

          resetTransform();
        }
      );

    opts.mountModeToggle.btn3d
      .addEventListener(
        "click",
        e => {

          e.stopPropagation();

          mode =
            "3d";

          opts.mountModeToggle.btn3d
            .classList.add(
              "active"
            );

          opts.mountModeToggle.btn2d
            .classList.remove(
              "active"
            );

          draw();

          resetTransform();
        }
      );

    /* ======================================================================
       RESIZE
       ====================================================================== */

    function handleResize() {

      if (userAdjusted) {

        syncViewBox();

        updateTransform();

      } else {

        fitMapToWindow();
      }
    }

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            handleResize,
            120
          );
      }
    );

    /* ======================================================================
       START
       ====================================================================== */

    draw();

    function revealAfterFit() {

      fitMapToWindow();

      svg.classList.add(
        "am-ready"
      );

      if (
        window.ResizeObserver &&
        parentCanvas
      ) {

        const resizeObserver =
          new ResizeObserver(
            () => {

              clearTimeout(
                resizeTimer
              );

              resizeTimer =
                setTimeout(
                  handleResize,
                  120
                );
            }
          );

        resizeObserver.observe(
          parentCanvas
        );
      }
    }

    const fontsReady =
      (
        document.fonts &&
        document.fonts.ready
      ) ||
      Promise.resolve();

    fontsReady.then(
      () => {

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              revealAfterFit
            );
          }
        );
      }
    );

    /* ======================================================================
       PUBLIC API
       ====================================================================== */

    return {
      redraw: draw,
      setPlayer
    };
  }

  return {
    init
  };

})();
