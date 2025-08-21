import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Input, 
  Button, 
  Select, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  InputNumber,
  Switch,
  message,
  Tooltip,
  Tabs,
  Radio
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  FormatPainterOutlined,
  SettingOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CodeOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { AdvancedSorter, SortingOptions, sortingPresets } from './utils/sortingUtils';
import { LanguageSpecificSorter, LanguageSortingOptions } from './utils/languageSpecificSorters';
import { DataTypeSorter, DataTypeSortingOptions } from './utils/dataTypeSorters';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
// const { Panel } = Collapse;
const { TabPane } = Tabs;

interface FormatterOptions {
  indentType: 'spaces' | 'tabs';
  indentSize: number;
  removeEmptyLines: boolean;
  trimWhitespace: boolean;
  sortLines: boolean;
  removeDuplicates: boolean;
  addLineNumbers: boolean;
  convertCase: 'none' | 'upper' | 'lower' | 'camel' | 'pascal' | 'snake' | 'kebab';
  // 고급 정렬 옵션
  advancedSort: boolean;
  sortingOptions: SortingOptions;
  usePreset: string;
  // 언어별 정렬
  useLanguageSort: boolean;
  languageOptions: LanguageSortingOptions;
  // 데이터 타입별 정렬
  useDataTypeSort: boolean;
  dataTypeOptions: DataTypeSortingOptions;
}

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [options, setOptions] = useState<FormatterOptions>({
    indentType: 'spaces',
    indentSize: 2,
    removeEmptyLines: false,
    trimWhitespace: true,
    sortLines: false,
    removeDuplicates: false,
    addLineNumbers: false,
    convertCase: 'none',
    advancedSort: false,
    sortingOptions: {
      sortType: 'alphabetical',
      sortOrder: 'asc',
      dataType: 'auto',
      objectSortKey: '',
      customPattern: '',
      preserveComments: true,
      removeEmptyLines: false
    },
    usePreset: 'none',
    useLanguageSort: false,
    languageOptions: {
      language: 'javascript',
      sortImports: true,
      sortCSSSProperties: true,
      sortHTMLAttributes: true,
      sortJSONKeys: true,
      preserveComments: true,
      sortFunctions: false,
      sortClasses: false
    },
    useDataTypeSort: false,
    dataTypeOptions: {
      dataType: 'number',
      sortOrder: 'asc'
    }
  });

  const formatCode = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    try {
      let result = inputCode;

      // 프리셋 적용
      if (options.usePreset !== 'none') {
        switch (options.usePreset) {
          case 'js-object':
            result = sortingPresets.sortJSObjectProperties(result);
            break;
          case 'css-properties':
            result = sortingPresets.sortCSSProperties(result);
            break;
          case 'array-alpha':
            result = sortingPresets.sortArrayElements(result, 'alphabetical');
            break;
          case 'array-num':
            result = sortingPresets.sortArrayElements(result, 'numerical');
            break;
          case 'js-imports':
            result = LanguageSpecificSorter.sortJavaScript(result, { 
              language: 'javascript', 
              sortImports: true,
              preserveComments: true
            });
            break;
          case 'python-imports':
            result = LanguageSpecificSorter.sortPython(result, { 
              language: 'python', 
              sortImports: true,
              preserveComments: true
            });
            break;
          case 'html-attributes':
            result = LanguageSpecificSorter.sortHTML(result, { 
              language: 'html', 
              sortHTMLAttributes: true
            });
            break;
          case 'sql-columns':
            result = LanguageSpecificSorter.sortSQL(result);
            break;
        }
      }

      // 언어별 정렬 적용
      if (options.useLanguageSort) {
        switch (options.languageOptions.language) {
          case 'javascript':
            result = LanguageSpecificSorter.sortJavaScript(result, options.languageOptions);
            break;
          case 'python':
            result = LanguageSpecificSorter.sortPython(result, options.languageOptions);
            break;
          case 'css':
            result = LanguageSpecificSorter.sortCSS(result, options.languageOptions);
            break;
          case 'html':
            result = LanguageSpecificSorter.sortHTML(result, options.languageOptions);
            break;
          case 'json':
            result = LanguageSpecificSorter.sortJSON(result, options.languageOptions);
            break;
          case 'sql':
            result = LanguageSpecificSorter.sortSQL(result);
            break;
          case 'markdown':
            result = LanguageSpecificSorter.sortMarkdown(result);
            break;
        }
      }

      // 데이터 타입별 정렬 적용
      if (options.useDataTypeSort) {
        const lines = result.split('\n');
        const sortedLines = DataTypeSorter.sortByDataType(lines, options.dataTypeOptions);
        result = sortedLines.join('\n');
      }

      // 고급 정렬 적용
      if (options.advancedSort || options.sortLines) {
        const sortingOpts = options.advancedSort ? options.sortingOptions : {
          sortType: 'alphabetical' as const,
          sortOrder: 'asc' as const,
          dataType: 'auto' as const,
          preserveComments: true,
          removeEmptyLines: options.removeEmptyLines
        };
        
        const parsedLines = AdvancedSorter.parseLines(result, sortingOpts);
        const sortedLines = AdvancedSorter.sortLines(parsedLines, sortingOpts);
        result = AdvancedSorter.formatOutput(sortedLines, !options.trimWhitespace);
      }

      // 기본 포맷팅 적용
      let lines = result.split('\n');

      if (options.trimWhitespace && !options.advancedSort) {
        lines = lines.map(line => line.trim());
      }

      if (options.removeEmptyLines && !options.advancedSort) {
        lines = lines.filter(line => line.length > 0);
      }

      if (options.removeDuplicates) {
        lines = [...new Set(lines)];
      }

      // 대소문자 변환 및 들여쓰기
      lines = lines.map((line, index) => {
        let formattedLine = line;

        if (options.convertCase !== 'none') {
          switch (options.convertCase) {
            case 'upper':
              formattedLine = formattedLine.toUpperCase();
              break;
            case 'lower':
              formattedLine = formattedLine.toLowerCase();
              break;
            case 'camel':
              formattedLine = toCamelCase(formattedLine);
              break;
            case 'pascal':
              formattedLine = toPascalCase(formattedLine);
              break;
            case 'snake':
              formattedLine = toSnakeCase(formattedLine);
              break;
            case 'kebab':
              formattedLine = toKebabCase(formattedLine);
              break;
          }
        }

        // 들여쓰기 적용 (이미 들여쓰기가 있는 경우 제외)
        if (!options.advancedSort || options.trimWhitespace) {
          const indent = options.indentType === 'spaces' 
            ? ' '.repeat(options.indentSize)
            : '\t';
          
          if (formattedLine.trim() && !formattedLine.startsWith(' ') && !formattedLine.startsWith('\t')) {
            formattedLine = indent + formattedLine;
          }
        }

        if (options.addLineNumbers) {
          const lineNumber = String(index + 1).padStart(3, '0');
          formattedLine = `${lineNumber}: ${formattedLine}`;
        }

        return formattedLine;
      });

      setOutputCode(lines.join('\n'));
      message.success('코드 정렬이 완료되었습니다.');
    } catch (error) {
      message.error('코드 정렬 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const toCamelCase = (str: string): string => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  };

  const toPascalCase = (str: string): string => {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  const toSnakeCase = (str: string): string => {
    return str.replace(/[-\s]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  };

  const toKebabCase = (str: string): string => {
    return str.replace(/[_\s]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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
    message.info('모든 내용이 지워졌습니다.');
  };

  const updateOption = <K extends keyof FormatterOptions>(key: K, value: FormatterOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateSortingOption = <K extends keyof SortingOptions>(key: K, value: SortingOptions[K]) => {
    setOptions(prev => ({
      ...prev,
      sortingOptions: {
        ...prev.sortingOptions,
        [key]: value
      }
    }));
  };

  const updateLanguageOption = <K extends keyof LanguageSortingOptions>(key: K, value: LanguageSortingOptions[K]) => {
    setOptions(prev => ({
      ...prev,
      languageOptions: {
        ...prev.languageOptions,
        [key]: value
      }
    }));
  };

  const updateDataTypeOption = <K extends keyof DataTypeSortingOptions>(key: K, value: DataTypeSortingOptions[K]) => {
    setOptions(prev => ({
      ...prev,
      dataTypeOptions: {
        ...prev.dataTypeOptions,
        [key]: value
      }
    }));
  };

  return (
    <Layout className="code-formatter">
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <FormatPainterOutlined style={{ color: 'white', fontSize: '24px', marginRight: '12px' }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            코드 정렬 도구
          </Title>
        </div>
      </Header>
      
      <Content className="formatter-content">
        <Card>
          <div className="controls-section">
            <Title level={4}>정렬 옵션</Title>
            
            <Tabs defaultActiveKey="basic" style={{ marginBottom: 16 }}>
              <TabPane tab={<span><SettingOutlined />기본 설정</span>} key="basic">
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div className="control-group">
                  <Text>들여쓰기 타입:</Text>
                  <Select
                    value={options.indentType}
                    onChange={(value) => updateOption('indentType', value)}
                    style={{ width: 100 }}
                  >
                    <Option value="spaces">공백</Option>
                    <Option value="tabs">탭</Option>
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div className="control-group">
                  <Text>들여쓰기 크기:</Text>
                  <InputNumber
                    min={1}
                    max={8}
                    value={options.indentSize}
                    onChange={(value) => updateOption('indentSize', value || 2)}
                    style={{ width: 80 }}
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div className="control-group">
                  <Text>대소문자 변환:</Text>
                  <Select
                    value={options.convertCase}
                    onChange={(value) => updateOption('convertCase', value)}
                    style={{ width: 120 }}
                  >
                    <Option value="none">변환 안함</Option>
                    <Option value="upper">대문자</Option>
                    <Option value="lower">소문자</Option>
                    <Option value="camel">camelCase</Option>
                    <Option value="pascal">PascalCase</Option>
                    <Option value="snake">snake_case</Option>
                    <Option value="kebab">kebab-case</Option>
                  </Select>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.trimWhitespace}
                    onChange={(checked) => updateOption('trimWhitespace', checked)}
                  />
                  <Text>공백 제거</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.removeEmptyLines}
                    onChange={(checked) => updateOption('removeEmptyLines', checked)}
                  />
                  <Text>빈 줄 제거</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.sortLines}
                    onChange={(checked) => updateOption('sortLines', checked)}
                  />
                  <Text>줄 정렬</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.removeDuplicates}
                    onChange={(checked) => updateOption('removeDuplicates', checked)}
                  />
                  <Text>중복 제거</Text>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.addLineNumbers}
                    onChange={(checked) => updateOption('addLineNumbers', checked)}
                  />
                  <Text>줄 번호 추가</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div className="control-group">
                  <Switch
                    checked={options.advancedSort}
                    onChange={(checked) => updateOption('advancedSort', checked)}
                  />
                  <Text>고급 정렬</Text>
                </div>
              </Col>
            </Row>
            
            </TabPane>
            
            <TabPane tab={<span><DatabaseOutlined />고급 정렬</span>} key="advanced">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>정렬 방법:</Text>
                    <Select
                      value={options.sortingOptions.sortType}
                      onChange={(value) => updateSortingOption('sortType', value)}
                      style={{ width: 120 }}
                    >
                      <Option value="alphabetical">알파벳순</Option>
                      <Option value="numerical">숫자순</Option>
                      <Option value="date">날짜순</Option>
                      <Option value="length">길이순</Option>
                      <Option value="custom">사용자 정의</Option>
                    </Select>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>정렬 순서:</Text>
                    <Radio.Group
                      value={options.sortingOptions.sortOrder}
                      onChange={(e) => updateSortingOption('sortOrder', e.target.value)}
                    >
                      <Radio.Button value="asc">
                        <SortAscendingOutlined /> 오름차순
                      </Radio.Button>
                      <Radio.Button value="desc">
                        <SortDescendingOutlined /> 내림차순
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>데이터 타입:</Text>
                    <Select
                      value={options.sortingOptions.dataType}
                      onChange={(value) => updateSortingOption('dataType', value)}
                      style={{ width: 120 }}
                    >
                      <Option value="auto">자동 감지</Option>
                      <Option value="string">문자열</Option>
                      <Option value="number">숫자</Option>
                      <Option value="date">날짜</Option>
                      <Option value="json">JSON</Option>
                      <Option value="array">배열</Option>
                      <Option value="object">객체</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12}>
                  <div className="control-group">
                    <Text>객체 정렬 키:</Text>
                    <Input
                      placeholder="예: name, id, date"
                      value={options.sortingOptions.objectSortKey}
                      onChange={(e) => updateSortingOption('objectSortKey', e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div className="control-group">
                    <Text>사용자 정의 패턴:</Text>
                    <Input
                      placeholder="정규표현식 패턴"
                      value={options.sortingOptions.customPattern}
                      onChange={(e) => updateSortingOption('customPattern', e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} md={6}>
                  <div className="control-group">
                    <Switch
                      checked={options.sortingOptions.preserveComments}
                      onChange={(checked) => updateSortingOption('preserveComments', checked)}
                    />
                    <Text>주석 보존</Text>
                  </div>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab={<span><CodeOutlined />프리셋</span>} key="presets">
              <div className="control-group">
                <Text>정렬 프리셋:</Text>
                <Select
                  value={options.usePreset}
                  onChange={(value) => updateOption('usePreset', value)}
                  style={{ width: 250 }}
                  placeholder="프리셋을 선택하세요"
                >
                  <Option value="none">프리셋 없음</Option>
                  <Option value="js-object">JavaScript 객체 속성</Option>
                  <Option value="css-properties">CSS 속성</Option>
                  <Option value="js-imports">JavaScript Import</Option>
                  <Option value="python-imports">Python Import</Option>
                  <Option value="html-attributes">HTML 속성</Option>
                  <Option value="sql-columns">SQL 컴럼</Option>
                  <Option value="array-alpha">배열 요소 (알파벳순)</Option>
                  <Option value="array-num">배열 요소 (숫자순)</Option>
                </Select>
              </div>
              
              <Divider />
              
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                <Text strong>프리셋 설명:</Text>
                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                  <li><strong>JavaScript 객체 속성:</strong> 객체의 속성을 알파벳 순으로 정렬</li>
                  <li><strong>CSS 속성:</strong> CSS 선택자 내의 속성을 알파벳 순으로 정렬</li>
                  <li><strong>배열 요소:</strong> JSON 배열이나 리스트의 요소를 정렬</li>
                </ul>
              </div>
            </TabPane>
            
            <TabPane tab={<span><CodeOutlined />언어별 정렬</span>} key="language">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Switch
                      checked={options.useLanguageSort}
                      onChange={(checked) => updateOption('useLanguageSort', checked)}
                    />
                    <Text>언어별 정렬 사용</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>언어:</Text>
                    <Select
                      value={options.languageOptions.language}
                      onChange={(value) => updateLanguageOption('language', value)}
                      style={{ width: 120 }}
                    >
                      <Option value="javascript">JavaScript</Option>
                      <Option value="python">Python</Option>
                      <Option value="css">CSS</Option>
                      <Option value="html">HTML</Option>
                      <Option value="json">JSON</Option>
                      <Option value="sql">SQL</Option>
                      <Option value="markdown">Markdown</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12} md={6}>
                  <div className="control-group">
                    <Switch
                      checked={options.languageOptions.sortImports}
                      onChange={(checked) => updateLanguageOption('sortImports', checked)}
                    />
                    <Text>Import 정렬</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <div className="control-group">
                    <Switch
                      checked={options.languageOptions.sortCSSSProperties}
                      onChange={(checked) => updateLanguageOption('sortCSSSProperties', checked)}
                    />
                    <Text>CSS 속성 정렬</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <div className="control-group">
                    <Switch
                      checked={options.languageOptions.sortHTMLAttributes}
                      onChange={(checked) => updateLanguageOption('sortHTMLAttributes', checked)}
                    />
                    <Text>HTML 속성 정렬</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <div className="control-group">
                    <Switch
                      checked={options.languageOptions.sortJSONKeys}
                      onChange={(checked) => updateLanguageOption('sortJSONKeys', checked)}
                    />
                    <Text>JSON 키 정렬</Text>
                  </div>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab={<span><DatabaseOutlined />데이터 타입 정렬</span>} key="datatype">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Switch
                      checked={options.useDataTypeSort}
                      onChange={(checked) => updateOption('useDataTypeSort', checked)}
                    />
                    <Text>데이터 타입 정렬 사용</Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>데이터 타입:</Text>
                    <Select
                      value={options.dataTypeOptions.dataType}
                      onChange={(value) => updateDataTypeOption('dataType', value)}
                      style={{ width: 120 }}
                    >
                      <Option value="number">숫자</Option>
                      <Option value="date">날짜</Option>
                      <Option value="version">버전</Option>
                      <Option value="ip">IP 주소</Option>
                      <Option value="url">URL</Option>
                      <Option value="email">이메일</Option>
                      <Option value="uuid">UUID</Option>
                      <Option value="hex">16진수</Option>
                      <Option value="time">시간</Option>
                      <Option value="filesize">파일 크기</Option>
                    </Select>
                  </div>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <div className="control-group">
                    <Text>정렬 순서:</Text>
                    <Radio.Group
                      value={options.dataTypeOptions.sortOrder}
                      onChange={(e) => updateDataTypeOption('sortOrder', e.target.value)}
                    >
                      <Radio.Button value="asc">
                        <SortAscendingOutlined /> 오름차순
                      </Radio.Button>
                      <Radio.Button value="desc">
                        <SortDescendingOutlined /> 내림차순
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                <Text strong>데이터 타입 설명:</Text>
                <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                  <li><strong>숫자:</strong> 정수, 소수점 숫자 정렬</li>
                  <li><strong>날짜:</strong> 다양한 날짜 형식 지원 (YYYY-MM-DD, MM/DD/YYYY 등)</li>
                  <li><strong>버전:</strong> 시맨틱 버저닝 (1.0.0, 2.1.3 등)</li>
                  <li><strong>IP 주소:</strong> IPv4 주소 정렬</li>
                  <li><strong>URL:</strong> 도메인 명 기준 정렬</li>
                  <li><strong>이메일:</strong> 도메인 우선 정렬</li>
                  <li><strong>파일 크기:</strong> B, KB, MB, GB 등 단위 지원</li>
                </ul>
              </div>
            </TabPane>
            
            </Tabs>
            
            <Space size="large">
              <Button type="primary" size="large" onClick={formatCode} icon={<FormatPainterOutlined />}>
                코드 정렬
              </Button>
              <Button onClick={clearAll} icon={<ClearOutlined />}>
                모두 지우기
              </Button>
            </Space>
          </div>

          <div className="code-areas">
            <div className="code-area">
              <Text strong>입력 코드</Text>
              <TextArea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="정렬할 코드를 입력하세요..."
                className="code-textarea"
                style={{ height: '460px', marginTop: '8px' }}
              />
            </div>
            
            <div className="code-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>정렬된 코드</Text>
                <Tooltip title="클립보드에 복사">
                  <Button 
                    type="text" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(outputCode)}
                    disabled={!outputCode}
                  />
                </Tooltip>
              </div>
              <TextArea
                value={outputCode}
                readOnly
                placeholder="정렬된 코드가 여기에 표시됩니다..."
                className="code-textarea"
                style={{ height: '460px', marginTop: '8px' }}
              />
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default App;