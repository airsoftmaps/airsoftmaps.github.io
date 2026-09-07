/* =========================================================
   AIRSOFT MAPS
   HELL MODE
   ========================================================= */

(() => {

  const HELL_KEY = "airsoftmaps-hell";

  let active = false;
  let overlay = null;
  let world = null;
  let torch = null;

  let torchX = window.innerWidth / 2;
  let torchY = window.innerHeight / 2;

  /*
   * THREE FIXED PENTAGRAMS
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
     CREATE HELL
     ===================================================== */

  function createHell() {

    overlay = document.createElement("div");

    overlay.className = "hell-overlay";


    overlay.innerHTML = `

      <div class="hell-world">

        <!-- =========================================
             STONE WORLD
             ========================================= -->

        <svg
          class="hell-scene"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="none"
        >

          <defs>

            <!-- =====================================
                 STONE TEXTURE
                 ===================================== -->

            <filter
              id="stone-noise"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >

              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.018"
                numOctaves="4"
                seed="19"
                result="noise"
              />

              <feColorMatrix
                in="noise"
                type="saturate"
                values="0"
                result="gray"
              />

              <feComponentTransfer
                in="gray"
                result="stone"
              >

                <feFuncR
                  type="linear"
                  slope=".20"
                  intercept=".035"
                />

                <feFuncG
                  type="linear"
                  slope=".18"
                  intercept=".03"
                />

                <feFuncB
                  type="linear"
                  slope=".16"
                  intercept=".025"
                />

              </feComponentTransfer>

            </filter>


            <!-- =====================================
                 CARVED EDGE
                 ===================================== -->

            <filter
              id="carved-edge"
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
                in="blur"
                dx="2"
                dy="3"
                result="shadow"
              />

              <feFlood
                flood-color="#000000"
                flood-opacity=".95"
                result="shadowColor"
              />

              <feComposite
                in="shadowColor"
                in2="shadow"
                operator="in"
                result="shadowFinal"
              />

              <feMerge>

                <feMergeNode
                  in="shadowFinal"
                />

                <feMergeNode
                  in="SourceGraphic"
                />

              </feMerge>

            </filter>


            <!-- =====================================
                 PENTAGRAM GLOW
                 ===================================== -->

            <filter
              id="pentagram-glow"
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
               BASE STONE
               ========================================= -->

          <rect
            width="1600"
            height="1000"
            fill="#171513"
          />


          <!-- =========================================
               STONE VARIATION
               ========================================= -->

          <rect
            width="1600"
            height="1000"
            filter="url(#stone-noise)"
            opacity=".70"
          />


          <!-- =========================================
               DARK STONE BLOCKS
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

            <path d="
              M720 80
              L700 125
              L725 165
            "/>

            <path d="
              M320 650
              L295 690
              L315 735
            "/>

          </g>


          <!-- =========================================
               CARVED INSCRIPTIONS
               ========================================= -->

          <g
            class="hell-inscriptions"
            filter="url(#carved-edge)"
          >

            <text x="70" y="145">
              La Diablo estas vivanta ene de mia korpo!
            </text>

            <text x="850" y="335">
              Mi sangas pro la vundoj de inferaj trancxoj!
            </text>

            <text x="70" y="565">
              Lauxnome de nia dio Satano la plej brilanta!
            </text>

            <text x="900" y="785">
              Ni vekigu la lordon de la abismo!
            </text>

            <text x="200" y="915">
              Mi glutos vian animon!
            </text>

            <text x="1080" y="140">
              Aligxu al ni.
            </text>

            <text x="515" y="505">
              Mia nomo estas Legio, cxar ni estas multaj.
            </text>

          </g>


          <!-- =========================================
               BLACK PENTAGRAM
               FIXED POSITION
               ========================================= -->

          <g
            class="hell-symbol symbol-black"
            data-symbol="black"
          >

            <!-- deep carved groove -->

            <path
              class="pentagram-groove"
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

            <!-- stone edge -->

            <path
              class="pentagram-edge"
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
               GOLD PENTAGRAM
               FIXED POSITION
               ========================================= -->

          <g
            class="hell-symbol symbol-gold"
            data-symbol="gold"
          >

            <path
              class="pentagram-groove"
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

            <path
              class="pentagram-edge"
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
               RED PENTAGRAM
               FIXED POSITION
               ========================================= -->

          <g
            class="hell-symbol symbol-red"
            data-symbol="red"
          >

            <path
              class="pentagram-groove"
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

            <path
              class="pentagram-edge"
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

        </svg>


        <!-- =========================================
             MOVING TORCH LIGHT
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


    world =
      overlay.querySelector(
        ".hell-world"
      );


    torch =
      overlay.querySelector(
        ".hell-torch"
      );


    setupTorch();
    setupPentagrams();
    createParticles();

    updateTorch(
      torchX,
      torchY
    );


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

    const move = event => {

      updateTorch(
        event.clientX,
        event.clientY
      );

    };


    overlay.addEventListener(
      "pointermove",
      move,
      {
        passive: true
      }
    );


    overlay.addEventListener(
      "pointerdown",
      move,
      {
        passive: true
      }
    );

  }


  function updateTorch(
    x,
    y
  ) {

    torchX = x;
    torchY = y;


    if (torch) {

      torch.style.left =
        `${x}px`;

      torch.style.top =
        `${y}px`;

    }


    if (world) {

      world.style.setProperty(
        "--torch-x",
        `${x}px`
      );

      world.style.setProperty(
        "--torch-y",
        `${y}px`
      );

    }


    updatePentagramLighting();

  }


  /* =====================================================
     PENTAGRAM LIGHTING
     ===================================================== */

  function updatePentagramLighting() {

    if (!overlay) return;


    const symbols =
      overlay.querySelectorAll(
        ".hell-symbol"
      );


    symbols.forEach(
      symbol => {

        const rect =
          symbol.getBoundingClientRect();


        const centerX =
          rect.left +
          rect.width / 2;


        const centerY =
          rect.top +
          rect.height / 2;


        const dx =
          torchX -
          centerX;


        const dy =
          torchY -
          centerY;


        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        /*
         * Pentagram is physically present
         * all the time.
         *
         * It becomes readable only
         * inside the torch.
         */

        symbol.classList.toggle(
          "torch-lit",
          distance < 300
        );

      }
    );

  }


  /* =====================================================
     PENTAGRAM INTERACTION
     ===================================================== */

  function setupPentagrams() {

    const symbols =
      overlay.querySelectorAll(
        ".hell-symbol"
      );


    symbols.forEach(
      symbol => {

        symbol.addEventListener(
          "click",
          event => {

            event.stopPropagation();


            /*
             * Must actually be illuminated
             * by the torch.
             */

            if (
              !symbol.classList.contains(
                "torch-lit"
              )
            ) {

              return;

            }


            const clicked =
              symbol.dataset.symbol;


            /*
             * =========================================
             * WRONG SYMBOL
             * =========================================
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


              symbol.classList.add(
                "symbol-wrong"
              );


              setTimeout(() => {

                symbol.classList.remove(
                  "symbol-wrong"
                );

              }, 500);


              return;

            }


            /*
             * =========================================
             * CORRECT SYMBOL
             * =========================================
             */

            symbol.classList.add(
              "symbol-hit"
            );


            setTimeout(() => {

              symbol.classList.remove(
                "symbol-hit"
              );

            }, 800);


            sequenceIndex++;


            /*
             * =========================================
             * ESCAPE
             * =========================================
             */

            if (
              sequenceIndex >=
              sequence.length
            ) {

              completeHell();

            }

          }
        );

      }
    );

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
     * DEAD GRAY ASH
     */

    for (
      let i = 0;
      i < 85;
      i++
    ) {

      const particle =
        document.createElement(
          "span"
        );


      particle.className =
        "ash-gray";


      particle.style.left =
        `${Math.random() * 100}%`;


      particle.style.animationDelay =
        `${Math.random() * 12}s`;


      particle.style.animationDuration =
        `${8 + Math.random() * 12}s`;


      particle.style.setProperty(
        "--drift",
        `${-70 + Math.random() * 140}px`
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
      i < 22;
      i++
    ) {

      const particle =
        document.createElement(
          "span"
        );


      particle.className =
        "ash-hot";


      particle.style.left =
        `${Math.random() * 100}%`;


      particle.style.animationDelay =
        `${Math.random() * 10}s`;


      particle.style.animationDuration =
        `${6 + Math.random() * 10}s`;


      particle.style.setProperty(
        "--drift",
        `${-80 + Math.random() * 160}px`
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
      i < 12;
      i++
    ) {

      const ember =
        document.createElement(
          "span"
        );


      ember.className =
        "ember";


      ember.style.left =
        `${Math.random() * 100}%`;


      ember.style.top =
        `${50 + Math.random() * 50}%`;


      ember.style.animationDelay =
        `${Math.random() * 5}s`;


      ember.style.animationDuration =
        `${1.1 + Math.random() * 2.2}s`;


      embers.appendChild(
        ember
      );

    }

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


    if (!overlay) return;


    overlay.classList.add(
      "hell-escape"
    );


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
     AUTO START
     ===================================================== */

  if (isHellActive()) {

    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        () => {

          window.startHell();

        },
        {
          once: true
        }
      );

    } else {

      window.startHell();

    }

  }

})();
