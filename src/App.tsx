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
  SortAscendingOutlined,
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
  const [activeMode, setActiveMode] = useState<'delimiter' | 'json'>('delimiter');

  const sortByDelimiter = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = inputCode.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        message.warning('정렬할 내용이 없습니다.');
        setIsProcessing(false);
        return;
      }

      // 각 행을 '/' 구분자로 분할하여 컬럼으로 나눔
      const rows = lines.map(line => line.split('/').map(col => col.trim()));
      
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
        return alignedRow.join(' / ');
      });
      
      setOutputCode(alignedLines.join('\n'));
      message.success('/ 구분자 기준 컬럼 정렬 완료!');
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
              {activeMode === 'delimiter' ? '/ 구분자 컬럼 정렬기' : 'JSON 포맷터'}
            </Title>
          </div>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Space size="large">
                    <Button 
                      type={activeMode === 'delimiter' ? 'primary' : 'default'}
                      size="large"
                      icon={<SortAscendingOutlined />}
                      onClick={() => {
                        setActiveMode('delimiter');
                        setInputCode('');
                        setOutputCode('');
                      }}
                    >
                      컬럼 정렬
                    </Button>
                    <Button 
                      type={activeMode === 'json' ? 'primary' : 'default'}
                      size="large"
                      icon={<CodeOutlined />}
                      onClick={() => {
                        setActiveMode('json');
                        setInputCode('');
                        setOutputCode('');
                      }}
                    >
                      JSON 포맷터
                    </Button>
                  </Space>
                  
                  {activeMode === 'delimiter' && (
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<SortAscendingOutlined />}
                      onClick={sortByDelimiter}
                      loading={isProcessing}
                      style={{ minWidth: '200px' }}
                    >
                      / 구분자 컬럼 정렬
                    </Button>
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
                </Space>
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
                  placeholder={activeMode === 'delimiter' 
                    ? `/ 구분자를 포함한 텍스트를 입력하세요... 예:
apple/fruit/red
banana/fruit/yellow  
carrot/vegetable/orange
tomato/vegetable/red`
                    : `JSON 데이터를 입력하세요... 예:
{
  "name": "John",
  "age": 30,
  "items": ["apple", "banana"],
  "address": {
    "city": "Seoul",
    "country": "Korea"
  }
}`}
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