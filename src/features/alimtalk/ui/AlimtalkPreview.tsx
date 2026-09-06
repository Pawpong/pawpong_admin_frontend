import { useCallback, useState } from 'react';
import { Alert, Input, Tag } from 'antd';
import type { AlimtalkTemplate } from '../../../shared/types/api.types';
import { alimtalkApi } from '../api/alimtalkApi';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { LoadError } from '../../../shared/components/admin/PageHeading';

export function AlimtalkPreview({ template }: { template: AlimtalkTemplate }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const replace = (text: string) =>
    text.replace(/#\{([^}]+)\}/g, (original, key: string) => values[key] || values[original] || original);
  return (
    <section className="alimtalk-preview">
      <h3>알림톡 변수 미리보기</h3>
      <p>
        <strong>{template.name}</strong> · <code>{template.templateCode}</code>
      </p>
      <div>
        <Tag color={template.isActive ? 'green' : 'default'}>{template.isActive ? '활성' : '비활성'}</Tag>
        <Tag>{template.reviewStatus === 'approved' ? '검수 통과' : '검수 미완료'}</Tag>
      </div>
      <Alert
        showIcon
        type="info"
        message="카카오 본문 원문은 현재 API에서 제공하지 않습니다."
        description="아래 값은 변수와 버튼 확인용입니다. 입력값은 저장되거나 실제 발송에 사용되지 않습니다."
      />
      {template.requiredVariables.length ? (
        template.requiredVariables.map((key) => (
          <label className="alimtalk-variable" key={key}>
            <code>{key.startsWith('#{') ? key : `#{${key}}`}</code>
            <Input
              aria-label={`미리보기 변수 ${key}`}
              placeholder="미리보기 값 입력"
              value={values[key] || ''}
              onChange={(event) => setValues((old) => ({ ...old, [key]: event.target.value }))}
            />
          </label>
        ))
      ) : (
        <p className="muted">등록된 필수 변수가 없습니다.</p>
      )}
      {template.buttons.map((button, index) => (
        <div className="alimtalk-preview-button" key={index}>
          <strong>{replace(button.buttonName)}</strong>
          {[button.linkMo, button.linkPc, button.linkAnd, button.linkIos].filter(Boolean).map((link, i) => (
            <p key={i}>{replace(link!)}</p>
          ))}
        </div>
      ))}
      <details>
        <summary>템플릿 ID · 입력 변수 확인</summary>
        <pre>{JSON.stringify({ templateId: template.templateId, variables: values }, null, 2)}</pre>
      </details>
    </section>
  );
}

export function AlimtalkPreviewByCode({ code }: { code: string }) {
  const query = useRemoteData(useCallback(() => alimtalkApi.getTemplateByCode(code), [code]));
  return (
    <div aria-busy={query.loading}>
      <LoadError error={query.error} retry={query.reload} />
      {query.loading && <p>알림톡 템플릿을 조회하고 있습니다.</p>}
      {query.data && <AlimtalkPreview key={query.data.templateCode} template={query.data} />}
    </div>
  );
}
