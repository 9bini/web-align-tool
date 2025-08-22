/**
 * JavaScript/TypeScript 포매터
 * Airbnb, Standard, Prettier 등 다양한 JavaScript 컨벤션을 지원합니다.
 */

import { JavaScriptFormattingConvention, FormattingResult } from '../types/FormattingTypes';

export class JavaScriptFormatter {
  private convention: JavaScriptFormattingConvention;

  constructor(convention: JavaScriptFormattingConvention) {
    this.convention = convention;
  }

  /**
   * JavaScript 코드를 지정된 컨벤션에 따라 포매팅합니다.
   * @param code 포매팅할 JavaScript 코드
   * @returns 포매팅 결과
   */
  public format(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 1. 기본 정규화
      let formattedCode = this.normalizeWhitespace(code);
      
      // 2. import/export 문 정리
      formattedCode = this.formatImports(formattedCode);
      
      // 3. 함수 선언 포매팅
      formattedCode = this.formatFunctions(formattedCode);
      
      // 4. 객체/배열 포매팅
      formattedCode = this.formatObjectsAndArrays(formattedCode);
      
      // 5. 제어문 포매팅
      formattedCode = this.formatControlStatements(formattedCode);
      
      // 6. 세미콜론 처리
      formattedCode = this.handleSemicolons(formattedCode);
      
      // 7. 따옴표 스타일 적용
      formattedCode = this.applyQuoteStyle(formattedCode);
      
      // 8. 들여쓰기 적용
      formattedCode = this.applyIndentation(formattedCode);
      
      // 9. 중괄호 스타일 적용
      formattedCode = this.applyBraceStyle(formattedCode);
      
      // 10. 공백 규칙 적용
      formattedCode = this.applySpacingRules(formattedCode);
      
      // 11. trailing comma 처리
      formattedCode = this.handleTrailingCommas(formattedCode);
      
      // 12. 최종 정리
      formattedCode = this.finalCleanup(formattedCode);

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
   * 기본 공백과 개행을 정규화합니다.
   */
  private normalizeWhitespace(code: string): string {
    // 탭을 스페이스로 변환하거나 그 반대
    if (this.convention.indentationType === 'space') {
      code = code.replace(/\t/g, ' '.repeat(this.convention.indentSize));
    }
    
    // 줄 끝 공백 제거
    if (this.convention.trimTrailingWhitespace) {
      code = code.replace(/[ \t]+$/gm, '');
    }
    
    // 여러 연속된 빈 줄을 하나로 정리
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return code;
  }

  /**
   * import/export 문을 정리합니다.
   */
  private formatImports(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    
    // import 문들을 찾아서 정리
    const importLines: string[] = [];
    const nonImportLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('export ')) {
        importLines.push(line);
      } else {
        nonImportLines.push(line);
      }
    }
    
    // import 정렬
    importLines.sort();
    
    // 결과 구성
    if (importLines.length > 0) {
      result.push(...importLines);
      result.push('');
    }
    result.push(...nonImportLines);
    
    return result.join('\n');
  }

  /**
   * 함수 선언을 포매팅합니다.
   */
  private formatFunctions(code: string): string {
    // 화살표 함수 괄호 처리
    if (this.convention.arrowParens === 'avoid') {
      // 단일 매개변수에서 괄호 제거
      code = code.replace(/\(\s*(\w+)\s*\)\s*=>/g, '$1 =>');
    } else {
      // 항상 괄호 사용
      code = code.replace(/\b(\w+)\s*=>/g, '($1) =>');
    }
    
    // 함수 괄호 앞 공백 처리
    if (this.convention.spaceBeforeFunctionParens) {
      code = code.replace(/function\s*(\w+)\s*\(/g, 'function $1 (');
      code = code.replace(/(\w+)\s*\(/g, '$1 (');
    } else {
      code = code.replace(/function\s+(\w+)\s+\(/g, 'function $1(');
    }
    
    return code;
  }

  /**
   * 객체와 배열을 포매팅합니다.
   */
  private formatObjectsAndArrays(code: string): string {
    // 객체 중괄호 내부 공백
    if (this.convention.spaceInObjectBraces) {
      code = code.replace(/{(\S)/g, '{ $1');
      code = code.replace(/(\S)}/g, '$1 }');
    } else {
      code = code.replace(/{\s+/g, '{');
      code = code.replace(/\s+}/g, '}');
    }
    
    // 배열 대괄호 내부 공백
    if (this.convention.spaceInArrayBrackets) {
      code = code.replace(/\[(\S)/g, '[ $1');
      code = code.replace(/(\S)\]/g, '$1 ]');
    } else {
      code = code.replace(/\[\s+/g, '[');
      code = code.replace(/\s+\]/g, ']');
    }
    
    return code;
  }

  /**
   * 제어문을 포매팅합니다.
   */
  private formatControlStatements(code: string): string {
    // if/for/while 등의 제어문 포매팅
    const controlKeywords = ['if', 'for', 'while', 'switch', 'catch'];
    
    for (const keyword of controlKeywords) {
      const regex = new RegExp(`\\b${keyword}\\s*\\(`, 'g');
      code = code.replace(regex, `${keyword} (`);
    }
    
    return code;
  }

  /**
   * 세미콜론을 처리합니다.
   */
  private handleSemicolons(code: string): string {
    if (this.convention.useSemicolons) {
      // 세미콜론 추가 (간단한 구현)
      code = code.replace(/([^;}])\n/g, (match, char) => {
        // 중괄호, 주석, 빈 줄이 아닌 경우 세미콜론 추가
        if (char && char !== '{' && char !== '}' && !char.match(/\/[\/*]/)) {
          return char + ';\n';
        }
        return match;
      });
    } else {
      // 불필요한 세미콜론 제거
      code = code.replace(/;(\s*\n)/g, '$1');
    }
    
    return code;
  }

  /**
   * 따옴표 스타일을 적용합니다.
   */
  private applyQuoteStyle(code: string): string {
    if (this.convention.quoteStyle === 'single') {
      // 큰따옴표를 작은따옴표로 변경 (이스케이프 처리 주의)
      code = code.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'");
    } else {
      // 작은따옴표를 큰따옴표로 변경
      code = code.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    }
    
    return code;
  }

  /**
   * 들여쓰기를 적용합니다.
   */
  private applyIndentation(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    let indentLevel = 0;
    const indentString = this.convention.indentationType === 'tab' 
      ? '\t' 
      : ' '.repeat(this.convention.indentSize);

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        result.push('');
        continue;
      }

      // 닫는 중괄호/괄호에 대한 들여쓰기 레벨 조정
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']') || trimmedLine.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 들여쓰기 적용
      result.push(indentString.repeat(indentLevel) + trimmedLine);

      // 여는 중괄호/괄호에 대한 다음 줄 들여쓰기 레벨 조정
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
        indentLevel++;
      }
    }

    return result.join('\n');
  }

  /**
   * 중괄호 스타일을 적용합니다.
   */
  private applyBraceStyle(code: string): string {
    switch (this.convention.braceStyle) {
      case 'kr':
        // K&R 스타일: 여는 중괄호가 같은 줄에
        code = code.replace(/\n\s*{/g, ' {');
        break;
      case 'allman':
        // Allman 스타일: 여는 중괄호가 다음 줄에
        code = code.replace(/\s*{\s*/g, '\n{');
        break;
    }
    return code;
  }

  /**
   * 공백 규칙을 적용합니다.
   */
  private applySpacingRules(code: string): string {
    if (this.convention.spaceAroundOperators) {
      // 연산자 주변에 공백 추가
      code = code.replace(/([^=!<>+\-*/%&|^])([=!<>+\-*/%&|^]=?)([^=])/g, '$1 $2 $3');
    }
    
    return code;
  }

  /**
   * trailing comma를 처리합니다.
   */
  private handleTrailingCommas(code: string): string {
    switch (this.convention.trailingComma) {
      case 'all':
        // 모든 곳에 trailing comma 추가
        code = code.replace(/(\w+|"[^"]*"|'[^']*')\s*\n\s*[}\]]/g, '$1,\n}');
        break;
      case 'es5':
        // ES5에서 허용되는 곳에만 trailing comma 추가
        code = code.replace(/(\w+|"[^"]*"|'[^']*')\s*\n\s*[}\]]/g, '$1,\n}');
        break;
      case 'none':
        // trailing comma 제거
        code = code.replace(/,(\s*[}\]])/g, '$1');
        break;
    }
    
    return code;
  }

  /**
   * 최종 정리를 수행합니다.
   */
  private finalCleanup(code: string): string {
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
   * JSX 코드를 포매팅합니다.
   */
  public formatJsx(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      let formattedCode = code;

      // JSX 따옴표 스타일 적용
      if (this.convention.jsxQuoteStyle === 'single') {
        formattedCode = formattedCode.replace(/=\s*"([^"]*)"/g, "='$1'");
      } else {
        formattedCode = formattedCode.replace(/=\s*'([^']*)'/g, '="$1"');
      }

      // JSX 닫는 괄호 위치
      if (this.convention.jsxBracketSameLine) {
        formattedCode = formattedCode.replace(/\n\s*>/g, '>');
      } else {
        formattedCode = formattedCode.replace(/(\S)\s*>/g, '$1\n>');
      }

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
      errors.push(`JSX 포매팅 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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