import { readQrImage } from "./read-image.js";
import { readWebsite } from "./url.js";

export function initializeScanner(activate) {
  const picker = document.querySelector("#image-picker");
  const fileInput = document.querySelector("#image-input");
  const preview = document.querySelector("#image-preview");
  const placeholder = document.querySelector("#scan-placeholder");
  const filename = document.querySelector("#scan-filename");
  const feedback = document.querySelector("#scan-feedback");
  const resultPanel = document.querySelector("#scan-result");
  const resultText = document.querySelector("#scan-text");
  const resultType = document.querySelector("#scan-type");
  const copyButton = document.querySelector("#copy-result");
  const openLink = document.querySelector("#open-result");
  let scanController;
  let previewUrl;
  let revision = 0;

  function setFeedback(message, tone = "neutral") {
    feedback.textContent = message;
    feedback.dataset.tone = tone;
  }

  async function loadImage(file) {
    activate();
    scanController?.abort();
    scanController = new AbortController();
    const ticket = ++revision;
    resultPanel.hidden = true;
    resultText.value = "";
    copyButton.disabled = true;
    openLink.hidden = true;
    openLink.removeAttribute("href");
    picker.setAttribute("aria-busy", "true");
    preview.hidden = true;
    preview.removeAttribute("src");
    placeholder.hidden = false;
    filename.textContent = file?.name || "붙여넣은 이미지";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    setFeedback("이미지에서 QR코드를 찾고 있어요…");

    try {
      const text = await readQrImage(file, scanController.signal);
      if (ticket !== revision) return;
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      preview.hidden = false;
      placeholder.hidden = true;
      resultText.value = text;
      resultPanel.hidden = false;
      copyButton.disabled = text.length === 0;
      const website = readWebsite(text);
      resultType.textContent = website.error ? "텍스트" : "웹사이트";
      if (!website.error) {
        openLink.href = website.value;
        openLink.hidden = false;
      }
      setFeedback(text ? "QR코드를 읽었어요. 내용을 확인한 뒤 사용하세요." : "QR코드는 읽었지만 텍스트가 비어 있어요.", "success");
    } catch (error) {
      if (ticket !== revision || error.name === "AbortError") return;
      setFeedback(error.message || "이미지를 읽지 못했어요. 다시 시도해 주세요.", "error");
    } finally {
      if (ticket === revision) picker.setAttribute("aria-busy", "false");
    }
  }

  picker.addEventListener("click", () => { fileInput.click(); });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (file) void loadImage(file);
  });

  document.addEventListener("dragover", event => {
    if (!Array.from(event.dataTransfer?.types ?? []).includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    picker.classList.add("is-dragging");
  });
  document.addEventListener("dragleave", event => {
    if (!event.relatedTarget) picker.classList.remove("is-dragging");
  });
  document.addEventListener("drop", event => {
    if (!event.dataTransfer?.files.length) return;
    event.preventDefault();
    picker.classList.remove("is-dragging");
    void loadImage(event.dataTransfer.files[0]);
  });
  document.addEventListener("paste", event => {
    const image = Array.from(event.clipboardData?.items ?? []).find(item => item.kind === "file" && item.type.startsWith("image/"));
    const file = image?.getAsFile();
    if (!file) return;
    event.preventDefault();
    void loadImage(file);
  });

  copyButton.addEventListener("click", async () => {
    if (!resultText.value || copyButton.disabled) return;
    const ticket = revision;
    try {
      await navigator.clipboard.writeText(resultText.value);
      if (ticket === revision) setFeedback("읽은 내용을 클립보드에 복사했어요.", "success");
    } catch {
      if (ticket !== revision) return;
      resultText.focus();
      resultText.select();
      setFeedback("선택된 내용을 Ctrl+C 또는 ⌘C로 복사해 주세요.", "error");
    }
  });

  window.addEventListener("pagehide", () => {
    scanController?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
}
