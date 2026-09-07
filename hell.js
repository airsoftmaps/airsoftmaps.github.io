/* =========================================================
   AIRSOFT MAPS - HELL
   VISIT TO HELL

   PC:
   mouse = torch

   MOBILE:
   finger = torch
   ========================================================= */

(() => {

  let hellActive = false;

  let sequence = [];
  let torchX = window.innerWidth / 2;
  let torchY = window.innerHeight / 2;

  const correctSequence = [
    "black",
    "gold",
    "red",
    "gold",
    "black"
  ];


  /* =======================================================
     START HELL
     ======================================================= */

  window.startHell = function () {

    if (hellActive) return;

    hellActive = true;

    const overlay =
      document.createElement("div");

    overlay.className =
      "hell-overlay";

    overlay.innerHTML = `

      <div class="hell-world">

        <div class="hell-stone"></div>

        <div class="hell-inscriptions">

          <div
            class="hell-inscription hell-i1"
            data-text="LA DIABLO ESTAS VIVANTA ENE DE MIA KORPO!"
          >
            LA DIABLO ESTAS VIVANTA ENE DE MIA KORPO!
          </div>

          <div
            class="hell-inscription hell-i2"
            data-text="MI SANGAS PRO LA VUNDoJ DE INFERAJ TRANĈOJ!"
          >
            MI SANGAS PRO LA VUNDOJ DE INFERAJ TRANĈOJ!
          </div>

          <div
            class="hell-inscription hell-i3"
            data-text="LAŬNOME DE NIA DIO SATANO LA PLEJ BRILANTA!"
          >
            LAŬNOME DE NIA DIO SATANO LA PLEJ BRILANTA!
          </div>

          <div
            class="hell-inscription hell-i4"
            data-text="NI VEKIGU LA LORDON DE LA ABISMO!"
          >
            NI VEKIGU LA LORDON DE LA ABISMO!
          </div>

          <div
            class="hell-inscription hell-i5"
            data-text="MI GLUTOS VIAN ANIMON!"
          >
            MI GLUTOS VIAN ANIMON!
          </div>

        </div>

      </div>


      <div class="hell-ash-field"></div>

      <div class="hell-red-pulse"></div>

      <div
        class="hell-torch"
        style="
          --torch-x: 50vw;
          --torch-y: 50vh;
        "
      ></div>

      <div class="hell-vignette"></div>

      <div class="hell-exit">
        NENÍ CESTY ZPĚT...
      </div>

      <div class="hell-final-flash"></div>

      <div class="hell-return">

        <div class="hell-return-inner">

          <div class="hell-return-title">
            VÍTEJ ZPĚT Z PEKLA
          </div>

          <div class="hell-return-code"></div>

          <button
            class="hell-return-close"
            type="button"
            aria-label="Zavřít"
          >
            ×
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    createAsh(overlay);
    createEmbers(overlay);

    const torch =
      overlay.querySelector(".hell-torch");

    const exitText =
      overlay.querySelector(".hell-exit");

    const returnScreen =
      overlay.querySelector(".hell-return");

    const returnCode =
      overlay.querySelector(".hell-return-code");

    const finalFlash =
      overlay.querySelector(".hell-final-flash");

    const closeButton =
      overlay.querySelector(".hell-return-close");


    /* ===================================================
       TORCH POSITION
       =================================================== */

    function updateTorch(x, y) {

      torchX = x;
      torchY = y;

      torch.style.setProperty(
        "--torch-x",
        `${x}px`
      );

      torch.style.setProperty(
        "--torch-y",
        `${y}px`
      );
    }


    /*
     * PC
     */
    overlay.addEventListener(
      "pointermove",
      event => {

        updateTorch(
          event.clientX,
          event.clientY
        );

      },
      { passive: true }
    );


    /*
     * MOBILE
     *
     * Pochodeň následuje prst.
     */
    overlay.addEventListener(
      "touchstart",
      event => {

        const touch =
          event.touches[0];

        if (!touch) return;

        updateTorch(
          touch.clientX,
          touch.clientY
        );

      },
      { passive: true }
    );


    overlay.addEventListener(
      "touchmove",
      event => {

        const touch =
          event.touches[0];

        if (!touch) return;

        updateTorch(
          touch.clientX,
          touch.clientY
        );

      },
      { passive: true }
    );


    /*
     * Kliknutí / dotyk používáme také
     * jako ovládání sekvence.
     */
    overlay.addEventListener(
      "click",
      event => {

        handleHellInteraction(
          event,
          overlay
        );

      }
    );


    overlay.addEventListener(
      "touchend",
      event => {

        const touch =
          event.changedTouches[0];

        if (!touch) return;

        handleHellInteraction(
          {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault() {}
          },
          overlay
        );

      },
      { passive: true }
    );


    /* ===================================================
       CLOSE
       =================================================== */

    closeButton.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        overlay.remove();

        hellActive = false;

      }
    );


    /* ===================================================
       INITIAL POSITION
       =================================================== */

    updateTorch(
      window.innerWidth / 2,
      window.innerHeight / 2
    );


    /*
     * Jemné zpoždění po vstupu,
     * aby první frame nebyl okamžitě ostrý.
     */
    requestAnimationFrame(() => {

      overlay.classList.add(
        "hell-ready"
      );

    });

  };


  /* =======================================================
     ASH
     ======================================================= */

  function createAsh(overlay) {

    const field =
      overlay.querySelector(
        ".hell-ash-field"
      );

    const count =
      window.innerWidth < 700
        ? 70
        : 110;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const ash =
        document.createElement("div");

      ash.className =
        "hell-ash";

      ash.style.setProperty(
        "--x",
        `${Math.random() * 100}%`
      );

      ash.style.setProperty(
        "--size",
        `${1 + Math.random() * 3}px`
      );

      ash.style.setProperty(
        "--opacity",
        `${0.12 + Math.random() * 0.45}`
      );

      ash.style.setProperty(
        "--blur",
        `${Math.random() * 1.5}px`
      );

      ash.style.setProperty(
        "--duration",
        `${7 + Math.random() * 15}s`
      );

      ash.style.setProperty(
        "--delay",
        `${Math.random() * -20}s`
      );

      ash.style.setProperty(
        "--drift",
        `${-80 + Math.random() * 160}px`
      );

      field.appendChild(ash);
    }

  }


  /* =======================================================
     HOT EMBERS
     ======================================================= */

  function createEmbers(overlay) {

    const field =
      overlay.querySelector(
        ".hell-ash-field"
      );

    const count =
      window.innerWidth < 700
        ? 16
        : 28;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const ember =
        document.createElement("div");

      ember.className =
        "hell-ash hell-ember";

      ember.style.setProperty(
        "--x",
        `${Math.random() * 100}%`
      );

      ember.style.setProperty(
        "--size",
        `${2 + Math.random() * 4}px`
      );

      ember.style.setProperty(
        "--opacity",
        `${0.35 + Math.random() * 0.6}`
      );

      ember.style.setProperty(
        "--blur",
        `${Math.random() * 0.8}px`
      );

      ember.style.setProperty(
        "--duration",
        `${5 + Math.random() * 12}s`
      );

      ember.style.setProperty(
        "--delay",
        `${Math.random() * -15}s`
      );

      ember.style.setProperty(
        "--drift",
        `${-120 + Math.random() * 240}px`
      );

      field.appendChild(ember);
    }

  }


  /* =======================================================
     SECRET HELL INTERACTION
     ======================================================= */

  function handleHellInteraction(
    event,
    overlay
  ) {

    if (!hellActive) return;

    /*
     * Nedovolíme kliknutí na tlačítko
     * návratu, aby ho pohltila sekvence.
     */
    if (
      event.target.closest &&
      event.target.closest(
        ".hell-return-close"
      )
    ) {
      return;
    }


    /*
     * Náhodně určujeme, který symbol
     * hráč právě „aktivoval“.
     *
     * Barvy nejsou vidět jako UI.
     * Jsou reprezentované krátkým
     * světelným zábleskem.
     */
    const options = [
      "black",
      "gold",
      "red"
    ];

    const chosen =
      options[
        Math.floor(
          Math.random() *
          options.length
        )
      ];


    sequence.push(chosen);

    const expected =
      correctSequence[
        sequence.length - 1
      ];


    /*
     * SPRÁVNĚ
     */
    if (chosen === expected) {

      correctPulse(
        overlay,
        chosen
      );

      if (
        sequence.length >=
        correctSequence.length
      ) {

        finishHell(
          overlay
        );

      }

      return;
    }


    /*
     * ŠPATNĚ
     */
    sequence = [];

    wrongPulse(
      overlay
    );

  }


  /* =======================================================
     CORRECT
     ======================================================= */

  function correctPulse(
    overlay,
    type
  ) {

    const flash =
      document.createElement("div");

    flash.style.position =
      "fixed";

    flash.style.inset = "0";

    flash.style.zIndex = "80";

    flash.style.pointerEvents =
      "none";

    flash.style.background =
      type === "red"
        ? "rgba(160,0,0,.18)"
        : type === "gold"
          ? "rgba(255,170,40,.12)"
          : "rgba(255,255,255,.06)";

    flash.style.opacity = "0";

    flash.style.transition =
      "opacity .12s ease";

    overlay.appendChild(flash);

    requestAnimationFrame(() => {

      flash.style.opacity = "1";

      setTimeout(() => {

        flash.style.opacity = "0";

        setTimeout(() => {
          flash.remove();
        }, 180);

      }, 90);

    });

  }


  /* =======================================================
     WRONG
     ======================================================= */

  function wrongPulse(overlay) {

    const flash =
      document.createElement("div");

    flash.style.position =
      "fixed";

    flash.style.inset = "0";

    flash.style.zIndex = "80";

    flash.style.pointerEvents =
      "none";

    flash.style.background =
      "rgba(120,0,0,.22)";

    overlay.appendChild(flash);

    requestAnimationFrame(() => {

      flash.style.opacity = "0";

      flash.style.transition =
        "opacity .4s ease";

      setTimeout(() => {
        flash.remove();
      }, 450);

    });

  }


  /* =======================================================
     FINISH
     ======================================================= */

  function finishHell(overlay) {

    const flash =
      overlay.querySelector(
        ".hell-final-flash"
      );

    /*
     * Krátký brutální záblesk.
     */

    flash.style.transition =
      "opacity .08s ease";

    flash.style.opacity = "1";


    setTimeout(() => {

      flash.style.transition =
        "opacity .7s ease";

      flash.style.opacity = "0";

    }, 90);


    /*
     * Celé peklo zmizí do černé.
     */

    setTimeout(() => {

      overlay
        .querySelector(".hell-world")
        .style.opacity = "0";

      overlay
        .querySelector(".hell-ash-field")
        .style.opacity = "0";

      overlay
        .querySelector(".hell-torch")
        .style.opacity = "0";

      overlay
        .querySelector(".hell-red-pulse")
        .style.opacity = "0";

      overlay
        .querySelector(".hell-exit")
        .style.opacity = "0";

    }, 180);


    /*
     * Návratová obrazovka.
     */

    setTimeout(() => {

      const returnScreen =
        overlay.querySelector(
          ".hell-return"
        );

      const code =
        overlay.querySelector(
          ".hell-return-code"
        );

      code.textContent =
        generateHellCode();

      returnScreen.classList.add(
        "active"
      );

    }, 1200);

  }


  /* =======================================================
     CODE
     ======================================================= */

  function generateHellCode() {

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "AM-HELL-";

    for (
      let i = 0;
      i < 4;
      i++
    ) {

      result +=
        chars[
          Math.floor(
            Math.random() *
            chars.length
          )
        ];

    }

    return result;

  }


})();
