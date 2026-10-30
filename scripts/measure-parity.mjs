/**
 * Medidor de paridade estrutural.
 *
 * Pontua cada tela contra o wireframe do seu domínio em
 * docs/claude/wireframes/. É o instrumento que produziu
 * docs/claude/02_REFERENCE_PARITY_AUDIT.md e que verifica a evolução.
 *
 * Uso:  node scripts/measure-parity.mjs [--json] [NomeDaTela]
 *
 * NOTA: telas compostas sobre PageLayout herdam da primitiva as regiões
 * fixas, a grade de 12 colunas e a orquestração de estados. Medir apenas o
 * texto do arquivo da tela subestimaria exatamente o que foi corrigido.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const walk = (d) =>
  readdirSync(d).flatMap((e) => {
    const f = join(d, e);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });
const norm = (p) => relative('.', p).split('\\').join('/');

// Forma esperada por rota, conforme docs/claude/wireframes/
const EXPECTED = {
  // ACADEMY
  AcademyHomeScreen: ['C', 'CATALOG'], AcademyCatalogScreen: ['B', 'CATALOG'],
  AcademySearchScreen: ['B', 'CATALOG'],
  CategoryDetailScreen: ['B', 'CATALOG'], ProgramDetailScreen: ['C', 'CATALOG'],
  PathDetailScreen: ['C', 'CATALOG'], CourseDetailScreen: ['C', 'CATALOG'],
  CourseCurriculumScreen: ['C', 'CATALOG'], CourseProgressScreen: ['C', 'CATALOG'],
  ModuleDetailScreen: ['C', 'CATALOG'], LessonReaderScreen: ['C', 'EDITORIAL'],
  InteractiveLessonScreen: ['C', 'EDITORIAL'], ActivityScreen: ['A', 'EDITORIAL'],
  AcademyQuizScreen: ['A', 'EDITORIAL'], AssessmentScreen: ['A', 'EDITORIAL'],
  AssessmentResultScreen: ['A', 'EDITORIAL'], CourseCompletionScreen: ['A', 'EDITORIAL'],
  CertificateScreen: ['A', 'EDITORIAL'],
  // Area de curso: forma E, com sumario lateral fixo. A apresentacao do curso
  // sangra ate a borda no hero e traz a propria barra de secoes, por isso fica
  // fora das formas — e a unica tela do Academy nessa condicao.
  CourseLearnScreen: ['E', 'EDITORIAL'], LessonTheaterScreen: ['E', 'EDITORIAL'],
  CoursePresentationScreen: ['F', 'EDITORIAL'],
  MeuAprendizadoScreen: ['B', 'CATALOG'],
  AcademicHistoryScreen: ['B', 'OPERATIONAL'], AcademicProfileScreen: ['B', 'OPERATIONAL'],
  // PRACTICE
  PracticeHomeScreen: ['C', 'CATALOG'],
  SkillDetailScreen: ['C', 'CATALOG'], MicroSkillScreen: ['C', 'CATALOG'],
  ExerciseDetailScreen: ['A', 'CATALOG'], ExerciseSessionScreen: ['D', 'INSTRUMENT'],
  ImmediateFeedbackScreen: ['D', 'INSTRUMENT'], AttemptDetailScreen: ['A', 'CATALOG'],
  PracticeResultScreen: ['A', 'CATALOG'], MasteryScreen: ['B', 'OPERATIONAL'],
  PracticeHistoryScreen: ['B', 'OPERATIONAL'], RankingScreen: ['B', 'OPERATIONAL'],
  StreakScreen: ['A', 'CATALOG'], DailyGoalScreen: ['A', 'CATALOG'],
  PracticeProfileScreen: ['C', 'CATALOG'], PracticeScreen: ['D', 'INSTRUMENT'],
  // PROFILE
  ProfileOverviewScreen: ['C', 'CATALOG'], PortfolioScreen: ['B', 'CATALOG'],
  NetworkDirectoryScreen: ['B', 'CATALOG'],
  EditProfileScreen: ['A', 'CATALOG'],
  // ROOMS / COMMUNITY
  RoomsDirectoryScreen: ['B', 'CATALOG'], RoomDetailScreen: ['C', 'CATALOG'],
  CreateRoomScreen: ['A', 'CATALOG'], CommunityFeedScreen: ['B', 'CATALOG'],
  TopicDetailScreen: ['C', 'CATALOG'], EventsDirectoryScreen: ['B', 'CATALOG'],
  // STUDIO / SCORE
  StudioHubScreen: ['B', 'CATALOG'], DawProjectScreen: ['D', 'INSTRUMENT'],
  VoiceEarLabScreen: ['D', 'INSTRUMENT'], ScoreEditorScreen: ['D', 'INSTRUMENT'],
  ScoreScreen: ['B', 'CATALOG'],
  // WORLDS
  WorldsAtlasScreen: ['B', 'CATALOG'],
  // ADMIN
  AdminDashboardScreen: ['B', 'OPERATIONAL'], AdminUsersScreen: ['B', 'OPERATIONAL'],
  AdminEnginesScreen: ['B', 'OPERATIONAL'], AdminContentScreen: ['B', 'OPERATIONAL'],
  AdminModerationScreen: ['B', 'OPERATIONAL'], AdminAuditScreen: ['B', 'OPERATIONAL'],
  // CORE
  OverviewScreen: ['C', 'CATALOG'], SearchScreen: ['B', 'CATALOG'],
  NotificationsScreen: ['B', 'CATALOG'], SettingsScreen: ['C', 'CATALOG'],
  HelpScreen: ['B', 'CATALOG'], OnboardingScreen: ['A', 'CATALOG'],
  LoginScreen: ['A', 'CATALOG'], RegisterScreen: ['A', 'CATALOG'],
  RecoveryScreen: ['A', 'CATALOG'], OAuthCallbackScreen: ['A', 'CATALOG'],
  NotFoundScreen: ['A', 'CATALOG'],
};

// Componentes que o wireframe manda usar, por tela
const REQUIRED = {
  AcademyHomeScreen: ['CourseCard', 'LessonCard', 'Tabs'],
  AcademyCatalogScreen: ['CourseCard'], MyLearningScreen: ['Tabs', 'CourseCard'],
  CourseDetailScreen: ['Tabs', 'LockedState'], CourseCurriculumScreen: ['LockedState'],
  LessonReaderScreen: ['Staff', 'LockedState'], AcademicHistoryScreen: ['DataGrid'],
  PracticeHomeScreen: ['ProgressRing', 'XPIndicator', 'PracticeCard', 'Tabs'],
  SkillDetailScreen: ['SkillNode', 'ProgressRing'],
  MicroSkillScreen: ['ProgressRing'], ExerciseSessionScreen: ['Waveform', 'Tuner'],
  VoiceEarLabScreen: ['Tuner', 'Waveform'], PracticeHistoryScreen: ['DataGrid'],
  MasteryScreen: ['DataGrid'], StreakScreen: ['ProgressRing'], DailyGoalScreen: ['ProgressRing'],
  ProfileOverviewScreen: ['ProfileHeader', 'Tabs', 'SegmentedControl', 'Credential'],
  PortfolioScreen: ['Tabs', 'Modal'],
  NetworkDirectoryScreen: ['EmptyState'],
  RoomDetailScreen: ['Tabs', 'ForumCard'], CommunityFeedScreen: ['ForumCard'],
  TopicDetailScreen: ['ForumCard'], EventsDirectoryScreen: ['EventCard'],
  DawProjectScreen: ['MixerChannel', 'PianoRoll', 'Track', 'Timeline', 'Recorder'],
  ScoreEditorScreen: ['NotationToolbar', 'Staff'], ScoreScreen: ['Staff'],
  AdminUsersScreen: ['DataGrid'], AdminAuditScreen: ['DataGrid'],
  AdminContentScreen: ['DataGrid'], AdminModerationScreen: ['DataGrid'],
  SearchScreen: ['Tabs'], NotificationsScreen: ['Tabs'], SettingsScreen: ['Tabs'],
};

const screens = walk('src/ui/screens').filter((f) => f.endsWith('.tsx') && f.includes('Screen'));
const out = [];

for (const f of screens) {
  const src = readFileSync(f, 'utf8');
  const name = basename(f, '.tsx');
  const [expForm, expDensity] = EXPECTED[name] || ['?', '?'];

  // Telas compostas sobre PageLayout herdam da primitiva as regioes fixas,
  // a grade de 12 colunas e a orquestracao de estados. Medir apenas o texto
  // do arquivo da tela subestimaria exatamente o que foi corrigido.
  const usesPageLayout = src.includes('<PageLayout');
  // Uma tela pode declarar mais de uma forma: retornos antecipados de
  // "nao encontrado" usam `focus`. A forma da tela e a mais estrutural.
  const RANK = { focus: 0, catalog: 1, workspace: 2, detail: 3, course: 4, presentation: 5 };
  const declared = [...src.matchAll(/form="(focus|catalog|detail|workspace|course|presentation)"/g)].map((m) => m[1]);
  const declaredForm = declared.sort((x, y) => RANK[y] - RANK[x])[0];
  const hasSticky = usesPageLayout ? declaredForm !== "focus" : src.includes("sticky");
  const cols = usesPageLayout && src.includes('<PageLayout.Aside')
    ? 2
    : (src.match(/(?:lg|md):col-span-\d+/g) || []).length;
  const hasGrid12 = /grid-cols-12/.test(src);
  const usesTabs = src.includes('<Tabs') || src.includes('<PageLayout.Tabs');
  const usesSeg = /<SegmentedControl\b/.test(src);
  const hasDrawer = /<Drawer\b/.test(src);

  // Forma detectada
  const FORM_LETTER = { focus: 'A', catalog: 'B', detail: 'C', workspace: 'D', course: 'E', presentation: 'F' };
  let actualForm = declaredForm ? FORM_LETTER[declaredForm] : 'A';
  if (!declaredForm) {
    if (/100dvh|h-screen|min-h-screen/.test(src) && /toolbar|transport|inspector|Panel/i.test(src)) actualForm = 'D';
    else if (cols >= 1 || hasGrid12) actualForm = 'C';
    else if (/filtro|Filter|facet/i.test(src) && /grid/.test(src)) actualForm = 'B';
  }

  const required = REQUIRED[name] || [];
  // `Tabs` exigido pelo wireframe e satisfeito por `PageLayout.Tabs`.
  const TAG = (c) => new RegExp('<' + c + '(?![A-Za-z0-9_])');
  // Componentes entregues por COMPOSICAO. Uma tela que renderiza
  // LessonBlockRenderer entrega pauta e teclado sem instancia-los
  // diretamente; exigir a tag literal puniria a composicao correta.
  // Cada entrada aqui deve corresponder a um componente que o provedor
  // REALMENTE renderiza. Creditar algo que o provedor nao renderiza faria o
  // instrumento mentir a favor de quem o escreve.
  const PROVIDERS = {
    LessonBlockRenderer: ['Staff', 'InstrumentKeyboard'],
    // CredentialsTab renderiza <Credential/> de verdade (certificados
    // academicos). So entra aqui o que o provedor de fato desenha.
    CredentialsTab: ['Credential'],
    // PainelDeCaptura desenha o Tuner ao vivo durante a execucao.
    CapturePanel: ['Tuner'],
  };
  const provided = Object.entries(PROVIDERS)
    .filter(([prov]) => src.includes('<' + prov))
    .flatMap(([, list]) => list);
  const satisfies = (c) =>
    TAG(c).test(src) ||
    (c === 'Tabs' && src.includes('<PageLayout.Tabs')) ||
    (c === 'LockedState' && src.includes('lockedProps')) ||
    // O PageLayout renderiza EmptyState/ErrorState a partir destas props —
    // a tela entrega o componente por composicao, nao por ausencia.
    (c === 'EmptyState' && src.includes('emptyProps')) ||
    (c === 'ErrorState' && src.includes('errorProps')) ||
    provided.includes(c);
  const missingComponents = required.filter((c) => !satisfies(c));

  const states = {
    loading: /LoadingState|Skeleton|isLoading|state=\{?['"]?loading/.test(src),
    empty: /EmptyState|emptyProps/.test(src),
    error: /ErrorState|errorProps/.test(src),
    success: /SuccessState|CompletedState/.test(src),
    locked: /LockedState|lockedProps/.test(src),
  };
  const stateCount = Object.values(states).filter(Boolean).length;

  const services = [...new Set(src.match(/\b(?:academy|practice|profile|auth|admin|tool|user|course|audit)(?:Service|Repository|Sdk)\b/g) || [])];
  const hardcoded =
    (src.match(/^\s*const\s+\w+\s*(?::[^=]+)?=\s*\[\s*$/gm) || []).length +
    (src.match(/^\s*const\s+\w+\s*(?::[^=]+)?=\s*\[\s*\{/gm) || []).length;

  // Pontuação de paridade (0–100)
  let score = 0;
  if (actualForm === expForm) score += 25;
  if (expForm === 'A' || hasSticky) score += 15;
  if (expForm === 'A' || expForm === 'D' || cols >= 1) score += 10;
  if (missingComponents.length === 0) score += 20;
  else score += Math.round((20 * (required.length - missingComponents.length)) / Math.max(required.length, 1));
  score += stateCount * 4;
  if (services.length > 0) score += 8;
  if (hardcoded === 0) score += 4;
  if ((src.match(/\balert\(/g) || []).length === 0) score += 3;

  out.push({
    name, file: norm(f), domain: norm(f).split('/')[3],
    expForm, actualForm, formOk: actualForm === expForm,
    hasSticky, cols, usesTabs, usesSeg, hasDrawer,
    required, missingComponents, states, stateCount,
    services: services.length, hardcoded,
    alerts: (src.match(/\balert\(/g) || []).length,
    lines: src.split('\n').length,
    score: Math.min(score, 100),
    status: score >= 75 ? 'FULL' : score >= 40 ? 'PARTIAL' : 'ABSENT',
  });
}


const args = process.argv.slice(2);
if (args.includes('--json')) {
  console.log(JSON.stringify(out));
} else {
  const filter = args.find((a) => !a.startsWith('--'));
  const rows = filter ? out.filter((x) => x.name.includes(filter)) : out;
  const byDomain = {};
  rows.forEach((x) => (byDomain[x.domain] = byDomain[x.domain] || []).push(x));

  const avg = (g) => Math.round(g.reduce((s, x) => s + x.score, 0) / g.length);
  console.log('PARIDADE ESTRUTURAL — ' + rows.length + ' telas · média ' + avg(rows) + '/100');
  console.log('  FULL ' + rows.filter((x) => x.status === 'FULL').length +
              ' · PARTIAL ' + rows.filter((x) => x.status === 'PARTIAL').length +
              ' · ABSENT ' + rows.filter((x) => x.status === 'ABSENT').length);
  console.log('  sticky ' + rows.filter((x) => x.hasSticky).length + '/' + rows.length +
              ' · Tabs ' + rows.filter((x) => x.usesTabs).length + '/' + rows.length +
              ' · estados ' + (rows.reduce((s, x) => s + x.stateCount, 0) / rows.length).toFixed(1) + '/5');

  for (const d of Object.keys(byDomain).sort()) {
    const g = byDomain[d].sort((a, b) => a.score - b.score);
    console.log('');
    console.log('== ' + d.toUpperCase() + '  media ' + avg(g));
    for (const x of g) {
      console.log('   ' + String(x.score).padStart(3) + ' ' + x.status.padEnd(8) +
        x.name.padEnd(28) + 'forma ' + x.actualForm + '/' + x.expForm +
        (x.formOk ? ' ok ' : ' != ') + 'st' + x.stateCount + '/5  falta: ' +
        (x.missingComponents.join(',') || '-'));
    }
  }
}
