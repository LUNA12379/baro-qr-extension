# 해당 버전의 소스 코드

배포 파일 `BaroQR.zip` v1.0.1에 대응하는 소스는 다음 위치에서 무료로 받을 수 있습니다.

- [v1.0.1 릴리스](https://github.com/LUNA12379/baro-qr-extension/releases/tag/v1.0.1)
- [전체 소스 ZIP](https://github.com/LUNA12379/baro-qr-extension/releases/download/v1.0.1/BaroQR-source-v1.0.1.zip)
- [v1.0.1 저장소 소스](https://github.com/LUNA12379/baro-qr-extension/tree/v1.0.1)

전체 소스 ZIP에는 확장 프로그램 소스, 빌드 스크립트, 의존성 잠금 파일, 설치 안내 및 실제 번들에 포함된 `qrcode` 1.5.4와 `dijkstrajs` 1.0.3의 원본 소스가 들어 있습니다. 두 라이브러리의 소스는 `vendor-source/`에 있으며 원래 MIT 라이선스와 저작권 고지를 유지합니다. 일반 개발 도구인 Node.js, npm, esbuild, sharp는 별도로 설치합니다.

프로젝트 폴더에서 Node.js 22 이상으로 실행합니다.

```sh
npm ci
npm run build
```

생성된 `extension/` 폴더를 Chrome 또는 Edge의 개발자 모드에서 로드하면 됩니다. 소스를 수정한 뒤 같은 명령으로 다시 빌드하고 확장 프로그램 관리 화면의 새로고침 버튼을 누르세요. 별도의 서명 키나 계정은 필요하지 않습니다.

수정본을 재배포한다면 GPL-3.0에 따라 변경 사실과 날짜를 표시하고, 그 배포물에 대응하는 소스와 라이선스를 함께 제공하세요. 이 문서의 원본 버전 링크만으로 수정본의 소스 제공을 대신할 수는 없습니다.
