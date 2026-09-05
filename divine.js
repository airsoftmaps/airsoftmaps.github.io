(() => {
  const HOLD_TIME = 3000;

  function initGodMode() {
    const logo = document.querySelector(".am-brand");
    if (!logo) return;

    /* DEKORACE OLYMPU */
    const leftColumn = document.createElement("div");
    leftColumn.className = "divine-column left";

    const rightColumn = document.createElement("div");
    rightColumn.className = "divine-column right";

    const lightning = document.createElement("div");
    lightning.className = "divine-lightning";

    const transition = document.createElement("div");
    transition.className = "divine-transition";

    const hold = document.createElement("div");
    hold.className = "divine-hold";
    hold.innerHTML = `
      <div>ASCENDING TO OLYMPUS</div>
      <div class="divine-hold-bar">
        <div class="divine-hold-progress"></div>
      </div>
    `;

    document.body.append(leftColumn, rightColumn, lightning, transition, hold);
    const progress = hold.querySelector(".divine-hold-progress");

    /* LOGIKA PODRŽENÍ */
    let holding = false;
    let startTime = 0;
    let animationFrame = null;
    let longPress = false;

    function startHold(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (holding) return;
      
      holding = true;
      longPress = false;
      startTime = performance.now();
      hold.classList.add("active");

      try { logo.setPointerCapture(event.pointerId); } catch (e) {}

      function update() {
        if (!holding) return;
        const elapsed = performance.now() - startTime;
        const percent = Math.min(elapsed / HOLD_TIME, 1);
        progress.style.width = `${percent * 100}%`;

        if (percent >= 1) {
          activate();
          return;
        }
        animationFrame = requestAnimationFrame(update);
      }
      animationFrame = requestAnimationFrame(update);
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
      progress.style.width = "0%";
      hold.classList.remove("active");
    }

    /* AKTIVACE BOŽSKÉHO MÓDU */
    function activate() {
      if (!holding) return;
      holding = false;
      longPress = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      progress.style.width = "100%";

      if (typeof AM !== "undefined" && typeof AM.setTheme === "function") {
        AM.setTheme("god-mode");
      } else {
        document.documentElement.setAttribute("data-theme", "god-mode");
      }

      transition.classList.add("active");
      setTimeout(() => transition.classList.remove("active"), 1000);
      
      setTimeout(strikeLightning, 500);
      scheduleLightning();

      setTimeout(() => {
        progress.style.width = "0%";
        hold.classList.remove("active");
      }, 350);
    }

    /* BLESKY (ZEUS) */
    let lightningTimer = null;

    function strikeLightning() {
      const isGodMode = document.documentElement.getAttribute("data-theme") === "god-mode";
      if (!isGodMode) {
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
      lightningTimer = setTimeout(strikeLightning, 10000 + Math.random() * 20000);
    }

    function stopLightning() {
      clearTimeout(lightningTimer);
      lightningTimer = null;
      lightning.classList.remove("flash");
    }

    /* EVENTS */
    logo.addEventListener("contextmenu", e => e.preventDefault());
    logo.addEventListener("dragstart", e => e.preventDefault());
    logo.addEventListener("pointerdown", e => { e.preventDefault(); startHold(e); });
    logo.addEventListener("pointerup", endHold);
    logo.addEventListener("pointercancel", cancelHold);
    logo.addEventListener("click", e => {
      if (longPress) {
        e.preventDefault();
        e.stopImmediatePropagation();
        longPress = false;
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGodMode, { once: true });
  } else {
    initGodMode();
  }
})();
