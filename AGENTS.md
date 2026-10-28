# AGENTS.md

## 프로젝트

- **의도**: subproject.kr은 만든 프로젝트를 소개하고 연결하는 허브 홈페이지다. GitHub 저장소를 Cloudflare Pages에 연동해 배포한다.
- **사용자**: 1순위 채용·협업 제안자, 2순위 도구 사용자.
- **성공 기준**: 처음 온 사람이 한 화면에서 무엇을 만드는 사람인지, 어떤 프로젝트가 지금 쓸 수 있는지 알고 해당 주소로 이동한다. 한국어와 영어를 모두 제공한다.
- **하지 않을 것**: 서버·로그인·DB·분석 도구, 프로젝트별 상세 페이지(프로젝트 주소는 `<프로젝트>.subproject.kr`로 이미 따로 배포한다).

## 실행과 검증

```sh
npm run dev     # 빌드 후 http://127.0.0.1:4173
npm run check   # 빌드 + 콘텐츠·노출·글자 크기 검사 (푸시 전)
```

- 의존성 없는 정적 사이트(Node 24). Cloudflare Pages 표준: 빌드 `npm run build`, 출력 `dist`, 프로덕션 `main`, 미리보기 `develop`.
- Cloudflare 배포·도메인 설정은 이 저장소가 아니라 ysm-skills 저장소에서 한다. 페이지를 다 만든 뒤 요청한다.

## 구조와 콘텐츠 규칙

- `src/data/projects.json`이 프로젝트 목록의 정본이다. 항목 하나가 한 프로젝트이며 `listed: false`면 사이트에 나오지 않는다. 비공개 저장소(`visibility: private`)에는 `repo` 링크를 둘 수 없다(검사가 막는다).
- 상태는 `available`(지금 쓸 수 있음), `building`(만드는 중), `archived`(개발 중단) 세 가지뿐이다. 이 밖의 상태를 늘리지 않는다.
- 문구는 `src/i18n/ko.json`·`en.json`이 정본이고 두 파일의 키가 같아야 한다. 프로젝트 소개는 항목의 `summary.ko`·`summary.en`에 둔다. 한국어는 `/`, 영어는 `/en/`로 빌드 때 각각 HTML을 만든다(`scripts/build.mjs`).
- 프로젝트 이름은 한국어 이름과 영어 이름이 다를 때만 `nameEn`을 쓴다.
- `src/static/`은 그대로 `dist/`로 복사된다(CSS, 필터 스크립트, `_headers`, 파비콘). 외부 폰트·CDN 없이 로컬 자산만 쓴다.
- 회사·고객 이름, 내부 주소, 개인 연락처는 소개 문구에 넣지 않는다. 이메일은 `src/data/site.json`의 `email`을 채우면 연락 구역에 나타난다.

## 브랜치 운영

- `main`은 프로덕션, `develop`은 통합·미리보기 브랜치다. 두 브랜치에 직접 커밋하지 않는다.
- 작업은 `develop`에서 딴 작업 브랜치(`feat/` `fix/` `docs/` `chore/` + kebab-case)에서 하고, PR로 `develop`에 병합한다.
- 배포는 `develop` → `main` PR로 한다.
- 병합 후 작업 브랜치는 로컬·원격 모두 지운다. `main`·`develop`은 지우지 않는다.
- 커밋 제목은 영어로 쓴다.

<!-- ysm-baseline:start -->
## 공통 작업 규칙 (ysm baseline)

이 구역은 ysm-skills 베이스라인이 관리한다. 프로젝트 고유 규칙은 이 구역 밖에 쓰고, 충돌하면 프로젝트 규칙이 우선한다. 소통·판단·검증 같은 공통 진행 규칙은 전역 지침(ysm-global)이 맡는다.

### 문서

- 루트에는 `README.md`·`AGENTS.md`·`CLAUDE.md`·`LICENSE`·`CHANGELOG.md`처럼 관례상 필요한 파일만 두고, 기획·인수인계·결정 기록·가이드 같은 나머지 문서는 `docs/`에 둔다. 사용자가 폴더에 넣어 둔 입력 문서도 `docs/`로 옮긴다.
- 같은 규칙·사실은 한 문서에만 쓰고 나머지는 링크한다. 문서 종류마다 자리를 하나로 정한다(README는 개요·사용법, 로드맵은 앞으로 할 일만이며 끝난 항목은 지운다). 문서를 늘리기보다 합친다. 날짜를 박은 "현재 수준" 표를 두지 않는다.
- 방향이 바뀌거나 큰 변경이 끝나면 문서 간 모순·중복·낡은 내용을 점검한다.

### UI가 있는 프로젝트

- 첫 방문자 기준으로 설계한다. 지금 무엇이 진행 중인지(진행도·완료·결과 없음 안내)가 보여야 하고, 용어와 단위가 화면 전체에서 같아야 하며, 내부 용어를 노출하지 않는다.
- 영역 구분은 박스를 남발하지 말고 글자 크기·굵기와 일관된 간격으로 한다. 글자는 12pt 이상, 한국어는 어절 단위로 줄바꿈하고, 외부 폰트·CDN 없이 로컬 자산을 쓴다.

### Git

- stage·commit·push·PR·merge는 사용자가 요청할 때만 한다. 승인은 그 요청에만 유효하고 다음 작업으로 이어지지 않는다. 이 파일의 프로젝트 구역이 명시한 상시 승인만 예외다.
- force push, 푸시한 이력의 수정, 브랜치·태그 강제 삭제, 공유 브랜치의 `reset --hard`는 사용자가 그 대화에서 직접 요청했을 때만 한다. 푸시 전 로컬 커밋의 amend·fixup 정리는 이력 재작성이 아니다. `--no-verify`로 훅을 우회하지 않는다.
- 첫 커밋 이후의 작업은 `main`이 아닌 작업 브랜치(`feat/` `fix/` `docs/` `chore/` + kebab-case)에서 한다. 프로젝트가 `main` 직행을 명시하면 예외다. 병렬 작업은 브랜치마다 `git worktree`로 분리한다.
- 커밋은 의미·작업 단위 하나씩 만든다. 같은 목적의 후속 수정(오타·누락·리뷰 반영)은 새 커밋으로 쌓지 말고 푸시 전에 amend·fixup으로 합쳐 원격 이력을 깔끔하게 유지한다.
- 커밋 제목은 `<type>(<선택 scope>): <요약>`이다. type은 `feat` `fix` `perf` `refactor` `docs` `test` `build` `ci` `chore` `style` `revert`, 72자 이내, 끝에 마침표 없음. 형식은 `.githooks/commit-msg`가 검사한다. 이유가 필요하면 본문에 쓴다. 제목 언어는 프로젝트가 정한다.
- 커밋 이메일은 GitHub noreply 주소를 쓴다(프로젝트에 설정되어 있으면 `.githooks/pre-commit`이 검사한다).
- PR 본문은 요약(무엇을·왜), 확인한 방법(실제 실행한 것만), 남은 결정 순서로 짧게 쓴다(`.github/pull_request_template.md`).
- 커밋 메시지와 PR 본문에 AI 생성 표식이나 co-author 트레일러(`Co-Authored-By: Claude …`, `🤖 Generated with …` 등)를 넣지 않는다. 커밋은 훅이 제거하지만 PR 본문은 직접 지킨다.
- 작업이 끝나 사용하지 않는 브랜치는 로컬·원격 모두 지운다(`main`·`develop` 같은 장기 브랜치 제외). GitHub의 "Automatically delete head branches"는 켜지 않는다. 푸시·병합까지 요청받은 작업은 로컬과 원격이 일치하고 미커밋 변경이 없는 상태로 마친다.
- 새 클론에서는 한 번 `git config core.hooksPath .githooks`를 실행한다(Claude Code는 세션 시작 때 자동 실행).

### 의존성과 환경

- 의존성·가상환경·캐시·데이터·설정·로그는 프로젝트 폴더 안에만 두어, 폴더를 지우면 함께 사라지게 한다. 설치물과 결과물을 프로젝트 밖(스크래치패드, 전역, 에이전트 메모리)에 두지 않는다. 폴더 하나만 받아도 다른 컴퓨터에서 이어갈 수 있어야 한다. 폴더 밖 저장은 사용자가 명시적으로 고른 경우만 허용한다.
  - Node: `package.json`의 `devDependencies`와 `npx`.
  - Python: `uv`로 프로젝트 `.venv`만 쓴다(`uv sync`, `uv add`).
  - 런타임 버전은 `.node-version`, `.python-version`에만 고정한다. `mise.toml`은 두지 않는다.
- macOS와 Windows에서 같은 동작을 하도록 플랫폼 중립 경로와 LF 줄바꿈을 쓴다.

### 안전

- 저장소는 언제 공개되어도 문제가 없는 상태로 유지한다. `.env`, 키, 토큰, 개인정보, 개인 절대경로, 개인 취향·운영 데이터, 실제 업무 문서를 저장소에 넣거나 읽어 출력하지 않는다. 환경변수 예시는 값이 없는 `.env.example`만 둔다.
- 비밀값으로 보이는 파일·문자열이 staged에 있으면 `.githooks/pre-commit`이 커밋을 막는다.
- GitHub Actions 워크플로는 `permissions: contents: read`로 시작하고 `pull_request_target`은 쓰지 않으며, 포크 PR 실행에 시크릿을 노출하지 않는다.
<!-- ysm-baseline:end -->
