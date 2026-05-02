const root = document.documentElement;
const toggleButton = document.getElementById("modeToggle");

function setMode(mode) {
  const isLight = mode === "light";
  root.classList.toggle("light", isLight);
  if (toggleButton) {
    toggleButton.textContent = isLight ? "dark mode" : "light mode";
  }
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", isLight ? "#f7f7f7" : "#050608");
  }
  window.localStorage.setItem("color-mode", mode);
}

const saved = window.localStorage.getItem("color-mode");
if (saved === "light" || saved === "dark") {
  setMode(saved);
} else {
  setMode("dark");
}

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const current = root.classList.contains("light") ? "light" : "dark";
    setMode(current === "dark" ? "light" : "dark");
  });
}

function normalizeTag(t) {
  return t.trim().toLowerCase().replace(/\s+/g, "-");
}

function initPostIndex(rootEl) {
  const list = rootEl.querySelector("[data-post-items]");
  const sortSelect = rootEl.querySelector("[data-post-sort]");
  const tagBar = rootEl.querySelector("[data-tag-bar]");
  if (!list || !sortSelect || !tagBar) return;

  let items = Array.from(list.querySelectorAll("li[data-sort-date]"));
  const tagSet = new Set();
  items.forEach((li) => {
    const raw = li.getAttribute("data-tags") || "";
    raw.split(",").forEach((t) => {
      const n = normalizeTag(t);
      if (n) tagSet.add(n);
    });
  });
  const tags = Array.from(tagSet).sort();

  const params = new URLSearchParams(window.location.search);
  const fromUrl = normalizeTag(params.get("tag") || "");
  let activeTag = fromUrl && tagSet.has(fromUrl) ? fromUrl : null;

  function syncUrl() {
    const url = new URL(window.location.href);
    if (activeTag) {
      url.searchParams.set("tag", activeTag);
    } else {
      url.searchParams.delete("tag");
    }
    history.replaceState(null, "", url.pathname + url.search);
  }

  function applyFilter() {
    items.forEach((li) => {
      const raw = li.getAttribute("data-tags") || "";
      const liTags = raw.split(",").map(normalizeTag).filter(Boolean);
      const show = activeTag === null || liTags.includes(activeTag);
      if (show) {
        li.removeAttribute("data-hidden");
      } else {
        li.setAttribute("data-hidden", "");
      }
    });
    tagBar.querySelectorAll(".tag-filter").forEach((btn) => {
      const val = btn.getAttribute("data-tag-value");
      const isAll = val === "";
      const active = isAll ? activeTag === null : activeTag === val;
      btn.classList.toggle("is-active", active);
    });
  }

  function sortItems() {
    const mode = sortSelect.value;
    const fragment = document.createDocumentFragment();
    const sorted = [...items];
    sorted.sort((a, b) => {
      if (mode === "date-desc" || mode === "date-asc") {
        const da = a.getAttribute("data-sort-date") || "";
        const db = b.getAttribute("data-sort-date") || "";
        const cmp = da.localeCompare(db);
        return mode === "date-desc" ? -cmp : cmp;
      }
      if (mode === "title-asc") {
        return (a.getAttribute("data-title") || "").localeCompare(
          b.getAttribute("data-title") || ""
        );
      }
      if (mode === "author-asc") {
        return (a.getAttribute("data-author") || "").localeCompare(
          b.getAttribute("data-author") || ""
        );
      }
      return 0;
    });
    sorted.forEach((li) => fragment.appendChild(li));
    list.appendChild(fragment);
    items = Array.from(list.querySelectorAll("li[data-sort-date]"));
  }

  function setActiveTag(next) {
    activeTag = next;
    syncUrl();
    applyFilter();
  }

  function buildTagBar() {
    tagBar.innerHTML = "";
    const label = document.createElement("span");
    label.className = "tag-bar-label";
    label.textContent = "Tags:";
    tagBar.appendChild(label);

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "tag-filter";
    allBtn.setAttribute("data-tag-value", "");
    allBtn.textContent = "All";
    allBtn.addEventListener("click", () => setActiveTag(null));
    tagBar.appendChild(allBtn);

    tags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-filter";
      btn.setAttribute("data-tag-value", tag);
      btn.textContent = tag;
      btn.addEventListener("click", () => setActiveTag(tag));
      tagBar.appendChild(btn);
    });
  }

  buildTagBar();
  applyFilter();
  sortItems();

  sortSelect.addEventListener("change", () => {
    sortItems();
    applyFilter();
  });

  window.addEventListener("popstate", () => {
    const p = new URLSearchParams(window.location.search);
    const t = normalizeTag(p.get("tag") || "");
    activeTag = t && tagSet.has(t) ? t : null;
    applyFilter();
  });
}

document.querySelectorAll("[data-post-index]").forEach(initPostIndex);
