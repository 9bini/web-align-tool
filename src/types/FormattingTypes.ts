/**
 * 코드 포매팅 컨벤션과 관련된 TypeScript 타입 정의
 * 다양한 프로그래밍 언어의 포매팅 규칙을 정의하고 관리합니다.
 */

/**
 * 지원되는 프로그래밍 언어 목록
 */
export type SupportedLanguage = 'java' | 'json' | 'javascript' | 'kotlin' | 'sql';

/**
 * 들여쓰기 타입 (탭 또는 스페이스)
 */
export type IndentationType = 'tab' | 'space';

/**
 * 중괄호 스타일 (K&R, Allman, GNU 등)
 */
export type BraceStyle = 'kr' | 'allman' | 'gnu' | 'horstmann';

/**
 * 따옴표 스타일 (작은따옴표, 큰따옴표)
 */
export type QuoteStyle = 'single' | 'double';

/**
 * 기본 포매팅 컨벤션 인터페이스
 * 모든 언어에 공통으로 적용되는 기본 규칙들을 정의합니다.
 */
export interface BaseFormattingConvention {
  /** 컨벤션 이름 (예: "Google Java Style", "Airbnb JavaScript") */
  name: string;
  /** 컨벤션 설명 */
  description: string;
  /** 들여쓰기 타입 */
  indentationType: IndentationType;
  /** 들여쓰기 크기 (스페이스 개수 또는 탭 너비) */
  indentSize: number;
  /** 한 줄 최대 길이 */
  maxLineLength: number;
  /** 파일 끝에 개행 문자 추가 여부 */
  insertFinalNewline: boolean;
  /** 줄 끝 공백 제거 여부 */
  trimTrailingWhitespace: boolean;
}

/**
 * Java 언어 특화 포매팅 컨벤션
 */
export interface JavaFormattingConvention extends BaseFormattingConvention {
  /** 중괄호 스타일 */
  braceStyle: BraceStyle;
  /** import 문 정렬 여부 */
  organizeImports: boolean;
  /** static import와 일반 import 사이 빈 줄 추가 */
  separateStaticImports: boolean;
  /** 각 import 그룹 사이 빈 줄 추가 */
  separateImportGroups: boolean;
  /** 메서드 사이 빈 줄 개수 */
  blankLinesBetweenMethods: number;
  /** 클래스 사이 빈 줄 개수 */
  blankLinesBetweenClasses: number;
  /** 어노테이션과 메서드/클래스 사이 빈 줄 여부 */
  blankLineAfterAnnotations: boolean;
  /** 연산자 주변 공백 추가 */
  spaceAroundOperators: boolean;
  /** 메서드 괄호 앞 공백 여부 */
  spaceBeforeMethodParens: boolean;
  /** if/for/while 괄호 앞 공백 여부 */
  spaceBeforeControlParens: boolean;
}

/**
 * JSON 언어 특화 포매팅 컨벤션
 */
export interface JsonFormattingConvention extends BaseFormattingConvention {
  /** 따옴표 스타일 */
  quoteStyle: QuoteStyle;
  /** 객체/배열 끝에 trailing comma 추가 여부 */
  trailingComma: boolean;
  /** 배열 요소를 한 줄에 표시할 최대 개수 */
  arrayWrapThreshold: number;
  /** 객체 속성을 한 줄에 표시할 최대 개수 */
  objectWrapThreshold: number;
  /** 중첩된 객체/배열 자동 줄바꿈 여부 */
  autoWrapNested: boolean;
  /** 키 정렬 여부 (알파벳 순) */
  sortKeys: boolean;
}

/**
 * JavaScript 언어 특화 포매팅 컨벤션
 */
export interface JavaScriptFormattingConvention extends BaseFormattingConvention {
  /** 따옴표 스타일 */
  quoteStyle: QuoteStyle;
  /** 세미콜론 사용 여부 */
  useSemicolons: boolean;
  /** trailing comma 추가 여부 */
  trailingComma: 'none' | 'es5' | 'all';
  /** 중괄호 스타일 */
  braceStyle: BraceStyle;
  /** 화살표 함수 괄호 사용 규칙 */
  arrowParens: 'always' | 'avoid';
  /** 연산자 주변 공백 추가 */
  spaceAroundOperators: boolean;
  /** 함수 괄호 앞 공백 여부 */
  spaceBeforeFunctionParens: boolean;
  /** 객체 중괄호 내부 공백 여부 */
  spaceInObjectBraces: boolean;
  /** 배열 대괄호 내부 공백 여부 */
  spaceInArrayBrackets: boolean;
  /** JSX 속성에서 따옴표 스타일 */
  jsxQuoteStyle: QuoteStyle;
  /** JSX 태그 닫는 괄호 위치 */
  jsxBracketSameLine: boolean;
}

/**
 * Kotlin 언어 특화 포매팅 컨벤션
 */
export interface KotlinFormattingConvention extends BaseFormattingConvention {
  /** 중괄호 스타일 */
  braceStyle: BraceStyle;
  /** import 문 정렬 여부 */
  organizeImports: boolean;
  /** 각 import 그룹 사이 빈 줄 추가 */
  separateImportGroups: boolean;
  /** 메서드 사이 빈 줄 개수 */
  blankLinesBetweenMethods: number;
  /** 클래스 사이 빈 줄 개수 */
  blankLinesBetweenClasses: number;
  /** 연산자 주변 공백 추가 */
  spaceAroundOperators: boolean;
  /** 함수 괄호 앞 공백 여부 */
  spaceBeforeFunctionParens: boolean;
  /** 타입 어노테이션 콜론 주변 공백 */
  spaceAroundTypeColon: boolean;
  /** 람다 화살표 주변 공백 */
  spaceAroundLambdaArrow: boolean;
  /** when 문에서 화살표 주변 공백 */
  spaceAroundWhenArrow: boolean;
  /** 체이닝 호출 시 줄바꿈 */
  chainedCallWrapping: 'off' | 'if_long' | 'always';
}

/**
 * SQL 언어 특화 포매팅 컨벤션
 */
export interface SqlFormattingConvention extends BaseFormattingConvention {
  /** SQL 키워드 대소문자 스타일 */
  keywordCase: 'upper' | 'lower' | 'capitalize';
  /** 테이블/컬럼명 대소문자 스타일 */
  identifierCase: 'upper' | 'lower' | 'preserve';
  /** 쉼표 위치 (앞 또는 뒤) */
  commaPosition: 'leading' | 'trailing';
  /** SELECT 절에서 컬럼 별도 줄 표시 */
  selectColumnsOnNewLine: boolean;
  /** WHERE 절 조건 별도 줄 표시 */
  whereConditionsOnNewLine: boolean;
  /** JOIN 절 별도 줄 표시 */
  joinOnNewLine: boolean;
  /** 서브쿼리 들여쓰기 여부 */
  indentSubqueries: boolean;
  /** 함수 인자 줄바꿈 임계값 */
  functionArgWrapThreshold: number;
  /** INSERT 문에서 VALUES 절 줄바꿈 */
  insertValuesOnNewLine: boolean;
}

/**
 * 전체 포매팅 컨벤션을 담는 유니온 타입
 */
export type FormattingConvention = 
  | JavaFormattingConvention 
  | JsonFormattingConvention 
  | JavaScriptFormattingConvention 
  | KotlinFormattingConvention 
  | SqlFormattingConvention;

/**
 * 포매팅 결과 인터페이스
 */
export interface FormattingResult {
  /** 포매팅된 코드 */
  formattedCode: string;
  /** 변경된 줄 수 */
  changedLines: number;
  /** 포매팅 과정에서 발견된 경고 메시지 */
  warnings: string[];
  /** 포매팅 과정에서 발생한 오류 메시지 */
  errors: string[];
  /** 포매팅 소요 시간 (밀리초) */
  processingTime: number;
}

/**
 * IDE 설정 파일 내보내기 형식
 */
export type IdeExportFormat = 
  | 'vscode' 
  | 'intellij' 
  | 'eclipse' 
  | 'prettier' 
  | 'eslint' 
  | 'editorconfig';

/**
 * IDE 내보내기 결과
 */
export interface IdeExportResult {
  /** 내보내기 형식 */
  format: IdeExportFormat;
  /** 설정 파일명 */
  filename: string;
  /** 설정 파일 내용 */
  content: string;
  /** 적용 방법 설명 */
  instructions: string;
}

/**
 * 프리셋 컨벤션 타입
 */
export interface PresetConvention {
  /** 프리셋 ID */
  id: string;
  /** 프리셋 이름 */
  name: string;
  /** 지원 언어 */
  language: SupportedLanguage;
  /** 프리셋 설명 */
  description: string;
  /** 인기도 점수 (1-10) */
  popularity: number;
  /** 공식 여부 (구글, 에어비앤비 등 공식 스타일 가이드) */
  isOfficial: boolean;
  /** 컨벤션 설정 */
  convention: FormattingConvention;
}