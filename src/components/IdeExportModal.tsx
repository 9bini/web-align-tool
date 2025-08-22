/**
 * IDE 설정 내보내기 모달 컴포넌트
 * 선택된 컨벤션을 다양한 IDE 형식으로 내보낼 수 있는 기능을 제공합니다.
 */

import React, { useState, useMemo } from 'react';
import { 
  Modal, 
  Button, 
  Space, 
  Typography, 
  Card, 
  message, 
  Tabs, 
  Alert,
  Divider
} from 'antd';
import { 
  DownloadOutlined, 
  CopyOutlined, 
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { 
  SupportedLanguage, 
  FormattingConvention, 
  IdeExportFormat,
  IdeExportResult 
} from '../types/FormattingTypes';
import { FormattingService } from '../services/FormattingService';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface IdeExportModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 콜백 */
  onCancel: () => void;
  /** 프로그래밍 언어 */
  language: SupportedLanguage;
  /** 포매팅 컨벤션 */
  convention: FormattingConvention;
}

/**
 * IDE 설정 내보내기 모달 컴포넌트
 */
export const IdeExportModal: React.FC<IdeExportModalProps> = ({
  visible,
  onCancel,
  language,
  convention
}) => {
  const [selectedFormat, setSelectedFormat] = useState<IdeExportFormat | null>(null);
  const [exportResults, setExportResults] = useState<Record<IdeExportFormat, IdeExportResult>>({} as Record<IdeExportFormat, IdeExportResult>);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 지원되는 IDE 형식 목록
   */
  const supportedFormats = useMemo(() => {
    return FormattingService.getSupportedIdeFormats(language);
  }, [language]);

  /**
   * IDE 형식별 아이콘과 표시명을 반환합니다.
   */
  const getFormatInfo = (format: IdeExportFormat) => {
    const formatInfo = {
      vscode: { icon: '🆚', name: 'Visual Studio Code', color: '#007ACC' },
      intellij: { icon: '🧠', name: 'IntelliJ IDEA', color: '#FF6B35' },
      eclipse: { icon: '🌙', name: 'Eclipse', color: '#2C2255' },
      prettier: { icon: '💄', name: 'Prettier', color: '#F7B93E' },
      eslint: { icon: '📏', name: 'ESLint', color: '#4B32C3' },
      editorconfig: { icon: '⚙️', name: 'EditorConfig', color: '#169BD8' }
    };
    
    return formatInfo[format] || { icon: '📄', name: format, color: '#666' };
  };

  /**
   * 설정 파일을 내보냅니다.
   */
  const handleExport = async (format: IdeExportFormat) => {
    setIsExporting(true);
    
    try {
      const result = FormattingService.exportToIde(convention, language, format);
      
      setExportResults(prev => ({
        ...prev,
        [format]: result
      }));
      
      setSelectedFormat(format);
      
      message.success(`${getFormatInfo(format).name} 설정이 생성되었습니다.`);
    } catch (error) {
      message.error(`내보내기 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 모든 형식으로 내보냅니다.
   */
  const handleExportAll = async () => {
    setIsExporting(true);
    const results: Record<IdeExportFormat, IdeExportResult> = {} as Record<IdeExportFormat, IdeExportResult>;
    
    try {
      for (const format of supportedFormats) {
        const result = FormattingService.exportToIde(convention, language, format);
        results[format] = result;
      }
      
      setExportResults(results);
      setSelectedFormat(supportedFormats[0] || null);
      
      message.success(`모든 IDE 설정이 생성되었습니다. (${supportedFormats.length}개)`);
    } catch (error) {
      message.error(`내보내기 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 클립보드에 복사합니다.
   */
  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success('클립보드에 복사되었습니다.');
    } catch (error) {
      message.error('복사에 실패했습니다.');
    }
  };

  /**
   * 파일을 다운로드합니다.
   */
  const handleDownload = (result: IdeExportResult) => {
    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`${result.filename} 파일이 다운로드되었습니다.`);
  };

  /**
   * 모달 초기화
   */
  const handleModalCancel = () => {
    setSelectedFormat(null);
    setExportResults({} as Record<IdeExportFormat, IdeExportResult>);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SettingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          IDE 설정 내보내기
        </div>
      }
      open={visible}
      onCancel={handleModalCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 컨벤션 정보 */}
        <Alert
          message={
            <div>
              <Text strong>{convention.name}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                ({FormattingService.getLanguageDisplayName(language)})
              </Text>
            </div>
          }
          description={convention.description}
          type="info"
          showIcon
        />

        {/* IDE 형식 선택 */}
        <div>
          <Title level={5} style={{ marginBottom: '12px' }}>
            지원되는 IDE 형식
          </Title>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            {supportedFormats.map(format => {
              const formatInfo = getFormatInfo(format);
              const hasResult = exportResults[format];
              
              return (
                <Card
                  key={format}
                  size="small"
                  hoverable
                  style={{ 
                    borderColor: hasResult ? '#52c41a' : '#d9d9d9',
                    background: hasResult ? '#f6ffed' : 'white'
                  }}
                  bodyStyle={{ padding: '12px' }}
                  onClick={() => handleExport(format)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>
                        {formatInfo.icon}
                      </span>
                      <div>
                        <Text strong style={{ fontSize: '13px' }}>
                          {formatInfo.name}
                        </Text>
                      </div>
                    </div>
                    {hasResult && (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleExportAll}
              loading={isExporting}
            >
              모든 형식으로 내보내기
            </Button>
          </Space>
        </div>

        {/* 내보내기 결과 */}
        {Object.keys(exportResults).length > 0 && (
          <div>
            <Divider />
            <Title level={5}>생성된 설정 파일</Title>
            
            <Tabs 
              activeKey={selectedFormat || undefined}
              onChange={(key) => setSelectedFormat(key as IdeExportFormat)}
            >
              {Object.entries(exportResults).map(([format, result]) => {
                const formatInfo = getFormatInfo(format as IdeExportFormat);
                
                return (
                  <TabPane
                    key={format}
                    tab={
                      <span>
                        <span style={{ marginRight: '6px' }}>{formatInfo.icon}</span>
                        {formatInfo.name}
                      </span>
                    }
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* 파일 정보 */}
                      <div style={{ 
                        padding: '12px', 
                        background: '#fafafa', 
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px'
                      }}>
                        <Space>
                          <FileTextOutlined />
                          <Text strong>{result.filename}</Text>
                          <Text type="secondary">({result.content.length}자)</Text>
                        </Space>
                      </div>

                      {/* 설정 파일 내용 */}
                      <div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>설정 파일 내용:</Text>
                          <Space>
                            <Button 
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => handleCopyToClipboard(result.content)}
                            >
                              복사
                            </Button>
                            <Button 
                              size="small"
                              type="primary"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownload(result)}
                            >
                              다운로드
                            </Button>
                          </Space>
                        </div>
                        
                        <pre style={{
                          background: '#f5f5f5',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          padding: '12px',
                          maxHeight: '300px',
                          overflow: 'auto',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          margin: 0
                        }}>
                          {result.content}
                        </pre>
                      </div>

                      {/* 적용 방법 */}
                      <div>
                        <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                          적용 방법:
                        </Text>
                        <div style={{ 
                          background: '#fff7e6', 
                          border: '1px solid #ffd591',
                          borderRadius: '6px',
                          padding: '12px'
                        }}>
                          <Paragraph 
                            style={{ 
                              margin: 0, 
                              fontSize: '13px', 
                              lineHeight: '1.6',
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {result.instructions}
                          </Paragraph>
                        </div>
                      </div>
                    </Space>
                  </TabPane>
                );
              })}
            </Tabs>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default IdeExportModal;