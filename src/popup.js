import QRCode from "qrcode";
import { readWebsite } from "./url.js";

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
let activeWebsite = null;
let activeTitle = "";
let generatedWebsite = null;
let generation = 0;
let renderTimer;
let copyTimer;
let edited = false;

function setFeedback(message, tone = "neutral") {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function invalidate() {
  generation += 1;
  generatedWebsite = null;
  saveButton.disabled = true;
  copyButton.disabled = true;
  canvas.hidden = true;
  emptyState.hidden = false;
  copyLabel.textContent = "주소 복사";
  clearTimeout(copyTimer);
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
    setFeedback("복사 권한이 없어요. 선택된 주소를 Ctrl+C로 복사해 주세요.", "error");
  }
});

async function initialize() {
  if (!globalThis.chrome?.tabs?.query) {
    showEmpty("웹사이트 주소를 붙여 넣어 QR코드를 만들어 보세요.");
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const website = readWebsite(tab?.url ?? "");
    if (website.error) {
      if (!edited) showEmpty("이 탭의 주소를 읽을 수 없어요. 웹사이트 주소를 직접 입력해 주세요.");
      return;
    }
    activeWebsite = website;
    activeTitle = tab.title ?? "";
    resetButton.disabled = false;
    if (!edited) {
      input.value = website.value;
      await render();
    }
  } catch {
    if (!edited) showEmpty("탭 주소를 불러오지 못했어요. 주소를 직접 입력해 주세요.");
  }
}

void initialize();
