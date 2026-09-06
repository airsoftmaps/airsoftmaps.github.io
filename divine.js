(() => {
  const HOLD_TIME = 3000;

  function initGodMode() {
    const isGodMode = 
      document.documentElement.getAttribute("data-theme") === "god-mode" || 
      (typeof AM !== "undefined" && typeof AM.getTheme === "function" && AM.getTheme() === "god-mode");

    if (isGodMode) {
      document.documentElement.setAttribute("data-theme", "god-mode");
    }

    let lastKnownLang = null;

    function updateTexts() {
      const currentLang = (typeof AM !== "undefined" && typeof AM.getLang === "function") ? AM.getLang() : "cs";
      
      if (currentLang === lastKnownLang) return;
      lastKnownLang = currentLang;

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

    let lastKnownTheme = null;
    function checkTheme() {
      const themeNow = document.documentElement.getAttribute("data-theme");
      if (themeNow === lastKnownTheme) return;
      lastKnownTheme = themeNow;

      if (themeNow === "god-mode") {
        scheduleLightning();
        createDivineEmbers();
      } else {
        stopLightning();
        document.querySelectorAll(".divine-ember, .real-lightning-svg").forEach(e => e.remove());
      }
    }

    setInterval(() => {
      updateTexts();
      checkTheme();
    }, 150);

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

    /* GENERÁTOR SKUTEČNÝCH BLESKŮ (FRAKTÁLOVÉ SVG) */
    function drawRealLightning() {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "real-lightning-svg");

      let x = window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.8);
      let y = -20;
      let pathD = `M ${x} ${y} `;
      const branches = [];

      // Hlavní kmen
      while (y < window.innerHeight) {
        y += 20 + Math.random() * 40;
        x += (Math.random() - 0.5) * 100;
        pathD += `L ${x} ${y} `;
        
        // Větvení
        if (Math.random() > 0.65) {
          let bx = x;
          let by = y;
          let branchD = `M ${bx} ${by} `;
          for (let i = 0; i < 3 + Math.random() * 5; i++) {
            by += 15 + Math.random() * 30;
            bx += (Math.random() - 0.5) * 90;
            branchD += `L ${bx} ${by} `;
          }
          branches.push(branchD);
        }
      }

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD + branches.join(" "));
      path.setAttribute("class", "real-lightning-path");
      
      svg.appendChild(path);
      document.body.appendChild(svg);

      // Přirozené mrkání blesku
      setTimeout(() => {
        svg.style.opacity = "0.3";
        setTimeout(() => {
          svg.style.opacity = "1";
          setTimeout(() => {
            svg.style.transition = "opacity 0.2s ease-out";
            svg.style.opacity = "0";
            setTimeout(() => svg.remove(), 200);
          }, 40);
        }, 40);
      }, 30);
    }

    function triggerLightningBurst() {
      // 1 až 3 blesky rychle po sobě
      const strikes = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < strikes; i++) {
        setTimeout(drawRealLightning, i * 120 + Math.random() * 80);
      }
    }

    let lightningTimer = null;

function strikeLightning() {
  const activeCheck = document.documentElement.getAttribute("data-theme") === "god-mode";
  if (!activeCheck) {
    stopLightning();
    return;
  }
  
  // 🔊 Přehrání hromu (reset na začátek pro případ, že už hraje)
  thunderSound.currentTime = 0; 
  thunderSound.play().catch(e => console.log("Zvuk blokován:", e));
  
  // Otřes pozadí
  lightning.classList.remove("flash");
  void lightning.offsetWidth; 
  lightning.classList.add("flash");
  
  // Vykreslení čar
  triggerLightningBurst();
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
