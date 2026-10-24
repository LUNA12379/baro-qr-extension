import QRCode from "qrcode";
import { readWebsite } from "./url.js";
import { initializeScanner } from "./scanner.js";

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
  copyLabel.textContent = "주소 복사";
  clearTimeout(copyTimer);
  clearTimeout(imageCopyTimer);
  copyImageLabel.textContent = "이미지 복사";
}

function showEmpty(message, invalid = false) {
  invalidate();
  stage.setAttribute("aria-busy", "false");
  input.setAttribute("aria-invalid", String(invalid));
  emptyMessage.textContent = message;
  status.textContent = "주소 입력 대기";
  domain.textContent = "웹사이트를 연결하세요";
  title.textContent = "주소를 입력하면 QR코드가 나타나요.";
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
  emptyMessage.textContent = "QR코드를 만들고 있어요…";
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
    canvas.setAttribute("aria-label", `${website.hostname} 웹사이트 QR코드`);
    canvas.hidden = false;
    emptyState.hidden = true;
    stage.setAttribute("aria-busy", "false");
    generatedWebsite = website;
    domain.textContent = website.hostname;
    title.textContent = website.value === activeWebsite?.value && activeTitle ? activeTitle : "휴대폰 카메라로 스캔해 주세요.";
    status.textContent = "스캔 준비 완료";
    saveButton.disabled = false;
    copyButton.disabled = false;
    copyImageButton.disabled = false;
    setFeedback("주소를 바꾸면 QR코드도 바로 바뀌어요.");
  } catch {
    if (ticket !== generation) return;
    showEmpty("QR코드를 만들지 못했어요. 주소를 줄여서 다시 시도해 주세요.", true);
  }
}

input.addEventListener("input", () => {
  edited = true;
  clearTimeout(renderTimer);
  invalidate();
  stage.setAttribute("aria-busy", "true");
  input.setAttribute("aria-invalid", "false");
  emptyMessage.textContent = "QR코드를 업데이트하고 있어요…";
  domain.textContent = "주소 확인 중";
  title.textContent = "잠시만 기다려 주세요.";
  status.textContent = "업데이트 중";
  setFeedback("주소를 확인하고 있어요.");
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
    setFeedback("PNG 다운로드를 요청했어요. 다운로드 목록을 확인해 주세요.", "success");
  } catch {
    setFeedback("PNG를 저장하지 못했어요. 다시 시도해 주세요.", "error");
  }
});

copyButton.addEventListener("click", async () => {
  if (!generatedWebsite) return;
  const ticket = generation;
  const value = generatedWebsite.value;
  try {
    await navigator.clipboard.writeText(value);
    if (ticket !== generation) return;
    copyLabel.textContent = "복사 완료";
    setFeedback("주소를 클립보드에 복사했어요.", "success");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyLabel.textContent = "주소 복사"; }, 1800);
  } catch {
    if (ticket !== generation) return;
    input.focus();
    input.select();
    setFeedback("선택된 주소를 Ctrl+C 또는 ⌘C로 복사해 주세요.", "error");
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
    copyImageLabel.textContent = "복사 완료";
    setFeedback("QR 이미지를 복사했어요. 메신저나 문서에 붙여 넣으세요.", "success");
    clearTimeout(imageCopyTimer);
    imageCopyTimer = setTimeout(() => { copyImageLabel.textContent = "이미지 복사"; }, 1800);
  } catch {
    if (ticket !== generation) return;
    setFeedback("이미지 복사가 제한돼 있어요. PNG 저장을 이용해 주세요.", "error");
  }
});

async function initialize() {
  const parameters = new URLSearchParams(location.hash.slice(1));
  const linkedUrl = parameters.get("link");
  const sourceTab = parameters.get("sourceTab");
  if (linkedUrl !== null) {
    document.body.classList.add("standalone");
    history.replaceState(null, "", location.pathname);
    input.value = linkedUrl;
    await render();
  }
  if (!globalThis.chrome?.tabs?.query) {
    if (linkedUrl === null) showEmpty("웹사이트 주소를 붙여 넣어 QR코드를 만들어 보세요.");
    return;
  }

  try {
    const tab = linkedUrl !== null && /^\d+$/.test(sourceTab ?? "")
      ? await chrome.tabs.get(Number(sourceTab))
      : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const website = readWebsite(tab?.url ?? "");
    if (website.error) {
      if (!edited && linkedUrl === null) showEmpty("이 탭의 주소를 읽을 수 없어요. 웹사이트 주소를 직접 입력해 주세요.");
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
    if (!edited && linkedUrl === null) showEmpty("탭 주소를 불러오지 못했어요. 주소를 직접 입력해 주세요.");
  }
}

void initialize();
