import { open, save, message } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
// import { Window } from "@tauri-apps/plugin-window";
import { createIcons, File, FolderOpen, Save, Moon, Sun } from "lucide";

createIcons({
  icons: {
    File,
    FolderOpen,
    Save,
    Sun,
    Moon,
  },
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sun").classList.add("hidden");
  document.getElementById("moon").classList.remove("hidden");

  // DOM Elements
  const editor = document.getElementById("editor");
  const wordCountEl = document.getElementById("word-count");
  const charCountEl = document.getElementById("char-count");
  const saveStatusEl = document.getElementById("save-status");
  const fontFamilySelect = document.getElementById("font-family");
  const fontSizeSelect = document.getElementById("font-size");
  const themeToggle = document.getElementById("theme-toggle");
  const newDocButton = document.getElementById("new-doc");
  const openDocButton = document.getElementById("open-doc");
  const saveDocButton = document.getElementById("save-doc");
  // const minButton = document.getElementById("min-button");
  // const maxButton = document.getElementById("max-button");
  // const closeButton = document.getElementById("close-button");

  // State
  let currentFilePath = null;
  let hasUnsavedChanges = false;
  let selectedFontFamily = "default";
  let selectedFontSize = "18";

  // Restore content (crash/quit recovery)
  const savedContent = localStorage.getItem("unsavedContent");
  if (savedContent) {
    editor.value = savedContent;
    updateCounts();
  }

  loadPreferences();
  updateCounts();
  editor.focus();

  // Counts
  function updateCounts() {
    const text = editor.value;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    wordCountEl.textContent = `Words: ${wordCount}`;
    charCountEl.textContent = `Characters: ${charCount}`;
  }

  function markAsUnsaved() {
    if (!hasUnsavedChanges) {
      hasUnsavedChanges = true;
      saveStatusEl.textContent = "Unsaved";
      saveStatusEl.classList.add("unsaved");
    }
    localStorage.setItem("unsavedContent", editor.value);
  }

  function markAsSaved() {
    hasUnsavedChanges = false;
    saveStatusEl.textContent = "Saved";
    saveStatusEl.classList.remove("unsaved");
  }

  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains("dark-theme");
    if (isDark) {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      document.getElementById("sun").classList.remove("hidden");
      document.getElementById("moon").classList.add("hidden");
      localStorage.setItem("theme", "light");
    } else {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      document.getElementById("sun").classList.add("hidden");
      document.getElementById("moon").classList.remove("hidden");
      localStorage.setItem("theme", "dark");
    }
  }

  function applyFontFamily(fontFamily) {
    selectedFontFamily = fontFamily;
    if (fontFamily === "default") {
      editor.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
    } else {
      editor.style.fontFamily = fontFamily;
    }
    localStorage.setItem("fontFamily", fontFamily);
  }

  function applyFontSize(fontSize) {
    selectedFontSize = fontSize;
    editor.style.fontSize = `${fontSize}px`;
    localStorage.setItem("fontSize", fontSize);
  }

  function loadPreferences() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      document.getElementById("sun").classList.remove("hidden");
      document.getElementById("moon").classList.add("hidden");
    }
    const savedFontFamily = localStorage.getItem("fontFamily");
    if (savedFontFamily) {
      fontFamilySelect.value = savedFontFamily;
      applyFontFamily(savedFontFamily);
    }
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      fontSizeSelect.value = savedFontSize;
      applyFontSize(savedFontSize);
    }
  }

  function newDocument() {
    if (hasUnsavedChanges) {
      const confirmNew = confirm(
        "You have unsaved changes. Create new document anyway?"
      );
      if (!confirmNew) return;
    }
    editor.value = "";
    currentFilePath = null;
    updateCounts();
    markAsSaved();
    editor.focus();
  }

  async function saveDocument() {
    if (!editor.value.trim() && !currentFilePath) {
      alert("Cannot save an empty document.");
      return;
    }

    const content = editor.value;

    try {
      let filePath = currentFilePath;
      if (!filePath) {
        filePath = await save({
          title: "Save Document",
          filters: [
            { name: "Text Files", extensions: ["txt"] },
            { name: "Markdown", extensions: ["md"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });
        if (!filePath) return;
      }
      await writeTextFile(filePath, content, { path: filePath });
      currentFilePath = filePath;
      markAsSaved();
    } catch (err) {
      console.error(err);
      alert(`Failed to save file: ${err.message || err}`);
    }
  }

  async function openDocument() {
    try {
      const filePath = await open({
        title: "Open Document",
        multiple: false,
        filters: [
          { name: "Text Files", extensions: ["txt", "md"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });
      if (!filePath) return;

      const content = await readTextFile(filePath, { path: filePath });
      editor.value = content;
      currentFilePath = filePath;
      updateCounts();
      markAsSaved();
      editor.focus();
    } catch (err) {
      console.error(err);
      alert(`Failed to open file: ${err.message || err}`);
    }
  }

  function handleZoom(event) {
    if (event.ctrlKey) {
      if (event.key === "=" || event.key === "+") {
        const currentSize = parseInt(selectedFontSize, 10);
        const newSize = Math.min(currentSize + 2, 48);
        fontSizeSelect.value = newSize;
        applyFontSize(newSize);
        event.preventDefault();
      } else if (event.key === "-") {
        const currentSize = parseInt(selectedFontSize, 10);
        const newSize = Math.max(currentSize - 2, 12);
        fontSizeSelect.value = newSize;
        applyFontSize(newSize);
        event.preventDefault();
      }
    }
  }

  // Auto-save every minute to the current file
  setInterval(() => {
    if (hasUnsavedChanges && currentFilePath) {
      saveDocument();
    }
  }, 60000);

  // Events
  editor.addEventListener("input", () => {
    updateCounts();
    markAsUnsaved();
  });

  editor.addEventListener("keydown", (e) => {
    handleZoom(e);
  });

  // Window controls
  // minButton.addEventListener("click", () => Window.minimize());
  // maxButton.addEventListener("click", async () => {
  //   const maximized = await Window.isMaximized();
  //   if (maximized) {
  //     Window.unmaximize();
  //   } else {
  //     Window.maximize();
  //   }
  // });
  // closeButton.addEventListener("click", async () => {
  //   if (hasUnsavedChanges) {
  //     const proceed = confirm("You have unsaved changes. Exit anyway?");
  //     if (!proceed) return;
  //   }
  //   Window.close();
  // });

  // Toolbar actions
  newDocButton.addEventListener("click", newDocument);
  openDocButton.addEventListener("click", openDocument);
  saveDocButton.addEventListener("click", saveDocument);
  themeToggle.addEventListener("click", toggleTheme);
  fontFamilySelect.addEventListener("change", () => {
    applyFontFamily(fontFamilySelect.value);
    editor.focus();
  });
  fontSizeSelect.addEventListener("change", () => {
    applyFontSize(fontSizeSelect.value);
    editor.focus();
  });

  async function pickFile() {
    const file = await open();
    console.log(file);
  }

  // Warn on app close via system controls
  // window.addEventListener("beforeunload", (e) => {
  //   if (hasUnsavedChanges) {
  //     e.preventDefault();
  //     e.returnValue =
  //       "You have unsaved changes. Are you sure you want to exit?";
  //   }
  // });
});
