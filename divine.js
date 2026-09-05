/* =========================================================
   AIRSOFT MAPS
   DIVINE MODE
   ========================================================= */

(() => {

  const HOLD_TIME = 3000;

  const logo = document.querySelector(".am-brand");

  if (!logo) return;

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
     AKTIVACE PODRŽENÍM
     ------------------------------------------------------- */

  let timer = null;
  let startTime = null;
  let holding = false;
  let animationFrame = null;

  function startHold(event) {

    if (event.button !== undefined && event.button !== 0) return;

    holding = true;
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

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    progress.style.width = "100%";

    toggleDivineMode();

    setTimeout(() => {
      progress.style.width = "0%";
      hold.classList.remove("active");
    }, 250);
  }

  logo.addEventListener("pointerdown", startHold);

  logo.addEventListener("pointerup", cancelHold);

  logo.addEventListener("pointercancel", cancelHold);

  logo.addEventListener("pointerleave", cancelHold);

  /* -------------------------------------------------------
     BOŽSKÝ REŽIM
     ------------------------------------------------------- */

  function toggleDivineMode() {

    const active =
      document.body.classList.toggle("divine-mode");

    transition.classList.add("active");

    setTimeout(() => {
      transition.classList.remove("active");
    }, 700);

    if (active) {

      console.log("⚡ AIRSOFT MAPS // DIVINE MODE");

      startLightning();

    } else {

      console.log("AIRSOFT MAPS // MORTAL MODE");

      stopLightning();

    }
  }

  /* -------------------------------------------------------
     BLESKY
     ------------------------------------------------------- */

  let lightningTimer = null;

  function strikeLightning() {

    if (!document.body.classList.contains("divine-mode")) return;

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

    /* první blesk relativně brzy po vstupu */

    setTimeout(() => {

      if (
        document.body.classList.contains("divine-mode")
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

})();
