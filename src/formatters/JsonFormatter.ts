/**
 * JSON 포매터
 * 다양한 JSON 포매팅 컨벤션을 지원하며, 압축/정리 기능을 제공합니다.
 */

import { JsonFormattingConvention, FormattingResult } from '../types/FormattingTypes';

export class JsonFormatter {
  private convention: JsonFormattingConvention;

  constructor(convention: JsonFormattingConvention) {
    this.convention = convention;
  }

  /**
   * JSON 코드를 지정된 컨벤션에 따라 포매팅합니다.
   * @param code 포매팅할 JSON 코드
   * @returns 포매팅 결과
   */
  public format(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // JSON 파싱 검증
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(code);
      } catch (parseError) {
        errors.push(`유효하지 않은 JSON 형식: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        return {
          formattedCode: code,
          changedLines: 0,
          warnings,
          errors,
          processingTime: Date.now() - startTime
        };
      }

      // 키 정렬 처리
      if (this.convention.sortKeys) {
        parsedJson = this.sortObjectKeys(parsedJson);
      }

      // 따옴표 스타일 조정 (JSON은 항상 double quotes를 사용해야 하므로 경고만)
      if (this.convention.quoteStyle === 'single') {
        warnings.push('JSON 표준에 따라 double quotes를 사용합니다. single quotes는 지원되지 않습니다.');
      }

      // 포매팅 적용
      let formattedCode = this.formatJson(parsedJson);

      // 최종 정리
      formattedCode = this.finalCleanup(formattedCode);

      // 변경된 줄 수 계산
      const originalLines = code.split('\n');
      const formattedLines = formattedCode.split('\n');
      const changedLines = this.countChangedLines(originalLines, formattedLines);

      return {
        formattedCode,
        changedLines,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      errors.push(`포매팅 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return {
        formattedCode: code,
        changedLines: 0,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * JSON 객체를 컨벤션에 따라 포매팅합니다.
   */
  private formatJson(obj: any, currentDepth: number = 0): string {
    const indentString = this.convention.indentationType === 'tab' 
      ? '\t' 
      : ' '.repeat(this.convention.indentSize);
    
    const currentIndent = indentString.repeat(currentDepth);
    const nextIndent = indentString.repeat(currentDepth + 1);

    if (obj === null) {
      return 'null';
    }

    if (typeof obj === 'boolean' || typeof obj === 'number') {
      return String(obj);
    }

    if (typeof obj === 'string') {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return this.formatArray(obj, currentDepth, currentIndent, nextIndent);
    }

    if (typeof obj === 'object') {
      return this.formatObject(obj, currentDepth, currentIndent, nextIndent);
    }

    return JSON.stringify(obj);
  }

  /**
   * 배열을 포매팅합니다.
   */
  private formatArray(arr: any[], currentDepth: number, currentIndent: string, nextIndent: string): string {
    if (arr.length === 0) {
      return '[]';
    }

    // 배열 요소가 적거나 단순한 경우 한 줄로 표시
    const shouldWrapArray = arr.length > this.convention.arrayWrapThreshold || 
                           arr.some(item => typeof item === 'object' && item !== null);

    if (!shouldWrapArray && !this.convention.autoWrapNested) {
      const elements = arr.map(item => this.formatJson(item, currentDepth + 1)).join(', ');
      const result = `[${elements}]`;
      
      // 한 줄 길이 체크
      if (result.length <= this.convention.maxLineLength) {
        return result;
      }
    }

    // 여러 줄로 포매팅
    const elements = arr.map(item => {
      const formattedItem = this.formatJson(item, currentDepth + 1);
      return `${nextIndent}${formattedItem}`;
    });

    const trailingComma = this.convention.trailingComma ? ',' : '';
    const lastElementIndex = elements.length - 1;
    
    if (trailingComma && elements.length > 0) {
      elements[lastElementIndex] += ',';
    } else if (elements.length > 1) {
      // 마지막 요소가 아닌 모든 요소에 쉼표 추가
      for (let i = 0; i < lastElementIndex; i++) {
        elements[i] += ',';
      }
    }

    return `[\n${elements.join('\n')}\n${currentIndent}]`;
  }

  /**
   * 객체를 포매팅합니다.
   */
  private formatObject(obj: Record<string, any>, currentDepth: number, currentIndent: string, nextIndent: string): string {
    const keys = Object.keys(obj);
    
    if (keys.length === 0) {
      return '{}';
    }

    // 객체 속성이 적거나 단순한 경우 한 줄로 표시
    const shouldWrapObject = keys.length > this.convention.objectWrapThreshold ||
                            keys.some(key => typeof obj[key] === 'object' && obj[key] !== null);

    if (!shouldWrapObject && !this.convention.autoWrapNested) {
      const properties = keys.map(key => {
        const value = this.formatJson(obj[key], currentDepth + 1);
        return `"${key}": ${value}`;
      }).join(', ');
      
      const result = `{${properties}}`;
      
      // 한 줄 길이 체크
      if (result.length <= this.convention.maxLineLength) {
        return result;
      }
    }

    // 여러 줄로 포매팅
    const properties = keys.map(key => {
      const value = this.formatJson(obj[key], currentDepth + 1);
      return `${nextIndent}"${key}": ${value}`;
    });

    const trailingComma = this.convention.trailingComma ? ',' : '';
    const lastPropertyIndex = properties.length - 1;
    
    if (trailingComma && properties.length > 0) {
      properties[lastPropertyIndex] += ',';
    } else if (properties.length > 1) {
      // 마지막 속성이 아닌 모든 속성에 쉼표 추가
      for (let i = 0; i < lastPropertyIndex; i++) {
        properties[i] += ',';
      }
    }

    return `{\n${properties.join('\n')}\n${currentIndent}}`;
  }

  /**
   * 객체의 키를 재귀적으로 정렬합니다.
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sortedObj: Record<string, any> = {};
    const sortedKeys = Object.keys(obj).sort();
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }

    return sortedObj;
  }

  /**
   * 최종 정리를 수행합니다.
   */
  private finalCleanup(code: string): string {
    // 줄 끝 공백 제거
    if (this.convention.trimTrailingWhitespace) {
      code = code.replace(/[ \t]+$/gm, '');
    }

    // 파일 끝 개행 처리
    if (this.convention.insertFinalNewline) {
      if (!code.endsWith('\n')) {
        code += '\n';
      }
    } else {
      code = code.replace(/\n+$/, '');
    }

    return code;
  }

  /**
   * 변경된 줄 수를 계산합니다.
   */
  private countChangedLines(originalLines: string[], formattedLines: string[]): number {
    let changedCount = 0;
    const maxLength = Math.max(originalLines.length, formattedLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const originalLine = originalLines[i] || '';
      const formattedLine = formattedLines[i] || '';
      
      if (originalLine !== formattedLine) {
        changedCount++;
      }
    }
    
    return changedCount;
  }

  /**
   * JSON 압축 기능
   */
  public minify(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      const parsedJson = JSON.parse(code);
      const minifiedCode = JSON.stringify(parsedJson);
      
      const originalLines = code.split('\n');
      const formattedLines = [minifiedCode];
      const changedLines = this.countChangedLines(originalLines, formattedLines);

      return {
        formattedCode: minifiedCode,
        changedLines,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      errors.push(`JSON 압축 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return {
        formattedCode: code,
        changedLines: 0,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * JSON 정리 기능 (기본 2 스페이스 들여쓰기)
   */
  public prettify(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      const parsedJson = JSON.parse(code);
      const prettifiedCode = JSON.stringify(parsedJson, null, 2);
      
      const originalLines = code.split('\n');
      const formattedLines = prettifiedCode.split('\n');
      const changedLines = this.countChangedLines(originalLines, formattedLines);

      return {
        formattedCode: prettifiedCode,
        changedLines,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      errors.push(`JSON 정리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return {
        formattedCode: code,
        changedLines: 0,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }
}