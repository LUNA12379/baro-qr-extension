# 심사자용 테스트 안내

## 한국어

계정, 로그인, 결제 또는 별도 서버가 필요하지 않습니다. 추가 테스트 계정이나 비밀번호도 없습니다.

1. https://example.com 을 열고 확장 아이콘을 누릅니다. 해당 URL의 QR이 나타나는지 확인합니다.
2. 「이미지 복사」를 누른 뒤 이미지 붙여넣기가 가능한 앱에 붙여 넣습니다. 「PNG 저장」은 1024 × 1024 PNG를 내려받습니다. 「주소 복사」는 해당 URL을 복사합니다.
3. 페이지에 표시된 링크를 우클릭해 「링크를 바로 QR로 만들기」를 선택합니다. 새 창에는 현재 페이지가 아니라 선택한 링크의 QR이 표시됩니다. 「현재 탭」은 메뉴를 실행한 원래 페이지 URL을 불러옵니다.
4. 「QR 이미지 읽기」 탭에서 2단계의 PNG를 선택하거나 끌어놓습니다. 또는 QR 이미지 복사 후 Ctrl+V(Windows) / ⌘V(macOS)로 붙여 넣습니다.
5. 읽은 주소가 표시되는지 확인하고 「내용 복사」를 사용합니다. 「링크 열기」를 눌렀을 때만 해당 주소로 이동하며, 일반 텍스트 QR에는 링크 열기가 표시되지 않습니다.
6. QR이 없는 이미지나 잘못된 파일을 선택하면 안내 메시지가 표시되고 이전 결과의 링크는 제거됩니다.

권한은 activeTab과 contextMenus 두 가지입니다. 해석 Worker와 두 QR 라이브러리를 ZIP에 포함하며 외부 서비스에 데이터를 보내지 않습니다. 데이터 처리와 저장 예외는 PRIVACY.txt에 명시되어 있습니다. GPL-3.0-only 라이선스와 해당 버전의 전체 소스 안내는 LICENSE.txt와 SOURCE.md에서 확인할 수 있습니다.

## English

No account, sign-in, payment, test credentials, or backend service is required. The interface is in Korean.

1. Open https://example.com and click the extension toolbar icon. The current page URL appears as a QR code.
2. Use 이미지 복사 (Copy image), PNG 저장 (Save PNG), and 주소 복사 (Copy URL). The saved PNG is 1024 × 1024 pixels.
3. Right-click an HTTP/HTTPS link and select 링크를 바로 QR로 만들기. A separate window shows the selected link's QR, without navigating to it. 현재 탭 restores the source page URL.
4. Select QR 이미지 읽기 (Read QR image). Choose or drop the saved PNG, or paste a copied QR image with Ctrl+V / Cmd+V.
5. The decoded text appears below the preview. 내용 복사 copies it. 링크 열기 opens an HTTP/HTTPS URL only after a click; decoded content is never executed automatically.
6. An image without a QR produces a friendly error and clears the previous result.

Only activeTab and contextMenus are requested. The decoder worker and QR libraries are bundled locally. No remote code, analytics, external QR service, or developer server is used. The package includes PRIVACY.txt, GPL-3.0-only notices, and SOURCE.md linking the exact corresponding source archive.
