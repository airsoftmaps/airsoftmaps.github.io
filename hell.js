/* =========================================================
   AIRSOFT MAPS - HELL
   ========================================================= */

(() => {

  let active = false;
  let overlay = null;
  let torch = null;

  /* =====================================================
     HELL STATE
     ===================================================== */

  const HELL_KEY = "airsoftmaps-hell";

  function isHell() {
    return localStorage.getItem(HELL_KEY) === "true";
  }


  /* =====================================================
     START HELL
     ===================================================== */

  window.startHell = function () {

    if (active) return;

    active = true;

    document.documentElement.setAttribute(
      "data-hell",
      "true"
    );

    createHell();

  };


  /* =====================================================
     CREATE WORLD
     ===================================================== */

  function createHell() {

    overlay = document.createElement("div");

    overlay.className = "hell-overlay";

    overlay.innerHTML = `

      <div class="hell-world">

        <div class="hell-wall">

          <svg
            class="hell-stone-svg"
            viewBox="0 0 1600 1000"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >

            <defs>

              <!-- STONE -->
              <filter
                id="stoneNoise"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.018"
                  numOctaves="4"
                  seed="17"
                />

                <feColorMatrix
                  type="matrix"
                  values="
                    0.22 0 0 0 0
                    0 0.22 0 0 0
                    0 0 0.22 0 0
                    0 0 0 1 0
                  "
                />
              </filter>


              <!-- CARVED TEXT -->
              <filter
                id="carved"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >

                <feGaussianBlur
                  in="SourceAlpha"
                  stdDeviation="1.2"
                  result="blur"
                />

                <feOffset
                  dx="1"
                  dy="2"
                  result="offset"
                />

                <feFlood
                  flood-color="#000"
                  flood-opacity="0.95"
                  result="dark"
                />

                <feComposite
                  in="dark"
                  in2="offset"
                  operator="in"
                  result="shadow"
                />

                <feMerge>
                  <feMergeNode in="shadow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>

              </filter>


              <!-- TORCH LIGHT -->
              <radialGradient id="torchGradient">

                <stop
                  offset="0%"
                  stop-color="white"
                  stop-opacity="0.95"
                />

                <stop
                  offset="25%"
                  stop-color="#f4b35a"
                  stop-opacity="0.45"
                />

                <stop
                  offset="65%"
                  stop-color="#8b4215"
                  stop-opacity="0.12"
                />

                <stop
                  offset="100%"
                  stop-color="black"
                  stop-opacity="0"
                />

              </radialGradient>


              <!-- EMBER -->
              <radialGradient id="emberGlow">

                <stop
                  offset="0%"
                  stop-color="#fff1a8"
                  stop-opacity="1"
                />

                <stop
                  offset="25%"
                  stop-color="#ff7a18"
                  stop-opacity="0.95"
                />

                <stop
                  offset="65%"
                  stop-color="#7d1608"
                  stop-opacity="0.35"
                />

                <stop
                  offset="100%"
                  stop-color="#000"
                  stop-opacity="0"
                />

              </radialGradient>

            </defs>


            <!-- DARK STONE -->
            <rect
              width="1600"
              height="1000"
              fill="#090807"
            />

            <rect
              width="1600"
              height="1000"
              filter="url(#stoneNoise)"
              opacity="0.65"
            />


            <!-- STONE BLOCKS -->

            <g
              class="hell-stone-lines"
              opacity="0.45"
            >

              <path d="M0 180 H1600"/>
              <path d="M0 390 H1600"/>
              <path d="M0 625 H1600"/>
              <path d="M0 825 H1600"/>

              <path d="M240 0 V180"/>
              <path d="M880 0 V180"/>
              <path d="M1360 0 V180"/>

              <path d="M120 180 V390"/>
              <path d="M620 180 V390"/>
              <path d="M1180 180 V390"/>

              <path d="M350 390 V625"/>
              <path d="M950 390 V625"/>
              <path d="M1450 390 V625"/>

              <path d="M160 625 V825"/>
              <path d="M720 625 V825"/>
              <path d="M1250 625 V825"/>

            </g>


            <!-- CARVED INSCRIPTIONS -->

            <g
              class="hell-carvings"
              filter="url(#carved)"
            >

              <text x="150" y="145">
                La Diablo estas vivanta ene de mia korpo!
              </text>

              <text x="830" y="330">
                Mi sangas pro la vundoj de inferaj trancxoj!
              </text>

              <text x="90" y="555">
                Lauxnome de nia dio Satano la plej brilanta!
              </text>

              <text x="910" y="760">
                Ni vekigu la lordon de la abismo!
              </text>

              <text x="220" y="930">
                Mi glutos vian animon!
              </text>

              <text x="1060" y="120">
                Aligxu al ni.
              </text>

              <text x="500" y="500">
                Mia nomo estas Legio, cxar ni estas multaj.
              </text>

            </g>


            <!-- PENTAGRAMS -->

            <g class="hell-pentagrams">

              <!-- BLACK -->
              <g
                class="hell-pentagram pentagram-black"
                data-symbol="black"
                data-order="1"
              >
                <path
                  d="M300 245
                     L330 335
                     L425 335
                     L348 390
                     L377 480
                     L300 425
                     L223 480
                     L252 390
                     L175 335
                     L270 335 Z"
                />
              </g>


              <!-- GOLD -->
              <g
                class="hell-pentagram pentagram-gold"
                data-symbol="gold"
                data-order="2"
              >
                <path
                  d="M800 245
                     L830 335
                     L925 335
                     L848 390
                     L877 480
                     L800 425
                     L723 480
                     L752 390
                     L675 335
                     L770 335 Z"
                />
              </g>


              <!-- RED -->
              <g
                class="hell-pentagram pentagram-red"
                data-symbol="red"
                data-order="3"
              >
                <path
                  d="M1280 245
                     L1310 335
                     L1405 335
                     L1328 390
                     L1357 480
                     L1280 425
                     L1203 480
                     L1232 390
                     L1155 335
                     L1250 335 Z"
                />
              </g>

            </g>

          </svg>


          <!-- TORCH -->

          <div
            class="hell-torch"
            aria-hidden="true"
          ></div>


          <!-- EMBERS -->

          <div class="hell-embers"></div>


          <!-- ASH -->

          <div class="hell-ash"></div>


          <!-- PLAYER MESSAGE -->

          <div class="hell-warning">
            NENÍ CESTY ZPĚT...
          </div>

        </div>

      </div>

    `;

    document.body.appendChild(overlay);

    torch =
      overlay.querySelector(".hell-torch");

    setupTorch();

    createAsh();

    setupPentagrams();

    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });

  }


  /* =====================================================
     TORCH
     ===================================================== */

  function setupTorch() {

    function moveTorch(x, y) {

      if (!torch) return;

      torch.style.left = `${x}px`;
      torch.style.top = `${y}px`;

    }


    overlay.addEventListener(
      "pointermove",
      event => {

        moveTorch(
          event.clientX,
          event.clientY
        );

      },
      { passive: true }
    );


    overlay.addEventListener(
      "pointerdown",
      event => {

        moveTorch(
          event.clientX,
          event.clientY
        );

      },
      { passive: true }
    );


    /*
     * Start near center.
     */

    moveTorch(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

  }


  /* =====================================================
     PENTAGRAM SEQUENCE
     ===================================================== */

  const sequence = [
    "black",
    "gold",
    "red",
    "gold",
    "black"
  ];

  let sequenceIndex = 0;


  function setupPentagrams() {

    const symbols =
      overlay.querySelectorAll(
        ".hell-pentagram"
      );

    symbols.forEach(symbol => {

      symbol.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const clicked =
            symbol.dataset.symbol;

          if (
            clicked ===
            sequence[sequenceIndex]
          ) {

            symbol.classList.add(
              "hell-symbol-hit"
            );

            setTimeout(() => {
              symbol.classList.remove(
                "hell-symbol-hit"
              );
            }, 900);

            sequenceIndex++;

            if (
              sequenceIndex >=
              sequence.length
            ) {

              completeHell();

            }

          } else {

            /*
             * Wrong symbol.
             * Sequence resets.
             */

            sequenceIndex = 0;

            symbols.forEach(s =>
              s.classList.remove(
                "hell-symbol-hit"
              )
            );

          }

        }
      );

    });

  }


  /* =====================================================
     COMPLETE HELL
     ===================================================== */

  function completeHell() {

    localStorage.removeItem(
      HELL_KEY
    );

    document.documentElement.removeAttribute(
      "data-hell"
    );

    if (overlay) {

      overlay.classList.remove(
        "active"
      );

      setTimeout(() => {

        overlay.remove();

        overlay = null;
        torch = null;
        active = false;

      }, 900);

    }

  }


  /* =====================================================
     ASH
     ===================================================== */

  function createAsh() {

    const ash =
      overlay.querySelector(
        ".hell-ash"
      );

    const embers =
      overlay.querySelector(
        ".hell-embers"
      );


    for (let i = 0; i < 70; i++) {

      const particle =
        document.createElement("span");

      particle.className =
        Math.random() > 0.72
          ? "hot"
          : "cold";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.animationDelay =
        `${Math.random() * 8}s`;

      particle.style.animationDuration =
        `${5 + Math.random() * 8}s`;

      ash.appendChild(particle);

    }


    for (let i = 0; i < 14; i++) {

      const ember =
        document.createElement("span");

      ember.className =
        "ember";

      ember.style.left =
        `${Math.random() * 100}%`;

      ember.style.top =
        `${55 + Math.random() * 45}%`;

      ember.style.animationDelay =
        `${Math.random() * 5}s`;

      embers.appendChild(
        ember
      );

    }

  }


  /* =====================================================
     AUTO START
     ===================================================== */

  if (isHell()) {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        () => window.startHell(),
        { once: true }
      );

    } else {

      window.startHell();

    }

  }

})();
