import { useState } from 'react';
import { Segmented } from 'antd';
import type { BannerTextOverlay } from '../api/homeApi';
import styles from './BannerTextPreview.module.css';

export function BannerTextPreview({
  imageUrl,
  mobileImageUrl,
  copy,
}: {
  imageUrl: string;
  mobileImageUrl?: string;
  copy: BannerTextOverlay;
}) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const mobile = mode === 'mobile';
  return (
    <figure style={{ margin: '0 0 24px' }}>
      <figcaption style={{ marginBottom: 8 }}>문구 미리보기 · 배너 전체가 설정한 링크로 이동합니다</figcaption>
      <Segmented
        options={[
          { label: 'PC', value: 'desktop' },
          { label: '모바일', value: 'mobile' },
        ]}
        value={mode}
        onChange={setMode}
        style={{ marginBottom: 12 }}
      />
      <div
        className={`${styles.frame} ${mobile ? styles.mobileFrame : ''}`}
        style={{
          position: 'relative',
          aspectRatio: mobile ? '375 / 191.6667' : '1134 / 452',
          maxWidth: mobile ? 375 : undefined,
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        <img
          src={mobile ? mobileImageUrl || imageUrl : imageUrl}
          alt="배너 배경"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className={`${styles.copy} ${styles[copy.layout]}`}>
          {copy.layout === 'launch' && <img className={styles.topLogo} src="/brand/pawpong-logo.svg" alt="Pawpong" />}
          <div className={styles.headingGroup}>
            <h3 className={styles.headline}>{copy.headline}</h3>
            {copy.layout === 'welcome' ? (
              <p className={styles.welcomeLine}>
                <img className={styles.inlineLogo} src="/brand/pawpong-logo.svg" alt="Pawpong" />
                {copy.subtitle && <span>{copy.subtitle}</span>}
              </p>
            ) : copy.subtitle ? (
              <p className={styles.subtitle}>{copy.subtitle}</p>
            ) : null}
          </div>
          {copy.ctaLabel && (
            <span className={styles.cta}>
              {copy.ctaLabel}
              <span aria-hidden> ↗</span>
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}
