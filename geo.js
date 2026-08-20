/* ==========================================================================
   AIRSOFT MAPS — geo.js
   GPS -> grid transformace + geofence
   ========================================================================== */

const AMGeo = (() => {

  function solve3x3(A, b) {
    const m = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < 3; i++) {

      let pivot = i;

      for (let r = i + 1; r < 3; r++) {
        if (Math.abs(m[r][i]) > Math.abs(m[pivot][i])) {
          pivot = r;
        }
      }

      if (Math.abs(m[pivot][i]) < 1e-14) {
        return null;
      }

      [m[i], m[pivot]] = [m[pivot], m[i]];

      const div = m[i][i];

      for (let c = i; c < 4; c++) {
        m[i][c] /= div;
      }

      for (let r = 0; r < 3; r++) {
        if (r === i) continue;

        const factor = m[r][i];

        for (let c = i; c < 4; c++) {
          m[r][c] -= factor * m[i][c];
        }
      }
    }

    return [
      m[0][3],
      m[1][3],
      m[2][3]
    ];
  }

  function fitAffine(anchors) {

    if (!anchors || anchors.length < 3) {
      return null;
    }

    /*
      Model:

      lat = a * col + b * row + e
      lng = c * col + d * row + f
    */

    const A = anchors.map(p => [
      p.col,
      p.row,
      1
    ]);

    const normal = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    for (const row of A) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          normal[i][j] += row[i] * row[j];
        }
      }
    }

    const latB = [0, 0, 0];
    const lngB = [0, 0, 0];

    anchors.forEach((p, index) => {
      for (let i = 0; i < 3; i++) {
        latB[i] += A[index][i] * p.lat;
        lngB[i] += A[index][i] * p.lng;
      }
    });

    const latSol = solve3x3(normal, latB);
    const lngSol = solve3x3(normal, lngB);

    if (!latSol || !lngSol) {
      return null;
    }

    const [a, b, e] = latSol;
    const [c, d, f] = lngSol;

    const det = a * d - b * c;

    if (Math.abs(det) < 1e-14) {
      return null;
    }

    return {

      toLatLng(col, row) {
        return {
          lat: a * col + b * row + e,
          lng: c * col + d * row + f
        };
      },

      toGrid(lat, lng) {

        const L1 = lat - e;
        const L2 = lng - f;

        return {
          col: (L1 * d - b * L2) / det,
          row: (a * L2 - L1 * c) / det
        };
      }

    };
  }

  function pointInBoundary(col, row, boundary) {

    if (!boundary || boundary.length < 3) {
      return false;
    }

    let inside = false;

    for (
      let i = 0, j = boundary.length - 1;
      i < boundary.length;
      j = i++
    ) {

      const [xi, yi] = boundary[i];
      const [xj, yj] = boundary[j];

      const intersects =
        ((yi > row) !== (yj > row)) &&
        (
          col <
          (xj - xi) *
          (row - yi) /
          (yj - yi || 1e-12) +
          xi
        );

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }

  function watch(data, onUpdate) {

    if (!data.geoAnchors || data.geoAnchors.length < 3) {
      onUpdate({
        ok: false,
        reason: "noAnchors"
      });
      return null;
    }

    const transform = fitAffine(data.geoAnchors);

    if (!transform) {
      onUpdate({
        ok: false,
        reason: "badAnchors"
      });
      return null;
    }

    if (!("geolocation" in navigator)) {
      onUpdate({
        ok: false,
        reason: "unavailable"
      });
      return null;
    }

    return navigator.geolocation.watchPosition(

      position => {

        const {
          latitude,
          longitude,
          accuracy
        } = position.coords;

        const grid = transform.toGrid(
          latitude,
          longitude
        );

        const inside = pointInBoundary(
          grid.col,
          grid.row,
          data.boundary
        );

        onUpdate({
          ok: true,
          col: grid.col,
          row: grid.row,
          inside,
          accuracy
        });
      },

      error => {

        let reason = "unavailable";

        if (error.code === 1) {
          reason = "denied";
        }

        if (error.code === 2) {
          reason = "unavailable";
        }

        if (error.code === 3) {
          reason = "timeout";
        }

        onUpdate({
          ok: false,
          reason
        });
      },

      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000
      }
    );
  }

  function stop(watchId) {

    if (
      watchId != null &&
      "geolocation" in navigator
    ) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  return {
    fitAffine,
    solveAffine: fitAffine,
    pointInBoundary,
    watch,
    stop
  };

})();
