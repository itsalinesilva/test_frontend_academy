# Paridade com o sistema do Coursera

Auditoria feita contra o código, não de memória. Cada linha foi verificada no
repositório: domínio, serviço, tela e teste. Data: 17/09/2026.

Legenda: **✅ existe** · **◑ parcial** · **❌ não existe**

---

## 1. Catálogo e descoberta

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Catálogo de cursos | ✅ | `AcademyHomeScreen`, `AcademyCatalogScreen` |
| Busca com filtros | ✅ | `academy.service.searchCatalog(query, {level, tag})`, `AcademySearchScreen` |
| Filtro por disciplina dentro do curso | ✅ | Filtro do Academy: disciplina aparece sempre atrelada ao curso |
| Categorias / áreas | ✅ | Três categorias reais: Teoria Musical, História da Música, Instrumento |
| Nota e resenhas de alunos | ❌ | Não há `rating` nem `reviewCount` no domínio. **Decisão consciente**: nota de curso exige base de alunos; inventá-la seria dado falso |
| Pré-visualização sem matrícula | ✅ | Catálogo é público; só o progresso exige sessão |

## 2. Página do curso

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Página de apresentação | ✅ | `CourseDetailScreen` |
| Ementa / grade completa | ✅ | `CourseCurriculumScreen`, `moduleIds` |
| Carga horária, nível, objetivos | ✅ | `AcademyCourse.workloadHours/level/objectives` |
| Competências declaradas | ✅ | `AcademyCourse.competencies` |
| Pré-requisitos | ✅ | `AcademyCourse.prerequisites` |
| Política de avaliação e certificação | ✅ | `assessmentPolicy`, `certificatePolicy`, `certificateInfo` |
| Perfil do docente | ◑ | `authorName/authorTitle/authorBio` existem. Os cursos são assinados pela instituição, não por pessoa física |

## 3. Matrícula e progresso

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Matrícula | ✅ | `enrollCourse(userId, courseId)` |
| "Meus cursos" | ✅ | `MyLearningScreen`, `listUserEnrollments` |
| Retomar de onde parou | ✅ | `UserAcademyProgress.lastAccessedLessonId` |
| Percentual de progresso | ✅ | `progressPercentage`, recalculado por lição concluída |
| Tempo de estudo acumulado | ✅ | `studyTimeMinutes` |
| Histórico acadêmico | ✅ | `AcademicHistoryEntry`, `AcademicHistoryScreen` |
| **Prazos e cronograma pessoal** | ❌ | Existe `dueDate` só no domínio de professor (`teacher.ts`), para tarefas de turma. Não há prazo por aluno nem "meta semanal" |
| **Boletim consolidado** | ❌ | As notas existem espalhadas em `AssessmentSubmission`; falta a tela que as reúne |

## 4. Aula

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Leitor de lição | ✅ | `LessonReaderScreen`, `InteractiveLessonScreen` |
| Blocos de conteúdo ricos | ✅ | 12 tipos em `LessonBlock` |
| **Laboratório interativo** | ✅ **acima do Coursera** | `INTERVAL_LAB`, `CHORD_LAB`, `SCALE_LAB`, `KEYBOARD`, `STAFF`, `DIAGRAM`, `AUDIO_EXAMPLE` — acionam o motor de teoria real |
| Checkpoint dentro da aula | ✅ | `CHECKPOINT`, um por capítulo (58/58) |
| Marca-texto, marca-página, comentário em trecho | ✅ | `src/domain/annotations.ts` — ancoragem por texto em 3 passos |
| Caderno de anotações do curso | ✅ | `montarCaderno` / `EntradaDoCaderno` |
| Duas variantes de apresentação | ✅ **além do Coursera** | `TRADITIONAL` / `KIDS` sobre o mesmo conteúdo canônico |
| **Vídeo** | ❌ | Só `VIDEO_PLACEHOLDER`. Não há player de vídeo, nem upload, nem hospedagem |
| **Transcrição sincronizada** | ◑ | O campo `transcript` existe em `LessonPresentationContent`; não há sincronização porque não há vídeo |
| **Legendas / multilíngue** | ❌ | Não há i18n. A plataforma é monolíngue (pt-BR) |

## 5. Avaliação

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Questionário de prática | ✅ | `AcademyQuiz`, `AcademyQuizScreen` |
| Prova somativa | ✅ | `AcademyAssessment`, `AssessmentScreen`, `AssessmentResultScreen` |
| Tentativas numeradas | ✅ | `ActivityAttempt.attemptNumber`, `AssessmentSubmission.attemptNumber` |
| Correção automática + explicação | ✅ | Toda questão carrega `explicacao` |
| **Livreto de exercícios editável** | ✅ **além do Coursera** | `BookletEditorScreen` — o Conservatório edita, adiciona e remove questões |
| **Simulado por referência** | ✅ | `montarSimulado` referencia as questões, não as copia |
| **Limite de tentativas / cooldown** | ❌ | Não há `maxAttempts` nem janela de espera |
| **Revisão por pares** | ❌ | `PEER` existe em `community.ts` como tipo de conexão social, não como avaliação. Não há fluxo de peer review |
| **Banco de questões por competência** | ✅ | `Questao.competencias`, com teste que impede questão cobrar competência que o curso não ensina |
| Prova final do curso de Teoria | ◑ | Política declarada; as questões ainda não foram redigidas |

## 6. Certificação

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Emissão de certificado | ✅ | `issueCertificate` |
| Código de verificação público | ✅ | `verificationCode`, rota `/credential/:codigo` |
| **Hash criptográfico real** | ✅ **acima do Coursera** | SHA-256 sobre JSON canônico (`src/domain/integrity.ts`) |
| Revogação | ✅ | `status: 'REVOKED'`, `revokedAt`, `revocationReason` |
| **Estúdio de credenciais** | ✅ **além do Coursera** | `CredentialStudioScreen` — badges, credenciais e certificados desenhados na plataforma |
| Ressalva de curso livre | ✅ | `RESSALVA_CURSO_LIVRE` gravada no template e no snapshot congelado |
| Compartilhar em rede profissional | ◑ | O certificado é verificável por URL; não há integração com rede externa |

## 7. Programas (Especializações)

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Agrupar cursos em programa | ✅ | `Program`, `ProgramDetailScreen` |
| Certificado de programa | ◑ | `programTitle` existe no certificado; falta o gatilho de conclusão de programa |
| **Programas povoados** | ✅ | Três programas: História da Música, Instrumentista — Violino, Formação Completa. A carga de cada um é a soma real dos cursos que ele reúne |

## 8. Comunidade e suporte

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Fórum | ✅ | `src/domain/community.ts`, telas em `screens/community` |
| **Fórum ancorado na aula** | ❌ | O fórum não tem `courseId` nem `lessonId`. Discussão é global, não por lição |
| Salas de professor | ✅ | `src/domain/teacher.ts`, `screens/rooms` |
| Notificações | ✅ | `NotificationsPopover`, tela `/notifications` |

## 9. Administração e autoria

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| Painel administrativo | ✅ | `screens/admin` (usuários, engines, conteúdo, moderação, auditoria) |
| Edição de ementa e conteúdo | ✅ | `/admin/content`, `/admin/booklets` |
| Biblioteca oficial | ✅ **além do Coursera** | `/admin/biblioteca` — livros estáticos com seções editáveis |
| Auditoria imutável | ✅ | `/admin/audit`, `src/domain/audit.ts` |
| **Analytics de engajamento** | ◑ | `src/domain/analytics.ts` existe; a leitura por curso ainda não está montada |

## 10. Infraestrutura

| Capacidade | Estado | Onde está / o que falta |
|---|---|---|
| **Banco de dados** | ❌ **por decisão** | localStorage + backup JSON no Drive do usuário. É a arquitetura escolhida, não uma lacuna |
| **App móvel / offline** | ❌ | Não há PWA nem service worker. A interface é responsiva |
| Acessibilidade | ✅ | WCAG AA conferido nos tokens; `SkipLink`, landmarks, `aria-*` |

---

## Resumo

**Paridade alcançada** nos sistemas centrais: catálogo, matrícula, progresso,
aula com blocos ricos, questionário, prova, certificado verificável, programas,
fórum e administração.

**Acima do Coursera** em três pontos, todos ligados a ser uma escola de música:
laboratório sonoro dentro da aula ligado ao motor de teoria real; certificado
com hash criptográfico de verdade sobre JSON canônico; e estúdio próprio de
credenciais.

**As sete lacunas reais**, em ordem de impacto:

1. **Vídeo** — não existe. É a diferença mais visível em relação ao Coursera.
2. **Prazos e cronograma do aluno** — não existe para o aluno individual.
3. **Boletim consolidado** — as notas existem, a tela que as reúne não.
4. **Fórum por lição** — a discussão é global, não ancorada no ponto do curso.
5. **Limite de tentativas em prova** — sem `maxAttempts` nem cooldown.
6. **Revisão por pares** — não existe como fluxo de avaliação.
7. **Multilíngue e offline** — não existem.

## O catálogo publicado

Medido no código em 17/09/2026:

| Curso | Capítulos | Blocos | Checkpoints | Laboratórios | Carga |
|---|---:|---:|---:|---:|---:|
| Teoria da Música | 58 | 340 | 58 | 64 | 35 h |
| História da Música Ocidental | 20 | 115 | 20 | 4 | 18 h |
| História da Música Brasileira | 18 | 87 | 18 | 2 | 15 h |
| Violino | 16 | 83 | 16 | 6 | 12 h |
| **Total** | **112** | **625** | **112** | **76** | **80 h** |

Programas: História da Música (33 h), Instrumentista — Violino (47 h),
Formação Completa (80 h). Nenhum aponta para trilha ou curso inexistente, e a
carga de cada um é a soma real dos cursos que reúne.

## Paridade de tela, medida

`npm run measure:parity` compara cada tela com a forma canônica do
`PageLayout` e com os componentes que ela deveria usar.

| Módulo | Média | Módulo | Média |
|---|---:|---|---:|
| Profile | 92 | Kids | 50 |
| **Academy** | **89** | Settings | 50 |
| Auth | 84 | Rooms | 46 |
| Practice | 79 | Worlds | 43 |
| NotFound | 77 | Violin | 42 |
| Onboarding | 60 | Credentials | 31 |
| Admin | 28 | Studio | 20 |
| Help | 20 | Notifications | 11 |
| Search | 7 | Community | 6 |
| Score | 4 | | |

O Academy está em 89, com todas as 22 telas em FULL. Os módulos abaixo de 50
— Score, Community, Search, Notifications, Studio, Help, Admin, Credentials —
ainda não receberam o tratamento que o Academy recebeu.

**Duas lacunas de conteúdo:**

- As provas finais dos quatro cursos estão declaradas na política e ainda não
  foram redigidas.
- O livreto de exercícios cobre 16 dos 58 capítulos de Teoria, e ainda não
  existe para os outros três cursos.
