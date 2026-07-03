function applyStoredTheme() {
  const stored = localStorage.getItem("ps_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = stored ? stored === "dark" : prefersDark;

  if (shouldBeDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  return shouldBeDark;
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("ps_theme", isDark ? "dark" : "light");
  syncThemeToggleUI(isDark);
  return isDark;
}

function syncThemeToggleUI(isDark) {
  const track = document.getElementById("themeToggleTrack");
  if (track) {
    if (isDark) {
      track.classList.add("on");
    } else {
      track.classList.remove("on");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = applyStoredTheme();
  syncThemeToggleUI(isDark);

  const toggle = document.getElementById("themeToggleTrack");
  if (toggle) {
    toggle.addEventListener("click", toggleTheme);
  }
});
