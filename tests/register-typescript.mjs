import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Run the real API modules in Node without a browser, server or additional dependencies.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier, context.parentURL);
      for (const suffix of ['.ts', '.tsx']) {
        if (existsSync(fileURLToPath(url) + suffix)) return { url: url.href + suffix, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.ts') || url.endsWith('.tsx')) {
      const source = readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', '({ VITE_API_BASE_URL: "https://api.test/api" })');
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
        fileName: fileURLToPath(url),
      }).outputText };
    }
    return nextLoad(url, context);
  },
});
