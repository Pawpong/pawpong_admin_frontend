import fs from 'node:fs';
import ts from 'typescript';

export function bannerCrudFixture(options = {}) {
  const updates = [], notices = [];
  let refreshes = 0;
  const banners = options.banners ?? [{
    bannerId: 'synthetic-banner',
    title: '목록을 조회했을 때의 문구',
    desktopImageFileName: 'banners/synthetic-desktop.png',
    mobileImageFileName: 'banners/synthetic-mobile.png',
    desktopImageUrl: 'https://example.test/desktop.png',
    mobileImageUrl: 'https://example.test/mobile.png',
    linkType: 'internal', linkUrl: '/playground', order: 1, isActive: true,
    textOverlay: { layout: 'welcome', headline: '이전 제목' },
  }];
  const dependencies = {
    react: { useState: value => [value, () => {}], useCallback: callback => callback },
    antd: { Form: { useForm: () => [{}] }, message: {
      success: value => notices.push(['success', value]),
      error: value => notices.push(['error', value]),
    } },
    '../api/homeApi': { homeApi: { updateBanner: async (...args) => {
      if (options.fail) throw new Error('합성 저장 실패');
      updates.push(args);
    } } },
    '../../upload/api/uploadApi': { uploadApi: {} },
    '../../../shared/hooks': { useListData: () => ({
      data: banners, loading: false, error: null, refetch: () => { refreshes++; },
    }) },
  };
  const code = ts.transpileModule(fs.readFileSync('src/features/home/hooks/useBannerCrud.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const result = {};
  new Function('exports', 'require', 'console', code)(result,
    name => { if (!(name in dependencies)) throw new Error(`정의되지 않은 테스트 의존성: ${name}`); return dependencies[name]; },
    { error() {} },
  );
  return { hook: result.useBannerCrud(), updates, notices, refreshes: () => refreshes };
}
