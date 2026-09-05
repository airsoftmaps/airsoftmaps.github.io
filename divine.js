/* =========================================================
   AIRSOFT MAPS
   GOD MODE
   ========================================================= */

(() => {

  const HOLD_TIME = 3000;

  function initGodMode() {

    const logo = document.querySelector(".am-brand");

    if (!logo) return;

    // celý zbytek původního divine.js patří sem
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGodMode);
  } else {
    initGodMode();
  }

})();

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

  const progress = hold.querySelector(".divine-hold-progress");

  /* -------------------------------------------------------
     PODRŽENÍ LOGA
     ------------------------------------------------------- */

  let startTime = 0;
  let holding = false;
  let animationFrame = null;
  let timer = null;

  // True pouze v okamžiku, kdy bylo dosaženo 3 sekund.
  // Používá se k potlačení následného kliknutí na <a>.
  let longPressTriggered = false;

  function startHold(event) {

    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (holding) return;

    holding = true;
    longPressTriggered = false;
    startTime = performance.now();

    hold.classList.add("active");

    function updateProgress(now) {

      if (!holding) return;

      const elapsed = now - startTime;
      const percent = Math.min(elapsed / HOLD_TIME, 1);

      progress.style.width = `${percent * 100}%`;

      if (percent >= 1) {
        finishHold();
        return;
      }

      animationFrame = requestAnimationFrame(updateProgress);
    }

    animationFrame = requestAnimationFrame(updateProgress);

    timer = setTimeout(finishHold, HOLD_TIME);
  }

  function cancelHold() {

    if (!holding) return;

    holding = false;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    progress.style.width = "0%";
    hold.classList.remove("active");
  }

  function finishHold() {

    if (!holding) return;

    holding = false;
    longPressTriggered = true;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
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
     MOBILNÍ DLOUHÝ STISK
     ------------------------------------------------------- */

  logo.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  logo.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  logo.addEventListener("pointerdown", (event) => {
    startHold(event);
  });

  logo.addEventListener("pointerup", (event) => {

    if (longPressTriggered) {
      event.preventDefault();
    }

    cancelHold();
  });

  logo.addEventListener("pointercancel", () => {
    cancelHold();
  });

  logo.addEventListener("pointerleave", () => {
    cancelHold();
  });

  /*
     Krátké klepnutí:
     normálně otevře menu.html.

     Dlouhé podržení:
     kliknutí se po dokončení podržení zablokuje.
  */

  logo.addEventListener("click", (event) => {

    if (!longPressTriggered) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    longPressTriggered = false;
  });

  /* -------------------------------------------------------
     GOD MODE
     ------------------------------------------------------- */

  function activateGodMode() {

    if (typeof AM !== "undefined" && typeof AM.setTheme === "function") {

      AM.setTheme("god-mode");

      console.log("⚡ AIRSOFT MAPS // GOD MODE");

      transition.classList.add("active");

      setTimeout(() => {
        transition.classList.remove("active");
      }, 700);

      startLightning();

    }

  }

  /* -------------------------------------------------------
     BLESKY
     ------------------------------------------------------- */

  let lightningTimer = null;

  function strikeLightning() {

    if (AM.getTheme() !== "god-mode") {
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

    lightningTimer = setTimeout(
      strikeLightning,
      delay
    );
  }

  function startLightning() {

    scheduleLightning();

    setTimeout(() => {

      if (AM.getTheme() === "god-mode") {
        strikeLightning();
      }

    }, 2500 + Math.random() * 3000);
  }

  function stopLightning() {

    clearTimeout(lightningTimer);

    lightningTimer = null;

    lightning.classList.remove("flash");
  }

})();
