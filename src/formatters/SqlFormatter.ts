/**
 * SQL 언어 포매터
 * 다양한 SQL 방언과 포매팅 스타일을 지원합니다.
 */

import { SqlFormattingConvention, FormattingResult } from '../types/FormattingTypes';

export class SqlFormatter {
  private convention: SqlFormattingConvention;
  private readonly sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
    'ALTER', 'INDEX', 'TABLE', 'DATABASE', 'SCHEMA', 'VIEW', 'PROCEDURE', 'FUNCTION',
    'TRIGGER', 'CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'NOT NULL',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'AS', 'DISTINCT', 'ALL', 'ANY', 'SOME', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM',
    'DECLARE', 'SET', 'IF', 'WHILE', 'FOR', 'CURSOR', 'OPEN', 'FETCH', 'CLOSE'
  ];

  constructor(convention: SqlFormattingConvention) {
    this.convention = convention;
  }

  /**
   * SQL 코드를 지정된 컨벤션에 따라 포매팅합니다.
   * @param code 포매팅할 SQL 코드
   * @returns 포매팅 결과
   */
  public format(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 1. 기본 정규화
      let formattedCode = this.normalizeWhitespace(code);
      
      // 2. 키워드 대소문자 적용
      formattedCode = this.applyKeywordCase(formattedCode);
      
      // 3. 식별자 대소문자 적용
      formattedCode = this.applyIdentifierCase(formattedCode);
      
      // 4. SELECT 문 포매팅
      formattedCode = this.formatSelectStatements(formattedCode);
      
      // 5. INSERT 문 포매팅
      formattedCode = this.formatInsertStatements(formattedCode);
      
      // 6. UPDATE/DELETE 문 포매팅
      formattedCode = this.formatUpdateDeleteStatements(formattedCode);
      
      // 7. JOIN 문 포매팅
      formattedCode = this.formatJoinStatements(formattedCode);
      
      // 8. WHERE 절 포매팅
      formattedCode = this.formatWhereClause(formattedCode);
      
      // 9. 함수 호출 포매팅
      formattedCode = this.formatFunctionCalls(formattedCode);
      
      // 10. 서브쿼리 포매팅
      formattedCode = this.formatSubqueries(formattedCode);
      
      // 11. 쉼표 위치 조정
      formattedCode = this.adjustCommaPosition(formattedCode);
      
      // 12. 들여쓰기 적용
      formattedCode = this.applyIndentation(formattedCode);
      
      // 13. 최종 정리
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
    // 탭을 스페이스로 변환
    if (this.convention.indentationType === 'space') {
      code = code.replace(/\t/g, ' '.repeat(this.convention.indentSize));
    }
    
    // 줄 끝 공백 제거
    if (this.convention.trimTrailingWhitespace) {
      code = code.replace(/[ \t]+$/gm, '');
    }
    
    // 여러 연속된 공백을 하나로 정리
    code = code.replace(/[ \t]+/g, ' ');
    
    // 여러 연속된 빈 줄을 하나로 정리
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return code;
  }

  /**
   * SQL 키워드의 대소문자를 적용합니다.
   */
  private applyKeywordCase(code: string): string {
    for (const keyword of this.sqlKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      
      code = code.replace(regex, () => {
        switch (this.convention.keywordCase) {
          case 'upper':
            return keyword.toUpperCase();
          case 'lower':
            return keyword.toLowerCase();
          case 'capitalize':
            return keyword.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          default:
            return keyword;
        }
      });
    }
    
    return code;
  }

  /**
   * 식별자(테이블명, 컬럼명)의 대소문자를 적용합니다.
   */
  private applyIdentifierCase(code: string): string {
    if (this.convention.identifierCase === 'preserve') {
      return code;
    }

    // 간단한 식별자 패턴 매칭 (실제로는 더 정교한 파싱이 필요)
    const identifierPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    
    return code.replace(identifierPattern, (match) => {
      // SQL 키워드는 제외
      if (this.sqlKeywords.some(keyword => keyword.toLowerCase() === match.toLowerCase())) {
        return match;
      }
      
      switch (this.convention.identifierCase) {
        case 'upper':
          return match.toUpperCase();
        case 'lower':
          return match.toLowerCase();
        default:
          return match;
      }
    });
  }

  /**
   * SELECT 문을 포매팅합니다.
   */
  private formatSelectStatements(code: string): string {
    if (this.convention.selectColumnsOnNewLine) {
      // SELECT 다음에 컬럼들을 각각 새로운 줄에 배치
      code = code.replace(/SELECT\s+(.*?)\s+FROM/gis, (match, columns) => {
        const columnList = columns.split(',').map((col: string) => col.trim());
        if (columnList.length > 1) {
          const formattedColumns = columnList.join(',\n    ');
          return `SELECT\n    ${formattedColumns}\nFROM`;
        }
        return match;
      });
    }
    
    return code;
  }

  /**
   * INSERT 문을 포매팅합니다.
   */
  private formatInsertStatements(code: string): string {
    if (this.convention.insertValuesOnNewLine) {
      // INSERT VALUES 절을 새로운 줄에 배치
      code = code.replace(/INSERT\s+INTO\s+(.*?)\s+VALUES\s*\(/gis, (_, table) => {
        return `INSERT INTO ${table.trim()}\nVALUES (`;
      });
    }
    
    return code;
  }

  /**
   * UPDATE/DELETE 문을 포매팅합니다.
   */
  private formatUpdateDeleteStatements(code: string): string {
    // UPDATE SET 절 포매팅
    code = code.replace(/UPDATE\s+(.*?)\s+SET\s+(.*?)\s+WHERE/gis, (_, table, setClause) => {
      const assignments = setClause.split(',').map((assignment: string) => assignment.trim());
      if (assignments.length > 1) {
        const formattedAssignments = assignments.join(',\n    ');
        return `UPDATE ${table.trim()}\nSET\n    ${formattedAssignments}\nWHERE`;
      }
      return `UPDATE ${table.trim()}\nSET ${setClause.trim()}\nWHERE`;
    });
    
    return code;
  }

  /**
   * JOIN 문을 포매팅합니다.
   */
  private formatJoinStatements(code: string): string {
    if (this.convention.joinOnNewLine) {
      // JOIN을 새로운 줄에 배치
      const joinKeywords = ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'];
      
      for (const joinKeyword of joinKeywords) {
        const regex = new RegExp(`\\s+(${joinKeyword})\\s+`, 'gis');
        code = code.replace(regex, `\n${joinKeyword} `);
      }
    }
    
    return code;
  }

  /**
   * WHERE 절을 포매팅합니다.
   */
  private formatWhereClause(code: string): string {
    if (this.convention.whereConditionsOnNewLine) {
      // WHERE 조건들을 각각 새로운 줄에 배치
      code = code.replace(/WHERE\s+(.*?)(?=\s+(?:GROUP BY|ORDER BY|HAVING|$))/gis, (match, conditions) => {
        // AND/OR로 구분된 조건들을 분리
        const conditionList = conditions.split(/\s+(AND|OR)\s+/i);
        if (conditionList.length > 2) {
          let formatted = 'WHERE ' + conditionList[0].trim();
          for (let i = 1; i < conditionList.length; i += 2) {
            const operator = conditionList[i];
            const condition = conditionList[i + 1];
            formatted += `\n  ${operator} ${condition.trim()}`;
          }
          return formatted;
        }
        return match;
      });
    }
    
    return code;
  }

  /**
   * 함수 호출을 포매팅합니다.
   */
  private formatFunctionCalls(code: string): string {
    // 함수 인자가 많은 경우 줄바꿈
    const functionPattern = /(\w+)\s*\(\s*([^)]+)\s*\)/g;
    
    return code.replace(functionPattern, (match, functionName, args) => {
      const argList = args.split(',');
      
      if (argList.length > this.convention.functionArgWrapThreshold) {
        const formattedArgs = argList.map((arg: string) => '    ' + arg.trim()).join(',\n');
        return `${functionName}(\n${formattedArgs}\n)`;
      }
      
      return match;
    });
  }

  /**
   * 서브쿼리를 포매팅합니다.
   */
  private formatSubqueries(code: string): string {
    if (this.convention.indentSubqueries) {
      // 서브쿼리 들여쓰기 (간단한 구현)
      code = code.replace(/\(\s*SELECT/gi, '(\n    SELECT');
      code = code.replace(/\)\s*([,\s])/g, '\n)$1');
    }
    
    return code;
  }

  /**
   * 쉼표 위치를 조정합니다.
   */
  private adjustCommaPosition(code: string): string {
    if (this.convention.commaPosition === 'leading') {
      // 쉼표를 앞으로 이동
      code = code.replace(/,\s*\n\s*/g, '\n, ');
    } else {
      // 쉼표를 뒤에 유지 (기본값)
      code = code.replace(/\n\s*,\s*/g, ',\n');
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

      // 들여쓰기 레벨 조정
      if (trimmedLine.startsWith(')') || trimmedLine.includes('END')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 들여쓰기 적용
      result.push(indentString.repeat(indentLevel) + trimmedLine);

      // 다음 줄을 위한 들여쓰기 레벨 조정
      if (trimmedLine.endsWith('(') || 
          trimmedLine.toUpperCase().includes('CASE') ||
          trimmedLine.toUpperCase().includes('BEGIN')) {
        indentLevel++;
      }
    }

    return result.join('\n');
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

    // 줄 길이 체크
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > this.convention.maxLineLength) {
        console.warn(`Line ${index + 1} exceeds maximum length of ${this.convention.maxLineLength} characters`);
      }
    });

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
   * SQL 쿼리를 압축합니다 (한 줄로)
   */
  public minify(code: string): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // 주석 제거
      let minifiedCode = code.replace(/--.*$/gm, '');
      minifiedCode = minifiedCode.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // 여러 공백을 하나로 정리
      minifiedCode = minifiedCode.replace(/\s+/g, ' ');
      
      // 앞뒤 공백 제거
      minifiedCode = minifiedCode.trim();

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
      errors.push(`SQL 압축 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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