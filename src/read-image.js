import { translate } from "./i18n.js";
export async function readQrImage(file, signal) {
  if (!file || !/^image\/(png|jpeg|webp|gif|bmp|x-ms-bmp)$/i.test(file.type)) {
    throw new Error(translate("imageTypeError"));
  }
  if (file.size > 10 * 1024 * 1024) throw new Error(translate("imageSizeError"));
  if (signal.aborted) throw new DOMException("Canceled", "AbortError");

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(translate("imageOpenError"));
  }

  let imageData;
  try {
    if (signal.aborted) throw new DOMException("Canceled", "AbortError");
    if (bitmap.width * bitmap.height > 40000000 || Math.max(bitmap.width, bitmap.height) > 12000) {
      throw new Error(translate("imageDimensionsError"));
    }
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    bitmap.close();
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("qr-reader.worker.js", document.baseURI));
    const finish = (error, value) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      worker.terminate();
      if (error) reject(error);
      else resolve(value);
    };
    const abort = () => finish(new DOMException("Canceled", "AbortError"));
    const timer = setTimeout(() => finish(new Error(translate("imageTimeout"))), 10000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = ({ data }) => {
      if (data.error) finish(new Error(translate(data.error)));
      else if (data.text === null) finish(new Error(translate("qrNotFound")));
      else finish(null, data.text);
    };
    worker.onerror = () => finish(new Error(translate("readerUnavailable")));
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      worker.postMessage({ pixels: imageData.data.buffer, width: imageData.width, height: imageData.height }, [imageData.data.buffer]);
    } catch {
      finish(new Error(translate("imageProcessError")));
    }
  });
}
