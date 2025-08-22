/**
 * Kotlin 언어 포매터
 * JetBrains 공식 Kotlin 컨벤션과 Android Kotlin 스타일 가이드를 지원합니다.
 */

import { KotlinFormattingConvention, FormattingResult } from '../types/FormattingTypes';

export class KotlinFormatter {
  private convention: KotlinFormattingConvention;

  constructor(convention: KotlinFormattingConvention) {
    this.convention = convention;
  }

  /**
   * Kotlin 코드를 지정된 컨벤션에 따라 포매팅합니다.
   * @param code 포매팅할 Kotlin 코드
   * @returns 포매팅 결과
   */
  public format(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 1. 기본 정규화
      let formattedCode = this.normalizeWhitespace(code);
      
      // 2. import 문 정리
      if (this.convention.organizeImports) {
        formattedCode = this.organizeImports(formattedCode);
      }
      
      // 3. 클래스 및 함수 구조 포매팅
      formattedCode = this.formatClassAndFunctionStructure(formattedCode);
      
      // 4. 함수 및 람다 포매팅
      formattedCode = this.formatFunctionsAndLambdas(formattedCode);
      
      // 5. when 표현식 포매팅
      formattedCode = this.formatWhenExpressions(formattedCode);
      
      // 6. 체이닝 호출 포매팅
      formattedCode = this.formatChainedCalls(formattedCode);
      
      // 7. 타입 어노테이션 포매팅
      formattedCode = this.formatTypeAnnotations(formattedCode);
      
      // 8. 들여쓰기 적용
      formattedCode = this.applyIndentation(formattedCode);
      
      // 9. 중괄호 스타일 적용
      formattedCode = this.applyBraceStyle(formattedCode);
      
      // 10. 공백 규칙 적용
      formattedCode = this.applySpacingRules(formattedCode);
      
      // 11. 최종 정리
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
   * import 문을 정리하고 그룹화합니다.
   */
  private organizeImports(code: string): string {
    const lines = code.split('\n');
    const importLines: string[] = [];
    const nonImportLines: string[] = [];
    let inImportSection = true;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('import ')) {
        importLines.push(trimmedLine);
      } else if (trimmedLine.startsWith('package ') || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        nonImportLines.push(line);
      } else if (trimmedLine === '') {
        if (!inImportSection) {
          nonImportLines.push(line);
        }
      } else {
        inImportSection = false;
        nonImportLines.push(line);
      }
    }

    // import 정렬
    importLines.sort();

    // import 그룹 구성
    const result: string[] = [];
    
    // package 선언 추가
    const packageIndex = nonImportLines.findIndex(line => line.trim().startsWith('package '));
    if (packageIndex >= 0) {
      result.push(...nonImportLines.slice(0, packageIndex + 1));
      result.push('');
    }

    // import 그룹화
    if (importLines.length > 0) {
      if (this.convention.separateImportGroups) {
        // Android imports, Kotlin standard library, third-party, project imports 순으로 그룹화
        const androidImports = importLines.filter(imp => imp.includes('android.') || imp.includes('androidx.'));
        const kotlinImports = importLines.filter(imp => imp.includes('kotlin.') || imp.includes('kotlinx.'));
        const javaImports = importLines.filter(imp => imp.includes('java.') || imp.includes('javax.'));
        const thirdPartyImports = importLines.filter(imp => 
          !imp.includes('android.') && !imp.includes('androidx.') &&
          !imp.includes('kotlin.') && !imp.includes('kotlinx.') &&
          !imp.includes('java.') && !imp.includes('javax.') &&
          (imp.includes('com.') || imp.includes('org.'))
        );
        const projectImports = importLines.filter(imp => 
          !androidImports.includes(imp) && !kotlinImports.includes(imp) &&
          !javaImports.includes(imp) && !thirdPartyImports.includes(imp)
        );

        const importGroups = [androidImports, kotlinImports, javaImports, thirdPartyImports, projectImports]
          .filter(group => group.length > 0);

        importGroups.forEach((group, index) => {
          result.push(...group);
          if (index < importGroups.length - 1) {
            result.push('');
          }
        });
      } else {
        result.push(...importLines);
      }
    }

    // 나머지 코드 추가
    if (importLines.length > 0) {
      result.push('');
    }
    
    const restIndex = packageIndex >= 0 ? packageIndex + 1 : 0;
    result.push(...nonImportLines.slice(restIndex));

    return result.join('\n');
  }

  /**
   * 클래스와 함수 구조를 포매팅합니다.
   */
  private formatClassAndFunctionStructure(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    type LineType = 'class' | 'function' | 'property' | 'other' | 'blank';
    let previousLineType: LineType = 'other';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      let currentLineType: LineType = 'other';

      // 라인 타입 결정
      if (trimmedLine === '') {
        currentLineType = 'blank';
      } else if (this.isClassDeclaration(trimmedLine)) {
        currentLineType = 'class';
      } else if (this.isFunctionDeclaration(trimmedLine)) {
        currentLineType = 'function';
      } else if (this.isPropertyDeclaration(trimmedLine)) {
        currentLineType = 'property';
      } else {
        currentLineType = 'other';
      }

      // 빈 줄 삽입 규칙
      if (currentLineType !== 'blank') {
        if (previousLineType === 'class' && currentLineType !== 'class' && this.convention.blankLinesBetweenClasses > 0) {
          this.addBlankLines(result, this.convention.blankLinesBetweenClasses);
        } else if (previousLineType === 'function' && currentLineType === 'function' && this.convention.blankLinesBetweenMethods > 0) {
          this.addBlankLines(result, this.convention.blankLinesBetweenMethods);
        }
      }

      if (currentLineType !== 'blank' || result[result.length - 1] !== '') {
        result.push(line);
      }

      previousLineType = currentLineType;
    }

    return result.join('\n');
  }

  /**
   * 함수와 람다를 포매팅합니다.
   */
  private formatFunctionsAndLambdas(code: string): string {
    // 함수 괄호 앞 공백 처리
    if (!this.convention.spaceBeforeFunctionParens) {
      code = code.replace(/fun\s+(\w+)\s+\(/g, 'fun $1(');
    } else {
      code = code.replace(/fun\s+(\w+)\(/g, 'fun $1 (');
    }

    // 람다 화살표 주변 공백 처리
    if (this.convention.spaceAroundLambdaArrow) {
      code = code.replace(/(\w+|\))\s*->\s*/g, '$1 -> ');
      code = code.replace(/\{\s*(\w+)\s*->/g, '{ $1 ->');
    } else {
      code = code.replace(/(\w+|\))\s*->\s*/g, '$1->');
      code = code.replace(/\{\s*(\w+)\s*->/g, '{$1->');
    }

    return code;
  }

  /**
   * when 표현식을 포매팅합니다.
   */
  private formatWhenExpressions(code: string): string {
    // when 화살표 주변 공백 처리
    if (this.convention.spaceAroundWhenArrow) {
      code = code.replace(/(\w+|"[^"]*"|\d+)\s*->\s*/g, '$1 -> ');
    } else {
      code = code.replace(/(\w+|"[^"]*"|\d+)\s*->\s*/g, '$1->');
    }

    return code;
  }

  /**
   * 체이닝 호출을 포매팅합니다.
   */
  private formatChainedCalls(code: string): string {
    switch (this.convention.chainedCallWrapping) {
      case 'always':
        // 항상 줄바꿈
        code = code.replace(/(\w+)\./g, '$1\n.');
        break;
      case 'if_long':
        // 긴 경우에만 줄바꿈 (간단한 구현)
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.length > this.convention.maxLineLength && line.includes('.')) {
            lines[i] = line.replace(/(\w+)\./g, '$1\n.');
          }
        }
        code = lines.join('\n');
        break;
      case 'off':
      default:
        // 줄바꿈 하지 않음
        break;
    }

    return code;
  }

  /**
   * 타입 어노테이션을 포매팅합니다.
   */
  private formatTypeAnnotations(code: string): string {
    if (this.convention.spaceAroundTypeColon) {
      // 타입 콜론 주변에 공백 추가
      code = code.replace(/(\w+)\s*:\s*(\w+)/g, '$1: $2');
    } else {
      // 타입 콜론 주변 공백 제거
      code = code.replace(/(\w+)\s*:\s*(\w+)/g, '$1:$2');
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

      // 닫는 중괄호에 대한 들여쓰기 레벨 조정
      if (trimmedLine.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 들여쓰기 적용
      result.push(indentString.repeat(indentLevel) + trimmedLine);

      // 여는 중괄호에 대한 다음 줄 들여쓰기 레벨 조정
      if (trimmedLine.endsWith('{')) {
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
   * 클래스 선언인지 확인합니다.
   */
  private isClassDeclaration(line: string): boolean {
    const classPattern = /^\s*(public|private|internal)?\s*(abstract|final|open)?\s*(class|interface|object|enum class)\s+\w+/;
    return classPattern.test(line);
  }

  /**
   * 함수 선언인지 확인합니다.
   */
  private isFunctionDeclaration(line: string): boolean {
    const functionPattern = /^\s*(public|private|internal|protected)?\s*(override|abstract|final|open)?\s*fun\s+\w+/;
    return functionPattern.test(line);
  }

  /**
   * 프로퍼티 선언인지 확인합니다.
   */
  private isPropertyDeclaration(line: string): boolean {
    const propertyPattern = /^\s*(public|private|internal|protected)?\s*(val|var)\s+\w+/;
    return propertyPattern.test(line);
  }

  /**
   * 빈 줄을 추가합니다.
   */
  private addBlankLines(result: string[], count: number): void {
    for (let i = 0; i < count; i++) {
      if (result[result.length - 1] !== '') {
        result.push('');
      }
    }
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
}