/**
 * IDE 설정 파일 내보내기 유틸리티
 * 다양한 IDE와 도구에 포매팅 컨벤션을 적용할 수 있도록 설정 파일을 생성합니다.
 */

import { 
  FormattingConvention, 
  IdeExportResult, 
  IdeExportFormat, 
  SupportedLanguage,
  JavaFormattingConvention,
  JsonFormattingConvention,
  JavaScriptFormattingConvention,
  KotlinFormattingConvention,
} from '../types/FormattingTypes';

export class IdeExporter {
  
  /**
   * 지정된 형식으로 IDE 설정 파일을 내보냅니다.
   * @param convention 포매팅 컨벤션
   * @param language 프로그래밍 언어
   * @param format 내보낼 IDE 형식
   * @returns IDE 설정 파일 내용과 적용 방법
   */
  public static exportToIde(
    convention: FormattingConvention, 
    language: SupportedLanguage, 
    format: IdeExportFormat
  ): IdeExportResult {
    switch (format) {
      case 'vscode':
        return this.exportToVsCode(convention, language);
      case 'intellij':
        return this.exportToIntelliJ(convention, language);
      case 'eclipse':
        return this.exportToEclipse(convention, language);
      case 'prettier':
        return this.exportToPrettier(convention, language);
      case 'eslint':
        return this.exportToEslint(convention, language);
      case 'editorconfig':
        return this.exportToEditorConfig(convention, language);
      default:
        throw new Error(`지원되지 않는 IDE 형식: ${format}`);
    }
  }

  /**
   * Visual Studio Code 설정으로 내보냅니다.
   */
  private static exportToVsCode(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    const settings: any = {
      [`[${this.getLanguageId(language)}]`]: {
        "editor.insertSpaces": convention.indentationType === 'space',
        "editor.tabSize": convention.indentSize,
        "editor.rulers": [convention.maxLineLength],
        "files.insertFinalNewline": convention.insertFinalNewline,
        "files.trimTrailingWhitespace": convention.trimTrailingWhitespace,
      }
    };

    // 언어별 특화 설정
    if (language === 'javascript' || language === 'json') {
      const jsConvention = convention as JavaScriptFormattingConvention | JsonFormattingConvention;
      if ('quoteStyle' in jsConvention) {
        settings[`[${this.getLanguageId(language)}]`]["prettier.singleQuote"] = jsConvention.quoteStyle === 'single';
      }
    }

    if (language === 'javascript') {
      const jsConvention = convention as JavaScriptFormattingConvention;
      Object.assign(settings[`[${this.getLanguageId(language)}]`], {
        "prettier.semi": jsConvention.useSemicolons,
        "prettier.trailingComma": jsConvention.trailingComma,
        "prettier.arrowParens": jsConvention.arrowParens
      });
    }

    return {
      format: 'vscode',
      filename: 'settings.json',
      content: JSON.stringify(settings, null, 2),
      instructions: `
VS Code 설정 적용 방법:
1. VS Code에서 Ctrl+Shift+P (Mac: Cmd+Shift+P)를 눌러 명령 팔레트를 엽니다.
2. "Preferences: Open Settings (JSON)"을 검색하여 선택합니다.
3. 생성된 설정을 settings.json 파일에 복사하여 붙여넣습니다.
4. 파일을 저장하면 설정이 적용됩니다.

워크스페이스별 설정을 원한다면:
1. 프로젝트 루트에 .vscode 폴더를 생성합니다.
2. .vscode/settings.json 파일에 설정을 저장합니다.
      `.trim()
    };
  }

  /**
   * IntelliJ IDEA 설정으로 내보냅니다.
   */
  private static exportToIntelliJ(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    let content = '';
    
    if (language === 'java') {
      const javaConvention = convention as JavaFormattingConvention;
      content = `
<code_scheme name="${convention.name}">
  <option name="RIGHT_MARGIN" value="${convention.maxLineLength}" />
  <${this.getIntelliJLanguageTag(language)}>
    <option name="INDENT_SIZE" value="${convention.indentSize}" />
    <option name="CONTINUATION_INDENT_SIZE" value="${convention.indentSize * 2}" />
    <option name="TAB_SIZE" value="${convention.indentSize}" />
    <option name="USE_TAB_CHARACTER" value="${convention.indentationType === 'tab'}" />
    <option name="SMART_TABS" value="false" />
    <option name="KEEP_INDENTS_ON_EMPTY_LINES" value="false" />
    <option name="BRACE_STYLE" value="${this.getIntelliJBraceStyle(javaConvention.braceStyle)}" />
    <option name="CLASS_BRACE_STYLE" value="${this.getIntelliJBraceStyle(javaConvention.braceStyle)}" />
    <option name="METHOD_BRACE_STYLE" value="${this.getIntelliJBraceStyle(javaConvention.braceStyle)}" />
    <option name="SPACE_BEFORE_METHOD_PARENTHESES" value="${javaConvention.spaceBeforeMethodParens}" />
    <option name="SPACE_BEFORE_IF_PARENTHESES" value="${javaConvention.spaceBeforeControlParens}" />
    <option name="SPACE_BEFORE_FOR_PARENTHESES" value="${javaConvention.spaceBeforeControlParens}" />
    <option name="SPACE_BEFORE_WHILE_PARENTHESES" value="${javaConvention.spaceBeforeControlParens}" />
    <option name="SPACE_AROUND_ASSIGNMENT_OPERATORS" value="${javaConvention.spaceAroundOperators}" />
    <option name="SPACE_AROUND_LOGICAL_OPERATORS" value="${javaConvention.spaceAroundOperators}" />
    <option name="SPACE_AROUND_EQUALITY_OPERATORS" value="${javaConvention.spaceAroundOperators}" />
    <option name="SPACE_AROUND_RELATIONAL_OPERATORS" value="${javaConvention.spaceAroundOperators}" />
    <option name="BLANK_LINES_BETWEEN_IMPORTS" value="${javaConvention.separateImportGroups ? '1' : '0'}" />
    <option name="BLANK_LINES_AROUND_METHOD" value="${javaConvention.blankLinesBetweenMethods}" />
    <option name="BLANK_LINES_AROUND_CLASS" value="${javaConvention.blankLinesBetweenClasses}" />
  </${this.getIntelliJLanguageTag(language)}>
</code_scheme>
      `.trim();
    } else if (language === 'kotlin') {
      const kotlinConvention = convention as KotlinFormattingConvention;
      content = `
<code_scheme name="${convention.name}">
  <option name="RIGHT_MARGIN" value="${convention.maxLineLength}" />
  <Kotlin>
    <option name="INDENT_SIZE" value="${convention.indentSize}" />
    <option name="CONTINUATION_INDENT_SIZE" value="${convention.indentSize * 2}" />
    <option name="TAB_SIZE" value="${convention.indentSize}" />
    <option name="USE_TAB_CHARACTER" value="${convention.indentationType === 'tab'}" />
    <option name="SPACE_AROUND_ASSIGNMENT_OPERATORS" value="${kotlinConvention.spaceAroundOperators}" />
    <option name="SPACE_AROUND_LOGICAL_OPERATORS" value="${kotlinConvention.spaceAroundOperators}" />
    <option name="SPACE_BEFORE_TYPE_COLON" value="${kotlinConvention.spaceAroundTypeColon}" />
    <option name="SPACE_AFTER_TYPE_COLON" value="${kotlinConvention.spaceAroundTypeColon}" />
    <option name="BLANK_LINES_AROUND_METHOD" value="${kotlinConvention.blankLinesBetweenMethods}" />
    <option name="BLANK_LINES_AROUND_CLASS" value="${kotlinConvention.blankLinesBetweenClasses}" />
  </Kotlin>
</code_scheme>
      `.trim();
    }

    return {
      format: 'intellij',
      filename: `${convention.name.replace(/\s+/g, '_')}.xml`,
      content,
      instructions: `
IntelliJ IDEA 설정 적용 방법:
1. IntelliJ IDEA에서 File → Settings (Windows/Linux) 또는 Preferences (Mac)을 엽니다.
2. Editor → Code Style로 이동합니다.
3. 설정 아이콘(⚙️)을 클릭하고 "Import Scheme"을 선택합니다.
4. "IntelliJ IDEA code style XML"을 선택합니다.
5. 생성된 XML 파일을 선택하여 가져옵니다.
6. 새로운 스키마가 적용됩니다.
      `.trim()
    };
  }

  /**
   * Eclipse 설정으로 내보냅니다.
   */
  private static exportToEclipse(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    if (language !== 'java') {
      throw new Error('Eclipse 내보내기는 현재 Java만 지원됩니다.');
    }

    const javaConvention = convention as JavaFormattingConvention;
    
    const content = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<profiles version="13">
<profile kind="CodeFormatterProfile" name="${convention.name}" version="13">
<setting id="org.eclipse.jdt.core.formatter.tabulation.char" value="${convention.indentationType === 'tab' ? 'tab' : 'space'}"/>
<setting id="org.eclipse.jdt.core.formatter.tabulation.size" value="${convention.indentSize}"/>
<setting id="org.eclipse.jdt.core.formatter.indentation.size" value="${convention.indentSize}"/>
<setting id="org.eclipse.jdt.core.formatter.lineSplit" value="${convention.maxLineLength}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_before_opening_paren_in_method_declaration" value="${javaConvention.spaceBeforeMethodParens ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_before_opening_paren_in_if" value="${javaConvention.spaceBeforeControlParens ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_before_opening_paren_in_for" value="${javaConvention.spaceBeforeControlParens ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_before_opening_paren_in_while" value="${javaConvention.spaceBeforeControlParens ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_before_assignment_operator" value="${javaConvention.spaceAroundOperators ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.insert_space_after_assignment_operator" value="${javaConvention.spaceAroundOperators ? 'insert' : 'do not insert'}"/>
<setting id="org.eclipse.jdt.core.formatter.brace_position_for_type_declaration" value="${javaConvention.braceStyle === 'allman' ? 'next_line' : 'end_of_line'}"/>
<setting id="org.eclipse.jdt.core.formatter.brace_position_for_method_declaration" value="${javaConvention.braceStyle === 'allman' ? 'next_line' : 'end_of_line'}"/>
<setting id="org.eclipse.jdt.core.formatter.blank_lines_between_import_groups" value="${javaConvention.separateImportGroups ? '1' : '0'}"/>
<setting id="org.eclipse.jdt.core.formatter.blank_lines_before_method" value="${javaConvention.blankLinesBetweenMethods}"/>
<setting id="org.eclipse.jdt.core.formatter.blank_lines_after_method_body" value="${javaConvention.blankLinesBetweenMethods}"/>
</profile>
</profiles>
    `.trim();

    return {
      format: 'eclipse',
      filename: `${convention.name.replace(/\s+/g, '_')}_formatter.xml`,
      content,
      instructions: `
Eclipse 설정 적용 방법:
1. Eclipse에서 Window → Preferences를 엽니다.
2. Java → Code Style → Formatter로 이동합니다.
3. "Import..." 버튼을 클릭합니다.
4. 생성된 XML 파일을 선택합니다.
5. 새로운 포매터 프로필이 추가되고 활성화됩니다.
      `.trim()
    };
  }

  /**
   * Prettier 설정으로 내보냅니다.
   */
  private static exportToPrettier(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    if (language !== 'javascript' && language !== 'json') {
      throw new Error('Prettier는 JavaScript와 JSON만 지원됩니다.');
    }

    const config: any = {
      printWidth: convention.maxLineLength,
      tabWidth: convention.indentSize,
      useTabs: convention.indentationType === 'tab',
      insertPragma: false,
      requirePragma: false,
      proseWrap: "preserve"
    };

    if (language === 'javascript') {
      const jsConvention = convention as JavaScriptFormattingConvention;
      Object.assign(config, {
        semi: jsConvention.useSemicolons,
        singleQuote: jsConvention.quoteStyle === 'single',
        trailingComma: jsConvention.trailingComma,
        arrowParens: jsConvention.arrowParens,
        jsxSingleQuote: jsConvention.jsxQuoteStyle === 'single',
        jsxBracketSameLine: jsConvention.jsxBracketSameLine
      });
    }

    if (language === 'json') {
      Object.assign(config, {
        parser: "json"
      });
    }

    return {
      format: 'prettier',
      filename: '.prettierrc',
      content: JSON.stringify(config, null, 2),
      instructions: `
Prettier 설정 적용 방법:
1. 프로젝트 루트 디렉토리에 .prettierrc 파일을 생성합니다.
2. 생성된 설정을 파일에 저장합니다.
3. VS Code Prettier 확장이나 CLI를 통해 사용할 수 있습니다.

package.json에 추가할 스크립트:
"scripts": {
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json}\""
}

VS Code에서 자동 포매팅 활성화:
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode"
      `.trim()
    };
  }

  /**
   * ESLint 설정으로 내보냅니다.
   */
  private static exportToEslint(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    if (language !== 'javascript') {
      throw new Error('ESLint는 JavaScript만 지원됩니다.');
    }

    const jsConvention = convention as JavaScriptFormattingConvention;
    
    const config = {
      "env": {
        "browser": true,
        "es2021": true,
        "node": true
      },
      "extends": [
        "eslint:recommended"
      ],
      "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
      },
      "rules": {
        "indent": ["error", convention.indentationType === 'tab' ? "tab" : convention.indentSize],
        "max-len": ["error", { "code": convention.maxLineLength }],
        "quotes": ["error", jsConvention.quoteStyle],
        "semi": ["error", jsConvention.useSemicolons ? "always" : "never"],
        "comma-dangle": ["error", jsConvention.trailingComma],
        "space-before-function-paren": ["error", jsConvention.spaceBeforeFunctionParens ? "always" : "never"],
        "object-curly-spacing": ["error", jsConvention.spaceInObjectBraces ? "always" : "never"],
        "array-bracket-spacing": ["error", jsConvention.spaceInArrayBrackets ? "always" : "never"],
        "brace-style": ["error", jsConvention.braceStyle === 'allman' ? "allman" : "1tbs"],
        "space-infix-ops": ["error", { "int32Hint": false }],
        "eol-last": [convention.insertFinalNewline ? "error" : "off"],
        "no-trailing-spaces": [convention.trimTrailingWhitespace ? "error" : "off"]
      }
    };

    // JSX 설정 추가
    if (jsConvention.jsxQuoteStyle) {
      Object.assign(config, {
        "parserOptions": {
          ...config.parserOptions,
          "ecmaFeatures": {
            "jsx": true
          }
        },
        "rules": {
          ...config.rules,
          "jsx-quotes": ["error", jsConvention.jsxQuoteStyle === 'single' ? "prefer-single" : "prefer-double"]
        }
      });
    }

    return {
      format: 'eslint',
      filename: '.eslintrc.json',
      content: JSON.stringify(config, null, 2),
      instructions: `
ESLint 설정 적용 방법:
1. 프로젝트에 ESLint를 설치합니다:
   npm install --save-dev eslint

2. 프로젝트 루트에 .eslintrc.json 파일을 생성하고 설정을 저장합니다.

3. package.json에 스크립트를 추가합니다:
   "scripts": {
     "lint": "eslint src/**/*.js",
     "lint:fix": "eslint src/**/*.js --fix"
   }

4. VS Code ESLint 확장을 설치하면 실시간으로 린팅이 적용됩니다.

자동 수정 활성화 (VS Code):
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
      `.trim()
    };
  }

  /**
   * EditorConfig 설정으로 내보냅니다.
   */
  private static exportToEditorConfig(convention: FormattingConvention, language: SupportedLanguage): IdeExportResult {
    const fileExtensions = this.getFileExtensions(language);
    
    const content = `
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# 모든 파일에 적용되는 기본 설정
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = ${convention.insertFinalNewline}
trim_trailing_whitespace = ${convention.trimTrailingWhitespace}

# ${language} 파일 설정
[*.{${fileExtensions.join(',')}}]
indent_style = ${convention.indentationType}
indent_size = ${convention.indentSize}
max_line_length = ${convention.maxLineLength}
    `.trim();

    return {
      format: 'editorconfig',
      filename: '.editorconfig',
      content,
      instructions: `
EditorConfig 설정 적용 방법:
1. 프로젝트 루트 디렉토리에 .editorconfig 파일을 생성합니다.
2. 생성된 설정을 파일에 저장합니다.
3. 대부분의 현대적인 에디터와 IDE가 자동으로 이 설정을 인식합니다.

지원되는 에디터:
- Visual Studio Code (기본 내장)
- IntelliJ IDEA / WebStorm
- Sublime Text (플러그인 필요)
- Atom (플러그인 필요)
- Vim (플러그인 필요)

VS Code에서 확장 기능이 필요한 경우:
"EditorConfig for VS Code" 확장을 설치하세요.
      `.trim()
    };
  }

  /**
   * 언어별 파일 확장자를 반환합니다.
   */
  private static getFileExtensions(language: SupportedLanguage): string[] {
    switch (language) {
      case 'java':
        return ['java'];
      case 'json':
        return ['json', 'jsonc'];
      case 'javascript':
        return ['js', 'jsx', 'ts', 'tsx', 'mjs'];
      case 'kotlin':
        return ['kt', 'kts'];
      case 'sql':
        return ['sql', 'mysql', 'pgsql', 'plsql'];
      default:
        return [];
    }
  }

  /**
   * VS Code 언어 ID를 반환합니다.
   */
  private static getLanguageId(language: SupportedLanguage): string {
    switch (language) {
      case 'java':
        return 'java';
      case 'json':
        return 'json';
      case 'javascript':
        return 'javascript';
      case 'kotlin':
        return 'kotlin';
      case 'sql':
        return 'sql';
      default:
        return language;
    }
  }

  /**
   * IntelliJ 언어 태그를 반환합니다.
   */
  private static getIntelliJLanguageTag(language: SupportedLanguage): string {
    switch (language) {
      case 'java':
        return 'JAVA';
      case 'javascript':
        return 'JavaScript';
      case 'kotlin':
        return 'Kotlin';
      default:
        return language.toUpperCase();
    }
  }

  /**
   * IntelliJ 중괄호 스타일을 반환합니다.
   */
  private static getIntelliJBraceStyle(braceStyle: string): string {
    switch (braceStyle) {
      case 'kr':
        return 'END_OF_LINE';
      case 'allman':
        return 'NEXT_LINE';
      case 'gnu':
        return 'NEXT_LINE_SHIFTED';
      case 'horstmann':
        return 'NEXT_LINE_IF_WRAPPED';
      default:
        return 'END_OF_LINE';
    }
  }

  /**
   * 모든 지원되는 IDE 형식 목록을 반환합니다.
   */
  public static getSupportedFormats(language: SupportedLanguage): IdeExportFormat[] {
    const commonFormats: IdeExportFormat[] = ['vscode', 'editorconfig'];
    
    switch (language) {
      case 'java':
        return [...commonFormats, 'intellij', 'eclipse'];
      case 'javascript':
        return [...commonFormats, 'intellij', 'prettier', 'eslint'];
      case 'kotlin':
        return [...commonFormats, 'intellij'];
      case 'json':
        return [...commonFormats, 'prettier'];
      case 'sql':
        return [...commonFormats, 'intellij'];
      default:
        return commonFormats;
    }
  }
}