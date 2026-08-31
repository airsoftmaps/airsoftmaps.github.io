/* ============================================================
   AIRSOFT MAPS — feedback.js
   Automaticky načte ACTIVE hřiště z menu.html
   ============================================================ */

async function loadFeedbackFields() {

  const select = document.getElementById("fb-field");

  if (!select) return;

  try {

    const response = await fetch("menu.html");

    if (!response.ok) {
      throw new Error("Nelze načíst menu.html");
    }

    const html = await response.text();

    /*
     * Najdeme BATTLEFIELDS přímo v menu.html
     */
    const match = html.match(
      /const\s+BATTLEFIELDS\s*=\s*(\[[\s\S]*?\]);/
    );

    if (!match) {
      throw new Error("BATTLEFIELDS nebylo nalezeno v menu.html");
    }

    /*
     * Převedeme pole z menu.html na skutečný JavaScript array
     */
    const battlefields = Function(
      `"use strict"; return (${match[1]});`
    )();

    const lang = AM.getLang();

    /*
     * Vyčistíme původní nabídku
     */
    select.innerHTML = "";

    /*
     * Výchozí možnost
     */
    const empty = document.createElement("option");

    empty.value = "";
    empty.textContent =
      lang === "en"
        ? "— not selected —"
        : "— nevybráno —";

    select.appendChild(empty);

    /*
     * POUZE AKTIVNÍ HŘIŠTĚ
     */
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

    /*
     * Jiné
     */
    const other = document.createElement("option");

    other.value = "jine";

    other.textContent =
      lang === "en"
        ? "Other"
        : "Jiné";

    select.appendChild(other);

    console.log(
      "✅ Feedback: načteno aktivních hřišť:",
      battlefields.filter(field => field.status === "active").length
    );

  } catch (error) {

    console.error(
      "❌ Feedback: nepodařilo se načíst hřiště:",
      error
    );

  }

}
