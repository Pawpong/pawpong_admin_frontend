import fs from 'node:fs/promises';

const source = process.argv[2] || 'https://dev-api.pawpong.kr/docs-json';
let spec;
if (/^https?:/.test(source)) {
  const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`OpenAPI fetch failed: ${response.status}`);
  spec = await response.json();
} else {
  spec = JSON.parse(await fs.readFile(source, 'utf8'));
}
if (!spec.paths || !spec.components?.schemas) throw new Error('Invalid OpenAPI document');
// Store only structural contracts, never server examples or descriptions.
const excluded = new Set(['description', 'example', 'examples', 'summary', 'operationId', 'tags', 'security', 'externalDocs']);
const compact = (value, propertyMap = false) => Array.isArray(value) ? value.map((item) => compact(item))
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([key]) => propertyMap || !excluded.has(key)).map(([key, item]) => [key, compact(item, key === 'properties')]))
    : value;
const paths = compact(Object.fromEntries(Object.entries(spec.paths).filter(([url]) =>
  url.includes('-admin') || ['/api/v2/upload', '/api/v2/upload/single', '/api/v2/upload/multiple', '/api/v2/auth/logout'].includes(url))));
const schemas = {};
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref) {
    const name = value.$ref.split('/').at(-1);
    if (!(name in schemas)) { schemas[name] = compact(spec.components.schemas[name]); collect(schemas[name]); }
  }
  Object.values(value).forEach(collect);
}
collect(paths);
await fs.writeFile('tests/fixtures/admin-openapi.json', JSON.stringify({ openapi: spec.openapi, paths, components: { schemas } }) + '\n');
console.log(`Saved ${Object.keys(paths).length} paths and ${Object.keys(schemas).length} schemas from ${source}`);
