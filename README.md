# subproject

[subproject.kr](https://subproject.kr) 홈페이지. 만든 프로젝트를 소개하고 각 프로젝트(`<프로젝트>.subproject.kr`)로 연결하는 허브다. 서버 없는 정적 사이트이며 한국어(`/`)와 영어(`/en/`)를 제공한다.

## 프로젝트 추가·수정

`src/data/projects.json`에 항목을 추가하거나 고친 뒤 `npm run check`를 실행한다. 항목 형식과 규칙은 [AGENTS.md](AGENTS.md)의 "구조와 콘텐츠 규칙"에 있다. 화면 문구는 `src/i18n/`에 있다.

## 실행

Node 24가 필요하다(`.node-version`). 설치할 의존성은 없다.

```sh
npm run dev     # 빌드 후 http://127.0.0.1:4173
npm run check   # 빌드 + 콘텐츠 검사
```

## 배포

Cloudflare Pages(GitHub 연동)로 배포한다. 빌드 `npm run build`, 출력 `dist`. 배포 설정은 [ysm-skills](https://github.com/yimsemin/ysm-skills)에서 한다.
