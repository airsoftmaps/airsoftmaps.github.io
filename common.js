/* ==========================================================================
   AIRSOFT MAPS — common.js
   Sdílené funkce: jazyk, dropdowny. Používá menu.html i stránky hřišť.
   ========================================================================== */

const AM = {};

AM.getLang = function () {
  return localStorage.getItem("am_lang") || "cs";
};

AM.setLang = function (lang) {
  localStorage.setItem("am_lang", lang);
};

/** Zapojí všechny .am-dd dropdowny na stránce (otevírání/zavírání). */
AM.wireDropdowns = function () {
  document.querySelectorAll(".am-dd > .am-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const dd = btn.closest(".am-dd");
      const wasOpen = dd.classList.contains("open");
      document.querySelectorAll(".am-dd.open").forEach(d => d.classList.remove("open"));
      if (!wasOpen) dd.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".am-dd.open").forEach(d => d.classList.remove("open"));
  });
};

/** Zapojí přepínač jazyka (tlačítka s [data-lang]) a zavolá callback při změně. */
AM.wireLangSwitch = function (onChange) {
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === AM.getLang());
    btn.addEventListener("click", () => {
      AM.setLang(btn.dataset.lang);
      document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("active", b.dataset.lang === btn.dataset.lang));
      const cur = document.getElementById("lang-current");
      if (cur) cur.textContent = btn.dataset.lang.toUpperCase();
      if (onChange) onChange(btn.dataset.lang);
    });
  });
  const cur = document.getElementById("lang-current");
  if (cur) cur.textContent = AM.getLang().toUpperCase();
};

/** Styl je zatím jen "dark" (funkční). Ostatní položky v menu jsou připravené na později. */
AM.wireStyleSwitch = function () {
  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-theme]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
};
