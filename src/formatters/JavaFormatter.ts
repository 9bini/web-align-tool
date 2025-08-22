/**
 * Java 언어를 위한 코드 포매터
 * Google Java Style, Oracle Java Style 등 다양한 컨벤션을 지원합니다.
 */

import { JavaFormattingConvention, FormattingResult } from '../types/FormattingTypes';

export class JavaFormatter {
  private convention: JavaFormattingConvention;

  constructor(convention: JavaFormattingConvention) {
    this.convention = convention;
  }

  /**
   * Java 코드를 지정된 컨벤션에 따라 포매팅합니다.
   * @param code 포매팅할 Java 코드
   * @returns 포매팅 결과
   */
  public format(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 1. 기본 정규화 (공백, 개행 정리)
      let formattedCode = this.normalizeWhitespace(code);
      
      // 2. import 문 정리
      if (this.convention.organizeImports) {
        formattedCode = this.organizeImports(formattedCode);
      }
      
      // 3. 클래스 및 메서드 구조 포매팅
      formattedCode = this.formatClassStructure(formattedCode);
      
      // 4. 메서드 내부 코드 포매팅
      formattedCode = this.formatMethodBodies(formattedCode);
      
      // 5. 들여쓰기 적용
      formattedCode = this.applyIndentation(formattedCode);
      
      // 6. 중괄호 스타일 적용
      formattedCode = this.applyBraceStyle(formattedCode);
      
      // 7. 공백 규칙 적용
      formattedCode = this.applySpacingRules(formattedCode);
      
      // 8. 최종 정리
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
    const staticImportLines: string[] = [];
    const nonImportLines: string[] = [];
    let inImportSection = true;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('import static ')) {
        staticImportLines.push(trimmedLine);
      } else if (trimmedLine.startsWith('import ')) {
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
    staticImportLines.sort();
    importLines.sort();

    // import 그룹 구성
    const result: string[] = [];
    
    // package 및 주석 추가
    const packageIndex = nonImportLines.findIndex(line => line.trim().startsWith('package '));
    if (packageIndex >= 0) {
      result.push(...nonImportLines.slice(0, packageIndex + 1));
      result.push('');
    }

    // static import 추가
    if (staticImportLines.length > 0) {
      result.push(...staticImportLines);
      if (this.convention.separateStaticImports && importLines.length > 0) {
        result.push('');
      }
    }

    // 일반 import 추가
    if (importLines.length > 0) {
      // 그룹화 (java.*, javax.*, org.*, com.*, 기타)
      const javaImports = importLines.filter(imp => imp.includes('java.'));
      const javaxImports = importLines.filter(imp => imp.includes('javax.'));
      const orgImports = importLines.filter(imp => imp.includes('org.'));
      const comImports = importLines.filter(imp => imp.includes('com.'));
      const otherImports = importLines.filter(imp => 
        !imp.includes('java.') && !imp.includes('javax.') && 
        !imp.includes('org.') && !imp.includes('com.')
      );

      const importGroups = [javaImports, javaxImports, orgImports, comImports, otherImports]
        .filter(group => group.length > 0);

      if (this.convention.separateImportGroups) {
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
    if (importLines.length > 0 || staticImportLines.length > 0) {
      result.push('');
    }
    
    const restIndex = packageIndex >= 0 ? packageIndex + 1 : 0;
    result.push(...nonImportLines.slice(restIndex));

    return result.join('\n');
  }

  /**
   * 클래스와 메서드 구조를 포매팅합니다.
   */
  private formatClassStructure(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    type LineType = 'class' | 'method' | 'field' | 'other' | 'blank';
    let previousLineType: LineType = 'other';
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      let currentLineType: LineType = 'other';

      // 중괄호 깊이 추적
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      // 라인 타입 결정
      if (trimmedLine === '') {
        currentLineType = 'blank';
      } else if (braceDepth <= 1 && (trimmedLine.includes('class ') || trimmedLine.includes('interface ') || trimmedLine.includes('enum '))) {
        currentLineType = 'class';
      } else if (braceDepth <= 2 && this.isMethodDeclaration(trimmedLine)) {
        currentLineType = 'method';
      } else if (braceDepth <= 2 && this.isFieldDeclaration(trimmedLine)) {
        currentLineType = 'field';
      } else {
        currentLineType = 'other';
      }

      // 빈 줄 삽입 규칙
      if (currentLineType !== 'blank') {
        if (previousLineType === 'class' && currentLineType !== 'class' && this.convention.blankLinesBetweenClasses > 0) {
          this.addBlankLines(result, this.convention.blankLinesBetweenClasses);
        } else if (previousLineType === 'method' && currentLineType === 'method' && this.convention.blankLinesBetweenMethods > 0) {
          this.addBlankLines(result, this.convention.blankLinesBetweenMethods);
        } else if (previousLineType !== 'blank' && currentLineType === 'method' && this.convention.blankLinesBetweenMethods > 0) {
          this.addBlankLines(result, this.convention.blankLinesBetweenMethods);
        }
      }

      // 어노테이션 처리
      if (trimmedLine.startsWith('@') && this.convention.blankLineAfterAnnotations) {
        result.push(line);
        if (i + 1 < lines.length && !lines[i + 1].trim().startsWith('@')) {
          result.push('');
        }
      } else if (currentLineType !== 'blank' || result[result.length - 1] !== '') {
        result.push(line);
      }

      previousLineType = currentLineType;
    }

    return result.join('\n');
  }

  /**
   * 메서드 내부 코드를 포매팅합니다.
   */
  private formatMethodBodies(code: string): string {
    // 메서드 내부의 기본적인 포매팅 규칙 적용
    // 실제 구현에서는 더 복잡한 파싱이 필요하지만, 여기서는 기본적인 규칙만 적용
    
    // if/for/while 문 포매팅
    code = code.replace(/\b(if|for|while|switch)\s*\(/g, (_, keyword) => {
      return this.convention.spaceBeforeControlParens ? `${keyword} (` : `${keyword}(`;
    });

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

      // 중괄호에 따른 들여쓰기 레벨 조정
      if (trimmedLine.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 들여쓰기 적용
      result.push(indentString.repeat(indentLevel) + trimmedLine);

      // 다음 줄을 위한 들여쓰기 레벨 조정
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
      // 다른 스타일들도 필요시 구현
    }
    return code;
  }

  /**
   * 공백 규칙을 적용합니다.
   */
  private applySpacingRules(code: string): string {
    if (this.convention.spaceAroundOperators) {
      // 연산자 주변에 공백 추가
      code = code.replace(/([^=!<>])([=!<>]=?)([^=])/g, '$1 $2 $3');
      code = code.replace(/([^+\-*/])([+\-*/])([^=])/g, '$1 $2 $3');
    }

    if (!this.convention.spaceBeforeMethodParens) {
      // 메서드 괄호 앞 공백 제거
      code = code.replace(/(\w+)\s+\(/g, '$1(');
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

    // 줄 길이 체크 및 경고
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > this.convention.maxLineLength) {
        // 실제로는 warnings 배열에 추가해야 함
        console.warn(`Line ${index + 1} exceeds maximum length of ${this.convention.maxLineLength} characters`);
      }
    });

    return code;
  }

  /**
   * 메서드 선언인지 확인합니다.
   */
  private isMethodDeclaration(line: string): boolean {
    // 간단한 메서드 선언 패턴 매칭
    const methodPattern = /^\s*(public|private|protected)?\s*(static)?\s*(final)?\s*\w+\s+\w+\s*\([^)]*\)/;
    return methodPattern.test(line);
  }

  /**
   * 필드 선언인지 확인합니다.
   */
  private isFieldDeclaration(line: string): boolean {
    // 간단한 필드 선언 패턴 매칭
    const fieldPattern = /^\s*(public|private|protected)?\s*(static)?\s*(final)?\s*\w+\s+\w+\s*(=.*)?;?$/;
    return fieldPattern.test(line);
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