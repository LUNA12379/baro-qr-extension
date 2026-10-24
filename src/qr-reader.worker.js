import jsQR from "jsqr";

self.onmessage = ({ data }) => {
  try {
    const result = jsQR(new Uint8ClampedArray(data.pixels), data.width, data.height, { inversionAttempts: "attemptBoth" });
    self.postMessage({ text: result ? result.data : null });
  } catch {
    self.postMessage({ error: "이미지를 분석하지 못했어요. 다른 이미지로 시도해 주세요." });
  }
};
