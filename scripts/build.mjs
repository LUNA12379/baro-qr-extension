import { build } from "esbuild";
import sharp from "sharp";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const extension = new URL("extension/", root);
await mkdir(new URL("icons/", extension), { recursive: true });
await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ["src/popup.js"],
  outfile: "extension/popup.js",
  bundle: true,
  platform: "browser",
  target: "chrome110",
  format: "iife",
  minify: true,
  legalComments: "none"
});

for (const size of [16, 32, 48, 128]) {
  await sharp(fileURLToPath(new URL("assets/icon.svg", root)))
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`icons/icon${size}.png`, extension)));
}

const notices = [];
for (const [name, license] of [["qrcode", "license"], ["dijkstrajs", "LICENSE.md"]]) {
  notices.push(`${name}\n${await readFile(new URL(`node_modules/${name}/${license}`, root), "utf8")}`);
}
await writeFile(new URL("THIRD_PARTY_NOTICES.txt", extension), notices.join("\n\n"));
await copyFile(new URL("README.md", root), new URL("설치방법.md", extension));
console.log("바로 QR 빌드 완료: extension 폴더를 브라우저에 로드하세요.");
