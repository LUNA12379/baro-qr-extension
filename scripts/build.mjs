import { build } from "esbuild";
import sharp from "sharp";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const extension = new URL("extension/", root);
await mkdir(new URL("icons/", extension), { recursive: true });
await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ["src/popup.js", "src/background.js", "src/qr-reader.worker.js"],
  outdir: "extension",
  bundle: true,
  platform: "browser",
  target: "chrome110",
  format: "iife",
  minify: true,
  legalComments: "none"
});

for (const size of [16, 32, 48, 128]) {
  const artworkSize = size === 128 ? 96 : size;
  const padding = (size - artworkSize) / 2;
  const icon = sharp(fileURLToPath(new URL("assets/icon.svg", root))).resize(artworkSize, artworkSize);
  if (padding) icon.extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 0, g: 0, b: 0, alpha: 0 } });
  await icon.png().toFile(fileURLToPath(new URL(`icons/icon${size}.png`, extension)));
}

const notices = [];
for (const [name, license] of [["qrcode", "license"], ["dijkstrajs", "LICENSE.md"], ["jsqr", "LICENSE"]]) {
  notices.push(`${name}\n${(await readFile(new URL(`node_modules/${name}/${license}`, root), "utf8")).trimEnd()}`);
}
await writeFile(new URL("THIRD_PARTY_NOTICES.txt", extension), `${notices.join("\n\n")}\n`);
await copyFile(new URL("README.md", root), new URL("설치방법.md", extension));
await copyFile(new URL("LICENSE", root), new URL("LICENSE.txt", extension));
await copyFile(new URL("NOTICE", root), new URL("NOTICE.txt", extension));
await copyFile(new URL("SOURCE.md", root), new URL("SOURCE.md", extension));
await writeFile(new URL("PRIVACY.txt", extension), `\uFEFF${await readFile(new URL("PRIVACY.md", root), "utf8")}`);
console.log("바로 QR 빌드 완료: extension 폴더를 브라우저에 로드하세요.");
