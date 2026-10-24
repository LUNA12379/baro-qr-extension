export async function readQrImage(file, signal) {
  if (!file || !/^image\/(png|jpeg|webp|gif|bmp|x-ms-bmp)$/i.test(file.type)) {
    throw new Error("PNG, JPG, WebP, GIF 또는 BMP 이미지를 선택해 주세요.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("10MB 이하의 이미지를 선택해 주세요.");
  if (signal.aborted) throw new DOMException("Canceled", "AbortError");

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("이미지 파일을 열 수 없어요. 파일이 손상되었는지 확인해 주세요.");
  }

  let imageData;
  try {
    if (signal.aborted) throw new DOMException("Canceled", "AbortError");
    if (bitmap.width * bitmap.height > 40000000 || Math.max(bitmap.width, bitmap.height) > 12000) {
      throw new Error("이미지가 너무 커요. QR 부분만 잘라서 다시 넣어 주세요.");
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
    const timer = setTimeout(() => finish(new Error("읽는 데 시간이 오래 걸려요. QR 부분만 잘라서 다시 시도해 주세요.")), 10000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = ({ data }) => {
      if (data.error) finish(new Error(data.error));
      else if (data.text === null) finish(new Error("QR코드를 찾지 못했어요. QR 전체가 선명하게 보이는 이미지를 넣어 주세요."));
      else finish(null, data.text);
    };
    worker.onerror = () => finish(new Error("QR 읽기를 시작하지 못했어요. 창을 다시 열어 주세요."));
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      worker.postMessage({ pixels: imageData.data.buffer, width: imageData.width, height: imageData.height }, [imageData.data.buffer]);
    } catch {
      finish(new Error("이미지를 처리하지 못했어요. 다시 시도해 주세요."));
    }
  });
}
