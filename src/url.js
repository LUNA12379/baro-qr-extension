export function readWebsite(input) {
  const value = input.trim();
  if (!value) {
    return { error: "QR로 만들 웹사이트 주소를 입력해 주세요.", empty: true };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { error: "https://로 시작하는 전체 주소를 입력해 주세요." };
  }

  if (!["https:", "http:"].includes(parsed.protocol)) {
    return { error: "http 또는 https 웹사이트 주소만 사용할 수 있어요." };
  }
  if (/[\s\u0000-\u001f\u007f]/u.test(value) || !/^https?:\/\//i.test(value)) {
    return { error: "주소의 공백과 https:// 형식을 확인해 주세요." };
  }
  if (new TextEncoder().encode(value).length > 2300) {
    return { error: "주소가 너무 길어요. 2,300바이트 이하로 줄여 주세요." };
  }

  return { value, hostname: parsed.hostname, filename: parsed.hostname.replace(/[^a-z0-9.-]/gi, "_") };
}
