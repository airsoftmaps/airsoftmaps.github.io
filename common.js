/* ==========================================================================
   AIRSOFT MAPS — common.js
   Sdílené funkce: jazyk, dropdowny, témata
   ========================================================================== */

const AM = {};
AM.applyLogo = function () {
  const theme = AM.getTheme();

  const lightThemes = [
    "light",
    "fortnite"
  ];

  const logo = lightThemes.includes(theme)
    ? "loga/bilekulate.png"
    : "loga/tmavekulate.png";

  document.querySelectorAll(".am-brand-logo").forEach(img => {
    img.src = logo;
  });
};
AM.getLang = function () {
  return localStorage.getItem("am_lang") || "cs";
};

AM.setLang = function (lang) {
  localStorage.setItem("am_lang", lang);
};

AM.getTheme = function () {
  return localStorage.getItem("am_theme") || "dark";
};

AM.setTheme = function (theme) {
  localStorage.setItem("am_theme", theme);
  AM.applyTheme(theme);
};

AM.applyTheme = function (theme) {
  const validThemes = [
    "dark",
    "light",
    "resident-evil",
    "pubg",
    "fortnite"
  ];

  if (!validThemes.includes(theme)) {
    theme = "dark";
  }

  document.documentElement.dataset.theme = theme;

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
   AM.applyLogo();
};

AM.wireDropdowns = function () {
  document.querySelectorAll(".am-dd > .am-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();

      const dd = btn.closest(".am-dd");
      const wasOpen = dd.classList.contains("open");

      document
        .querySelectorAll(".am-dd.open")
        .forEach(d => d.classList.remove("open"));

      if (!wasOpen) {
        dd.classList.add("open");
      }
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".am-dd.open")
      .forEach(d => d.classList.remove("open"));
  });
};

AM.wireLangSwitch = function (onChange) {
  const currentLang = AM.getLang();

  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.lang === currentLang
    );

    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;

      AM.setLang(lang);

      document.querySelectorAll("[data-lang]").forEach(b => {
        b.classList.toggle(
          "active",
          b.dataset.lang === lang
        );
      });

      const current = document.getElementById("lang-current");

      if (current) {
        current.textContent = lang.toUpperCase();
      }

      if (typeof onChange === "function") {
        onChange(lang);
      }
    });
  });

  const current = document.getElementById("lang-current");

  if (current) {
    current.textContent = currentLang.toUpperCase();
  }
};

AM.wireStyleSwitch = function () {
  AM.applyTheme(AM.getTheme());

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();

      const theme = btn.dataset.theme;

      AM.setTheme(theme);

      const dd = btn.closest(".am-dd");

      if (dd) {
        dd.classList.remove("open");
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  AM.applyTheme(AM.getTheme());
});
