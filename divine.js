(() => {
  const HOLD_TIME = 3000;

  function initGodMode() {
    const isGodMode = 
      document.documentElement.getAttribute("data-theme") === "god-mode" || 
      (typeof AM !== "undefined" && typeof AM.getTheme === "function" && AM.getTheme() === "god-mode");

    if (isGodMode) {
      document.documentElement.setAttribute("data-theme", "god-mode");
    }

    /* FUNKCE PRO AKTUALIZACI TEXTŮ PODLE JAZYKA */
    function updateTexts() {
      const currentLang = (typeof AM !== "undefined" && typeof AM.getLang === "function") ? AM.getLang() : "cs";
      
      const subtitleEl = document.querySelector(".am-menu-subtitle");
      if (subtitleEl) {
        const subText = currentLang === "en" ? "⚡ WELCOME AMONG THE IMMORTALS ⚡" : "⚡ VÍTEJ MEZI NESMRTELNÝMI ⚡";
        subtitleEl.setAttribute("data-divine-sub", subText);
      }

      const holdTextEl = document.querySelector(".divine-hold-text");
      if (holdTextEl) {
        holdTextEl.textContent = currentLang === "en" ? "ASCENDING TO OLYMPUS" : "VYSTUPUJEŠ NA OLYMP";
      }
    }

    /* PŘÍPRAVA EFEKTŮ */
    const lightning = document.createElement("div");
    lightning.className = "divine-lightning";

    const transition = document.createElement("div");
    transition.className = "divine-transition";

    const hold = document.createElement("div");
    hold.className = "divine-hold";
    hold.innerHTML = `
      <div class="divine-hold-text">VYSTUPUJEŠ NA OLYMP</div>
      <div class="divine-hold-bar">
        <div class="divine-hold-progress"></div>
      </div>
    `;

    document.body.append(lightning, transition, hold);
    const progress = hold.querySelector(".divine-hold-progress");

    updateTexts();

    // Sledování kliknutí na tlačítka (pokud uživatel přepne jazyk, texty se ihned aktualizují)
    document.addEventListener("click", () => {
      setTimeout(updateTexts, 50);
    });

    if (isGodMode) {
      scheduleLightning();
      createDivineEmbers();
    }

    function createDivineEmbers() {
      if (document.querySelectorAll(".divine-ember").length > 0) return;
      const count = 18;
      for (let i = 0; i < count; i++) {
        const ember = document.createElement("div");
        ember.className = "divine-ember";
        ember.style.left = `${Math.random() * 100}vw`;
        ember.style.animationDuration = `${6 + Math.random() * 8}s`;
        ember.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(ember);
      }
    }

    /* LOGIKA DLOUHÉHO STISKU LOGA */
    const logo = document.querySelector(".am-brand");
    if (!logo) return;

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
      createDivineEmbers();

      setTimeout(() => {
        progress.style.width = "0%";
        hold.classList.remove("active");
      }, 350);
    }

    /* BLESKY */
    let lightningTimer = null;

    function strikeLightning() {
      const activeCheck = document.documentElement.getAttribute("data-theme") === "god-mode";
      if (!activeCheck) {
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
      lightningTimer = setTimeout(strikeLightning, 8000 + Math.random() * 15000);
    }

    function stopLightning() {
      clearTimeout(lightningTimer);
      lightningTimer = null;
      lightning.classList.remove("flash");
    }

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
