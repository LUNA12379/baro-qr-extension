# 바로 QR

현재 웹사이트를 클릭 한 번으로 QR코드로 바꾸는 Chrome / Edge 확장 프로그램입니다.

[설치용 ZIP 다운로드](https://github.com/LUNA12379/baro-qr-extension/releases/latest/download/BaroQR.zip) · [릴리스](https://github.com/LUNA12379/baro-qr-extension/releases)

Windows와 macOS의 데스크톱 Chrome / Edge에서 사용할 수 있습니다. QR 생성, 주소 수정·복사, 1024 × 1024 PNG 저장을 지원하며 외부 서버로 주소를 전송하지 않습니다.

<img src="https://raw.githubusercontent.com/LUNA12379/baro-qr-extension/main/assets/preview.png" width="380" alt="바로 QR 팝업: 현재 웹사이트 QR코드, 주소 입력, PNG 저장 및 주소 복사 버튼">

## 설치

1. [최신 릴리스](https://github.com/LUNA12379/baro-qr-extension/releases/latest)에서 `BaroQR.zip`을 다운로드하고 압축을 풉니다.
2. Chrome 주소창에 `chrome://extensions`를 입력합니다. Edge에서는 `edge://extensions`를 입력합니다.
3. **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 클릭합니다.
5. `manifest.json`이 있는 폴더를 선택합니다. 이 소스 프로젝트에서는 `extension` 폴더입니다.
6. 브라우저 오른쪽 위 퍼즐 아이콘을 눌러 **바로 QR**을 도구 모음에 고정합니다.

설치한 폴더를 이동하거나 지우면 확장 프로그램이 작동하지 않습니다. 웹스토어 등록 없이 로컬에서 사용하는 버전입니다.

GitHub의 **Code → Download ZIP**으로 소스 전체를 받았다면, 압축을 푼 프로젝트 안의 `extension` 폴더를 선택하세요. 빌드된 파일이 포함되어 있어 별도 빌드 없이 설치할 수 있습니다.

## 사용

- 웹사이트를 연 뒤 **바로 QR** 아이콘을 클릭하면 해당 주소의 QR코드가 자동으로 생성됩니다.
- 휴대폰 기본 카메라로 스캔해서 페이지를 엽니다.
- **PNG 저장**으로 흰 여백을 포함한 1024 × 1024 이미지를 다운로드합니다.
- **주소 복사**로 URL을 복사합니다. 복사가 제한되면 선택된 주소를 Windows에서는 `Ctrl+C`, macOS에서는 `⌘C`로 복사합니다.
- 주소를 수정하면 QR코드가 즉시 바뀝니다. **현재 탭**으로 원래 페이지 주소를 복원합니다.
- 브라우저 설정 페이지나 새 탭에서는 일반 웹사이트 주소를 직접 입력할 수 있습니다.

HTTP/HTTPS 주소를 지원합니다. 긴 주소는 UTF-8 기준 2,300바이트까지 지원하며, 매우 조밀한 QR은 PNG를 크게 열어 스캔하는 편이 좋습니다. QR은 원래 주소를 그대로 담으며, 주소를 줄이거나 로그인 권한을 전달하지 않습니다. 휴대폰에서 웹사이트에 접속하려면 인터넷 연결이 필요합니다. localhost나 사내망 주소는 휴대폰에서도 해당 서버에 접근할 수 있어야 합니다.

## 개인정보 및 권한

QR코드는 브라우저 안에서 생성됩니다. 외부 QR 서비스, 분석 도구, 서버 요청, 방문 기록 저장을 사용하지 않습니다. QR 생성 자체는 오프라인에서도 작동합니다.

요청 권한은 `activeTab` 하나입니다. 사용자가 아이콘을 클릭한 탭의 URL과 제목만 읽습니다. 콘텐츠 스크립트와 백그라운드 작업은 없습니다. 클립보드에는 **주소 복사**를 누를 때만 쓰며, 클립보드를 읽지 않습니다. PNG 파일은 사용자가 **PNG 저장**을 누르면 다운로드합니다.

## 소스에서 다시 빌드

Node.js 22 이상을 권장합니다.

```sh
npm ci
npm run build
```

빌드된 파일은 `extension/`에 생성됩니다. 설치에는 Node.js나 npm이 필요하지 않습니다.

- `src/popup.js`: 현재 탭, 화면 상태, 다운로드, 복사
- `src/url.js`: 웹사이트 주소 검증
- `extension/popup.html`, `extension/popup.css`: 한국어 팝업 UI
- `scripts/build.mjs`: QR 라이브러리 번들 및 아이콘 생성

참고: [Chrome 로컬 확장 프로그램 설치](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked), [activeTab 권한](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [node-qrcode](https://github.com/soldair/node-qrcode).

## 라이선스

Copyright (C) 2026 LUNA12379. 이 프로젝트는 **GNU GPL 버전 3만** 적용됩니다. SPDX 식별자는 `GPL-3.0-only`입니다. 상업적 이용, 수정 및 재배포가 가능하며, 수정본을 배포할 때는 GPL-3.0에 따라 해당 소스를 제공하고 동일 라이선스를 유지해야 합니다. 어떠한 보증도 제공되지 않습니다.

- [라이선스 전문](https://github.com/LUNA12379/baro-qr-extension/blob/main/LICENSE)
- [프로젝트 저작권 및 라이선스 고지](https://github.com/LUNA12379/baro-qr-extension/blob/main/NOTICE)
- [해당 버전의 전체 소스와 빌드 안내](https://github.com/LUNA12379/baro-qr-extension/blob/main/SOURCE.md)

설치용 ZIP에도 `LICENSE.txt`, `NOTICE.txt`, `SOURCE.md`와 라이선스 안내 화면이 포함됩니다. 팝업 아래의 **GPL-3.0** 링크에서 확인할 수 있습니다. 이 라이선스는 확장 프로그램 코드에 적용되며, 생성된 QR 이미지나 그 안의 웹사이트 콘텐츠에 GPL을 부여하는 것은 아닙니다.

번들에 포함된 `qrcode`와 `dijkstrajs`는 원래 MIT 라이선스를 유지하며, 각각의 저작권 및 라이선스 고지는 [`extension/THIRD_PARTY_NOTICES.txt`](https://github.com/LUNA12379/baro-qr-extension/blob/main/extension/THIRD_PARTY_NOTICES.txt)에 있습니다.
