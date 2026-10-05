import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Checkbox, Descriptions, Space, Spin, Switch, Tag } from 'antd';
import { ExportOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import { isAxiosError, isCancel } from 'axios';
import { petReleaseApi } from '../../features/playground/api/petReleaseApi';
import {
  draftFromRelease,
  isPetReleaseDirty,
  LOCKED_PET_RELEASE_DRAFT,
  opensPublication,
  PET_PREVIEW_URL,
  PET_RELEASE_QUALITY_REQUIRED,
  petReleaseStatus,
  publicationTakesEffect,
  withPublished,
  withQualityApproval,
  type PetReleaseDraft,
  type PlaygroundPetRelease,
} from '../../features/playground/model/petRelease';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import styles from './PetRelease.module.css';

const ENVIRONMENT_LABELS: Record<string, string> = {
  production: '운영',
  development: '개발',
  unknown: '확인 불가',
};
const STATUS = {
  public: { color: 'green', label: '공개 중' },
  private: { color: 'gold', label: '비공개·개발 중' },
  unknown: { color: 'default', label: '상태 확인 불가' },
} as const;

function errorMessage(cause: unknown, fallback: string) {
  if (isAxiosError(cause)) {
    if (cause.response?.status === 403) return '관리자 권한이 필요해요. 관리자 계정으로 다시 로그인해 주세요.';
    if (cause.response?.status === 401) return '로그인이 만료됐어요. 다시 로그인해 주세요.';
    if (cause.response?.status === 404)
      return '이 서버에는 공개 관리 기능이 아직 준비되지 않았어요. 공개 상태를 바꿀 수 없고, 반려동물 키우기는 비공개로 유지됩니다.';
  }
  if (cause instanceof Error && cause.message === PET_RELEASE_QUALITY_REQUIRED) return cause.message;
  return fallback;
}
function environmentLabel(environment: string) {
  const label = ENVIRONMENT_LABELS[environment.toLowerCase()];
  return label ? `${label} (${environment})` : environment;
}
function formatUpdatedAt(value: string | null) {
  if (!value) return '변경 이력 없음 (기본 비공개)';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR');
}
function accessLabel(release: PlaygroundPetRelease) {
  if (!release.effectiveEnabled) {
    return release.qualityApproved && release.published
      ? '차단됨 · 공개 설정은 저장돼 있지만 이 환경에서는 적용되지 않아요'
      : '차단됨 · 메뉴, 직접 URL, 서버 API 모두 잠겨 있어요';
  }
  return petReleaseStatus(release) === 'public'
    ? '열림 · 사용자에게 공개 중이에요'
    : '개발 미리보기로만 열림 · 운영 공개가 아니에요';
}
function draftLabel(draft: PetReleaseDraft) {
  return `품질 승인 ${draft.qualityApproved ? '확인' : '미확인'} · 운영 공개 ${draft.published ? '켬' : '끔'}`;
}

export default function PetRelease() {
  const { message, modal } = App.useApp();
  const [release, setRelease] = useState<PlaygroundPetRelease | null>(null);
  const [draft, setDraft] = useState<PetReleaseDraft>(LOCKED_PET_RELEASE_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // 409로 거절된 저장 시도. 최신 설정을 다시 불러온 뒤에도 안내가 남도록 따로 보관한다.
  const [conflict, setConflict] = useState<PetReleaseDraft | null>(null);
  const savingLock = useRef(false);
  const loadSequence = useRef(0);

  // 조회만 한다. 화면 진입이나 배포 완료가 공개 설정을 바꾸지 않는다.
  const load = useCallback((signal?: AbortSignal) => {
    const sequence = ++loadSequence.current;
    return petReleaseApi
      .get(signal)
      .then((latest) => {
        if (signal?.aborted || sequence !== loadSequence.current) return;
        setRelease(latest);
        setDraft(draftFromRelease(latest));
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCancel(cause) || sequence !== loadSequence.current) return;
        // 확인하지 못한 이전 값으로는 편집·저장하지 못하게 잠근다.
        setRelease(null);
        setDraft(LOCKED_PET_RELEASE_DRAFT);
        setError(
          errorMessage(
            cause,
            '공개 설정을 불러오지 못했어요. 공개 상태는 바뀌지 않았어요. 연결을 확인하고 다시 시도해 주세요.',
          ),
        );
      })
      .finally(() => {
        if (!signal?.aborted && sequence === loadSequence.current) setLoading(false);
      });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const reload = () => {
    if (savingLock.current || loading) return;
    setLoading(true);
    setError(null);
    setSaveError(null);
    setSaved(false);
    setConflict(null);
    void load();
  };
  const submit = async () => {
    if (savingLock.current || !release) return;
    savingLock.current = true;
    const attempted = draft;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    setConflict(null);
    try {
      const next = await petReleaseApi.save(attempted, release.revision);
      setRelease(next);
      setDraft(draftFromRelease(next));
      setSaved(true);
      void message.success(`공개 설정을 저장했어요. 현재 상태: ${STATUS[petReleaseStatus(next)].label}`);
    } catch (cause) {
      if (isAxiosError(cause) && cause.response?.status === 409) {
        // 다른 관리자의 변경을 보지 않은 채 내 선택을 다시 적용하지 않는다.
        // 최신 설정으로 되돌리고, 무엇을 저장하려 했는지만 안내로 남긴다.
        setConflict(attempted);
        setLoading(true);
        await load();
      } else {
        setSaveError(
          errorMessage(cause, '저장하지 못했어요. 공개 상태는 바뀌지 않았어요. 연결을 확인하고 다시 시도해 주세요.'),
        );
      }
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  };

  const status = petReleaseStatus(release);
  const locked = loading || saving || !release;
  const dirty = !!release && isPetReleaseDirty(release, draft);
  const save = () => {
    if (locked || !release || !dirty) return;
    if (!opensPublication(release, draft)) {
      void submit();
      return;
    }
    modal.confirm({
      title: '반려동물 키우기를 사용자에게 공개할까요?',
      content: publicationTakesEffect(release.environment)
        ? `저장하면 ${environmentLabel(release.environment)} 환경에서 놀이터 메뉴, 직접 URL, 서버 API 잠금이 풀려요. 품질 검수가 끝났는지 다시 확인해 주세요.`
        : `지금 연결된 서버는 ${environmentLabel(release.environment)} 환경이에요. 이 설정은 이 서버에만 저장되고, 운영 서비스는 공개되지 않아요. 이 환경의 잠금도 풀리지 않아요.`,
      okText: '공개로 저장',
      cancelText: '취소',
      onOk: submit,
    });
  };

  return (
    <div className={styles.page}>
      <PageHeading
        title="반려동물 키우기 공개 관리"
        description="놀이터 반려동물 키우기의 품질 승인과 사용자 공개를 따로 관리해요. 기본값은 비공개이며, 배포만으로는 공개되지 않아요."
        action={
          <Space wrap>
            <Button icon={<ReloadOutlined />} disabled={loading || saving} onClick={reload}>
              다시 불러오기
            </Button>
            <Button type="primary" disabled={locked || !dirty} loading={saving} onClick={save}>
              변경사항 저장
            </Button>
          </Space>
        }
      />
      <LoadError error={error ?? undefined} retry={reload} />
      {error && (
        <Alert
          className={styles.notice}
          type="warning"
          showIcon
          message="설정을 확인할 수 없어 공개 변경을 잠갔어요"
          description="아래 스위치는 실제 서버 값이 아니에요. 설정을 다시 불러오기 전에는 품질 승인이나 공개를 저장할 수 없어요."
        />
      )}
      {saveError && (
        <Alert className={styles.notice} type="error" showIcon message="저장하지 못했어요" description={saveError} />
      )}
      {conflict && (
        <Alert
          className={styles.notice}
          type="warning"
          showIcon
          closable
          onClose={() => setConflict(null)}
          message="다른 관리자가 먼저 변경해서 저장하지 않았어요"
          description={
            error
              ? `저장하려던 값: ${draftLabel(conflict)}. 최신 설정도 불러오지 못해 공개 변경을 잠갔어요. 다시 불러온 뒤 확인해 주세요.`
              : `저장하려던 값: ${draftLabel(conflict)}. 아래에는 서버의 최신 설정을 다시 불러왔어요. 내용을 확인한 뒤 필요하면 다시 선택해서 저장해 주세요.`
          }
        />
      )}
      {saved && release && (
        <Alert
          className={styles.notice}
          type="success"
          showIcon
          closable
          onClose={() => setSaved(false)}
          message="공개 설정을 저장했어요"
          description={`현재 상태: ${STATUS[status].label} · 버전 ${release.revision}${
            release.published && !release.effectiveEnabled ? ' · 이 환경에서는 공개 설정이 적용되지 않아요' : ''
          }`}
        />
      )}

      <Spin spinning={loading} tip="공개 설정을 불러오고 있어요">
        <Space direction="vertical" size={20} className={styles.fullWidth}>
          <Card
            title="현재 상태"
            extra={
              <Tag color={STATUS[status].color} className={styles.statusTag}>
                {STATUS[status].label}
              </Tag>
            }
          >
            {release ? (
              <Descriptions column={1} size="small" className={styles.summary}>
                <Descriptions.Item label="현재 환경">{environmentLabel(release.environment)}</Descriptions.Item>
                <Descriptions.Item label="이 환경의 사용자 접근">{accessLabel(release)}</Descriptions.Item>
                <Descriptions.Item label="품질 승인">{release.qualityApproved ? '승인됨' : '미승인'}</Descriptions.Item>
                <Descriptions.Item label="운영 공개 설정">{release.published ? '켜짐' : '꺼짐'}</Descriptions.Item>
                <Descriptions.Item label="개발 미리보기">
                  {release.developmentPreviewEnabled ? '이 환경에서 사용 중' : '이 환경에서 사용 안 함'}
                </Descriptions.Item>
                <Descriptions.Item label="마지막 변경">{formatUpdatedAt(release.updatedAt)}</Descriptions.Item>
                <Descriptions.Item label="설정 버전">{release.revision}</Descriptions.Item>
              </Descriptions>
            ) : (
              <p className={styles.muted}>
                {loading
                  ? '서버 설정을 확인하고 있어요.'
                  : '서버 설정을 확인하지 못했어요. 이 화면에서는 공개 상태를 바꿀 수 없어요.'}
              </p>
            )}
          </Card>

          <Alert
            type="info"
            showIcon
            icon={<LockOutlined />}
            message="비공개 상태에서 잠기는 범위"
            description={
              <ul className={styles.lockList}>
                <li>
                  <strong>메뉴</strong> — 놀이터에 반려동물 키우기 진입 메뉴가 보이지 않아요.
                </li>
                <li>
                  <strong>직접 URL</strong> — 주소(/playground/pet)를 직접 입력해도 화면이 열리지 않아요.
                </li>
                <li>
                  <strong>서버 API</strong> — 반려동물 키우기 요청을 서버가 거절해서, 화면을 우회해도 사용할 수 없어요.
                </li>
                <li>
                  품질 승인과 공개 설정이 모두 켜져야 잠금이 풀려요. 코드 병합이나 배포 성공으로는 자동으로 켜지지
                  않아요.
                </li>
              </ul>
            }
          />

          <Card title="개발 미리보기">
            <p>
              게임을 다듬는 동안에는 개발 환경에서만 확인해요. 이 링크는 검수용이며, 열린다고 해서 사용자에게 공개된
              것은 아니에요.
            </p>
            <Button
              type="link"
              className={styles.previewLink}
              icon={<ExportOutlined />}
              href={PET_PREVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {PET_PREVIEW_URL}
            </Button>
          </Card>

          <Card title="공개 설정">
            <div className={styles.control}>
              <Checkbox
                checked={draft.qualityApproved === true}
                disabled={locked}
                onChange={(event) => {
                  setSaved(false);
                  setDraft((current) => withQualityApproval(current, event.target.checked));
                }}
              >
                <strong>1. 품질 승인</strong> — 개발 미리보기에서 게임을 직접 확인했고, 사용자에게 공개해도 되는
                품질이에요.
              </Checkbox>
              <p className={styles.muted}>승인만으로는 공개되지 않아요. 승인을 해제하면 공개 설정도 함께 꺼져요.</p>
            </div>
            <div className={styles.control}>
              <Space wrap align="center">
                <Switch
                  aria-label="운영 공개"
                  checked={draft.published === true}
                  disabled={locked || draft.qualityApproved !== true}
                  checkedChildren="공개"
                  unCheckedChildren="비공개"
                  onChange={(checked) => {
                    setSaved(false);
                    setDraft((current) => withPublished(current, checked));
                  }}
                />
                <strong>2. 운영 공개</strong>
              </Space>
              <p className={styles.muted}>
                {draft.qualityApproved !== true
                  ? '품질 승인을 먼저 체크해야 켤 수 있어요.'
                  : release && !publicationTakesEffect(release.environment)
                    ? '이 환경에서는 켜서 저장해도 잠금이 풀리지 않아요. 사용자 공개는 운영 환경의 설정에서만 적용돼요.'
                    : '켜고 저장하면 메뉴, 직접 URL, 서버 API 잠금이 풀려요. 저장 전에 한 번 더 확인해요.'}
              </p>
            </div>
            {dirty && (
              <Alert
                type="warning"
                showIcon
                message="아직 저장하지 않은 변경이 있어요"
                description={`저장할 값: ${draftLabel(draft)}. '변경사항 저장'을 눌러야 서버에 반영돼요.`}
              />
            )}
          </Card>
        </Space>
      </Spin>
    </div>
  );
}
