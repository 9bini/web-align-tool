export interface SortingOptions {
  sortType: 'alphabetical' | 'numerical' | 'date' | 'length' | 'custom';
  sortOrder: 'asc' | 'desc';
  dataType: 'auto' | 'string' | 'number' | 'date' | 'json' | 'array' | 'object';
  objectSortKey?: string;
  customPattern?: string;
  preserveComments?: boolean;
  sortByProperty?: string;
  removeEmptyLines?: boolean;
}

export interface ParsedLine {
  original: string;
  content: string;
  isComment: boolean;
  isEmptyLine: boolean;
  parsedData?: any;
  sortValue?: string | number | Date;
}

export class AdvancedSorter {
  static parseLines(text: string, options: SortingOptions): ParsedLine[] {
    const lines = text.split('\n');
    
    return lines.map(line => {
      const trimmed = line.trim();
      const isComment = this.isCommentLine(trimmed);
      const isEmptyLine = trimmed.length === 0;
      
      let parsedData = null;
      let sortValue: string | number | Date = line;
      
      if (!isComment && !isEmptyLine) {
        try {
          // 데이터 타입에 따른 파싱
          switch (options.dataType) {
            case 'json':
              parsedData = this.parseJSON(trimmed);
              sortValue = this.extractSortValue(parsedData, options);
              break;
            case 'array':
              parsedData = this.parseArray(trimmed);
              sortValue = this.extractSortValue(parsedData, options);
              break;
            case 'object':
              parsedData = this.parseObject(trimmed);
              sortValue = this.extractSortValue(parsedData, options);
              break;
            case 'number':
              sortValue = this.parseNumber(trimmed);
              break;
            case 'date':
              sortValue = this.parseDate(trimmed);
              break;
            case 'auto':
              const detected = this.detectDataType(trimmed);
              if (detected.type === 'json' || detected.type === 'object') {
                parsedData = detected.data;
                sortValue = this.extractSortValue(parsedData, options);
              } else if (detected.type === 'date') {
                sortValue = detected.data as Date;
              } else {
                sortValue = detected.data;
              }
              break;
            default:
              sortValue = trimmed;
          }
        } catch (error) {
          // 파싱 실패 시 원본 문자열 사용
          sortValue = trimmed;
        }
      }
      
      return {
        original: line,
        content: trimmed,
        isComment,
        isEmptyLine,
        parsedData,
        sortValue
      };
    });
  }

  static isCommentLine(line: string): boolean {
    const commentPatterns = [
      /^\s*\/\//, // JavaScript single line
      /^\s*\/\*/, // JavaScript multi-line start
      /^\s*\*/, // JavaScript multi-line middle
      /^\s*\*\//, // JavaScript multi-line end
      /^\s*#/, // Python, Shell
      /^\s*<!--/, // HTML
      /^\s*-->/, // HTML end
      /^\s*\/\*\*/, // JSDoc
      /^\s*\*/m, // Multi-line comment continuation
    ];
    
    return commentPatterns.some(pattern => pattern.test(line));
  }

  static parseJSON(text: string): any {
    // JSON 파싱 시도
    try {
      return JSON.parse(text);
    } catch {
      // JSON이 아닌 경우 JavaScript 객체/배열 파싱 시도
      return this.parseJavaScriptObject(text);
    }
  }

  static parseJavaScriptObject(text: string): any {
    try {
      // 안전한 eval을 위해 Function 생성자 사용
      const cleanText = text.replace(/'/g, '"'); // 단일 따옴표를 이중 따옴표로 변환
      return new Function(`return ${cleanText}`)();
    } catch {
      return text;
    }
  }

  static parseArray(text: string): any[] {
    try {
      const parsed = this.parseJSON(text);
      return Array.isArray(parsed) ? parsed : [text];
    } catch {
      // 배열이 아닌 경우 줄 단위로 분할
      return text.split(',').map(item => item.trim());
    }
  }

  static parseObject(text: string): any {
    try {
      const parsed = this.parseJSON(text);
      return typeof parsed === 'object' && parsed !== null ? parsed : { value: text };
    } catch {
      return { value: text };
    }
  }

  static parseNumber(text: string): number {
    const num = parseFloat(text.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  static parseDate(text: string): Date {
    const date = new Date(text);
    return isNaN(date.getTime()) ? new Date(0) : date;
  }

  static detectDataType(text: string): { type: string; data: any } {
    // JSON 객체/배열 감지
    if ((text.startsWith('{') && text.endsWith('}')) || 
        (text.startsWith('[') && text.endsWith(']'))) {
      try {
        const parsed = this.parseJSON(text);
        return { 
          type: Array.isArray(parsed) ? 'array' : 'object', 
          data: parsed 
        };
      } catch {
        return { type: 'string', data: text };
      }
    }

    // 숫자 감지
    if (/^-?\d+\.?\d*$/.test(text.trim())) {
      return { type: 'number', data: this.parseNumber(text) };
    }

    // 날짜 감지
    if (this.isDateString(text)) {
      return { type: 'date', data: this.parseDate(text) };
    }

    return { type: 'string', data: text };
  }

  static isDateString(text: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // M/D/YY or MM/DD/YYYY
      /^\w+ \d{1,2}, \d{4}/, // Month DD, YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(text)) && !isNaN(Date.parse(text));
  }

  static extractSortValue(data: any, options: SortingOptions): any {
    if (data === null || data === undefined) return '';
    
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        // 배열의 경우 길이, 첫 번째 요소, 또는 전체 내용으로 정렬
        switch (options.sortType) {
          case 'length':
            return data.length;
          case 'alphabetical':
            return data.join(',');
          default:
            return data[0] || '';
        }
      } else {
        // 객체의 경우 특정 키로 정렬
        if (options.objectSortKey && data[options.objectSortKey] !== undefined) {
          return data[options.objectSortKey];
        }
        
        // 지정된 키가 없으면 첫 번째 키 사용
        const keys = Object.keys(data);
        if (keys.length > 0) {
          return data[keys[0]];
        }
        
        return JSON.stringify(data);
      }
    }
    
    return data;
  }

  static sortLines(parsedLines: ParsedLine[], options: SortingOptions): ParsedLine[] {
    const comments: ParsedLine[] = [];
    const emptyLines: ParsedLine[] = [];
    const contentLines: ParsedLine[] = [];

    // 라인 분류
    parsedLines.forEach(line => {
      if (line.isComment && options.preserveComments) {
        comments.push(line);
      } else if (line.isEmptyLine && !options.removeEmptyLines) {
        emptyLines.push(line);
      } else if (!line.isComment && !line.isEmptyLine) {
        contentLines.push(line);
      }
    });

    // 내용 라인 정렬
    contentLines.sort((a, b) => {
      let valueA = a.sortValue;
      let valueB = b.sortValue;

      // 정렬 타입에 따른 비교
      let comparison = 0;
      
      switch (options.sortType) {
        case 'numerical':
          const numA = typeof valueA === 'number' ? valueA : this.parseNumber(String(valueA));
          const numB = typeof valueB === 'number' ? valueB : this.parseNumber(String(valueB));
          comparison = numA - numB;
          break;
          
        case 'date':
          const dateA = valueA instanceof Date ? valueA : this.parseDate(String(valueA));
          const dateB = valueB instanceof Date ? valueB : this.parseDate(String(valueB));
          comparison = dateA.getTime() - dateB.getTime();
          break;
          
        case 'length':
          comparison = String(valueA).length - String(valueB).length;
          break;
          
        case 'custom':
          if (options.customPattern) {
            // 정규표현식 매칭 우선순위로 정렬
            const regexA = new RegExp(options.customPattern).test(String(valueA));
            const regexB = new RegExp(options.customPattern).test(String(valueB));
            if (regexA && !regexB) comparison = -1;
            else if (!regexA && regexB) comparison = 1;
            else comparison = String(valueA).localeCompare(String(valueB));
          } else {
            comparison = String(valueA).localeCompare(String(valueB));
          }
          break;
          
        default: // alphabetical
          comparison = String(valueA).localeCompare(String(valueB), undefined, {
            numeric: true,
            sensitivity: 'base'
          });
      }

      return options.sortOrder === 'desc' ? -comparison : comparison;
    });

    // 결과 조합
    const result: ParsedLine[] = [];
    
    if (options.preserveComments) {
      result.push(...comments);
    }
    
    result.push(...contentLines);
    
    if (!options.removeEmptyLines) {
      result.push(...emptyLines);
    }

    return result;
  }

  static formatOutput(sortedLines: ParsedLine[], originalIndentation: boolean = true): string {
    return sortedLines.map(line => {
      if (originalIndentation) {
        return line.original;
      } else {
        return line.content;
      }
    }).join('\n');
  }
}

// 프리셋 정렬 함수들
export const sortingPresets = {
  // JavaScript 객체 속성 정렬
  sortJSObjectProperties: (text: string): string => {
    try {
      const lines = text.split('\n');
      const result: string[] = [];
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('}') || 
            trimmed === '' || AdvancedSorter.isCommentLine(trimmed)) {
          result.push(line);
        } else {
          // 객체 속성 라인인 경우 정렬
          const match = trimmed.match(/^(['"]?)([^'":\s]+)\1\s*:/);
          if (match) {
            result.push(line);
          } else {
            result.push(line);
          }
        }
      });
      
      return result.join('\n');
    } catch {
      return text;
    }
  },

  // CSS 속성 정렬
  sortCSSProperties: (text: string): string => {
    const lines = text.split('\n');
    const result: string[] = [];
    let inCSSBlock = false;
    let cssProperties: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('{')) {
        inCSSBlock = true;
        result.push(line);
      } else if (trimmed.includes('}')) {
        if (cssProperties.length > 0) {
          cssProperties.sort();
          result.push(...cssProperties);
          cssProperties = [];
        }
        inCSSBlock = false;
        result.push(line);
      } else if (inCSSBlock && trimmed.includes(':') && !AdvancedSorter.isCommentLine(trimmed)) {
        cssProperties.push(line);
      } else {
        result.push(line);
      }
    });
    
    return result.join('\n');
  },

  // 배열 요소 정렬
  sortArrayElements: (text: string, sortType: 'alphabetical' | 'numerical' = 'alphabetical'): string => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        if (sortType === 'numerical') {
          parsed.sort((a, b) => {
            const numA = typeof a === 'number' ? a : parseFloat(a);
            const numB = typeof b === 'number' ? b : parseFloat(b);
            return numA - numB;
          });
        } else {
          parsed.sort((a, b) => String(a).localeCompare(String(b)));
        }
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      // JSON이 아닌 경우 라인 단위로 처리
      const lines = text.split('\n');
      const arrayLines = lines.filter(line => 
        !AdvancedSorter.isCommentLine(line.trim()) && 
        line.trim() !== '' &&
        !line.trim().match(/^[\[\]{}]$/)
      );
      
      if (sortType === 'numerical') {
        arrayLines.sort((a, b) => {
          const numA = AdvancedSorter.parseNumber(a);
          const numB = AdvancedSorter.parseNumber(b);
          return numA - numB;
        });
      } else {
        arrayLines.sort((a, b) => a.trim().localeCompare(b.trim()));
      }
      
      return arrayLines.join('\n');
    }
    
    return text;
  }
};