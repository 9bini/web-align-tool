/**
 * 컨벤션 문서화 컴포넌트
 * 각 컨벤션 규칙의 상세한 설명과 예시를 제공합니다.
 */

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Collapse,
  Space,
  Tag,
  Alert,
  Row,
  Col,
  Input
} from 'antd';
import {
  InfoCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { SupportedLanguage } from '../types/FormattingTypes';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface ConventionRule {
  id: string;
  name: string;
  category: string;
  languages: SupportedLanguage[];
  description: string;
  impact: 'high' | 'medium' | 'low';
  examples: {
    before: string;
    after: string;
    description: string;
  }[];
  tips: string[];
  commonMistakes: string[];
}

interface ConventionDocumentationProps {
  /** 현재 언어 */
  language?: SupportedLanguage;
  /** 컴포넌트 표시 여부 */
  visible?: boolean;
}

/**
 * 컨벤션 규칙 데이터
 */
const CONVENTION_RULES: ConventionRule[] = [
  {
    id: 'indentation',
    name: '들여쓰기',
    category: '기본 설정',
    languages: ['java', 'javascript', 'json', 'kotlin', 'sql'],
    description: '코드 블록의 중첩 레벨을 시각적으로 표현하는 방법입니다.',
    impact: 'high',
    examples: [
      {
        before: `function example() {
if (condition) {
console.log("Hello");
}
}`,
        after: `function example() {
  if (condition) {
    console.log("Hello");
  }
}`,
        description: '2칸 스페이스 들여쓰기 적용'
      }
    ],
    tips: [
      '팀 전체가 동일한 들여쓰기 방식을 사용하세요',
      'IDE 설정으로 자동 적용할 수 있습니다',
      '일반적으로 2-4칸 스페이스 또는 탭을 사용합니다'
    ],
    commonMistakes: [
      '탭과 스페이스를 섞어서 사용',
      '들여쓰기 크기가 일관되지 않음',
      '중첩 레벨에 따른 들여쓰기 누락'
    ]
  },
  {
    id: 'line-length',
    name: '최대 줄 길이',
    category: '기본 설정',
    languages: ['java', 'javascript', 'json', 'kotlin', 'sql'],
    description: '한 줄에 허용되는 최대 문자 수를 제한하여 가독성을 향상시킵니다.',
    impact: 'medium',
    examples: [
      {
        before: `const veryLongVariableName = someFunction(parameter1, parameter2, parameter3, parameter4, parameter5);`,
        after: `const veryLongVariableName = someFunction(
  parameter1, 
  parameter2, 
  parameter3, 
  parameter4, 
  parameter5
);`,
        description: '80자 제한으로 인한 줄바꿈'
      }
    ],
    tips: [
      '80-120자 사이가 일반적입니다',
      '모니터 크기와 팀 선호도를 고려하세요',
      '길어지는 코드는 자동으로 줄바꿈됩니다'
    ],
    commonMistakes: [
      '너무 짧은 제한으로 인한 과도한 줄바꿈',
      '제한을 무시하고 긴 줄 작성',
      '문자열 중간에서 줄바꿈'
    ]
  },
  {
    id: 'brace-style',
    name: '중괄호 스타일',
    category: 'Java/JavaScript',
    languages: ['java', 'javascript', 'kotlin'],
    description: '중괄호 위치와 스타일을 정의합니다.',
    impact: 'medium',
    examples: [
      {
        before: `if (condition)
{
    doSomething();
}`,
        after: `if (condition) {
    doSomething();
}`,
        description: 'K&R 스타일 (권장)'
      }
    ],
    tips: [
      'K&R 스타일이 가장 널리 사용됩니다',
      '팀 내에서 일관된 스타일을 유지하세요',
      'IDE에서 자동 포매팅 설정 가능'
    ],
    commonMistakes: [
      '스타일이 섞여서 사용됨',
      '닫는 중괄호 들여쓰기 오류',
      '한 줄 if문에서 중괄호 생략'
    ]
  },
  {
    id: 'quote-style',
    name: '따옴표 스타일',
    category: 'JavaScript/JSON',
    languages: ['javascript', 'json'],
    description: '문자열에 사용할 따옴표 종류를 정의합니다.',
    impact: 'low',
    examples: [
      {
        before: `const message = "Hello World";
const name = 'John';`,
        after: `const message = 'Hello World';
const name = 'John';`,
        description: '작은따옴표로 통일'
      }
    ],
    tips: [
      '프로젝트 전체에서 일관성을 유지하세요',
      'JavaScript는 작은따옴표, JSON은 큰따옴표가 표준',
      'ESLint 규칙으로 자동 체크 가능'
    ],
    commonMistakes: [
      '같은 파일에서 따옴표 스타일 혼용',
      'JSON에서 작은따옴표 사용',
      '문자열 내 따옴표 이스케이프 처리 누락'
    ]
  },
  {
    id: 'semicolon',
    name: '세미콜론 사용',
    category: 'JavaScript',
    languages: ['javascript'],
    description: 'JavaScript에서 세미콜론 사용 여부를 정의합니다.',
    impact: 'medium',
    examples: [
      {
        before: `const name = 'John'
const age = 30
console.log(name)`,
        after: `const name = 'John';
const age = 30;
console.log(name);`,
        description: '세미콜론 추가'
      }
    ],
    tips: [
      'ASI(Automatic Semicolon Insertion) 이해 필요',
      'Prettier와 함께 사용하면 자동 적용',
      '팀 컨벤션에 따라 선택'
    ],
    commonMistakes: [
      '일부만 세미콜론 사용',
      'return 문 다음 줄에 표현식 작성',
      '배열/객체 리터럴에서 불필요한 세미콜론'
    ]
  },
  {
    id: 'import-organization',
    name: 'Import 정렬',
    category: 'Java/Kotlin',
    languages: ['java', 'kotlin'],
    description: 'import 문의 순서와 그룹화 규칙을 정의합니다.',
    impact: 'low',
    examples: [
      {
        before: `import java.util.List;
import com.company.MyClass;
import java.io.File;
import static org.junit.Assert.*;`,
        after: `import java.io.File;
import java.util.List;

import com.company.MyClass;

import static org.junit.Assert.*;`,
        description: '알파벳 순 정렬 및 그룹화'
      }
    ],
    tips: [
      'IDE의 자동 import 정렬 기능 활용',
      '그룹별로 빈 줄로 구분',
      'static import는 별도 그룹으로 분리'
    ],
    commonMistakes: [
      '사용하지 않는 import 문 방치',
      '정렬 순서가 일관되지 않음',
      '와일드카드 import 남용'
    ]
  },
  {
    id: 'sql-case',
    name: 'SQL 키워드 대소문자',
    category: 'SQL',
    languages: ['sql'],
    description: 'SQL 키워드와 식별자의 대소문자 규칙을 정의합니다.',
    impact: 'low',
    examples: [
      {
        before: `select name, age from users where age > 18;`,
        after: `SELECT name, age FROM users WHERE age > 18;`,
        description: 'SQL 키워드 대문자 적용'
      }
    ],
    tips: [
      '키워드는 대문자, 식별자는 소문자가 일반적',
      '데이터베이스별 관례 확인',
      '쿼리 포매터 도구 활용'
    ],
    commonMistakes: [
      '키워드와 식별자 대소문자 혼용',
      '예약어를 식별자로 사용',
      '일관되지 않은 스타일'
    ]
  }
];

/**
 * 컨벤션 문서화 컴포넌트
 */
export const ConventionDocumentation: React.FC<ConventionDocumentationProps> = ({
  language,
  visible = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!visible) return null;

  /**
   * 필터링된 규칙 목록 반환
   */
  const filteredRules = CONVENTION_RULES.filter(rule => {
    const matchesLanguage = !language || rule.languages.includes(language);
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    
    return matchesLanguage && matchesSearch && matchesCategory;
  });

  /**
   * 카테고리 목록 생성
   */
  const categories = ['all', ...Array.from(new Set(CONVENTION_RULES.map(rule => rule.category)))];

  /**
   * 영향도에 따른 색상 반환
   */
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  /**
   * 영향도에 따른 아이콘 반환
   */
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <ExclamationCircleOutlined />;
      case 'medium': return <InfoCircleOutlined />;
      case 'low': return <CheckCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  /**
   * 규칙 패널 렌더링
   */
  const renderRulePanel = (rule: ConventionRule) => (
    <Panel
      key={rule.id}
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong>{rule.name}</Text>
            <Tag color="blue">{rule.category}</Tag>
            <Tag 
              color={getImpactColor(rule.impact)} 
              icon={getImpactIcon(rule.impact)}
            >
              {rule.impact === 'high' ? '중요' : rule.impact === 'medium' ? '보통' : '낮음'}
            </Tag>
          </div>
          <div>
            {rule.languages.map(lang => (
              <Tag key={lang}>
                {lang.toUpperCase()}
              </Tag>
            ))}
          </div>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 설명 */}
        <Alert
          message="규칙 설명"
          description={rule.description}
          type="info"
          showIcon
        />

        {/* 예시 */}
        <div>
          <Title level={5}>📝 코드 예시</Title>
          {rule.examples.map((example, index) => (
            <Card key={index} size="small" type="inner" style={{ marginBottom: 8 }}>
              <Paragraph style={{ fontSize: '12px', margin: 0, marginBottom: 8 }}>
                {example.description}
              </Paragraph>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="danger" strong>Before:</Text>
                  <pre style={{
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    overflow: 'auto'
                  }}>
                    {example.before}
                  </pre>
                </Col>
                <Col span={12}>
                  <Text type="success" strong>After:</Text>
                  <pre style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    overflow: 'auto'
                  }}>
                    {example.after}
                  </pre>
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        {/* 팁 */}
        <div>
          <Title level={5}>💡 사용 팁</Title>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {rule.tips.map((tip, index) => (
              <li key={index}>
                <Text>{tip}</Text>
              </li>
            ))}
          </ul>
        </div>

        {/* 주의사항 */}
        <div>
          <Title level={5}>⚠️ 흔한 실수</Title>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {rule.commonMistakes.map((mistake, index) => (
              <li key={index}>
                <Text type="warning">{mistake}</Text>
              </li>
            ))}
          </ul>
        </div>
      </Space>
    </Panel>
  );

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: '#1890ff' }} />
          컨벤션 규칙 가이드
          {language && (
            <Tag color="blue">{language.toUpperCase()}</Tag>
          )}
        </div>
      }
      extra={
        <Space>
          <Search
            placeholder="규칙 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
            size="small"
          />
        </Space>
      }
    >
      {/* 필터 */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ marginRight: 8 }}>카테고리:</Text>
        <Space wrap>
          {categories.map(category => (
            <Tag
              key={category}
              color={selectedCategory === category ? 'blue' : 'default'}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '전체' : category}
            </Tag>
          ))}
        </Space>
      </div>

      {/* 요약 정보 */}
      <Alert
        message="컨벤션 규칙 가이드"
        description="각 규칙의 목적과 적용 방법을 이해하고, 팀에 맞는 컨벤션을 설정하세요."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 규칙 목록 */}
      {filteredRules.length > 0 ? (
        <Collapse ghost>
          {filteredRules.map(renderRulePanel)}
        </Collapse>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">검색 조건에 맞는 규칙이 없습니다.</Text>
        </div>
      )}
    </Card>
  );
};

export default ConventionDocumentation;