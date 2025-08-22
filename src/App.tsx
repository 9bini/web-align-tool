/**
 * 메인 애플리케이션 컴포넌트
 * 다양한 프로그래밍 언어의 코드 포매팅과 컨벤션 관리 기능을 제공합니다.
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Tag,
  Tabs,
  Dropdown,
  Menu,
  Statistic,
  Alert,
  Switch
} from 'antd';
import { 
  CopyOutlined, 
  ClearOutlined, 
  EditOutlined,
  CheckSquareOutlined,
  SortAscendingOutlined,
  CodeOutlined,
  CompressOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BugOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SettingOutlined
} from '@ant-design/icons';

// 서비스와 컴포넌트 임포트
import { FormattingService } from './services/FormattingService';
import LanguageSelector from './components/LanguageSelector';
import ConventionSelector from './components/ConventionSelector';
import ConventionEditor from './components/ConventionEditor';
import ConventionDisplay from './components/ConventionDisplay';
import ConventionDocumentation from './components/ConventionDocumentation';
import IdeExportModal from './components/IdeExportModal';
import { 
  SupportedLanguage, 
  PresetConvention, 
  FormattingResult,
  FormattingConvention 
} from './types/FormattingTypes';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * 포매팅 모드 타입 정의
 */
type FormattingMode = 'code' | 'delimiter' | 'json-tools';

/**
 * 메인 애플리케이션 컴포넌트
 */
const App: React.FC = () => {
  // 기본 상태 관리
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<FormattingMode>('code');
  
  // 코드 포매팅 관련 상태
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<PresetConvention | null>(null);
  const [lastFormattingResult, setLastFormattingResult] = useState<FormattingResult | null>(null);
  
  // UI 관련 상태
  const [ideExportModalVisible, setIdeExportModalVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoFormat, setAutoFormat] = useState(false);
  const [showConventionEditor, setShowConventionEditor] = useState(false);
  const [showConventionDocs, setShowConventionDocs] = useState(false);
  const [customConvention, setCustomConvention] = useState<FormattingConvention | null>(null);
  const [, setCustomConventions] = useState<PresetConvention[]>([]);

  /**
   * 언어 변경 시 기본 프리셋을 설정합니다.
   */
  useEffect(() => {
    const presets = FormattingService.getPresetsByLanguage(selectedLanguage);
    if (presets.length > 0) {
      const defaultPreset = presets.find(p => p.isOfficial) || presets[0];
      setSelectedPresetId(defaultPreset.id);
      setSelectedPreset(defaultPreset);
    } else {
      setSelectedPresetId('');
      setSelectedPreset(null);
    }
    
    // 언어 변경 시 예시 코드 로드
    if (!inputCode.trim()) {
      setInputCode(FormattingService.getExampleCode(selectedLanguage));
    }
  }, [selectedLanguage]);

  /**
   * 자동 포매팅 기능
   */
  useEffect(() => {
    if (autoFormat && inputCode.trim() && selectedPreset) {
      const timer = setTimeout(() => {
        handleCodeFormat();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [inputCode, autoFormat, selectedPreset]);

  /**
   * 현재 모드에서 사용 가능한 액션들을 반환합니다.
   */
  const availableActions = useMemo(() => {
    switch (activeMode) {
      case 'code':
        return selectedPreset ? ['format', 'export'] : [];
      case 'delimiter':
        return ['align'];
      case 'json-tools':
        return ['prettify', 'minify'];
      default:
        return [];
    }
  }, [activeMode, selectedPreset]);

  /**
   * 코드를 포매팅합니다.
   */
  const handleCodeFormat = async () => {
    if (!inputCode.trim()) {
      message.warning('포매팅할 코드를 입력해주세요.');
      return;
    }

    if (!selectedPreset) {
      message.warning('포매팅 컨벤션을 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = FormattingService.formatCode(
        inputCode,
        selectedLanguage,
        getCurrentConvention()
      );
      
      setOutputCode(result.formattedCode);
      setLastFormattingResult(result);
      
      if (result.errors.length > 0) {
        message.error(`포매팅 중 오류 발생: ${result.errors[0]}`);
      } else if (result.warnings.length > 0) {
        message.warning(`포매팅 완료 (경고 ${result.warnings.length}개)`);
      } else {
        message.success(`포매팅 완료! ${result.changedLines}줄이 변경되었습니다.`);
      }
    } catch (error) {
      message.error('포매팅 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 구분자 기반 정렬을 수행합니다.
   */
  const handleDelimiterAlign = async () => {
    if (!inputCode.trim()) {
      message.warning('정렬할 텍스트를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = FormattingService.alignByDelimiter(inputCode, '/');
      setOutputCode(result.formattedCode);
      setLastFormattingResult(result);
      
      if (result.errors.length > 0) {
        message.error(`정렬 중 오류 발생: ${result.errors[0]}`);
      } else {
        message.success(`정렬 완료! ${result.changedLines}줄이 변경되었습니다.`);
      }
    } catch (error) {
      message.error('정렬 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * JSON 정리 기능
   */
  const handleJsonPrettify = async () => {
    if (!inputCode.trim()) {
      message.warning('정리할 JSON을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = FormattingService.prettifyJson(inputCode);
      setOutputCode(result.formattedCode);
      setLastFormattingResult(result);
      
      if (result.errors.length > 0) {
        message.error(`JSON 정리 중 오류 발생: ${result.errors[0]}`);
      } else {
        message.success('JSON 정리 완료!');
      }
    } catch (error) {
      message.error('JSON 정리 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * JSON 압축 기능
   */
  const handleJsonMinify = async () => {
    if (!inputCode.trim()) {
      message.warning('압축할 JSON을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = FormattingService.minifyJson(inputCode);
      setOutputCode(result.formattedCode);
      setLastFormattingResult(result);
      
      if (result.errors.length > 0) {
        message.error(`JSON 압축 중 오류 발생: ${result.errors[0]}`);
      } else {
        message.success('JSON 압축 완료!');
      }
    } catch (error) {
      message.error('JSON 압축 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 클립보드에 텍스트를 복사합니다.
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('클립보드에 복사되었습니다.');
    } catch (err) {
      message.error('복사에 실패했습니다.');
    }
  };

  /**
   * 프리셋 변경 핸들러
   */
  const handlePresetChange = (presetId: string, preset: PresetConvention) => {
    setSelectedPresetId(presetId);
    setSelectedPreset(preset);
    setCustomConvention(null); // 프리셋 변경 시 커스텀 컨벤션 초기화
  };

  /**
   * 커스텀 컨벤션 변경 핸들러
   */
  const handleConventionChange = (convention: FormattingConvention) => {
    setCustomConvention(convention);
  };

  /**
   * 커스텀 컨벤션 저장 핸들러
   */
  const handleSaveCustomConvention = (name: string, convention: FormattingConvention) => {
    const customPreset: PresetConvention = {
      id: `custom-${Date.now()}`,
      name,
      language: selectedLanguage,
      description: `사용자 정의 ${FormattingService.getLanguageDisplayName(selectedLanguage)} 컨벤션`,
      popularity: 5,
      isOfficial: false,
      convention
    };
    
    setCustomConventions(prev => [...prev, customPreset]);
    message.success(`"${name}" 컨벤션이 저장되었습니다.`);
  };

  /**
   * 현재 적용할 컨벤션 반환
   */
  const getCurrentConvention = (): FormattingConvention => {
    return customConvention || selectedPreset?.convention || {} as FormattingConvention;
  };

  /**
   * 예시 코드 로드
   */
  const loadExampleCode = () => {
    const exampleCode = FormattingService.getExampleCode(selectedLanguage);
    setInputCode(exampleCode);
    message.info('예시 코드가 로드되었습니다.');
  };

  /**
   * 모든 내용 지우기
   */
  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
    setLastFormattingResult(null);
    message.info('모든 내용이 지워졌습니다.');
  };

  /**
   * 결과를 입력으로 복사
   */
  const copyOutputToInput = () => {
    if (!outputCode.trim()) {
      message.warning('복사할 결과가 없습니다.');
      return;
    }
    setInputCode(outputCode);
    message.success('결과가 입력창으로 복사되었습니다.');
  };

  /**
   * 메인 액션 메뉴
   */
  const actionMenu = (
    <Menu>
      {availableActions.includes('format') && (
        <Menu.Item key="format" icon={<ThunderboltOutlined />} onClick={handleCodeFormat}>
          코드 포매팅
        </Menu.Item>
      )}
      {availableActions.includes('align') && (
        <Menu.Item key="align" icon={<SortAscendingOutlined />} onClick={handleDelimiterAlign}>
          컬럼 정렬
        </Menu.Item>
      )}
      {availableActions.includes('prettify') && (
        <Menu.Item key="prettify" icon={<CodeOutlined />} onClick={handleJsonPrettify}>
          JSON 정리
        </Menu.Item>
      )}
      {availableActions.includes('minify') && (
        <Menu.Item key="minify" icon={<CompressOutlined />} onClick={handleJsonMinify}>
          JSON 압축
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="example" icon={<FileTextOutlined />} onClick={loadExampleCode}>
        예시 코드 로드
      </Menu.Item>
      <Menu.Item key="clear" icon={<ClearOutlined />} onClick={clearAll}>
        모두 지우기
      </Menu.Item>
      {outputCode && (
        <Menu.Item key="copy-result" icon={<CopyOutlined />} onClick={copyOutputToInput}>
          결과를 입력으로 복사
        </Menu.Item>
      )}
    </Menu>
  );


  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 헤더 */}
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CodeOutlined style={{ 
              color: '#1890ff', 
              fontSize: '28px', 
              marginRight: '12px' 
            }} />
            <Title level={3} style={{ 
              color: '#262626', 
              margin: 0,
              fontWeight: 600
            }}>
              Code Formatter Pro
            </Title>
            <Tag color="blue" style={{ marginLeft: '12px' }}>
              v2.0
            </Tag>
          </div>
          
          <Space>
            <Text type="secondary">자동 포매팅</Text>
            <Switch 
              checked={autoFormat} 
              onChange={setAutoFormat}
              size="small"
            />
            {selectedPreset && (
              <Button 
                type="text" 
                icon={<DownloadOutlined />}
                onClick={() => setIdeExportModalVisible(true)}
              >
                IDE 설정 내보내기
              </Button>
            )}
          </Space>
        </div>
      </Header>
      
      <Layout>
        {/* 사이드바 */}
        <Sider 
          width={320}
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          style={{ 
            background: '#fff', 
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
            zIndex: 999
          }}
        >
          {!sidebarCollapsed && (
            <div style={{ padding: '16px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 모드 선택 */}
                <div>
                  <Text strong style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    포매팅 모드
                  </Text>
                  <Tabs
                    activeKey={activeMode}
                    onChange={(key) => {
                      setActiveMode(key as FormattingMode);
                      setOutputCode('');
                      setLastFormattingResult(null);
                    }}
                    size="small"
                  >
                    <TabPane
                      key="code"
                      tab={
                        <span>
                          <CodeOutlined />
                          코드 포매터
                        </span>
                      }
                    />
                    <TabPane
                      key="delimiter"
                      tab={
                        <span>
                          <SortAscendingOutlined />
                          컬럼 정렬
                        </span>
                      }
                    />
                    <TabPane
                      key="json-tools"
                      tab={
                        <span>
                          <FileTextOutlined />
                          JSON 도구
                        </span>
                      }
                    />
                  </Tabs>
                </div>

                {/* 코드 포매터 설정 */}
                {activeMode === 'code' && (
                  <>
                    <LanguageSelector
                      selectedLanguage={selectedLanguage}
                      onLanguageChange={setSelectedLanguage}
                    />
                    
                    <ConventionSelector
                      language={selectedLanguage}
                      selectedPresetId={selectedPresetId}
                      onPresetChange={handlePresetChange}
                    />
                    
                    {/* 컨벤션 도구 버튼들 */}
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type={showConventionEditor ? "primary" : "default"}
                        icon={<SettingOutlined />} 
                        onClick={() => {
                          setShowConventionEditor(!showConventionEditor);
                          setShowConventionDocs(false);
                        }}
                        block
                      >
                        {showConventionEditor ? '편집기 닫기' : '컨벤션 편집'}
                      </Button>
                      <Button 
                        type={showConventionDocs ? "primary" : "default"}
                        icon={<FileTextOutlined />} 
                        onClick={() => {
                          setShowConventionDocs(!showConventionDocs);
                          setShowConventionEditor(false);
                        }}
                        block
                      >
                        {showConventionDocs ? '가이드 닫기' : '규칙 가이드'}
                      </Button>
                    </Space>
                  </>
                )}

                {/* 구분자 정렬 설명 */}
                {activeMode === 'delimiter' && (
                  <Alert
                    message="구분자 기반 컬럼 정렬"
                    description="'/' 구분자로 분리된 텍스트를 정렬하여 가독성을 높입니다."
                    type="info"
                    showIcon
                  />
                )}

                {/* JSON 도구 설명 */}
                {activeMode === 'json-tools' && (
                  <Alert
                    message="JSON 포매팅 도구"
                    description="JSON 데이터를 정리하거나 압축할 수 있습니다."
                    type="info"
                    showIcon
                  />
                )}

                {/* 통계 정보 */}
                {lastFormattingResult && (
                  <Card size="small" title="포매팅 결과" style={{ marginTop: '16px' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Statistic
                        title="변경된 줄 수"
                        value={lastFormattingResult.changedLines}
                        prefix={<EditOutlined />}
                      />
                      <Statistic
                        title="처리 시간"
                        value={lastFormattingResult.processingTime}
                        suffix="ms"
                        prefix={<ClockCircleOutlined />}
                      />
                      {lastFormattingResult.warnings.length > 0 && (
                        <div>
                          <Text type="warning" style={{ fontSize: '12px' }}>
                            <WarningOutlined /> 경고 {lastFormattingResult.warnings.length}개
                          </Text>
                        </div>
                      )}
                      {lastFormattingResult.errors.length > 0 && (
                        <div>
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            <BugOutlined /> 오류 {lastFormattingResult.errors.length}개
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                )}
              </Space>
            </div>
          )}
        </Sider>

        {/* 메인 콘텐츠 */}
        <Content style={{ 
          marginLeft: sidebarCollapsed ? 80 : 320,
          padding: '24px',
          transition: 'margin-left 0.2s'
        }}>
          {/* 컨벤션 표시, 편집기, 문서화 */}
          {activeMode === 'code' && selectedPreset && (
            <>
              <ConventionDisplay
                language={selectedLanguage}
                preset={selectedPreset}
                convention={getCurrentConvention()}
                visible={!showConventionEditor && !showConventionDocs}
              />
              
              {showConventionEditor && (
                <ConventionEditor
                  language={selectedLanguage}
                  convention={getCurrentConvention()}
                  onConventionChange={handleConventionChange}
                  onSaveCustom={handleSaveCustomConvention}
                />
              )}
              
              {showConventionDocs && (
                <ConventionDocumentation
                  language={selectedLanguage}
                />
              )}
            </>
          )}

          {/* 액션 바 */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text strong style={{ fontSize: '16px' }}>
                  {activeMode === 'code' && '코드 포매팅'}
                  {activeMode === 'delimiter' && '구분자 컬럼 정렬'}
                  {activeMode === 'json-tools' && 'JSON 포매팅 도구'}
                </Text>
                {selectedPreset && (
                  <Space style={{ marginLeft: '8px' }}>
                    <Tag color="blue">{selectedPreset.name}</Tag>
                    {customConvention && (
                      <Tag color="orange" icon={<EditOutlined />}>
                        수정됨
                      </Tag>
                    )}
                  </Space>
                )}
              </div>
              
              <Space>
                <Dropdown overlay={actionMenu} placement="bottomRight">
                  <Button type="primary" icon={<ThunderboltOutlined />} loading={isProcessing}>
                    실행
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </Card>

          {/* 입력/출력 영역 */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      <EditOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      입력 코드
                    </span>
                    <Space>
                      <Tag color="green">{inputCode.split('\n').length} 줄</Tag>
                      <Tag color="blue">{inputCode.length} 문자</Tag>
                    </Space>
                  </div>
                }
                extra={
                  <Space>
                    <Button size="small" onClick={loadExampleCode} icon={<FileTextOutlined />}>
                      예시
                    </Button>
                    <Button size="small" onClick={clearAll} icon={<ClearOutlined />}>
                      지우기
                    </Button>
                  </Space>
                }
                style={{ height: '600px' }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
              >
                <div style={{ height: '100%', border: 'none', overflow: 'hidden' }}>
                  <TextArea
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder={{
                      'code': `${FormattingService.getLanguageDisplayName(selectedLanguage)} 코드를 입력하세요...`,
                      'delimiter': `/ 구분자를 포함한 텍스트를 입력하세요...\n예시:\napple/fruit/red\nbanana/fruit/yellow\ncarrot/vegetable/orange`,
                      'json-tools': `JSON 데이터를 입력하세요...\n예시:\n{\n  "name": "John",\n  "age": 30\n}`
                    }[activeMode]}
                    style={{ 
                      height: '100%',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      border: 'none',
                      background: '#fafafa',
                      color: '#262626',
                      resize: 'none'
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
                      포매팅 결과
                    </span>
                    <Space>
                      <Tag color="blue">{outputCode.split('\n').length} 줄</Tag>
                      <Tag color="purple">{outputCode.length} 문자</Tag>
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
                extra={outputCode && (
                  <Button 
                    size="small" 
                    type="primary" 
                    ghost 
                    icon={<CopyOutlined />}
                    onClick={copyOutputToInput}
                  >
                    입력으로 복사
                  </Button>
                )}
                style={{ height: '600px' }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
              >
                <div style={{ height: '100%', border: 'none', overflow: 'hidden' }}>
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
                      <CodeOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                      <div>포매팅된 결과가 여기에 표시됩니다</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {activeMode === 'code' && '위에서 언어와 컨벤션을 선택한 후 코드를 입력하세요'}
                        {activeMode === 'delimiter' && '/ 구분자로 분리된 텍스트를 입력하세요'}
                        {activeMode === 'json-tools' && 'JSON 데이터를 입력하고 정리 또는 압축을 선택하세요'}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* IDE 내보내기 모달 */}
      <IdeExportModal
        visible={ideExportModalVisible}
        onCancel={() => setIdeExportModalVisible(false)}
        language={selectedLanguage}
        convention={selectedPreset?.convention || {} as FormattingConvention}
      />
    </Layout>
  );
};

export default App;