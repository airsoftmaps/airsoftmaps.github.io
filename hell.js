/* =========================================================
   AIRSOFT MAPS - HELL MODE
   TEST VERSION
   ========================================================= */

(() => {

  window.startHell = function () {

    // Zabránění spuštění více HELL overlayů
    if (document.querySelector(".hell-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "hell-overlay";

    overlay.innerHTML = `
      <div class="hell-message">HELL</div>

      <div class="hell-dots">
        <div class="hell-dot black" data-color="black"></div>
        <div class="hell-dot gold" data-color="gold"></div>
        <div class="hell-dot red" data-color="red"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const dots = overlay.querySelectorAll(".hell-dot");

    const correctSequence = [
      "black",
      "gold",
      "red",
      "gold",
      "black"
    ];

    let currentSequence = [];

    dots.forEach(dot => {

      dot.addEventListener("click", () => {

        const color = dot.dataset.color;

        currentSequence.push(color);

        console.log(
          "HELL:",
          currentSequence.join(" → ")
        );

        // Špatně
        if (
          currentSequence[currentSequence.length - 1] !==
          correctSequence[currentSequence.length - 1]
        ) {

          console.log("HELL: ŠPATNĚ - RESET");

          currentSequence = [];
          return;
        }

        // Správně celé
        if (currentSequence.length === correctSequence.length) {

          console.log("HELL: SPRÁVNĚ");

          overlay.remove();

          showHellReturn();

        }

      });

    });

    function showHellReturn() {

      const returnScreen = document.createElement("div");
      returnScreen.className = "hell-return";

      const code =
        "AM-HELL-" +
        Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase();

      returnScreen.innerHTML = `
        <button class="hell-close">×</button>

        <div class="hell-return-title">
          VÍTEJ ZPĚT Z PEKLA
        </div>

        <div class="hell-code">
          ${code}
        </div>
      `;

      document.body.appendChild(returnScreen);

      returnScreen
        .querySelector(".hell-close")
        .addEventListener("click", () => {
          returnScreen.remove();
        });
    }

  };

})();
