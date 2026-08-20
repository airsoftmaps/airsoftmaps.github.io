/* ==========================================================================
   AIRSOFT MAPS — map-engine.js
   2D / 3D mapa
   Zoom / Pan / Rotation
   Mouse + Touch + Stylus přes Pointer Events
   ========================================================================== */

const MapEngine = (() => {

  const SVG_NS = "http://www.w3.org/2000/svg";

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
          fill: "rgba(255,255,255,.015)",
          stroke: "#eef1f0",
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
      active ? "#ffb066" : "#4a5058";

    const rightColor =
      active ? "#e0812a" : "#2f333a";

    const frontColor =
      active ? "#b5631a" : "#1c1f24";

    const strokeColor =
      active ? "#ff7a1a" : "#0a0b0d";

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
          stroke: "rgba(238,241,240,.18)",
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
          stroke: "#33383f",
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
              : "#eef1f0",
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

    const svg = opts.svg;

    const canvas =
      svg.closest(".am-map-canvas");

    svg.innerHTML = "";

    const viewport =
      el(
        "g",
        {
          class: "am-map-viewport"
        },
        svg
      );

    /* ----------------------------------------------------------------------
       TRANSFORM MATRIX
       ---------------------------------------------------------------------- */

    let matrix =
      new DOMMatrix();

    function applyMatrix() {

      viewport.setAttribute(
        "transform",
        `matrix(
          ${matrix.a},
          ${matrix.b},
          ${matrix.c},
          ${matrix.d},
          ${matrix.e},
          ${matrix.f}
        )`
      );
    }

    function getViewBox() {

      const value =
        svg.getAttribute("viewBox");

      if (!value) {
        return {
          x: 0,
          y: 0,
          width: svg.clientWidth,
          height: svg.clientHeight
        };
      }

      const [
        x,
        y,
        width,
        height
      ] = value
        .trim()
        .split(/\s+/)
        .map(Number);

      return {
        x,
        y,
        width,
        height
      };
    }

    function getViewCenter() {

      const vb = getViewBox();

      return {
        x: vb.x + vb.width / 2,
        y: vb.y + vb.height / 2
      };
    }

    function clientToSvg(
      clientX,
      clientY
    ) {

      const point =
        svg.createSVGPoint();

      point.x = clientX;
      point.y = clientY;

      const ctm =
        svg.getScreenCTM();

      if (!ctm) {
        return {
          x: 0,
          y: 0
        };
      }

      return point.matrixTransform(
        ctm.inverse()
      );
    }

    function zoomAt(
      factor,
      clientX,
      clientY
    ) {

      const point =
        clientToSvg(
          clientX,
          clientY
        );

      const next =
        Math.max(
          .35,
          Math.min(
            7,
            factor
          )
        );

      matrix =
        new DOMMatrix()
          .translate(
            point.x,
            point.y
          )
          .scale(next)
          .translate(
            -point.x,
            -point.y
          )
          .multiply(matrix);

      applyMatrix();
    }

    function rotate90() {

      const center =
        getViewCenter();

      matrix =
        new DOMMatrix()
          .translate(
            center.x,
            center.y
          )
          .rotate(90)
          .translate(
            -center.x,
            -center.y
          )
          .multiply(matrix);

      applyMatrix();
    }

    function panBy(
      dx,
      dy
    ) {

      matrix =
        new DOMMatrix()
          .translate(dx, dy)
          .multiply(matrix);

      applyMatrix();
    }

    function resetTransform() {

      matrix =
        new DOMMatrix();

      applyMatrix();
    }

    /* ----------------------------------------------------------------------
       CONTROLS
       ---------------------------------------------------------------------- */

    if (
      canvas &&
      !canvas.querySelector(
        ".am-map-controls"
      )
    ) {

      const controls =
        document.createElement("div");

      controls.className =
        "am-map-controls";

      controls.innerHTML = `
        <button type="button"
                class="am-zoom-in"
                title="Přiblížit">+</button>

        <button type="button"
                class="am-zoom-out"
                title="Oddálit">−</button>

        <button type="button"
                class="am-rotate"
                title="Otočit o 90°">⟲</button>

        <button type="button"
                class="am-reset"
                title="Obnovit pohled">⌂</button>
      `;

      canvas.appendChild(controls);

      controls
        .querySelector(".am-zoom-in")
        .addEventListener(
          "click",
          () => {

            const rect =
              svg.getBoundingClientRect();

            zoomAt(
              1.25,
              rect.left + rect.width / 2,
              rect.top + rect.height / 2
            );
          }
        );

      controls
        .querySelector(".am-zoom-out")
        .addEventListener(
          "click",
          () => {

            const rect =
              svg.getBoundingClientRect();

            zoomAt(
              .8,
              rect.left + rect.width / 2,
              rect.top + rect.height / 2
            );
          }
        );

      controls
        .querySelector(".am-rotate")
        .addEventListener(
          "click",
          rotate90
        );

      controls
        .querySelector(".am-reset")
        .addEventListener(
          "click",
          resetTransform
        );
    }

    /* ----------------------------------------------------------------------
       WHEEL ZOOM
       ---------------------------------------------------------------------- */

    svg.addEventListener(
      "wheel",
      event => {

        event.preventDefault();

        zoomAt(
          event.deltaY < 0
            ? 1.15
            : .85,
          event.clientX,
          event.clientY
        );
      },
      {
        passive: false
      }
    );

    /* ----------------------------------------------------------------------
       POINTER GESTURES
       ---------------------------------------------------------------------- */

    const pointers =
      new Map();

    let gesture = null;

    function getGesture() {

      const values =
        [...pointers.values()];

      if (values.length === 1) {

        return {
          type: "pan",
          x: values[0].x,
          y: values[0].y
        };
      }

      if (values.length >= 2) {

        const a = values[0];
        const b = values[1];

        const center = {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2
        };

        const dx =
          a.x - b.x;

        const dy =
          a.y - b.y;

        return {
          type: "pinch",
          center,
          distance:
            Math.hypot(dx, dy)
        };
      }

      return null;
    }

    svg.addEventListener(
      "pointerdown",
      event => {

        if (
          event.button !== undefined &&
          event.button !== 0 &&
          event.pointerType !== "touch"
        ) {
          return;
        }

        if (
          event.target.closest(
            ".am-building, .am-building3d"
          )
        ) {
          return;
        }

        svg.setPointerCapture(
          event.pointerId
        );

        pointers.set(
          event.pointerId,
          {
            x: event.clientX,
            y: event.clientY
          }
        );

        const current =
          getGesture();

        if (!current) {
          return;
        }

        gesture = {
          ...current,
          startX: current.x,
          startY: current.y,
          moved: false
        };
      }
    );

    svg.addEventListener(
      "pointermove",
      event => {

        if (
          !pointers.has(
            event.pointerId
          )
        ) {
          return;
        }

        pointers.set(
          event.pointerId,
          {
            x: event.clientX,
            y: event.clientY
          }
        );

        const current =
          getGesture();

        if (!current || !gesture) {
          return;
        }

        if (
          current.type === "pan" &&
          gesture.type === "pan"
        ) {

          const previous =
            clientToSvg(
              gesture.x,
              gesture.y
            );

          const next =
            clientToSvg(
              current.x,
              current.y
            );

          const dx =
            next.x - previous.x;

          const dy =
            next.y - previous.y;

          if (
            Math.abs(
              current.x - gesture.startX
            ) > 5 ||
            Math.abs(
              current.y - gesture.startY
            ) > 5
          ) {
            gesture.moved = true;
          }

          panBy(dx, dy);

          gesture.x =
            current.x;

          gesture.y =
            current.y;

          return;
        }

        if (
          current.type === "pinch" &&
          gesture.type === "pinch"
        ) {

          const oldCenter =
            clientToSvg(
              gesture.center.x,
              gesture.center.y
            );

          const newCenter =
            clientToSvg(
              current.center.x,
              current.center.y
            );

          if (
            gesture.distance > 0 &&
            current.distance > 0
          ) {

            const factor =
              current.distance /
              gesture.distance;

            const safeFactor =
              Math.max(
                .8,
                Math.min(
                  1.2,
                  factor
                )
              );

            matrix =
              new DOMMatrix()
                .translate(
                  newCenter.x,
                  newCenter.y
                )
                .scale(
                  safeFactor
                )
                .translate(
                  -oldCenter.x,
                  -oldCenter.y
                )
                .multiply(matrix);
          }

          panBy(
            newCenter.x -
            oldCenter.x,

            newCenter.y -
            oldCenter.y
          );

          applyMatrix();

          gesture.center =
            current.center;

          gesture.distance =
            current.distance;
        }
      },
      {
        passive: false
      }
    );

    function endPointer(event) {

      pointers.delete(
        event.pointerId
      );

      try {
        svg.releasePointerCapture(
          event.pointerId
        );
      } catch (_) {}

      if (pointers.size === 0) {
        gesture = null;
      } else {
        gesture =
          getGesture();
      }
    }

    svg.addEventListener(
      "pointerup",
      endPointer
    );

    svg.addEventListener(
      "pointercancel",
      endPointer
    );

    svg.addEventListener(
      "pointerleave",
      event => {

        if (
          event.pointerType === "mouse" &&
          pointers.has(event.pointerId)
        ) {
          endPointer(event);
        }
      }
    );

    /* ----------------------------------------------------------------------
       RENDER
       ---------------------------------------------------------------------- */

    function draw() {

      const lang =
        opts.getLang();

      if (mode === "2d") {

        svg.setAttribute(
          "viewBox",
          opts.data.viewBoxFlat ||
          "0 0 1360 800"
        );

        svg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet"
        );

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

        const bbox =
          viewport.getBBox();

        const pad = 40;

        const width =
          Math.max(
            1,
            bbox.width + pad * 2
          );

        const height =
          Math.max(
            1,
            bbox.height + pad * 2
          );

        svg.setAttribute(
          "viewBox",
          `${bbox.x - pad} ` +
          `${bbox.y - pad} ` +
          `${width} ` +
          `${height}`
        );

        svg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet"
        );
      }

      applyMatrix();

      renderList(
        opts.listEl,
        opts.data,
        lang,
        activeId,
        select
      );
    }

    function setPlayer(pos) {

      playerPos =
        pos
          ? {
              col: Number(pos.col),
              row: Number(pos.row)
            }
          : null;

      draw();
    }

    function select(id) {

      activeId =
        activeId === id
          ? null
          : id;

      draw();
    }

    opts.mountModeToggle.btn2d
      .addEventListener(
        "click",
        () => {

          if (mode === "2d") {
            return;
          }

          mode = "2d";

          opts.mountModeToggle
            .btn2d
            .classList.add("active");

          opts.mountModeToggle
            .btn3d
            .classList.remove("active");

          resetTransform();
          draw();
        }
      );

    opts.mountModeToggle.btn3d
      .addEventListener(
        "click",
        () => {

          if (mode === "3d") {
            return;
          }

          mode = "3d";

          opts.mountModeToggle
            .btn3d
            .classList.add("active");

          opts.mountModeToggle
            .btn2d
            .classList.remove("active");

          resetTransform();
          draw();
        }
      );

    draw();

    return {
      redraw: draw,
      setPlayer,
      reset: resetTransform
    };
  }

  return {
    init
  };

})();
