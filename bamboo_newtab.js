document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const engineSelector = document.getElementById("engineSelector");
  const engineDropdown = document.getElementById("engineDropdown");
  const currentEngineIcon = document.getElementById("currentEngineIcon");
  const engineOptions = document.querySelectorAll(".engine-option");

  // Configuration for engines
  const engines = {
    google: {
      name: "Google",
      url: "https://www.google.com/search?q=",
      icon: "https://www.google.com/favicon.ico",
    },
    bing: {
      name: "Bing",
      url: "https://www.bing.com/search?q=",
      icon: "https://www.bing.com/favicon.ico",
    },
    duckduckgo: {
      name: "DuckDuckGo",
      url: "https://duckduckgo.com/?q=",
      icon: "https://duckduckgo.com/favicon.ico",
    },
  };

  // State: Default to Google or load from localStorage
  let currentEngine = localStorage.getItem("defaultEngine") || "google";

  // Initialize UI
  function updateEngineUI(engineKey) {
    const engine = engines[engineKey];
    if (engine) {
      currentEngineIcon.src = engine.icon;
      searchInput.placeholder = `Search ${engine.name} or type a URL`;
    }
  }

  // Set initial state
  updateEngineUI(currentEngine);

  // Toggle Dropdown
  engineSelector.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent closing immediately
    engineDropdown.classList.toggle("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (!engineDropdown.classList.contains("hidden")) {
      engineDropdown.classList.add("hidden");
    }
  });

  // Handle Engine Selection
  engineOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selected = option.getAttribute("data-engine");
      if (engines[selected]) {
        currentEngine = selected;
        localStorage.setItem("defaultEngine", currentEngine);
        updateEngineUI(currentEngine);
      }
    });
  });

  // Handle Search
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (!query) return;

      const engine = engines[currentEngine];

      // Basic URL detection (very simple)
      if (query.match(/^https?:\/\//) || query.match(/\.(com|net|org|io|me)/)) {
        let url = query;
        if (!url.startsWith("http")) {
          url = "https://" + url;
        }
        window.location.href = url;
      } else {
        window.location.href = engine.url + encodeURIComponent(query);
      }
    }
  });

  // --- Shortcuts Logic ---
  const appGrid = document.getElementById("appGrid");

  // Initial shortcuts data
  const defaultShortcuts = [
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Bilibili", url: "https://www.bilibili.com" },
    { name: "GitHub", url: "https://github.com" },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      manualIcon:
        "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "Reddit", url: "https://www.reddit.com" },
    // Example of manual icon usage:
    // { name: "My Site", url: "...", manualIcon: "https://example.com/icon.png" }
  ];

  // Render Shortcuts
  function renderShortcuts() {
    appGrid.innerHTML = "";
    defaultShortcuts.forEach((app) => {
      const a = document.createElement("a");
      a.className = "app-item";
      a.href = app.url;

      // Icon Container
      const iconDiv = document.createElement("div");
      iconDiv.className = "app-icon";

      // Determine Icon Source
      // Priority: Manual Icon -> Google Favicon Service
      let iconSrc = "";
      if (app.manualIcon) {
        iconSrc = app.manualIcon;
      } else {
        // Parse domain for the favicon service
        try {
          const domain = new URL(app.url).hostname;
          iconSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
        } catch (e) {
          console.error("Invalid URL:", app.url);
        }
      }

      // Create Image Element
      if (iconSrc) {
        const img = document.createElement("img");
        img.src = iconSrc;
        img.alt = app.name;
        // Basic error handling: fallback if needed (optional)
        img.onerror = () => {
          img.style.display = "none";
          iconDiv.innerText = app.name[0];
        };
        iconDiv.appendChild(img);
      } else {
        iconDiv.innerText = app.name[0];
      }

      // Label
      const span = document.createElement("span");
      span.className = "app-name";
      span.textContent = app.name;

      a.appendChild(iconDiv);
      a.appendChild(span);
      appGrid.appendChild(a);
    });
  }

  renderShortcuts();
});
