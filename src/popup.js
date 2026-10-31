import { localizeDocument, translate } from "./i18n.js";
import QRCode from "qrcode";
import { readWebsite } from "./url.js";
import { initializeScanner } from "./scanner.js";

localizeDocument();

const input = document.querySelector("#url-input");
const canvas = document.querySelector("#qr-canvas");
const stage = document.querySelector(".qr-stage");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const domain = document.querySelector("#site-domain");
const title = document.querySelector("#site-title");
const status = document.querySelector("#qr-status");
const feedback = document.querySelector("#feedback");
const saveButton = document.querySelector("#save-button");
const copyButton = document.querySelector("#copy-button");
const copyLabel = document.querySelector("#copy-label");
const resetButton = document.querySelector("#reset-button");
const copyImageButton = document.querySelector("#copy-image-button");
const copyImageLabel = document.querySelector("#copy-image-label");
const createTab = document.querySelector("#create-tab");
const scanTab = document.querySelector("#scan-tab");
let activeWebsite = null;
let activeTitle = "";
let generatedWebsite = null;
let generation = 0;
let renderTimer;
let copyTimer;
let imageCopyTimer;
let edited = false;

function setMode(mode) {
  for (const [button, name] of [[createTab, "create"], [scanTab, "scan"]]) {
    const selected = name === mode;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.querySelector(`#${name}-panel`).hidden = !selected;
  }
}

for (const [button, mode] of [[createTab, "create"], [scanTab, "scan"]]) {
  button.addEventListener("click", () => { setMode(mode); });
  button.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? createTab : event.key === "End" ? scanTab : button === createTab ? scanTab : createTab;
    setMode(next === createTab ? "create" : "scan");
    next.focus();
  });
}

initializeScanner(() => { setMode("scan"); });

function setFeedback(message, tone = "neutral") {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function invalidate() {
  generation += 1;
  generatedWebsite = null;
  saveButton.disabled = true;
  copyButton.disabled = true;
  copyImageButton.disabled = true;
  canvas.hidden = true;
  emptyState.hidden = false;
  copyLabel.textContent = translate("copyUrl");
  clearTimeout(copyTimer);
  clearTimeout(imageCopyTimer);
  copyImageLabel.textContent = translate("copyImage");
}

function showEmpty(message, invalid = false) {
  invalidate();
  stage.setAttribute("aria-busy", "false");
  input.setAttribute("aria-invalid", String(invalid));
  emptyMessage.textContent = message;
  status.textContent = translate("waitingUrl");
  domain.textContent = translate("connectWebsite");
  title.textContent = translate("enterForQr");
  setFeedback(message, invalid ? "error" : "neutral");
}

async function render() {
  clearTimeout(renderTimer);
  const website = readWebsite(input.value);
  if (website.error) {
    showEmpty(website.error, !website.empty);
    return;
  }

  invalidate();
  const ticket = generation;
  stage.setAttribute("aria-busy", "true");
  input.setAttribute("aria-invalid", "false");
  emptyMessage.textContent = translate("generating");
  try {
    const nextCanvas = document.createElement("canvas");
    await QRCode.toCanvas(nextCanvas, website.value, {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 1024,
      color: { dark: "#172311", light: "#ffffff" }
    });
    if (ticket !== generation) return;

    canvas.width = nextCanvas.width;
    canvas.height = nextCanvas.height;
    canvas.getContext("2d").drawImage(nextCanvas, 0, 0);
    canvas.setAttribute("aria-label", translate("qrForWebsite", website.hostname));
    canvas.hidden = false;
    emptyState.hidden = true;
    stage.setAttribute("aria-busy", "false");
    generatedWebsite = website;
    domain.textContent = website.hostname;
    title.textContent = website.value === activeWebsite?.value && activeTitle ? activeTitle : translate("scanWithPhone");
    status.textContent = translate("readyToScan");
    saveButton.disabled = false;
    copyButton.disabled = false;
    copyImageButton.disabled = false;
    setFeedback(translate("editUrlHint"));
  } catch {
    if (ticket !== generation) return;
    showEmpty(translate("generateFailed"), true);
  }
}

input.addEventListener("input", () => {
  edited = true;
  clearTimeout(renderTimer);
  invalidate();
  stage.setAttribute("aria-busy", "true");
  input.setAttribute("aria-invalid", "false");
  emptyMessage.textContent = translate("updatingQr");
  domain.textContent = translate("checkingUrl");
  title.textContent = translate("pleaseWait");
  status.textContent = translate("updating");
  setFeedback(translate("checkingUrlFeedback"));
  renderTimer = setTimeout(render, 160);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    void render();
  }
});

resetButton.addEventListener("click", () => {
  if (!activeWebsite) return;
  edited = true;
  input.value = activeWebsite.value;
  void render();
});

saveButton.addEventListener("click", () => {
  if (!generatedWebsite) return;
  try {
    const link = document.createElement("a");
    link.download = `baro-qr-${generatedWebsite.filename}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.append(link);
    link.click();
    link.remove();
    setFeedback(translate("pngRequested"), "success");
  } catch {
    setFeedback(translate("pngFailed"), "error");
  }
});

copyButton.addEventListener("click", async () => {
  if (!generatedWebsite) return;
  const ticket = generation;
  const value = generatedWebsite.value;
  try {
    await navigator.clipboard.writeText(value);
    if (ticket !== generation) return;
    copyLabel.textContent = translate("copied");
    setFeedback(translate("urlCopied"), "success");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyLabel.textContent = translate("copyUrl"); }, 1800);
  } catch {
    if (ticket !== generation) return;
    input.focus();
    input.select();
    setFeedback(translate("copyUrlManually"), "error");
  }
});

copyImageButton.addEventListener("click", async () => {
  if (!generatedWebsite || copyImageButton.disabled) return;
  const ticket = generation;
  try {
    if (!navigator.clipboard?.write || !globalThis.ClipboardItem) throw new Error("Clipboard images are unavailable");
    const png = new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("PNG conversion failed"));
      }, "image/png");
    });
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    if (ticket !== generation) return;
    copyImageLabel.textContent = translate("copied");
    setFeedback(translate("imageCopied"), "success");
    clearTimeout(imageCopyTimer);
    imageCopyTimer = setTimeout(() => { copyImageLabel.textContent = translate("copyImage"); }, 1800);
  } catch {
    if (ticket !== generation) return;
    setFeedback(translate("copyImageFailed"), "error");
  }
});

async function initialize() {
  const parameters = new URLSearchParams(location.hash.slice(1));
  const linkedUrl = parameters.get("link");
  const sourceTab = parameters.get("sourceTab");
  if (linkedUrl !== null) {
    document.body.classList.add("standalone");
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    input.value = linkedUrl;
    await render();
  }
  if (!globalThis.chrome?.tabs?.query) {
    if (linkedUrl === null) showEmpty(translate("pasteWebsite"));
    return;
  }

  try {
    const tab = linkedUrl !== null && /^\d+$/.test(sourceTab ?? "")
      ? await chrome.tabs.get(Number(sourceTab))
      : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const website = readWebsite(tab?.url ?? "");
    if (website.error) {
      if (!edited && linkedUrl === null) showEmpty(translate("unavailableTab"));
      return;
    }
    activeWebsite = website;
    activeTitle = tab.title ?? "";
    resetButton.disabled = false;
    if (!edited && linkedUrl === null) {
      input.value = website.value;
      await render();
    }
  } catch {
    if (!edited && linkedUrl === null) showEmpty(translate("tabFailed"));
  }
}

void initialize();
