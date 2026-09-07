/* =========================================================
   AIRSOFT MAPS - HELL MODE
   INFERNO / FINAL VERSION
   ========================================================= */

(() => {

  window.startHell = function () {

    /* ---------------------------------------------
       Ochrana proti dvojímu spuštění
       --------------------------------------------- */

    if (document.querySelector(".hell-overlay")) {
      return;
    }


    /* ---------------------------------------------
       Hlavní overlay
       --------------------------------------------- */

    const overlay =
      document.createElement("div");

    overlay.className =
      "hell-overlay";


    /* ---------------------------------------------
       Pentagram + prostředí
       --------------------------------------------- */

    const pentagram =
      document.createElement("div");

    pentagram.className =
      "hell-pentagram";


    const center =
      document.createElement("div");

    center.className =
      "hell-center";


    /* ---------------------------------------------
       Nadpis
       --------------------------------------------- */

    const title =
      document.createElement("div");

    title.className =
      "hell-message";

    title.textContent =
      "HELL";


    /* ---------------------------------------------
       Podtitulek
       --------------------------------------------- */

    const subtitle =
      document.createElement("div");

    subtitle.className =
      "hell-subtitle";

    subtitle.textContent =
      "YOU CROSSED THE THRESHOLD";


    /* ---------------------------------------------
       Text + tajné tečky
       --------------------------------------------- */

    const returnText =
      document.createElement("div");

    returnText.className =
      "hell-return-text";

    returnText.innerHTML = `
      <span>NENÍ CESTY ZPĚT</span>

      <span class="hell-dots">

        <button
          class="hell-dot black"
          data-color="black"
          aria-label="black">
        </button>

        <button
          class="hell-dot gold"
          data-color="gold"
          aria-label="gold">
        </button>

        <button
          class="hell-dot red"
          data-color="red"
          aria-label="red">
        </button>

      </span>
    `;


    /* ---------------------------------------------
       Progress
       --------------------------------------------- */

    const progress =
      document.createElement("div");

    progress.className =
      "hell-progress";

    progress.innerHTML = `
      <div class="hell-progress-bar"></div>
    `;


    /* ---------------------------------------------
       Složení scény
       --------------------------------------------- */

    center.append(
      title,
      subtitle,
      returnText
    );

    overlay.append(
      pentagram,
      center,
      progress
    );

    document.body.appendChild(
      overlay
    );


    /* ---------------------------------------------
       Částice
       --------------------------------------------- */

    createParticles(
      overlay
    );


    /* ---------------------------------------------
       Sekvence
       --------------------------------------------- */

    const dots =
      overlay.querySelectorAll(
        ".hell-dot"
      );

    const progressBar =
      overlay.querySelector(
        ".hell-progress-bar"
      );


    const correctSequence = [
      "black",
      "gold",
      "red",
      "gold",
      "black"
    ];


    let currentSequence = [];


    /* ---------------------------------------------
       Klikání
       --------------------------------------------- */

    dots.forEach(dot => {

      dot.addEventListener(
        "click",
        () => {

          const color =
            dot.dataset.color;


          const expected =
            correctSequence[
              currentSequence.length
            ];


          /* -----------------------------
             SPRÁVNĚ
             ----------------------------- */

          if (color === expected) {

            currentSequence.push(
              color
            );


            dot.classList.add(
              "correct"
            );


            setTimeout(() => {

              dot.classList.remove(
                "correct"
              );

            }, 350);


            const percent =
              (
                currentSequence.length /
                correctSequence.length
              ) * 100;


            progressBar.style.width =
              `${percent}%`;


            console.log(
              "HELL:",
              currentSequence.join(" → ")
            );


            /* -----------------------------
               HOTOVO
               ----------------------------- */

            if (
              currentSequence.length ===
              correctSequence.length
            ) {

              completeHell(
                overlay
              );

            }

            return;
          }


          /* -----------------------------
             ŠPATNĚ
             ----------------------------- */

          dot.classList.add(
            "wrong"
          );


          setTimeout(() => {

            dot.classList.remove(
              "wrong"
            );

          }, 400);


          currentSequence = [];

          progressBar.style.width =
            "0%";


          console.log(
            "HELL: WRONG"
          );

        }
      );

    });


    /* ---------------------------------------------
       Particle generator
       --------------------------------------------- */

    function createParticles(
      parent
    ) {

      const count =
        window.innerWidth < 600
          ? 18
          : 32;


      for (
        let i = 0;
        i < count;
        i++
      ) {

        const particle =
          document.createElement("div");

        particle.className =
          "hell-particle";


        particle.style.left =
          `${Math.random() * 100}%`;


        particle.style.animationDuration =
          `${7 + Math.random() * 10}s`;


        particle.style.animationDelay =
          `${Math.random() * 8}s`;


        const size =
          1 +
          Math.random() * 2;


        particle.style.width =
          `${size}px`;

        particle.style.height =
          `${size}px`;


        parent.appendChild(
          particle
        );

      }

    }


    /* ---------------------------------------------
       Dokončení HELL sekvence
       --------------------------------------------- */

    function completeHell(
      overlay
    ) {

      console.log(
        "HELL: 6-6-6 COMPLETE"
      );


      /* Zhasnutí prostředí */

      overlay.style.transition =
        "opacity 1.2s ease";

      overlay.style.opacity =
        "0";


      setTimeout(() => {

        overlay.remove();

        showHellReturn();

      }, 1200);

    }


    /* ---------------------------------------------
       Návrat
       --------------------------------------------- */

    function showHellReturn() {

      const returnScreen =
        document.createElement("div");

      returnScreen.className =
        "hell-return";


      /* -----------------------------------------
         Kód
         ----------------------------------------- */

      const code =
        "AM-HELL-" +
        Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase();


      returnScreen.innerHTML = `

        <button
          class="hell-close"
          aria-label="Close">
          ×
        </button>

        <div class="hell-return-title">
          VÍTEJ ZPĚT Z PEKLA
        </div>

        <div class="hell-code">
          ${code}
        </div>

      `;


      document.body.appendChild(
        returnScreen
      );


      /* -----------------------------------------
         Zavření
         ----------------------------------------- */

      const close =
        returnScreen.querySelector(
          ".hell-close"
        );


      close.addEventListener(
        "click",
        () => {

          returnScreen.style.transition =
            "opacity 0.5s ease";

          returnScreen.style.opacity =
            "0";


          setTimeout(() => {

            returnScreen.remove();

          }, 500);

        }
      );

    }

  };

})();
