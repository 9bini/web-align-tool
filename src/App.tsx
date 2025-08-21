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
  message,
  Tooltip,
  Tag,
  Affix
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  FormatPainterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  BgColorsOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  ApiOutlined,
  TableOutlined,
  NumberOutlined,
  CalendarOutlined,
  LinkOutlined,
  MailOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AdvancedSorter, SortingOptions, sortingPresets } from './utils/sortingUtils';
import { LanguageSpecificSorter, LanguageSortingOptions } from './utils/languageSpecificSorters';
import { DataTypeSorter, DataTypeSortingOptions } from './utils/dataTypeSorters';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('javascript');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const detectLanguage = (code: string): string => {
    if (code.includes('import ') || code.includes('export ') || code.includes('const ') || code.includes('function')) return 'javascript';
    if (code.includes('def ') || code.includes('import ') || code.includes('from ')) return 'python';
    if (code.includes('{') && code.includes(':') && code.includes('}')) return 'css';
    if (code.includes('<') && code.includes('>')) return 'html';
    if (code.includes('SELECT') || code.includes('FROM') || code.includes('WHERE')) return 'sql';
    if (code.includes('"') && code.includes(':') && (code.includes('{') || code.includes('['))) return 'json';
    return 'text';
  };

  const executeSort = async (sortFunction: () => string, actionName: string) => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = sortFunction();
      setOutputCode(result);
      setDetectedLanguage(detectLanguage(result));
      message.success(`${actionName} 완료!`);
    } catch (error) {
      message.error(`${actionName} 중 오류가 발생했습니다.`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick action functions
  const quickActions = [
    {
      name: '알파벳 정렬',
      icon: <SortAscendingOutlined />,
      color: 'blue',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return lines.sort().join('\n');
      }, '알파벳 정렬')
    },
    {
      name: '역순 정렬',
      icon: <SortDescendingOutlined />,
      color: 'purple',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return lines.sort().reverse().join('\n');
      }, '역순 정렬')
    },
    {
      name: 'JS 객체 정렬',
      icon: <CodeOutlined />,
      color: 'orange',
      action: () => executeSort(() => sortingPresets.sortJSObjectProperties(inputCode), 'JS 객체 정렬')
    },
    {
      name: 'CSS 속성 정렬',
      icon: <BgColorsOutlined />,
      color: 'cyan',
      action: () => executeSort(() => sortingPresets.sortCSSProperties(inputCode), 'CSS 속성 정렬')
    },
    {
      name: 'JSON 키 정렬',
      icon: <FileTextOutlined />,
      color: 'green',
      action: () => executeSort(() => {
        return LanguageSpecificSorter.sortJSON(inputCode, { language: 'json', sortJSONKeys: true });
      }, 'JSON 키 정렬')
    },
    {
      name: 'Import 정렬',
      icon: <ApiOutlined />,
      color: 'geekblue',
      action: () => executeSort(() => {
        const lang = detectLanguage(inputCode);
        if (lang === 'javascript') {
          return LanguageSpecificSorter.sortJavaScript(inputCode, { language: 'javascript', sortImports: true });
        } else if (lang === 'python') {
          return LanguageSpecificSorter.sortPython(inputCode, { language: 'python', sortImports: true });
        }
        return inputCode;
      }, 'Import 정렬')
    },
    {
      name: 'HTML 속성 정렬',
      icon: <TableOutlined />,
      color: 'red',
      action: () => executeSort(() => {
        return LanguageSpecificSorter.sortHTML(inputCode, { language: 'html', sortHTMLAttributes: true });
      }, 'HTML 속성 정렬')
    },
    {
      name: '숫자 정렬',
      icon: <NumberOutlined />,
      color: 'volcano',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return DataTypeSorter.sortByDataType(lines, { dataType: 'number', sortOrder: 'asc' }).join('\n');
      }, '숫자 정렬')
    },
    {
      name: '날짜 정렬',
      icon: <CalendarOutlined />,
      color: 'magenta',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return DataTypeSorter.sortByDataType(lines, { dataType: 'date', sortOrder: 'asc' }).join('\n');
      }, '날짜 정렬')
    },
    {
      name: 'URL 정렬',
      icon: <LinkOutlined />,
      color: 'lime',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return DataTypeSorter.sortByDataType(lines, { dataType: 'url', sortOrder: 'asc' }).join('\n');
      }, 'URL 정렬')
    },
    {
      name: '이메일 정렬',
      icon: <MailOutlined />,
      color: 'gold',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return DataTypeSorter.sortByDataType(lines, { dataType: 'email', sortOrder: 'asc' }).join('\n');
      }, '이메일 정렬')
    },
    {
      name: 'IP 주소 정렬',
      icon: <GlobalOutlined />,
      color: 'pink',
      action: () => executeSort(() => {
        const lines = inputCode.split('\n');
        return DataTypeSorter.sortByDataType(lines, { dataType: 'ip', sortOrder: 'asc' }).join('\n');
      }, 'IP 주소 정렬')
    }
  ];

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
              스마트 코드 정렬 도구
            </Title>
          </div>
          <Space>
            <Tag color={isDarkTheme ? 'cyan' : 'blue'}>
              {detectedLanguage.toUpperCase()}
            </Tag>
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
            <Affix offsetTop={80}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <OrderedListOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <span>퀵 정렬 액션</span>
                  </div>
                }
                style={{ 
                  background: isDarkTheme ? '#262626' : '#fff',
                  marginBottom: '16px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      type="primary"
                      ghost
                      size="small"
                      icon={action.icon}
                      onClick={action.action}
                      loading={isProcessing}
                      style={{ 
                        borderColor: `var(--ant-${action.color}-color)`,
                        color: `var(--ant-${action.color}-color)`,
                        minWidth: '100px'
                      }}
                    >
                      {action.name}
                    </Button>
                  ))}
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ textAlign: 'center' }}>
                  <Space>
                    <Button 
                      onClick={clearAll} 
                      icon={<ClearOutlined />}
                      danger
                      ghost
                    >
                      모두 지우기
                    </Button>
                  </Space>
                </div>
              </Card>
            </Affix>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <CodeOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    입력 코드
                  </span>
                  <Tag color="green">{inputCode.split('\n').length} 줄</Tag>
                </div>
              }
              style={{ 
                height: '100%',
                background: isDarkTheme ? '#262626' : '#fff'
              }}
            >
              <div style={{ height: '600px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                <TextArea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="여기에 정렬할 코드를 입력하세요..."
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
                    <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    정렬된 코드
                  </span>
                  <Space>
                    <Tag color="blue">{outputCode.split('\n').length} 줄</Tag>
                    <Tooltip title="클립보드에 복사">
                      <Button 
                        type="text" 
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
              <div style={{ height: '600px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'auto' }}>
                {outputCode ? (
                  <SyntaxHighlighter
                    language={detectedLanguage}
                    style={isDarkTheme ? vscDarkPlus : vs}
                    customStyle={{
                      margin: 0,
                      padding: '16px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      background: 'transparent',
                      height: '100%'
                    }}
                    showLineNumbers
                    wrapLines
                  >
                    {outputCode}
                  </SyntaxHighlighter>
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isDarkTheme ? '#1f1f1f' : '#fafafa',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    정렬된 코드가 여기에 표시됩니다...
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