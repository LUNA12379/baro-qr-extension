# Chrome 웹스토어 제출 준비

대상 버전: **1.1.1** · 준비일: **2026-10-24**

이 폴더는 제출 자료입니다. 웹스토어에 등록·심사·출시된 상태가 아니며, 이 자료만으로 기존 개발자 모드 설치본에 자동 업데이트가 적용되지는 않습니다.

## 준비 파일

- `BaroQR-v1.1.1.zip`: 대시보드의 확장 패키지 업로드용. 다운로드 폴더의 제출 묶음에 제공됩니다. manifest.json이 ZIP 최상위에 있습니다.
- `listing-ko.md`: 이름, 설명, 홈페이지·지원 URL
- `privacy-fields.md`: 단일 목적, 권한 사용 이유, 원격 코드 및 데이터 사용 신고 초안
- `reviewer-notes.md`: 로그인 없이 재현 가능한 한국어·영어 테스트 안내
- `assets/icon128.png`: 128 × 128 PNG, 96 × 96 그림에 16px 투명 여백
- `assets/screenshot-01-create.png`, `screenshot-02-link.png`, `screenshot-03-read.png`: 각 1280 × 800, 실제 확장 UI를 사용한 기능 안내
- `assets/promo-440x280.png`: 선택 제출용 브랜드 이미지
- `PRIVACY.md`: 공개 개인정보처리방침의 사본. 실제 URL은 아래 항목을 사용합니다.

## 진행 순서

1. [Chrome 웹스토어 개발자 대시보드](https://chrome.google.com/webstore/devconsole)에 게시할 Google 계정으로 로그인합니다. 기존 개발자 등록 여부를 확인하고, 필요하면 계정 소유자가 약관·등록비·이메일 인증·보안 설정을 직접 처리합니다. 게시자 연락처와 사업자/비사업자 여부는 실제 상태에 맞게 입력해야 하며 이 자료에서 임의로 정하지 않습니다.
2. 기존에 이 확장 항목을 만든 적이 있는지 먼저 확인합니다. 없다면 새 항목을 만들고 `BaroQR-v1.1.1.zip`만 업로드합니다. 제출 묶음 전체 ZIP이나 소스 ZIP을 올리지 않습니다.
3. `listing-ko.md`의 설명과 링크, `assets/`의 아이콘·스크린샷을 입력합니다. 기본 언어는 한국어로 선택합니다.
4. `privacy-fields.md`를 검토하고 실제 코드에 맞게 권한과 데이터 사용을 신고합니다. 개인정보처리방침 URL은 https://github.com/LUNA12379/baro-qr-extension/blob/main/PRIVACY.md 입니다.
5. 필요하면 심사자 메모에 `reviewer-notes.md`의 테스트 절차를 넣습니다. 로그인이나 테스트 계정이 필요하지 않습니다.
6. 공개(Public) 또는 링크 공개(Unlisted), 배포 국가를 계정 소유자가 확인합니다. 스토어의 최종 미리보기와 모든 필수 입력란을 검토한 뒤 심사 제출 여부를 결정합니다.
7. 심사 통과·출시 후 스토어 설치 URL을 README와 GitHub 릴리스에 추가합니다. 기존 개발자 모드 설치본은 스토어 설치본으로 한 번 전환합니다. 두 버전을 동시에 켜면 아이콘·우클릭 메뉴가 중복될 수 있습니다.

## 이후 자동 업데이트

다음 버전은 manifest의 version을 올리고, 해당 버전 ZIP을 **같은 스토어 항목**에 업로드해 심사·출시합니다. 새 항목을 만들지 않습니다. Chrome이 스토어 설치본을 주기적으로 업데이트하며 GitHub에만 올리는 것으로는 갱신되지 않습니다. 추가 권한이 생기면 사용자의 동의가 필요할 수 있습니다.

소스와 라이선스는 계속 공개하고 각 배포본의 SOURCE.md가 정확한 소스 ZIP을 가리키도록 유지합니다. 스토어 ID를 발급받기 전에는 임의의 ID나 update_url을 추가하지 않습니다.

## 이미지 재생성

`preview.html`, `preview.css`, `preview.js`는 스토어 이미지용 레이아웃입니다. 프로젝트 루트를 로컬 서버로 열고 `store/preview.html?view=create`, `?view=link`, `?view=read`는 1280 × 800, `?view=promo`는 440 × 280 화면으로 캡처합니다. 미리보기의 확장 iframe은 `extension/popup.html`과 실제 번들을 사용합니다. 예제 주소는 example.com이며 실제 링크 초기화 경로를 사용합니다. 읽기 화면에는 이 주소를 담은 QR PNG를 넣어 실제 해석 결과가 표시된 후 캡처합니다. 브라우저 확장이 아닌 로컬 미리보기에서는 현재 탭 버튼이 비활성화되며, 캡처 환경에서는 브라우저 API에 예제 탭을 제공해 활성화했습니다. 레이아웃 바깥의 문구는 기능 안내이며 새 기능이나 스토어 승인 상태를 암시하지 않습니다.

## 공식 기준

- [패키지 준비](https://developer.chrome.com/docs/webstore/prepare)
- [이미지 규격](https://developer.chrome.com/docs/webstore/images)
- [등록 정보](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [개인정보 신고](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [새 버전 제출](https://developer.chrome.com/docs/webstore/update)

규격과 대시보드는 변경될 수 있으므로 최종 제출 시 현재 화면을 확인합니다. 심사 통과나 소요 기간을 보장하지 않습니다.
