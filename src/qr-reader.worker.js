import jsQR from "jsqr";

self.onmessage = ({ data }) => {
  try {
    const result = jsQR(new Uint8ClampedArray(data.pixels), data.width, data.height, { inversionAttempts: "attemptBoth" });
    self.postMessage({ text: result ? result.data : null });
  } catch {
    self.postMessage({ error: "imageAnalysisFailed" });
  }
};
