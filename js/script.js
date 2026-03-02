const root = document.documentElement;
const toggleButton = document.getElementById("modeToggle");

function setMode(mode) {
  const isLight = mode === "light";
  root.classList.toggle("light", isLight);
  toggleButton.textContent = isLight ? "dark mode" : "light mode";
  window.localStorage.setItem("color-mode", mode);
}

const saved = window.localStorage.getItem("color-mode");
if (saved === "light" || saved === "dark") {
  setMode(saved);
} else {
  setMode("dark");
}

toggleButton.addEventListener("click", () => {
  const current = root.classList.contains("light") ? "light" : "dark";
  setMode(current === "dark" ? "light" : "dark");
});

