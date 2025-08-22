/**
 * 컨벤션 선택 컴포넌트
 * 언어별 프리셋 포매팅 컨벤션을 선택할 수 있는 인터페이스를 제공합니다.
 */

import React, { useMemo } from 'react';
import { Select, Space, Tag, Tooltip, Typography } from 'antd';
import { StarOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { SupportedLanguage, PresetConvention } from '../types/FormattingTypes';
import { FormattingService } from '../services/FormattingService';

const { Option, OptGroup } = Select;
const { Text } = Typography;

interface ConventionSelectorProps {
  /** 현재 선택된 언어 */
  language: SupportedLanguage;
  /** 현재 선택된 프리셋 ID */
  selectedPresetId?: string;
  /** 프리셋이 변경될 때 호출되는 콜백 함수 */
  onPresetChange: (presetId: string, preset: PresetConvention) => void;
  /** 컴포넌트 크기 */
  size?: 'small' | 'middle' | 'large';
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 스타일 설정 */
  style?: React.CSSProperties;
}

/**
 * 컨벤션 선택 드롭다운 컴포넌트
 */
export const ConventionSelector: React.FC<ConventionSelectorProps> = ({
  language,
  selectedPresetId,
  onPresetChange,
  size = 'middle',
  disabled = false,
  style
}) => {
  /**
   * 언어별 프리셋 목록을 그룹화하여 반환합니다.
   */
  const groupedPresets = useMemo(() => {
    const presets = FormattingService.getPresetsByLanguage(language);
    
    const official = presets.filter(preset => preset.isOfficial);
    const community = presets.filter(preset => !preset.isOfficial);
    
    return { official, community };
  }, [language]);

  /**
   * 선택된 프리셋 정보를 반환합니다.
   */
  const selectedPreset = useMemo(() => {
    if (!selectedPresetId) return null;
    return FormattingService.getPresetById(selectedPresetId);
  }, [selectedPresetId]);

  /**
   * 프리셋의 인기도에 따른 별 아이콘을 반환합니다.
   */
  const getPopularityStars = (popularity: number): React.ReactNode => {
    const stars = Math.floor(popularity / 2);
    return Array.from({ length: stars }, (_, index) => (
      <StarOutlined key={index} style={{ color: '#faad14', fontSize: '12px' }} />
    ));
  };

  /**
   * 프리셋 옵션을 렌더링합니다.
   */
  const renderPresetOption = (preset: PresetConvention): React.ReactNode => (
    <Option key={preset.id} value={preset.id} label={preset.name}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <Text strong style={{ marginRight: '8px' }}>
              {preset.name}
            </Text>
            {preset.isOfficial && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                공식
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {preset.description}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
          {getPopularityStars(preset.popularity)}
          <Text type="secondary" style={{ fontSize: '11px', marginLeft: '4px' }}>
            ({preset.popularity}/10)
          </Text>
        </div>
      </div>
    </Option>
  );

  /**
   * 선택 변경 핸들러
   */
  const handleChange = (presetId: string) => {
    const preset = FormattingService.getPresetById(presetId);
    if (preset) {
      onPresetChange(presetId, preset);
    }
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>포매팅 컨벤션</span>
        {selectedPreset && (
          <Tooltip title={selectedPreset.description}>
            <Tag 
              color={selectedPreset.isOfficial ? 'green' : 'blue'} 
              icon={selectedPreset.isOfficial ? <CheckCircleOutlined /> : <SettingOutlined />}
            >
              {selectedPreset.name}
            </Tag>
          </Tooltip>
        )}
      </div>
      
      <Select
        value={selectedPresetId}
        onChange={handleChange}
        size={size}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="포매팅 컨벤션을 선택하세요"
        optionLabelProp="label"
        showSearch
        filterOption={(input, option) =>
          (option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ||
          option?.children?.toString().toLowerCase().includes(input.toLowerCase())) || false
        }
      >
        {groupedPresets.official.length > 0 && (
          <OptGroup label="🏛️ 공식 컨벤션">
            {groupedPresets.official.map(renderPresetOption)}
          </OptGroup>
        )}
        
        {groupedPresets.community.length > 0 && (
          <OptGroup label="👥 커뮤니티 컨벤션">
            {groupedPresets.community.map(renderPresetOption)}
          </OptGroup>
        )}
        
        {groupedPresets.official.length === 0 && groupedPresets.community.length === 0 && (
          <Option value="" disabled>
            해당 언어의 프리셋이 없습니다
          </Option>
        )}
      </Select>
      
      {selectedPreset && (
        <div style={{ 
          padding: '8px 12px', 
          background: '#f5f5f5', 
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: '13px' }}>컨벤션 요약</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getPopularityStars(selectedPreset.popularity)}
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '4px' }}>
                  인기도 {selectedPreset.popularity}/10
                </Text>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>들여쓰기:</Text>
                <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                  {selectedPreset.convention.indentationType === 'tab' ? 'Tab' : `${selectedPreset.convention.indentSize} Spaces`}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>최대 줄 길이:</Text>
                <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                  {selectedPreset.convention.maxLineLength}자
                </Text>
              </div>
            </div>
          </Space>
        </div>
      )}
    </Space>
  );
};

export default ConventionSelector;