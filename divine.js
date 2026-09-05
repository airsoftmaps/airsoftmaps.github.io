/* =========================================================
   AIRSOFT MAPS
   GOD MODE
   ========================================================= */

(() => {

  const HOLD_TIME = 3000;

  function initGodMode() {

    const logo = document.querySelector(".am-brand");

    if (!logo) {
      console.warn("AIRSOFT MAPS // GOD MODE: .am-brand nenalezen");
      return;
    }

    /* -------------------------------------------------------
       DEKORACE
       ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       PODRŽENÍ LOGA
       ------------------------------------------------------- */

    let startTime = 0;
    let holding = false;
    let animationFrame = null;
    let timer = null;

    /*
      True pouze tehdy, pokud byl dokončen
      3sekundový long-press.

      Zabraňuje následnému kliknutí na <a href="menu.html">.
    */
    let longPressTriggered = false;


    function startHold(event) {

      /*
        Pouze levé tlačítko myši.
        U touch/pointer zařízení event.button
        může být 0.
      */
      if (
        event.button !== undefined &&
        event.button !== 0
      ) {
        return;
      }

      if (holding) {
        return;
      }

      holding = true;
      longPressTriggered = false;

      startTime = performance.now();

      hold.classList.add("active");


      function updateProgress(now) {

        if (!holding) {
          return;
        }

        const elapsed =
          now - startTime;

        const percent =
          Math.min(
            elapsed / HOLD_TIME,
            1
          );

        progress.style.width =
          `${percent * 100}%`;


        if (percent >= 1) {

          finishHold();

          return;
        }


        animationFrame =
          requestAnimationFrame(
            updateProgress
          );
      }


      animationFrame =
        requestAnimationFrame(
          updateProgress
        );


      timer = setTimeout(
        finishHold,
        HOLD_TIME
      );
    }


    function cancelHold() {

      if (!holding) {
        return;
      }

      holding = false;


      if (timer) {

        clearTimeout(timer);

        timer = null;
      }


      if (animationFrame) {

        cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }


      progress.style.width = "0%";

      hold.classList.remove("active");
    }


    function finishHold() {

      if (!holding) {
        return;
      }

      holding = false;

      /*
        Long-press byl skutečně dokončen.
        Následný click tedy nesmí otevřít menu.html.
      */
      longPressTriggered = true;


      if (timer) {

        clearTimeout(timer);

        timer = null;
      }


      if (animationFrame) {

        cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }


      progress.style.width = "100%";


      activateGodMode();


      setTimeout(() => {

        progress.style.width = "0%";

        hold.classList.remove("active");

      }, 250);
    }


    /* -------------------------------------------------------
       MOBIL
       ------------------------------------------------------- */

    /*
      Zabrání klasickému mobilnímu menu
      při dlouhém podržení.
    */
    logo.addEventListener(
      "contextmenu",
      event => {
        event.preventDefault();
      }
    );


    /*
      Zabrání tažení obrázku loga.
    */
    logo.addEventListener(
      "dragstart",
      event => {
        event.preventDefault();
      }
    );


    /*
      Pointer funguje pro:

      - myš
      - dotyk
      - stylus
    */
    logo.addEventListener(
      "pointerdown",
      event => {

        startHold(event);

      }
    );


    logo.addEventListener(
      "pointerup",
      event => {

        /*
          Pokud už byl aktivován GOD MODE,
          zablokujeme následný click.
        */
        if (longPressTriggered) {

          event.preventDefault();
        }

        cancelHold();

      }
    );


    logo.addEventListener(
      "pointercancel",
      () => {

        cancelHold();

      }
    );


    /*
      U myši ukončí podržení při opuštění loga.
    */
    logo.addEventListener(
      "pointerleave",
      event => {

        if (event.pointerType === "mouse") {

          cancelHold();

        }

      }
    );


    /* -------------------------------------------------------
       KRÁTKÝ KLIK VS. LONG-PRESS
       ------------------------------------------------------- */

    logo.addEventListener(
      "click",
      event => {

        /*
          Krátký klik:

          nic neděláme.

          <a href="menu.html"> tedy pokračuje
          standardním způsobem.
        */

        if (!longPressTriggered) {
          return;
        }


        /*
          Long-press:

          zabráníme navigaci na menu.html.
        */
        event.preventDefault();

        event.stopPropagation();

        longPressTriggered = false;

      }
    );


    /* -------------------------------------------------------
       GOD MODE
       ------------------------------------------------------- */

    function activateGodMode() {

      /*
        GOD MODE je normální téma.
        Žádný body.divine-mode.
      */
      if (
        typeof AM !== "undefined" &&
        typeof AM.setTheme === "function"
      ) {

        AM.setTheme("god-mode");


        console.log(
          "⚡ AIRSOFT MAPS // GOD MODE"
        );


        /*
          Přechodový efekt.
        */
        transition.classList.add("active");


        setTimeout(() => {

          transition.classList.remove("active");

        }, 700);


        /*
          Spustíme náhodné blesky.
        */
        startLightning();

      }

    }


    /* -------------------------------------------------------
       BLESKY
       ------------------------------------------------------- */

    let lightningTimer = null;


    function strikeLightning() {

      /*
        Pokud už uživatel přepnul na jiné téma,
        blesky okamžitě zastavíme.
      */
      if (
        typeof AM === "undefined" ||
        typeof AM.getTheme !== "function" ||
        AM.getTheme() !== "god-mode"
      ) {

        stopLightning();

        return;
      }


      /*
        Restart CSS animace.
      */
      lightning.classList.remove("flash");


      void lightning.offsetWidth;


      lightning.classList.add("flash");


      scheduleLightning();
    }


    function scheduleLightning() {

      clearTimeout(
        lightningTimer
      );


      /*
        Další blesk:

        8 až 25 sekund.
      */
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

      /*
        Starý timer pryč.
      */
      scheduleLightning();


      /*
        První blesk přijde poměrně brzy
        po aktivaci GOD MODE.

        2,5 až 5,5 sekundy.
      */
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

      clearTimeout(
        lightningTimer
      );

      lightningTimer = null;

      lightning.classList.remove(
        "flash"
      );
    }


    /* -------------------------------------------------------
       HOTOVO
       ------------------------------------------------------- */

    console.log(
      "AIRSOFT MAPS // GOD MODE READY"
    );

  }


  /* ---------------------------------------------------------
     DOM READY

     Funguje bez ohledu na to, jestli je divine.js:

     - v <head>
     - uprostřed HTML
     - před headerem
     - na konci <body>
     - načtený s defer
     --------------------------------------------------------- */

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
