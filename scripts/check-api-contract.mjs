import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const specPath = process.argv[2] || 'tests/fixtures/admin-openapi.json';
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const config = ts.readConfigFile('tsconfig.app.json', ts.sys.readFile).config;
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const errors = [];
let count = 0;
const covered = new Set();
const normalize = (url) => url.replace(/\{[^}]*\}/g, '{}');
const resolve = (schema) => schema?.$ref ? resolve(spec.components.schemas[schema.$ref.split('/').at(-1)]) : schema;
function responseSchema(schema) {
  schema = resolve(schema);
  if (!schema?.allOf) return schema;
  const parts = schema.allOf.map(responseSchema);
  return { ...schema, properties: Object.assign({}, ...parts.map((p) => p.properties || {})) };
}
function checkResponse(type, schema, label, depth = 0) {
  schema = responseSchema(schema);
  if (!schema || depth > 12 || type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return;
  type = checker.getNonNullableType(type);
  if (schema.type === 'array') {
    const item = checker.getIndexTypeOfType(type, ts.IndexKind.Number);
    if (item) checkResponse(item, schema.items, label + '[]', depth + 1);
    return;
  }
  if (!schema.properties) return;
  for (const prop of checker.getPropertiesOfType(type)) {
    if (!prop.valueDeclaration) continue;
    const field = schema.properties[prop.name];
    if (!field) {
      if (!(prop.flags & ts.SymbolFlags.Optional)) errors.push(`${label}: expected field ${prop.name} absent from response schema`);
      continue;
    }
    checkResponse(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration), field, label + '.' + prop.name, depth + 1);
  }
}
function checkFields(type, schema, label, required = true) {
  schema = resolve(schema);
  if (!schema?.properties || type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return;
  const properties = checker.getPropertiesOfType(type);
  const names = properties.map((p) => p.name);
  for (const name of names) {
    if (!(name in schema.properties)) errors.push(`${label}: unsupported field ${name}`);
  }
  if (required) for (const name of schema.required || []) {
    if (!names.includes(name)) errors.push(`${label}: missing required field ${name}`);
  }
  for (const prop of properties) {
    const field = resolve(schema.properties[prop.name]);
    if (!field?.enum || !prop.valueDeclaration) continue;
    const value = checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
    for (const item of value.isUnion() ? value.types : [value]) {
      if (item.isStringLiteral() && !field.enum.includes(item.value)) errors.push(`${label}.${prop.name}: unsupported value ${item.value}`);
    }
  }
}
for (const source of program.getSourceFiles()) {
  if (!source.fileName.includes('/src/features/') || !source.fileName.includes('/api/')) continue;
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(source) === 'apiClient') {
      const method = node.expression.name.text;
      const arg = node.arguments[0];
      let url;
      if (arg && ts.isStringLiteralLike(arg)) url = arg.text;
      else if (arg && ts.isTemplateExpression(arg)) url = arg.head.text + arg.templateSpans.map((s) => '{}' + s.literal.text).join('');
      if (!url) { errors.push(`Unresolved API URL: ${node.getText(source)}`); return; }
      const route = Object.keys(spec.paths).find((p) => normalize(p) === normalize('/api' + url));
      const label = `${path.basename(source.fileName)} ${method.toUpperCase()} ${url}`;
      const operation = spec.paths[route]?.[method];
      count++;
      if (!operation) { errors.push(`${label}: endpoint absent from OpenAPI`); return; }
      covered.add(`${method.toUpperCase()} ${route}`);
      if (node.typeArguments?.[0]) {
        const response = Object.entries(operation.responses || {}).find(([code]) => code.startsWith('2'))?.[1];
        checkResponse(checker.getTypeFromTypeNode(node.typeArguments[0]), response?.content?.['application/json']?.schema, `${label} response`);
      }
      const options = node.arguments[['get', 'delete'].includes(method) ? 1 : 2];
      if (options) {
        const type = checker.getTypeAtLocation(options);
        const params = type.getProperty('params');
        if (params) checkFields(checker.getTypeOfSymbolAtLocation(params, options), {
          properties: Object.fromEntries((operation.parameters || []).filter((p) => p.in === 'query').map((p) => [p.name, p.schema])),
        }, `${label} query`, false);
      }
      const bodySchema = operation.requestBody?.content?.['application/json']?.schema;
      if (bodySchema && method === 'delete' && options) {
        const data = checker.getTypeAtLocation(options).getProperty('data');
        if (data) checkFields(checker.getTypeOfSymbolAtLocation(data, options), bodySchema, `${label} body`);
      }
      if (bodySchema && node.arguments[1] && !['get', 'delete'].includes(method)) checkFields(checker.getTypeAtLocation(node.arguments[1]), bodySchema, `${label} body`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const error of errors) console.error(error);
console.log(`${count} API calls checked against ${specPath}; ${errors.length} mismatches`);
if (errors.length) process.exitCode = 1;

const adminOperations = Object.entries(spec.paths).flatMap(([route, methods]) => route.includes('-admin/') || route.endsWith('-admin') ? Object.keys(methods).filter(method => ['get','post','put','patch','delete'].includes(method)).map(method => `${method.toUpperCase()} ${route}`) : []);
const missing = adminOperations.filter(operation => !covered.has(operation));
console.log(`${adminOperations.length - missing.length}/${adminOperations.length} admin operations covered`);
if (missing.length) { console.error('Missing admin operations:', missing.join('\n')); process.exitCode = 1; }
