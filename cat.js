/* ==========================================================================
   AIRSOFT MAPS — CAT THEME
   CAT ENGINE
   ========================================================================== */

(() => {

  const CAT_THEME = "cat";

  /* ------------------------------------------------------------------------
     CAT MESSAGES
     ------------------------------------------------------------------------ */

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


  /* ------------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------------ */

  let meowCooldown = false;
  let eventRunning = false;
  let eventTimer = null;
  let catSvgCache = null;


  /* ------------------------------------------------------------------------
     THEME
     ------------------------------------------------------------------------ */

  function isCatTheme() {
    return document.documentElement.dataset.theme === CAT_THEME;
  }


  /* ------------------------------------------------------------------------
     RANDOM
     ------------------------------------------------------------------------ */

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }


  /* ------------------------------------------------------------------------
     MESSAGE
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
     MESSAGE STYLE
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

        max-width:
          min(520px, calc(100vw - 30px));

        padding: 12px 18px;

        background: rgba(18,16,13,.96);

        border:
          1px solid rgba(255,157,66,.35);

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
     MEOW
     ------------------------------------------------------------------------ */

  function playMeow() {

    if (!isCatTheme()) return;
    if (meowCooldown) return;

    meowCooldown = true;

    const number =
      randomInt(1, 5);

    const audio =
      new Audio(`meow-${number}.mp3`);

    audio.volume = 0.35;

    audio.play().catch(() => {});

    setTimeout(() => {
      meowCooldown = false;
    }, 500);
  }


  /* ------------------------------------------------------------------------
     PAW
     ------------------------------------------------------------------------ */

  function spawnPaw() {

    if (!isCatTheme()) return;

    const paw =
      document.createElement("div");

    paw.className =
      "cat-floating-paw";

    paw.textContent = "🐾";

    paw.style.left =
      `${random(5, 95)}%`;

    paw.style.top =
      `${random(10, 85)}%`;

    paw.style.transform =
      `rotate(${random(-25, 25)}deg)`;

    document.body.appendChild(paw);

    requestAnimationFrame(() => {
      paw.classList.add("cat-paw-visible");
    });

    setTimeout(() => {

      paw.classList.remove(
        "cat-paw-visible"
      );

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

    const style =
      document.createElement("style");

    style.id =
      "cat-paw-style";

    style.textContent = `

      .cat-floating-paw {

        position: fixed;

        font-size: 22px;

        opacity: 0;

        pointer-events: none;

        z-index: 9998;

        filter:
          drop-shadow(
            0 0 6px
            rgba(255,157,66,.12)
          );

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
     CAT SVG LOADER
     ------------------------------------------------------------------------ */

  async function loadCatSvg() {

    if (catSvgCache) {
      return catSvgCache.cloneNode(true);
    }

    try {

      const response =
        await fetch("cat.svg");

      if (!response.ok) {
        throw new Error(
          `cat.svg HTTP ${response.status}`
        );
      }

      const text =
        await response.text();

      const parser =
        new DOMParser();

      const doc =
        parser.parseFromString(
          text,
          "image/svg+xml"
        );

      const svg =
        doc.documentElement;

      if (!svg || svg.tagName !== "svg") {
        throw new Error(
          "cat.svg není platné SVG."
        );
      }

      catSvgCache =
        svg.cloneNode(true);

      return svg;

    } catch (error) {

      console.warn(
        "AIRSOFT MAPS CAT:",
        "Nepodařilo se načíst cat.svg.",
        error
      );

      return null;
    }
  }


  /* ------------------------------------------------------------------------
     CAT EVENT CONTAINER
     ------------------------------------------------------------------------ */

  function createCatStage() {

    const stage =
      document.createElement("div");

    stage.className =
      "cat-event-stage";

    document.body.appendChild(stage);

    return stage;
  }


  /* ------------------------------------------------------------------------
     RANDOM CAT EVENT
     ------------------------------------------------------------------------ */

  async function randomCatEvent() {

    if (!isCatTheme()) return;
    if (eventRunning) return;

    eventRunning = true;

    const events = [

      catWalkEvent,
      yarnHuntEvent,
      lazyCatEvent,
      cursorHuntEvent

    ];

    const event =
      events[
        randomInt(0, events.length - 1)
      ];

    try {

      await event();

    } catch (error) {

      console.warn(
        "AIRSOFT MAPS CAT EVENT ERROR:",
        error
      );

    }

    eventRunning = false;

    scheduleNextCatEvent();
  }


  /* ------------------------------------------------------------------------
     CAT WALK
     ------------------------------------------------------------------------ */

  async function catWalkEvent() {

    const stage =
      createCatStage();

    const cat =
      await loadCatSvg();

    if (!cat) {
      stage.remove();
      return;
    }

    stage.appendChild(cat);

    stage.classList.add(
      "cat-event-walk"
    );

    const fromLeft =
      Math.random() < 0.5;

    stage.classList.add(
      fromLeft
        ? "cat-from-left"
        : "cat-from-right"
    );

    const duration =
      random(5000, 8500);

    stage.style.setProperty(
      "--cat-duration",
      `${duration}ms`
    );

    await wait(duration);

    stage.remove();
  }


  /* ------------------------------------------------------------------------
     YARN HUNT
     ------------------------------------------------------------------------ */

  async function yarnHuntEvent() {

    const stage =
      createCatStage();

    const cat =
      await loadCatSvg();

    if (!cat) {
      stage.remove();
      return;
    }

    const yarn =
      document.createElement("div");

    yarn.className =
      "cat-yarn-object";

    yarn.textContent =
      "🧶";

    stage.appendChild(yarn);
    stage.appendChild(cat);

    stage.classList.add(
      "cat-event-yarn"
    );

    const left =
      random(25, 70);

    const top =
      random(30, 65);

    stage.style.setProperty(
      "--yarn-x",
      `${left}%`
    );

    stage.style.setProperty(
      "--yarn-y",
      `${top}%`
    );

    /*
     * 1. Kočka se objeví.
     */

    await wait(900);

    /*
     * 2. Pomalu se přibližuje.
     */

    stage.classList.add(
      "cat-yarn-stalk"
    );

    await wait(2200);

    /*
     * 3. Zastaví.
     */

    stage.classList.add(
      "cat-yarn-stop"
    );

    await wait(1000);

    /*
     * 4. JUMP.
     */

    stage.classList.add(
      "cat-yarn-pounce"
    );

    playMeow();

    await wait(700);

    /*
     * 5. Klubíčko uteče.
     */

    stage.classList.add(
      "cat-yarn-escape"
    );

    await wait(1300);

    /*
     * 6. Kočka za ním.
     */

    stage.classList.add(
      "cat-yarn-chase"
    );

    await wait(1800);

    stage.classList.add(
      "cat-event-fade"
    );

    await wait(500);

    stage.remove();
  }


  /* ------------------------------------------------------------------------
     LAZY CAT
     ------------------------------------------------------------------------ */

  async function lazyCatEvent() {

    const stage =
      createCatStage();

    const cat =
      await loadCatSvg();

    if (!cat) {
      stage.remove();
      return;
    }

    stage.appendChild(cat);

    stage.classList.add(
      "cat-event-lazy"
    );

    await wait(
      random(3500, 6000)
    );

    stage.classList.add(
      "cat-event-fade"
    );

    await wait(600);

    stage.remove();
  }


  /* ------------------------------------------------------------------------
     CURSOR HUNT
     ------------------------------------------------------------------------ */

  async function cursorHuntEvent() {

    const stage =
      createCatStage();

    const cat =
      await loadCatSvg();

    if (!cat) {
      stage.remove();
      return;
    }

    stage.appendChild(cat);

    stage.classList.add(
      "cat-event-cursor"
    );

    let mouseX =
      window.innerWidth / 2;

    let mouseY =
      window.innerHeight / 2;

    const updateMouse = e => {

      mouseX = e.clientX;
      mouseY = e.clientY;

      stage.style.setProperty(
        "--mouse-x",
        `${mouseX}px`
      );

      stage.style.setProperty(
        "--mouse-y",
        `${mouseY}px`
      );
    };

    document.addEventListener(
      "pointermove",
      updateMouse
    );

    stage.classList.add(
      "cat-cursor-search"
    );

    await wait(1600);

    stage.classList.add(
      "cat-cursor-stalk"
    );

    await wait(1700);

    stage.classList.add(
      "cat-cursor-pounce"
    );

    playMeow();

    await wait(800);

    document.removeEventListener(
      "pointermove",
      updateMouse
    );

    stage.classList.add(
      "cat-event-fade"
    );

    await wait(500);

    stage.remove();
  }


  /* ------------------------------------------------------------------------
     WAIT
     ------------------------------------------------------------------------ */

  function wait(ms) {

    return new Promise(
      resolve =>
        setTimeout(resolve, ms)
    );
  }


  /* ------------------------------------------------------------------------
     EVENT SCHEDULER
     ------------------------------------------------------------------------ */

  function scheduleNextCatEvent() {

    clearTimeout(eventTimer);

    if (!isCatTheme()) {
      return;
    }

    /*
     * Žádný pevný interval.
     * Kočka si sama rozhoduje, kdy se jí chce.
     */

    const delay =
      random(5000, 18000);

    eventTimer =
      setTimeout(() => {

        if (!isCatTheme()) {
          return;
        }

        /*
         * Občas kočka prostě nic neudělá.
         */

        if (Math.random() < 0.25) {

          scheduleNextCatEvent();
          return;
        }

        randomCatEvent();

      }, delay);
  }


  /* ------------------------------------------------------------------------
     BATTLEFIELD CLICK
     ------------------------------------------------------------------------ */

  function wireBattlefields() {

    document.querySelectorAll(
      ".am-row"
    ).forEach(row => {

      if (
        row.dataset.catWired === "true"
      ) {
        return;
      }

      row.dataset.catWired =
        "true";

      row.addEventListener(
        "click",
        e => {

          if (!isCatTheme()) {
            return;
          }

          if (Math.random() < 0.45) {

            e.preventDefault();

            e.stopImmediatePropagation();

            showCatMessage(
              catMessages[
                randomInt(
                  0,
                  catMessages.length - 1
                )
              ]
            );

            playMeow();

            if (Math.random() < 0.45) {
              spawnPaw();
            }

            return;
          }

          playMeow();

        },
        true
      );

    });
  }


  /* ------------------------------------------------------------------------
     GLOBAL CLICKS
     ------------------------------------------------------------------------ */

  function wireGlobalClicks() {

    document.addEventListener(
      "click",
      e => {

        if (!isCatTheme()) {
          return;
        }

        if (
          e.target.closest(".am-btn") ||
          e.target.closest("[data-theme]") ||
          e.target.closest(".am-dd-menu")
        ) {

          if (Math.random() < 0.18) {
            playMeow();
          }

        }

      }
    );
  }


  /* ------------------------------------------------------------------------
     CAT ENGINE CSS
     ------------------------------------------------------------------------ */

  function injectCatEngineStyle() {

    if (
      document.getElementById(
        "cat-engine-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "cat-engine-style";

    style.textContent = `

      .cat-event-stage {

        position: fixed;

        inset: 0;

        pointer-events: none;

        overflow: hidden;

        z-index: 9997;

        opacity: 1;

        transition:
          opacity .5s ease;
      }


      .cat-event-stage svg {

        position: absolute;

        width: 150px;

        height: 150px;

        overflow: visible;

        filter:
          drop-shadow(
            0 8px 12px
            rgba(0,0,0,.35)
          );
      }


      .cat-event-fade {

        opacity: 0;
      }


      /* --------------------------------------------------------------
         WALK
         -------------------------------------------------------------- */

      .cat-event-walk svg {

        top: 50%;

        width: 130px;
        height: 130px;

        transition:
          transform var(--cat-duration)
          linear;
      }

      .cat-from-left svg {

        left: -160px;

        transform:
          translateX(0);
      }

      .cat-from-left.cat-event-walk svg {

        transform:
          translateX(
            calc(100vw + 320px)
          );
      }

      .cat-from-right svg {

        right: -160px;

        transform:
          scaleX(-1);
      }

      .cat-from-right.cat-event-walk svg {

        transform:
          translateX(
            calc(-100vw - 320px)
          )
          scaleX(-1);
      }


      /* --------------------------------------------------------------
         LAZY CAT
         -------------------------------------------------------------- */

      .cat-event-lazy svg {

        left: 50%;

        top: 60%;

        width: 180px;
        height: 180px;

        transform:
          translate(-50%, -50%)
          rotate(-3deg);

        animation:
          cat-lazy-breathe
          2.8s ease-in-out infinite;
      }


      @keyframes cat-lazy-breathe {

        0%, 100% {
          transform:
            translate(-50%, -50%)
            rotate(-3deg)
            scale(1);
        }

        50% {
          transform:
            translate(-50%, -50%)
            rotate(-3deg)
            scale(1.025);
        }

      }


      /* --------------------------------------------------------------
         YARN
         -------------------------------------------------------------- */

      .cat-event-yarn svg {

        left: -180px;

        top: var(--yarn-y);

        width: 145px;
        height: 145px;

        transform:
          translateY(-50%);
      }

      .cat-yarn-object {

        position: absolute;

        left: var(--yarn-x);

        top: var(--yarn-y);

        font-size: 38px;

        transform:
          translate(-50%, -50%);

        filter:
          drop-shadow(
            0 4px 8px
            rgba(0,0,0,.4)
          );

        transition:
          left 1.2s ease,
          transform 1.2s ease;
      }


      .cat-yarn-stalk svg {

        transition:
          transform 2.2s
          cubic-bezier(
            .2,.8,.2,1
          );

        transform:
          translateX(
            calc(
              var(--yarn-x) -
              15vw
            )
          )
          translateY(-50%);
      }


      .cat-yarn-stop svg {

        transform:
          translateX(
            calc(
              var(--yarn-x) -
              15vw
            )
          )
          translateY(-50%)
          scale(.96);
      }


      .cat-yarn-pounce svg {

        animation:
          cat-pounce
          .7s
          cubic-bezier(.2,.8,.2,1);
      }


      @keyframes cat-pounce {

        0% {
          transform:
            translateX(
              calc(
                var(--yarn-x) -
                15vw
              )
            )
            translateY(-50%)
            scale(.96);
        }

        55% {
          transform:
            translateX(
              calc(
                var(--yarn-x) -
                5vw
              )
            )
            translateY(-65%)
            scale(1.15);
        }

        100% {
          transform:
            translateX(
              calc(
                var(--yarn-x) +
                5vw
              )
            )
            translateY(-50%)
            scale(1);
        }

      }


      .cat-yarn-escape
      .cat-yarn-object {

        left:
          calc(
            var(--yarn-x) + 20%
          );

        transform:
          translate(
            -50%,
            -50%
          )
          rotate(720deg);
      }


      .cat-yarn-chase svg {

        animation:
          cat-chase
          1.8s
          cubic-bezier(
            .2,.8,.2,1
          )
          forwards;
      }


      @keyframes cat-chase {

        to {
          transform:
            translateX(
              100vw
            )
            translateY(-50%);
        }

      }


      /* --------------------------------------------------------------
         CURSOR HUNT
         -------------------------------------------------------------- */

      .cat-event-cursor svg {

        left: 20px;

        top: 20px;

        width: 130px;
        height: 130px;

        transform:
          translate(
            0,
            0
          );
      }


      .cat-cursor-search svg {

        animation:
          cat-cursor-search
          1.6s
          ease-in-out
          forwards;
      }


      @keyframes cat-cursor-search {

        0% {
          transform:
            translate(
              0,
              0
            )
            rotate(0deg);
        }

        100% {
          transform:
            translate(
              30vw,
              15vh
            )
            rotate(8deg);
        }

      }


      .cat-cursor-stalk svg {

        animation:
          cat-cursor-stalk
          1.7s
          ease-in-out
          forwards;
      }


      @keyframes cat-cursor-stalk {

        from {
          transform:
            translate(
              30vw,
              15vh
            )
            rotate(8deg);
        }

        to {
          transform:
            translate(
              55vw,
              30vh
            )
            rotate(-4deg);
        }

      }


      .cat-cursor-pounce svg {

        animation:
          cat-cursor-pounce
          .8s
          cubic-bezier(
            .2,.8,.2,1
          )
          forwards;
      }


      @keyframes cat-cursor-pounce {

        0% {
          transform:
            translate(
              55vw,
              30vh
            )
            scale(1);
        }

        55% {
          transform:
            translate(
              65vw,
              40vh
            )
            scale(1.25);
        }

        100% {
          transform:
            translate(
              70vw,
              45vh
            )
            scale(.95);
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* ------------------------------------------------------------------------
     THEME OBSERVER
     ------------------------------------------------------------------------ */

  function observeTheme() {

    const observer =
      new MutationObserver(() => {

        if (isCatTheme()) {

          scheduleNextCatEvent();

        } else {

          clearTimeout(eventTimer);

          eventTimer = null;

          eventRunning = false;

          document
            .querySelectorAll(
              ".cat-event-stage"
            )
            .forEach(
              el => el.remove()
            );

          document
            .querySelectorAll(
              ".cat-floating-paw"
            )
            .forEach(
              el => el.remove()
            );
        }

      });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "data-theme"
        ]
      }
    );
  }


  /* ------------------------------------------------------------------------
     START
     ------------------------------------------------------------------------ */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      injectMessageStyle();
      injectPawStyle();
      injectCatEngineStyle();

      wireBattlefields();
      wireGlobalClicks();
      observeTheme();

      if (isCatTheme()) {
        scheduleNextCatEvent();
      }

    }
  );

})();
