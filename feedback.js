/* ==========================================================================
   AIRSOFT MAPS — feedback.js
   Automaticky načítá aktivní hřiště z menu.html
   ========================================================================== */

async function loadFeedbackFields() {

  const select = document.getElementById("fb-field");

  if (!select) return;

  const lang = AM.getLang();

  try {

    /* Načteme menu.html */
    const response = await fetch("menu.html");

    if (!response.ok) {
      throw new Error("Nepodařilo se načíst menu.html");
    }

    const html = await response.text();


    /* Najdeme BATTLEFIELDS v menu.html */
    const match = html.match(
      /const\s+BATTLEFIELDS\s*=\s*(\[[\s\S]*?\]);/
    );

    if (!match) {
      throw new Error("BATTLEFIELDS nebyl v menu.html nalezen");
    }


    /* Převedeme seznam na JS objekt */
    const battlefields = Function(
      `"use strict"; return (${match[1]});`
    )();


    /* Vyčistíme dropdown */
    select.innerHTML = "";

    const empty = document.createElement("option");

    empty.value = "";

    empty.textContent =
      lang === "en"
        ? "— not selected —"
        : "— nevybráno —";

    select.appendChild(empty);


    /* Přidáme pouze AKTIVNÍ hřiště */
    battlefields
      .filter(field => field.status === "active")
      .forEach(field => {

        const option = document.createElement("option");

        option.value = field.id;

        option.textContent =
          lang === "en"
            ? field.nameEn
            : field.name;

        select.appendChild(option);

      });


    /* JINÉ */
    const other = document.createElement("option");

    other.value = "jine";

    other.textContent =
      lang === "en"
        ? "Other"
        : "Jiné";

    select.appendChild(other);


  } catch (error) {

    console.error(
      "AIRSOFT MAPS — feedback:",
      error
    );

  }
}
