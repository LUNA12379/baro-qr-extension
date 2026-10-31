const views = {
  create: {
    category: "01 / 웹사이트 QR 만들기",
    headline: "지금 보는 페이지를,\n휴대폰으로.",
    description: "확장 아이콘을 누르면 현재 주소가 QR로.\n이미지로 복사하거나 PNG로 저장하세요.",
    features: ["클릭 한 번으로 생성", "이미지 · 주소 복사", "1024px PNG 저장"],
    url: "https://example.com/",
    page: "01 / 03"
  },
  link: {
    category: "02 / 링크 우클릭으로 만들기",
    headline: "페이지를 열지 않고,\n링크만 바로 QR로.",
    description: "웹페이지의 링크를 우클릭한 뒤\n‘링크를 바로 QR로 만들기’를 선택하세요.",
    features: ["링크 우클릭 메뉴", "별도 QR 창", "주소를 바꾸면 다시 생성"],
    url: "https://example.com/?source=link",
    page: "02 / 03"
  },
  read: {
    category: "03 / QR 이미지 읽기",
    headline: "이미지 속 QR,\n내용부터 확인하세요.",
    description: "파일을 고르거나, 끌어놓거나, 붙여넣기.\n읽은 링크는 내가 누를 때만 열려요.",
    features: ["이미지 선택 · 드래그", "Ctrl+V / ⌘V", "내용 확인 후 링크 열기"],
    url: "https://example.com/",
    page: "03 / 03"
  }
};

const englishViews = {
  "create": {
    "category": "01 / CREATE WEBSITE QR CODES",
    "headline": "This page.\nOn your phone.",
    "description": "Open Baro QR to share the current URL.\nCopy the image or save it as a PNG.",
    "features": [
      "Create in one click",
      "Copy images and URLs",
      "Save 1024px PNGs"
    ],
    "url": "https://example.com/",
    "page": "01 / 03"
  },
  "link": {
    "category": "02 / RIGHT-CLICK ANY LINK",
    "headline": "A link to share.\nNo extra tab.",
    "description": "Right-click a link and choose\n“Create QR code with Baro QR.”",
    "features": [
      "Link context menu",
      "Dedicated QR window",
      "Edit the URL anytime"
    ],
    "url": "https://example.com/?source=link",
    "page": "02 / 03"
  },
  "read": {
    "category": "03 / READ QR IMAGES",
    "headline": "See what's inside\nbefore you open it.",
    "description": "Choose, drop, or paste a QR image.\nOpen the decoded link when you're ready.",
    "features": [
      "Choose or drop images",
      "Paste with Ctrl+V / ⌘V",
      "Review before opening"
    ],
    "url": "https://example.com/",
    "page": "03 / 03"
  }
};
const language = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "ko";
if (language === "en") {
  document.documentElement.lang = "en";
  document.title = "Baro QR · Store screenshots";
  for (const brand of document.querySelectorAll(".brand-word")) brand.textContent = "Baro";
  document.querySelector(".eyebrow").textContent = "Share a website in a moment";
  document.querySelector(".privacy").textContent = "Create and read QR codes. All on your device.";
  document.querySelector(".pagination-brand").textContent = "Baro QR";
  document.querySelector(".promo h1").textContent = "Your website.\nOne QR code.";
  document.querySelector(".promo p").textContent = "Create · Copy · Read";
  document.querySelector(".app-preview").setAttribute("aria-label", "Actual extension interface");
  document.querySelector("#extension-preview").title = "Baro QR extension";
}

const selected = new URLSearchParams(location.search).get("view") ?? "create";
if (selected === "promo") {
  document.querySelector(".screenshot").hidden = true;
  document.querySelector(".promo").hidden = false;
} else {
  const localizedViews = language === "en" ? englishViews : views;
  const view = localizedViews[selected] ?? localizedViews.create;
  document.querySelector("#category").textContent = view.category;
  document.querySelector("#headline").textContent = view.headline;
  document.querySelector("#description").textContent = view.description;
  document.querySelector("#page-number").textContent = view.page;
  for (const feature of view.features) {
    const item = document.createElement("li");
    item.textContent = feature;
    document.querySelector("#features").append(item);
  }
  const frame = document.querySelector("#extension-preview");
  frame.src = `../extension/popup.html?lang=${language}#${new URLSearchParams({ link: view.url, sourceTab: "1" })}`;
  if (selected === "read") {
    frame.addEventListener("load", () => {
      frame.contentDocument.querySelector("#scan-tab").click();
    }, { once: true });
  }
}
