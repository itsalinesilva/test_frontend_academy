/**
 * Guarda de release (CLAUDE_TODO item 0.6).
 *
 * Falha o build se qualquer identidade da allowlist administrativa — ou
 * qualquer segredo de servidor — aparecer no artefato do cliente.
 *
 * Existe porque a auditoria encontrou os e-mails da fundadora 6 vezes dentro
 * de `dist/assets/index-*.js` (CLAUDE_AUDIT.md S-02). Um teste unitário não
 * pegaria isso: só a inspeção do artefato compilado pega.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

if (!existsSync(DIST)) {
  console.error('✗ dist/ não encontrado. Rode `npm run build` antes da verificação.');
  process.exit(1);
}

const SERVER_ONLY_VARS = [
  'ADMIN_ALLOWLIST',
  'SESSION_SIGNING_SECRET',
  'AUDIT_SIGNING_SECRET',
];

// Identidades administrativas configuradas no ambiente de build, se houver.
const allowlistEntries = (process.env.ADMIN_ALLOWLIST || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const forbidden = [
  ...allowlistEntries.map((email) => ({ needle: email, label: `e-mail da allowlist (${email})` })),
  ...SERVER_ONLY_VARS.flatMap((name) => {
    const value = process.env[name];
    return value && value.length >= 8
      ? [{ needle: value, label: `valor de ${name}` }]
      : [];
  }),
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const textFiles = walk(DIST).filter((f) => /\.(js|css|html|json|map)$/i.test(f));
const violations = [];

for (const file of textFiles) {
  const content = readFileSync(file, 'utf8').toLowerCase();
  for (const { needle, label } of forbidden) {
    if (content.includes(needle.toLowerCase())) {
      violations.push(`${file} contém ${label}`);
    }
  }
  // Referência direta ao módulo de autoridade de servidor jamais deve
  // aparecer no bundle do cliente.
  for (const marker of ['admin_allowlist', 'session_signing_secret', 'audit_signing_secret']) {
    if (content.includes(marker)) {
      violations.push(`${file} referencia a variável de servidor "${marker}"`);
    }
  }
}

if (violations.length > 0) {
  console.error('\n✗ VAZAMENTO DE SEGREDO NO BUNDLE DO CLIENTE:\n');
  violations.forEach((v) => console.error(`  • ${v}`));
  console.error('\nSegredos de servidor não podem ser importados por código em src/.');
  console.error('Ver CLAUDE_AUDIT.md S-02 e server/core/admin-authority.ts.\n');
  process.exit(1);
}

if (forbidden.length === 0) {
  console.log('✓ Nenhum segredo configurado no ambiente; verificação estrutural aprovada.');
} else {
  console.log(`✓ Bundle limpo: nenhum dos ${forbidden.length} segredos vazou para dist/.`);
}
