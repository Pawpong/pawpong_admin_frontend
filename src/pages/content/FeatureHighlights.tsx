import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Checkbox, Form, Input, InputNumber, Select, Space, Spin, Switch, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { isAxiosError, isCancel } from 'axios';
import { featureHighlightsApi } from '../../features/home/api/featureHighlightsApi';
import {
  HIGHLIGHT_ICON_OPTIONS,
  HIGHLIGHT_LINK_OPTIONS,
  HIGHLIGHT_PLACEMENT_OPTIONS,
  isCareMapHighlight,
  MAP_PLACEMENT_ERROR,
  type FeatureHighlight,
  type FeatureHighlightConfig,
} from '../../features/home/model/featureHighlights';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import styles from './FeatureHighlights.module.css';

const required = [{ required: true, whitespace: true, message: '내용을 입력해 주세요.' }];
function errorMessage(cause: unknown, fallback: string) {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 403) return '관리자 권한이 필요해요. 관리자 계정으로 다시 로그인해 주세요.';
    if (cause.response?.status === 401) return '로그인이 만료됐어요. 다시 로그인해 주세요.';
  }
  if (cause instanceof Error && cause.message === MAP_PLACEMENT_ERROR) return cause.message;
  return fallback;
}

export default function FeatureHighlights() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FeatureHighlightConfig>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [latest, setLatest] = useState<FeatureHighlightConfig | null>(null);
  const [checkingLatest, setCheckingLatest] = useState(false);
  const [dirty, setDirty] = useState(false);
  const savingLock = useRef(false);
  const loadSequence = useRef(0);
  const cards = Form.useWatch('cards', form) as FeatureHighlight[] | undefined;
  const unavailable = saving || loading || !!error;
  const applyConfig = useCallback(
    (config: FeatureHighlightConfig) => {
      form.setFieldsValue(config);
      setConflict(false);
      setLatest(null);
      setDirty(false);
      setSaveError(null);
    },
    [form],
  );
  const load = useCallback(
    (signal?: AbortSignal) => {
      const sequence = ++loadSequence.current;
      return featureHighlightsApi
        .get(signal)
        .then((config) => {
          if (!signal?.aborted && sequence === loadSequence.current) applyConfig(config);
        })
        .catch((cause: unknown) => {
          if (!isCancel(cause) && sequence === loadSequence.current) {
            setError(errorMessage(cause, '신기능 소개를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.'));
          }
        })
        .finally(() => {
          if (!signal?.aborted && sequence === loadSequence.current) setLoading(false);
        });
    },
    [applyConfig],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const loadLatest = () => {
    setLoading(true);
    setError(null);
    return load();
  };
  const reload = () => {
    if (savingLock.current || loading) return;
    if (!dirty) {
      void loadLatest();
      return;
    }
    modal.confirm({
      title: '최신 설정을 불러올까요?',
      content: '현재 화면에서 편집한 초안이 서버에 저장된 내용으로 바뀝니다. 필요한 문구를 먼저 보관해 주세요.',
      okText: '최신 설정 불러오기',
      cancelText: '내 초안 유지',
      onOk: loadLatest,
    });
  };
  const inspectLatest = async () => {
    if (checkingLatest) return;
    setCheckingLatest(true);
    try {
      setLatest(await featureHighlightsApi.get());
    } catch (cause) {
      void message.error(errorMessage(cause, '서버 변경을 확인하지 못했어요. 내 초안은 유지됩니다.'));
    } finally {
      setCheckingLatest(false);
    }
  };
  const save = async () => {
    if (savingLock.current || loading || error || conflict || !dirty) return;
    savingLock.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const values = await form.validateFields();
      applyConfig(await featureHighlightsApi.save(values));
      void message.success('신기능 소개를 저장했어요. 선택한 화면에 반영됩니다.');
    } catch (cause) {
      if (isAxiosError(cause) && cause.response?.status === 409) {
        // 이전 revision과 초안을 그대로 보존한다. 서버 변경 확인 뒤 명시적으로 다시 불러온다.
        setConflict(true);
        setLatest(null);
      } else if (!(cause && typeof cause === 'object' && 'errorFields' in cause)) {
        setSaveError(
          errorMessage(cause, '저장하지 못했어요. 입력한 내용은 남아 있으니 연결을 확인하고 다시 시도해 주세요.'),
        );
      }
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeading
        title="신기능 소개"
        description="홈·놀이터·탐색에 소개할 기능의 문구, 버튼과 노출 순서를 관리해요. 돌봄 지도는 홈과 놀이터에서 보여요."
        action={
          <Space wrap>
            <Button icon={<ReloadOutlined />} disabled={loading || saving} onClick={reload}>
              다시 불러오기
            </Button>
            <Button
              type="primary"
              disabled={loading || !!error || !dirty || conflict}
              loading={saving}
              onClick={() => void save()}
            >
              변경사항 저장
            </Button>
          </Space>
        }
      />
      <LoadError error={error ?? undefined} retry={reload} />
      {saveError && (
        <Alert className={styles.notice} type="error" showIcon message="저장하지 못했어요" description={saveError} />
      )}
      {conflict && (
        <Alert
          className={styles.notice}
          type="warning"
          showIcon
          message="다른 관리자가 먼저 변경했어요."
          description="내 초안은 그대로 남아 있어요. 서버의 변경사항을 확인한 뒤 최신 설정을 불러와 다시 편집해 주세요."
          action={
            <Space wrap>
              <Button loading={checkingLatest} onClick={() => void inspectLatest()}>
                서버 변경 확인
              </Button>
              <Button onClick={reload}>최신 설정 불러오기</Button>
            </Space>
          }
        />
      )}
      {latest && (
        <Card className={styles.notice} title={`서버에 저장된 내용 · 버전 ${latest.revision}`}>
          <p>아래 내용은 비교용이에요. 편집 중인 초안은 바뀌지 않았어요.</p>
          {latest.cards.length === 0 ? (
            <p>모든 신기능 소개가 숨겨져 있어요.</p>
          ) : (
            latest.cards.map((card) => (
              <div key={card.id} className={styles.remoteCard}>
                <Space wrap>
                  <strong>{card.title}</strong>
                  <Tag>{card.enabled ? '노출' : '숨김'}</Tag>
                </Space>
                {card.eyebrow && <p>{card.eyebrow}</p>}
                <p>{card.description}</p>
                <p>
                  위치:{' '}
                  {card.placements
                    .map((value) => HIGHLIGHT_PLACEMENT_OPTIONS.find((option) => option.value === value)?.label)
                    .join(', ')}
                </p>
                <p>
                  버튼:{' '}
                  {card.actions
                    .map(
                      (action) =>
                        `${action.label} (${HIGHLIGHT_LINK_OPTIONS.find((option) => option.value === action.href)?.label})`,
                    )
                    .join(' · ')}
                </p>
              </div>
            ))
          )}
        </Card>
      )}
      <Spin spinning={loading} tip="신기능 소개를 불러오고 있어요">
        <Form form={form} layout="vertical" disabled={unavailable} onValuesChange={() => setDirty(true)}>
          <Form.Item name="revision" hidden>
            <InputNumber />
          </Form.Item>
          <Form.List name="cards">
            {(fields, { add, remove, move }) => (
              <Space direction="vertical" size={20} className={styles.fullWidth}>
                {fields.map((field, index) => {
                  const card = cards?.[index];
                  const mapCard = !!card && isCareMapHighlight(card);
                  const legacyMapPlacement = mapCard && card.placements.includes('explore');
                  return (
                    <Card
                      key={field.key}
                      className={styles.editorCard}
                      title={`${index + 1}. ${card?.title || '새 카드'}`}
                      extra={
                        <Space wrap>
                          <Button
                            aria-label={`${index + 1}번 카드 위로`}
                            icon={<ArrowUpOutlined />}
                            disabled={index === 0 || unavailable}
                            onClick={() => {
                              move(index, index - 1);
                              setDirty(true);
                            }}
                          />
                          <Button
                            aria-label={`${index + 1}번 카드 아래로`}
                            icon={<ArrowDownOutlined />}
                            disabled={index === fields.length - 1 || unavailable}
                            onClick={() => {
                              move(index, index + 1);
                              setDirty(true);
                            }}
                          />
                          <Button
                            aria-label={`${index + 1}번 카드 삭제`}
                            icon={<DeleteOutlined />}
                            danger
                            disabled={unavailable}
                            onClick={() => {
                              remove(index);
                              setDirty(true);
                            }}
                          />
                        </Space>
                      }
                    >
                      <Form.Item name={[field.name, 'id']} hidden>
                        <Input />
                      </Form.Item>
                      <div className={styles.fields}>
                        <Form.Item name={[field.name, 'enabled']} label="노출 여부" valuePropName="checked">
                          <Switch checkedChildren="노출" unCheckedChildren="숨김" />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'placements']}
                          label="노출 화면"
                          rules={[{ required: true, message: '한 곳 이상 선택해 주세요.' }]}
                          extra={mapCard ? '돌봄 지도는 홈과 놀이터에서만 보여요.' : undefined}
                          validateStatus={legacyMapPlacement ? 'error' : undefined}
                          help={legacyMapPlacement ? MAP_PLACEMENT_ERROR : undefined}
                        >
                          <Checkbox.Group
                            options={HIGHLIGHT_PLACEMENT_OPTIONS.map((option) => ({
                              ...option,
                              disabled: mapCard && option.value === 'explore' && !legacyMapPlacement,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item name={[field.name, 'icon']} label="아이콘" rules={[{ required: true }]}>
                          <Select options={HIGHLIGHT_ICON_OPTIONS} />
                        </Form.Item>
                        <Form.Item name={[field.name, 'eyebrow']} label="작은 안내 문구">
                          <Input maxLength={20} placeholder="새로 만나요" showCount />
                        </Form.Item>
                      </div>
                      <Form.Item name={[field.name, 'title']} label="제목" rules={required}>
                        <Input maxLength={50} showCount />
                      </Form.Item>
                      <Form.Item name={[field.name, 'description']} label="설명">
                        <Input.TextArea maxLength={140} showCount rows={2} />
                      </Form.Item>
                      <Form.List name={[field.name, 'actions']}>
                        {(actions, controls) => (
                          <>
                            {actions.map((action, actionIndex) => (
                              <div key={action.key} className={styles.actionFields}>
                                <Form.Item
                                  name={[action.name, 'label']}
                                  label={`버튼 ${actionIndex + 1} 이름`}
                                  rules={required}
                                >
                                  <Input maxLength={20} showCount />
                                </Form.Item>
                                <Form.Item
                                  name={[action.name, 'href']}
                                  label="연결할 화면"
                                  rules={[{ required: true, message: '연결할 화면을 선택해 주세요.' }]}
                                >
                                  <Select options={HIGHLIGHT_LINK_OPTIONS} placeholder="서비스 화면 선택" />
                                </Form.Item>
                                {actions.length > 1 && (
                                  <Button
                                    className={styles.removeAction}
                                    aria-label={`${index + 1}번 카드 버튼 ${actionIndex + 1} 삭제`}
                                    disabled={unavailable}
                                    onClick={() => {
                                      controls.remove(actionIndex);
                                      setDirty(true);
                                    }}
                                  >
                                    삭제
                                  </Button>
                                )}
                              </div>
                            ))}
                            {actions.length < 2 && (
                              <Button
                                disabled={unavailable}
                                onClick={() => {
                                  controls.add({ label: '', href: '/care-map' });
                                  setDirty(true);
                                }}
                              >
                                보조 버튼 추가
                              </Button>
                            )}
                          </>
                        )}
                      </Form.List>
                      <div className={styles.preview} aria-label={`${index + 1}번 카드 문구 미리보기`}>
                        <small>{card?.eyebrow}</small>
                        <h3>{card?.title || '카드 제목'}</h3>
                        <p>{card?.description}</p>
                        <Space wrap>
                          {card?.actions.map((action, actionIndex) => (
                            <span key={actionIndex} className={styles.previewAction} data-primary={actionIndex === 0}>
                              {action.label || '버튼 이름'} →
                            </span>
                          ))}
                        </Space>
                      </div>
                    </Card>
                  );
                })}
                {!fields.length && !loading && !error && (
                  <Alert type="info" showIcon message="등록된 카드가 없어요. 저장하면 모든 신기능 소개가 숨겨집니다." />
                )}
                <Button
                  icon={<PlusOutlined />}
                  disabled={fields.length >= 12 || unavailable}
                  onClick={() => {
                    add({
                      id: `feature-${crypto.randomUUID().slice(0, 8)}`,
                      eyebrow: '새로 만나요',
                      title: '',
                      description: '',
                      icon: 'spark',
                      enabled: false,
                      placements: ['home'],
                      actions: [{ label: '자세히 보기', href: '/ai-filter' }],
                    });
                    setDirty(true);
                  }}
                >
                  신기능 카드 추가
                </Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Spin>
    </div>
  );
}
