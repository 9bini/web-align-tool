export interface LanguageSortingOptions {
  language: 'javascript' | 'python' | 'css' | 'html' | 'json' | 'yaml' | 'xml' | 'sql' | 'markdown';
  sortImports?: boolean;
  sortCSSSProperties?: boolean;
  sortHTMLAttributes?: boolean;
  sortJSONKeys?: boolean;
  preserveComments?: boolean;
  sortFunctions?: boolean;
  sortClasses?: boolean;
}

export class LanguageSpecificSorter {
  // JavaScript 코드 정렬
  static sortJavaScript(code: string, options: LanguageSortingOptions): string {
    const lines = code.split('\n');
    const result: string[] = [];
    let currentSection: string[] = [];
    let inImportSection = false;
    let inObjectLiteral = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Import 구문 처리
      if (options.sortImports && (trimmed.startsWith('import ') || trimmed.startsWith('const ') && trimmed.includes('require('))) {
        if (!inImportSection) {
          if (currentSection.length > 0) {
            result.push(...currentSection);
            currentSection = [];
          }
          inImportSection = true;
        }
        currentSection.push(line);
      } else if (inImportSection && trimmed === '') {
        currentSection.push(line);
      } else {
        if (inImportSection) {
          // Import 구문들을 정렬
          const imports = currentSection.filter(l => l.trim() !== '');
          const emptyLines = currentSection.filter(l => l.trim() === '');
          
          imports.sort((a, b) => {
            const aPath = this.extractImportPath(a);
            const bPath = this.extractImportPath(b);
            
            // 상대 경로는 마지막에
            if (aPath.startsWith('.') && !bPath.startsWith('.')) return 1;
            if (!aPath.startsWith('.') && bPath.startsWith('.')) return -1;
            
            return aPath.localeCompare(bPath);
          });
          
          result.push(...imports);
          result.push(...emptyLines);
          
          currentSection = [];
          inImportSection = false;
        }
        
        // 객체 리터럴 속성 정렬
        if (trimmed.includes('{')) {
          braceCount += (trimmed.match(/{/g) || []).length;
          if (braceCount === 1) inObjectLiteral = true;
        }
        
        if (inObjectLiteral && this.isObjectProperty(trimmed)) {
          currentSection.push(line);
        } else {
          if (inObjectLiteral && currentSection.length > 0) {
            // 객체 속성들을 정렬
            currentSection.sort((a, b) => {
              const keyA = this.extractObjectKey(a);
              const keyB = this.extractObjectKey(b);
              return keyA.localeCompare(keyB);
            });
            result.push(...currentSection);
            currentSection = [];
          }
          
          result.push(line);
        }
        
        if (trimmed.includes('}')) {
          braceCount -= (trimmed.match(/}/g) || []).length;
          if (braceCount === 0) inObjectLiteral = false;
        }
      }
    }

    if (currentSection.length > 0) {
      if (inImportSection && options.sortImports) {
        const imports = currentSection.filter(l => l.trim() !== '');
        imports.sort((a, b) => {
          const aPath = this.extractImportPath(a);
          const bPath = this.extractImportPath(b);
          return aPath.localeCompare(bPath);
        });
        result.push(...imports);
      } else {
        result.push(...currentSection);
      }
    }

    return result.join('\n');
  }

  // Python 코드 정렬
  static sortPython(code: string, options: LanguageSortingOptions): string {
    const lines = code.split('\n');
    const result: string[] = [];
    let currentSection: string[] = [];
    let inImportSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (options.sortImports && (trimmed.startsWith('import ') || trimmed.startsWith('from '))) {
        if (!inImportSection) {
          if (currentSection.length > 0) {
            result.push(...currentSection);
            currentSection = [];
          }
          inImportSection = true;
        }
        currentSection.push(line);
      } else if (inImportSection && trimmed === '') {
        currentSection.push(line);
      } else {
        if (inImportSection) {
          // Python import 구문 정렬
          const imports = currentSection.filter(l => l.trim() !== '');
          const emptyLines = currentSection.filter(l => l.trim() === '');
          
          imports.sort((a, b) => {
            const aType = a.trim().startsWith('from ') ? 1 : 0;
            const bType = b.trim().startsWith('from ') ? 1 : 0;
            
            if (aType !== bType) return aType - bType;
            
            const aModule = this.extractPythonModule(a);
            const bModule = this.extractPythonModule(b);
            
            // 표준 라이브러리는 먼저
            const aIsStdlib = this.isPythonStdlib(aModule);
            const bIsStdlib = this.isPythonStdlib(bModule);
            
            if (aIsStdlib && !bIsStdlib) return -1;
            if (!aIsStdlib && bIsStdlib) return 1;
            
            return aModule.localeCompare(bModule);
          });
          
          result.push(...imports);
          result.push(...emptyLines);
          
          currentSection = [];
          inImportSection = false;
        }
        
        result.push(line);
      }
    }

    if (currentSection.length > 0 && inImportSection && options.sortImports) {
      const imports = currentSection.filter(l => l.trim() !== '');
      imports.sort();
      result.push(...imports);
    }

    return result.join('\n');
  }

  // CSS 코드 정렬
  static sortCSS(code: string, options: LanguageSortingOptions): string {
    if (!options.sortCSSSProperties) return code;

    const lines = code.split('\n');
    const result: string[] = [];
    let currentRule: string[] = [];
    let inRule = false;
    let braceCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('{')) {
        braceCount++;
        if (braceCount === 1) {
          inRule = true;
          result.push(line);
          continue;
        }
      }

      if (inRule && this.isCSSProperty(trimmed)) {
        currentRule.push(line);
      } else {
        if (inRule && currentRule.length > 0) {
          // CSS 속성 정렬
          currentRule.sort((a, b) => {
            const propA = this.extractCSSProperty(a);
            const propB = this.extractCSSProperty(b);
            return propA.localeCompare(propB);
          });
          result.push(...currentRule);
          currentRule = [];
        }
        result.push(line);
      }

      if (trimmed.includes('}')) {
        braceCount--;
        if (braceCount === 0) {
          inRule = false;
        }
      }
    }

    return result.join('\n');
  }

  // HTML 코드 정렬
  static sortHTML(code: string, options: LanguageSortingOptions): string {
    if (!options.sortHTMLAttributes) return code;

    return code.replace(/<([^>]+)>/g, (match, content) => {
      if (!content.includes(' ')) return match;

      const parts = content.split(' ');
      const tagName = parts[0];
      const attributes = parts.slice(1).filter((attr: string) => attr.trim() !== '');

      if (attributes.length === 0) return match;

      // 속성 정렬 (id, class를 앞에)
      attributes.sort((a: string, b: string) => {
        const getAttrPriority = (attr: string) => {
          if (attr.startsWith('id=')) return 0;
          if (attr.startsWith('class=')) return 1;
          return 2;
        };

        const priorityA = getAttrPriority(a);
        const priorityB = getAttrPriority(b);

        if (priorityA !== priorityB) return priorityA - priorityB;

        return a.localeCompare(b);
      });

      return `<${tagName} ${attributes.join(' ')}>`;
    });
  }

  // JSON 코드 정렬
  static sortJSON(code: string, options: LanguageSortingOptions): string {
    if (!options.sortJSONKeys) return code;

    try {
      const parsed = JSON.parse(code);
      const sorted = this.sortObjectKeysRecursively(parsed);
      return JSON.stringify(sorted, null, 2);
    } catch {
      return code;
    }
  }

  // SQL 코드 정렬
  static sortSQL(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    let currentClause: string[] = [];
    let inSelectClause = false;

    for (const line of lines) {
      const trimmed = line.trim().toUpperCase();
      const originalLine = line;

      if (trimmed.startsWith('SELECT ')) {
        if (currentClause.length > 0) {
          result.push(...currentClause);
          currentClause = [];
        }
        inSelectClause = true;
        currentClause.push(originalLine);
      } else if (inSelectClause && (
        trimmed.startsWith('FROM ') || 
        trimmed.startsWith('WHERE ') || 
        trimmed.startsWith('GROUP BY ') ||
        trimmed.startsWith('ORDER BY ')
      )) {
        // SELECT 절의 컬럼들을 정렬
        if (currentClause.length > 1) {
          const selectLine = currentClause[0];
          const columns = currentClause.slice(1);
          
          // 컬럼 정렬
          columns.sort((a, b) => {
            const colA = a.trim().replace(/,$/, '');
            const colB = b.trim().replace(/,$/, '');
            return colA.localeCompare(colB);
          });
          
          result.push(selectLine);
          result.push(...columns);
        } else {
          result.push(...currentClause);
        }
        
        currentClause = [originalLine];
        inSelectClause = false;
      } else {
        currentClause.push(originalLine);
      }
    }

    if (currentClause.length > 0) {
      result.push(...currentClause);
    }

    return result.join('\n');
  }

  // 마크다운 정렬
  static sortMarkdown(code: string): string {
    const lines = code.split('\n');
    const result: string[] = [];
    let currentSection: string[] = [];
    let inListSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // 리스트 항목 정렬
      if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) {
        if (!inListSection) {
          if (currentSection.length > 0) {
            result.push(...currentSection);
            currentSection = [];
          }
          inListSection = true;
        }
        currentSection.push(line);
      } else if (inListSection && trimmed === '') {
        currentSection.push(line);
      } else {
        if (inListSection) {
          // 리스트 항목들을 정렬
          const listItems = currentSection.filter(l => l.trim() !== '');
          const emptyLines = currentSection.filter(l => l.trim() === '');
          
          listItems.sort((a, b) => {
            const textA = a.replace(/^[-*+]\s|\d+\.\s/, '').trim();
            const textB = b.replace(/^[-*+]\s|\d+\.\s/, '').trim();
            return textA.localeCompare(textB);
          });
          
          result.push(...listItems);
          result.push(...emptyLines);
          
          currentSection = [];
          inListSection = false;
        }
        
        result.push(line);
      }
    }

    return result.join('\n');
  }

  // 헬퍼 메서드들
  private static extractImportPath(line: string): string {
    const match = line.match(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/);
    return match ? (match[1] || match[2] || match[3]) : '';
  }

  private static extractPythonModule(line: string): string {
    const match = line.match(/from\s+(\S+)|import\s+(\S+)/);
    return match ? (match[1] || match[2]).split('.')[0] : '';
  }

  private static isPythonStdlib(module: string): boolean {
    const stdlibModules = [
      'os', 'sys', 'json', 'datetime', 'collections', 'itertools', 
      'functools', 'operator', 're', 'math', 'random', 'typing'
    ];
    return stdlibModules.includes(module);
  }

  private static isObjectProperty(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.includes(':') && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
  }

  private static extractObjectKey(line: string): string {
    const match = line.match(/^\s*(['"]?)([^'":\s]+)\1\s*:/);
    return match ? match[2] : '';
  }

  private static isCSSProperty(line: string): boolean {
    return line.includes(':') && line.includes(';') && !line.trim().startsWith('/*');
  }

  private static extractCSSProperty(line: string): string {
    const match = line.match(/^\s*([^:]+):/);
    return match ? match[1].trim() : '';
  }

  private static sortObjectKeysRecursively(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeysRecursively(item));
    } else if (obj !== null && typeof obj === 'object') {
      const sorted: any = {};
      const keys = Object.keys(obj).sort();
      
      for (const key of keys) {
        sorted[key] = this.sortObjectKeysRecursively(obj[key]);
      }
      
      return sorted;
    }
    
    return obj;
  }
}