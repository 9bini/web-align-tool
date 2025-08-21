# 🚀 Advanced Code Alignment Tool

세상에서 가장 강력하고 포괄적인 코드 정렬 도구입니다. React와 Ant Design으로 구현된 웹 기반 애플리케이션으로, 모든 종류의 데이터와 코드를 지능적으로 정렬할 수 있습니다.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Ant Design](https://img.shields.io/badge/Ant_Design-0170FE?logo=antdesign&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## ✨ 주요 기능

### 📋 기본 정렬 기능
- **🔤 들여쓰기 제어**: 공백/탭 선택, 크기 조정 (1-8 칸)
- **🔄 대소문자 변환**: 대문자, 소문자, camelCase, PascalCase, snake_case, kebab-case
- **📝 줄 관리**: 공백 제거, 빈 줄 제거, 중복 제거, 기본 줄 정렬
- **🔢 줄 번호**: 자동 줄 번호 추가 (001, 002, 003...)

### 🎯 고급 정렬 기능
- **📊 다양한 정렬 방식**: 알파벳순, 숫자순, 날짜순, 길이순, 사용자 정의
- **🔍 정규표현식 패턴**: 복잡한 패턴 매칭으로 고급 정렬
- **🎨 객체 키 기준 정렬**: JSON 객체를 특정 키로 정렬
- **💬 주석 보존**: 코드 주석을 유지하면서 정렬
- **🤖 자동 데이터 타입 감지**: 입력 내용을 분석하여 최적의 정렬 방법 제안

### 💻 언어별 특화 정렬

#### JavaScript
- **Import 구문 정렬**: 경로별 그룹핑 (라이브러리 → 상대경로)
- **객체 속성 정렬**: 알파벳순으로 속성 재배열

#### Python  
- **Import 구문 정렬**: 표준 라이브러리 우선, from/import 분리
- **PEP 8 준수**: Python 스타일 가이드 따름

#### CSS
- **속성 정렬**: CSS 선택자 내 속성을 알파벳순으로 정렬

#### HTML
- **속성 정렬**: id, class 우선 후 알파벳순 정렬

#### JSON
- **키 재귀적 정렬**: 중첩된 객체까지 모든 키 정렬

#### SQL
- **SELECT 컬럼 정렬**: 쿼리의 컬럼을 알파벳순으로 정렬

#### Markdown
- **리스트 항목 정렬**: 순서 없는/있는 리스트를 내용 기준으로 정렬

### 📊 데이터 타입별 지능적 정렬

| 타입 | 지원 형식 | 예시 |
|------|-----------|------|
| 🔢 **숫자** | 정수, 소수점, 음수 | `1, 2.5, -10, 1000` |
| 📅 **날짜** | 다양한 형식 | `2023-12-01`, `12/01/2023`, `2023년 12월 1일` |
| 🏷️ **버전** | 시맨틱 버저닝 | `1.0.0`, `2.1.3-beta`, `10.15.2` |
| 🌐 **IP 주소** | IPv4 | `192.168.1.1`, `10.0.0.1` |
| 🔗 **URL** | 웹 주소 | `https://example.com`, `http://test.org` |
| 📧 **이메일** | 이메일 주소 | `user@example.com`, `admin@test.org` |
| 🆔 **UUID** | 표준 UUID | `550e8400-e29b-41d4-a716-446655440000` |
| 🎨 **16진수** | 색상 코드 등 | `#FF0000`, `0x1A2B3C` |
| ⏰ **시간** | 시:분:초 | `09:30:15`, `14:45` |
| 📁 **파일 크기** | 바이트 단위 | `1.5MB`, `500KB`, `2.1GB` |

### 🎨 프리셋 라이브러리

즉시 사용 가능한 정렬 템플릿:

- 🔧 **JavaScript 객체 속성**: 객체 리터럴의 속성을 알파벳순으로 정렬
- 🎨 **CSS 속성**: 스타일 규칙 내 속성을 알파벳순으로 정렬  
- 📦 **JavaScript Import**: ES6 import 구문을 경로별로 정렬
- 🐍 **Python Import**: Python import 구문을 PEP 8 스타일로 정렬
- 🏷️ **HTML 속성**: HTML 태그의 속성을 우선순위별로 정렬
- 🗃️ **SQL 컬럼**: SELECT 쿼리의 컬럼을 알파벳순으로 정렬
- 📋 **배열 요소**: JSON 배열을 알파벳순 또는 숫자순으로 정렬

## 🚀 시작하기

### 필수 요구사항
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/9bini/web-align-tool.git
cd web-align-tool

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📖 사용법

### 기본 사용법

1. **코드 입력**: 왼쪽 텍스트 영역에 정렬할 코드나 텍스트를 입력
2. **옵션 선택**: 상단 탭에서 원하는 정렬 방식 선택
3. **정렬 실행**: "코드 정렬" 버튼 클릭
4. **결과 확인**: 오른쪽 영역에서 정렬된 결과 확인
5. **복사**: 📋 버튼으로 결과를 클립보드에 복사

### 탭별 기능

#### 🔧 기본 설정
- 들여쓰기 타입/크기 설정
- 대소문자 변환 옵션
- 기본적인 줄 정리 기능

#### 🎯 고급 정렬  
- 복잡한 정렬 알고리즘 선택
- 정규표현식 패턴 입력
- 객체 키 기준 정렬

#### 🎨 프리셋
- 일반적인 시나리오를 위한 즉시 사용 템플릿
- 원클릭으로 전문적인 정렬 적용

#### 💻 언어별 정렬
- 특정 프로그래밍 언어에 최적화
- Import 구문, 속성, 키워드 정렬

#### 📊 데이터 타입 정렬
- 숫자, 날짜, IP 등 특수 데이터 형식
- 자동 타입 감지 및 최적화된 정렬

## 💡 사용 예시

### JavaScript 객체 정렬

**입력:**
```javascript
const user = {
  name: "John",
  age: 30,
  email: "john@example.com",
  address: "123 Main St"
};
```

**출력 (프리셋: JavaScript 객체 속성):**
```javascript
const user = {
  address: "123 Main St",
  age: 30,
  email: "john@example.com",
  name: "John"
};
```

### CSS 속성 정렬

**입력:**
```css
.button {
  padding: 10px;
  background-color: blue;
  border: 1px solid black;
  margin: 5px;
  color: white;
}
```

**출력 (프리셋: CSS 속성):**
```css
.button {
  background-color: blue;
  border: 1px solid black;
  color: white;
  margin: 5px;
  padding: 10px;
}
```

### 데이터 정렬

**입력 (IP 주소):**
```
192.168.1.10
10.0.0.1
192.168.1.2
172.16.0.1
```

**출력 (데이터 타입: IP 주소):**
```
10.0.0.1
172.16.0.1
192.168.1.2
192.168.1.10
```

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **UI Library**: Ant Design 5
- **Build Tool**: Vite
- **Styling**: CSS-in-JS (Ant Design)
- **Icons**: Ant Design Icons

## 📁 프로젝트 구조

```
src/
├── App.tsx                 # 메인 애플리케이션 컴포넌트
├── main.tsx               # 애플리케이션 진입점
├── index.css              # 글로벌 스타일
└── utils/
    ├── sortingUtils.ts           # 고급 정렬 알고리즘
    ├── languageSpecificSorters.ts # 언어별 정렬 기능
    └── dataTypeSorters.ts        # 데이터 타입별 정렬
```

## 🧩 확장성

이 도구는 다음과 같이 쉽게 확장할 수 있습니다:

### 새로운 언어 지원 추가
```typescript
// languageSpecificSorters.ts에서
static sortNewLanguage(code: string, options: LanguageSortingOptions): string {
  // 새로운 언어별 정렬 로직 구현
}
```

### 새로운 데이터 타입 추가
```typescript
// dataTypeSorters.ts에서  
static sortNewDataType(lines: string[], options: DataTypeSortingOptions): string[] {
  // 새로운 데이터 타입 정렬 로직 구현
}
```

### 새로운 프리셋 추가
```typescript
// sortingUtils.ts의 sortingPresets에서
newPreset: (text: string): string => {
  // 새로운 프리셋 로직 구현
}
```

## 🤝 기여하기

이 프로젝트에 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.

## 🙏 감사의 말

- [Ant Design](https://ant.design/) - 아름다운 UI 컴포넌트
- [React](https://reactjs.org/) - 강력한 프론트엔드 프레임워크
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구
- [TypeScript](https://www.typescriptlang.org/) - 타입 안전성

---

모든 개발자의 생산성 향상을 위해 만들어진 고급 코드 정렬 도구입니다. 🚀

[![Made with ❤️](https://img.shields.io/badge/Made%20with%20❤️-red.svg)](https://github.com/9bini)