async function loadFeedbackFields() {

  const select = document.getElementById("fb-field");

  if (!select) return;

  try {

    const response = await fetch("menu.html");

    if (!response.ok) {
      throw new Error("Nepodařilo se načíst menu.html");
    }

    const html = await response.text();

    const doc = new DOMParser()
      .parseFromString(html, "text/html");

    const scripts = doc.querySelectorAll("script");

    let battlefields = [];

    for (const script of scripts) {

      const text = script.textContent;

      if (!text.includes("BATTLEFIELDS")) {
        continue;
      }

      const match = text.match(
        /const\s+BATTLEFIELDS\s*=\s*(\[[\s\S]*?\]);/
      );

      if (!match) continue;

      battlefields = Function(
        `"use strict"; return ${match[1]};`
      )();

      break;
    }

    const lang =
      AM.getLang() === "en"
        ? "en"
        : "cs";

    battlefields
      .filter(field => field.status === "active")
      .forEach(field => {

        const option =
          document.createElement("option");

        option.value = field.id;

        option.textContent =
          lang === "en"
            ? field.nameEn
            : field.name;

        select.appendChild(option);

      });

    const otherOption =
      document.createElement("option");

    otherOption.value = "jine";

    otherOption.textContent =
      lang === "en"
        ? "Other"
        : "Jiné";

    select.appendChild(otherOption);

  } catch (error) {

    console.error(
      "Feedback: nepodařilo se načíst hřiště:",
      error
    );

  }

}
