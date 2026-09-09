/* =========================================================
   AIRSOFT MAPS - HELL COVER MODE
   ========================================================= */

(() => {
  const HELL_KEY = "airsoftmaps-hell";

  let active = false;
  let overlay = null;
  let world = null;
  let torch = null;

  let torchX = window.innerWidth / 2;
  let torchY = window.innerHeight / 2;
  let rafPending = false;

  /* ÚNIKOVÁ SEKVENCE PENTAGRAMŮ: BLACK -> GOLD -> RED -> GOLD -> BLACK */
  const sequence = ["black", "gold", "red", "gold", "black"];
  let sequenceIndex = 0;

  function isHellActive() {
    return localStorage.getItem(HELL_KEY) === "true";
  }

  window.startHell = function () {
    if (active) return;

    active = true;
    sequenceIndex = 0;

    localStorage.setItem(HELL_KEY, "true");
    document.documentElement.setAttribute("data-hell", "true");

    createHell();
  };

  function createHell() {
    overlay = document.createElement("div");
    overlay.className = "hell-overlay";

    overlay.innerHTML = `
      <div class="hell-world">
        <!-- DÝM A MLHA -->
        <div class="hell-fog-layer hell-fog-1"></div>
        <div class="hell-fog-layer hell-fog-2"></div>

        <!-- SVG VRSTVA PENTAGRAMŮ A NÁPISŮ -->
        <svg class="hell-scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- BRUTÁLNÍ RITUÁLNÍ NÁPISY VE TMI/MLZE -->
          <g class="hell-inscriptions">
            <text x="200" y="180">SANGUIS ET CINIS OMNIA DEVORAT</text>
            <text x="1000" y="220">INFERNUS INTUS EST - NULLA SPES</text>
            <text x="150" y="850">PER ASPERA AD INFEROS</text>
            <text x="1050" y="880">MORTUI NON TAMENTUR</text>
            <text x="600" y="120">EGO SUM LUX IN TENEBRIS</text>
          </g>

          <!-- 1. ČERNÝ PENTAGRAM (VLEVO) -->
          <g class="hell-symbol symbol-black" data-symbol="black" transform="translate(350, 480)">
            <circle class="penta-circle" cx="0" cy="0" r="90" />
            <path class="penta-star" d="M 0,-90 L 52.9,72.8 L -85.6,-27.8 L 85.6,-27.8 L -52.9,72.8 Z" />
            <circle class="penta-inner" cx="0" cy="0" r="30" />
          </g>

          <!-- 2. ZLATÝ PENTAGRAM (STŘED) -->
          <g class="hell-symbol symbol-gold" data-symbol="gold" transform="translate(800, 450)">
            <circle class="penta-circle" cx="0" cy="0" r="105" />
            <path class="penta-star" d="M 0,-105 L 61.7,85 L -99.8,-32.4 L 99.8,-32.4 L -61.7,85 Z" />
            <circle class="penta-inner" cx="0" cy="0" r="35" />
          </g>

          <!-- 3. ČERVENÝ PENTAGRAM (VPRAVO) -->
          <g class="hell-symbol symbol-red" data-symbol="red" transform="translate(1250, 480)">
            <circle class="penta-circle" cx="0" cy="0" r="90" />
            <path class="penta-star" d="M 0,-90 L 52.9,72.8 L -85.6,-27.8 L 85.6,-27.8 L -52.9,72.8 Z" />
            <circle class="penta-inner" cx="0" cy="0" r="30" />
          </g>
        </svg>

        <!-- EFEKT POCHODNĚ -->
        <div class="hell-torch"></div>

        <!-- ČÁSTICE POPELA A ŽHAVÝCH UHLÍKŮ -->
        <div class="hell-ash"></div>
        <div class="hell-embers"></div>

        <!-- VAROVÁNÍ A NÁPOVĚDA -->
        <div class="hell-warning">
          <span class="hell-title">NENÍ CESTY ZPĚT...</span>
          <span class="hell-hint">pokud nevidíš cestu, zkus otočit směr</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    world = overlay.querySelector(".hell-world");
    torch = overlay.querySelector(".hell-torch");

    setupTorch();
    setupPentagrams();
    createParticles();

    updateTorchPosition(torchX, torchY);

    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });
  }

  function setupTorch() {
    const onMove = (event) => {
      let clientX = event.clientX;
      let clientY = event.clientY;

      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      torchX = clientX;
      torchY = clientY;

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          updateTorchPosition(torchX, torchY);
          rafPending = false;
        });
      }
    };

    overlay.addEventListener("pointermove", onMove, { passive: true });
    overlay.addEventListener("pointerdown", onMove, { passive: true });
    overlay.addEventListener("touchmove", onMove, { passive: true });
  }

  function updateTorchPosition(x, y) {
    if (torch) {
      torch.style.left = `${x}px`;
      torch.style.top = `${y}px`;
    }

    if (world) {
      world.style.setProperty("--torch-x", `${x}px`);
      world.style.setProperty("--torch-y", `${y}px`);
    }

    updatePentagramLighting(x, y);
  }

  function updatePentagramLighting(x, y) {
    if (!overlay) return;

    const symbols = overlay.querySelectorAll(".hell-symbol");

    symbols.forEach((symbol) => {
      const rect = symbol.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      symbol.classList.toggle("torch-lit", distance < 320);
    });
  }

  function setupPentagrams() {
    const symbols = overlay.querySelectorAll(".hell-symbol");

    symbols.forEach((symbol) => {
      symbol.addEventListener("click", (event) => {
        event.stopPropagation();

        if (!symbol.classList.contains("torch-lit")) return;

        const clicked = symbol.dataset.symbol;

        if (clicked !== sequence[sequenceIndex]) {
          sequenceIndex = 0;
          symbols.forEach((item) => item.classList.remove("symbol-hit"));

          symbol.classList.add("symbol-wrong");
          setTimeout(() => symbol.classList.remove("symbol-wrong"), 450);
          return;
        }

        symbol.classList.add("symbol-hit");
        setTimeout(() => symbol.classList.remove("symbol-hit"), 800);

        sequenceIndex++;

        if (sequenceIndex >= sequence.length) {
          completeHell();
        }
      });
    });
  }

  function createParticles() {
    const ashContainer = overlay.querySelector(".hell-ash");
    const embersContainer = overlay.querySelector(".hell-embers");

    if (!ashContainer || !embersContainer) return;

    for (let i = 0; i < 80; i++) {
      const particle = document.createElement("span");
      particle.className = "ash-gray";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${6 + Math.random() * 8}s`;
      particle.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
      ashContainer.appendChild(particle);
    }

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("span");
      particle.className = "ash-hot";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${4 + Math.random() * 7}s`;
      particle.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
      ashContainer.appendChild(particle);
    }

    for (let i = 0; i < 20; i++) {
      const ember = document.createElement("span");
      ember.className = "ember";
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.top = `${30 + Math.random() * 65}%`;
      ember.style.animationDelay = `${Math.random() * 4}s`;
      ember.style.animationDuration = `${1 + Math.random() * 2}s`;
      embersContainer.appendChild(ember);
    }
  }

  /* =====================================================
     DOKONČENÍ HELL MÓDU & PERGAMEN S KÓDEM
     ===================================================== */

  function completeHell() {
    showParchment();
  }

  function showParchment() {
    const parchment = document.createElement("div");
    parchment.className = "hell-parchment-modal";

    parchment.innerHTML = `
      <div class="parchment-container">
        <!-- OBRÁZEK PERGAMENU -->
        <img src="./parchment.png" class="parchment-img" alt="Parchment" />

        <!-- PEČEŤ NA PERGAMENU -->
        <img src="./wax_seal.png" class="parchment-seal" title="Zlomit pečeť a opustit peklo" alt="Seal" />

        <!-- TEXTOVÁ VRSTVA -->
        <div class="parchment-overlay">
          <p class="blood-line line-1"></p>
          <p class="blood-line line-2"></p>
          <p class="blood-line line-3"></p>
          <p class="blood-line line-code"></p>
        </div>
      </div>
    `;

    overlay.querySelector(".hell-world").appendChild(parchment);

    const sealBtn = parchment.querySelector(".parchment-seal");
    sealBtn.addEventListener("click", exitHellToDarkMode);

    const img = parchment.querySelector(".parchment-img");

    const startTyping = () => {
      setTimeout(() => {
        runBloodTyping(parchment);
      }, 500);
    };

    if (img.complete) {
      startTyping();
    } else {
      img.onload = startTyping;
      img.onerror = startTyping;
    }
  }

  /* Efekt psaní psaného písma/krve */
  function typeText(element, text, speed = 65) {
    return new Promise((resolve) => {
      let i = 0;
      element.classList.add("typing");
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          element.classList.remove("typing");
          resolve();
        }
      }, speed);
    });
  }



  function getSecretCode() {
    const codes = [
      "VFJJQUdF", 
      "S9NELTEyMzQ=",
      "Y2hjaSB2eWhyYXQ=", 
      "cG91eml2YW0gQWlyc29mdE1hcHM="
    ]; 
    
    // Náhodný výběr jednoho z indexů 0 až 3
    const randomIndex = Math.floor(Math.random() * codes.length);

    try {
      return atob(codes[randomIndex]);
    } catch (e) {
      return "XXXXX-XXXX";
    }
  }

  /* Postupné psaní textu krví */
  async function runBloodTyping(parchment) {
    const l1 = parchment.querySelector(".line-1");
    const l2 = parchment.querySelector(".line-2");
    const l3 = parchment.querySelector(".line-3");
    const lCode = parchment.querySelector(".line-code");
    const sealBtn = parchment.querySelector(".parchment-seal");

    await typeText(l1, "chtěl jsi znát hřiště", 65);
    await new Promise((r) => setTimeout(r, 250));
    
    await typeText(l2, "podíval ses bohům do tváře", 65);
    await new Promise((r) => setTimeout(r, 250));
    
    await typeText(l3, "a prošel jsi peklem...", 65);
    await new Promise((r) => setTimeout(r, 400));
    
    const finalCode = getSecretCode();
    await typeText(lCode, "kód : " + finalCode, 75);

    sealBtn.classList.add("active");
  }

  /* Ukončení Hell módu a návrat do tmavého režimu */
  function exitHellToDarkMode() {
    localStorage.removeItem(HELL_KEY);
    document.documentElement.removeAttribute("data-hell");

    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");

    if (!overlay) return;

    overlay.classList.add("hell-escape");

    setTimeout(() => {
      if (overlay) overlay.remove();
      overlay = null;
      world = null;
      torch = null;
      active = false;
      sequenceIndex = 0;
    }, 1200);
  }

  if (isHellActive()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => window.startHell(), { once: true });
    } else {
      window.startHell();
    }
  }
})();
