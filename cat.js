/* ==========================================================================
   AIRSOFT MAPS — CAT THEME
   Cute Chaos Engine
   ========================================================================== */

(() => {

  const CAT_THEME = "cat";

  const catMessages = [
    "Kočka něco shodila. Odmítá se přiznat. Zkus to znovu.",
    "Kočka právě sedí na tlačítku. Zkus to znovu.",
    "Něco spadlo. Kočka tvrdí, že to bylo už rozbité.",
    "Kočka kontroluje hřiště. Kontrola spočívá v ležení.",
    "Moment. Kočka si lehla na mapu.",
    "Kočka si myslí, že tohle není dobrý nápad.",
    "Kočka rozhodla, že ještě ne.",
    "Kočka to schválí, až se jí bude chtít.",
    "Kočka odmítla spolupracovat.",
    "Kočka momentálně řeší důležitější věci.",
    "Systém funguje. Kočka ne."
  ];

  const pawMessages = [
    "🐾",
    "🐾",
    "🐾",
    "🐾",
    "🐾"
  ];

  let catClickBlocked = false;
  let meowCooldown = false;

  /* ------------------------------------------------------------------------
     THEME CHECK
     ------------------------------------------------------------------------ */

  function isCatTheme() {
    return document.documentElement.dataset.theme === CAT_THEME;
  }


  /* ------------------------------------------------------------------------
     CAT MESSAGE
     ------------------------------------------------------------------------ */

  function showCatMessage(message) {

    if (!isCatTheme()) return;

    let box = document.getElementById("cat-message");

    if (!box) {

      box = document.createElement("div");

      box.id = "cat-message";

      document.body.appendChild(box);
    }

    box.textContent = message;

    box.classList.remove("cat-message-show");

    void box.offsetWidth;

    box.classList.add("cat-message-show");

    clearTimeout(box._catTimeout);

    box._catTimeout = setTimeout(() => {
      box.classList.remove("cat-message-show");
    }, 2800);
  }


  /* ------------------------------------------------------------------------
     CAT MESSAGE STYLE
     ------------------------------------------------------------------------ */

  function injectMessageStyle() {

    if (document.getElementById("cat-message-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "cat-message-style";

    style.textContent = `

      #cat-message {
        position: fixed;

        left: 50%;
        bottom: 28px;

        transform:
          translate(-50%, 20px)
          scale(.96);

        max-width: min(520px, calc(100vw - 30px));

        padding: 12px 18px;

        background: rgba(18,16,13,.96);
        border: 1px solid rgba(255,157,66,.35);

        border-radius: 12px;

        color: #f1ece5;

        font-family: inherit;
        font-size: 14px;
        line-height: 1.4;

        text-align: center;

        box-shadow:
          0 12px 35px rgba(0,0,0,.45),
          0 0 18px rgba(255,157,66,.06);

        opacity: 0;

        pointer-events: none;

        z-index: 10000;

        transition:
          opacity .22s ease,
          transform .22s ease;
      }

      #cat-message.cat-message-show {
        opacity: 1;

        transform:
          translate(-50%, 0)
          scale(1);
      }

      html[data-theme="cat"] #cat-message::before {
        content: "🐾";

        margin-right: 8px;
      }

    `;

    document.head.appendChild(style);
  }


  /* ------------------------------------------------------------------------
     RANDOM PAW
     ------------------------------------------------------------------------ */

  function spawnPaw() {

    if (!isCatTheme()) return;

    const paw = document.createElement("div");

    paw.className = "cat-floating-paw";

    paw.textContent = pawMessages[
      Math.floor(Math.random() * pawMessages.length)
    ];

    const x = Math.random() * 90 + 5;
    const y = Math.random() * 75 + 10;

    paw.style.left = `${x}%`;
    paw.style.top = `${y}%`;

    paw.style.transform =
      `rotate(${Math.random() * 50 - 25}deg)`;

    document.body.appendChild(paw);

    requestAnimationFrame(() => {
      paw.classList.add("cat-paw-visible");
    });

    setTimeout(() => {

      paw.classList.remove("cat-paw-visible");

      setTimeout(() => {
        paw.remove();
      }, 400);

    }, 2200);
  }


  /* ------------------------------------------------------------------------
     PAW STYLE
     ------------------------------------------------------------------------ */

  function injectPawStyle() {

    if (document.getElementById("cat-paw-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "cat-paw-style";

    style.textContent = `

      .cat-floating-paw {
        position: fixed;

        font-size: 22px;

        opacity: 0;

        pointer-events: none;

        z-index: 9998;

        filter:
          drop-shadow(0 0 6px rgba(255,157,66,.12));

        transition:
          opacity .35s ease,
          transform 1.8s ease;
      }

      .cat-floating-paw.cat-paw-visible {
        opacity: .18;

        transform:
          translateY(-18px)
          rotate(0deg);
      }

    `;

    document.head.appendChild(style);
  }


  /* ------------------------------------------------------------------------
     MEOW
     ------------------------------------------------------------------------ */

  function playMeow() {

    if (!isCatTheme()) return;

    if (meowCooldown) return;

    meowCooldown = true;

    const number =
      Math.floor(Math.random() * 5) + 1;

    const audio = new Audio(
      `meow-${number}.mp3`
    );

    audio.volume = 0.35;

    audio.play().catch(() => {
      // Prohlížeč může zvuk zablokovat.
    });

    setTimeout(() => {
      meowCooldown = false;
    }, 500);
  }


  /* ------------------------------------------------------------------------
     RANDOM CAT EVENT
     ------------------------------------------------------------------------ */

  function randomCatEvent() {

    if (!isCatTheme()) return;

    const message =
      catMessages[
        Math.floor(Math.random() * catMessages.length)
      ];

    showCatMessage(message);

    playMeow();

    if (Math.random() < 0.45) {
      spawnPaw();
    }
  }


  /* ------------------------------------------------------------------------
     BATTLEFIELD CLICK
     ------------------------------------------------------------------------ */

  function wireBattlefields() {

    document.querySelectorAll(".am-row").forEach(row => {

      if (row.dataset.catWired === "true") {
        return;
      }

      row.dataset.catWired = "true";

      row.addEventListener("click", e => {

        if (!isCatTheme()) {
          return;
        }

        /*
         * Jen některé kliknutí kočka sabotuje.
         * První kliknutí má vyšší šanci na kočičí zásah.
         */

        if (Math.random() < 0.45) {

          e.preventDefault();
          e.stopImmediatePropagation();

          randomCatEvent();

          return;
        }

        playMeow();
      }, true);

    });
  }


  /* ------------------------------------------------------------------------
     GLOBAL CLICK
     ------------------------------------------------------------------------ */

  function wireGlobalClicks() {

    document.addEventListener("click", e => {

      if (!isCatTheme()) return;

      /*
       * Nechceme mňoukat při každém kliknutí.
       * Pouze občas.
       */

      if (
        e.target.closest(".am-btn") ||
        e.target.closest("[data-theme]") ||
        e.target.closest(".am-dd-menu")
      ) {

        if (Math.random() < 0.18) {
          playMeow();
        }

      }

    });

  }


  /* ------------------------------------------------------------------------
  /* ------------------------------------------------------------------------
   THEME CHANGE OBSERVER
   ------------------------------------------------------------------------ */

function observeTheme() {

  const observer = new MutationObserver(() => {

    if (isCatTheme()) {

      // Kočka právě nastoupila do služby.
      startYarnScheduler();

    } else {

      // Opouštíme Cat Theme.
      document
        .querySelectorAll(".cat-floating-paw")
        .forEach(el => el.remove());

      document
        .querySelectorAll(".cat-yarn-event")
        .forEach(el => el.remove());

      // Pokud běží scheduler, zastavíme ho.
      if (yarnTimer) {
        clearTimeout(yarnTimer);
        yarnTimer = null;
      }

    }

  });

  observer.observe(
    document.documentElement,
    {
      attributes: true,
      attributeFilter: ["data-theme"]
    }
  );
}

  /* ------------------------------------------------------------------------
     YARN BALL + RUNNING CAT
     ------------------------------------------------------------------------ */

  let yarnTimer = null;

  function spawnYarn() {

    if (!isCatTheme()) return;

    // Pokud už něco běží, nic dalšího nespouštíme.
    if (document.querySelector(".cat-yarn-event")) {
      return;
    }

    const event = document.createElement("div");
    event.className = "cat-yarn-event";

    const yarn = document.createElement("div");
    yarn.className = "cat-yarn";
    yarn.textContent = "🧶";

    const cat = document.createElement("div");
    cat.className = "cat-runner";
    cat.textContent = "🐈‍⬛";

    event.appendChild(yarn);
    event.appendChild(cat);

    document.body.appendChild(event);

    // Náhodný směr
    const fromLeft = Math.random() < 0.5;

    if (fromLeft) {

      yarn.style.left = "8%";
      yarn.style.top =
        `${25 + Math.random() * 50}%`;

      cat.classList.add("cat-run-left");

    } else {

      yarn.style.right = "8%";
      yarn.style.top =
        `${25 + Math.random() * 50}%`;

      cat.classList.add("cat-run-right");
    }

    // Kočka se po krátké chvíli rozběhne.
    setTimeout(() => {

      cat.classList.add("cat-running");

    }, 700);

    // Celou scénu uklidíme.
    setTimeout(() => {

      event.classList.add("cat-yarn-fade");

      setTimeout(() => {
        event.remove();
      }, 500);

    }, 4200);
  }


  /* ------------------------------------------------------------------------
     YARN / CAT CSS
     ------------------------------------------------------------------------ */

  function injectYarnStyle() {

    if (document.getElementById("cat-yarn-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "cat-yarn-style";

    style.textContent = `

      .cat-yarn-event {
        position: fixed;

        inset: 0;

        pointer-events: none;

        z-index: 9997;

        overflow: hidden;

        opacity: 1;

        transition: opacity .5s ease;
      }

      .cat-yarn-event.cat-yarn-fade {
        opacity: 0;
      }

      .cat-yarn {
        position: absolute;

        font-size: 34px;

        filter:
          drop-shadow(
            0 3px 8px rgba(0,0,0,.45)
          );

        animation:
          cat-yarn-bounce
          .8s ease-in-out infinite;
      }

      .cat-runner {
        position: absolute;

        font-size: 42px;

        opacity: 0;

        filter:
          drop-shadow(
            0 3px 8px rgba(0,0,0,.5)
          );

        transition:
          transform 2.2s cubic-bezier(.2,.8,.2,1),
          opacity .2s ease;
      }

      .cat-runner.cat-running {
        opacity: 1;
      }

      .cat-run-left {
        left: -80px;
      }

      .cat-run-right {
        right: -80px;

        transform:
          scaleX(-1);
      }

      .cat-run-left.cat-running {
        transform:
          translateX(calc(100vw + 160px));
      }

      .cat-run-right.cat-running {
        transform:
          translateX(calc(-100vw - 160px))
          scaleX(-1);
      }

      @keyframes cat-yarn-bounce {

        0%, 100% {
          transform:
            translateY(0)
            rotate(0deg);
        }

        50% {
          transform:
            translateY(-7px)
            rotate(18deg);
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* ------------------------------------------------------------------------
     RANDOM YARN SCHEDULER
     ------------------------------------------------------------------------ */

  function startYarnScheduler() {
function startYarnScheduler() {

  if (yarnTimer) {
    return;
  }

  const schedule = () => {

    if (!isCatTheme()) {
      yarnTimer = null;
      return;
    }

    spawnYarn();

    yarnTimer = setTimeout(
      schedule,
      8000 + Math.random() * 5000
    );
  };

  yarnTimer = setTimeout(
    schedule,
    3000
  );
}
  /* ------------------------------------------------------------------------
     START
     ------------------------------------------------------------------------ */

    document.addEventListener("DOMContentLoaded", () => {

    injectMessageStyle();
    injectPawStyle();
    injectYarnStyle();

    wireBattlefields();
    wireGlobalClicks();
    observeTheme();

    startYarnScheduler();

  });

})();
