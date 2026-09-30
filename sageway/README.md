# 세이지웨이(SAGEWAY) 기업 홈페이지 — v3

온라인 쇼핑몰 국내/해외 구축 및 운영, 판촉물·기념품 기획 및 제작 — 두 사업을 소개하는 원페이지 정적 사이트입니다.
Claude Design 시안 「Sageway Landing v3」(Modernist 디자인 시스템)을 그대로 옮겼습니다. 빌드 도구나 프레임워크 없이 HTML·CSS·사진만으로 동작합니다. JavaScript는 모바일 메뉴를 링크 탭 후 닫는 다섯 줄뿐이며, 꺼져 있어도 메뉴는 `<details>`로 열리고 닫힙니다.

```
sageway/
├─ index.html          섹션 마크업(내비 → 히어로 → 히어로 사진 → 사업 영역 → 쇼핑몰 → 판촉물 → 일하는 방식 → FAQ → 문의 → 연락처 → 푸터)
├─ style.css           토큰 → 베이스 → 공용 타이포 → 버튼 → 내비(모바일 메뉴 포함) → 섹션별 레이아웃
├─ robots.txt          검색 로봇 허용 + sitemap 위치
├─ sitemap.xml         페이지 1개. 내용을 크게 바꾸면 <lastmod> 날짜를 갱신하세요
└─ images/
   ├─ sageway-hero.jpg     2400×1050  히어로 (주문 포장)
   ├─ sageway-store.jpg    1600×1200  쇼핑몰 (상품 촬영)
   ├─ sageway-goods.jpg    1600×1200  판촉물 (에코백)
   └─ sageway-process.jpg  2400×600   일하는 방식 띠 (재고 검수)
```

## 로컬에서 열기

저장소 루트에서 정적 서버를 띄우고 브라우저에서 `http://localhost:8765/` 을 엽니다.

```bash
python -m http.server 8765 --directory sageway
```

파일을 수정하면 새로고침만으로 반영됩니다.

## 이메일 주소·회사 정보 바꾸기

- **이메일**: `index.html` 에서 `sageway9@gmail.com` 을 검색해 모두 바꿉니다. 내비·히어로·문의 섹션의 '메일로 문의' 버튼(`mailto:` 링크, 제목 자동 입력), 연락처 섹션, FAQ 답변에 있습니다.
- **회사 정보**(상호, 대표, 사업자등록번호, 주소): `index.html` 맨 아래 `<footer class="footer">` 안에 있습니다.
- **`<title>` / `<meta name="description">` / OG·Twitter 태그 / canonical**: `<head>` 에 있습니다. 도메인을 바꾸면 `jiholee-web.github.io/sageway-homepage` 가 들어간 곳(OG url·image, canonical, JSON-LD, `robots.txt`, `sitemap.xml`)을 모두 새 주소로 바꿉니다.
- **검색용 회사 정보(JSON-LD)**: `<head>` 의 `<script type="application/ld+json">` 에 상호·대표·사업자번호·주소·상담 시간이 있습니다. 푸터 내용을 바꾸면 여기도 맞춥니다.
- **사진 교체**: `images/` 의 같은 파일명으로 덮어쓰면 됩니다. 비율은 히어로 16:7, 사업 영역 4:3, 공정 띠 4:1 이며 `object-fit: cover` 로 잘립니다.

문의 폼과 전화번호는 두지 않습니다. 문의는 이메일 한 곳으로만 받습니다.

## 디자인 메모

- 색·서체·간격은 전부 `style.css` 상단의 `:root` 토큰입니다. 바탕 `#f3f2f2`, 면 `#eae9e9`, 잉크 `#201e1d`, 강조 `#ec3013`(빨강). 다크 모드는 없습니다.
- 서체는 Google Fonts 두 가족: Archivo(라틴·숫자·제목), Noto Sans KR(한글 본문). 굵기는 400과 800 두 가지만 불러옵니다(`index.html` `<head>` 의 `<link>`). 제목은 모두 800 굵기에 자간 −0.025em.
- 내비게이션은 760px 이하에서 텍스트 링크를 숨기고 '메뉴' 토글(`<details>`)로 바뀝니다. 브랜드와 '메일로 문의' 버튼은 항상 보입니다.
- 괘선은 2px 잉크 40% 한 종류, 모서리 반경 0, 그림자 없음. 강조색은 버튼·10px 사각 점·숫자·마지막 빨간 문의 블록에만 씁니다.
- 레이아웃은 `auto-fit` 그리드와 `clamp()` 만 사용해서 별도 미디어 쿼리 없이 데스크톱·모바일에 맞춥니다. 컨테이너 최대 1280px, 좌우 여백 `clamp(20px, 5vw, 72px)`.

## 배포

`main` 브랜치에 `sageway/` 아래 파일을 푸시하면 GitHub Actions(`.github/workflows/pages.yml`)가 `sageway/` 폴더 전체(README 제외)를 GitHub Pages 에 배포합니다. 서버 설정이나 빌드 단계는 없습니다.

## 이전 버전

- `backup/sageway-v2/` — 바로 이전 홈페이지(세이지 그린 톤, 다크 모드·메뉴 스크립트 포함)
- `backup/sageway-v1/` — 세 사업을 소개하던 첫 홈페이지

둘 다 참고용이며 배포 대상이 아닙니다.
