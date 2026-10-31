import { translate } from "./i18n.js";
const menuId = "baro-qr-link";

function registerContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error("Could not prepare the context menu.", chrome.runtime.lastError.message);
      return;
    }
    chrome.contextMenus.create({
      id: menuId,
      title: translate("contextMenu"),
      contexts: ["link"],
      targetUrlPatterns: ["http://*/*", "https://*/*"]
    }, () => {
      if (chrome.runtime.lastError) console.error("Could not create the context menu.", chrome.runtime.lastError.message);
    });
  });
}

chrome.runtime.onInstalled.addListener(registerContextMenu);
chrome.runtime.onStartup.addListener(registerContextMenu);

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
    .catch(error => { console.error("Could not open the QR window.", error.message); });
});
