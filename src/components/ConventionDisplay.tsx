/**
 * 컨벤션 표시 컴포넌트
 * 선택된 컨벤션의 상세 정보를 시각적으로 표시하고 이해하기 쉽게 설명합니다.
 */

import React from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Descriptions,
  Alert,
  Divider,
  Row,
  Col,
  Progress
} from 'antd';
import {
  CheckCircleOutlined,
  StarOutlined,
  SettingOutlined,
  BulbOutlined
} from '@ant-design/icons';
import {
  SupportedLanguage,
  FormattingConvention,
  PresetConvention,
  JavaFormattingConvention,
  JavaScriptFormattingConvention,
  JsonFormattingConvention,
  SqlFormattingConvention
} from '../types/FormattingTypes';

const { Title, Text, Paragraph } = Typography;

interface ConventionDisplayProps {
  /** 현재 언어 */
  language: SupportedLanguage;
  /** 선택된 프리셋 (있는 경우) */
  preset?: PresetConvention | null;
  /** 컨벤션 설정 */
  convention: FormattingConvention;
  /** 컴포넌트 표시 여부 */
  visible?: boolean;
}

/**
 * 컨벤션 표시 컴포넌트
 */
export const ConventionDisplay: React.FC<ConventionDisplayProps> = ({
  language,
  preset,
  convention,
  visible = true
}) => {
  if (!visible) return null;

  /**
   * 언어별 아이콘 반환
   */
  const getLanguageIcon = (lang: SupportedLanguage) => {
    const icons = {
      java: '☕',
      javascript: '🚀',
      json: '📄',
      kotlin: '🎯',
      sql: '🗃️'
    };
    return icons[lang] || '📝';
  };


  /**
   * Java 언어별 설정 표시
   */
  const renderJavaSpecific = () => {
    if (language !== 'java') return null;
    const javaConv = convention as JavaFormattingConvention;
    
    return (
      <Card size="small" title="☕ Java 전용 설정" type="inner">
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary">중괄호 스타일:</Text>
            <Tag color="green" style={{ marginLeft: 8 }}>
              {javaConv.braceStyle?.toUpperCase()}
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">Import 정렬:</Text>
            <Tag color={javaConv.organizeImports ? 'green' : 'red'} style={{ marginLeft: 8 }}>
              {javaConv.organizeImports ? '활성화' : '비활성화'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">메서드 간 빈 줄:</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {javaConv.blankLinesBetweenMethods}줄
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">클래스 간 빈 줄:</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {javaConv.blankLinesBetweenClasses}줄
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  };

  /**
   * JavaScript 언어별 설정 표시
   */
  const renderJavaScriptSpecific = () => {
    if (language !== 'javascript') return null;
    const jsConv = convention as JavaScriptFormattingConvention;
    
    return (
      <Card size="small" title="🚀 JavaScript 전용 설정" type="inner">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Text type="secondary">따옴표:</Text>
            <Tag color="purple" style={{ marginLeft: 8 }}>
              {jsConv.quoteStyle === 'single' ? "'" : '"'}
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">세미콜론:</Text>
            <Tag color={jsConv.useSemicolons ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
              {jsConv.useSemicolons ? '사용' : '생략'}
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">Trailing Comma:</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {jsConv.trailingComma}
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">화살표 함수 괄호:</Text>
            <Tag color="cyan" style={{ marginLeft: 8 }}>
              {jsConv.arrowParens === 'always' ? '항상 사용' : '가능하면 생략'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">JSX 따옴표:</Text>
            <Tag color="magenta" style={{ marginLeft: 8 }}>
              {jsConv.jsxQuoteStyle === 'single' ? "'" : '"'}
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  };

  /**
   * JSON 언어별 설정 표시
   */
  const renderJsonSpecific = () => {
    if (language !== 'json') return null;
    const jsonConv = convention as JsonFormattingConvention;
    
    return (
      <Card size="small" title="📄 JSON 전용 설정" type="inner">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Text type="secondary">키 정렬:</Text>
            <Tag color={jsonConv.sortKeys ? 'green' : 'default'} style={{ marginLeft: 8 }}>
              {jsonConv.sortKeys ? '정렬' : '그대로'}
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">배열 줄바꿈:</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {jsonConv.arrayWrapThreshold}개 이상
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">객체 줄바꿈:</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {jsonConv.objectWrapThreshold}개 이상
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  };

  /**
   * SQL 언어별 설정 표시
   */
  const renderSqlSpecific = () => {
    if (language !== 'sql') return null;
    const sqlConv = convention as SqlFormattingConvention;
    
    return (
      <Card size="small" title="🗃️ SQL 전용 설정" type="inner">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Text type="secondary">키워드:</Text>
            <Tag color="red" style={{ marginLeft: 8 }}>
              {sqlConv.keywordCase === 'upper' ? '대문자' : 
               sqlConv.keywordCase === 'lower' ? '소문자' : '첫글자대문자'}
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">식별자:</Text>
            <Tag color="orange" style={{ marginLeft: 8 }}>
              {sqlConv.identifierCase === 'upper' ? '대문자' : 
               sqlConv.identifierCase === 'lower' ? '소문자' : '그대로'}
            </Tag>
          </Col>
          <Col span={8}>
            <Text type="secondary">쉼표 위치:</Text>
            <Tag color="green" style={{ marginLeft: 8 }}>
              {sqlConv.commaPosition === 'leading' ? '앞' : '뒤'}
            </Tag>
          </Col>
        </Row>
      </Card>
    );
  };

  /**
   * 컨벤션 요약 정보
   */
  const renderSummary = () => (
    <Descriptions column={2} size="small">
      <Descriptions.Item label="최대 줄 길이">
        <Text code>{convention.maxLineLength}자</Text>
      </Descriptions.Item>
      <Descriptions.Item label="파일 끝 개행">
        <Tag color={convention.insertFinalNewline ? 'green' : 'red'}>
          {convention.insertFinalNewline ? '추가' : '추가 안함'}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="줄 끝 공백">
        <Tag color={convention.trimTrailingWhitespace ? 'green' : 'orange'}>
          {convention.trimTrailingWhitespace ? '제거' : '유지'}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="들여쓰기">
        <Text code>
          {convention.indentationType === 'tab' ? 
            `${convention.indentSize} 탭` : 
            `${convention.indentSize} 스페이스`
          }
        </Text>
      </Descriptions.Item>
    </Descriptions>
  );

  /**
   * 프리셋 정보 헤더
   */
  const renderPresetHeader = () => {
    if (!preset) return null;
    
    const stars = Array.from({ length: Math.floor(preset.popularity / 2) }, (_, i) => (
      <StarOutlined key={i} style={{ color: '#faad14', fontSize: '14px' }} />
    ));
    
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Title level={4} style={{ margin: 0 }}>
              {getLanguageIcon(language)} {preset.name}
            </Title>
            {preset.isOfficial && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                공식
              </Tag>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{stars}</span>
            <Text type="secondary">
              ({preset.popularity}/10)
            </Text>
          </div>
        </div>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          {preset.description}
        </Paragraph>
        <div style={{ marginTop: 8 }}>
          <Progress 
            percent={preset.popularity * 10} 
            size="small" 
            status="active"
            format={() => `인기도 ${preset.popularity}/10`}
          />
        </div>
      </div>
    );
  };

  /**
   * 사용 팁 표시
   */
  const renderTips = () => (
    <Alert
      message="💡 컨벤션 사용 팁"
      description={
        <div>
          <div>• 팀원과 동일한 컨벤션을 사용하여 코드 일관성을 유지하세요</div>
          <div>• 프로젝트 초기에 컨벤션을 설정하고 문서화하세요</div>
          <div>• IDE 설정을 내보내어 팀원들과 공유하세요</div>
        </div>
      }
      type="info"
      showIcon
      icon={<BulbOutlined />}
      style={{ marginTop: 16 }}
    />
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingOutlined style={{ color: '#1890ff' }} />
            컨벤션 상세 정보
          </div>
        }
        size="small"
      >
        {renderPresetHeader()}
        
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: '14px', marginBottom: 8, display: 'block' }}>
            기본 설정 요약
          </Text>
          {renderSummary()}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {renderJavaSpecific()}
          {renderJavaScriptSpecific()}
          {renderJsonSpecific()}
          {renderSqlSpecific()}
        </Space>

        {renderTips()}
      </Card>
    </div>
  );
};

export default ConventionDisplay;