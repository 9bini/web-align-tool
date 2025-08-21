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
  Tooltip
} from 'antd';
import { CopyOutlined, ClearOutlined, FormatPainterOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface FormatterOptions {
  indentType: 'spaces' | 'tabs';
  indentSize: number;
  removeEmptyLines: boolean;
  trimWhitespace: boolean;
  sortLines: boolean;
  removeDuplicates: boolean;
  addLineNumbers: boolean;
  convertCase: 'none' | 'upper' | 'lower' | 'camel' | 'pascal' | 'snake' | 'kebab';
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
    convertCase: 'none'
  });

  const formatCode = () => {
    if (!inputCode.trim()) {
      message.warning('코드를 입력해주세요.');
      return;
    }

    let lines = inputCode.split('\n');

    if (options.trimWhitespace) {
      lines = lines.map(line => line.trim());
    }

    if (options.removeEmptyLines) {
      lines = lines.filter(line => line.length > 0);
    }

    if (options.removeDuplicates) {
      lines = [...new Set(lines)];
    }

    if (options.sortLines) {
      lines = lines.sort();
    }

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

      const indent = options.indentType === 'spaces' 
        ? ' '.repeat(options.indentSize)
        : '\t';
      
      if (formattedLine.trim()) {
        formattedLine = indent + formattedLine;
      }

      if (options.addLineNumbers) {
        const lineNumber = String(index + 1).padStart(3, '0');
        formattedLine = `${lineNumber}: ${formattedLine}`;
      }

      return formattedLine;
    });

    setOutputCode(lines.join('\n'));
    message.success('코드 정렬이 완료되었습니다.');
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
            </Row>

            <Divider />
            
            <Space>
              <Button type="primary" onClick={formatCode} icon={<FormatPainterOutlined />}>
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