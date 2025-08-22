import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Row,
  Col,
  message,
  Tooltip,
  Tag,
  Badge,
  Switch
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  EditOutlined,
  CheckSquareOutlined,
  SortAscendingOutlined,
  BulbOutlined,
  CodeOutlined,
  CompressOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedDelimiter, setSelectedDelimiter] = useState<string>('/');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [manualLanguage, setManualLanguage] = useState<string>('auto');
  const [smartAlignment, setSmartAlignment] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<'delimiter' | 'json'>('delimiter');

  const detectLanguage = (code: string): string => {
    const text = code.toLowerCase();
    
    // JSON 검사 (가장 먼저)
    if (activeMode === 'json' || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        JSON.parse(text);
        return 'json';
      } catch {
        // JSON이 아니면 계속 진행
      }
    }
    
    if (text.includes('function') || text.includes('const ') || text.includes('let ') || text.includes('var ') || text.includes('=>')) {
      return 'javascript';
    }
    if (text.includes('def ') || text.includes('import ') || text.includes('print(')) {
      return 'python';
    }
    if (text.includes('public class') || text.includes('System.out.println')) {
      return 'java';
    }
    if (text.includes('#include') || text.includes('int main') || text.includes('cout')) {
      return 'cpp';
    }
    if (text.includes('SELECT') || text.includes('FROM') || text.includes('WHERE')) {
      return 'sql';
    }
    if (text.includes('<html>') || text.includes('<div>') || text.includes('<script>')) {
      return 'html';
    }
    if (text.includes('.class') || text.includes('margin:') || text.includes('color:')) {
      return 'css';
    }
    return 'text';
  };

  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      sql: '#336791',
      html: '#e34f26',
      css: '#1572b6',
      json: '#ff6b35',
      text: '#666666'
    };
    return colors[language] || '#666666';
  };

  const getCurrentLanguage = () => {
    return manualLanguage === 'auto' ? detectedLanguage : manualLanguage;
  };

  const tokenizeCode = (code: string, language: string): Array<{text: string, type: string}> => {
    const tokens: Array<{text: string, type: string}> = [];
    
    if (!code.trim()) return tokens;
    
    switch(language) {
      case 'javascript':
        return tokenizeJavaScript(code);
      case 'python':
        return tokenizePython(code);
      case 'java':
        return tokenizeJava(code);
      case 'cpp':
        return tokenizeCpp(code);
      case 'sql':
        return tokenizeSql(code);
      case 'html':
        return tokenizeHtml(code);
      case 'css':
        return tokenizeCss(code);
      case 'json':
        return tokenizeJson(code);
      default:
        return [{ text: code, type: 'text' }];
    }
  };

  const tokenizeJavaScript = (code: string): Array<{text: string, type: string}> => {
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'from', 'as', 'default'];
    const tokens: Array<{text: string, type: string}> = [];
    
    const lines = code.split('\n');
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) tokens.push({ text: '\n', type: 'newline' });
      
      let remaining = line;
      while (remaining.length > 0) {
        // String literals
        if (remaining.match(/^['"`]/)) {
          const quote = remaining[0];
          let i = 1;
          while (i < remaining.length && remaining[i] !== quote) {
            if (remaining[i] === '\\') i++; // Skip escaped characters
            i++;
          }
          if (i < remaining.length) i++; // Include closing quote
          tokens.push({ text: remaining.substring(0, i), type: 'string' });
          remaining = remaining.substring(i);
        }
        // Comments
        else if (remaining.startsWith('//')) {
          tokens.push({ text: remaining, type: 'comment' });
          break;
        }
        // Numbers
        else if (remaining.match(/^\d+(\.\d+)?/)) {
          const match = remaining.match(/^\d+(\.\d+)?/)![0];
          tokens.push({ text: match, type: 'number' });
          remaining = remaining.substring(match.length);
        }
        // Keywords
        else {
          let found = false;
          for (const keyword of keywords) {
            if (remaining.startsWith(keyword) && (remaining.length === keyword.length || !/\w/.test(remaining[keyword.length]))) {
              tokens.push({ text: keyword, type: 'keyword' });
              remaining = remaining.substring(keyword.length);
              found = true;
              break;
            }
          }
          if (!found) {
            tokens.push({ text: remaining[0], type: 'text' });
            remaining = remaining.substring(1);
          }
        }
      }
    });
    
    return tokens;
  };

  const tokenizePython = (code: string): Array<{text: string, type: string}> => {
    const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'import', 'from', 'as', 'return', 'print', 'True', 'False', 'None'];
    return tokenizeGeneric(code, keywords, '#');
  };

  const tokenizeJava = (code: string): Array<{text: string, type: string}> => {
    const keywords = ['public', 'private', 'class', 'static', 'void', 'int', 'String', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'super'];
    return tokenizeGeneric(code, keywords, '//');
  };

  const tokenizeCpp = (code: string): Array<{text: string, type: string}> => {
    const keywords = ['#include', 'int', 'char', 'float', 'double', 'void', 'if', 'else', 'for', 'while', 'return', 'class', 'public', 'private', 'cout', 'cin'];
    return tokenizeGeneric(code, keywords, '//');
  };

  const tokenizeSql = (code: string): Array<{text: string, type: string}> => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ORDER', 'BY', 'GROUP'];
    return tokenizeGeneric(code, keywords, '--');
  };

  const tokenizeHtml = (code: string): Array<{text: string, type: string}> => {
    const tokens: Array<{text: string, type: string}> = [];
    let remaining = code;
    
    while (remaining.length > 0) {
      if (remaining.startsWith('<')) {
        const tagEnd = remaining.indexOf('>');
        if (tagEnd !== -1) {
          tokens.push({ text: remaining.substring(0, tagEnd + 1), type: 'tag' });
          remaining = remaining.substring(tagEnd + 1);
        } else {
          tokens.push({ text: remaining[0], type: 'text' });
          remaining = remaining.substring(1);
        }
      } else {
        const nextTag = remaining.indexOf('<');
        if (nextTag !== -1) {
          tokens.push({ text: remaining.substring(0, nextTag), type: 'text' });
          remaining = remaining.substring(nextTag);
        } else {
          tokens.push({ text: remaining, type: 'text' });
          break;
        }
      }
    }
    
    return tokens;
  };

  const tokenizeCss = (code: string): Array<{text: string, type: string}> => {
    const properties = ['color', 'background', 'margin', 'padding', 'border', 'font', 'width', 'height', 'display', 'position'];
    return tokenizeGeneric(code, properties, '/*', '*/');
  };

  const tokenizeJson = (code: string): Array<{text: string, type: string}> => {
    const tokens: Array<{text: string, type: string}> = [];
    let i = 0;
    
    while (i < code.length) {
      const char = code[i];
      
      // 문자열
      if (char === '"') {
        let str = '"';
        i++;
        while (i < code.length && code[i] !== '"') {
          if (code[i] === '\\' && i + 1 < code.length) {
            str += code[i] + code[i + 1];
            i += 2;
          } else {
            str += code[i];
            i++;
          }
        }
        if (i < code.length) {
          str += '"';
          i++;
        }
        
        // 키인지 값인지 확인 (다음 문자가 :인지 확인)
        let nextNonSpace = i;
        while (nextNonSpace < code.length && /\s/.test(code[nextNonSpace])) {
          nextNonSpace++;
        }
        
        const isKey = nextNonSpace < code.length && code[nextNonSpace] === ':';
        tokens.push({ text: str, type: isKey ? 'key' : 'string' });
        continue;
      }
      
      // 숫자
      if (/\d/.test(char) || (char === '-' && /\d/.test(code[i + 1]))) {
        let num = '';
        if (char === '-') {
          num += char;
          i++;
        }
        while (i < code.length && /[\d.]/.test(code[i])) {
          num += code[i];
          i++;
        }
        tokens.push({ text: num, type: 'number' });
        continue;
      }
      
      // 불린값과 null
      if (code.substring(i, i + 4) === 'true') {
        tokens.push({ text: 'true', type: 'boolean' });
        i += 4;
        continue;
      }
      if (code.substring(i, i + 5) === 'false') {
        tokens.push({ text: 'false', type: 'boolean' });
        i += 5;
        continue;
      }
      if (code.substring(i, i + 4) === 'null') {
        tokens.push({ text: 'null', type: 'null' });
        i += 4;
        continue;
      }
      
      // 특수 문자
      if (/[{}[\]:,]/.test(char)) {
        tokens.push({ text: char, type: 'punctuation' });
        i++;
        continue;
      }
      
      // 기타 (공백 등)
      tokens.push({ text: char, type: 'text' });
      i++;
    }
    
    return tokens;
  };

  const tokenizeGeneric = (code: string, keywords: string[], commentStart: string, commentEnd?: string): Array<{text: string, type: string}> => {
    const tokens: Array<{text: string, type: string}> = [];
    const lines = code.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) tokens.push({ text: '\n', type: 'newline' });
      
      let remaining = line;
      while (remaining.length > 0) {
        // Comments
        if (remaining.startsWith(commentStart)) {
          if (commentEnd) {
            const endIndex = remaining.indexOf(commentEnd);
            if (endIndex !== -1) {
              tokens.push({ text: remaining.substring(0, endIndex + commentEnd.length), type: 'comment' });
              remaining = remaining.substring(endIndex + commentEnd.length);
            } else {
              tokens.push({ text: remaining, type: 'comment' });
              break;
            }
          } else {
            tokens.push({ text: remaining, type: 'comment' });
            break;
          }
        }
        // String literals
        else if (remaining.match(/^['"`]/)) {
          const quote = remaining[0];
          let i = 1;
          while (i < remaining.length && remaining[i] !== quote) {
            if (remaining[i] === '\\') i++;
            i++;
          }
          if (i < remaining.length) i++;
          tokens.push({ text: remaining.substring(0, i), type: 'string' });
          remaining = remaining.substring(i);
        }
        // Numbers
        else if (remaining.match(/^\d+(\.\d+)?/)) {
          const match = remaining.match(/^\d+(\.\d+)?/)![0];
          tokens.push({ text: match, type: 'number' });
          remaining = remaining.substring(match.length);
        }
        // Keywords
        else {
          let found = false;
          for (const keyword of keywords) {
            if (remaining.toLowerCase().startsWith(keyword.toLowerCase()) && 
                (remaining.length === keyword.length || !/\w/.test(remaining[keyword.length]))) {
              tokens.push({ text: remaining.substring(0, keyword.length), type: 'keyword' });
              remaining = remaining.substring(keyword.length);
              found = true;
              break;
            }
          }
          if (!found) {
            tokens.push({ text: remaining[0], type: 'text' });
            remaining = remaining.substring(1);
          }
        }
      }
    });
    
    return tokens;
  };

  const smartSplit = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    // 줄의 시작 부분에서 콤마나 다른 구분자로 시작하는 경우 처리
    let trimmedLine = line.trim();
    if (trimmedLine.startsWith(delimiter)) {
      trimmedLine = trimmedLine.substring(delimiter.length).trim();
    }
    
    for (let i = 0; i < trimmedLine.length; i++) {
      const char = trimmedLine[i];
      const remaining = trimmedLine.substring(i);
      
      // 따옴표 처리
      if ((char === '"' || char === "'" || char === '`') && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      }
      // 따옴표 안에서는 구분자 무시
      else if (inQuotes) {
        current += char;
      }
      // 구분자 발견
      else if (remaining.startsWith(delimiter)) {
        // 시간 패턴 보호 (HH:MM:SS, HH:MM, YYYY-MM-DD HH:MM:SS)
        if (delimiter === ':') {
          // 더 정교한 시간 패턴 감지
          const timePattern1 = current.match(/(\d{1,2})$/);
          const timePattern2 = remaining.match(/^:(\d{1,2})/);
          const dateTimePattern = current.match(/(\d{4}-\d{2}-\d{2}\s+\d{1,2})$/);
          
          if ((timePattern1 && timePattern2) || dateTimePattern) {
            // 시간 패턴이므로 분할하지 않음
            current += char;
            continue;
          }
        }
        
        // 비어있지 않은 내용만 추가
        if (current.trim()) {
          result.push(current.trim());
        }
        current = '';
        i += delimiter.length - 1; // 다중 문자 구분자 처리
      } else {
        current += char;
      }
    }
    
    // 마지막 내용 추가
    if (current.trim()) {
      result.push(current.trim());
    }
    
    return result;
  };

  const getTokenColor = (type: string): string => {
    // VS Code Dark Theme 스타일 색상
    const colors: { [key: string]: string } = {
      keyword: '#569CD6',    // Light Blue (var, function, class)
      string: '#CE9178',     // Light Orange (strings)
      comment: '#6A9955',    // Green (comments)
      number: '#B5CEA8',     // Light Green (numbers)
      tag: '#92C5F8',        // Light Blue (HTML tags)
      key: '#9CDCFE',        // Light Blue (JSON keys)
      boolean: '#569CD6',    // Light Blue (true, false)
      null: '#569CD6',       // Light Blue (null)
      punctuation: '#D4D4D4', // Light Gray (brackets, commas)
      text: '#D4D4D4',       // Light Gray (default text)
      newline: 'transparent'
    };
    return colors[type] || '#D4D4D4';
  };

  const formatWithLanguageRules = (alignedLines: string[], language: string): string[] => {
    if (language === 'javascript' || language === 'java' || language === 'cpp') {
      return alignedLines.map((line) => {
        const trimmed = line.trim();
        
        // 빈 줄은 그대로 두기
        if (!trimmed) return '';
        
        // 주석만 있는 줄은 그대로 (불필요한 주석 제거)
        if (trimmed.match(/^\/\/\s*$/)) {
          return ''; // 빈 주석 제거
        }
        
        // 중괄호나 세미콜론만 있는 줄은 들여쓰기 없이
        if (trimmed === '{' || trimmed === '}' || trimmed === '};') {
          return trimmed;
        }
        
        // 콤마로 시작하는 줄은 들여쓰기 적용
        if (trimmed.startsWith(',') || (trimmed.includes(':') && !trimmed.match(/^\w+\s*\{/))) {
          return '    ' + trimmed; // 4스페이스 들여쓰기
        }
        
        return trimmed;
      });
    }
    
    return alignedLines;
  };

  const sortByDelimiter = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      // 모든 줄을 유지 (빈 줄 포함)
      const lines = inputCode.split('\n');
      
      // 빈 줄이 아닌 줄만 정렬 대상으로 하기
      const nonEmptyLines = lines.filter(line => line.trim() !== '');
      
      if (nonEmptyLines.length === 0) {
        message.warning('정렬할 내용이 없습니다.');
        setIsProcessing(false);
        return;
      }

      // 선택된 구분자로 분할하여 컬럼으로 나눔
      // /를 //로 변환 후 분할 (오직 /를 선택했을 때만)
      const processedLines = selectedDelimiter === '/' ? 
        nonEmptyLines.map(line => line.replace(/\//g, '//')) : nonEmptyLines;
      
      const rows = processedLines.map(line => {
        if (smartAlignment) {
          return smartSplit(line, selectedDelimiter);
        } else {
          // 기본 분할
          if (selectedDelimiter === '//' || selectedDelimiter.length > 1) {
            return line.split(selectedDelimiter).map(col => col.trim());
          }
          return line.split(selectedDelimiter).map(col => col.trim());
        }
      });
      
      // 최대 컬럼 수 계산
      const maxCols = Math.max(...rows.map(row => row.length));
      
      // 각 컬럼의 최대 너비 계산 (개선된 방식)
      const colWidths: number[] = [];
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        let maxWidth = 0;
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const cellContent = rows[rowIndex][colIndex] || '';
          // 마지막 컬럼이 아니고 내용이 있는 경우만 너비 계산
          if (colIndex < maxCols - 1 && cellContent.trim()) {
            maxWidth = Math.max(maxWidth, cellContent.length);
          }
        }
        colWidths[colIndex] = maxWidth;
      }
      
      // 각 행을 가독성 있게 정렬하여 재구성
      const alignedLines = rows.map(row => {
        const alignedRow = [];
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
          const cellContent = row[colIndex] || '';
          
          if (colIndex === 0) {
            // 첫 번째 컬럼: 왜쪽 정렬
            alignedRow.push(cellContent.padEnd(colWidths[colIndex], ' '));
          } else if (colIndex === maxCols - 1) {
            // 마지막 컬럼: 패딩 없이
            alignedRow.push(cellContent);
          } else {
            // 중간 컬럼: 왜쪽 정렬
            alignedRow.push(cellContent.padEnd(colWidths[colIndex], ' '));
          }
        }
        
        // 구분자 주변에 적절한 공백 추가
        let result = alignedRow[0];
        for (let i = 1; i < alignedRow.length; i++) {
          if (selectedDelimiter === ',' || selectedDelimiter === ';') {
            // 콤마나 세미콜론의 경우 앞에 공백 없이
            result += selectedDelimiter + ' ' + alignedRow[i];
          } else {
            // 다른 구분자는 앞뒤에 공백
            result += ' ' + selectedDelimiter + ' ' + alignedRow[i];
          }
        }
        
        return result;
      });
      
      // 빈 줄 처리 및 언어별 포매팅 적용
      const finalLines: string[] = [];
      let alignedIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '') {
          // 빈 줄은 그대로 유지
          finalLines.push('');
        } else {
          // 비어있지 않은 줄은 정렬된 결과 사용
          if (alignedIndex < alignedLines.length) {
            finalLines.push(alignedLines[alignedIndex]);
            alignedIndex++;
          }
        }
      }
      
      // 언어별 포매팅 적용
      const formattedLines = formatWithLanguageRules(finalLines, getCurrentLanguage());
      
      setOutputCode(formattedLines.join('\n'));
      message.success(`${selectedDelimiter} 구분자 기준 컬럼 정렬 완료!`);
    } catch (error) {
      message.error('정렬 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const prettifyJson = () => {
    if (!inputCode.trim()) {
      message.warning('JSON을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = JSON.parse(inputCode);
      const prettified = JSON.stringify(parsed, null, 2);
      setOutputCode(prettified);
      message.success('JSON 포맷 정리 완료!');
    } catch (error) {
      message.error('유효하지 않은 JSON 형식입니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const minifyJson = () => {
    if (!inputCode.trim()) {
      message.warning('JSON을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const parsed = JSON.parse(inputCode);
      const minified = JSON.stringify(parsed);
      setOutputCode(minified);
      message.success('JSON 압축 완료!');
    } catch (error) {
      message.error('유효하지 않은 JSON 형식입니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('클립보드에 복사되었습니다.');
    } catch (err) {
      message.error('복사에 실패했습니다.');
    }
  };

  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
    setDetectedLanguage('');
    message.info('모든 내용이 지워졌습니다.');
  };

  const handleInputChange = (value: string) => {
    setInputCode(value);
    const language = detectLanguage(value);
    setDetectedLanguage(language);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      if (e.shiftKey) {
        // Shift+Tab: 들여쓰기 제거
        const lines = value.split('\n');
        const startLineIndex = value.substring(0, start).split('\n').length - 1;
        const endLineIndex = value.substring(0, end).split('\n').length - 1;
        
        let newValue = '';
        let newStart = start;
        let newEnd = end;
        let removedChars = 0;
        
        lines.forEach((line, index) => {
          if (index >= startLineIndex && index <= endLineIndex) {
            if (line.startsWith('    ')) {
              // 4개 공백 제거
              const newLine = line.substring(4);
              newValue += newLine;
              if (index === startLineIndex) newStart = Math.max(0, start - 4);
              if (index <= endLineIndex) removedChars += 4;
            } else if (line.startsWith('\t')) {
              // 탭 문자 제거
              const newLine = line.substring(1);
              newValue += newLine;
              if (index === startLineIndex) newStart = Math.max(0, start - 1);
              if (index <= endLineIndex) removedChars += 1;
            } else {
              newValue += line;
            }
          } else {
            newValue += line;
          }
          
          if (index < lines.length - 1) {
            newValue += '\n';
          }
        });
        
        newEnd = end - removedChars;
        
        setInputCode(newValue);
        
        // 커서 위치 복원
        setTimeout(() => {
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
        
      } else {
        // Tab: 들여쓰기 추가
        if (start !== end) {
          // 여러 줄 선택된 경우
          const lines = value.split('\n');
          const startLineIndex = value.substring(0, start).split('\n').length - 1;
          const endLineIndex = value.substring(0, end).split('\n').length - 1;
          
          let newValue = '';
          let addedChars = 0;
          
          lines.forEach((line, index) => {
            if (index >= startLineIndex && index <= endLineIndex) {
              newValue += '    ' + line; // 4개 공백 추가
              addedChars += 4;
            } else {
              newValue += line;
            }
            
            if (index < lines.length - 1) {
              newValue += '\n';
            }
          });
          
          setInputCode(newValue);
          
          // 커서 위치 조정
          setTimeout(() => {
            textarea.setSelectionRange(start + 4, end + addedChars);
          }, 0);
          
        } else {
          // 단일 위치에 탭 삽입
          const newValue = value.substring(0, start) + '    ' + value.substring(end);
          setInputCode(newValue);
          
          // 커서 위치 조정
          setTimeout(() => {
            textarea.setSelectionRange(start + 4, start + 4);
          }, 0);
        }
      }
      
      // 언어 감지 업데이트
      const language = detectLanguage(inputCode);
      setDetectedLanguage(language);
    }
    
    // Ctrl+A: 전체 선택
    else if (e.ctrlKey && e.key === 'a') {
      // 기본 동작 사용
    }
    
    // Ctrl+/ or Cmd+/: 주석 토글
    else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const lines = value.split('\n');
      
      const startLineIndex = value.substring(0, start).split('\n').length - 1;
      const endLineIndex = value.substring(0, end).split('\n').length - 1;
      
      let newValue = '';
      let newStart = start;
      let newEnd = end;
      let addedChars = 0;
      
      lines.forEach((line, index) => {
        if (index >= startLineIndex && index <= endLineIndex) {
          if (line.trim().startsWith('//')) {
            // 주석 제거
            const uncommented = line.replace(/^(\s*)\/\/\s?/, '$1');
            newValue += uncommented;
            const removedChars = line.length - uncommented.length;
            if (index === startLineIndex) newStart = Math.max(0, start - removedChars);
            if (index <= endLineIndex) addedChars -= removedChars;
          } else {
            // 주석 추가
            const indentMatch = line.match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            const content = line.substring(indent.length);
            const commented = indent + '// ' + content;
            newValue += commented;
            const addedCharsInLine = commented.length - line.length;
            if (index === startLineIndex) newStart = start + addedCharsInLine;
            if (index <= endLineIndex) addedChars += addedCharsInLine;
          }
        } else {
          newValue += line;
        }
        
        if (index < lines.length - 1) {
          newValue += '\n';
        }
      });
      
      newEnd = end + addedChars;
      
      setInputCode(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(newStart, newEnd);
      }, 0);
      
      const language = detectLanguage(newValue);
      setDetectedLanguage(language);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SortAscendingOutlined style={{ 
              color: '#1890ff', 
              fontSize: '28px', 
              marginRight: '12px' 
            }} />
            <Title level={3} style={{ 
              color: '#262626', 
              margin: 0,
              fontWeight: 600
            }}>
              {activeMode === 'delimiter' ? '스마트 코드 정렬기' : 'JSON 포맷터'}
            </Title>
          </div>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                {/* 모드 선택 버튼들 */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#666' }}>
                    작업 모드:
                  </div>
                  <Space wrap>
                    <Button 
                      type={activeMode === 'delimiter' ? 'primary' : 'default'}
                      onClick={() => {
                        setActiveMode('delimiter');
                        setInputCode('');
                        setOutputCode('');
                      }}
                      size="middle"
                      icon={<SortAscendingOutlined />}
                    >
                      컬럼 정렬
                    </Button>
                    <Button 
                      type={activeMode === 'json' ? 'primary' : 'default'}
                      onClick={() => {
                        setActiveMode('json');
                        setInputCode('');
                        setOutputCode('');
                        setManualLanguage('json');
                      }}
                      size="middle"
                      icon={<CodeOutlined />}
                    >
                      JSON 포맷터
                    </Button>
                  </Space>
                </div>

                {/* 구분자 선택 버튼들 (컬럼 정렬 모드일 때만) */}
                {activeMode === 'delimiter' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#666' }}>
                    구분자 선택:
                  </div>
                  <Space wrap>
                    <Button 
                      type={selectedDelimiter === '/' ? 'primary' : 'default'}
                      onClick={() => setSelectedDelimiter('/')}
                      size="middle"
                    >
                      / → //
                    </Button>
                    <Button 
                      type={selectedDelimiter === '//' ? 'primary' : 'default'}
                      onClick={() => setSelectedDelimiter('//')}
                      size="middle"
                    >
                      //
                    </Button>
                    <Button 
                      type={selectedDelimiter === ':' ? 'primary' : 'default'}
                      onClick={() => setSelectedDelimiter(':')}
                      size="middle"
                    >
                      :
                    </Button>
                    <Button 
                      type={selectedDelimiter === ',' ? 'primary' : 'default'}
                      onClick={() => setSelectedDelimiter(',')}
                      size="middle"
                    >
                      ,
                    </Button>
                  </Space>
                </div>
                )}

                {/* 언어 선택 버튼들 (컬럼 정렬 모드일 때만) */}
                {activeMode === 'delimiter' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#666' }}>
                    언어 선택:
                  </div>
                  <Space wrap>
                    <Button 
                      type={manualLanguage === 'auto' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('auto')}
                      size="small"
                    >
                      자동
                    </Button>
                    <Button 
                      type={manualLanguage === 'javascript' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('javascript')}
                      size="small"
                    >
                      JavaScript
                    </Button>
                    <Button 
                      type={manualLanguage === 'python' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('python')}
                      size="small"
                    >
                      Python
                    </Button>
                    <Button 
                      type={manualLanguage === 'java' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('java')}
                      size="small"
                    >
                      Java
                    </Button>
                    <Button 
                      type={manualLanguage === 'cpp' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('cpp')}
                      size="small"
                    >
                      C++
                    </Button>
                    <Button 
                      type={manualLanguage === 'sql' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('sql')}
                      size="small"
                    >
                      SQL
                    </Button>
                    <Button 
                      type={manualLanguage === 'html' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('html')}
                      size="small"
                    >
                      HTML
                    </Button>
                    <Button 
                      type={manualLanguage === 'css' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('css')}
                      size="small"
                    >
                      CSS
                    </Button>
                    <Button 
                      type={manualLanguage === 'text' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('text')}
                      size="small"
                    >
                      Text
                    </Button>
                    <Button 
                      type={manualLanguage === 'json' ? 'primary' : 'default'}
                      onClick={() => setManualLanguage('json')}
                      size="small"
                    >
                      JSON
                    </Button>
                  </Space>
                </div>
                )}

                {/* 실행 버튼들 */}
                <div style={{ textAlign: 'center' }}>
                  {activeMode === 'delimiter' && (
                    <Space size="middle">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BulbOutlined style={{ color: smartAlignment ? '#1890ff' : '#999' }} />
                        <Switch 
                          checked={smartAlignment}
                          onChange={setSmartAlignment}
                          size="small"
                        />
                        <span style={{ fontSize: '12px', color: '#666' }}>스마트 정렬</span>
                      </div>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<SortAscendingOutlined />}
                        onClick={sortByDelimiter}
                        loading={isProcessing}
                        style={{ minWidth: '150px' }}
                      >
                        컬럼 정렬
                      </Button>
                    </Space>
                  )}
                  
                  {activeMode === 'json' && (
                    <Space size="middle">
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<CodeOutlined />}
                        onClick={prettifyJson}
                        loading={isProcessing}
                        style={{ minWidth: '150px' }}
                      >
                        JSON 정리
                      </Button>
                      <Button 
                        size="large"
                        icon={<CompressOutlined />}
                        onClick={minifyJson}
                        loading={isProcessing}
                        style={{ minWidth: '150px' }}
                      >
                        JSON 압축
                      </Button>
                    </Space>
                  )}
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <EditOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    입력 텍스트
                    {getCurrentLanguage() && (
                      <Badge 
                        color={getLanguageColor(getCurrentLanguage())}
                        text={getCurrentLanguage().toUpperCase()}
                        style={{ marginLeft: '12px' }}
                      />
                    )}
                  </span>
                  <Tag color="green">{inputCode.split('\n').length} 줄</Tag>
                </div>
              }
              extra={
                <Button size="small" onClick={clearAll} icon={<ClearOutlined />}>
                  지우기
                </Button>
              }
              style={{ height: '100%' }}
            >
              <div style={{ 
                height: '500px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                overflow: 'hidden', 
                position: 'relative',
                background: '#1e1e1e' // 다크 에디터 스타일
              }}>
                {/* 라인 넘버 */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '50px',
                  background: '#252526',
                  borderRight: '1px solid #333',
                  padding: '11px 8px',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#858585',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                  textAlign: 'right',
                  userSelect: 'none',
                  overflow: 'hidden',
                  zIndex: 3
                }}>
                  {inputCode.split('\n').map((_, index) => (
                    <div key={index} style={{ height: '20.8px' }}>
                      {index + 1}
                    </div>
                  ))}
                </div>
                
                {/* 구문 강조 오버레이 */}
                {inputCode ? (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '51px',
                    right: 0,
                    bottom: 0,
                    padding: '11px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    background: 'transparent',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    pointerEvents: 'none',
                    zIndex: 1,
                    color: '#d4d4d4' // 기본 텍스트 색상
                  }}>
                    {tokenizeCode(inputCode, getCurrentLanguage()).map((token, index) => (
                      <span 
                        key={index}
                        style={{ 
                          color: getTokenColor(token.type),
                          fontWeight: token.type === 'keyword' ? 'bold' : 'normal'
                        }}
                      >
                        {token.text}
                      </span>
                    ))}
                  </div>
                ) : null}
                
                {/* 매인 입력 영역 */}
                <TextArea
                  value={inputCode}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeMode === 'delimiter' 
                    ? `구분자를 포함한 텍스트/코드를 입력하세요...

예시:
var config = {
    pardiv : 'periodBtn',
    periodType : "event"
};

function test() {
    return 'hello';
}

SELECT * FROM users WHERE age > 18

ℹ️ Tab: 들여쓰기 | Shift+Tab: 들여쓰기 제거`
                    : `JSON 데이터를 입력하세요...

예시:
{
  "name": "John",
  "age": 30,
  "items": ["apple", "banana"],
  "address": {
    "city": "Seoul",
    "country": "Korea"
  }
}

또는:

[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]`}
                  style={{ 
                    height: '100%',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: 'none',
                    background: inputCode ? 'transparent' : '#1e1e1e',
                    color: inputCode ? 'transparent' : '#858585',
                    zIndex: 2,
                    position: 'relative',
                    caretColor: '#ffffff',
                    paddingLeft: '62px', // 라인 넘버 공간 확보
                    resize: 'none'
                  }}
                  bordered={false}
                  autoSize={false}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <CheckSquareOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    {activeMode === 'delimiter' ? '정렬 결과' : 'JSON 포맷 결과'}
                  </span>
                  <Space>
                    <Tag color="blue">{outputCode.split('\n').length} 줄</Tag>
                    <Tooltip title="클립보드에 복사">
                      <Button 
                        type="text" 
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(outputCode)}
                        disabled={!outputCode}
                        style={{ color: '#1890ff' }}
                      />
                    </Tooltip>
                  </Space>
                </div>
              }
              style={{ height: '100%' }}
            >
              <div style={{ 
                height: '500px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                overflow: 'hidden',
                background: '#1e1e1e',
                position: 'relative'
              }}>
                {outputCode ? (
                  <div style={{
                    position: 'relative',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    {/* 라인 넘버 */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '50px',
                      background: '#252526',
                      borderRight: '1px solid #333',
                      padding: '16px 8px',
                      fontSize: '12px',
                      lineHeight: '1.6',
                      color: '#858585',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                      textAlign: 'right',
                      userSelect: 'none',
                      overflow: 'hidden',
                      zIndex: 1
                    }}>
                      {outputCode.split('\n').map((_, index) => (
                        <div key={index} style={{ height: '20.8px' }}>
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    
                    {/* 코드 내용 */}
                    <pre style={{
                      margin: 0,
                      padding: '16px',
                      paddingLeft: '62px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                      background: 'transparent',
                      color: '#d4d4d4',
                      height: '100%',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {outputCode.split('\n').map((line, index) => (
                        <div key={index} style={{ minHeight: '20.8px' }}>
                          {getCurrentLanguage() && getCurrentLanguage() !== 'text' ? (
                            tokenizeCode(line, getCurrentLanguage()).map((token, tokenIndex) => (
                              <span 
                                key={tokenIndex}
                                style={{ 
                                  color: getTokenColor(token.type),
                                  fontWeight: token.type === 'keyword' ? 'bold' : 'normal'
                                }}
                              >
                                {token.text}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#d4d4d4' }}>{line || '\u00A0'}</span>
                          )}
                        </div>
                      ))}
                    </pre>
                  </div>
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#1e1e1e',
                    color: '#858585',
                    fontSize: '14px',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <SortAscendingOutlined style={{ fontSize: '24px' }} />
                    <div>{activeMode === 'delimiter' ? '컬럼 정렬된 결과가 여기에 표시됩니다' : 'JSON 포맷된 결과가 여기에 표시됩니다'}</div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;