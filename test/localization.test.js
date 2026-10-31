import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import QRCode from "qrcode";
import { getLocale, translate } from "../src/i18n.js";
import { readWebsite } from "../src/url.js";
import { readQrImage } from "../src/read-image.js";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const catalogs = Object.fromEntries(await Promise.all(["en", "ko"].map(async language => [
  language, JSON.parse(await read(`src/locales/${language}.json`))
])));

function setLanguage(language, context) {
  const originalChrome = globalThis.chrome;
  globalThis.chrome = { i18n: { getUILanguage: () => language, getMessage: () => "" } };
  context.after(() => { globalThis.chrome = originalChrome; });
}

test("every UI, manifest, and worker message exists in both shipped catalogs", async () => {
  assert.deepEqual(Object.keys(catalogs.ko).sort(), Object.keys(catalogs.en).sort());
  const sources = await readdir(new URL("src/", root));
  const files = [
    ...sources.filter(file => file.endsWith(".js")).map(file => `src/${file}`),
    "extension/popup.html", "extension/license.html", "extension/manifest.json"
  ];
  for (const file of files) {
    const content = await read(file);
    const keys = [
      ...Array.from(content.matchAll(/translate\("([^"]+)"/g), match => match[1]),
      ...Array.from(content.matchAll(/data-i18n(?:-aria-label|-alt)?="([^"]+)"/g), match => match[1]),
      ...Array.from(content.matchAll(/__MSG_(\w+)__/g), match => match[1])
    ];
    for (const key of keys) assert.ok(catalogs.en[key]?.message && catalogs.ko[key]?.message, `${file}: ${key}`);
    if (file.startsWith("src/")) assert.doesNotMatch(content, /[가-힣]/, `Untranslated source: ${file}`);
    if (file.endsWith(".html")) {
      for (const match of content.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>([^<>]*[가-힣][^<>]*)<\//g)) {
        assert.ok(match[2].includes("data-i18n="), `Untranslated HTML text in ${file}: ${match[3]}`);
      }
    }
  }
  for (const [language, catalog] of Object.entries(catalogs)) {
    assert.deepEqual(JSON.parse(await read(`extension/_locales/${language}/messages.json`)), catalog);
    assert.ok(catalog.extensionName.message.length <= 75);
    assert.ok(catalog.extensionDescription.message.length <= 132);
    for (const [key, entry] of Object.entries(catalog)) assert.ok(entry.message.trim(), `${language}: ${key}`);
  }
  const manifest = JSON.parse(await read("extension/manifest.json"));
  assert.equal(manifest.default_locale, "en");
  assert.deepEqual(manifest.permissions, ["activeTab", "contextMenus"]);
  assert.ok(manifest.content_security_policy.extension_pages.includes("connect-src 'none'"));
  assert.equal(manifest.version, JSON.parse(await read("package.json")).version);
});

for (const language of ["en-US", "en-GB", "ko-KR", "fr-FR"]) {
  test(`locale selection, placeholders, and URL validation: ${language}`, context => {
    setLanguage(language, context);
    const locale = language.startsWith("ko") ? "ko" : "en";
    assert.equal(getLocale(), locale);
    assert.equal(translate("copyImage"), catalogs[locale].copyImage.message);
    assert.ok(translate("qrForWebsite", "example.com").includes("example.com"));
    assert.doesNotMatch(translate("qrForWebsite", "example.com"), /\$HOST\$/);
    assert.equal(readWebsite("").error, catalogs[locale].enterWebsite.message);
    assert.equal(readWebsite("javascript:alert(1)").error, catalogs[locale].httpOnly.message);
    assert.equal(readWebsite("https://example.com/a b").error, catalogs[locale].invalidUrl.message);
    assert.equal(readWebsite("https://example.com/" + "a".repeat(2300)).error, catalogs[locale].urlTooLong.message);
    assert.equal(readWebsite("https://example.com/?q=hello").value, "https://example.com/?q=hello");
  });
}

test("native Chrome translations take precedence", context => {
  setLanguage("ko-KR", context);
  globalThis.chrome.i18n.getMessage = (key, values) => key === "qrForWebsite" ? `native: ${values}` : "";
  assert.equal(translate("qrForWebsite", "example.com"), "native: example.com");
});

for (const language of ["en", "ko"]) {
  test(`image errors are localized: ${language}`, async context => {
    setLanguage(language, context);
    const signal = new AbortController().signal;
    await assert.rejects(readQrImage(new File(["text"], "file.txt", { type: "text/plain" }), signal), {
      message: catalogs[language].imageTypeError.message
    });
    await assert.rejects(readQrImage({ type: "image/png", size: 10 * 1024 * 1024 + 1 }, signal), {
      message: catalogs[language].imageSizeError.message
    });
  });
}

test("built QR reader still decodes generated URLs and returns a translatable failure", async () => {
  const code = QRCode.create("https://example.com/?language=en");
  const scale = 6;
  const size = (code.modules.size + 8) * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let row = 0; row < code.modules.size; row += 1) {
    for (let column = 0; column < code.modules.size; column += 1) {
      if (!code.modules.get(row, column)) continue;
      for (let offsetY = 0; offsetY < scale; offsetY += 1) {
        for (let offsetX = 0; offsetX < scale; offsetX += 1) {
          const index = (((row + 4) * scale + offsetY) * size + (column + 4) * scale + offsetX) * 4;
          pixels.fill(0, index, index + 3);
        }
      }
    }
  }
  let result;
  const worker = { postMessage: message => { result = message; } };
  runInNewContext(await read("extension/qr-reader.worker.js"), { self: worker, Uint8ClampedArray });
  worker.onmessage({ data: { pixels: pixels.buffer, width: size, height: size } });
  assert.equal(result.text, "https://example.com/?language=en");
  worker.onmessage({ data: { pixels: new ArrayBuffer(0), width: 5, height: 5 } });
  assert.equal(result.error, "imageAnalysisFailed");
  assert.ok(catalogs.en[result.error] && catalogs.ko[result.error]);
});

for (const language of ["en", "ko"]) {
  test(`context menu and link popup use the selected locale: ${language}`, async () => {
    let installed;
    let startup;
    let clicked;
    let menu;
    let popup;
    const chrome = {
      i18n: {
        getUILanguage: () => language,
        getMessage: key => catalogs[language][key]?.message ?? ""
      },
      runtime: {
        onInstalled: { addListener: callback => { installed = callback; } },
        onStartup: { addListener: callback => { startup = callback; } },
        getURL: path => `chrome-extension://test/${path}`
      },
      contextMenus: {
        removeAll: callback => callback(),
        create: (options, callback) => { menu = options; callback(); },
        onClicked: { addListener: callback => { clicked = callback; } }
      },
      windows: { create: async options => { popup = options; } }
    };
    runInNewContext(await read("extension/background.js"), { chrome, URL, URLSearchParams, console });
    installed();
    assert.equal(menu.title, catalogs[language].contextMenu.message);
    startup();
    assert.equal(menu.title, catalogs[language].contextMenu.message);
    clicked({ menuItemId: "baro-qr-link", linkUrl: "https://example.com/?a=1&b=2" }, { id: 42 });
    const parameters = new URLSearchParams(new URL(popup.url).hash.slice(1));
    assert.equal(parameters.get("link"), "https://example.com/?a=1&b=2");
    assert.equal(parameters.get("sourceTab"), "42");
    popup = null;
    clicked({ menuItemId: "baro-qr-link", linkUrl: "javascript:alert(1)" }, { id: 42 });
    assert.equal(popup, null);
  });
}
