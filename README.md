# subProject

[subProject](https://subproject.kr) 홈페이지. 만든 프로젝트를 소개하고 각 프로젝트(`<프로젝트>.subproject.kr`)로 연결하는 허브다. 서버 없는 정적 사이트이며 한국어(`/`)와 영어(`/en/`)를 제공한다.

## 프로젝트 추가·수정

`src/data/projects.json`에 항목을 추가하거나 고친 뒤 `npm run check`를 실행한다. 항목 형식과 규칙은 [AGENTS.md](AGENTS.md)의 "구조와 콘텐츠 규칙"에 있다. 화면 문구는 `src/i18n/`에 있다.

공개 GitHub 저장소가 연결된 비아카이브 프로젝트에는 최신 커밋 날짜를 UTC 기준 `YYMMDD`로 표시한다. 방문자 브라우저가 GitHub API를 조회하고, 같은 탭에서 한 시간 동안 결과를 재사용한다. 조회에 실패하면 날짜를 표시하지 않는다. 조회 코드는 `src/static/updates.js`에 있다.

## 실행

Node 24가 필요하다(`.node-version`). 설치할 의존성은 없다.

```sh
npm run dev     # 빌드 후 http://127.0.0.1:4173
npm run check   # 빌드, 콘텐츠·번역·글자 크기 검증, 미리보기·업데이트 테스트
```

## 배포

Cloudflare Pages와 GitHub를 연결해 배포한다. 빌드 명령은 `npm run build`, 출력 폴더는 `dist`다. 프로덕션은 `main`, 미리보기는 `develop`을 사용한다. 배포와 도메인 설정은 [ysm-skills](https://github.com/yimsemin/ysm-skills)에서 관리한다.
