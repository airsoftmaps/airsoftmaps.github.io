/* =========================================================
   AIRSOFT MAPS
   HELL MODE
   ========================================================= */

(() => {

  const HELL_KEY = "airsoftmaps-hell";

  let active = false;
  let overlay = null;
  let torch = null;

  /*
   * EXACT ESCAPE SEQUENCE
   *
   * Three physical pentagrams:
   * black, gold, red
   *
   * The player must visit them:
   *
   * BLACK → GOLD → RED → GOLD → BLACK
   */

  const sequence = [
    "black",
    "gold",
    "red",
    "gold",
    "black"
  ];

  let sequenceIndex = 0;


  /* =====================================================
     STATE
     ===================================================== */

  function isHellActive() {

    return (
      localStorage.getItem(HELL_KEY) === "true"
    );

  }


  /* =====================================================
     START HELL
     ===================================================== */

  window.startHell = function () {

    if (active) return;

    active = true;

    sequenceIndex = 0;

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

    overlay =
      document.createElement("div");

    overlay.className =
      "hell-overlay";


    overlay.innerHTML = `

      <div class="hell-world">

        <svg
          class="hell-scene"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >

          <defs>

            <!-- =========================================
                 STONE TEXTURE
                 ========================================= -->

            <filter
              id="hell-stone"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >

              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.014"
                numOctaves="5"
                seed="37"
              />

              <feColorMatrix
                type="matrix"
                values="
                  .24 0 0 0 0
                  0 .22 0 0 0
                  0 0 .20 0 0
                  0 0 0 1 0
                "
              />

            </filter>


            <!-- =========================================
                 CARVED STONE
                 ========================================= -->

            <filter
              id="hell-carving"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >

              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="1.3"
                result="blur"
              />

              <feOffset
                dx="2"
                dy="3"
                result="offset"
              />

              <feFlood
                flood-color="#000000"
                flood-opacity=".95"
                result="shadow"
              />

              <feComposite
                in="shadow"
                in2="offset"
                operator="in"
                result="cut"
              />

              <feMerge>

                <feMergeNode in="cut"/>
                <feMergeNode in="SourceGraphic"/>

              </feMerge>

            </filter>


            <!-- =========================================
                 TORCH
                 ========================================= -->

            <radialGradient
              id="torch-light"
            >

              <stop
                offset="0%"
                stop-color="#fff4cf"
                stop-opacity=".90"
              />

              <stop
                offset="18%"
                stop-color="#ffbf68"
                stop-opacity=".42"
              />

              <stop
                offset="48%"
                stop-color="#a74b15"
                stop-opacity=".13"
              />

              <stop
                offset="100%"
                stop-color="#000"
                stop-opacity="0"
              />

            </radialGradient>


            <!-- =========================================
                 PENTAGRAM GLOW
                 ========================================= -->

            <filter
              id="symbol-glow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >

              <feGaussianBlur
                stdDeviation="3"
                result="blur"
              />

              <feMerge>

                <feMergeNode
                  in="blur"
                />

                <feMergeNode
                  in="SourceGraphic"
                />

              </feMerge>

            </filter>

          </defs>


          <!-- =========================================
               DARK STONE WALL
               ========================================= -->

          <rect
            width="1600"
            height="1000"
            fill="#080706"
          />

          <rect
            width="1600"
            height="1000"
            filter="url(#hell-stone)"
            opacity=".72"
          />


          <!-- =========================================
               MASONRY
               ========================================= -->

          <g class="hell-masonry">

            <path d="M0 185 H1600"/>
            <path d="M0 390 H1600"/>
            <path d="M0 615 H1600"/>
            <path d="M0 825 H1600"/>

            <path d="M250 0 V185"/>
            <path d="M830 0 V185"/>
            <path d="M1335 0 V185"/>

            <path d="M110 185 V390"/>
            <path d="M610 185 V390"/>
            <path d="M1160 185 V390"/>

            <path d="M330 390 V615"/>
            <path d="M910 390 V615"/>
            <path d="M1460 390 V615"/>

            <path d="M170 615 V825"/>
            <path d="M720 615 V825"/>
            <path d="M1240 615 V825"/>

          </g>


          <!-- =========================================
               CRACKS
               ========================================= -->

          <g
            class="hell-cracks"
            fill="none"
          >

            <path d="
              M180 40
              L165 95
              L190 135
              L165 180
              L178 225
            "/>

            <path d="
              M520 210
              L490 260
              L510 300
              L475 350
              L490 390
            "/>

            <path d="
              M1080 400
              L1050 445
              L1080 480
              L1035 530
              L1050 615
            "/>

            <path d="
              M1420 630
              L1380 675
              L1410 720
              L1375 770
            "/>

          </g>


          <!-- =========================================
               CARVED INSCRIPTIONS
               ========================================= -->

          <g
            class="hell-inscriptions"
            filter="url(#hell-carving)"
          >

            <text x="80" y="150">
              La Diablo estas vivanta ene de mia korpo!
            </text>

            <text x="840" y="330">
              Mi sangas pro la vundoj de inferaj trancxoj!
            </text>

            <text x="75" y="570">
              Lauxnome de nia dio Satano la plej brilanta!
            </text>

            <text x="920" y="785">
              Ni vekigu la lordon de la abismo!
            </text>

            <text x="210" y="920">
              Mi glutos vian animon!
            </text>

            <text x="1090" y="145">
              Aligxu al ni.
            </text>

            <text x="520" y="500">
              Mia nomo estas Legio, cxar ni estas multaj.
            </text>

          </g>


          <!-- =========================================
               PENTAGRAM 1
               BLACK
               ========================================= -->

          <g
            class="hell-symbol symbol-black"
            data-symbol="black"
          >

            <path
              d="
                M300 220
                L338 330
                L455 330
                L360 400
                L398 515
                L300 445
                L202 515
                L240 400
                L145 330
                L262 330
                Z
              "
            />

          </g>


          <!-- =========================================
               PENTAGRAM 2
               GOLD
               ========================================= -->

          <g
            class="hell-symbol symbol-gold"
            data-symbol="gold"
          >

            <path
              d="
                M805 270
                L840 375
                L952 375
                L862 442
                L897 548
                L805 482
                L713 548
                L748 442
                L658 375
                L770 375
                Z
              "
            />

          </g>


          <!-- =========================================
               PENTAGRAM 3
               RED
               ========================================= -->

          <g
            class="hell-symbol symbol-red"
            data-symbol="red"
          >

            <path
              d="
                M1285 205
                L1320 310
                L1432 310
                L1342 377
                L1377 483
                L1285 417
                L1193 483
                L1228 377
                L1138 310
                L1250 310
                Z
              "
            />

          </g>


          <!-- =========================================
               TORCH LIGHT SOURCE
               ========================================= -->

          <circle
            class="hell-torch-svg"
            cx="800"
            cy="500"
            r="350"
          />

        </svg>


        <!-- =========================================
             MOVING LIGHT
             ========================================= -->

        <div class="hell-torch"></div>


        <!-- =========================================
             ASH
             ========================================= -->

        <div class="hell-ash"></div>


        <!-- =========================================
             EMBERS
             ========================================= -->

        <div class="hell-embers"></div>


        <!-- =========================================
             WARNING
             ========================================= -->

        <div class="hell-warning">
          NENÍ CESTY ZPĚT...
        </div>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    torch =
      overlay.querySelector(
        ".hell-torch"
      );


    setupTorch();
    setupPentagrams();
    createParticles();


    requestAnimationFrame(() => {

      overlay.classList.add(
        "active"
      );

    });

  }


  /* =====================================================
     TORCH
     ===================================================== */

  function setupTorch() {

    function moveTorch(x, y) {

      if (!torch) return;

      torch.style.left =
        `${x}px`;

      torch.style.top =
        `${y}px`;

    }


    overlay.addEventListener(
      "pointermove",
      event => {

        moveTorch(
          event.clientX,
          event.clientY
        );

      },
      {
        passive: true
      }
    );


    overlay.addEventListener(
      "pointerdown",
      event => {

        moveTorch(
          event.clientX,
          event.clientY
        );

      },
      {
        passive: true
      }
    );


    moveTorch(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

  }


  /* =====================================================
     PENTAGRAMS
     ===================================================== */

  function setupPentagrams() {

    const symbols =
      overlay.querySelectorAll(
        ".hell-symbol"
      );


    symbols.forEach(symbol => {

      symbol.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const clicked =
            symbol.dataset.symbol;


          /*
           * ---------------------------------------------
           * WRONG SYMBOL
           * ---------------------------------------------
           */

          if (
            clicked !==
            sequence[sequenceIndex]
          ) {

            sequenceIndex = 0;

            symbols.forEach(
              item => {

                item.classList.remove(
                  "symbol-hit"
                );

              }
            );

            return;

          }


          /*
           * ---------------------------------------------
           * CORRECT SYMBOL
           * ---------------------------------------------
           */

          symbol.classList.add(
            "symbol-hit"
          );


          setTimeout(() => {

            symbol.classList.remove(
              "symbol-hit"
            );

          }, 700);


          sequenceIndex++;


          /*
           * ---------------------------------------------
           * ESCAPE
           * ---------------------------------------------
           */

          if (
            sequenceIndex >=
            sequence.length
          ) {

            completeHell();

          }

        }
      );

    });

  }


  /* =====================================================
     PARTICLES
     ===================================================== */

  function createParticles() {

    const ash =
      overlay.querySelector(
        ".hell-ash"
      );

    const embers =
      overlay.querySelector(
        ".hell-embers"
      );


    /*
     * GRAY ASH
     */

    for (
      let i = 0;
      i < 75;
      i++
    ) {

      const particle =
        document.createElement("span");

      particle.className =
        "ash-gray";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.animationDelay =
        `${Math.random() * 12}s`;

      particle.style.animationDuration =
        `${7 + Math.random() * 11}s`;

      particle.style.setProperty(
        "--drift",
        `${-60 + Math.random() * 120}px`
      );

      ash.appendChild(
        particle
      );

    }


    /*
     * HOT ASH
     */

    for (
      let i = 0;
      i < 18;
      i++
    ) {

      const particle =
        document.createElement("span");

      particle.className =
        "ash-hot";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.animationDelay =
        `${Math.random() * 9}s`;

      particle.style.animationDuration =
        `${5 + Math.random() * 9}s`;

      particle.style.setProperty(
        "--drift",
        `${-70 + Math.random() * 140}px`
      );

      ash.appendChild(
        particle
      );

    }


    /*
     * EMBERS
     */

    for (
      let i = 0;
      i < 10;
      i++
    ) {

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
     COMPLETE
     ===================================================== */

  function completeHell() {

    /*
     * HELL IS OVER
     */

    localStorage.removeItem(
      HELL_KEY
    );

    document.documentElement.removeAttribute(
      "data-hell"
    );


    if (!overlay) return;


    overlay.classList.remove(
      "active"
    );


    setTimeout(() => {

      if (overlay) {
        overlay.remove();
      }

      overlay = null;
      torch = null;
      active = false;
      sequenceIndex = 0;

    }, 1000);

  }


  /* =====================================================
     AUTO START
     ===================================================== */

  if (isHellActive()) {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        () => window.startHell(),
        {
          once: true
        }
      );

    } else {

      window.startHell();

    }

  }

})();
