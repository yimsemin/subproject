# subproject

[subproject.kr](https://subproject.kr) 홈페이지. GitHub 저장소를 Cloudflare Pages에 연동해 배포하는 정적 사이트다.

## 구조

- `src/`: 사이트 원본(HTML·CSS). 외부 폰트·CDN 없이 로컬 자산만 쓴다.
- `scripts/build.mjs`: `src/`를 `dist/`로 복사한다. Cloudflare Pages가 `npm run build` 후 `dist/`를 배포한다.

## 로컬 확인

```sh
npm run build   # dist/ 생성
npm run dev     # 빌드 후 dist/ 를 로컬 서버로 확인
```

배포 설정과 관리는 [ysm-skills](https://github.com/yimsemin/ysm-skills)에서 한다.
