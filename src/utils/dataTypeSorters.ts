export interface DataTypeSortingOptions {
  dataType: 'number' | 'date' | 'version' | 'ip' | 'url' | 'email' | 'uuid' | 'hex' | 'time' | 'filesize';
  sortOrder: 'asc' | 'desc';
  format?: string;
  locale?: string;
}

export class DataTypeSorter {
  // 숫자 정렬 (다양한 형식 지원)
  static sortNumbers(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const numA = this.parseNumber(a);
      const numB = this.parseNumber(b);
      
      const result = numA - numB;
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 날짜 정렬 (다양한 형식 지원)
  static sortDates(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const dateA = this.parseDate(a, options.format);
      const dateB = this.parseDate(b, options.format);
      
      const result = dateA.getTime() - dateB.getTime();
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 버전 정렬 (semantic versioning)
  static sortVersions(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const versionA = this.parseVersion(a);
      const versionB = this.parseVersion(b);
      
      const result = this.compareVersions(versionA, versionB);
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // IP 주소 정렬
  static sortIPAddresses(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const ipA = this.parseIPAddress(a);
      const ipB = this.parseIPAddress(b);
      
      const result = this.compareIPAddresses(ipA, ipB);
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // URL 정렬
  static sortURLs(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const urlA = this.parseURL(a);
      const urlB = this.parseURL(b);
      
      const result = this.compareURLs(urlA, urlB);
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 이메일 정렬
  static sortEmails(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const emailA = this.parseEmail(a);
      const emailB = this.parseEmail(b);
      
      const result = this.compareEmails(emailA, emailB);
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // UUID 정렬
  static sortUUIDs(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const uuidA = this.extractUUID(a);
      const uuidB = this.extractUUID(b);
      
      const result = uuidA.localeCompare(uuidB);
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 16진수 정렬
  static sortHexValues(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const hexA = this.parseHex(a);
      const hexB = this.parseHex(b);
      
      const result = hexA - hexB;
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 시간 정렬
  static sortTimes(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const timeA = this.parseTime(a);
      const timeB = this.parseTime(b);
      
      const result = timeA - timeB;
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 파일 크기 정렬
  static sortFileSizes(lines: string[], options: DataTypeSortingOptions): string[] {
    return lines.sort((a, b) => {
      const sizeA = this.parseFileSize(a);
      const sizeB = this.parseFileSize(b);
      
      const result = sizeA - sizeB;
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  // 헬퍼 메서드들
  private static parseNumber(text: string): number {
    // 다양한 숫자 형식 지원
    const cleanText = text.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanText);
    return isNaN(num) ? 0 : num;
  }

  private static parseDate(text: string, _format?: string): Date {
    // 다양한 날짜 형식 지원
    const datePatterns = [
      /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/, // 한국어 형식
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/ // Month DD, YYYY
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(text);
        } catch {
          continue;
        }
      }
    }

    const parsed = new Date(text);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  private static parseVersion(text: string): number[] {
    const match = text.match(/(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/);
    if (match) {
      return [
        parseInt(match[1]) || 0,
        parseInt(match[2]) || 0,
        parseInt(match[3]) || 0,
        parseInt(match[4]) || 0
      ];
    }
    return [0, 0, 0, 0];
  }

  private static compareVersions(a: number[], b: number[]): number {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const aVal = a[i] || 0;
      const bVal = b[i] || 0;
      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }
    return 0;
  }

  private static parseIPAddress(text: string): number[] {
    const ipMatch = text.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/);
    if (ipMatch) {
      return [
        parseInt(ipMatch[1]),
        parseInt(ipMatch[2]),
        parseInt(ipMatch[3]),
        parseInt(ipMatch[4])
      ];
    }
    return [0, 0, 0, 0];
  }

  private static compareIPAddresses(a: number[], b: number[]): number {
    for (let i = 0; i < 4; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return 0;
  }

  private static parseURL(text: string): { protocol: string; domain: string; path: string } {
    try {
      const url = new URL(text.match(/https?:\/\/[^\s]+/)?.[0] || text);
      return {
        protocol: url.protocol,
        domain: url.hostname,
        path: url.pathname
      };
    } catch {
      return { protocol: '', domain: text, path: '' };
    }
  }

  private static compareURLs(a: any, b: any): number {
    // 도메인 우선 정렬, 그다음 경로
    const domainCompare = a.domain.localeCompare(b.domain);
    if (domainCompare !== 0) return domainCompare;
    return a.path.localeCompare(b.path);
  }

  private static parseEmail(text: string): { local: string; domain: string } {
    const emailMatch = text.match(/([^@\s]+)@([^@\s]+)/);
    if (emailMatch) {
      return {
        local: emailMatch[1],
        domain: emailMatch[2]
      };
    }
    return { local: '', domain: text };
  }

  private static compareEmails(a: any, b: any): number {
    // 도메인 우선 정렬, 그다음 로컬 부분
    const domainCompare = a.domain.localeCompare(b.domain);
    if (domainCompare !== 0) return domainCompare;
    return a.local.localeCompare(b.local);
  }

  private static extractUUID(text: string): string {
    const uuidMatch = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return uuidMatch ? uuidMatch[0] : text;
  }

  private static parseHex(text: string): number {
    const hexMatch = text.match(/#?([0-9a-f]+)/i);
    if (hexMatch) {
      return parseInt(hexMatch[1], 16);
    }
    return 0;
  }

  private static parseTime(text: string): number {
    // HH:MM:SS 또는 HH:MM 형식
    const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  private static parseFileSize(text: string): number {
    const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|PB)/i);
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      
      const multipliers: { [key: string]: number } = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024,
        'PB': 1024 * 1024 * 1024 * 1024 * 1024
      };
      
      return value * (multipliers[unit] || 1);
    }
    
    return parseFloat(text) || 0;
  }

  // 자동 데이터 타입 감지
  static detectDataType(text: string): DataTypeSortingOptions['dataType'] | null {
    // UUID 패턴
    if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text)) {
      return 'uuid';
    }
    
    // IP 주소 패턴
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text)) {
      return 'ip';
    }
    
    // 이메일 패턴
    if (/[^@\s]+@[^@\s]+\.[^@\s]+/.test(text)) {
      return 'email';
    }
    
    // URL 패턴
    if (/https?:\/\//.test(text)) {
      return 'url';
    }
    
    // 버전 패턴
    if (/\d+\.\d+\.\d+/.test(text)) {
      return 'version';
    }
    
    // 16진수 패턴
    if (/#[0-9a-f]{3,8}/i.test(text) || /0x[0-9a-f]+/i.test(text)) {
      return 'hex';
    }
    
    // 시간 패턴
    if (/\d{1,2}:\d{2}(:\d{2})?/.test(text)) {
      return 'time';
    }
    
    // 파일 크기 패턴
    if (/\d+(?:\.\d+)?\s*(B|KB|MB|GB|TB|PB)/i.test(text)) {
      return 'filesize';
    }
    
    // 날짜 패턴
    if (/\d{4}-\d{2}-\d{2}/.test(text) || /\d{2}\/\d{2}\/\d{4}/.test(text) || 
        /\w+\s+\d{1,2},?\s+\d{4}/.test(text)) {
      return 'date';
    }
    
    // 숫자 패턴
    if (/^-?\d+\.?\d*$/.test(text.trim())) {
      return 'number';
    }
    
    return null;
  }

  // 메인 정렬 함수
  static sortByDataType(lines: string[], options: DataTypeSortingOptions): string[] {
    switch (options.dataType) {
      case 'number':
        return this.sortNumbers(lines, options);
      case 'date':
        return this.sortDates(lines, options);
      case 'version':
        return this.sortVersions(lines, options);
      case 'ip':
        return this.sortIPAddresses(lines, options);
      case 'url':
        return this.sortURLs(lines, options);
      case 'email':
        return this.sortEmails(lines, options);
      case 'uuid':
        return this.sortUUIDs(lines, options);
      case 'hex':
        return this.sortHexValues(lines, options);
      case 'time':
        return this.sortTimes(lines, options);
      case 'filesize':
        return this.sortFileSizes(lines, options);
      default:
        return lines;
    }
  }
}