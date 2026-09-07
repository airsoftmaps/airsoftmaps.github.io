/* =========================================================
   AIRSOFT MAPS - OLYMPUS GOD MODE: WRATH OF ZEUS
   + SECRET 6-6-6 HELL SEQUENCE
   ========================================================= */

(() => {
  const HOLD_TIME = 3000;

  function initGodMode() {

    const isGodMode =
      document.documentElement.getAttribute("data-theme") === "god-mode" ||
      (typeof AM !== "undefined" &&
       typeof AM.getTheme === "function" &&
       AM.getTheme() === "god-mode");

    if (isGodMode) {
      document.documentElement.setAttribute("data-theme", "god-mode");
    }

    let lastKnownLang = null;

    function updateTexts() {
      const currentLang =
        (typeof AM !== "undefined" &&
         typeof AM.getLang === "function")
          ? AM.getLang()
          : "cs";

      if (currentLang === lastKnownLang) return;
      lastKnownLang = currentLang;

      const subtitleEl =
        document.querySelector(".am-menu-subtitle");

      if (subtitleEl) {
        const subText =
          currentLang === "en"
            ? "⚡ WELCOME AMONG THE IMMORTALS ⚡"
            : "⚡ VÍTEJ MEZI NESMRTELNÝMI ⚡";

        subtitleEl.setAttribute(
          "data-divine-sub",
          subText
        );
      }

      const holdTextEl =
        document.querySelector(".divine-hold-text");

      if (holdTextEl) {
        holdTextEl.textContent =
          currentLang === "en"
            ? "ASCENDING TO OLYMPUS"
            : "VYSTUPUJEŠ NA OLYMP";
      }
    }


    /* =====================================================
       THUNDER
       ===================================================== */

    const thunderSound = new Audio("thunder.mp3");
    thunderSound.volume = 0.5;

    const lightning = document.createElement("div");
    lightning.className = "divine-lightning";

    const transition = document.createElement("div");
    transition.className = "divine-transition";

    const hold = document.createElement("div");
    hold.className = "divine-hold";

    hold.innerHTML = `
      <div class="divine-hold-text">
        DÍVÁŠ SE BOHŮM DO TVÁŘE
      </div>

      <div class="divine-hold-bar">
        <div class="divine-hold-progress"></div>
      </div>
    `;

    document.body.append(
      lightning,
      transition,
      hold
    );

    const progress =
      hold.querySelector(".divine-hold-progress");


    /* =====================================================
       THEME
       ===================================================== */

    updateTexts();

    let lastKnownTheme = null;

    function checkTheme() {

      const themeNow =
        document.documentElement.getAttribute("data-theme");

      if (themeNow === lastKnownTheme) return;

      lastKnownTheme = themeNow;

      if (themeNow === "god-mode") {

        scheduleLightning();
        createDivineEmbers();

      } else {

        stopLightning();

        document
          .querySelectorAll(
            ".divine-ember, .real-lightning-svg"
          )
          .forEach(e => e.remove());

        /*
         * Pokud uživatel opustí GOD MODE,
         * tajná sekvence se resetuje.
         */
        resetHellSequence();
      }
    }


    setInterval(() => {
      updateTexts();
      checkTheme();
    }, 150);


    /* =====================================================
       DIVINE EMBERS
       ===================================================== */

    function createDivineEmbers() {

      if (
        document.querySelectorAll(
          ".divine-ember"
        ).length > 0
      ) return;

      const count = 18;

      for (let i = 0; i < count; i++) {

        const ember =
          document.createElement("div");

        ember.className = "divine-ember";

        ember.style.left =
          `${Math.random() * 100}vw`;

        ember.style.animationDuration =
          `${6 + Math.random() * 8}s`;

        ember.style.animationDelay =
          `${Math.random() * 5}s`;

        document.body.appendChild(ember);
      }
    }


    /* =====================================================
       REAL LIGHTNING
       ===================================================== */

    function drawRealLightning() {

      const svg =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );

      svg.setAttribute(
        "class",
        "real-lightning-svg"
      );

      let x =
        window.innerWidth * 0.1 +
        Math.random() *
        (window.innerWidth * 0.8);

      let y = -20;

      let pathD =
        `M ${x} ${y} `;

      const branches = [];

      while (y < window.innerHeight) {

        y +=
          20 +
          Math.random() * 40;

        x +=
          (Math.random() - 0.5) *
          100;

        pathD +=
          `L ${x} ${y} `;

        if (Math.random() > 0.65) {

          let bx = x;
          let by = y;

          let branchD =
            `M ${bx} ${by} `;

          for (
            let i = 0;
            i < 3 + Math.random() * 5;
            i++
          ) {

            by +=
              15 +
              Math.random() * 30;

            bx +=
              (Math.random() - 0.5) *
              90;

            branchD +=
              `L ${bx} ${by} `;
          }

          branches.push(branchD);
        }
      }

      const path =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );

      path.setAttribute(
        "d",
        pathD + branches.join(" ")
      );

      path.setAttribute(
        "class",
        "real-lightning-path"
      );

      svg.appendChild(path);

      document.body.appendChild(svg);

      setTimeout(() => {

        svg.style.opacity = "0.3";

        setTimeout(() => {

          svg.style.opacity = "1";

          setTimeout(() => {

            svg.style.transition =
              "opacity 0.2s ease-out";

            svg.style.opacity = "0";

            setTimeout(() => {
              svg.remove();
            }, 200);

          }, 40);

        }, 40);

      }, 30);
    }


    /* =====================================================
       THUNDER BURST
       ===================================================== */

    let activeThunder = null;

    function triggerLightningBurst() {

      const strikes =
        1 +
        Math.floor(Math.random() * 3);

      for (
        let i = 0;
        i < strikes;
        i++
      ) {

        const delay =
          i * 140 +
          Math.random() * 60;

        setTimeout(() => {
          drawRealLightning();
        }, delay);

        setTimeout(() => {

          if (activeThunder) {
            activeThunder.pause();
            activeThunder.currentTime = 0;
          }

          activeThunder =
            thunderSound.cloneNode();

          activeThunder.volume = 0.5;

          activeThunder
            .play()
            .catch(e => {});

          activeThunder.onended =
            () => {
              if (
                activeThunder === this
              ) {
                activeThunder = null;
              }
            };

        }, delay + 80);
      }
    }


    let lightningTimer = null;

    function strikeLightning() {

  if (
    document.documentElement.getAttribute("data-hell") === "true"
  ) {
    stopLightning();
    return;
  }

  const activeCheck =
        document.documentElement
          .getAttribute("data-theme") ===
        "god-mode";

      if (!activeCheck) {
        stopLightning();
        return;
      }

      lightning.classList.remove("flash");

      void lightning.offsetWidth;

      lightning.classList.add("flash");

      triggerLightningBurst();

      scheduleLightning();
    }


    function scheduleLightning() {

      clearTimeout(lightningTimer);

      lightningTimer =
        setTimeout(
          strikeLightning,
          8000 +
          Math.random() * 15000
        );
    }


    function stopLightning() {

      clearTimeout(lightningTimer);

      lightningTimer = null;

      lightning.classList.remove("flash");
    }

/* =====================================================
   HELL MODE OVERRIDES GOD MODE
   ===================================================== */

window.stopDivineMode = function () {

  divineStopped = true;

  stopLightning();

  document
    .querySelectorAll(
      ".divine-ember, .real-lightning-svg"
    )
    .forEach(e => e.remove());

  lightning.classList.remove("flash");

};
    
/* =====================================================
   SECRET HELL SEQUENCE
   ===================================================== */

let hellStage = 0;
let hellClicks = 0;

let hellHotspot = null;
let hellHintTop = null;
let hellHintBottom = null;


/* -----------------------------------------------------
   Kontrola GOD MODE
   ----------------------------------------------------- */

function isActuallyGodMode() {
  return (
    document.documentElement.getAttribute("data-theme") ===
    "god-mode"
  );
}


/* -----------------------------------------------------
   Vytvoření hotspotu
   ----------------------------------------------------- */

function createHellHotspot() {

  if (hellHotspot) return;

  hellHotspot =
    document.createElement("div");

  hellHotspot.className =
    "divine-hell-hotspot";

  /*
   * První hotspot je úplně dole
   * v dokumentu.
   */
  hellHotspot.classList.add("bottom");

  document.body.appendChild(
    hellHotspot
  );

  hellHotspot.addEventListener(
    "click",
    handleHellClick
  );
}


/* -----------------------------------------------------
   Kliknutí na hotspot
   ----------------------------------------------------- */

function handleHellClick(event) {

  event.preventDefault();
  event.stopPropagation();

  if (!isActuallyGodMode()) return;

  /*
   * Při prvním kliknutí na nový hotspot
   * odstraníme předchozí nápovědu.
   */
  if (hellClicks === 0) {

    if (hellStage === 1 && hellHintBottom) {
      hellHintBottom.remove();
      hellHintBottom = null;
    }

    if (hellStage === 2 && hellHintTop) {
      hellHintTop.remove();
      hellHintTop = null;
    }
  }

  hellClicks++;

  console.log(
    `HELL SEQUENCE: stage ${hellStage + 1}, click ${hellClicks}/6`
  );

  if (hellClicks >= 6) {

    hellClicks = 0;
    hellStage++;

    advanceHellStage();
  }
}


/* -----------------------------------------------------
   Posun hotspotu
   ----------------------------------------------------- */

function moveHotspot(position) {

  if (!hellHotspot) return;

  hellHotspot.classList.remove(
    "top",
    "bottom"
  );

  hellHotspot.classList.add(
    position
  );

  /*
   * Stránka se NEPOSOUVÁ.
   * Hráč musí hotspot najít sám.
   */
}


/* -----------------------------------------------------
   Postup jednotlivými fázemi
   ----------------------------------------------------- */

function advanceHellStage() {

  /*
   * STAGE 1
   *
   * Dole → nahoru
   */

  if (hellStage === 1) {

    /*
     * Zpráva zůstane na původním místě.
     */
    showHellHint(
      "nepokoušej...",
      "bottom"
    );

    /*
     * Hotspot skočí nahoru.
     */
    moveHotspot("top");

    console.log(
      "HELL SEQUENCE: hotspot moved TOP"
    );

    return;
  }


  /*
   * STAGE 2
   *
   * Nahoře → dolů
   */

  if (hellStage === 2) {

    /*
     * Zpráva zůstane nahoře.
     */
    showHellHint(
      "ty máš rád výzvy že?",
      "top"
    );

    /*
     * Hotspot zpět dolů.
     */
    moveHotspot("bottom");

    console.log(
      "HELL SEQUENCE: hotspot moved BOTTOM"
    );

    return;
  }


  /*
   * STAGE 3
   *
   * Dole → HELL
   */

  if (hellStage === 3) {

    console.log(
      "HELL SEQUENCE: 6-6-6 COMPLETE"
    );

    triggerHell();

    return;
  }
}


/* -----------------------------------------------------
   Nápovědy
   ----------------------------------------------------- */

function showHellHint(text, position) {

  const hint =
    document.createElement("div");

  hint.className =
    "divine-hell-hint";

  hint.textContent = text;

  hint.classList.add(position);

  document.body.appendChild(hint);

  if (position === "top") {
    hellHintTop = hint;
  } else {
    hellHintBottom = hint;
  }
}


/* -----------------------------------------------------
   Reset celé sekvence
   ----------------------------------------------------- */

function resetHellSequence() {

  hellStage = 0;
  hellClicks = 0;

  if (hellHotspot) {
    hellHotspot.remove();
    hellHotspot = null;
  }

  if (hellHintTop) {
    hellHintTop.remove();
    hellHintTop = null;
  }

  if (hellHintBottom) {
    hellHintBottom.remove();
    hellHintBottom = null;
  }
}


/* -----------------------------------------------------
   Přechod do HELL
   ----------------------------------------------------- */

function triggerHell() {

  if (hellHotspot) {
    hellHotspot.remove();
    hellHotspot = null;
  }

  const finalMessage =
    document.createElement("div");

  finalMessage.className =
    "divine-hell-final";

  finalMessage.textContent =
    "řekl sis o to";

  document.body.appendChild(
    finalMessage
  );

  setTimeout(() => {

    finalMessage.classList.add(
      "active"
    );

  }, 50);


  setTimeout(() => {

    if (
      typeof window.startHell ===
      "function"
    ) {

      finalMessage.remove();

      window.startHell();

    } else {

      console.error(
        "HELL ERROR: window.startHell() není dostupné."
      );

    }

  }, 1800);
}


/* -----------------------------------------------------
   Inicializace
   ----------------------------------------------------- */

function initializeHellSequence() {

  if (!isActuallyGodMode()) return;

  createHellHotspot();
}

setTimeout(
  initializeHellSequence,
  300
);



    /* =====================================================
       GOD MODE LONG PRESS
       ===================================================== */

    const logo =
      document.querySelector(".am-brand");

    if (!logo) return;

    let holding = false;
    let startTime = 0;
    let animationFrame = null;
    let longPress = false;


    function startHold(event) {

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) return;

      if (holding) return;

      holding = true;
      longPress = false;

      startTime =
        performance.now();

      hold.classList.add("active");

      try {
        logo.setPointerCapture(
          event.pointerId
        );
      } catch (e) {}


      function update() {

        if (!holding) return;

        const elapsed =
          performance.now() -
          startTime;

        const percent =
          Math.min(
            elapsed / HOLD_TIME,
            1
          );

        progress.style.width =
          `${percent * 100}%`;

        if (percent >= 1) {

          activate();

          return;
        }

        animationFrame =
          requestAnimationFrame(
            update
          );
      }

      animationFrame =
        requestAnimationFrame(
          update
        );
    }


    function endHold(event) {

      if (longPress) {

        event.preventDefault();
        event.stopPropagation();

        longPress = false;
      }

      cancelHold();
    }


    function cancelHold() {

      if (!holding) return;

      holding = false;

      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }

      progress.style.width = "0%";

      hold.classList.remove(
        "active"
      );
    }


    function activate() {

      if (!holding) return;

      holding = false;
      longPress = true;

      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }

      progress.style.width = "100%";


      if (
        typeof AM !== "undefined" &&
        typeof AM.setTheme === "function"
      ) {

        AM.setTheme("god-mode");

      } else {

        document.documentElement
          .setAttribute(
            "data-theme",
            "god-mode"
          );
      }


      /*
       * Tajná sekvence začíná
       * vždy znovu při aktivaci GOD MODE.
       */
      resetHellSequence();

      createHellHotspot();


      transition.classList.add(
        "active"
      );

      setTimeout(() => {
        transition.classList.remove(
          "active"
        );
      }, 1000);


      setTimeout(
        strikeLightning,
        500
      );

      scheduleLightning();

      createDivineEmbers();


      setTimeout(() => {

        progress.style.width = "0%";

        hold.classList.remove(
          "active"
        );

      }, 350);
    }


    logo.addEventListener(
      "contextmenu",
      e => e.preventDefault()
    );

    logo.addEventListener(
      "dragstart",
      e => e.preventDefault()
    );

    logo.addEventListener(
      "pointerdown",
      e => {
        e.preventDefault();
        startHold(e);
      }
    );

    logo.addEventListener(
      "pointerup",
      endHold
    );

    logo.addEventListener(
      "pointercancel",
      cancelHold
    );

    logo.addEventListener(
      "click",
      e => {

        if (longPress) {

          e.preventDefault();
          e.stopImmediatePropagation();

          longPress = false;
        }

      },
      true
    );
  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initGodMode,
      { once: true }
    );

  } else {

    initGodMode();
  }

})();
