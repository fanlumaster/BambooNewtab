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
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const shortcutNameInput = document.getElementById("shortcutName");
  const shortcutUrlInput = document.getElementById("shortcutUrl");
  const shortcutIconInput = document.getElementById("shortcutIcon");
  const modalSaveBtn = document.getElementById("modalSaveBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalRemoveBtn = document.getElementById("modalRemoveBtn");

  // Initial Data (only if nothing in localStorage)
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
    {
      name: "Luflyan",
      url: "https://fanlumaster.github.io",
      manualIcon: "https://i.postimg.cc/qRbZZbp7/myfavicon.png",
    },
    { name: "V2EX", url: "https://www.v2ex.com/?tab=all" },
    { name: "Notion", url: "https://www.notion.so/" },
  ];

  // Load from Storage or Use Defaults
  let shortcuts =
    JSON.parse(localStorage.getItem("shortcuts")) || defaultShortcuts;
  let editingIndex = -1; // -1 means adding new

  function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
  }

  function renderShortcuts() {
    appGrid.innerHTML = "";

    // Render existing shortcuts
    shortcuts.forEach((app, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "app-item";

      // Navigate on click (but prevent if clicking edit)
      wrapper.addEventListener("click", (e) => {
        if (!e.target.closest(".edit-btn")) {
          window.location.href = app.url;
        }
      });

      // Edit Button
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';
      editBtn.title = "Edit shortcut";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(index);
      });

      // Icon
      const iconDiv = document.createElement("div");
      iconDiv.className = "app-icon";

      let iconSrc = "";
      if (app.manualIcon) {
        iconSrc = app.manualIcon;
      } else {
        try {
          const domain = new URL(app.url).hostname;
          iconSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
        } catch (e) {}
      }

      if (iconSrc) {
        const img = document.createElement("img");
        img.src = iconSrc;
        img.alt = app.name;
        img.onerror = () => {
          img.style.display = "none";
          iconDiv.innerText = app.name[0];
        };
        iconDiv.appendChild(img);
      } else {
        iconDiv.innerText = app.name[0];
      }

      // Name
      const span = document.createElement("span");
      span.className = "app-name";
      span.textContent = app.name;

      wrapper.appendChild(editBtn);
      wrapper.appendChild(iconDiv);
      wrapper.appendChild(span);
      appGrid.appendChild(wrapper);
    });

    // Render "Add Shortcut" Tile
    const addBtn = document.createElement("div");
    addBtn.className = "app-item add-tile";
    addBtn.addEventListener("click", () => openEditModal(-1));

    const addIcon = document.createElement("div");
    addIcon.className = "app-icon";
    addIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';

    const addText = document.createElement("span");
    addText.className = "app-name";
    addText.textContent = "Add Shortcut";

    addBtn.appendChild(addIcon);
    addBtn.appendChild(addText);
    appGrid.appendChild(addBtn);
  }

  // --- Modal Logic ---

  function openEditModal(index) {
    editingIndex = index;
    modalOverlay.classList.remove("hidden");

    if (index === -1) {
      modalTitle.textContent = "Add Shortcut";
      shortcutNameInput.value = "";
      shortcutNameInput.value = "";
      shortcutUrlInput.value = "";
      shortcutIconInput.value = "";
      modalRemoveBtn.classList.add("hidden");
    } else {
      modalTitle.textContent = "Edit Shortcut";
      const app = shortcuts[index];
      shortcutNameInput.value = app.name;
      shortcutUrlInput.value = app.url;
      shortcutIconInput.value = app.manualIcon || "";
      modalRemoveBtn.classList.remove("hidden");
    }

    // Auto focus name
    setTimeout(() => shortcutNameInput.focus(), 100);
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  modalCancelBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalSaveBtn.addEventListener("click", () => {
    const name = shortcutNameInput.value.trim();
    let url = shortcutUrlInput.value.trim();

    if (!name || !url) return;

    // Simple URL fix logic
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const manualIcon = shortcutIconInput.value.trim();

    if (editingIndex === -1) {
      // Add new
      const newApp = { name, url };
      if (manualIcon) newApp.manualIcon = manualIcon;
      shortcuts.push(newApp);
    } else {
      // Edit existing
      shortcuts[editingIndex].name = name;
      shortcuts[editingIndex].url = url;
      if (manualIcon) {
        shortcuts[editingIndex].manualIcon = manualIcon;
      } else {
        delete shortcuts[editingIndex].manualIcon;
      }
    }

    saveShortcuts();
    closeModal();
  });

  modalRemoveBtn.addEventListener("click", () => {
    if (editingIndex !== -1) {
      shortcuts.splice(editingIndex, 1);
      saveShortcuts();
      closeModal();
    }
  });

  renderShortcuts();
});
