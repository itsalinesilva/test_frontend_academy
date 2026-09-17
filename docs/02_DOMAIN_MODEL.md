# MODELO DE DOMÍNIO CANÔNICO DA PLATAFORMA (02_DOMAIN_MODEL)

**Status:** Especificação Arquitetural e Canônica de Domínio  
**Versão:** 1.0.0 Canônica  
**Data:** 16 de Setembro de 2026  
**Autoridade:** Conselho de Arquitetura de Dados & Conselho Acadêmico da Academia Musical Digital  
**Âmbito de Aplicação:** Obrigatório para persistência relacional, contratos de API, schemas de banco de dados e tipagem em TypeScript (`src/domain/*`).

---

## 1. VISÃO GERAL E PRINCÍPIOS DE MODELAGEM

O modelo de domínio da Academia Musical Digital foi projetado para assegurar persistência real, auditabilidade estrita, rastreabilidade de direitos autorais e musicológicos, e a circulação contínua do usuário entre todas as capacidades (`Student`, `Musician`, `Professor`, `Admin`).

### 1.1 Invariantes Fundamentais
1. **Identificadores Únicos (IDs):** Todo objeto de domínio possui um identificador canônico `id: EntityId` (UUID v4 ou identificador semântico estruturado tipado como string).
2. **Chaves Estrangeiras & Cardinalidades:** Relações formalizadas com integridade referencial.
3. **Máquinas de Estado:** Ciclos de vida explícitos definidos por Enums imutáveis.
4. **Temporalidade & Auditoria:** Todo registro possui `createdAt` e `updatedAt` no padrão ISO 8601 UTC. Ações acadêmicas e de segurança geram eventos auditáveis vinculados via `auditEventId`.
5. **Versionamento:** Entidades curriculares e de notação (`Program`, `Course`, `Lesson`, `Score`, `SkillTree`) possuem controle explícito de versão semântica (`version: string` ou `revisionNumber: number`).
6. **Propriedade & Soberania (*Ownership*):** Toda entidade de criação, turma ou evidência possui um proprietário explicitado (`userId`, `authorId`, `ownerTeacherId`).
7. **Visibilidade & Privacidade:** Controle refinado de exposição (`PUBLIC`, `INSTITUTIONAL`, `CONNECTIONS_ONLY`, `PRIVATE`).
8. **Exclusão Lógica (*Soft Deletion*):** Entidades de criação, turmas, evidências e usuários utilizam `isDeleted: boolean` e `deletedAt?: ISOTimestamp` para proteção de histórico e conformidade legal (LGPD/GDPR).

---

## 2. MAPA DAS 12 ÁREAS DE DOMÍNIO

```
+---------------------------------------------------------------------------------------------------+
|                                     MAPA GERAL DE DOMÍNIOS                                        |
+---------------------------------------------------------------------------------------------------+
|  1. IDENTITY      | Usuários, Contas, Papéis, Capacidades, Perfis Unificados e Direitos           |
|  2. ACADEMY       | Programas, Trilhas, Disciplinas, Módulos, Lições, Provas e Diplomas           |
|  3. PRACTICE      | Habilidades, Árvores, Exercícios, Sessões, Telemetria, Streaks e Ligas        |
|  4. MUSIC         | Instrumentos, Afinações, Temperamentos, Acústica, Obras e Notação Musical     |
|  5. CREATION      | Partituras, Projetos DAW, Pistas, Gravador, Mixer, Efeitos, Automação e MIDI  |
|  6. COMMUNITY     | Fórum Musicológico, Tópicos, Artigos, Conexões de Pares, Eventos e Salas      |
|  7. TEACHER       | Cátedra Docente, Salas do Mestre, Turmas, Tarefas, Rubricas e Masterclasses   |
|  8. EVIDENCE      | Evidências Auditadas, Artefatos, Portfólio, Credenciais, Badges e Conquistas  |
|  9. GAMIFICATION  | Mundos Históricos, Eras, Mestres, Passaporte Cultural, Carimbos e Marcos     |
| 10. ADMIN         | Logs de Auditoria, Moderação, Feature Flags, Métricas, Proveniência e Fontes  |
| 11. KIDS          | Tutores Legais, Perfis Protegidos, Termos de Consentimento e Filtros Rígidos  |
| 12. COMMERCIAL    | Planos, Assinaturas, Transações Comerciais e Cotas de Acesso                  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. ESPECIFICAÇÃO DETALHADA DOS DOMÍNIOS

### 3.1 IDENTITY (Identidade, Autenticação e Acesso)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Estados do Ciclo de Vida | Soft Delete |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`User`** | `id: EntityId` | `guardianId -> User.id` (0..1) | 1 User -> 0..* Accounts<br>1 User -> 1 Profile | `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`, `DEACTIVATED` | Sim (`isDeleted`) |
| **`Account`** | `id: EntityId` | `userId -> User.id` (1) | * Accounts -> 1 User | Ativo por provedor (`email`, `google`, `apple`, `institutional`) | Não |
| **`Role`** | `id: EntityId` | — | 1 Role -> 1..* Capabilities | Papéis de Sistema: `ALUNO`, `MUSICO`, `PROFESSOR`, `CRIANCA`, `ADMIN` | Não |
| **`Capability`** | `id: EntityId` | — | N Capabilities -> N Roles | Sensibilidade: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Não |
| **`Entitlement`** | `id: EntityId` | `userId -> User.id`<br>`planId -> Plan.id` | * Entitlements -> 1 User | `ACTIVE`, `EXPIRED`, `REVOKED` | Não |
| **`Profile`** | `id: EntityId` | `userId -> User.id` (1:1) | 1 Profile -> 1 User | Visibilidade: `PUBLIC`, `INSTITUTIONAL`, `CONNECTIONS_ONLY`, `PRIVATE` | Sim |

- **Propriedades Notáveis:**
  - `User.assignedRoles`: Lista cumulativa de papéis (`UserRole[]`).
  - `Profile.academicProgressSummary`: Agregação de cursos matriculados, concluídos e horas registradas.
  - `Profile.practiceSummary`: Sessões executadas, dias de sequência (`streak`) e timestamp da última prática.

---

### 3.2 ACADEMY (Ensino Superior Formal - Arquitetura Coursera)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Estados do Ciclo de Vida | Versionamento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Program`** | `id: EntityId` | — | 1 Program -> 1..* Paths | `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED` | SemVer (`version`) |
| **`Path`** | `id: EntityId` | `programId -> Program.id` | 1 Path -> 1..* Courses | Ativo na Trilha | Ordem sequencial |
| **`Course`** | `id: EntityId` | `pathId -> Path.id`<br>`authorId -> User.id` | 1 Course -> 1..* Modules | `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED` | SemVer (`version`) |
| **`Module`** | `id: EntityId` | `courseId -> Course.id`<br>`assessmentId -> Assessment.id` | 1 Module -> 1..* Lessons | Ativo no Curso | Ordem sequencial |
| **`Lesson`** | `id: EntityId` | `moduleId -> Module.id`<br>`courseId -> Course.id` | 1 Lesson -> 0..* Activities | `DRAFT`, `PUBLISHED` | Separação de Conteúdo por Audiência (`TRADITIONAL`, `KIDS`) |
| **`Assessment`** | `id: EntityId` | `courseId -> Course.id`<br>`moduleId -> Module.id` | 1 Assessment -> 1..* Questions | `DRAFT`, `PUBLISHED` | Versão de Prova |
| **`Question`** | `id: string` | `assessmentId -> Assessment.id` | * Questions -> 1 Assessment | Ativa | Ponderação de pontos |
| **`Attempt`** | `id: EntityId` | `assessmentId -> Assessment.id`<br>`userId -> User.id` | * Attempts -> 1 User | `PASSED`, `FAILED` | Registro imutável de tentativa |
| **`Grade`** | `id: EntityId` | `attemptId -> Attempt.id`<br>`gradedBy -> User.id` | 1 Grade -> 1 Attempt | `OFFICIAL`, `PROVISIONAL` | Nota e Parecer do Docente |
| **`Completion`** | `id: EntityId` | `userId -> User.id`<br>`courseId -> Course.id` | 1 Completion -> 1 User/Course | `IN_PROGRESS`, `COMPLETED`, `ABANDONED` | Carimbo de conclusão |
| **`Certificate`** | `id: EntityId` | `userId -> User.id`<br>`courseId -> Course.id` | 1 Cert -> 1 Conclusão aprovada | `ISSUED`, `REVOKED` | Hash SHA-256 e código de verificação |
| **`LearningHistory`** | `id: EntityId` | `userId -> User.id`<br>`auditEventId -> AuditLog.id` | * Entries -> 1 User | Registro perpétuo e imutável | Histórico de atos acadêmicos |

---

### 3.3 PRACTICE (Loop de Prática & Habilidades - Arquitetura Duolingo/Astra)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Estados / Parâmetros |
| :--- | :--- | :--- | :--- | :--- |
| **`Skill`** | `id: EntityId` | `treeId -> SkillTree.id` | * Skills -> 1 Árvore | Categorias: Percepção, Leitura, Ritmo, Teoria, Técnica, Polifonia |
| **`SkillTree`** | `id: EntityId` | `instrumentId -> Instrument.id` | 1 Árvore -> N Nódulos | Níveis de domínio de 1 a 5 |
| **`Exercise`** | `id: EntityId` | `skillId -> Skill.id` | * Exercícios -> 1 Habilidade | Tolerância em centésimos (`cents`), BPM e pontuação máxima |
| **`ExerciseAttempt`** | `id: EntityId` | `exerciseId -> Exercise.id`<br>`userId -> User.id` | * Tentativas -> 1 Sessão | Resposta fornecida, precisão, desvio de afinação e tempo |
| **`PracticeSession`** | `id: EntityId` | `userId -> User.id` | 1 Sessão -> N Tentativas | Duração em segundos, notas tentadas, precisão geral e XP ganho |
| **`PracticeResult`** | `id: EntityId` | `sessionId -> PracticeSession.id` | 1 Resultado -> 1 Sessão | Análise de estabilidade rítmica e pitch |
| **`Mastery`** | `id: EntityId` | `userId -> User.id`<br>`skillId -> Skill.id` | 1 Registro -> 1 Par Usuário/Habilidade | Nível (1..5), score percentual e timestamp de domínio |
| **`Streak`** | `id: EntityId` | `userId -> User.id` (1:1) | 1 Tracker -> 1 Usuário | Dias consecutivos, recorde histórico e congelamentos disponíveis |
| **`XP`** | `id: EntityId` | `userId -> User.id` (1:1) | 1 XP -> 1 Usuário | Total, semanal, mensal e nível de progressão |
| **`Ranking`** | `id: EntityId` | `userId -> User.id` | * Posições -> 1 Liga | Ligas: Bronze, Prata, Ouro, Platina, Diamante, Conservatório |

---

### 3.4 MUSIC (Acústica, Instrumentos & Telemetria)

| Entidade | Chave Primária | Chaves Estrangeiras | Detalhes Técnicos |
| :--- | :--- | :--- | :--- |
| **`Instrument`** | `id: EntityId` | — | Família (Cordas, Teclas, Sopros, Voz), tessitura MIDI e afinação padrão |
| **`InstrumentConfiguration`**| `id: EntityId` | `instrumentId -> Instrument.id`<br>`userId -> User.id` | Diapasão base (440 Hz, 415 Hz, 432 Hz) e Temperamento (Igual, Mesotônico, Werckmeister, Justo) |
| **`Technique`** | `id: EntityId` | `instrumentFamily -> Instrument.family` | Dificuldade, notação gráfica de articulação e exemplo em áudio |
| **`Repertoire`** | `id: EntityId` | `composerId -> Master.id`<br>`eraId -> Era.id` | Catálogo canônico (BWV, Op., K., Hob.), movimentos e domínio público |
| **`Method`** | `id: EntityId` | `instrumentId -> Instrument.id` | Escola pedagógica, autor e volume |
| **`ExerciseNotation`** | `id: EntityId` | `exerciseId -> Exercise.id` | MusicXML nativo, VexFlow JSON e SVG renderizado |
| **`PitchEvent`** | Objeto de Valor | — | Frequência fundamental ($f_0$), desvio em *cents*, duração e velocidade |
| **`TimingEvent`** | Objeto de Valor | — | Tempo esperado vs medido, desvio em milissegundos ($ms$), antecipação ou atraso |
| **`RhythmEvent`** | Objeto de Valor | — | Fração de compasso, divisão rítmica esperada vs executada |
| **`Fingering`** | Objeto de Valor | `instrumentId -> Instrument.id` | Dedo indicado (1..5), mão (Esquerda/Direita) e posição no espelho |
| **`String`** | Objeto de Valor | `instrumentId -> Instrument.id` | Calibre, material e frequência da corda solta |
| **`VoiceSession`** | `id: EntityId` | `userId -> User.id` | Tessitura, formantes vocais, taxa de vibrato ($Hz$) e amplitude em cents |

---

### 3.5 CREATION (Notação e Produção Musical - Estúdio & DAW)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Estados & Formatos |
| :--- | :--- | :--- | :--- | :--- |
| **`Score`** | `id: EntityId` | `ownerId -> User.id` | 1 Partitura -> 1..* Revisões | `DRAFT`, `PUBLISHED`, `ARCHIVED`. Visibilidade configurável |
| **`ScoreRevision`** | `id: EntityId` | `scoreId -> Score.id`<br>`authorId -> User.id` | * Revisões -> 1 Partitura | MusicXML, MIDI e hash SHA-256 |
| **`Composition`** | `id: EntityId` | `userId -> User.id`<br>`scoreId -> Score.id` | 1 Composição -> 1 Partitura | Instrumentação, gênero e direitos autorais |
| **`AudioProject`** | `id: EntityId` | `userId -> User.id` | 1 Projeto -> 1..* Pistas | BPM, fórmula de compasso, sample rate (44.1..96 kHz), 24-bit |
| **`Track`** | `id: EntityId` | `projectId -> AudioProject.id` | 1 Pista -> N Clips | Tipos: Áudio, MIDI, Instrumento, Auxiliar Bus, Master |
| **`Clip`** | `id: EntityId` | `trackId -> Track.id` | 1 Clip -> N Takes | Posição em ticks, comprimento, offset e eventos MIDI associados |
| **`Take`** | `id: EntityId` | `clipId -> Clip.id` | * Takes -> 1 Clip | Gravações sobrepostas com forma de onda e avaliação de qualidade |
| **`Recording`** | `id: EntityId` | `userId -> User.id`<br>`evidenceId -> Evidence.id` | * Gravações -> 1 Usuário | WAV, FLAC, MP3, sample rate e canais estéreo/mono |
| **`MixerChannel`** | `id: EntityId` | `trackId -> Track.id` | 1 Canal -> 1 Pista | Ganho em dB, pan estéreo, mute, solo e envios de sinal (*sends*) |
| **`Effect`** | `id: EntityId` | `trackId -> Track.id` | * Efeitos -> 1 Pista | EQ paramétrico, Compressor, Convolução, Delay, Chorus, Limiter |
| **`Automation`** | `id: EntityId` | `trackId -> Track.id` | * Automações -> 1 Pista | Pistas de curvas vetoriais contínuas (volume, pan, filtros) |
| **`MidiEvent`** | Objeto de Valor | — | Ticks de linha de tempo | Note-On, Note-Off, Control Change, Pitch Bend com velocidade |
| **`Render`** | `id: EntityId` | `projectId -> AudioProject.id` | * Renders -> 1 Projeto | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |

---

### 3.6 COMMUNITY (Fórum Musicológico & Redes de Pares - Arquitetura Skool/LinkedIn)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Estados & Regras |
| :--- | :--- | :--- | :--- | :--- |
| **`Forum`** | `id: EntityId` | — | 1 Fórum -> N Tópicos | Categorias: Análise, Harmonia, Repertório, Órgão, Canto |
| **`Topic`** | `id: EntityId` | `forumId -> Forum.id`<br>`authorId -> User.id` | 1 Tópico -> N Postagens | `OPEN`, `RESOLVED`, `LOCKED`, `ARCHIVED`. Suporte a tags |
| **`Post`** | `id: EntityId` | `topicId -> Topic.id`<br>`authorId -> User.id` | * Posts -> 1 Tópico | Anexos de partituras e áudios, upvotes e aceitação de solução |
| **`Comment`** | `id: EntityId` | `postId -> Post.id`<br>`authorId -> User.id` | * Comentários -> 1 Post | Encadeamento hierárquico com réplicas diretas |
| **`Connection`** | `id: EntityId` | `requesterId -> User.id`<br>`addresseeId -> User.id` | Par único de usuários | `PENDING`, `ACCEPTED`, `DECLINED`, `BLOCKED`. Tipos de coleguismo |
| **`Event`** | `id: EntityId` | `hostId -> User.id` | 1 Evento -> N Participantes | Masterclasses, recitais, bancas examinadoras e palestras ao vivo |
| **`Room`** | `id: EntityId` | `ownerTeacherId -> User.id` | 1 Sala -> N Membros | `ACTIVE`, `ARCHIVED`. Código de matrícula e capacidade |
| **`Membership`** | `id: EntityId` | `roomId -> Room.id`<br>`userId -> User.id` | N Usuários -> N Salas | Papéis na sala: Professor, Monitor, Aluno, Ouvinte Convidado |

---

### 3.7 TEACHER (Cátedra & Salas do Mestre - Arquitetura Skool)

| Entidade | Chave Primária | Chaves Estrangeiras | Cardinalidade | Responsabilidade & Papel |
| :--- | :--- | :--- | :--- | :--- |
| **`TeacherProfile`** | `id: EntityId` | `userId -> User.id` (1:1) | 1 Perfil Docente -> 1 Usuário | Título acadêmico, afiliação, linhagem de mestres e verificação |
| **`TeacherRoom`** | `id: EntityId` | `teacherId -> User.id`<br>`roomId -> Room.id` | 1 Cátedra -> 1 Sala Soberana | Mensagem inaugural, ementa oficial, avisos fixados e cronograma |
| **`Class`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id` | 1 Turma -> N Alunos | Período letivo, plano de aulas semestrais e frequência |
| **`StudentMembership`**| `id: EntityId` | `teacherRoomId -> TeacherRoom.id`<br>`studentId -> User.id` | 1 Registro -> 1 Aluno na Cátedra | Frequência registrada, média de notas e anotações confidenciais |
| **`Assignment`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id` | 1 Tarefa -> N Entregas | Prazo, formato obrigatório (Áudio, Vídeo, Partitura) e rubrica formal |
| **`Material`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id` | * Materiais -> 1 Sala | Partituras anotadas pelo professor, guias em áudio e análises |
| **`LiveClass`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id` | * Aulas ao Vivo -> 1 Sala | Transmissão síncrona com registro de frequência e gravação |
| **`RoomCourse`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id`<br>`courseId -> Course.id` | Vínculo de disciplina | Adendo de ementa personalizada do professor titular |
| **`RoomLesson`** | `id: EntityId` | `roomCourseId -> RoomCourse.id`<br>`lessonId -> Lesson.id` | Vínculo de aula | Notas pedagógicas específicas e exercícios complementares |
| **`RoomExercise`** | `id: EntityId` | `teacherRoomId -> TeacherRoom.id`<br>`exerciseId -> Exercise.id` | Exercício prescrito | Meta de precisão e prazo de envio obrigatório |

---

### 3.8 EVIDENCE & PORTFOLIO (Evidências Auditadas & Credenciais - Arquitetura LinkedIn)

| Entidade | Chave Primária | Chaves Estrangeiras | Propriedades Críticas & Cruzamento |
| :--- | :--- | :--- | :--- |
| **`Evidence`** | `id: EntityId` | `userId -> User.id`<br>`sourceEntityId -> Entidade.id` | Origem da evidência (Academia, Prática, Estúdio, Cátedra, Atlas), checksum SHA-256 e parecer de aprovação |
| **`Artifact`** | `id: EntityId` | `evidenceId -> Evidence.id` | Arquivo físico (WAV, MusicXML, PDF de diploma) armazenado com integridade garantida |
| **`PortfolioItem`** | `id: EntityId` | `userId -> User.id`<br>`evidenceId -> Evidence.id` | Destaque do músico exposto no perfil público com aprovação institucional |
| **`Credential`** | `id: EntityId` | `userId -> User.id` | Certificados, diplomas e licenças docentes com URL de verificação pública |
| **`Microcredential`**| `id: EntityId` | `userId -> User.id`<br>`skillId -> Skill.id` | Certificação atômica de competência validada por parecer de professor |
| **`Badge`** | `id: EntityId` | — | Distintivo visual emitido por critérios objetivos de esforço e maestria |
| **`Achievement`** | `id: EntityId` | `userId -> User.id`<br>`badgeId -> Badge.id` | Marco de conquista desbloqueado pelo aluno e exibível no perfil |

---

### 3.9 GAMIFICATION & CULTURAL WORLDS (Atlas Histórico & Passaporte)

| Entidade | Chave Primária | Chaves Estrangeiras | Detalhes & Relações |
| :--- | :--- | :--- | :--- |
| **`World`** | `id: EntityId` | `eraId -> Era.id` | Território cultural navegável no mapa 2D com coordenadas cartesianas |
| **`Era`** | `id: EntityId` | — | Período histórico (Barroco, Classicismo, Romantismo, Contemporâneo, Tradição Brasileira) |
| **`Master`** | `id: EntityId` | `eraId -> Era.id` | Biografia canônica do compositor, linhagem genealógica e grafo de influências |
| **`Tour`** | `id: EntityId` | `worldId -> World.id` | Roteiro guiado de estudo cronológico através de obras capitais |
| **`Passport`** | `id: EntityId` | `userId -> User.id` (1:1) | Documento de bordo individual com total de carimbos e título honorífico |
| **`PassportEntry`** | `id: EntityId` | `passportId -> Passport.id`<br>`evidenceId -> Evidence.id` | Carimbo oficial vinculado à evidência comprovada de execução ou análise |
| **`Milestone`** | `id: EntityId` | `userId -> User.id` | Marcos quantitativos alcançados pelo estudante ao longo da jornada |

---

### 3.10 ADMIN & GOVERNANCE (Governança, Proveniência e Auditoria)

| Entidade | Chave Primária | Chaves Estrangeiras | Propriedades e Garantias |
| :--- | :--- | :--- | :--- |
| **`AuditLog`** | `id: EntityId` | `actorId -> User.id` | Registro imutável: IP, agente, ação executada, entidade alvo e nível de severidade |
| **`ModerationAction`**| `id: EntityId` | `moderatorId -> User.id`<br>`targetContentId -> Entity.id` | Ação punitiva ou corretiva fundamentada (Ocultação, Remoção, Suspensão) |
| **`FeatureFlag`** | `id: EntityId` | — | Chave de ativação gradual com segmentação por papéis (`UserRole`) e percentual |
| **`SystemMetric`** | `id: EntityId` | — | Telemetria técnica (contadores de requests, histogramas de latência de engines) |
| **`ContentRevision`**| `id: EntityId` | `authorId -> User.id`<br>`approvedByAdminId -> User.id` | Controle editorial de alterações em cursos e repertório oficial |
| **`Source`** | `id: EntityId` | — | Tratado histórico, edição crítica (Urtext, Bach-Gesellschaft, Henle) e ISBN/URN |
| **`License`** | `id: EntityId` | — | Licenciamento formal (Domínio Público PDM, CC-BY-SA, Direitos Institucionais) |
| **`ProvenanceRecord`**| `id: EntityId` | `sourceId -> Source.id`<br>`licenseId -> License.id` | Certidão de proveniência atestando a exatidão histórica e jurídica do conteúdo |

---

### 3.11 KIDS (Proteção Integral à Criança e Menores)

| Entidade | Chave Primária | Chaves Estrangeiras | Proteções & Salvaguardas |
| :--- | :--- | :--- | :--- |
| **`Guardian`** | `id: EntityId` | `userId -> User.id` | Tutor legal com validação formal de identidade e contato direto |
| **`ChildProfile`** | `id: EntityId` | `userId -> User.id`<br>`guardianId -> Guardian.id` | Limites diários de tela, bloqueio de chat com estranhos e repertório curado |
| **`GuardianConsent`** | `id: EntityId` | `guardianId -> Guardian.id`<br>`childUserId -> User.id` | Termo de consentimento assinado digitalmente com IP, data e hash do documento |
| **`ChildSafetyPolicy`**| `id: EntityId`| — | Diretrizes em vigor de conformidade com LGPD e COPPA |
| **`ChildVisibilitySetting`**| `id: EntityId` | `childProfileId -> ChildProfile.id` | Ocultação de buscas públicas e anonimização compulsória em rankings |

---

### 3.12 COMMERCIAL (Planos, Assinaturas e Cotas de Acesso)

| Entidade | Chave Primária | Chaves Estrangeiras | Parâmetros Comerciais |
| :--- | :--- | :--- | :--- |
| **`Plan`** | `id: EntityId` | — | Tiers (`GRATUITO`, `PRO_MUSICO`, `PROFESSOR_CATEDRA`, `CONSERVATORIO`), cotas e valor |
| **`Entitlement`** | `id: EntityId` | `userId -> User.id`<br>`planId -> Plan.id` | Cota alocada e consumida por capacidade técnica |
| **`Subscription`** | `id: EntityId` | `userId -> User.id`<br>`planId -> Plan.id` | Ciclo recorrente de faturamento (`ACTIVE`, `PAST_DUE`, `CANCELLED`) |
| **`Purchase`** | `id: EntityId` | `userId -> User.id` | Liquidação financeira com recibo de transação e status |
| **`FeatureAccess`** | `id: EntityId` | `userId -> User.id` | Liberação explícita de ferramenta (DAW avançado, exportação MusicXML ilimitada) |

---

## 4. MATRIZ DE CRUZAMENTOS ENTRE SISTEMAS

Abaixo está o mapa de integração contínua demonstrando como os dados fluem sem barreiras:

```
[Curso de Contraponto]
   │
   ├─► Gera Exercício Prático no Árbitro Teórico (PRACTICE)
   │     │
   │     └─► Abre Notação Canônica no Editor de Partituras (CREATION)
   │           │
   │           └─► Importa Pistas MIDI no DAW Multicanal (CREATION)
   │                 │
   │                 └─► Grava Vozes e Emite Evidência Auditada (EVIDENCE)
   │                       │
   │                       ├─► Carimba Passaporte Cultural da Era (GAMIFICATION)
   │                       │
   │                       ├─► Publica Obra no Portfólio do Músico (IDENTITY & EVIDENCE)
   │                       │
   │                       ├─► Entrega como Tarefa da Turma do Professor (TEACHER)
   │                       │
   │                       └─► Compartilha Análise no Fórum de Pares (COMMUNITY)
```

1. **Evidência Universal:** A entidade `Evidence` é o ponto de convergência de todos os atos relevantes. Uma prova corrigida na Academia, uma sessão perfeita de afinação na Prática, uma gravação renderizada no DAW ou um recital avaliado na Sala de Aula geram uma `Evidence`.
2. **Portfólio Transparente:** O portfólio no perfil profissional (`Profile`) apenas projeta referências a `Evidence` já auditadas, garantindo que todo item exibido é autêntico e verificável.
3. **Passaporte Automático:** O sistema de gamificação escuta eventos de conclusão de disciplinas e gravações aprovadas para carimbar o `Passport` sem intervenção manual.
4. **Sem Silos:** Um professor matricula alunos da sua cátedra em cursos da Academia e prescreve exercícios da árvore de prática diretamente nas tarefas da turma.

---

## 5. REQUISITOS DE PERSISTÊNCIA REAL

1. **Repositórios Tipados:** Toda entidade possui um repositório canônico em `src/repositories/` que implementa operações CRUD completas (`findById`, `listAll`, `save`, `delete` / `softDelete`).
2. **Serialização Semântica:** Dados numéricos de áudio, afinações e matrizes de notas são salvos em estruturas tipadas em JSON ou schemas relacionais de alta fidelidade.
3. **Contratos de Dados:** Nenhuma tela pode instanciar estruturas fictícias em variáveis locais; toda informação deve ser requisitada através dos serviços de aplicação (`src/services/application/*`).
