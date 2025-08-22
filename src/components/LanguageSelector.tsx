/**
 * 언어 선택 컴포넌트
 * 지원되는 프로그래밍 언어를 선택할 수 있는 인터페이스를 제공합니다.
 */

import React from 'react';
import { Select, Space, Tag } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { SupportedLanguage } from '../types/FormattingTypes';
import { FormattingService } from '../services/FormattingService';

const { Option } = Select;

interface LanguageSelectorProps {
  /** 현재 선택된 언어 */
  selectedLanguage: SupportedLanguage;
  /** 언어가 변경될 때 호출되는 콜백 함수 */
  onLanguageChange: (language: SupportedLanguage) => void;
  /** 컴포넌트 크기 */
  size?: 'small' | 'middle' | 'large';
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 스타일 설정 */
  style?: React.CSSProperties;
}

/**
 * 언어 선택 드롭다운 컴포넌트
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  size = 'middle',
  disabled = false,
  style
}) => {
  const supportedLanguages = FormattingService.getSupportedLanguages();

  /**
   * 언어별 아이콘을 반환합니다.
   */
  const getLanguageIcon = (language: SupportedLanguage): React.ReactNode => {
    const iconStyle = { marginRight: '8px' };
    
    switch (language) {
      case 'java':
        return <span style={{ ...iconStyle, color: '#ED8B00' }}>☕</span>;
      case 'json':
        return <span style={{ ...iconStyle, color: '#4B8BBE' }}>📄</span>;
      case 'javascript':
        return <span style={{ ...iconStyle, color: '#F7DF1E' }}>🟨</span>;
      case 'kotlin':
        return <span style={{ ...iconStyle, color: '#7F52FF' }}>🟣</span>;
      case 'sql':
        return <span style={{ ...iconStyle, color: '#336791' }}>🗃️</span>;
      default:
        return <CodeOutlined style={iconStyle} />;
    }
  };

  /**
   * 언어별 색상을 반환합니다.
   */
  const getLanguageColor = (language: SupportedLanguage): string => {
    switch (language) {
      case 'java':
        return 'orange';
      case 'json':
        return 'blue';
      case 'javascript':
        return 'gold';
      case 'kotlin':
        return 'purple';
      case 'sql':
        return 'cyan';
      default:
        return 'default';
    }
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>프로그래밍 언어</span>
        <Tag color={getLanguageColor(selectedLanguage)} icon={getLanguageIcon(selectedLanguage)}>
          {FormattingService.getLanguageDisplayName(selectedLanguage)}
        </Tag>
      </div>
      
      <Select
        value={selectedLanguage}
        onChange={onLanguageChange}
        size={size}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="프로그래밍 언어를 선택하세요"
        optionLabelProp="label"
      >
        {supportedLanguages.map(language => (
          <Option 
            key={language} 
            value={language}
            label={FormattingService.getLanguageDisplayName(language)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getLanguageIcon(language)}
              <span>{FormattingService.getLanguageDisplayName(language)}</span>
            </div>
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default LanguageSelector;