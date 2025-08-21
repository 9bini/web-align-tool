import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Modal,
  List,
  message,
  Tooltip,
  Switch,
  TimePicker,
  DatePicker,
  Collapse
} from 'antd';
import {
  SaveOutlined,
  LoadingOutlined,
  DeleteOutlined,
  SettingOutlined,
  CopyOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

export interface PeriodBtnConfig {
  pardiv: string;
  periodType: string;
  relstartinput: string;
  relstarthour: string;
  relendinput: string;
  relendhour: string;
  afterAutoEventFnc: string;
  clickEventFnc: string;
  clickEventParam: string;
  initialFromDateTime: string;
  initialToDateTime: string;
}

interface SavedConfig {
  id: string;
  name: string;
  config: PeriodBtnConfig;
  createdAt: string;
  description?: string;
}

const PeriodButtonConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<PeriodBtnConfig>({
    pardiv: 'periodBtn',
    periodType: 'event',
    relstartinput: 'sdate',
    relstarthour: 'shour',
    relendinput: 'edate',
    relendhour: 'ehour',
    afterAutoEventFnc: 'setGridInIt',
    clickEventFnc: 'search',
    clickEventParam: '"simple"',
    initialFromDateTime: '2024-12-04 23:00:00',
    initialToDateTime: '2024-12-05 23:00:00'
  });
  
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string>('');
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [autoFormat, setAutoFormat] = useState(true);

  useEffect(() => {
    loadSavedConfigs();
  }, []);

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config, form]);

  const loadSavedConfigs = () => {
    const saved = localStorage.getItem('periodButtonConfigs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved configs:', error);
      }
    }
  };

  const saveConfig = () => {
    if (!saveName.trim()) {
      message.error('설정 이름을 입력해주세요.');
      return;
    }

    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name: saveName.trim(),
      config: { ...config },
      createdAt: new Date().toISOString(),
      description: saveDescription.trim()
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('periodButtonConfigs', JSON.stringify(updatedConfigs));
    
    setSaveName('');
    setSaveDescription('');
    setIsModalVisible(false);
    message.success('설정이 저장되었습니다.');
  };

  const loadConfig = (savedConfig: SavedConfig) => {
    setConfig(savedConfig.config);
    message.success(`"${savedConfig.name}" 설정을 불러왔습니다.`);
  };

  const deleteConfig = (id: string) => {
    const updatedConfigs = savedConfigs.filter(c => c.id !== id);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('periodButtonConfigs', JSON.stringify(updatedConfigs));
    message.success('설정이 삭제되었습니다.');
  };

  const formatConfigOutput = (cfg: PeriodBtnConfig): string => {
    const formatValue = (key: string, value: string): string => {
      if (key.includes('DateTime') || key === 'clickEventParam') {
        return `'${value}'`;
      }
      return `'${value}'`;
    };

    const maxKeyLength = Math.max(...Object.keys(cfg).map(key => key.length));
    const commentMap: Record<string, string> = {
      pardiv: '버튼이 들어갈 div ID',
      periodType: 'zenius.properties의 값',
      relstartinput: '버튼과 연계되는 날짜 input(start) ID',
      relstarthour: '시작 시간 input ID',
      relendinput: '버튼과 연계되는 날짜 input(end) ID',
      relendhour: '종료 시간 input ID',
      afterAutoEventFnc: '버튼 셋팅후(혹은 클릭 후) 호출되어야 하는 function',
      clickEventFnc: '버튼 클릭 시 호출되어야 하는 function',
      clickEventParam: '버튼 클릭 시 호출되어야 하는 function과 함께 전달되어야 하는 변수',
      initialFromDateTime: '시작일자 초기값',
      initialToDateTime: '종료일자 초기값'
    };

    let output = 'var periodBtnParam = {\n';
    
    const entries = Object.entries(cfg);
    entries.forEach(([key, value], index) => {
      const paddedKey = key.padEnd(maxKeyLength);
      const formattedValue = formatValue(key, value);
      const comment = commentMap[key] || '';
      const comma = index < entries.length - 1 ? ',' : '';
      
      if (autoFormat && comment) {
        output += `    ${paddedKey} : ${formattedValue}${comma.padEnd(20)} // ${comment}\n`;
      } else {
        output += `    ${paddedKey} : ${formattedValue}${comma}\n`;
      }
    });
    
    output += '};';
    return output;
  };

  const handlePreview = () => {
    const formatted = formatConfigOutput(config);
    setCurrentPreview(formatted);
    setPreviewModalVisible(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('클립보드에 복사되었습니다.');
    } catch (err) {
      message.error('복사에 실패했습니다.');
    }
  };

  const handleFormChange = (changedFields: any, allFields: any) => {
    const newConfig = { ...config };
    Object.keys(allFields).forEach(key => {
      if (allFields[key] !== undefined) {
        newConfig[key as keyof PeriodBtnConfig] = allFields[key];
      }
    });
    setConfig(newConfig);
  };

  const quickDateTimeSet = (type: 'from' | 'to', preset: string) => {
    const now = dayjs();
    let dateTime: string;

    switch (preset) {
      case 'now':
        dateTime = now.format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'today-start':
        dateTime = now.startOf('day').format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'today-end':
        dateTime = now.endOf('day').format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'yesterday':
        dateTime = now.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'week-start':
        dateTime = now.startOf('week').format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'month-start':
        dateTime = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');
        break;
      default:
        return;
    }

    const field = type === 'from' ? 'initialFromDateTime' : 'initialToDateTime';
    const newConfig = { ...config, [field]: dateTime };
    setConfig(newConfig);
    form.setFieldValue(field, dateTime);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            Period Button 설정 관리
          </Title>
          <Space>
            <Switch
              checked={autoFormat}
              onChange={setAutoFormat}
              checkedChildren="자동 정렬"
              unCheckedChildren="수동 정렬"
            />
            <Button onClick={handlePreview} icon={<EyeOutlined />}>
              미리보기
            </Button>
            <Button type="primary" onClick={() => setIsModalVisible(true)} icon={<SaveOutlined />}>
              설정 저장
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 0]}>
          <Col xs={24} lg={16}>
            <Card title="설정 입력" size="small">
              <Form
                form={form}
                layout="vertical"
                initialValues={config}
                onValuesChange={handleFormChange}
              >
                <Collapse defaultActiveKey={['1', '2']} ghost>
                  <Panel header="기본 설정" key="1">
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="버튼 컨테이너 DIV ID" name="pardiv" tooltip="버튼이 렌더링될 div 요소의 ID">
                          <Input placeholder="예: periodBtn" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Period Type" name="periodType" tooltip="zenius.properties에서 정의된 값">
                          <Select>
                            <Option value="event">event</Option>
                            <Option value="daily">daily</Option>
                            <Option value="weekly">weekly</Option>
                            <Option value="monthly">monthly</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="시작 날짜 Input ID" name="relstartinput">
                          <Input placeholder="예: sdate" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="시작 시간 Input ID" name="relstarthour">
                          <Input placeholder="예: shour" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="종료 날짜 Input ID" name="relendinput">
                          <Input placeholder="예: edate" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="종료 시간 Input ID" name="relendhour">
                          <Input placeholder="예: ehour" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="이벤트 함수 설정" key="2">
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="초기화 후 호출 함수" name="afterAutoEventFnc" tooltip="버튼 설정 완료 후 자동으로 호출되는 함수">
                          <Input placeholder="예: setGridInIt" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="클릭 이벤트 함수" name="clickEventFnc" tooltip="버튼 클릭 시 호출되는 함수">
                          <Input placeholder="예: search" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="클릭 이벤트 파라미터" name="clickEventParam" tooltip="클릭 함수에 전달될 파라미터">
                      <Input placeholder='예: "simple"' />
                    </Form.Item>
                  </Panel>

                  <Panel header="초기 날짜/시간 설정" key="3">
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="시작 날짜/시간" name="initialFromDateTime">
                          <Input placeholder="YYYY-MM-DD HH:mm:ss" />
                        </Form.Item>
                        <Space wrap>
                          <Button size="small" icon={<ClockCircleOutlined />} onClick={() => quickDateTimeSet('from', 'now')}>
                            현재
                          </Button>
                          <Button size="small" icon={<CalendarOutlined />} onClick={() => quickDateTimeSet('from', 'today-start')}>
                            오늘 시작
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('from', 'yesterday')}>
                            어제
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('from', 'week-start')}>
                            주 시작
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('from', 'month-start')}>
                            월 시작
                          </Button>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="종료 날짜/시간" name="initialToDateTime">
                          <Input placeholder="YYYY-MM-DD HH:mm:ss" />
                        </Form.Item>
                        <Space wrap>
                          <Button size="small" icon={<ClockCircleOutlined />} onClick={() => quickDateTimeSet('to', 'now')}>
                            현재
                          </Button>
                          <Button size="small" icon={<CalendarOutlined />} onClick={() => quickDateTimeSet('to', 'today-end')}>
                            오늘 끝
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('to', 'yesterday')}>
                            어제
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('to', 'week-start')}>
                            주 시작
                          </Button>
                          <Button size="small" onClick={() => quickDateTimeSet('to', 'month-start')}>
                            월 시작
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Panel>
                </Collapse>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="저장된 설정" size="small">
              {savedConfigs.length === 0 ? (
                <Text type="secondary">저장된 설정이 없습니다.</Text>
              ) : (
                <List
                  size="small"
                  dataSource={savedConfigs}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tooltip title="불러오기">
                          <Button
                            type="text"
                            size="small"
                            icon={<LoadingOutlined />}
                            onClick={() => loadConfig(item)}
                          />
                        </Tooltip>,
                        <Tooltip title="삭제">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteConfig(item.id)}
                          />
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={
                          <div>
                            {item.description && <div>{item.description}</div>}
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title="설정 저장"
        open={isModalVisible}
        onOk={saveConfig}
        onCancel={() => setIsModalVisible(false)}
        okText="저장"
        cancelText="취소"
      >
        <Form layout="vertical">
          <Form.Item label="설정 이름" required>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="설정의 이름을 입력하세요"
            />
          </Form.Item>
          <Form.Item label="설명 (선택사항)">
            <Input.TextArea
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="설정에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="생성된 코드 미리보기"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => copyToClipboard(currentPreview)}>
            복사
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            닫기
          </Button>
        ]}
        width={800}
      >
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '6px', 
          fontSize: '12px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {currentPreview}
        </pre>
      </Modal>
    </div>
  );
};

export default PeriodButtonConfig;