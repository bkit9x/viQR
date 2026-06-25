const STORAGE_KEY = "viqr.items.v1";
const THEME_KEY = "viqr.theme.v2";
const EXPORT_VERSION = 1;
const THEMES = ["ocean", "light", "dark", "mint", "sunset", "rose", "forest", "graphite", "aurora", "coral", "steel", "lime"];
const CONTENT_TEMPLATES = {
  wifi: {
    title: "Wi-Fi",
    content: "WIFI:T:WPA;S:<SSID>;P:<PASSWORD>;;",
  },
  url: {
    title: "Website",
    content: "https://kha.is-a.dev/viQR",
  },
  phone: {
    title: "Phone",
    content: "tel:+84",
  },
  sms: {
    title: "SMS",
    content: "SMSTO:+84:MESSAGE",
  },
  email: {
    title: "Email",
    content: "mailto:hkhadev@gmail.com?subject=Subject&body=Message",
  },
  vcard: {
    title: "Contact",
    content: `BEGIN:VCARD
VERSION:3.0
N:Last;First;;;
FN:First Last
TEL:+84
EMAIL:hkhadev@gmail.com
END:VCARD`,
  },
};

const state = {
  items: [],
  current: 0,
  mode: "text",
  editingId: null,
  syncAction: "export",
  touchStartX: 0,
  touchStartY: 0,
  installPrompt: null,
};

const $ = (selector) => document.querySelector(selector);
const els = {
  themeColorMeta: $("#themeColorMeta"),
  menuBtn: $("#menuBtn"),
  menuDialog: $("#menuDialog"),
  closeMenuDialog: $("#closeMenuDialog"),
  appInstallBtn: $("#appInstallBtn"),
  menuImportBtn: $("#menuImportBtn"),
  menuExportBtn: $("#menuExportBtn"),
  newQrBtn: $("#newQrBtn"),
  emptyAddBtn: $("#emptyAddBtn"),
  prevBtn: $("#prevBtn"),
  nextBtn: $("#nextBtn"),
  qrIndex: $("#qrIndex"),
  qrTotal: $("#qrTotal"),
  qrStage: $("#qrStage"),
  emptyState: $("#emptyState"),
  qrCard: $("#qrCard"),
  qrFrame: $("#qrFrame"),
  qrTitle: $("#qrTitle"),
  quickActions: $("#quickActions"),
  rotateBtn: $("#rotateBtn"),
  copyBtn: $("#copyBtn"),
  downloadImageBtn: $("#downloadImageBtn"),
  editBtn: $("#editBtn"),
  deleteBtn: $("#deleteBtn"),
  qrDialog: $("#qrDialog"),
  qrForm: $("#qrForm"),
  dialogTitle: $("#dialogTitle"),
  closeQrDialog: $("#closeQrDialog"),
  cancelQrBtn: $("#cancelQrBtn"),
  titleInput: $("#titleInput"),
  contentInput: $("#contentInput"),
  fileInput: $("#fileInput"),
  syncDialog: $("#syncDialog"),
  syncForm: $("#syncForm"),
  syncTitle: $("#syncTitle"),
  syncHint: $("#syncHint"),
  passwordInput: $("#passwordInput"),
  importFileField: $("#importFileField"),
  importFileInput: $("#importFileInput"),
  closeSyncDialog: $("#closeSyncDialog"),
  cancelSyncBtn: $("#cancelSyncBtn"),
  toast: $("#toast"),
};

function boot() {
  applyTheme(loadTheme());
  loadItems();
  bindEvents();
  render();
  refreshIcons();
  registerServiceWorker();
}

function bindEvents() {
  els.menuBtn.addEventListener("click", () => els.menuDialog.showModal());
  els.closeMenuDialog.addEventListener("click", () => els.menuDialog.close());
  els.appInstallBtn.addEventListener("click", installApp);
  els.menuImportBtn.addEventListener("click", () => {
    els.menuDialog.close();
    openSyncDialog("import");
  });
  els.menuExportBtn.addEventListener("click", () => {
    els.menuDialog.close();
    openSyncDialog("export");
  });

  els.newQrBtn.addEventListener("click", () => openQrDialog());
  els.emptyAddBtn.addEventListener("click", () => openQrDialog());
  els.closeQrDialog.addEventListener("click", closeQrDialog);
  els.cancelQrBtn.addEventListener("click", closeQrDialog);
  els.qrForm.addEventListener("submit", saveQr);

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  document.querySelectorAll(".theme-choice").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });

  document.querySelectorAll(".template-chip").forEach((button) => {
    button.addEventListener("click", () => applyContentTemplate(button.dataset.template));
  });

  els.prevBtn.addEventListener("click", prevItem);
  els.nextBtn.addEventListener("click", nextItem);
  els.rotateBtn.addEventListener("click", rotateItem);
  els.copyBtn.addEventListener("click", copyCurrentContent);
  els.downloadImageBtn.addEventListener("click", downloadCurrentImage);
  els.editBtn.addEventListener("click", () => openQrDialog(currentItem()));
  els.deleteBtn.addEventListener("click", deleteCurrent);
  els.closeSyncDialog.addEventListener("click", closeSyncDialog);
  els.cancelSyncBtn.addEventListener("click", closeSyncDialog);
  els.syncForm.addEventListener("submit", handleSync);

  els.qrStage.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    state.touchStartX = touch.clientX;
    state.touchStartY = touch.clientY;
  }, { passive: true });

  els.qrStage.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - state.touchStartX;
    const dy = touch.clientY - state.touchStartY;
    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? nextItem() : prevItem();
    }
  }, { passive: true });

  els.qrStage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") prevItem();
    if (event.key === "ArrowRight") nextItem();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    updateInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    updateInstallButton();
    toast("Cài đặt app thành công!");
  });
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (THEMES.includes(saved)) return saved;
  return "ocean";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  if (els.themeColorMeta) {
    els.themeColorMeta.setAttribute("content", getThemeColor(theme));
  }
  document.querySelectorAll(".theme-choice").forEach((button) => {
    const active = button.dataset.themeChoice === theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  refreshIcons();
}

function getThemeColor(theme) {
  const colors = {
    light: "#f7f7f4",
    dark: "#101214",
    mint: "#f1fbf7",
    sunset: "#fff7ed",
    ocean: "#071923",
    rose: "#1d1118",
    forest: "#07140f",
    graphite: "#111315",
    aurora: "#0f1224",
    coral: "#fff5f2",
    steel: "#f4f7fb",
    lime: "#f7fee7",
  };
  return colors[theme] || colors.ocean;
}

function loadItems() {
  try {
    const rawItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    state.items = sortItemsByCreatedAt(rawItems.map((item) => {
      if (item.kind === "url") return { ...item, kind: "upload", image: item.image };
      return item;
    }));
  } catch {
    state.items = [];
  }
}

function sortItemsByCreatedAt(items) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftTime = Date.parse(left.item.createdAt || "");
      const rightTime = Date.parse(right.item.createdAt || "");
      if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return left.index - right.index;
      if (Number.isNaN(leftTime)) return 1;
      if (Number.isNaN(rightTime)) return -1;
      return leftTime - rightTime || left.index - right.index;
    })
    .map(({ item }) => item);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function currentItem() {
  return state.items[state.current] || null;
}

function render() {
  const total = state.items.length;
  if (state.current >= total) state.current = Math.max(0, total - 1);
  if (state.current < 0) state.current = 0;

  els.qrIndex.textContent = total ? String(state.current + 1) : "0";
  els.qrTotal.textContent = String(total);
  els.emptyState.classList.toggle("hidden", total > 0);
  els.qrCard.classList.toggle("hidden", total === 0);
  els.prevBtn.disabled = total < 2;
  els.nextBtn.disabled = total < 2;
  els.quickActions.classList.toggle("hidden", total === 0);
  renderCurrent();
  refreshIcons();
}

async function renderCurrent() {
  const item = currentItem();
  els.qrFrame.innerHTML = "";
  els.qrTitle.textContent = item?.title || "Mã QR";
  if (!item) return;

  els.qrFrame.style.setProperty("--angle", `${item.angle || 0}deg`);

  if (item.kind === "text") {
    const canvas = document.createElement("canvas");
    els.qrFrame.appendChild(canvas);

    if (!window.QRious) {
      canvas.remove();
      showQrError("Không tải được bộ tạo QR.");
      return;
    }

    try {
      new window.QRious({
        element: canvas,
        value: item.content,
        size: 900,
        level: "M",
        padding: 16,
        foreground: "#000000",
        background: "#ffffff",
      });
    } catch (error) {
      console.error(error);
      canvas.remove();
      showQrError("Không tạo được ảnh QR.");
    }
    return;
  }

  const image = document.createElement("img");
  image.alt = item.title;
  image.src = item.image;
  els.qrFrame.appendChild(image);
}

function showQrError(message) {
  const fallback = document.createElement("p");
  fallback.className = "hint";
  fallback.textContent = message;
  els.qrFrame.appendChild(fallback);
}

function openQrDialog(item = null) {
  if (!item && state.items.length === 0) state.mode = "text";
  state.editingId = item?.id || null;
  els.dialogTitle.textContent = item ? "Sửa QR" : "Thêm QR";
  els.titleInput.value = item?.title || "";
  els.contentInput.value = item?.kind === "text" ? item.content : "";
  els.fileInput.value = "";
  setMode(item?.kind === "upload" ? "upload" : "text");
  els.qrDialog.showModal();
  els.titleInput.focus();
}

function closeQrDialog() {
  els.qrDialog.close();
  els.qrForm.reset();
  state.editingId = null;
}

function setMode(mode) {
  state.mode = mode === "upload" ? "upload" : "text";
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  document.querySelectorAll(".mode-field").forEach((field) => {
    field.classList.toggle("hidden", field.dataset.field !== state.mode);
  });
  els.contentInput.required = state.mode === "text";
  els.fileInput.required = state.mode === "upload" && !state.editingId;
}

function applyContentTemplate(templateId) {
  const template = CONTENT_TEMPLATES[templateId];
  if (!template) return;
  els.contentInput.value = template.content;
  if (!els.titleInput.value.trim()) els.titleInput.value = template.title;
  els.contentInput.focus();
  els.contentInput.setSelectionRange(0, els.contentInput.value.length);
}

async function saveQr(event) {
  event.preventDefault();
  const title = els.titleInput.value.trim();
  if (!title) return toast("Cần nhập tiêu đề.", true);

  const oldItem = state.items.find((item) => item.id === state.editingId);
  const next = {
    id: oldItem?.id || crypto.randomUUID(),
    title,
    kind: state.mode,
    angle: oldItem?.angle || 0,
    createdAt: oldItem?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (state.mode === "text") {
    next.content = els.contentInput.value.trim();
    if (!next.content) return toast("Cần nhập nội dung QR.", true);
  }

  if (state.mode === "upload") {
    const file = els.fileInput.files[0];
    if (file) {
      next.image = await fileToDataUrl(file);
    } else if (oldItem?.image) {
      next.image = oldItem.image;
    } else {
      return toast("Cần chọn ảnh QR.", true);
    }
  }

  if (oldItem) {
    state.items = state.items.map((item) => item.id === oldItem.id ? next : item);
    state.current = state.items.findIndex((item) => item.id === next.id);
    closeQrDialog();
    persist();
    render();
    toast("Đã cập nhật QR.");
    return;
  }

  state.items.push(next);
  state.current = state.items.length - 1;
  closeQrDialog();
  persist();
  render();
  toast("Đã thêm QR.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function nextItem() {
  if (state.items.length < 2) return;
  state.current = (state.current + 1) % state.items.length;
  render();
}

function prevItem() {
  if (state.items.length < 2) return;
  state.current = (state.current - 1 + state.items.length) % state.items.length;
  render();
}

function rotateItem() {
  const item = currentItem();
  if (!item) return;
  item.angle = ((item.angle || 0) + 90) % 360;
  persist();
  render();
}

async function copyCurrentContent() {
  const item = currentItem();
  if (!item) return;
  const value = item.kind === "text" ? item.content : item.image;
  try {
    await navigator.clipboard.writeText(value);
    toast("Đã sao chép.");
  } catch {
    toast("Trình duyệt không cho sao chép.");
  }
}

function downloadCurrentImage() {
  const item = currentItem();
  if (!item) return;

  if (item.kind === "text") {
    const canvas = els.qrFrame.querySelector("canvas");
    if (!canvas) return toast("Chưa có ảnh QR để tải.");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${safeFilename(item.title)}.png`;
    link.click();
    toast("Đã tải ảnh QR.");
    return;
  }

  const link = document.createElement("a");
  link.href = item.image;
  link.download = `${safeFilename(item.title)}.png`;
  link.click();
  toast("Đã tải ảnh QR.");
}

function deleteCurrent() {
  const item = currentItem();
  if (!item) return;
  const ok = confirm(`Xóa QR "${item.title}"?`);
  if (!ok) return;
  state.items = state.items.filter((entry) => entry.id !== item.id);
  state.current = Math.min(state.current, state.items.length - 1);
  persist();
  render();
  toast("Đã xóa QR.");
}

function safeFilename(value) {
  return (value || "viqr")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "viqr";
}

function openSyncDialog(action) {
  state.syncAction = action;
  els.syncTitle.textContent = action === "export" ? "Xuất dữ liệu" : "Nhập dữ liệu";
  els.syncHint.textContent = action === "export"
    ? "File xuất sẽ được mã hóa bằng mật khẩu này."
    : "Chọn file đã xuất và nhập đúng mật khẩu để giải mã.";
  els.importFileField.classList.toggle("hidden", action !== "import");
  els.importFileInput.required = action === "import";
  els.passwordInput.value = "";
  els.importFileInput.value = "";
  els.syncDialog.showModal();
  els.passwordInput.focus();
}

function closeSyncDialog() {
  els.syncDialog.close();
  els.syncForm.reset();
}

async function handleSync(event) {
  event.preventDefault();
  const password = els.passwordInput.value;
  if (password.length < 6) return toast("Mật khẩu tối thiểu 6 ký tự.", true);

  try {
    if (state.syncAction === "export") {
      await exportData(password);
      closeSyncDialog();
      toast("Đã xuất dữ liệu.");
    } else {
      await importData(password);
      closeSyncDialog();
      toast("Đã nhập dữ liệu.");
    }
  } catch (error) {
    console.error(error);
    toast("Không xử lý được dữ liệu hoặc mật khẩu sai.", true);
  }
}

async function exportData(password) {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    items: state.items,
  };
  const encrypted = await encryptJson(payload, password);
  downloadJson(encrypted, `viqr-${new Date().toISOString().slice(0, 10)}.json`);
}

async function importData(password) {
  const file = els.importFileInput.files[0];
  if (!file) throw new Error("Missing import file");
  const encrypted = JSON.parse(await file.text());
  const payload = await decryptJson(encrypted, password);
  if (!Array.isArray(payload.items)) throw new Error("Invalid payload");
  state.items = sortItemsByCreatedAt(payload.items.map((item) => {
    if (item.kind === "url") return { ...item, kind: "upload", image: item.image };
    return item;
  }));
  state.current = 0;
  persist();
  render();
}

async function encryptJson(value, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    app: "viqr",
    version: EXPORT_VERSION,
    kdf: "PBKDF2-SHA256-250000",
    cipher: "AES-GCM",
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(cipher)),
  };
}

async function decryptJson(value, password) {
  const salt = fromBase64(value.salt);
  const iv = fromBase64(value.iv);
  const data = fromBase64(value.data);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function downloadJson(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(window.location.protocol)) return;
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Service worker registration failed", error);
  });
}

async function installApp() {
  if (!state.installPrompt) return;
  const promptEvent = state.installPrompt;
  state.installPrompt = null;
  updateInstallButton();
  els.menuDialog.close();
  promptEvent.prompt();
  await promptEvent.userChoice;
}

function updateInstallButton() {
  els.appInstallBtn.classList.toggle("hidden", !state.installPrompt);
}

function toast(message, inModal = false) {
  const openDialog = document.querySelector("dialog[open]");
  if (inModal && openDialog) {
    openDialog.appendChild(els.toast);
  } else if (els.toast.parentElement !== document.body) {
    document.body.appendChild(els.toast);
  }
  els.toast.textContent = message;
  els.toast.classList.toggle("in-modal", inModal);
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

boot();
