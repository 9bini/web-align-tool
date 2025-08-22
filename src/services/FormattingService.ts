/**
 * 통합 포매팅 서비스
 * 모든 언어의 포매팅 기능을 통합 관리하고 프리셋 컨벤션을 제공합니다.
 */

import { 
  SupportedLanguage, 
  FormattingConvention, 
  FormattingResult,
  PresetConvention,
  IdeExportResult,
  IdeExportFormat,
  JavaFormattingConvention,
  JsonFormattingConvention,
  JavaScriptFormattingConvention,
  KotlinFormattingConvention,
  SqlFormattingConvention
} from '../types/FormattingTypes';

import { 
  ALL_PRESETS, 
  PRESETS_BY_LANGUAGE, 
  POPULAR_PRESETS, 
  OFFICIAL_PRESETS 
} from '../constants/PresetConventions';

import { JavaFormatter } from '../formatters/JavaFormatter';
import { JsonFormatter } from '../formatters/JsonFormatter';
import { JavaScriptFormatter } from '../formatters/JavaScriptFormatter';
import { KotlinFormatter } from '../formatters/KotlinFormatter';
import { SqlFormatter } from '../formatters/SqlFormatter';
import { IdeExporter } from '../utils/IdeExporter';

/**
 * 포매팅 서비스 메인 클래스
 * 모든 언어와 포매팅 옵션을 통합 관리합니다.
 */
export class FormattingService {
  
  /**
   * 지정된 언어와 컨벤션으로 코드를 포매팅합니다.
   * @param code 포매팅할 코드
   * @param language 프로그래밍 언어
   * @param convention 포매팅 컨벤션
   * @returns 포매팅 결과
   */
  public static formatCode(
    code: string, 
    language: SupportedLanguage, 
    convention: FormattingConvention
  ): FormattingResult {
    try {
      // 입력 검증
      if (!code || code.trim() === '') {
        return {
          formattedCode: code,
          changedLines: 0,
          warnings: ['입력된 코드가 비어있습니다.'],
          errors: [],
          processingTime: 0
        };
      }

      // 언어별 포매터 생성 및 실행
      switch (language) {
        case 'java':
          const javaFormatter = new JavaFormatter(convention as JavaFormattingConvention);
          return javaFormatter.format(code);
          
        case 'json':
          const jsonFormatter = new JsonFormatter(convention as JsonFormattingConvention);
          return jsonFormatter.format(code);
          
        case 'javascript':
          const jsFormatter = new JavaScriptFormatter(convention as JavaScriptFormattingConvention);
          return jsFormatter.format(code);
          
        case 'kotlin':
          const kotlinFormatter = new KotlinFormatter(convention as KotlinFormattingConvention);
          return kotlinFormatter.format(code);
          
        case 'sql':
          const sqlFormatter = new SqlFormatter(convention as SqlFormattingConvention);
          return sqlFormatter.format(code);
          
        default:
          throw new Error(`지원되지 않는 언어입니다: ${language}`);
      }
    } catch (error) {
      return {
        formattedCode: code,
        changedLines: 0,
        warnings: [],
        errors: [`포매팅 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`],
        processingTime: 0
      };
    }
  }

  /**
   * JSON을 압축합니다 (한 줄로)
   * @param code JSON 코드
   * @returns 압축된 JSON 결과
   */
  public static minifyJson(code: string): FormattingResult {
    const jsonFormatter = new JsonFormatter({
      name: 'JSON Minifier',
      description: 'JSON 압축 도구',
      indentationType: 'space',
      indentSize: 0,
      maxLineLength: 0,
      insertFinalNewline: false,
      trimTrailingWhitespace: true,
      quoteStyle: 'double',
      trailingComma: false,
      arrayWrapThreshold: 999,
      objectWrapThreshold: 999,
      autoWrapNested: false,
      sortKeys: false
    });
    
    return jsonFormatter.minify(code);
  }

  /**
   * JSON을 정리합니다 (기본 2 스페이스 들여쓰기)
   * @param code JSON 코드
   * @returns 정리된 JSON 결과
   */
  public static prettifyJson(code: string): FormattingResult {
    const jsonFormatter = new JsonFormatter({
      name: 'JSON Prettifier',
      description: 'JSON 정리 도구',
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
    });
    
    return jsonFormatter.prettify(code);
  }

  /**
   * SQL을 압축합니다
   * @param code SQL 코드
   * @returns 압축된 SQL 결과
   */
  public static minifySql(code: string): FormattingResult {
    const sqlFormatter = new SqlFormatter({
      name: 'SQL Minifier',
      description: 'SQL 압축 도구',
      indentationType: 'space',
      indentSize: 0,
      maxLineLength: 0,
      insertFinalNewline: false,
      trimTrailingWhitespace: true,
      keywordCase: 'upper',
      identifierCase: 'preserve',
      commaPosition: 'trailing',
      selectColumnsOnNewLine: false,
      whereConditionsOnNewLine: false,
      joinOnNewLine: false,
      indentSubqueries: false,
      functionArgWrapThreshold: 999,
      insertValuesOnNewLine: false
    });
    
    return sqlFormatter.minify(code);
  }

  /**
   * 구분자 기반 컬럼 정렬 (기존 기능 유지)
   * @param code 정렬할 텍스트
   * @param delimiter 구분자 (기본값: '/')
   * @returns 정렬 결과
   */
  public static alignByDelimiter(code: string, delimiter: string = '/'): FormattingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      const lines = code.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        warnings.push('정렬할 내용이 없습니다.');
        return {
          formattedCode: code,
          changedLines: 0,
          warnings,
          errors,
          processingTime: Date.now() - startTime
        };
      }

      // 각 행을 구분자로 분할하여 컬럼으로 나눔
      const rows = lines.map(line => line.split(delimiter).map(col => col.trim()));
      
      // 최대 컬럼 수 계산
      const maxCols = Math.max(...rows.map(row => row.length));
      
      // 각 컬럼의 최대 너비 계산
      const colWidths: number[] = [];
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        let maxWidth = 0;
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const cellContent = rows[rowIndex][colIndex] || '';
          maxWidth = Math.max(maxWidth, cellContent.length);
        }
        colWidths[colIndex] = maxWidth;
      }
      
      // 각 행을 가독성 있게 정렬하여 재구성
      const alignedLines = rows.map(row => {
        const alignedRow = [];
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
          const cellContent = row[colIndex] || '';
          if (colIndex === maxCols - 1) {
            // 마지막 컬럼은 패딩하지 않음
            alignedRow.push(cellContent);
          } else {
            // 왼쪽 정렬로 패딩
            alignedRow.push(cellContent.padEnd(colWidths[colIndex], ' '));
          }
        }
        return alignedRow.join(` ${delimiter} `);
      });
      
      const formattedCode = alignedLines.join('\n');
      const originalLines = code.split('\n');
      const newLines = formattedCode.split('\n');
      const changedLines = this.countChangedLines(originalLines, newLines);

      return {
        formattedCode,
        changedLines,
        warnings,
        errors,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      errors.push(`정렬 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
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
   * 모든 프리셋 컨벤션을 반환합니다.
   * @returns 모든 프리셋 컨벤션 배열
   */
  public static getAllPresets(): PresetConvention[] {
    return ALL_PRESETS;
  }

  /**
   * 특정 언어의 프리셋 컨벤션을 반환합니다.
   * @param language 프로그래밍 언어
   * @returns 해당 언어의 프리셋 컨벤션 배열
   */
  public static getPresetsByLanguage(language: SupportedLanguage): PresetConvention[] {
    return PRESETS_BY_LANGUAGE[language] || [];
  }

  /**
   * 인기 있는 프리셋 컨벤션을 반환합니다.
   * @returns 인기순으로 정렬된 프리셋 컨벤션 배열
   */
  public static getPopularPresets(): PresetConvention[] {
    return POPULAR_PRESETS;
  }

  /**
   * 공식 프리셋 컨벤션을 반환합니다.
   * @returns 공식 프리셋 컨벤션 배열
   */
  public static getOfficialPresets(): PresetConvention[] {
    return OFFICIAL_PRESETS;
  }

  /**
   * 프리셋 ID로 특정 프리셋을 찾습니다.
   * @param presetId 프리셋 ID
   * @returns 해당 프리셋 또는 undefined
   */
  public static getPresetById(presetId: string): PresetConvention | undefined {
    return ALL_PRESETS.find(preset => preset.id === presetId);
  }

  /**
   * 컨벤션을 IDE 설정 파일로 내보냅니다.
   * @param convention 포매팅 컨벤션
   * @param language 프로그래밍 언어
   * @param format IDE 형식
   * @returns IDE 설정 파일 결과
   */
  public static exportToIde(
    convention: FormattingConvention,
    language: SupportedLanguage,
    format: IdeExportFormat
  ): IdeExportResult {
    return IdeExporter.exportToIde(convention, language, format);
  }

  /**
   * 특정 언어가 지원하는 IDE 형식 목록을 반환합니다.
   * @param language 프로그래밍 언어
   * @returns 지원되는 IDE 형식 배열
   */
  public static getSupportedIdeFormats(language: SupportedLanguage): IdeExportFormat[] {
    return IdeExporter.getSupportedFormats(language);
  }

  /**
   * 지원되는 모든 언어 목록을 반환합니다.
   * @returns 지원되는 언어 배열
   */
  public static getSupportedLanguages(): SupportedLanguage[] {
    return ['java', 'json', 'javascript', 'kotlin', 'sql'];
  }

  /**
   * 언어의 표시명을 반환합니다.
   * @param language 프로그래밍 언어
   * @returns 언어 표시명
   */
  public static getLanguageDisplayName(language: SupportedLanguage): string {
    const displayNames: Record<SupportedLanguage, string> = {
      java: 'Java',
      json: 'JSON',
      javascript: 'JavaScript/TypeScript',
      kotlin: 'Kotlin',
      sql: 'SQL'
    };
    
    return displayNames[language] || language;
  }

  /**
   * 언어별 예시 코드를 반환합니다.
   * @param language 프로그래밍 언어
   * @returns 예시 코드
   */
  public static getExampleCode(language: SupportedLanguage): string {
    const examples: Record<SupportedLanguage, string> = {
      java: `public class HelloWorld {
    private static final String MESSAGE = "Hello, World!";
    
    public static void main(String[] args) {
        System.out.println(MESSAGE);
        for(int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
    
    private void exampleMethod(){
        if(true){
            doSomething();
        }
    }
}`,

      json: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^2.0.20"
  }
}`,

      javascript: `const express = require('express');
const app = express();

function calculateSum(a,b){
return a+b;
}

app.get('/api/users',(req,res)=>{
const users=[
{id:1,name:'John'},
{id:2,name:'Jane'}
];
res.json(users);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
console.log(\`Server running on port \${PORT}\`);
});`,

      kotlin: `package com.example.demo

import kotlin.random.Random

class UserService{
private val users=mutableListOf<User>()

fun addUser(name:String,email:String):User{
val user=User(
id=Random.nextInt(),
name=name,
email=email
)
users.add(user)
return user
}

fun findUserById(id:Int):User?{
return users.find{it.id==id}
}
}

data class User(val id:Int,val name:String,val email:String)`,

      sql: `SELECT u.id,u.name,u.email,COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>5 ORDER BY order_count DESC,u.name ASC;

INSERT INTO products(name,price,category_id,description) VALUES('Laptop',999.99,1,'High-performance laptop'),('Mouse',29.99,2,'Wireless optical mouse'),('Keyboard',79.99,2,'Mechanical gaming keyboard');

UPDATE users SET last_login=NOW(),login_count=login_count+1 WHERE id=123 AND active=1;`
    };
    
    return examples[language] || '';
  }

  /**
   * 변경된 줄 수를 계산합니다.
   * @param originalLines 원본 줄 배열
   * @param formattedLines 포매팅된 줄 배열
   * @returns 변경된 줄 수
   */
  private static countChangedLines(originalLines: string[], formattedLines: string[]): number {
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
   * 포매팅 결과를 병합합니다.
   * @param results 포매팅 결과 배열
   * @returns 병합된 포매팅 결과
   */
  public static mergeResults(results: FormattingResult[]): FormattingResult {
    if (results.length === 0) {
      return {
        formattedCode: '',
        changedLines: 0,
        warnings: [],
        errors: [],
        processingTime: 0
      };
    }

    if (results.length === 1) {
      return results[0];
    }

    return {
      formattedCode: results[results.length - 1].formattedCode,
      changedLines: results.reduce((sum, result) => sum + result.changedLines, 0),
      warnings: results.flatMap(result => result.warnings),
      errors: results.flatMap(result => result.errors),
      processingTime: results.reduce((sum, result) => sum + result.processingTime, 0)
    };
  }
}