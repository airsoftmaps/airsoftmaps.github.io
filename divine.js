(() => {

  const HOLD_TIME = 3000;

  function initGodMode() {

    const logo = document.querySelector(".am-brand");

    if (!logo) {
      console.warn("GOD MODE: .am-brand nebyl nalezen.");
      return;
    }

    /* =====================================================
       DEKORACE
       ===================================================== */

    const leftColumn = document.createElement("div");
    leftColumn.className = "divine-column left";

    const rightColumn = document.createElement("div");
    rightColumn.className = "divine-column right";

    const meander = document.createElement("div");
    meander.className = "divine-meander";

    const torchLeft = document.createElement("div");
    torchLeft.className = "divine-torch left";

    const torchRight = document.createElement("div");
    torchRight.className = "divine-torch right";

    const lightning = document.createElement("div");
    lightning.className = "divine-lightning";

    const transition = document.createElement("div");
    transition.className = "divine-transition";

    const hold = document.createElement("div");
    hold.className = "divine-hold";

    hold.innerHTML = `
      <div>DIVINE ACCESS</div>
      <div class="divine-hold-bar">
        <div class="divine-hold-progress"></div>
      </div>
    `;

    document.body.append(
      leftColumn,
      rightColumn,
      meander,
      torchLeft,
      torchRight,
      lightning,
      transition,
      hold
    );

    const progress =
      hold.querySelector(".divine-hold-progress");


    /* =====================================================
       LONG PRESS
       ===================================================== */

    let holding = false;
    let startTime = 0;
    let animationFrame = null;
    let longPress = false;


    function startHold(event) {

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (holding) {
        return;
      }

      holding = true;
      longPress = false;
      startTime = performance.now();

      hold.classList.add("active");

      /*
        Zachytíme pointer.
        Díky tomu nám mobilní prohlížeč
        během držení "neuteče".
      */
      try {
        logo.setPointerCapture(event.pointerId);
      } catch (e) {}


      function update() {

        if (!holding) {
          return;
        }

        const elapsed =
          performance.now() - startTime;

        const percent =
          Math.min(elapsed / HOLD_TIME, 1);

        progress.style.width =
          `${percent * 100}%`;


        if (percent >= 1) {

          activate();

          return;
        }


        animationFrame =
          requestAnimationFrame(update);
      }


      animationFrame =
        requestAnimationFrame(update);
    }


    function endHold(event) {

      /*
        Pokud už proběhl long-press,
        NESMÍME pustit původní <a href="menu.html">.
      */
      if (longPress) {

        event.preventDefault();
        event.stopPropagation();

        longPress = false;
        holding = false;

        resetProgress();

        return;
      }


      /*
        Krátké klepnutí.
        Normálně necháme <a> fungovat.
      */
      if (holding) {

        holding = false;

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }

        resetProgress();
      }
    }


    function cancelHold() {

      if (!holding) {
        return;
      }

      holding = false;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      resetProgress();
    }


    function resetProgress() {

      progress.style.width = "0%";
      hold.classList.remove("active");
    }


    /* =====================================================
       AKTIVACE GOD MODE
       ===================================================== */

    function activate() {

      if (!holding) {
        return;
      }

      holding = false;
      longPress = true;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      progress.style.width = "100%";

      /*
        KRITICKÁ ČÁST:
        přepnutí normálního tématu.
      */
      if (
        typeof AM !== "undefined" &&
        typeof AM.setTheme === "function"
      ) {

        AM.setTheme("god-mode");

        console.log(
          "⚡ AIRSOFT MAPS // GOD MODE ACTIVATED"
        );

      } else {

        console.error(
          "GOD MODE: AM.setTheme není dostupné."
        );

      }


      /*
        Přechodový efekt.
      */
      transition.classList.add("active");

      setTimeout(() => {
        transition.classList.remove("active");
      }, 700);


      /*
        Blesky.
      */
      startLightning();


      /*
        Progress zmizí.
      */
      setTimeout(() => {

        progress.style.width = "0%";
        hold.classList.remove("active");

      }, 350);
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    logo.addEventListener(
      "contextmenu",
      event => {
        event.preventDefault();
      }
    );


    logo.addEventListener(
      "dragstart",
      event => {
        event.preventDefault();
      }
    );


    logo.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        startHold(event);
      }
    );


    logo.addEventListener(
      "pointerup",
      event => {

        endHold(event);
      }
    );


    logo.addEventListener(
      "pointercancel",
      () => {

        cancelHold();

      }
    );


    /*
      Když se po long-pressu pokusí <a>
      provést navigaci, zabráníme jí.
    */
    logo.addEventListener(
      "click",
      event => {

        if (longPress) {

          event.preventDefault();
          event.stopImmediatePropagation();

          longPress = false;
        }

      },
      true
    );


    /* =====================================================
       BLESKY
       ===================================================== */

    let lightningTimer = null;


    function strikeLightning() {

      if (
        typeof AM === "undefined" ||
        typeof AM.getTheme !== "function" ||
        AM.getTheme() !== "god-mode"
      ) {

        stopLightning();
        return;
      }


      lightning.classList.remove("flash");

      void lightning.offsetWidth;

      lightning.classList.add("flash");

      scheduleLightning();
    }


    function scheduleLightning() {

      clearTimeout(lightningTimer);

      const delay =
        8000 +
        Math.random() * 17000;

      lightningTimer =
        setTimeout(
          strikeLightning,
          delay
        );
    }


    function startLightning() {

      scheduleLightning();

      setTimeout(() => {

        if (
          typeof AM !== "undefined" &&
          typeof AM.getTheme === "function" &&
          AM.getTheme() === "god-mode"
        ) {

          strikeLightning();

        }

      }, 2500 + Math.random() * 3000);
    }


    function stopLightning() {

      clearTimeout(lightningTimer);

      lightningTimer = null;

      lightning.classList.remove("flash");
    }


    console.log(
      "AIRSOFT MAPS // GOD MODE READY"
    );
  }


  /* =====================================================
     DOM READY
     ===================================================== */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initGodMode,
      { once: true }
    );

  } else {

    initGodMode();

  }

})();
