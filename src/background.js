const menuId = "baro-qr-link";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error("우클릭 메뉴를 준비하지 못했습니다.", chrome.runtime.lastError.message);
      return;
    }
    chrome.contextMenus.create({
      id: menuId,
      title: "링크를 바로 QR로 만들기",
      contexts: ["link"],
      targetUrlPatterns: ["http://*/*", "https://*/*"]
    }, () => {
      if (chrome.runtime.lastError) console.error("우클릭 메뉴를 만들지 못했습니다.", chrome.runtime.lastError.message);
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== menuId || !info.linkUrl) return;
  let link;
  try {
    link = new URL(info.linkUrl);
  } catch {
    return;
  }
  if (!["http:", "https:"].includes(link.protocol)) return;

  const parameters = new URLSearchParams({ link: info.linkUrl });
  if (Number.isInteger(tab?.id) && tab.id >= 0) parameters.set("sourceTab", String(tab.id));
  const url = `${chrome.runtime.getURL("popup.html")}#${parameters}`;
  void chrome.windows.create({ url, type: "popup", width: 410, height: 660, focused: true })
    .catch(error => { console.error("QR 창을 열지 못했습니다.", error.message); });
});
