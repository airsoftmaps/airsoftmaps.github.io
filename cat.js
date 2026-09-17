/* ==========================================================================
   AIRSOFT MAPS — CAT THEME
   CAT ENGINE
   ========================================================================== */

(() => {

  const CAT_THEME = "cat";


  /* ========================================================================
     CAT MESSAGES
     ======================================================================== */

  const catMessages = [
  {
    cs: "Kočka něco shodila. Odmítá se přiznat. Zkus to znovu.",
    en: "The cat knocked something over. It refuses to confess. Try again."
  },
  {
    cs: "Kočka právě sedí na tlačítku. Zkus to znovu.",
    en: "The cat is currently sitting on the button. Try again."
  },
  {
    cs: "Něco spadlo. Kočka tvrdí, že to bylo už rozbité.",
    en: "Something fell. The cat claims it was already broken."
  },
  {
    cs: "Kočka kontroluje hřiště. Kontrola spočívá v ležení.",
    en: "The cat is checking the battlefield. The inspection consists of lying down."
  },
  {
    cs: "Moment. Kočka si lehla na mapu.",
    en: "Stand by. The cat has laid down on the map."
  },
  {
    cs: "Kočka si myslí, že tohle není dobrý nápad.",
    en: "The cat thinks this is not a good idea."
  },
  {
    cs: "Kočka rozhodla, že ještě ne.",
    en: "The cat has decided: not yet."
  },
  {
    cs: "Kočka to schválí, až se jí bude chtít.",
    en: "The cat will approve it when it feels like it."
  },
  {
    cs: "Kočka odmítla spolupracovat.",
    en: "The cat refused to cooperate."
  },
  {
    cs: "Kočka momentálně řeší důležitější věci.",
    en: "The cat is currently dealing with more important matters."
  },
  {
    cs: "Systém funguje. Kočka ne.",
    en: "The system works. The cat doesn't."
  }
];


  /* ========================================================================
     STATE
     ======================================================================== */

  let meowCooldown = false;
  let eventRunning = false;
  let eventTimer = null;
  let catSvgCache = null;


  /* ========================================================================
     THEME
     ======================================================================== */

  function isCatTheme() {

    return (
      document.documentElement.dataset.theme === CAT_THEME
    );

  }


  /* ========================================================================
     RANDOM HELPERS
     ======================================================================== */

  function random(min, max) {

    return Math.random() * (max - min) + min;

  }


  function randomInt(min, max) {

    return Math.floor(
      random(min, max + 1)
    );

  }


  /* ========================================================================
     WAIT
     ======================================================================== */

  function wait(ms) {

    return new Promise(
      resolve => setTimeout(resolve, ms)
    );

  }


  /* ========================================================================
     CAT MESSAGE
     ======================================================================== */

  function showCatMessage(message) {

    if (!isCatTheme()) return;


    let box =
      document.getElementById("cat-message");


    if (!box) {

      box =
        document.createElement("div");

      box.id =
        "cat-message";

      document.body.appendChild(box);

    }


    box.textContent =
      message;


    box.classList.remove(
      "cat-message-show"
    );


    void box.offsetWidth;


    box.classList.add(
      "cat-message-show"
    );


    clearTimeout(
      box._catTimeout
    );


    box._catTimeout =
      setTimeout(() => {

        box.classList.remove(
          "cat-message-show"
        );

      }, 2800);

  }


  /* ========================================================================
     MESSAGE STYLE
     ======================================================================== */

  function injectMessageStyle() {

    if (
      document.getElementById(
        "cat-message-style"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");


    style.id =
      "cat-message-style";


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

        background:
          rgba(18,16,13,.96);

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


      html[data-theme="cat"]
      #cat-message::before {

        content: "🐾";

        margin-right: 8px;

      }

    `;


    document.head.appendChild(style);

  }


  /* ========================================================================
     MEOW
     ======================================================================== */

  function playMeow() {

    if (!isCatTheme()) return;

    if (meowCooldown) return;


    meowCooldown = true;


    const number =
      randomInt(1, 5);


    const audio =
      new Audio(
        `meow-${number}.mp3`
      );


    audio.volume =
      0.35;


    audio.play().catch(() => {
      // Prohlížeč může zvuk zablokovat.
    });


    setTimeout(() => {

      meowCooldown = false;

    }, 500);

  }


  /* ========================================================================
     RANDOM PAW
     ======================================================================== */

  function spawnPaw() {

    if (!isCatTheme()) return;


    const paw =
      document.createElement("div");


    paw.className =
      "cat-floating-paw";


    paw.textContent =
      "🐾";


    paw.style.left =
      `${random(5, 95)}%`;


    paw.style.top =
      `${random(10, 85)}%`;


    paw.style.transform =
      `rotate(${random(-25, 25)}deg)`;


    document.body.appendChild(paw);


    requestAnimationFrame(() => {

      paw.classList.add(
        "cat-paw-visible"
      );

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


  /* ========================================================================
     PAW STYLE
     ======================================================================== */

  function injectPawStyle() {

    if (
      document.getElementById(
        "cat-paw-style"
      )
    ) {
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


  /* ========================================================================
     LOAD CAT SVG
     ======================================================================== */

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


      if (
        !svg ||
        svg.tagName !== "svg"
      ) {

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


  /* ========================================================================
     CAT EVENT STAGE
     ======================================================================== */

  function createCatStage() {

    const stage =
      document.createElement("div");


    stage.className =
      "cat-event-stage";


    document.body.appendChild(
      stage
    );


    return stage;

  }


  /* ========================================================================
     RANDOM CAT EVENT
     ======================================================================== */

async function randomCatEvent() {
  console.log("🐾 CAT: event start");

  if (!isCatTheme()) {
    console.log("🐾 CAT: není cat theme");
    return;
  }

  if (eventRunning) {
    console.log("🐾 CAT: event už běží");
    return;
  }

  eventRunning = true;

  const events = [
    catWalkEvent,
    yarnHuntEvent,
    lazyCatEvent
  ];

  const index = randomInt(0, events.length - 1);
  const event = events[index];

  console.log(
    "🐾 CAT: vybraný event:",
    event.name
  );

  try {
    await event();

    console.log(
      "🐾 CAT: event dokončen:",
      event.name
    );

  } catch (error) {

    console.error(
      "🐾 CAT EVENT ERROR:",
      error
    );
  }

  eventRunning = false;

  console.log(
    "🐾 CAT: plánuji další event"
  );

  scheduleNextCatEvent();
}


  /* ========================================================================
     EVENT 1 — CAT WALK
     ======================================================================== */

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
      random(6000, 9500);


    stage.style.setProperty(

      "--cat-duration",

      `${duration}ms`

    );


    await wait(100);


    stage.classList.add(
      "cat-walk-start"
    );


    await wait(
      duration
    );


    stage.remove();

  }


  /* ========================================================================
     EVENT 2 — YARN HUNT
     ======================================================================== */

  async function yarnHuntEvent() {

    const stage =
      createCatStage();


    const cat =
      await loadCatSvg();


    if (!cat) {

      stage.remove();

      return;

    }


    /* --------------------------------------------------------------------
       KLUBÍČKO
       -------------------------------------------------------------------- */

    const yarn =
      document.createElement("div");


    yarn.className =
      "cat-yarn-object";


    yarn.textContent =
      "🧶";


    /* --------------------------------------------------------------------
       SCÉNA
       -------------------------------------------------------------------- */

    stage.appendChild(
      yarn
    );


    stage.appendChild(
      cat
    );


    stage.classList.add(
      "cat-event-yarn"
    );


    /* --------------------------------------------------------------------
       POZICE KLUBÍČKA
       -------------------------------------------------------------------- */

    const yarnX =
      random(35, 70);


    const yarnY =
      random(30, 65);


    stage.style.setProperty(

      "--yarn-x",

      `${yarnX}%`

    );


    stage.style.setProperty(

      "--yarn-y",

      `${yarnY}%`

    );


    /* --------------------------------------------------------------------
       SMĚR
       -------------------------------------------------------------------- */

    const fromLeft =
      Math.random() < 0.5;


    stage.classList.add(

      fromLeft
        ? "cat-yarn-from-left"
        : "cat-yarn-from-right"

    );


    /* --------------------------------------------------------------------
       1. KOČKA PŘICHÁZÍ
       -------------------------------------------------------------------- */

    await wait(
      random(500, 1000)
    );


    if (!isCatTheme()) {

      stage.remove();

      return;

    }


    stage.classList.add(
      "cat-yarn-enter"
    );


    await wait(1200);


    /* --------------------------------------------------------------------
       2. KOČKA SI VŠIMNE KLUBÍČKA
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-notice"
    );


    playMeow();


    await wait(900);


    /* --------------------------------------------------------------------
       3. POMALU SE PŘIBLÍŽÍ
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-stalk"
    );


    await wait(
      random(1800, 2600)
    );


    /* --------------------------------------------------------------------
       4. ZASTAVÍ
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-stop"
    );


    await wait(
      random(800, 1500)
    );


    /* --------------------------------------------------------------------
       5. PŘIKRČÍ SE
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-crouch"
    );


    await wait(600);


    /* --------------------------------------------------------------------
       6. POUNCE
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-pounce"
    );


    playMeow();


    await wait(650);


    /* --------------------------------------------------------------------
       7. KLUBÍČKO UTEČE
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-escape"
    );


    await wait(900);


    /* --------------------------------------------------------------------
       8. KOČKA ZA NÍM
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-yarn-chase"
    );


    await wait(1700);


    /* --------------------------------------------------------------------
       9. KONEC
       -------------------------------------------------------------------- */

    stage.classList.add(
      "cat-event-fade"
    );


    await wait(600);


    stage.remove();

  }


  /* ========================================================================
     EVENT 3 — LAZY CAT
     ======================================================================== */

  async function lazyCatEvent() {

    const stage =
      createCatStage();


    const cat =
      await loadCatSvg();


    if (!cat) {

      stage.remove();

      return;

    }


    stage.appendChild(
      cat
    );


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


  /* ========================================================================
     BATTLEFIELD CLICK
     ======================================================================== */

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


          if (
            Math.random() < 0.45
          ) {


            e.preventDefault();


            e.stopImmediatePropagation();


            const lang = AM.getLang();

const message =
  catMessages[
    randomInt(
      0,
      catMessages.length - 1
    )
  ];

showCatMessage(
  message[lang] || message.cs
);


            playMeow();


            if (
              Math.random() < 0.45
            ) {

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


  /* ========================================================================
     GLOBAL CLICKS
     ======================================================================== */

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


          if (
            Math.random() < 0.18
          ) {

            playMeow();

          }

        }

      }
    );

  }


  /* ========================================================================
     CAT ENGINE CSS
     ======================================================================== */

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


      /* ==============================================================
         BASE
         ============================================================== */

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


      /* ==============================================================
         CAT WALK
         ============================================================== */

      .cat-event-walk svg {

        top: 50%;

        width: 130px;
        height: 130px;

        transition:
          transform
          var(--cat-duration)
          linear;

      }


      .cat-from-left svg {

        left: -160px;

        transform:
          translateX(0);

      }


      .cat-from-left.cat-walk-start svg {

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


      .cat-from-right.cat-walk-start svg {

        transform:
          translateX(
            calc(-100vw - 320px)
          )
          scaleX(-1);

      }


      /* ==============================================================
         LAZY CAT
         ============================================================== */

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
          2.8s
          ease-in-out
          infinite;

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


      /* ==============================================================
         YARN HUNT
         ============================================================== */

      .cat-event-yarn {

        --cat-size: 145px;

      }


      /* --------------------------------------------------------------
         YARN
         -------------------------------------------------------------- */

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
            rgba(0,0,0,.45)
          );

        z-index: 2;

        transition:

          left .8s
          cubic-bezier(.2,.8,.2,1),

          top .8s
          cubic-bezier(.2,.8,.2,1),

          transform .8s
          cubic-bezier(.2,.8,.2,1);

      }


      /* --------------------------------------------------------------
         CAT
         -------------------------------------------------------------- */

      .cat-event-yarn svg {

        position: absolute;

        width: var(--cat-size);

        height: var(--cat-size);

        top: var(--yarn-y);

        transform:
          translateY(-50%);

        z-index: 3;

        overflow: visible;

        filter:
          drop-shadow(
            0 8px 12px
            rgba(0,0,0,.35)
          );

      }


      /* --------------------------------------------------------------
         START POSITION
         -------------------------------------------------------------- */

      .cat-yarn-from-left svg {

        left: -180px;

        transform:
          translateY(-50%)
          scaleX(1);

      }


      .cat-yarn-from-right svg {

        right: -180px;

        transform:
          translateY(-50%)
          scaleX(-1);

      }


      /* --------------------------------------------------------------
         ENTER
         -------------------------------------------------------------- */

      .cat-yarn-from-left.cat-yarn-enter svg {

        animation:
          cat-yarn-enter-left
          1.2s
          cubic-bezier(.2,.75,.2,1)
          forwards;

      }


      .cat-yarn-from-right.cat-yarn-enter svg {

        animation:
          cat-yarn-enter-right
          1.2s
          cubic-bezier(.2,.75,.2,1)
          forwards;

      }


      @keyframes cat-yarn-enter-left {

        from {

          transform:
            translateY(-50%)
            translateX(0);

        }

        to {

          transform:
            translateY(-50%)
            translateX(18vw);

        }

      }


      @keyframes cat-yarn-enter-right {

        from {

          transform:
            translateY(-50%)
            translateX(0)
            scaleX(-1);

        }

        to {

          transform:
            translateY(-50%)
            translateX(-18vw)
            scaleX(-1);

        }

      }


      /* --------------------------------------------------------------
         NOTICE
         -------------------------------------------------------------- */

      .cat-yarn-notice svg {

        animation:
          cat-yarn-look
          .9s
          ease-out
          forwards;

      }


      @keyframes cat-yarn-look {

        0% {

          transform:
            translateY(-50%)
            rotate(0deg);

        }

        50% {

          transform:
            translateY(-50%)
            translateY(-5px)
            rotate(-5deg)
            scale(1.04);

        }

        100% {

          transform:
            translateY(-50%)
            rotate(0deg);

        }

      }


      /* --------------------------------------------------------------
         STALK
         -------------------------------------------------------------- */

      .cat-yarn-from-left.cat-yarn-stalk svg {

        animation:
          cat-yarn-stalk-left
          2.2s
          cubic-bezier(.2,.7,.2,1)
          forwards;

      }


      .cat-yarn-from-right.cat-yarn-stalk svg {

        animation:
          cat-yarn-stalk-right
          2.2s
          cubic-bezier(.2,.7,.2,1)
          forwards;

      }


      @keyframes cat-yarn-stalk-left {

        from {

          transform:
            translateY(-50%)
            translateX(18vw);

        }

        to {

          transform:
            translateY(-50%)
            translateX(
              calc(
                var(--yarn-x) - 18vw
              )
            );

        }

      }


      @keyframes cat-yarn-stalk-right {

        from {

          transform:
            translateY(-50%)
            translateX(-18vw)
            scaleX(-1);

        }

        to {

          transform:
            translateY(-50%)
            translateX(
              calc(
                18vw - var(--yarn-x)
              )
            )
            scaleX(-1);

        }

      }


      /* --------------------------------------------------------------
         STOP
         -------------------------------------------------------------- */

      .cat-yarn-stop svg {

        animation:
          cat-yarn-breathe
          1.2s
          ease-in-out
          infinite;

      }


      @keyframes cat-yarn-breathe {

        0%, 100% {

          transform:
            translateY(-50%)
            scale(1);

        }

        50% {

          transform:
            translateY(-50%)
            translateY(-3px)
            scale(.97);

        }

      }


      /* --------------------------------------------------------------
         CROUCH
         -------------------------------------------------------------- */

      .cat-yarn-crouch svg {

        animation:
          cat-yarn-crouch
          .6s
          cubic-bezier(.2,.8,.2,1)
          forwards;

      }


      @keyframes cat-yarn-crouch {

        from {

          transform:
            translateY(-50%)
            scale(1);

        }

        to {

          transform:
            translateY(-45%)
            scaleX(1.08)
            scaleY(.82);

        }

      }


      /* --------------------------------------------------------------
         POUNCE
         -------------------------------------------------------------- */

      .cat-yarn-pounce svg {

        animation:
          cat-yarn-pounce
          .65s
          cubic-bezier(.2,.9,.2,1)
          forwards;

      }


      @keyframes cat-yarn-pounce {

        0% {

          transform:
            translateY(-45%)
            scaleX(1.08)
            scaleY(.82);

        }

        45% {

          transform:
            translateY(-90%)
            translateX(4vw)
            scaleX(1.12)
            scaleY(1.12);

        }

        100% {

          transform:
            translateY(-50%)
            translateX(7vw)
            scale(1);

        }

      }


      /* --------------------------------------------------------------
         YARN ESCAPE
         -------------------------------------------------------------- */

      .cat-yarn-escape
      .cat-yarn-object {

        left:
          calc(
            var(--yarn-x) + 16%
          );

        transform:
          translate(
            -50%,
            -50%
          )
          rotate(720deg);

      }


      /* --------------------------------------------------------------
         CHASE
         -------------------------------------------------------------- */

      .cat-yarn-from-left.cat-yarn-chase svg {

        animation:
          cat-yarn-chase-left
          1.7s
          cubic-bezier(.2,.8,.2,1)
          forwards;

      }


      .cat-yarn-from-right.cat-yarn-chase svg {

        animation:
          cat-yarn-chase-right
          1.7s
          cubic-bezier(.2,.8,.2,1)
          forwards;

      }


      @keyframes cat-yarn-chase-left {

        to {

          transform:
            translateY(-50%)
            translateX(
              calc(100vw + 350px)
            );

        }

      }


      @keyframes cat-yarn-chase-right {

        to {

          transform:
            translateY(-50%)
            translateX(
              calc(-100vw - 350px)
            )
            scaleX(-1);

        }

      }


      /* ==============================================================
         MOBILE
         ============================================================== */

      @media (max-width: 700px) {

        .cat-event-stage svg {

          width: 120px;
          height: 120px;

        }


        .cat-event-walk svg {

          width: 115px;
          height: 115px;

        }


        .cat-event-yarn {

          --cat-size: 120px;

        }


        .cat-yarn-object {

          font-size: 32px;

        }

      }

    `;


    document.head.appendChild(style);

  }


  /* ========================================================================
     THEME OBSERVER
     ======================================================================== */

  function observeTheme() {

    const observer =
      new MutationObserver(() => {


        if (isCatTheme()) {

          scheduleNextCatEvent();

        } else {


          clearTimeout(
            eventTimer
          );


          eventTimer =
            null;


          eventRunning =
            false;


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


  /* ========================================================================
     EVENT SCHEDULER
     ======================================================================== */

  function scheduleNextCatEvent() {

    clearTimeout(
      eventTimer
    );


    if (!isCatTheme()) {

      return;

    }


    /*
     * Kočka nemá jízdní řád.
     *
     * Každý event může přijít
     * v jiný čas.
     */

    const delay =
      random(5000, 18000);


    eventTimer =
      setTimeout(() => {


        if (!isCatTheme()) {

          return;

        }


        /*
         * Občas kočka neudělá vůbec nic.
         */

        if (
          Math.random() < 0.25
        ) {

          scheduleNextCatEvent();

          return;

        }


        randomCatEvent();


      }, delay);

  }


  /* ========================================================================
     START
     ======================================================================== */

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
