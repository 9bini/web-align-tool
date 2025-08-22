/**
 * 다양한 프로그래밍 언어를 위한 프리셋 포매팅 컨벤션 모음
 * 업계 표준 스타일 가이드와 인기 있는 컨벤션들을 제공합니다.
 */

import { 
  PresetConvention, 
  JavaFormattingConvention, 
  JsonFormattingConvention, 
  JavaScriptFormattingConvention, 
  KotlinFormattingConvention, 
  SqlFormattingConvention 
} from '../types/FormattingTypes';

/**
 * Java 언어 프리셋 컨벤션들
 */
export const JAVA_PRESETS: PresetConvention[] = [
  {
    id: 'google-java',
    name: 'Google Java Style',
    language: 'java',
    description: 'Google의 공식 Java 스타일 가이드를 따르는 컨벤션입니다.',
    popularity: 10,
    isOfficial: true,
    convention: {
      name: 'Google Java Style',
      description: 'Google의 공식 Java 스타일 가이드',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 100,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      braceStyle: 'kr',
      organizeImports: true,
      separateStaticImports: true,
      separateImportGroups: true,
      blankLinesBetweenMethods: 1,
      blankLinesBetweenClasses: 2,
      blankLineAfterAnnotations: false,
      spaceAroundOperators: true,
      spaceBeforeMethodParens: false,
      spaceBeforeControlParens: true
    } as JavaFormattingConvention
  },
  {
    id: 'oracle-java',
    name: 'Oracle Java Style',
    language: 'java',
    description: 'Oracle의 공식 Java 코딩 컨벤션입니다.',
    popularity: 9,
    isOfficial: true,
    convention: {
      name: 'Oracle Java Style',
      description: 'Oracle의 공식 Java 코딩 컨벤션',
      indentationType: 'space',
      indentSize: 4,
      maxLineLength: 80,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      braceStyle: 'kr',
      organizeImports: true,
      separateStaticImports: false,
      separateImportGroups: true,
      blankLinesBetweenMethods: 1,
      blankLinesBetweenClasses: 2,
      blankLineAfterAnnotations: false,
      spaceAroundOperators: true,
      spaceBeforeMethodParens: false,
      spaceBeforeControlParens: true
    } as JavaFormattingConvention
  },
  {
    id: 'eclipse-java',
    name: 'Eclipse Default',
    language: 'java',
    description: 'Eclipse IDE의 기본 Java 포매팅 설정입니다.',
    popularity: 7,
    isOfficial: false,
    convention: {
      name: 'Eclipse Default',
      description: 'Eclipse IDE 기본 Java 포매팅',
      indentationType: 'tab',
      indentSize: 1,
      maxLineLength: 120,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      braceStyle: 'kr',
      organizeImports: true,
      separateStaticImports: true,
      separateImportGroups: true,
      blankLinesBetweenMethods: 1,
      blankLinesBetweenClasses: 2,
      blankLineAfterAnnotations: true,
      spaceAroundOperators: true,
      spaceBeforeMethodParens: false,
      spaceBeforeControlParens: true
    } as JavaFormattingConvention
  }
];

/**
 * JSON 언어 프리셋 컨벤션들
 */
export const JSON_PRESETS: PresetConvention[] = [
  {
    id: 'standard-json',
    name: 'Standard JSON',
    language: 'json',
    description: '표준 JSON 포매팅 컨벤션입니다.',
    popularity: 10,
    isOfficial: true,
    convention: {
      name: 'Standard JSON',
      description: '표준 JSON 포매팅',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 120,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'double',
      trailingComma: false,
      arrayWrapThreshold: 3,
      objectWrapThreshold: 3,
      autoWrapNested: true,
      sortKeys: false
    } as JsonFormattingConvention
  },
  {
    id: 'prettier-json',
    name: 'Prettier JSON',
    language: 'json',
    description: 'Prettier의 JSON 포매팅 스타일입니다.',
    popularity: 9,
    isOfficial: false,
    convention: {
      name: 'Prettier JSON',
      description: 'Prettier JSON 포매팅 스타일',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 80,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'double',
      trailingComma: false,
      arrayWrapThreshold: 2,
      objectWrapThreshold: 2,
      autoWrapNested: true,
      sortKeys: false
    } as JsonFormattingConvention
  },
  {
    id: 'compact-json',
    name: 'Compact JSON',
    language: 'json',
    description: '최대한 압축된 JSON 포매팅입니다.',
    popularity: 6,
    isOfficial: false,
    convention: {
      name: 'Compact JSON',
      description: '압축된 JSON 포매팅',
      indentationType: 'space',
      indentSize: 1,
      maxLineLength: 200,
      insertFinalNewline: false,
      trimTrailingWhitespace: true,
      quoteStyle: 'double',
      trailingComma: false,
      arrayWrapThreshold: 10,
      objectWrapThreshold: 10,
      autoWrapNested: false,
      sortKeys: true
    } as JsonFormattingConvention
  }
];

/**
 * JavaScript 언어 프리셋 컨벤션들
 */
export const JAVASCRIPT_PRESETS: PresetConvention[] = [
  {
    id: 'airbnb-javascript',
    name: 'Airbnb JavaScript',
    language: 'javascript',
    description: 'Airbnb의 인기 있는 JavaScript 스타일 가이드입니다.',
    popularity: 10,
    isOfficial: true,
    convention: {
      name: 'Airbnb JavaScript',
      description: 'Airbnb JavaScript 스타일 가이드',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 100,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'single',
      useSemicolons: true,
      trailingComma: 'all',
      braceStyle: 'kr',
      arrowParens: 'always',
      spaceAroundOperators: true,
      spaceBeforeFunctionParens: false,
      spaceInObjectBraces: true,
      spaceInArrayBrackets: false,
      jsxQuoteStyle: 'double',
      jsxBracketSameLine: false
    } as JavaScriptFormattingConvention
  },
  {
    id: 'standard-javascript',
    name: 'JavaScript Standard',
    language: 'javascript',
    description: 'JavaScript Standard Style 컨벤션입니다.',
    popularity: 9,
    isOfficial: true,
    convention: {
      name: 'JavaScript Standard',
      description: 'JavaScript Standard Style',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 120,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'single',
      useSemicolons: false,
      trailingComma: 'none',
      braceStyle: 'kr',
      arrowParens: 'avoid',
      spaceAroundOperators: true,
      spaceBeforeFunctionParens: true,
      spaceInObjectBraces: true,
      spaceInArrayBrackets: false,
      jsxQuoteStyle: 'single',
      jsxBracketSameLine: false
    } as JavaScriptFormattingConvention
  },
  {
    id: 'prettier-javascript',
    name: 'Prettier JavaScript',
    language: 'javascript',
    description: 'Prettier의 기본 JavaScript 포매팅입니다.',
    popularity: 8,
    isOfficial: false,
    convention: {
      name: 'Prettier JavaScript',
      description: 'Prettier JavaScript 포매팅',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 80,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      quoteStyle: 'double',
      useSemicolons: true,
      trailingComma: 'es5',
      braceStyle: 'kr',
      arrowParens: 'always',
      spaceAroundOperators: true,
      spaceBeforeFunctionParens: false,
      spaceInObjectBraces: true,
      spaceInArrayBrackets: false,
      jsxQuoteStyle: 'double',
      jsxBracketSameLine: false
    } as JavaScriptFormattingConvention
  }
];

/**
 * Kotlin 언어 프리셋 컨벤션들
 */
export const KOTLIN_PRESETS: PresetConvention[] = [
  {
    id: 'kotlin-official',
    name: 'Kotlin Official',
    language: 'kotlin',
    description: 'JetBrains의 공식 Kotlin 코딩 컨벤션입니다.',
    popularity: 10,
    isOfficial: true,
    convention: {
      name: 'Kotlin Official',
      description: 'JetBrains 공식 Kotlin 컨벤션',
      indentationType: 'space',
      indentSize: 4,
      maxLineLength: 120,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      braceStyle: 'kr',
      organizeImports: true,
      separateImportGroups: true,
      blankLinesBetweenMethods: 1,
      blankLinesBetweenClasses: 2,
      spaceAroundOperators: true,
      spaceBeforeFunctionParens: false,
      spaceAroundTypeColon: true,
      spaceAroundLambdaArrow: true,
      spaceAroundWhenArrow: true,
      chainedCallWrapping: 'if_long'
    } as KotlinFormattingConvention
  },
  {
    id: 'android-kotlin',
    name: 'Android Kotlin',
    language: 'kotlin',
    description: 'Android 개발을 위한 Kotlin 스타일 가이드입니다.',
    popularity: 9,
    isOfficial: true,
    convention: {
      name: 'Android Kotlin',
      description: 'Android Kotlin 스타일 가이드',
      indentationType: 'space',
      indentSize: 4,
      maxLineLength: 100,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      braceStyle: 'kr',
      organizeImports: true,
      separateImportGroups: true,
      blankLinesBetweenMethods: 1,
      blankLinesBetweenClasses: 2,
      spaceAroundOperators: true,
      spaceBeforeFunctionParens: false,
      spaceAroundTypeColon: true,
      spaceAroundLambdaArrow: true,
      spaceAroundWhenArrow: true,
      chainedCallWrapping: 'always'
    } as KotlinFormattingConvention
  }
];

/**
 * SQL 언어 프리셋 컨벤션들
 */
export const SQL_PRESETS: PresetConvention[] = [
  {
    id: 'standard-sql',
    name: 'Standard SQL',
    language: 'sql',
    description: '표준 SQL 포매팅 컨벤션입니다.',
    popularity: 10,
    isOfficial: true,
    convention: {
      name: 'Standard SQL',
      description: '표준 SQL 포매팅',
      indentationType: 'space',
      indentSize: 2,
      maxLineLength: 120,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      keywordCase: 'upper',
      identifierCase: 'lower',
      commaPosition: 'trailing',
      selectColumnsOnNewLine: true,
      whereConditionsOnNewLine: true,
      joinOnNewLine: true,
      indentSubqueries: true,
      functionArgWrapThreshold: 3,
      insertValuesOnNewLine: true
    } as SqlFormattingConvention
  },
  {
    id: 'postgresql-sql',
    name: 'PostgreSQL Style',
    language: 'sql',
    description: 'PostgreSQL 권장 SQL 포매팅입니다.',
    popularity: 8,
    isOfficial: false,
    convention: {
      name: 'PostgreSQL Style',
      description: 'PostgreSQL 권장 포매팅',
      indentationType: 'space',
      indentSize: 4,
      maxLineLength: 100,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
      keywordCase: 'lower',
      identifierCase: 'lower',
      commaPosition: 'leading',
      selectColumnsOnNewLine: true,
      whereConditionsOnNewLine: true,
      joinOnNewLine: true,
      indentSubqueries: true,
      functionArgWrapThreshold: 2,
      insertValuesOnNewLine: false
    } as SqlFormattingConvention
  },
  {
    id: 'compact-sql',
    name: 'Compact SQL',
    language: 'sql',
    description: '최대한 압축된 SQL 포매팅입니다.',
    popularity: 5,
    isOfficial: false,
    convention: {
      name: 'Compact SQL',
      description: '압축된 SQL 포매팅',
      indentationType: 'space',
      indentSize: 1,
      maxLineLength: 200,
      insertFinalNewline: false,
      trimTrailingWhitespace: true,
      keywordCase: 'upper',
      identifierCase: 'preserve',
      commaPosition: 'trailing',
      selectColumnsOnNewLine: false,
      whereConditionsOnNewLine: false,
      joinOnNewLine: false,
      indentSubqueries: false,
      functionArgWrapThreshold: 10,
      insertValuesOnNewLine: false
    } as SqlFormattingConvention
  }
];

/**
 * 모든 프리셋 컨벤션을 합친 배열
 */
export const ALL_PRESETS: PresetConvention[] = [
  ...JAVA_PRESETS,
  ...JSON_PRESETS,
  ...JAVASCRIPT_PRESETS,
  ...KOTLIN_PRESETS,
  ...SQL_PRESETS
];

/**
 * 언어별 프리셋 맵
 */
export const PRESETS_BY_LANGUAGE = {
  java: JAVA_PRESETS,
  json: JSON_PRESETS,
  javascript: JAVASCRIPT_PRESETS,
  kotlin: KOTLIN_PRESETS,
  sql: SQL_PRESETS
};

/**
 * 인기순으로 정렬된 프리셋 목록
 */
export const POPULAR_PRESETS = ALL_PRESETS
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 10);

/**
 * 공식 프리셋만 필터링한 목록
 */
export const OFFICIAL_PRESETS = ALL_PRESETS
  .filter(preset => preset.isOfficial)
  .sort((a, b) => b.popularity - a.popularity);