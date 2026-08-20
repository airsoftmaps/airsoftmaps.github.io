/* ==========================================================================
   AIRSOFT MAPS — geo.js
   Vlastní poloha hráče na mapě. Žádný backend, žádné sdílení mezi hráči —
   jen převod GPS polohy prohlížeče na souřadnice grid systému hřiště
   a kontrola, jestli je hráč uvnitř hranice (geofence).

   Pro hřiště, které nemá geoAnchors (např. CQB haly bez GPS podkladu),
   se tečka polohy vůbec nenabízí — viz použití v dalov.html.
   ========================================================================== */

const AMGeo = (function () {

  function solveAffine(anchors) {
    if (!anchors || anchors.length < 3) return null;
    const A = anchors.slice(0, 3).map(p => [p.col, p.row, 1]);

    function det3(m) {
      return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
           - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
           + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    }
    function replaceCol(m, col, vec) {
      return m.map((row, i) => row.map((v, j) => (j === col ? vec[i] : v)));
    }
    function solve3(bVec) {
      const D = det3(A);
      if (Math.abs(D) < 1e-12) return null;
      const Dx = det3(replaceCol(A, 0, bVec));
      const Dy = det3(replaceCol(A, 1, bVec));
      const Dz = det3(replaceCol(A, 2, bVec));
      return [Dx / D, Dy / D, Dz / D];
    }

    const latSol = solve3(anchors.slice(0, 3).map(p => p.lat));
    const lngSol = solve3(anchors.slice(0, 3).map(p => p.lng));
    if (!latSol || !lngSol) return null;

    const [a, b, e] = latSol;
    const [c, d, f] = lngSol;
    const det2 = a * d - b * c;
    if (Math.abs(det2) < 1e-12) return null;

    return {
      toLatLng(col, row) {
        return { lat: a * col + b * row + e, lng: c * col + d * row + f };
      },
      toGrid(lat, lng) {
        const L1 = lat - e, L2 = lng - f;
        return { col: (L1 * d - b * L2) / det2, row: (a * L2 - L1 * c) / det2 };
      }
    };
  }

  function pointInBoundary(col, row, boundary) {
    let inside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
      const [xi, yi] = boundary[i], [xj, yj] = boundary[j];
      const crosses = ((yi > row) !== (yj > row)) &&
        (col < (xj - xi) * (row - yi) / (yj - yi || 1e-9) + xi);
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function watch(data, onUpdate) {
    if (!data.geoAnchors || data.geoAnchors.length < 3) {
      onUpdate({ ok: false, reason: "no-anchors" });
      return null;
    }
    const transform = solveAffine(data.geoAnchors);
    if (!transform) {
      onUpdate({ ok: false, reason: "bad-anchors" });
      return null;
    }
    if (!("geolocation" in navigator)) {
      onUpdate({ ok: false, reason: "no-geolocation" });
      return null;
    }

    return navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const grid = transform.toGrid(latitude, longitude);
        const inside = pointInBoundary(grid.col, grid.row, data.boundary);
        onUpdate({ ok: true, col: grid.col, row: grid.row, inside, accuracy });
      },
      err => {
        const reason = err.code === 1 ? "denied" : err.code === 2 ? "unavailable" : "timeout";
        onUpdate({ ok: false, reason });
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }

  function stop(watchId) {
    if (watchId != null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  return { solveAffine, pointInBoundary, watch, stop };
})();
