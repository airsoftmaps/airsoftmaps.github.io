/* =========================================================
   AIRSOFT MAPS - HELL MODE
   ========================================================= */

(() => {
  const HELL_KEY = "airsoftmaps-hell";

  let active = false;
  let overlay = null;
  let world = null;
  let torch = null;

  let torchX = window.innerWidth / 2;
  let torchY = window.innerHeight / 2;
  let rafPending = false;

  /*
   * SEKVENČNÍ HRADBA PENTAGRAMŮ:
   * BLACK -> GOLD -> RED -> GOLD -> BLACK
   */
  const sequence = ["black", "gold", "red", "gold", "black"];
  let sequenceIndex = 0;

  /* =====================================================
     STAV
     ===================================================== */

  function isHellActive() {
    return localStorage.getItem(HELL_KEY) === "true";
  }

  /* =====================================================
     START HELL
     ===================================================== */

  window.startHell = function () {
    if (active) return;

    active = true;
    sequenceIndex = 0;

    localStorage.setItem(HELL_KEY, "true");
    document.documentElement.setAttribute("data-hell", "true");

    createHell();
  };

  /* =====================================================
     CREATE HELL
     ===================================================== */

  function createHell() {
    overlay = document.createElement("div");
    overlay.className = "hell-overlay";

    overlay.innerHTML = `
      <div class="hell-world">

        <!-- =========================================
             STONE WORLD SVG
             ========================================= -->
        <svg
          class="hell-scene"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <!-- STONE NOISE FILTER -->
            <filter id="stone-noise" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="19" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
              <feComponentTransfer in="gray" result="stone">
                <feFuncR type="linear" slope=".20" intercept=".035" />
                <feFuncG type="linear" slope=".18" intercept=".03" />
                <feFuncB type="linear" slope=".16" intercept=".025" />
              </feComponentTransfer>
            </filter>

            <!-- CARVED EDGE FILTER -->
            <filter id="carved-edge" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
              <feOffset in="blur" dx="2" dy="3" result="shadow" />
              <feFlood flood-color="#000000" flood-opacity=".95" result="shadowColor" />
              <feComposite in="shadowColor" in2="shadow" operator="in" result="shadowFinal" />
              <feMerge>
                <feMergeNode in="shadowFinal" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- PENTAGRAM GLOW FILTER -->
            <filter id="pentagram-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- BASE STONE -->
          <rect width="1600" height="1000" fill="#171513" />

          <!-- STONE NOISE OVERLAY -->
          <rect width="1600" height="1000" filter="url(#stone-noise)" opacity=".75" />

          <!-- DARK MASONRY BLOCKS -->
          <g class="hell-masonry">
            <path d="M0 185 H1600" />
            <path d="M0 390 H1600" />
            <path d="M0 615 H1600" />
            <path d="M0 825 H1600" />

            <path d="M250 0 V185" />
            <path d="M830 0 V185" />
            <path d="M1335 0 V185" />

            <path d="M110 185 V390" />
            <path d="M610 185 V390" />
            <path d="M1160 185 V390" />

            <path d="M330 390 V615" />
            <path d="M910 390 V615" />
            <path d="M1460 390 V615" />

            <path d="M170 615 V825" />
            <path d="M720 615 V825" />
            <path d="M1240 615 V825" />
          </g>

          <!-- CRACKS -->
          <g class="hell-cracks" fill="none">
            <path d="M180 40 L165 95 L190 135 L165 180 L178 225" />
            <path d="M520 210 L490 260 L510 300 L475 350 L490 390" />
            <path d="M1080 400 L1050 445 L1080 480 L1035 530 L1050 615" />
            <path d="M1420 630 L1380 675 L1410 720 L1375 770" />
            <path d="M720 80 L700 125 L725 165" />
            <path d="M320 650 L295 690 L315 735" />
          </g>

          <!-- INSCRIPTIONS -->
          <g class="hell-inscriptions" filter="url(#carved-edge)">
            <text x="70" y="145">La Diablo estas vivanta ene de mia korpo!</text>
            <text x="850" y="335">Mi sangas pro la vundoj de inferaj trancxoj!</text>
            <text x="70" y="565">Lauxnome de nia dio Satano la plej brilanta!</text>
            <text x="900" y="785">Ni vekigu la lordon de la abismo!</text>
            <text x="200" y="915">Mi glutos vian animon!</text>
            <text x="1080" y="140">Aligxu al ni.</text>
            <text x="515" y="505">Mia nomo estas Legio, cxar ni estas multaj.</text>
          </g>

          <!-- BLACK PENTAGRAM -->
          <g class="hell-symbol symbol-black" data-symbol="black">
            <path class="pentagram-groove" d="M300 220 L338 330 L455 330 L360 400 L398 515 L300 445 L202 515 L240 400 L145 330 L262 330 Z" />
            <path class="pentagram-edge" d="M300 220 L338 330 L455 330 L360 400 L398 515 L300 445 L202 515 L240 400 L145 330 L262 330 Z" />
          </g>

          <!-- GOLD PENTAGRAM -->
          <g class="hell-symbol symbol-gold" data-symbol="gold">
            <path class="pentagram-groove" d="M805 270 L840 375 L952 375 L862 442 L897 548 L805 482 L713 548 L748 442 L658 375 L770 375 Z" />
            <path class="pentagram-edge" d="M805 270 L840 375 L952 375 L862 442 L897 548 L805 482 L713 548 L748 442 L658 375 L770 375 Z" />
          </g>

          <!-- RED PENTAGRAM -->
          <g class="hell-symbol symbol-red" data-symbol="red">
            <path class="pentagram-groove" d="M1285 205 L1320 310 L1432 310 L1342 377 L1377 483 L1285 417 L1193 483 L1228 377 L1138 310 L1250 310 Z" />
            <path class="pentagram-edge" d="M1285 205 L1320 310 L1432 310 L1342 377 L1377 483 L1285 417 L1193 483 L1228 377 L1138 310 L1250 310 Z" />
          </g>
        </svg>

        <!-- MOVING TORCH -->
        <div class="hell-torch"></div>

        <!-- ASH & EMBERS -->
        <div class="hell-ash"></div>
        <div class="hell-embers"></div>

        <!-- WARNING -->
        <div class="hell-warning">NENÍ CESTY ZPĚT...</div>
      </div>
    `;

    document.body.appendChild(overlay);

    world = overlay.querySelector(".hell-world");
    torch = overlay.querySelector(".hell-torch");

    setupTorch();
    setupPentagrams();
    createParticles();

    updateTorchPosition(torchX, torchY);

    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });
  }

  /* =====================================================
     TORCH HANDLING
     ===================================================== */

  function setupTorch() {
    const onMove = (event) => {
      let clientX = event.clientX;
      let clientY = event.clientY;

      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      torchX = clientX;
      torchY = clientY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          updateTorchPosition(torchX, torchY);
          rafPending = false;
        });
      }
    };

    overlay.addEventListener("pointermove", onMove, { passive: true });
    overlay.addEventListener("pointerdown", onMove, { passive: true });
    overlay.addEventListener("touchmove", onMove, { passive: true });
  }

  function updateTorchPosition(x, y) {
    if (torch) {
      torch.style.left = `${x}px`;
      torch.style.top = `${y}px`;
    }

    if (world) {
      world.style.setProperty("--torch-x", `${x}px`);
      world.style.setProperty("--torch-y", `${y}px`);
    }

    updatePentagramLighting(x, y);
  }

  /* =====================================================
     PENTAGRAM LIGHTING
     ===================================================== */

  function updatePentagramLighting(x, y) {
    if (!overlay) return;

    const symbols = overlay.querySelectorAll(".hell-symbol");

    symbols.forEach((symbol) => {
      const rect = symbol.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Pokud je pochodeň blízko (pod 300px), symbol se rozsvítí
      symbol.classList.toggle("torch-lit", distance < 300);
    });
  }

  /* =====================================================
     PENTAGRAM INTERACTION
     ===================================================== */

  function setupPentagrams() {
    const symbols = overlay.querySelectorAll(".hell-symbol");

    symbols.forEach((symbol) => {
      symbol.addEventListener("click", (event) => {
        event.stopPropagation();

        if (!symbol.classList.contains("torch-lit")) {
          return;
        }

        const clicked = symbol.dataset.symbol;

        /* SHODA SEKVENČNÍHO KLÍČE */
        if (clicked !== sequence[sequenceIndex]) {
          sequenceIndex = 0;

          symbols.forEach((item) => item.classList.remove("symbol-hit"));

          symbol.classList.add("symbol-wrong");
          setTimeout(() => {
            symbol.classList.remove("symbol-wrong");
          }, 450);

          return;
        }

        /* SPRÁVNÝ KLIK */
        symbol.classList.add("symbol-hit");
        setTimeout(() => {
          symbol.classList.remove("symbol-hit");
        }, 800);

        sequenceIndex++;

        /* DOKONČENÍ HELL MÓDU */
        if (sequenceIndex >= sequence.length) {
          completeHell();
        }
      });
    });
  }

  /* =====================================================
     PARTICLES
     ===================================================== */

  function createParticles() {
    const ashContainer = overlay.querySelector(".hell-ash");
    const embersContainer = overlay.querySelector(".hell-embers");

    if (!ashContainer || !embersContainer) return;

    // Studený popel
    for (let i = 0; i < 70; i++) {
      const particle = document.createElement("span");
      particle.className = "ash-gray";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${7 + Math.random() * 10}s`;
      particle.style.setProperty("--drift", `${-60 + Math.random() * 120}px`);
      ashContainer.appendChild(particle);
    }

    // Žhavé jiskry
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("span");
      particle.className = "ash-hot";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${5 + Math.random() * 8}s`;
      particle.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
      ashContainer.appendChild(particle);
    }

    // Pulzující uhlíky
    for (let i = 0; i < 14; i++) {
      const ember = document.createElement("span");
      ember.className = "ember";
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.top = `${40 + Math.random() * 55}%`;
      ember.style.animationDelay = `${Math.random() * 4}s`;
      ember.style.animationDuration = `${1.2 + Math.random() * 2}s`;
      embersContainer.appendChild(ember);
    }
  }

  /* =====================================================
     ESCAPE HELL
     ===================================================== */

  function completeHell() {
    localStorage.removeItem(HELL_KEY);
    document.documentElement.removeAttribute("data-hell");

    if (!overlay) return;

    overlay.classList.add("hell-escape");

    setTimeout(() => {
      if (overlay) {
        overlay.remove();
      }

      overlay = null;
      world = null;
      torch = null;
      active = false;
      sequenceIndex = 0;
    }, 1200);
  }

  /* =====================================================
     AUTO INIT
     ===================================================== */

  if (isHellActive()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => window.startHell(), { once: true });
    } else {
      window.startHell();
    }
  }
})();
