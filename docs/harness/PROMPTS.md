O requisito fica registrado desta forma: **a referência de estrutura visual/UX é para ser clonada; a adaptação é de identidade visual, conteúdo, integrações, dados, cruzamentos e funcionalidades próprias do ecossistema musical.** Não vou mais tratar “referência” como mera inspiração.

Abaixo estão os **19 novos prompts**, já reorganizados para AI Studio, com instrução explícita de **clone estrutural** e implementação progressiva. Eles assumem o princípio já definido de que o produto precisa ser real em todas as camadas, e não apenas visualmente funcional. 

# P00 — SOURCE OF TRUTH / REPOSITORY AUDIT

```text
Você está trabalhando no projeto da plataforma musical.

ANTES DE ALTERAR QUALQUER COISA, faça uma auditoria completa do repositório atual.

OBJETIVO

Estabelecer o repositório atual como fonte de verdade técnica e preparar a implementação dos próximos módulos sem destruir, reescrever ou simplificar arbitrariamente o que já existe.

REGRA FUNDAMENTAL

O produto possui referências visuais e estruturais explícitas.

Quando for especificado que uma experiência deve seguir Coursera, Duolingo, Astra Trainer, LinkedIn, Skool, DAW profissional ou software profissional de notação, isso significa:

CLONAR A ESTRUTURA DE EXPERIÊNCIA, IA, HIERARQUIA, ORGANIZAÇÃO, padrões de navegação, composição de telas, densidade funcional, estados e lógica de interação da referência.

NÃO significa copiar:
- marca;
- logotipo;
- textos proprietários;
- assets protegidos;
- código proprietário;
- identidade cromática específica;
- conteúdo proprietário.

A adaptação será feita pela identidade da nossa plataforma, conteúdo musical, integrações, entidades próprias, cruzamentos entre sistemas e funcionalidades adicionais.

NÃO reduza a referência a "inspiração".

Faça:

1. inventário de arquivos;
2. inventário de rotas;
3. inventário de componentes;
4. inventário de serviços;
5. inventário de APIs;
6. inventário de banco/persistência;
7. inventário de autenticação;
8. inventário de telas existentes;
9. inventário de mocks;
10. inventário de dados fictícios;
11. inventário de funcionalidades parcialmente implementadas;
12. inventário de funcionalidades inexistentes;
13. identificação de duplicações;
14. identificação de dívida arquitetural;
15. identificação de gaps entre frontend e backend.

Crie/atualize:

docs/00_REPOSITORY_AUDIT.md

docs/00_SOURCE_OF_TRUTH.md

Não implemente novas funcionalidades neste prompt.

Não faça redesign.

Não apague trabalho existente.

Ao final, produza um mapa:

EXISTE E ESTÁ REAL
EXISTE MAS É MOCK
EXISTE PARCIALMENTE
NÃO EXISTE
PRECISA INTEGRAÇÃO
PRECISA REFACTOR
PRECISA ENGINE

O resultado será utilizado pelos próximos prompts.
```

# P01 — PRODUCT CONSTITUTION + CLONE RULES

```text
Crie a constituição definitiva do produto.

Arquivo:

docs/01_PRODUCT_CONSTITUTION.md

O documento deve estabelecer a hierarquia de autoridade:

MASTER PRODUCT SPEC
↓
PRODUCT CONSTITUTION
↓
DOMAIN MODEL
↓
SCREEN ARCHITECTURE
↓
UX CONTRACTS
↓
API CONTRACTS
↓
IMPLEMENTATION

REGRA VISUAL/UX:

Quando uma referência é indicada, a estrutura deve ser CLONADA.

Coursera:
- arquitetura de Academy;
- catálogo;
- busca;
- páginas de curso;
- módulos;
- aulas;
- progresso;
- avaliações;
- histórico;
- certificados;
- organização acadêmica.

Duolingo:
- loop de prática;
- microcompetências;
- exercícios;
- feedback imediato;
- progressão;
- streak;
- XP;
- domínio;
- ranking;
- árvore de habilidades.

Astra Trainer:
- treinamento;
- skill progression;
- exercícios;
- medição;
- feedback;
- evolução.

LinkedIn:
- estrutura de identidade profissional;
- perfil;
- experiência;
- competências;
- evidências;
- atividade;
- conexões;
- portfólio.

Skool:
- sala do professor;
- comunidade;
- cursos;
- aulas;
- atividades;
- membros;
- eventos;
- progresso.

DAW profissional:
- tracks;
- timeline;
- arrangement;
- piano roll;
- mixer;
- routing;
- recording;
- editing;
- automation;
- effects;
- rendering.

Software profissional de partitura:
- score;
- staff;
- instrumentos;
- compassos;
- notas;
- rests;
- clefs;
- key signatures;
- time signatures;
- dynamics;
- articulations;
- playback;
- MIDI;
- MusicXML;
- export.

Essas estruturas devem ser reproduzidas funcionalmente e estruturalmente dentro do produto.

A identidade da plataforma será própria:
- branco;
- preto;
- vermelho;
- linguagem séria;
- musical;
- acadêmica;
- profissional.

Os cruzamentos entre sistemas são diferenciais próprios.

Exemplo:

Academy Course
→ Practice
→ Score
→ Recording
→ Evidence
→ Profile
→ Portfolio
→ Passport
→ Community

Nenhum módulo deve ser implementado como ilha.

Defina também:

- Student;
- Musician;
- Professor;
- Admin;
- Child/Kids;
- Teacher Room;
- Course;
- Lesson;
- Practice;
- Skill;
- World;
- Passport;
- Badge;
- Credential;
- Evidence;
- Project;
- Score;
- Recording;
- Studio Project;
- Forum;
- Post;
- Event;
- Connection.

IMPORTANTE:

Student/Musician/Professor são capacidades/títulos, não mundos isolados.

O usuário pode circular entre eles.

Não introduza limitações arbitrárias.

```

# P02 — DOMAIN MODEL + DATABASE CONTRACT

```text
Implemente o modelo de domínio completo da plataforma.

Crie:

docs/02_DOMAIN_MODEL.md

e os tipos/interfaces/schema necessários.

O modelo deve contemplar:

IDENTITY
User
Account
Role
Capability
Entitlement
Profile

ACADEMY
Program
Path
Course
Module
Lesson
Assessment
Question
Attempt
Grade
Completion
Certificate
LearningHistory

PRACTICE
Skill
SkillTree
Exercise
ExerciseAttempt
PracticeSession
PracticeResult
Mastery
Streak
XP
Ranking

MUSIC
Instrument
InstrumentConfiguration
Technique
Repertoire
Method
ExerciseNotation
PitchEvent
TimingEvent
RhythmEvent
Fingering
String
VoiceSession

CREATION
Score
ScoreRevision
Composition
AudioProject
Track
Clip
Take
Recording
MixerChannel
Effect
Automation
MidiEvent
Render

COMMUNITY
Forum
Topic
Post
Comment
Connection
Event
Room
Membership

TEACHER
TeacherProfile
TeacherRoom
Class
StudentMembership
Assignment
Material
LiveClass
RoomCourse
RoomLesson
RoomExercise

EVIDENCE
Evidence
Artifact
PortfolioItem
Credential
Microcredential
Badge
Achievement

GAMIFICATION
World
Era
Master
Tour
Passport
PassportEntry
Milestone

ADMIN
AuditLog
ModerationAction
FeatureFlag
SystemMetric
ContentRevision
Source
License
ProvenanceRecord

KIDS
Guardian
ChildProfile
GuardianConsent
ChildSafetyPolicy
ChildVisibilitySetting

COMMERCIAL
Plan
Entitlement
Subscription
Purchase
FeatureAccess

Defina:
- IDs;
- foreign keys;
- cardinalidades;
- estados;
- timestamps;
- versionamento;
- ownership;
- visibility;
- soft deletion quando necessário;
- auditabilidade.

O modelo deve permitir os cruzamentos entre todos os sistemas.

Não criar entidades descartáveis apenas para a UI.

Persistência real é obrigatória.
```

# P03 — DESIGN SYSTEM CLONE + VISUAL LANGUAGE

```text
Agora implemente o DESIGN SYSTEM definitivo.

ATENÇÃO:

Não crie um design system genérico.

Queremos CLONE ESTRUTURAL dos padrões de interface das referências funcionais.

A adaptação é identidade visual.

Crie:

docs/03_DESIGN_SYSTEM.md

e implemente os tokens/componentes reais.

BASE:

- branco;
- preto;
- vermelho como identidade principal;
- neutros;
- tipografia editorial/profissional;
- alto contraste;
- grid consistente;
- spacing consistente;
- radius;
- borders;
- shadows;
- iconography;
- motion;
- states.

COMPONENTES:

Button
IconButton
Input
Select
Search
Tabs
Navigation
Sidebar
Topbar
Breadcrumb
Card
CourseCard
LessonCard
PracticeCard
SkillNode
ProgressBar
ProgressRing
XPIndicator
Streak
Badge
Credential
Certificate
Avatar
ProfileHeader
FeedCard
Post
ForumCard
EventCard
RoomCard
Track
Timeline
MixerChannel
PianoRoll
Staff
NotationToolbar
InstrumentKeyboard
Tuner
Waveform
Player
Recorder
Modal
Drawer
CommandPalette
Toast
Tooltip
EmptyState
LoadingState
ErrorState
LockedState
CompletedState
Skeleton
Table
DataGrid
Pagination.

Cada componente deve ter:
- desktop;
- tablet;
- mobile;
- keyboard;
- accessibility;
- loading;
- empty;
- error;
- disabled;
- selected;
- active;
- completed;
- locked.

Diferencie linguagem por domínio sem quebrar a identidade:

ACADEMY:
editorial/acadêmica.

PRACTICE:
interativa/gamificada.

STUDIO:
profissional/técnica.

SCORE:
editorial/musical.

PROFILE:
profissional.

COMMUNITY:
social.

ROOM:
educacional/comunitária.

KIDS:
mesma identidade, UX simplificada.

O design system deve ser reutilizável por todas as telas futuras.
```

# P04 — APPLICATION SHELL + NAVIGATION

```text
Construa o shell completo da aplicação.

CLONE estrutural de uma aplicação moderna de grande escala.

Criar:

- global header;
- sidebar/navigation;
- mobile navigation;
- search;
- command/navigation system;
- notification area;
- profile menu;
- contextual navigation;
- breadcrumbs;
- page headers;
- global player quando aplicável;
- workspace switching;
- responsive shell.

NAVEGAÇÃO PRINCIPAL:

Home
Academy
Practice
Worlds
Community
Studio
Score
Profile

Quando Professor:
Room

Quando Admin:
Admin

O usuário nunca deve ficar preso a um único modo.

O shell deve permitir circulação:

Academy → Practice
Practice → Score
Score → Studio
Studio → Profile
Profile → Community
Community → Event
Event → Room
Room → Academy

Implemente rotas reais.

Não utilizar links mortos.

Não utilizar telas placeholder.

Cada rota deve possuir estados:
loading
empty
error
unauthorized
not found
success.
```

# P05 — AUTH + ONBOARDING + ACCOUNT

```text
Implemente autenticação e onboarding reais.

Métodos:

- Google;
- email;
- account persistence;
- session persistence;
- logout;
- account recovery;
- account linking.

Avatar do Google deve ser utilizado quando disponível.

Após autenticação:

1. identificar usuário;
2. carregar profile;
3. carregar capabilities;
4. carregar entitlements;
5. carregar modo;
6. carregar progresso;
7. direcionar para Home.

ONBOARDING:

Nome
Avatar
Tipo inicial de experiência
Instrumentos
Nível
Objetivos
Interesses
Preferências
Kids Mode quando aplicável.

MODOS:

Traditional
Kids

Professor não é escolhido como um mundo separado.

Professor é capability adquirida.

ADMIN:

Os dois emails autorizados são:

alinealv.silv@gmail.com
office.alinesilva@gmail.com

A resolução de admin deve acontecer SERVER-SIDE.

Nunca confiar apenas no frontend.

Criar:

AdminRole
AdminAuthorization
AuditLog

Não expor lógica administrativa ao cliente.
```

# P06 — PROFILE / PROFESSIONAL MUSIC IDENTITY

```text
Construa o PROFILE completo.

A estrutura deve CLONAR a experiência de um perfil profissional moderno.

TELAS:

Profile Home
About
Activity
Experience
Skills
Education
Achievements
Credentials
Portfolio
Projects
Recordings
Scores
Practice
Learning History
Passports
Badges
Community
Rooms
Events

HEADER:

Avatar
Nome
Título
Instrumentos
Especialidades
Bio
Links
Localização opcional
Status
Capabilities

O perfil deve apresentar diferentes dimensões sem separar o usuário em perfis incompatíveis.

ACADEMIC:

cursos
programas
progresso
certificados
histórico

PRACTICE:

skills
mastery
scores
streak
practice history

MUSICIAN:

produções
scores
recordings
projects
portfolio

PROFESSOR:

rooms
courses
students
classes

COMMUNITY:

posts
forums
events
connections

EVIDENCE:

artifacts
credentials
badges
microcredentials

Privacidade por seção.

Não implementar DM.

Implementar conexões, fóruns e participação pública/privada.
```

# P07 — ACADEMY / COURSERA-STYLE INFORMATION ARCHITECTURE

```text
Construa a ACADEMY completa.

A estrutura deve ser CLONE FUNCIONAL E ESTRUTURAL de uma plataforma acadêmica como Coursera.

TELAS OBRIGATÓRIAS:

Academy Home
Catalog
Search
Search Results
Category
Program
Path
Course Detail
Course Curriculum
Module
Lesson
Interactive Lesson
Assessment
Quiz
Assessment Result
Course Progress
Completion
Certificate
Learning History
Academic Profile

COURSE DETAIL:

- identidade;
- título;
- descrição;
- objetivos;
- competências;
- pré-requisitos;
- nível;
- workload;
- autor/instrutor;
- currículo;
- módulos;
- lessons;
- assessments;
- materiais;
- referências;
- progress;
- outcomes;
- relação com paths;
- relação com worlds;
- certificate;
- related practice.

LESSON:

- conteúdo;
- vídeo;
- texto;
- áudio;
- imagens;
- partituras;
- exemplos;
- exercícios;
- prática;
- assessment;
- referências;
- progresso.

Não criar "página de curso" simplificada.

Implementar a arquitetura completa.

Cada curso deve poder conectar:

Lesson
→ Practice
→ Exercise
→ Score
→ Evidence
→ Profile.
```

# P08 — PRACTICE / SKILL BUILDER / DUOLINGO + ASTRA TRAINER STRUCTURE

```text
Construa o sistema de PRACTICE.

A estrutura deve CLONAR o loop de treinamento de plataformas de aprendizagem gamificadas e trainers musicais.

TELAS:

Practice Home
Skill Tree
Skill Detail
Micro Skill
Exercise
Exercise Session
Attempt
Immediate Feedback
Result
Mastery
Practice History
Daily Goal
Streak
Ranking
Practice Profile

LOOP:

Skill
↓
Exercise
↓
Attempt
↓
Measurement
↓
Immediate Feedback
↓
Retry
↓
Mastery
↓
Progression

MEDIÇÕES:

pitch
timing
rhythm
tempo
accuracy
intonation
duration
consistency
difficulty
score

Permitir:

- teclado;
- instrumento virtual;
- voz;
- ritmo;
- leitura;
- percepção;
- teoria;
- treinamento auditivo;
- repertório;
- técnica.

A prática deve poder ser iniciada:

Academy → Practice

ou

Practice → Skill Builder.

Cada resultado deve poder gerar Evidence.

Persistir cada sessão.
```

# P09 — WORLDS / MAPS / PASSPORTS / GAMIFICATION

```text
Construa Worlds/Maps/Passports.

A estrutura deve seguir o modelo de exploração/progressão das referências gamificadas, mas com conteúdo musical sério.

ENTIDADES:

World
Era
Region
Master
Composer
Work
Tour
Path
Milestone
Passport
PassportEntry
Badge
Achievement
Credential

TELAS:

Worlds Home
World Map
World Detail
Era
Master
Work
Tour
Tour Detail
Passport
Passport Entry
Achievements
Badges
Credentials
Rankings

EXEMPLO:

World
→ Renaissance
→ Composer
→ Work
→ Listening
→ Historical Context
→ Score
→ Practice
→ Quiz
→ Evidence
→ Passport Stamp

Criar progressão visual.

Criar mapas.

Criar objetivos.

Criar completion.

Criar ranking quando aplicável.

Criar histórico.

Não transformar o conteúdo acadêmico em "joguinho infantil".

Kids Mode terá apresentação adaptada posteriormente.
```

# P10 — COMMUNITY / FORUMS / FEED / EVENTS

```text
Construa Community.

A estrutura deve CLONAR funcionalmente uma rede social/comunidade moderna e fóruns educacionais, adaptada para música.

TELAS:

Community Home
Feed
Discover
Forums
Forum
Topic
Topic Detail
Post
Post Detail
Comments
Connections
Events
Event Detail
My Activity

FUNÇÕES:

- criar post;
- anexar artifact;
- compartilhar score;
- compartilhar practice result;
- compartilhar recording;
- compartilhar project;
- participar de forum;
- comentar;
- reagir;
- seguir/conectar;
- participar de eventos;
- privacy;
- moderation.

NÃO implementar DM.

Permitir fóruns:
- públicos;
- privados;
- invite-only;
- vinculados a cursos;
- vinculados a rooms;
- vinculados a eventos.

Community deve conectar:

Profile
Academy
Practice
Studio
Score
Room
Events.
```

# P11 — PROFESSOR ROOM / SKOOL-STYLE SCHOOL

```text
Construa o Professor Room.

A arquitetura deve CLONAR estruturalmente uma plataforma de comunidade/escola como Skool.

Professor compra/possui capability Professor.

Então pode criar:

Teacher Room.

TELAS:

Room Home
Community
Courses
Course Detail
Lessons
Exercises
Assignments
Students
Student Detail
Progress
Events
Live Classes
Materials
Projects
Analytics
Room Settings

ROOM HOME:

- identidade da sala;
- professor;
- comunidade;
- cursos;
- calendário;
- atividades;
- progresso;
- membros;
- anúncios.

PROFESSOR:

criar curso
criar módulo
criar lesson
criar exercise
criar assignment
criar material
criar event
criar live class
acompanhar student
avaliar
comentar
visualizar progress
gerenciar membros

STUDENT:

entrar;
ver currículo;
realizar lessons;
fazer exercícios;
entregar assignments;
participar;
acompanhar progresso.

Room é conectado ao Profile do Professor.

Não criar uma plataforma isolada do restante do ecossistema.
```

# P12 — STUDIO / PROFESSIONAL MUSIC PRODUCTION

```text
Construa o MUSIC STUDIO.

A arquitetura deve ser de um DAW profissional.

NÃO construir toy DAW.

NÃO criar apenas uma timeline visual.

TELAS/WORKSPACES:

Studio Home
Project Browser
New Project
Project Workspace
Arrangement
Track View
Piano Roll
Audio Editor
Mixer
Routing
Effects
Automation
Recording
Monitoring
Instrument Browser
MIDI Editor
File Manager
Render/Export

SUPORTE:

Audio tracks
MIDI tracks
Instrument tracks
Buses
Aux
Master
Clips
Takes
Markers
Tempo
Time signature
Loop
Recording
Punch in/out
Comping
Quantization
Automation
Plugins/effects
Routing
Solo
Mute
Pan
Volume
Meters
Undo/redo
Versioning
Import
Export
Render

INTEGRAÇÕES:

Score
Practice
Instrument
Voice
AI generation
Profile
Portfolio
Evidence

AI generation é UMA ferramenta dentro do Studio.

O Studio também deve permitir produção tradicional real:

recording
editing
arrangement
mixing
rendering.

Arquitetar engine/backend separadamente quando necessário.
```

# P13 — SCORE STUDIO / PROFESSIONAL NOTATION

```text
Construa o SCORE STUDIO completo.

A arquitetura deve seguir software profissional de notação musical.

TELAS:

Score Home
Score Browser
New Score
Score Editor
Instrument Setup
Page Layout
Playback
Parts
Export
Revision History

EDITOR:

staff
clef
key signature
time signature
notes
rests
accidentals
tuplets
ties
slurs
dynamics
articulations
tempo
lyrics
chords
text
repeats
barlines
voices
multiple instruments
parts

EDITING:

select
move
copy
paste
delete
transpose
quantize
undo
redo
versioning

PLAYBACK:

play
pause
stop
tempo
loop
metronome
instrument sound
cursor

IMPORT/EXPORT:

MusicXML
MIDI
PDF
SVG
audio rendering quando suportado.

Score deve poder virar:

Exercise
Practice
Assignment
Evidence
Portfolio Item
Studio material.

O usuário deve conseguir criar exercícios próprios.

Não usar um editor falso com poucos símbolos.
```

# P14 — INSTRUMENT LAB / VOICE LAB / TUNER

```text
Construa Instrument Lab.

Criar simuladores funcionais para instrumentos suportados.

ARQUITETURA:

Instrument
→ Configuration
→ Technique
→ Input
→ Sound
→ Pitch
→ Timing
→ Fingering
→ Feedback
→ Score
→ Practice Result

SUPORTE A:

keyboard
piano
guitar
bass
violin
viola
cello
double bass
winds
brass
percussion
voice
synth.

Não é necessário que todos os instrumentos tenham exatamente a mesma interface.

Cada instrumento deve ter interface apropriada.

VIOLIN, por exemplo:

strings
fingering
positions
pitch
bowing
timing
intonation
score.

METHOD PRESETS:

Suzuki
Hans Sitt
Maia Bang
outros métodos configuráveis.

VOICE LAB:

pitch
intonation
range
breath exercises
vocal exercises
karaoke
lyrics
backing track
recording
feedback.

TUNER:

input
pitch detection
note
cent deviation
stability
instrument presets.

Resultados devem integrar Practice/Evidence/Profile.
```

# P15 — EVIDENCE / PORTFOLIO / CREDENTIALS

```text
Construa Evidence + Portfolio.

A arquitetura deve transformar atividade real em evidência profissional verificável.

TELAS:

Evidence Home
Evidence Detail
Portfolio
Portfolio Item
Credentials
Credential Detail
Achievements
Certificate
Verification

EVIDENCE pode vir de:

Course completion
Assessment
Practice
Performance
Score
Recording
Studio Project
Teacher Assignment
Room Project
Event
Community contribution.

Cada Evidence possui:

owner
type
source
date
skill
competency
artifact
result
verification
visibility
provenance.

PORTFOLIO:

projects
scores
recordings
productions
performances
compositions
certificates
credentials.

PROFILE deve consumir essas evidências automaticamente.

Não permitir evidência fictícia como se fosse resultado real.
```

# P16 — KIDS MODE / GUARDIAN ARCHITECTURE

```text
Construa Kids Mode.

IMPORTANTE:

Kids Mode NÃO é uma versão com menos conteúdo.

É o mesmo ecossistema com apresentação, linguagem, objetivos e UX adequados para crianças.

Criar:

Guardian
ChildProfile
GuardianConsent
ChildSettings
ChildVisibility
SafetyPolicy

TELAS:

Kids Home
Kids Academy
Kids Course
Kids Lesson
Kids Practice
Kids Worlds
Kids Achievements
Kids Profile
Guardian Dashboard

ADAPTAÇÕES:

- linguagem mais simples;
- objetivos menores;
- instruções claras;
- feedback apropriado;
- visual mais acessível;
- navegação simplificada;
- maior proteção de privacidade.

Não remover a profundidade estrutural dos conteúdos.

O adulto controla configurações relevantes.

Não implementar DM.

Aplicar regras de segurança e visibilidade apropriadas.

Não assumir uma jurisdição específica sem camada configurável de compliance.
```

# P17 — ADMIN / CONTROL CENTER

```text
Construa o ADMIN CONTROL CENTER.

Somente os dois administradores autorizados:

alinealv.silv@gmail.com
office.alinesilva@gmail.com

ADMIN deve ser resolvido server-side.

TELAS:

Admin Home
Users
User Detail
Roles
Capabilities
Content
Courses
Lessons
Practice
Worlds
Community
Moderation
Reports
Teacher Rooms
Evidence
Credentials
Sources
Provenance
Tools
Feature Flags
Entitlements
Commercial
Audit Logs
System Health
Analytics
Jobs
Integrations
Settings

USER MANAGEMENT:

search
filter
view
suspend
restore
role
capability
audit.

CONTENT:

create
edit
publish
unpublish
version
review.

MODERATION:

reports
posts
forums
users
actions
audit trail.

SOURCES/IP:

source
edition
license
copyright status
provenance
content mapping.

SYSTEM:

health
jobs
errors
latency
integrations
storage
database.

ADMIN nunca deve ser apenas uma tela bonita.
Todas as operações precisam de API e autorização real.
```

# P18 — BACKEND / API / ENGINES / INTEGRATION / PRODUCTION HARDENING

```text
Este é o prompt de integração final.

Agora conecte todas as camadas.

OBJETIVO:

REAL USER
↓
REAL AUTH
↓
REAL PROFILE
↓
REAL DATABASE
↓
REAL BUSINESS LOGIC
↓
REAL API
↓
REAL ENGINE
↓
REAL ARTIFACT
↓
REAL EVIDENCE
↓
REAL HISTORY
↓
REAL COMMUNITY
↓
REAL ADMIN

Nenhuma tela pode continuar dependendo de mock quando existe contrato real.

ARQUITETURA:

Frontend:
React/TypeScript ou stack existente do projeto.

Backend:
API server existente.

Python:
usar quando necessário para:
- DSP;
- pitch;
- rhythm;
- timing;
- audio analysis;
- MIDI;
- MusicXML;
- audio processing;
- notation;
- rendering;
- scientific/music computation;
- jobs pesados.

Não reimplementar em JavaScript uma engine Python especializada sem motivo.

Criar contratos claros entre frontend/backend/Python.

IMPLEMENTAR:

auth
profile
academy
practice
gamification
community
rooms
studio
score
instrument
voice
evidence
portfolio
admin
commercial
notifications
analytics
audit.

PERSISTÊNCIA:

todos os dados importantes devem persistir.

ESTADOS:

loading
empty
error
retry
locked
unauthorized
completed
in-progress.

SEGURANÇA:

- server-side authorization;
- RBAC/capabilities;
- validation;
- rate limits;
- secrets fora do código;
- audit;
- input sanitization;
- secure storage;
- CORS;
- CSRF quando aplicável;
- protection against IDOR;
- ownership checks.

TESTES:

unit
integration
API
component
E2E
engine
permission
persistence.

RESPONSIVE:

desktop
tablet
mobile.

NÃO aceitar "funciona no desktop" como conclusão.

ANALYTICS:

track:
navigation
course progression
practice
exercise
completion
studio projects
score creation
evidence
community
room activity
errors.

PROVENANCE:

Todo conteúdo de referência deve possuir origem e status de direitos.

Não copiar livros protegidos.

Criar expressão original baseada nas referências autorizadas.

DEFINITION OF DONE:

Uma funcionalidade só está pronta quando:

UI
+
UX
+
routing
+
state
+
domain
+
database
+
API
+
business logic
+
permissions
+
persistence
+
responsive
+
accessibility
+
error states
+
tests
+
integration

estiverem implementados.

Se uma dependência externa ainda não existir, registre explicitamente:

ENGINE GAP
API GAP
LICENSE GAP
DATA GAP
INFRA GAP

Não fabricar dados ou resultados para esconder gaps.

Ao final, faça uma auditoria de ponta a ponta e gere:

docs/18_IMPLEMENTATION_AUDIT.md

com:

IMPLEMENTED
PARTIAL
MOCK
MISSING
BLOCKED
NEEDS EXTERNAL SERVICE

E corrija todos os gaps que forem tecnicamente possíveis dentro do repositório.
```

### A sequência correta

**P00 → P01 → P02 → P03 → P04 → P05 → P06 → P07 → P08 → P09 → P10 → P11 → P12 → P13 → P14 → P15 → P16 → P17 → P18.**

E há uma regra que deve acompanhar **todos os 19 prompts**:

> **REFERÊNCIA DE PRODUTO = CLONE DE ESTRUTURA E EXPERIÊNCIA. IDENTIDADE, CONTEÚDO, DADOS, INTEGRAÇÕES, CRUZAMENTOS, ORQUESTRAÇÃO E FUNCIONALIDADES MUSICAIS = PRÓPRIOS.**

Isso também corrige a ambiguidade que existia nos documentos anteriores: o projeto já estabelece que as ferramentas devem ter versão básica/completa, persistência, integração com perfil/evidências/trilhas, compartilhamento, testes e critérios de aceite. 

A ordem também preserva a arquitetura macro já definida: contratos → identidade → domínio/persistência → shell/design system → Academy → comunidade → Practice → Score → Studio → Voice/Tuner → Labs → Professor Rooms → evidências → IA → entitlements → hardening. 

---

Sim. E, neste ponto, eu mudaria a função do Claude Code: ele não será simplesmente o “backend developer”. Ele será o **auditor de paridade + arquiteto de integração + implementador + QA técnico** do que o AI Studio estiver produzindo.

O problema que você identificou é real: chegar ao Prompt 8 sem que, ao abrir Academy, a experiência imediatamente tenha a linguagem estrutural de uma Coursera; Profile tenha a arquitetura de um LinkedIn; Practice tenha o loop de Duolingo/Astra Trainer, significa que os prompts anteriores estão permitindo implementação genérica demais.

E os seus próprios documentos reforçam que o sistema deve ser verificado como `REAL USER → REAL AUTH → REAL PROFILE → REAL DATABASE → REAL BUSINESS LOGIC → REAL API → REAL ARTIFACT → REAL HISTORY → REAL ADMIN`, e não apenas como telas visualmente funcionais. 

Também há uma regra importante já documentada: antes de gerar catálogo, deve existir um inventário de capacidade de engine → mapa de capacidades do produto → catalog mapping → artifact mapping → library mapping. 

Então eu faria assim:

**AI Studio continua terminando os 19 prompts. Claude Code começa AGORA, em paralelo, mas NÃO espera os 19 terminarem.**

O Claude vai pegar o repositório em qualquer estado em que ele estiver e fazer auditoria contínua.

## A sequência que eu usaria no Claude Code

Não mande todos de uma vez. Cada comando é uma missão fechada. Claude deve ler o repositório antes de alterar qualquer coisa. A própria documentação atual da Anthropic recomenda investigação do código antes de afirmar algo sobre ele e, para trabalhos longos, manter estado/testes no filesystem. ([Claude Platform Docs][1])

### COMANDO 0 — iniciar o Claude no repositório

No terminal:

```bash
cd CAMINHO/DO/PROJETO
claude
```

Assim que entrar:

```text
Leia o repositório inteiro antes de modificar qualquer arquivo.

Não faça suposições sobre o estado atual.

Quero que você trabalhe como:
1. Principal Software Architect
2. Principal Frontend Engineer
3. Principal Backend Engineer
4. UX/UI parity auditor
5. QA/Testing Architect
6. Music technology architect
7. Technical documentation owner

Primeiro investigue.
Depois produza o diagnóstico.
Somente depois implemente.

Não simplifique funcionalidades.
Não substitua arquitetura por mock.
Não declare algo implementado apenas porque existe uma tela.
Não remova funcionalidades existentes sem justificar tecnicamente.
Não invente dados para fazer uma tela parecer pronta.

Crie/atualize:
CLAUDE_STATE.md
CLAUDE_AUDIT.md
CLAUDE_TODO.md

Ao terminar cada missão, atualize esses arquivos.
```

---

# COMANDO 1 — AUDITORIA TOTAL DO ESTADO ATUAL

```text
Faça uma auditoria completa do projeto atual.

Não altere o produto ainda.

Mapeie:

FRONTEND
- rotas
- páginas
- layouts
- componentes
- design system
- estados
- navegação
- responsividade
- acessibilidade
- mocks
- hardcoded data

BACKEND
- servidores
- APIs
- endpoints
- services
- repositories
- database
- authentication
- authorization
- storage
- queues
- workers
- integrations

DOMAIN
- entidades
- relacionamentos
- estados
- ownership
- permissions

TESTS
- unit
- integration
- API
- E2E
- frontend
- backend

DOCUMENTATION
- arquitetura
- UX
- domínio
- API
- testes
- decisões
- implementação

Para cada funcionalidade classifique:

REAL
PARTIAL
MOCK
MISSING
BROKEN
DUPLICATED
UNCONNECTED
WRONG ARCHITECTURE

Não corrija ainda.

Crie um relatório detalhado:

docs/claude/01_REPOSITORY_AUDIT.md
```

---

# COMANDO 2 — AUDITORIA DE PARIDADE VISUAL/ESTRUTURAL

Esse é um dos mais importantes.

```text
Agora audite a plataforma contra as referências estruturais definidas pelo produto.

A regra é PARIDADE ESTRUTURAL, não inspiração.

Quando eu abrir:

ACADEMY
devo reconhecer imediatamente a arquitetura de experiência de uma plataforma como Coursera.

PROFILE
devo reconhecer imediatamente a arquitetura de um perfil profissional como LinkedIn.

PRACTICE
devo reconhecer imediatamente a arquitetura de treinamento de Duolingo/Astra Trainer.

TEACHER ROOM
devo reconhecer imediatamente a arquitetura de uma plataforma de escola/comunidade como Skool.

STUDIO
devo reconhecer imediatamente a arquitetura de uma DAW profissional.

SCORE
devo reconhecer imediatamente a arquitetura de um software profissional de notação.

Faça uma auditoria tela por tela.

Para cada domínio compare:

- information architecture
- navigation
- hierarchy
- page composition
- density
- tabs
- cards
- sidebars
- progress
- search
- filtering
- detail pages
- activity
- states
- workflows
- interactions
- responsive behavior

Crie:

docs/claude/02_REFERENCE_PARITY_AUDIT.md

Para cada diferença escreva:

REFERENCE
CURRENT IMPLEMENTATION
PARITY STATUS
GAP
REQUIRED CHANGE
PRIORITY

Não altere a identidade própria da plataforma.

A identidade visual continua sendo a nossa.

Mas a estrutura deve alcançar paridade.
```

---

# COMANDO 3 — CORRIGIR ACADEMY PARA PARIDADE COURSERA

```text
Agora corrija a Academy.

Objetivo:

Quando o usuário clicar em Academy, a experiência deve imediatamente parecer uma verdadeira plataforma acadêmica completa, com a estrutura de produto de uma Coursera.

Não faça uma versão genérica de LMS.

Implemente e/ou corrija:

Academy Home
Catalog
Search
Search Results
Categories
Programs
Paths
Course Detail
Course Curriculum
Module
Lesson
Interactive Lesson
Assessment
Quiz
Assessment Result
Course Progress
Course Completion
Certificate
Learning History

Course Detail deve possuir:

hero/header
course identity
description
learning objectives
skills
competencies
level
duration/workload
requirements
instructor/author
curriculum
modules
lessons
assessment
materials
resources
references
progress
certificate
related courses
related paths
related practice
related world

Lesson deve possuir:

lesson header
navigation
content body
formatted educational content
media
images
figures
examples
references
exercise
practice CTA
quiz
progress
next lesson
previous lesson

Course navigation deve funcionar como uma verdadeira plataforma de curso.

Implementar estados reais.

Implementar persistence.

Implementar backend.

Implementar testes.

Não apenas estilize.

Corrija arquitetura, frontend, backend, database e integração.
```

---

# COMANDO 4 — CORRIGIR PROFILE PARA PARIDADE LINKEDIN

```text
Agora faça uma auditoria e correção completa do Profile.

Objetivo:

Ao abrir Profile, o usuário deve reconhecer imediatamente a arquitetura de um perfil profissional moderno como LinkedIn, adaptado para música.

Não criar apenas um dashboard bonito.

Implementar:

Profile Header
About
Activity
Experience
Education
Skills
Certifications/Credentials
Projects
Portfolio
Featured
Posts
Practice
Learning
Achievements
Connections
Events
Rooms
Music Projects
Scores
Recordings

HEADER:

avatar
name
professional title
music roles
instruments
specialties
bio
links
location quando aplicável
visibility
connections

FEATURED:

scores
recordings
projects
certificates
credentials
performances
selected evidence

ACTIVITY:

posts
practice evidence
learning achievements
projects
community participation

ACADEMIC:

courses
paths
certificates
history

MUSICIAN:

projects
scores
recordings
portfolio

TEACHER:

rooms
courses
students
events

Não separar o usuário em perfis incompatíveis.

Tudo deve ser alimentado pelos dados reais do domínio.

Corrija frontend + backend + persistence + API + tests.
```

---

# COMANDO 5 — CORRIGIR PRACTICE PARA PARIDADE DUOLINGO/ASTRA TRAINER

```text
Agora faça a auditoria completa do Practice.

Objetivo:

Ao abrir Practice, o usuário deve imediatamente reconhecer a experiência de uma plataforma de treinamento gamificado como Duolingo/Astra Trainer, adaptada à música.

Implementar:

Practice Home
Daily Goal
Streak
XP
Skill Tree
Skills
Micro Skills
Lessons/Exercises
Exercise Session
Immediate Feedback
Retry
Mastery
Progress
Practice History
Ranking
Statistics

Loop obrigatório:

SKILL
↓
MICRO SKILL
↓
EXERCISE
↓
ATTEMPT
↓
MEASUREMENT
↓
IMMEDIATE FEEDBACK
↓
RETRY
↓
MASTERY
↓
NEXT SKILL

Não criar apenas uma lista de exercícios.

Criar progressão.

Criar domínio.

Criar estados.

Criar dificuldade.

Criar histórico.

Criar medição real.

Integrar:

pitch
timing
rhythm
intonation
tempo
accuracy
ear training
reading
theory
instrument technique
voice.

Todos os resultados devem persistir.

Practice deve poder ser iniciado a partir de Academy e voltar para Academy.

Practice deve gerar Evidence.

Corrija toda a cadeia frontend → backend → engine → database → profile.
```

---

# COMANDO 6 — AUDITAR TODAS AS CONEXÕES ENTRE SISTEMAS

```text
Agora faça uma auditoria de integração de toda a plataforma.

Mapeie e teste todas as conexões:

Academy → Practice
Academy → Score
Academy → World
Academy → Profile
Academy → Evidence

Practice → Profile
Practice → Evidence
Practice → Score
Practice → Portfolio
Practice → Ranking

Score → Practice
Score → Portfolio
Score → Evidence
Score → Studio

Studio → Profile
Studio → Portfolio
Studio → Evidence
Studio → Community

World → Academy
World → Practice
World → Score
World → Passport
World → Profile

Community → Profile
Community → Course
Community → Practice
Community → Studio
Community → Room
Community → Events

Room → Academy
Room → Practice
Room → Assignments
Room → Evidence
Room → Profile

Evidence → Profile
Evidence → Portfolio
Evidence → Credentials
Evidence → Community

Identifique toda conexão:
MISSING
BROKEN
MOCK
ONE-WAY
DUPLICATED
INCORRECT

Depois implemente as correções.

Crie:

docs/claude/06_CROSS_SYSTEM_INTEGRATION.md
```

---

# COMANDO 7 — KNOWLEDGE FRAMEWORK / LIVROS / CURSOS

Aqui começa uma parte muito importante do que você descreveu.

```text
Agora construa o Knowledge Framework da Academy.

NÃO gere cursos aleatoriamente.

O conteúdo acadêmico deve ser derivado de fontes de referência catalogadas.

Fontes principais do projeto incluem:

Bohumil Med
Donald J. Grout / Claude Palisca
Suzuki
Hans Sitt
Maia Bang
Edinburgh music theory
Berklee harmony
Berklee music theory volumes
e demais fontes registradas no projeto.

Primeiro encontre no repositório/library/documentation quais fontes estão realmente disponíveis.

Para cada fonte crie:

Source
Author
Title
Edition
Publisher
Year
ISBN quando disponível
Copyright status
License
Pages
Chapters
Sections
Concepts
Exercises
Figures
Tables
References

Não copie livros protegidos.

Use os livros como fontes de conhecimento e referência.

O sistema deve ser capaz de criar conteúdo original derivado das fontes.

Crie:

Knowledge Graph
Source Graph
Concept Graph
Course Graph
Competency Graph
Exercise Graph

Relacionamentos:

SOURCE
→ CHAPTER
→ SECTION
→ CONCEPT
→ COMPETENCY
→ LESSON
→ EXERCISE
→ QUIZ
→ PRACTICE
→ ASSESSMENT
→ EVIDENCE

Crie:

docs/claude/07_KNOWLEDGE_FRAMEWORK.md
docs/claude/07_CONTENT_PROVENANCE.md

Não gere conteúdo ainda se a fonte necessária não estiver disponível.
Primeiro construa a estrutura de ingestão/proveniência.
```

---

# COMANDO 8 — INGESTÃO DOS LIVROS

```text
Agora implemente o pipeline de ingestão das fontes autorizadas.

Para cada livro/documento disponível:

1. extrair estrutura;
2. identificar capítulos;
3. identificar seções;
4. identificar conceitos;
5. identificar exemplos;
6. identificar exercícios;
7. identificar figuras;
8. identificar tabelas;
9. identificar referências;
10. preservar número de página;
11. preservar origem;
12. registrar direitos/licença.

Não transforme automaticamente texto protegido em cópia literal.

Criar representação estruturada:

Source
Chapter
Section
Concept
Example
ExerciseReference
FigureReference
PageReference

Para cada elemento manter provenance.

Criar:

source_id
page
section
content_type
copyright_status
transformation_type
derived_content_id

Criar embeddings/RAG quando tecnicamente adequado.

Criar grafo de conhecimento.

Documentar o pipeline.

Não publicar automaticamente conteúdo sem revisão.
```

---

# COMANDO 9 — COURSE GENERATION ENGINE

```text
Agora implemente o Course Authoring/Generation Engine.

A Academy deve conseguir transformar conhecimento estruturado em um verdadeiro curso.

Pipeline:

SOURCE
↓
KNOWLEDGE GRAPH
↓
CONCEPT MAP
↓
COMPETENCY MAP
↓
CURRICULUM
↓
MODULES
↓
LESSONS
↓
EXAMPLES
↓
EXERCISES
↓
QUIZZES
↓
ASSESSMENTS
↓
PRACTICE
↓
EVIDENCE

Cada lesson deve ter:

learning objective
prerequisites
concepts
explanation
examples
figures when licensed/allowed
musical examples
exercise
quiz
practice
references
source provenance

Criar diferentes tipos:

Theory Lesson
History Lesson
Listening Lesson
Score Reading Lesson
Instrument Lesson
Technique Lesson
Ear Training Lesson
Composition Lesson
Harmony Lesson

O conteúdo deve ser original e academicamente rastreável às fontes.

Criar course graph.

Criar lesson graph.

Criar dependency graph.

Permitir revisão humana antes de publish.
```

---

# COMANDO 10 — QUIZ/ASSESSMENT ENGINE

```text
Construa o Assessment Engine.

Não criar quizzes genéricos.

Quizzes devem nascer das competências e conceitos da lesson.

Tipos:

multiple choice
multiple response
true/false
matching
ordering
notation identification
audio identification
interval identification
chord identification
rhythm
pitch
score reading
ear training
short answer
practical exercise.

Cada pergunta deve possuir:

question
concept
competency
difficulty
correct answer
distractors
explanation
source provenance
lesson
skill
assessment.

Criar banco de questões.

Randomização controlada.

Difficulty progression.

Attempt history.

Scoring.

Feedback.

Mastery update.

Certificate eligibility quando aplicável.

Persistir tudo.
```

---

# COMANDO 11 — MUSIC ENGINE / PRACTICE REAL

```text
Agora audite e implemente os engines musicais necessários.

Inventarie:

pitch detection
onset detection
tempo
beat tracking
rhythm analysis
intonation
MIDI
MusicXML
audio analysis
waveform
spectral analysis
voice analysis
instrument input
notation rendering
playback.

Para cada capacidade:

ENGINE EXISTS?
LIBRARY EXISTS?
API EXISTS?
IMPLEMENTED?
CONNECTED?
TESTED?

Quando Python for tecnicamente mais apropriado, implemente engine Python.

Não reproduza um algoritmo complexo em TypeScript apenas para evitar backend Python.

Criar contratos frontend ↔ backend ↔ Python.

Cada engine deve possuir testes reais.

Criar:

docs/claude/11_MUSIC_ENGINE_MATRIX.md
```

---

# COMANDO 12 — SCORE STUDIO + STUDIO AUDIT

```text
Audite Score Studio e Music Studio contra a categoria de software profissional correspondente.

Score:

staff
clef
key
time
notes
rests
voices
dynamics
articulation
lyrics
chords
layout
playback
MIDI
MusicXML
export
parts
revision
undo/redo.

Studio:

tracks
audio
MIDI
instruments
timeline
arrangement
clips
takes
recording
editing
piano roll
mixer
routing
effects
automation
monitoring
render
export
project persistence
undo/redo.

Não aceitar protótipo visual.

Para cada capacidade:

REFERENCE
CURRENT
GAP
ENGINE
API
UI
PERSISTENCE
TEST

Corrigir os gaps tecnicamente possíveis.
```

---

# COMANDO 13 — TEACHER ROOM / SKOOL PARITY

```text
Audite Teacher Room contra a arquitetura estrutural de uma verdadeira plataforma de escola/comunidade.

Room Home
Community
Courses
Lessons
Exercises
Assignments
Students
Student Profiles
Progress
Events
Live
Materials
Projects
Analytics
Settings

Professor deve conseguir realmente:

criar curso
criar aula
criar exercício
criar assignment
adicionar material
criar evento
gerenciar estudantes
acompanhar progresso
avaliar
publicar
organizar comunidade.

Student deve realmente conseguir:

entrar
estudar
praticar
entregar
receber avaliação
acompanhar progresso
participar.

Integrar Room com Academy/Profile/Practice/Evidence.
```

---

# COMANDO 14 — ADMIN + SECURITY AUDIT

```text
Faça uma auditoria completa do backend de segurança e Admin.

Validar:

authentication
session
authorization
RBAC
capabilities
ownership
resource isolation
IDOR
admin authorization
input validation
rate limiting
audit logging
secrets
CORS
CSRF quando aplicável
storage permissions
API permissions.

Validar especialmente os dois administradores configurados no produto.

Admin nunca pode ser concedido somente por estado frontend.

Criar testes:

admin allowed
admin denied
user denied
resource owner allowed
resource non-owner denied
expired session
invalid token
tampered request.

Auditar todos os endpoints.

Criar:

docs/claude/14_SECURITY_AUDIT.md
```

---

# COMANDO 15 — BACKEND COMPLETO

```text
Agora faça uma auditoria backend completa.

Para cada domínio:

AUTH
PROFILE
ACADEMY
COURSES
LESSONS
ASSESSMENTS
PRACTICE
GAMIFICATION
WORLDS
COMMUNITY
ROOMS
STUDIO
SCORE
INSTRUMENT
VOICE
EVIDENCE
PORTFOLIO
ADMIN
COMMERCIAL

produza:

ENTITY
DATABASE
REPOSITORY
SERVICE
API
AUTHORIZATION
VALIDATION
EVENTS
JOBS
TESTS.

Não aceite endpoints que retornem mock quando deveriam acessar persistência.

Não aceite frontend simulando backend.

Não aceite API sem autorização.

Criar/atualizar:

docs/claude/15_BACKEND_ARCHITECTURE.md
docs/claude/15_API_CONTRACTS.md
```

---

# COMANDO 16 — TESTING MASTER SUITE

```text
Construa a suíte de testes definitiva.

Criar testes:

UNIT
COMPONENT
INTEGRATION
API
DATABASE
AUTH
PERMISSIONS
E2E
ENGINE
CONTENT
PROVENANCE
RESPONSIVE
ACCESSIBILITY.

Criar testes E2E críticos:

signup
login
profile
academy catalog
open course
open lesson
complete lesson
quiz
assessment
practice
exercise
mastery
score
studio
evidence
portfolio
community
room
teacher
admin.

Criar testes de integração:

Academy → Practice
Practice → Evidence
Evidence → Profile
Score → Practice
Studio → Portfolio
Room → Academy
World → Academy
World → Practice.

Nenhum teste deve ser removido apenas para obter green build.

Criar:

docs/claude/16_TEST_ARCHITECTURE.md
tests/TEST_MATRIX.md
```

---

# COMANDO 17 — DOCUMENTAÇÃO COMPLETA

```text
Agora faça uma auditoria de toda documentação.

Atualize/crie:

00_MASTER_ONBOARDING.md
01_PRODUCT_SYSTEM.md
02_IDENTITY_PROFILE_SOCIAL.md
03_MAPS_PATHS_PASSPORTS.md
04_DOMAIN_MODEL.md
05_API_SECURITY_INFRA.md
06_TOOL_CATALOG.md
07_TEACHER_ROOM.md
08_PROFILE_EVIDENCE_PORTFOLIO.md
09_SOURCE_IP_PROVENANCE.md
10_IMPLEMENTATION_ORDER.md
11_VERTICAL_SLICES.md
12_ADR_DECISIONS.md
13_DEFINITION_OF_DONE.md
14_COMMERCIAL_STRATEGY.md
15_SCREEN_CATALOG.md
16_SCREEN_ARCHITECTURE.md
17_SCREEN_UX_CONTRACTS.md
18_DESIGN_SYSTEM.md
19_FRONTEND_ARCHITECTURE.md
20_BACKEND_ARCHITECTURE.md
21_API_CONTRACTS.md
22_DATABASE_SCHEMA.md
23_KNOWLEDGE_FRAMEWORK.md
24_CONTENT_PIPELINE.md
25_MUSIC_ENGINE_ARCHITECTURE.md
26_TEST_ARCHITECTURE.md
27_E2E_TEST_MATRIX.md
28_SECURITY_MODEL.md
29_OBSERVABILITY.md
30_DEPLOYMENT.md
31_IMPLEMENTATION_STATUS.md

Documentação deve refletir o código REAL atual.

Não documentar intenção como se já estivesse implementada.

Marcar claramente:

IMPLEMENTED
PARTIAL
PLANNED
BLOCKED
MOCK
```

---

# COMANDO 18 — FINAL PARITY AUDIT

Esse deve ser o grande “juiz”.

```text
Faça a auditoria final da plataforma inteira.

Não faça uma avaliação superficial.

Abra e analise cada domínio como um usuário real.

ACADEMY:
A experiência tem paridade estrutural com uma plataforma acadêmica como Coursera?

PROFILE:
A experiência tem paridade estrutural com LinkedIn?

PRACTICE:
A experiência tem paridade estrutural com Duolingo/Astra Trainer?

ROOM:
A experiência tem paridade estrutural com Skool?

STUDIO:
A experiência tem paridade estrutural com uma DAW profissional?

SCORE:
A experiência tem paridade estrutural com software profissional de notação?

Depois teste as conexões.

Também audite:

AUTH
DATABASE
API
BUSINESS LOGIC
ENGINES
CONTENT
KNOWLEDGE GRAPH
PROVENANCE
ADMIN
SECURITY
TESTS
DOCUMENTATION.

Para cada gap:

não apenas descreva.

CORRIJA.

Depois execute todos os testes disponíveis.

Depois faça uma segunda auditoria.

Não declare COMPLETE enquanto existirem gaps críticos.

Produza:

docs/claude/18_FINAL_PARITY_AUDIT.md
docs/claude/18_FINAL_IMPLEMENTATION_STATUS.md
docs/claude/18_FINAL_GAPS.md
```

---

# COMANDO 19 — RELEASE GATE

```text
Agora execute o RELEASE GATE.

O produto só pode ser considerado pronto para release se:

1. frontend real;
2. backend real;
3. database real;
4. authentication real;
5. authorization real;
6. Academy funcional;
7. Profile funcional;
8. Practice funcional;
9. Worlds funcionais;
10. Community funcional;
11. Teacher Room funcional;
12. Score Studio funcional;
13. Music Studio funcional;
14. Instrument/Voice/Tuner funcionais conforme escopo;
15. Evidence funcional;
16. Knowledge Framework funcional;
17. provenance funcional;
18. admin funcional;
19. tests passando;
20. documentação atualizada.

Verifique especialmente:

NENHUM MOCK CRÍTICO
NENHUM LINK MORTO
NENHUMA API FALSA
NENHUM DADO FICTÍCIO APRESENTADO COMO REAL
NENHUMA PERMISSÃO SOMENTE NO FRONTEND
NENHUMA FUNCIONALIDADE CRÍTICA SEM PERSISTÊNCIA
NENHUM DOMÍNIO CRÍTICO DESCONECTADO
NENHUM DOCUMENTO DIZENDO IMPLEMENTADO QUANDO É PARCIAL.

Execute os testes.

Se encontrar problemas, corrija-os.

Depois produza o relatório final.
```

## E existe um comando que eu colocaria entre TODOS eles

Depois de cada missão:

```text
Agora faça uma verificação independente do trabalho que acabou de realizar.

Não confie no seu próprio resumo.

Inspecione novamente:
- código;
- rotas;
- componentes;
- APIs;
- banco;
- testes;
- integração.

Procure especificamente por:
mock escondido,
hardcoded data,
placeholder,
link morto,
estado não persistido,
endpoint inexistente,
permissão ausente,
feature desconectada,
documentação falsa.

Corrija os problemas encontrados.

Execute os testes relevantes.

Atualize CLAUDE_STATE.md, CLAUDE_AUDIT.md e CLAUDE_TODO.md.
```

Isso é importante porque a própria documentação atual da Anthropic recomenda instruções explícitas de verificação e investigação antes de fazer afirmações sobre o código. ([Claude Platform Docs][1])

## E eu faria uma mudança fundamental no seu fluxo

Você não precisa esperar o AI Studio acabar.

A sequência agora fica:

**AI Studio**
→ continua P08, P09, P10... P19

**Claude Code**
→ começa P00 agora
→ audita o que o AI Studio já produziu
→ corrige Academy
→ corrige Profile
→ corrige Practice
→ corrige conexões
→ constrói backend real
→ constrói Knowledge Framework
→ ingere os livros disponíveis
→ constrói Course/Quiz generation
→ implementa engines
→ testes
→ documentação
→ auditoria final.

E, sobretudo, **Claude não deve presumir que os 19 prompts do AI Studio estão corretos**. Ele deve tratá-los como implementação candidata e compará-los contra a especificação maior.

A documentação que você já tem inclusive estabelece essa filosofia: se uma interface não coleta todos os dados exigidos pelo motor, o correto é identificar o gap, evoluir a tela preservando o design system e completar o contrato, não simplesmente aceitar a limitação. 

### Sobre os livros

Aqui há uma distinção importante: **sim, a Academy deve conseguir usar seus livros como base real para construir cursos, módulos, aulas, textos originais, exercícios, questões, grafos, ilustrações, práticas, quizes e referências página a página quando os arquivos estiverem disponíveis e forem processados pelo sistema.**

Mas não significa mandar o Claude copiar literalmente um livro protegido inteiro para dentro da plataforma. O pipeline que eu colocaria é:

**Livro**
→ página/capítulo/seção
→ conceito
→ competência
→ pré-requisito
→ lesson
→ explicação original
→ exemplo
→ exercício original
→ quiz
→ practice
→ assessment
→ referência à página
→ knowledge graph.

Para material protegido, a plataforma deve gerar **expressão educacional original baseada na fonte**, mantendo a proveniência; para material cuja licença permita reprodução, a camada de conteúdo pode trabalhar com o material permitido. Isso é exatamente o tipo de rastreabilidade que seu projeto já prevê ao manter fonte, conteúdo e proveniência separados. O backend também já está concebido em torno de PostgreSQL, armazenamento, RAG e grafos, que são componentes adequados para essa arquitetura de conhecimento.  

E há mais uma consequência: **não basta criar um “Knowledge Base”**. O Claude precisa construir o relacionamento:

`Fonte → Página → Conceito → Competência → Curso → Módulo → Aula → Questão → Exercício → Skill → Practice → Evidência`

Isso é o que fará a Academy deixar de ser um conjunto de telas bonitas e virar realmente uma plataforma acadêmica baseada no seu acervo.

Por fim, o Claude Code deve trabalhar no mesmo repositório GitHub que o AI Studio, para que os dois estejam auditando o mesmo estado do produto. E eu não usaria comandos genéricos como “melhore o frontend”: as missões acima são deliberadamente verificáveis e encadeadas. A abordagem também é compatível com a recomendação atual da Anthropic para tarefas longas: manter estado no filesystem, testes estruturados e continuar sistematicamente através de múltiplas janelas de contexto.


