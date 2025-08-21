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
  Tag
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  EditOutlined,
  CheckSquareOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const sortByDelimiter = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = inputCode.split('\n');
      
      // Sort lines by content before the '/' delimiter
      const sortedLines = lines.sort((a, b) => {
        const aBeforeSlash = a.split('/')[0].trim();
        const bBeforeSlash = b.split('/')[0].trim();
        return aBeforeSlash.localeCompare(bBeforeSlash);
      });
      
      setOutputCode(sortedLines.join('\n'));
      message.success('/ 구분자 기준 정렬 완료!');
    } catch (error) {
      message.error('정렬 중 오류가 발생했습니다.');
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
    message.info('모든 내용이 지워졌습니다.');
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
              / 구분자 정렬기
            </Title>
          </div>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SortAscendingOutlined />}
                  onClick={sortByDelimiter}
                  loading={isProcessing}
                  style={{ minWidth: '200px' }}
                >
                  / 구분자로 정렬
                </Button>
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
              <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                <TextArea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={`/ 구분자를 포함한 텍스트를 입력하세요... 예:
apple/과일
banana/과일
carrot/야채
tomato/야채`}
                  style={{ 
                    height: '100%',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: 'none',
                    background: '#fafafa',
                    color: '#262626'
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
              style={{ height: '100%' }}
            >
              <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                {outputCode ? (
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                    background: '#fafafa',
                    color: '#262626',
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
                    background: '#fafafa',
                    color: '#999',
                    fontSize: '14px',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <SortAscendingOutlined style={{ fontSize: '24px' }} />
                    <div>정렬된 결과가 여기에 표시됩니다</div>
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