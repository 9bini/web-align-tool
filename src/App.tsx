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
  Tabs,
  Switch,
  Checkbox,
  Modal,
  Collapse,
  List,
  Divider,
  Alert,
  Steps
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  FormatPainterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ThunderboltOutlined,
  CommentOutlined,
  ToolOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  CompressOutlined,
  FilterOutlined,
  EditOutlined,
  LineOutlined,
  CheckSquareOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  BulbOutlined,
  CodeOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

interface AlignmentOptions {
  delimiters: string[];
  ignoreInQuotes: boolean;
  keepSpaceAround: boolean;
  trimRight: boolean;
  includeEmpty: boolean;
  indentSize: number;
  indentType: 'spaces' | 'tabs';
}

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('javascript');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('alignment');
  const [helpVisible, setHelpVisible] = useState<boolean>(false);
  const [helpActiveTab, setHelpActiveTab] = useState<string>('overview');
  
  // Alignment options
  const [alignmentOptions, setAlignmentOptions] = useState<AlignmentOptions>({
    delimiters: ['=', ':', '//', ',', ';'],
    ignoreInQuotes: true,
    keepSpaceAround: true,
    trimRight: true,
    includeEmpty: false,
    indentSize: 2,
    indentType: 'spaces'
  });

  const detectLanguage = (code: string): string => {
    if (code.includes('import ') || code.includes('export ') || code.includes('const ') || code.includes('function')) return 'javascript';
    if (code.includes('def ') || code.includes('import ') || code.includes('from ')) return 'python';
    if (code.includes('{') && code.includes(':') && code.includes('}')) return 'css';
    if (code.includes('<') && code.includes('>')) return 'html';
    if (code.includes('SELECT') || code.includes('FROM') || code.includes('WHERE')) return 'sql';
    if (code.includes('"') && code.includes(':') && (code.includes('{') || code.includes('['))) return 'json';
    return 'text';
  };

  // Advanced alignment algorithm (ChatGPT style)
  const findDelimiterIndex = (line: string, delimiter: string, ignoreInQuotes: boolean): number => {
    if (delimiter === '//' && !ignoreInQuotes) {
      return line.indexOf('//');
    }

    if (!ignoreInQuotes) {
      return line.indexOf(delimiter);
    }

    let inSingle = false;
    let inDouble = false;
    let inBack = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = i > 0 ? line[i - 1] : '';

      if (ch === "'" && !inDouble && !inBack && prev !== '\\') {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle && !inBack && prev !== '\\') {
        inDouble = !inDouble;
      } else if (ch === '`' && !inSingle && !inDouble && prev !== '\\') {
        inBack = !inBack;
      }

      if (!inSingle && !inDouble && !inBack) {
        if (line.substring(i).startsWith(delimiter)) {
          return i;
        }
      }
    }

    return -1;
  };

  const findFirstAnyDelimiter = (line: string, delimiters: string[], ignoreInQuotes: boolean) => {
    let bestIdx = Infinity;
    let bestDelim = null;

    for (const delimiter of delimiters) {
      const idx = findDelimiterIndex(line, delimiter, ignoreInQuotes);
      if (idx >= 0 && idx < bestIdx) {
        bestIdx = idx;
        bestDelim = delimiter;
      }
    }

    if (bestDelim === null) {
      return null;
    }
    return { index: bestIdx, delim: bestDelim };
  };

  const alignText = (text: string, options: AlignmentOptions): string => {
    const lines = text.split('\n');
    const meta: Array<{ left: string; right: string; delim: string | null }> = [];

    // Split all lines
    for (const line of lines) {
      const result = findFirstAnyDelimiter(line, options.delimiters, options.ignoreInQuotes);
      if (result === null) {
        meta.push({ left: line, right: '', delim: null });
      } else {
        const left = line.substring(0, result.index);
        const right = line.substring(result.index + result.delim.length);
        meta.push({ left, right, delim: result.delim });
      }
    }

    // Measure max left width
    const leftWidths = meta
      .filter(m => options.includeEmpty || m.delim !== null)
      .map(m => m.left.length);
    const maxLeft = leftWidths.length > 0 ? Math.max(...leftWidths) : 0;

    // Rebuild with alignment
    const result: string[] = [];
    for (const m of meta) {
      if (m.delim === null) {
        if (options.includeEmpty) {
          result.push(m.left.padEnd(maxLeft, ' '));
        } else {
          result.push(m.left);
        }
        continue;
      }

      const leftPadded = m.left.padEnd(maxLeft, ' ');
      let rightPart = m.right;

      if (options.trimRight) {
        rightPart = ' ' + rightPart.trimStart();
      }

      if (options.keepSpaceAround) {
        result.push(leftPadded + ' ' + m.delim + ' ' + rightPart.trimStart());
      } else {
        result.push(leftPadded + m.delim + rightPart);
      }
    }

    return result.join('\n');
  };

  const executeAlignment = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = alignText(inputCode, alignmentOptions);
      setOutputCode(result);
      setDetectedLanguage(detectLanguage(result));
      message.success('정렬 완료!');
    } catch (error) {
      message.error('정렬 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeQuickAction = (actionType: string) => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      let result = '';
      
      switch (actionType) {
        case 'sort-asc':
          result = inputCode.split('\n').sort().join('\n');
          break;
        case 'sort-desc':
          result = inputCode.split('\n').sort().reverse().join('\n');
          break;
        case 'remove-empty':
          result = inputCode.split('\n').filter(line => line.trim() !== '').join('\n');
          break;
        case 'remove-duplicates':
          result = [...new Set(inputCode.split('\n'))].join('\n');
          break;
        case 'trim-lines':
          result = inputCode.split('\n').map(line => line.trim()).join('\n');
          break;
        case 'add-numbers':
          result = inputCode.split('\n').map((line, index) => 
            `${String(index + 1).padStart(3, '0')}: ${line}`
          ).join('\n');
          break;
        case 'extract-comments':
          result = inputCode.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('#') || 
                   trimmed.startsWith('/*') || trimmed.startsWith('*') ||
                   trimmed.match(/^\s*<!--/) || trimmed.match(/^\s*-->/);
          }).join('\n');
          break;
        case 'remove-comments':
          result = inputCode.split('\n').filter(line => {
            const trimmed = line.trim();
            return !(trimmed.startsWith('//') || trimmed.startsWith('#') || 
                    trimmed.startsWith('/*') || trimmed.startsWith('*') ||
                    trimmed.match(/^\s*<!--/) || trimmed.match(/^\s*-->/));
          }).join('\n');
          break;
        default:
          result = inputCode;
      }
      
      setOutputCode(result);
      setDetectedLanguage(detectLanguage(result));
      message.success('작업 완료!');
    } catch (error) {
      message.error('작업 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateDelimiters = (delimiters: string[]) => {
    setAlignmentOptions(prev => ({ ...prev, delimiters }));
  };

  const toggleOption = (key: keyof AlignmentOptions) => {
    setAlignmentOptions(prev => ({ 
      ...prev, 
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key] 
    }));
  };


  React.useEffect(() => {
    if (inputCode) {
      setDetectedLanguage(detectLanguage(inputCode));
    }
  }, [inputCode]);

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

  const loadExample = (exampleCode: string) => {
    setInputCode(exampleCode);
    setHelpVisible(false);
    message.success('예제가 로드되었습니다. 정렬을 실행해보세요!');
  };

  const examples = {
    basic: `var name = 'John'
const age = 25
let city = 'Seoul'
var country = 'Korea'`,
    
    withComments: `var name = 'John' // 이름
const age = 25 // 나이
let city = 'Seoul' // 도시
// 주석 줄
var country = 'Korea' // 국가`,
    
    object: `const user = {
name: 'John',
age: 25,
city: 'Seoul',
country: 'Korea',
email: 'john@example.com'
}`,
    
    css: `.container {
padding: 20px;
margin: 10px;
background-color: #f5f5f5;
border: 1px solid #ddd;
border-radius: 8px;
color: #333;
font-size: 14px;
}`,
    
    mixed: `const API_URL = 'https://api.example.com'
var userToken = 'abc123'
let isLoggedIn = false
const MAX_RETRIES = 3
var currentUser = null
let sessionTimeout = 3600`
  };

  const shortcuts = [
    { key: 'Ctrl + Enter', action: '정렬 실행' },
    { key: 'Ctrl + K', action: '전체 지우기' },
    { key: 'Ctrl + C', action: '결과 복사' },
    { key: 'F1', action: '도움말 열기' },
    { key: 'Escape', action: '도움말 닫기' }
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        executeAlignment();
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        clearAll();
      } else if (e.ctrlKey && e.key === 'c' && e.shiftKey) {
        e.preventDefault();
        if (outputCode) copyToClipboard(outputCode);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setHelpVisible(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setHelpVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [outputCode]);

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkTheme ? '#141414' : '#f0f2f5' }}>
      <Header style={{ 
        background: isDarkTheme ? '#001529' : '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FormatPainterOutlined style={{ 
              color: isDarkTheme ? 'white' : '#1890ff', 
              fontSize: '28px', 
              marginRight: '12px' 
            }} />
            <Title level={3} style={{ 
              color: isDarkTheme ? 'white' : '#262626', 
              margin: 0,
              fontWeight: 600
            }}>
              코드 가독성 정렬기
            </Title>
          </div>
          <Space>
            <Tag color={isDarkTheme ? 'cyan' : 'blue'}>
              {detectedLanguage.toUpperCase()}
            </Tag>
            <Tooltip title="도움말 (F1)">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={() => setHelpVisible(true)}
                style={{ color: isDarkTheme ? 'white' : '#1890ff' }}
              >
                도움말
              </Button>
            </Tooltip>
            <Button
              type="text"
              icon={<ThunderboltOutlined />}
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              style={{ color: isDarkTheme ? 'white' : '#1890ff' }}
            >
              {isDarkTheme ? '라이트' : '다크'} 모드
            </Button>
          </Space>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              style={{ 
                background: isDarkTheme ? '#262626' : '#fff',
                marginBottom: '24px'
              }}
            >
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab={
                  <span>
                    <AlignCenterOutlined />
                    가독성 정렬
                  </span>
                } key="alignment">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Button 
                          type="primary" 
                          size="large"
                          icon={<FormatPainterOutlined />}
                          onClick={executeAlignment}
                          loading={isProcessing}
                          style={{ minWidth: '150px' }}
                        >
                          정렬 실행
                        </Button>
                      </div>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Card title="구분자 설정" size="small">
                        <Text>정렬 기준이 될 구분자를 선택하세요:</Text>
                        <div style={{ marginTop: '12px' }}>
                          <Checkbox.Group 
                            value={alignmentOptions.delimiters} 
                            onChange={updateDelimiters}
                          >
                            <Row>
                              <Col xs={12} sm={8}><Checkbox value="=">=</Checkbox></Col>
                              <Col xs={12} sm={8}><Checkbox value=":">:</Checkbox></Col>
                              <Col xs={12} sm={8}><Checkbox value="//">//</Checkbox></Col>
                              <Col xs={12} sm={8}><Checkbox value=",">,</Checkbox></Col>
                              <Col xs={12} sm={8}><Checkbox value=";">;</Checkbox></Col>
                              <Col xs={12} sm={8}><Checkbox value="-">-</Checkbox></Col>
                            </Row>
                          </Checkbox.Group>
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card title="정렬 옵션" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>따옴표 내부 무시</Text>
                            <Switch 
                              checked={alignmentOptions.ignoreInQuotes} 
                              onChange={() => toggleOption('ignoreInQuotes')}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>구분자 주변 공백</Text>
                            <Switch 
                              checked={alignmentOptions.keepSpaceAround} 
                              onChange={() => toggleOption('keepSpaceAround')}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>오른쪽 공백 정리</Text>
                            <Switch 
                              checked={alignmentOptions.trimRight} 
                              onChange={() => toggleOption('trimRight')}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>빈 줄도 정렬</Text>
                            <Switch 
                              checked={alignmentOptions.includeEmpty} 
                              onChange={() => toggleOption('includeEmpty')}
                            />
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                <TabPane tab={
                  <span>
                    <ThunderboltOutlined />
                    퀵 액션
                  </span>
                } key="quick">
                  <Row gutter={[12, 12]}>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('sort-asc')} loading={isProcessing}>
                        <SortAscendingOutlined /> 알파벳 정렬
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('sort-desc')} loading={isProcessing}>
                        <SortDescendingOutlined /> 역순 정렬
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('remove-empty')} loading={isProcessing}>
                        <CompressOutlined /> 빈 줄 제거
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('remove-duplicates')} loading={isProcessing}>
                        <FilterOutlined /> 중복 제거
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('trim-lines')} loading={isProcessing}>
                        <AlignLeftOutlined /> 공백 정리
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('add-numbers')} loading={isProcessing}>
                        <LineOutlined /> 줄 번호
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('extract-comments')} loading={isProcessing}>
                        <CommentOutlined /> 주석 추출
                      </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6}>
                      <Button block onClick={() => executeQuickAction('remove-comments')} loading={isProcessing}>
                        <ToolOutlined /> 주석 제거
                      </Button>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <EditOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    입력 코드
                  </span>
                  <Tag color="green">{inputCode.split('\n').length} 줄</Tag>
                </div>
              }
              extra={
                <Button size="small" onClick={clearAll} icon={<ClearOutlined />}>
                  지우기
                </Button>
              }
              style={{ 
                height: '100%',
                background: isDarkTheme ? '#262626' : '#fff'
              }}
            >
              <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                <TextArea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={`코드를 입력하세요... 예:
var name = 'John'
const age = 25
let city = 'Seoul'
// 주석
var country = 'Korea'`}
                  style={{ 
                    height: '100%',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: 'none',
                    background: isDarkTheme ? '#1f1f1f' : '#fafafa',
                    color: isDarkTheme ? '#d4d4d4' : '#262626'
                  }}
                  bordered={false}
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
                    정렬 결과
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
              style={{ 
                height: '100%',
                background: isDarkTheme ? '#262626' : '#fff'
              }}
            >
              <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                {outputCode ? (
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    background: isDarkTheme ? '#1f1f1f' : '#fafafa',
                    color: isDarkTheme ? '#d4d4d4' : '#262626',
                    height: '100%',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {outputCode.split('\n').map((line, index) => (
                      <div key={index} style={{ display: 'flex' }}>
                        <span style={{ 
                          color: '#999', 
                          marginRight: '12px',
                          minWidth: '30px',
                          textAlign: 'right',
                          userSelect: 'none'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ flex: 1 }}>{line}</span>
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isDarkTheme ? '#1f1f1f' : '#fafafa',
                    color: '#999',
                    fontSize: '14px',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <FormatPainterOutlined style={{ fontSize: '24px' }} />
                    <div>정렬된 코드가 여기에 표시됩니다</div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Help Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            코드 가독성 정렬기 도움말
          </div>
        }
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Tabs activeKey={helpActiveTab} onChange={setHelpActiveTab}>
          <TabPane tab={
            <span>
              <InfoCircleOutlined />
              개요
            </span>
          } key="overview">
            <Alert
              message="코드 가독성 정렬기란?"
              description="코드의 구분자(=, :, // 등)를 기준으로 좌우를 정렬하여 가독성을 높이는 도구입니다."
              type="info"
              style={{ marginBottom: '16px' }}
            />
            
            <Title level={4}>주요 기능</Title>
            <List
              dataSource={[
                '구분자 기반 스마트 정렬 - 등호, 콜론, 주석 등을 기준으로 정렬',
                '따옴표 내부 무시 - 문자열 안의 구분자는 무시하고 정렬',
                '다양한 퀵 액션 - 알파벳 정렬, 중복 제거, 주석 처리 등',
                '실시간 미리보기 - 입력과 동시에 결과 확인',
                '키보드 단축키 지원 - 빠른 작업을 위한 단축키 제공'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">{index + 1}</Tag>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={
            <span>
              <PlayCircleOutlined />
              사용법
            </span>
          } key="tutorial">
            <Steps direction="vertical" current={-1}>
              <Step
                title="코드 입력"
                description={
                  <div>
                    <Paragraph>왼쪽 입력 영역에 정렬하고 싶은 코드를 입력합니다.</Paragraph>
                    <Paragraph>예: 변수 선언, 객체 속성, CSS 속성 등</Paragraph>
                  </div>
                }
                icon={<EditOutlined />}
              />
              <Step
                title="구분자 선택"
                description={
                  <div>
                    <Paragraph>정렬 기준이 될 구분자를 선택합니다.</Paragraph>
                    <Paragraph>기본값: <Tag>=</Tag> <Tag>:</Tag> <Tag>//</Tag> <Tag>,</Tag> <Tag>;</Tag></Paragraph>
                  </div>
                }
                icon={<SettingOutlined />}
              />
              <Step
                title="옵션 설정"
                description={
                  <div>
                    <Paragraph>필요에 따라 정렬 옵션을 조정합니다.</Paragraph>
                    <List size="small">
                      <List.Item>• 따옴표 내부 무시: 문자열 안의 구분자 무시</List.Item>
                      <List.Item>• 구분자 주변 공백: 구분자 앞뒤에 공백 추가</List.Item>
                      <List.Item>• 오른쪽 공백 정리: 우측 불필요한 공백 제거</List.Item>
                    </List>
                  </div>
                }
                icon={<SettingOutlined />}
              />
              <Step
                title="정렬 실행"
                description={
                  <div>
                    <Paragraph>'정렬 실행' 버튼을 클릭하거나 <Tag>Ctrl + Enter</Tag>를 누릅니다.</Paragraph>
                    <Paragraph>오른쪽에 정렬된 결과가 표시됩니다.</Paragraph>
                  </div>
                }
                icon={<PlayCircleOutlined />}
              />
              <Step
                title="결과 활용"
                description={
                  <div>
                    <Paragraph>정렬된 코드를 복사하여 사용합니다.</Paragraph>
                    <Paragraph>복사 버튼 클릭 또는 <Tag>Ctrl + Shift + C</Tag> 사용</Paragraph>
                  </div>
                }
                icon={<CopyOutlined />}
              />
            </Steps>
          </TabPane>

          <TabPane tab={
            <span>
              <BulbOutlined />
              예제
            </span>
          } key="examples">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="기본 변수 정렬" size="small">
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {examples.basic}
                  </pre>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => loadExample(examples.basic)}
                    style={{ marginTop: '8px' }}
                  >
                    예제 로드
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="주석 포함 정렬" size="small">
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {examples.withComments}
                  </pre>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => loadExample(examples.withComments)}
                    style={{ marginTop: '8px' }}
                  >
                    예제 로드
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="객체 속성 정렬" size="small">
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {examples.object}
                  </pre>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => loadExample(examples.object)}
                    style={{ marginTop: '8px' }}
                  >
                    예제 로드
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="CSS 속성 정렬" size="small">
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {examples.css}
                  </pre>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => loadExample(examples.css)}
                    style={{ marginTop: '8px' }}
                  >
                    예제 로드
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={
            <span>
              <CodeOutlined />
              단축키
            </span>
          } key="shortcuts">
            <Alert
              message="키보드 단축키로 더 빠르게!"
              description="자주 사용하는 기능을 키보드 단축키로 실행할 수 있습니다."
              type="success"
              style={{ marginBottom: '16px' }}
            />

            <List
              dataSource={shortcuts}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text strong>{item.action}</Text>
                    <Tag color="blue" style={{ fontFamily: 'Monaco, monospace' }}>
                      {item.key}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />

            <Divider />
            <Title level={5}>퀵 액션 팁</Title>
            <Collapse ghost>
              <Panel header="정렬 관련" key="sort">
                <List size="small">
                  <List.Item>• 알파벳 정렬: 변수명이나 목록을 A-Z 순서로 정렬</List.Item>
                  <List.Item>• 역순 정렬: Z-A 순서로 정렬</List.Item>
                  <List.Item>• 중복 제거: 동일한 줄 제거</List.Item>
                </List>
              </Panel>
              <Panel header="정리 관련" key="clean">
                <List size="small">
                  <List.Item>• 빈 줄 제거: 공백 줄 모두 삭제</List.Item>
                  <List.Item>• 공백 정리: 줄 앞뒤 불필요한 공백 제거</List.Item>
                  <List.Item>• 줄 번호: 각 줄에 번호 추가</List.Item>
                </List>
              </Panel>
              <Panel header="주석 관련" key="comment">
                <List size="small">
                  <List.Item>• 주석 추출: //, #, /* 등으로 시작하는 줄만 추출</List.Item>
                  <List.Item>• 주석 제거: 모든 주석 줄 삭제</List.Item>
                </List>
              </Panel>
            </Collapse>
          </TabPane>
        </Tabs>
      </Modal>
    </Layout>
  );
};

export default App;