/**
 * 컨벤션 편집기 컴포넌트
 * 사용자가 포매팅 컨벤션을 직접 수정하고 커스터마이징할 수 있는 인터페이스를 제공합니다.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Slider, 
  Collapse, 
  Typography, 
  Space, 
  Button, 
  Divider,
  InputNumber,
  Alert,
  Tag,
  Tooltip,
  Row,
  Col,
  message
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { 
  SupportedLanguage, 
  FormattingConvention
} from '../types/FormattingTypes';

const { Panel } = Collapse;
const { Text } = Typography;
const { Option } = Select;

interface ConventionEditorProps {
  /** 현재 언어 */
  language: SupportedLanguage;
  /** 편집할 컨벤션 */
  convention: FormattingConvention;
  /** 컨벤션이 변경될 때 호출되는 콜백 */
  onConventionChange: (convention: FormattingConvention) => void;
  /** 커스텀 컨벤션 저장 콜백 */
  onSaveCustom?: (name: string, convention: FormattingConvention) => void;
  /** 컴포넌트 표시 여부 */
  visible?: boolean;
}

/**
 * 컨벤션 편집기 컴포넌트
 */
export const ConventionEditor: React.FC<ConventionEditorProps> = ({
  language,
  convention,
  onConventionChange,
  onSaveCustom,
  visible = true
}) => {
  const [form] = Form.useForm();
  const [customName, setCustomName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * 폼 값이 변경될 때 호출
   */
  const handleFormChange = (_: any, allFields: any) => {
    setHasChanges(true);
    const updatedConvention = { ...convention, ...allFields };
    onConventionChange(updatedConvention);
  };

  /**
   * 기본 컨벤션으로 리셋
   */
  const handleReset = () => {
    form.resetFields();
    setHasChanges(false);
    message.info('기본 설정으로 리셋되었습니다.');
  };

  /**
   * 커스텀 컨벤션 저장
   */
  const handleSaveCustom = () => {
    if (!customName.trim()) {
      message.warning('컨벤션 이름을 입력해주세요.');
      return;
    }
    
    if (onSaveCustom) {
      onSaveCustom(customName, convention);
      setCustomName('');
      setHasChanges(false);
      message.success(`"${customName}" 컨벤션이 저장되었습니다.`);
    }
  };

  /**
   * 컨벤션이 변경될 때 폼 업데이트
   */
  useEffect(() => {
    form.setFieldsValue(convention);
    setHasChanges(false);
  }, [convention, form]);

  if (!visible) return null;

  /**
   * 기본 설정 섹션 렌더링
   */
  const renderBasicSettings = () => (
    <Panel header="🔧 기본 설정" key="basic">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item 
            name="indentationType" 
            label={
              <span>
                들여쓰기 타입
                <Tooltip title="탭 또는 스페이스를 선택하세요">
                  <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                </Tooltip>
              </span>
            }
          >
            <Select>
              <Option value="space">스페이스</Option>
              <Option value="tab">탭</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            name="indentSize" 
            label={
              <span>
                들여쓰기 크기
                <Tooltip title="들여쓰기 스페이스 개수 또는 탭 너비">
                  <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                </Tooltip>
              </span>
            }
          >
            <InputNumber min={1} max={8} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item 
            name="maxLineLength" 
            label={
              <span>
                최대 줄 길이
                <Tooltip title="한 줄에 허용되는 최대 문자 수">
                  <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                </Tooltip>
              </span>
            }
          >
            <Slider min={60} max={200} marks={{ 80: '80', 100: '100', 120: '120' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item 
              name="insertFinalNewline" 
              label="파일 끝 개행 문자 추가"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item 
              name="trimTrailingWhitespace" 
              label="줄 끝 공백 제거"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Col>
      </Row>
    </Panel>
  );

  /**
   * Java 언어별 설정
   */
  const renderJavaSettings = () => {
    if (language !== 'java') return null;
    
    return (
      <Panel header="☕ Java 전용 설정" key="java">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="braceStyle" label="중괄호 스타일">
              <Select>
                <Option value="kr">K&R (권장)</Option>
                <Option value="allman">Allman</Option>
                <Option value="gnu">GNU</Option>
                <Option value="horstmann">Horstmann</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="organizeImports" label="Import 정렬" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="blankLinesBetweenMethods" label="메서드 간 빈 줄">
              <InputNumber min={0} max={3} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="blankLinesBetweenClasses" label="클래스 간 빈 줄">
              <InputNumber min={0} max={5} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="separateStaticImports" label="Static Import 분리" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Panel>
    );
  };

  /**
   * JavaScript 언어별 설정
   */
  const renderJavaScriptSettings = () => {
    if (language !== 'javascript') return null;
    
    return (
      <Panel header="🚀 JavaScript 전용 설정" key="javascript">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item name="quoteStyle" label="따옴표 스타일">
              <Select>
                <Option value="single">작은따옴표 (')</Option>
                <Option value="double">큰따옴표 (")</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="useSemicolons" label="세미콜론 사용" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="trailingComma" label="Trailing Comma">
              <Select>
                <Option value="none">사용 안함</Option>
                <Option value="es5">ES5 호환</Option>
                <Option value="all">모든 곳</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="arrowParens" label="화살표 함수 괄호">
              <Select>
                <Option value="always">항상 사용</Option>
                <Option value="avoid">가능하면 생략</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="jsxQuoteStyle" label="JSX 따옴표">
              <Select>
                <Option value="single">작은따옴표</Option>
                <Option value="double">큰따옴표</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Panel>
    );
  };

  /**
   * JSON 언어별 설정
   */
  const renderJsonSettings = () => {
    if (language !== 'json') return null;
    
    return (
      <Panel header="📄 JSON 전용 설정" key="json">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="quoteStyle" label="따옴표 스타일">
              <Select>
                <Option value="double">큰따옴표 (표준)</Option>
                <Option value="single">작은따옴표</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sortKeys" label="키 정렬" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="arrayWrapThreshold" label="배열 줄바꿈 기준">
              <InputNumber min={1} max={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="objectWrapThreshold" label="객체 줄바꿈 기준">
              <InputNumber min={1} max={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="autoWrapNested" label="중첩 자동 줄바꿈" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Panel>
    );
  };

  /**
   * SQL 언어별 설정
   */
  const renderSqlSettings = () => {
    if (language !== 'sql') return null;
    
    return (
      <Panel header="🗃️ SQL 전용 설정" key="sql">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item name="keywordCase" label="키워드 대소문자">
              <Select>
                <Option value="upper">대문자</Option>
                <Option value="lower">소문자</Option>
                <Option value="capitalize">첫글자 대문자</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="identifierCase" label="식별자 대소문자">
              <Select>
                <Option value="upper">대문자</Option>
                <Option value="lower">소문자</Option>
                <Option value="preserve">그대로 유지</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="commaPosition" label="쉼표 위치">
              <Select>
                <Option value="trailing">뒤</Option>
                <Option value="leading">앞</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="selectColumnsOnNewLine" label="SELECT 컬럼 줄바꿈" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="joinOnNewLine" label="JOIN 절 줄바꿈" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="indentSubqueries" label="서브쿼리 들여쓰기" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Panel>
    );
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            컨벤션 편집기
          </span>
          {hasChanges && (
            <Tag color="orange" icon={<ExperimentOutlined />}>
              변경된 설정이 있습니다
            </Tag>
          )}
        </div>
      }
      extra={
        <Space>
          <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>
            리셋
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Alert
        message="컨벤션 설정을 사용자 정의하세요"
        description="각 설정의 효과를 실시간으로 확인하고, 팀만의 컨벤션을 만들어보세요."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={convention}
        onValuesChange={handleFormChange}
      >
        <Collapse defaultActiveKey={['basic']} ghost>
          {renderBasicSettings()}
          {renderJavaSettings()}
          {renderJavaScriptSettings()}
          {renderJsonSettings()}
          {renderSqlSettings()}
        </Collapse>
      </Form>

      {/* 커스텀 컨벤션 저장 */}
      {onSaveCustom && (
        <>
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>커스텀 컨벤션으로 저장:</Text>
            <Input
              placeholder="컨벤션 이름 입력 (예: 우리팀 JavaScript 스타일)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{ flex: 1 }}
              onPressEnter={handleSaveCustom}
            />
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSaveCustom}
              disabled={!customName.trim() || !hasChanges}
            >
              저장
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ConventionEditor;