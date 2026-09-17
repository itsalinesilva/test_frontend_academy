# CONSTITUIÇÃO E ARQUITETURA DO DESIGN SYSTEM (03_DESIGN_SYSTEM)

**Status:** Especificação Canônica de Design System  
**Versão:** 1.0.0 Canônica  
**Data:** 16 de Setembro de 2026  
**Identidade Visual:** Branco, Preto, Vermelho Institucional (#991b1b), Neutros Quentes (Stone)  
**Princípio Maior:** Clone Estrutural das Referências Funcionais (Coursera, Duolingo, Astra Trainer, LinkedIn, Skool, Pro DAW, Software de Partituras).

---

## 1. FUNDAMENTOS VISUAIS E TOKENS DE IDENTIDADE

O Design System da **Academia Musical Digital** rejeita modelos visuais genéricos ou clichês de IA. Cada escolha estética responde a critérios de ergonomia musical, legibilidade e autoridade acadêmica.

### 1.1 Paleta Canônica de Cores
- **Branco Puro / Papel de Partitura (`#ffffff`):** Superfície de leitura analítica, pautas e documentos oficiais.
- **Off-White / Stone-50 (`#fafaf9`):** Fundo padrão da aplicação (canvas global anti-fadiga visual).
- **Preto Profundo / Stone-900 (`#1c1917`):** Tipografia principal, botões secundários sóbrios e molduras estruturais.
- **Vermelho Institucional / Red-800 (`#991b1b`):** Cor de identidade primária. Utilizada estritamente para ações principais (CTA), indicadores de playhead/gravação ativa, seleções e marcas de destaque. **Nunca** utilizada como mancha de fundo ou gradiente agressivo.
- **Vermelho Carmim / Red-900 (`#7f1d1d`):** Hover e estados ativos de foco do vermelho principal.
- **Neutros de Estrutura (Stone-100 a Stone-400):** Divisórias de 1px, bordas e estados desabilitados.
- **Superfície Técnica do Estúdio / Zinc-900 (`#18181b`):** Reservada para a DAW, timeline de áudio, faders e canais de mixagem.

### 1.2 Tipografia Editorial e Musical
- **Sans-Serif Primária (`system-ui`, `-apple-system`, `sans-serif`):** Interface de navegação, botões, dados de áudio, formulários e tabelas.
- **Serif Acadêmica (`Cinzel`, `Playfair Display`, `Georgia`, `serif`):** Cabeçalhos de cursos, títulos de diplomas, nomes de programas formais e brasões institucionais.
- **Monoespacada (`ui-monospace`, `monospace`):** Posições em compasso/tempo (ex: `00:02:14.350`, `120.00 BPM`, frequências `440.0 Hz`, `+12 cents`).
- **Escala de Tipografia:** Base mínima de 16px para texto corrente, line-height 1.5 a 1.6, largura de coluna fixada em 65–75 caracteres (`ch`).

### 1.3 Rítmica Espacial e Grid
- **Grid Modular de 4px / 8px:** Todo padding, margin e altura de linha é múltiplo de 4px.
- **Regra de Padding de Botões:** O padding horizontal é rigorosamente $2\times$ o padding vertical (ex: `px-4 py-2`, `px-6 py-3`).
- **Regra dos Raios Aninhados (*Nested Radius*):**
  $$\text{Raio Interno} = \max(0, \text{Raio Externo} - \text{Padding})$$
  Evita distorções óticas em cards com elementos internos.

---

## 2. DIFERENCIAÇÃO DE LINGUAGEM POR DOMÍNIO

A identidade cromática permanece unificada (branco, preto, vermelho institucional), mas a densidade e o ritmo se adaptam à função:

| Domínio | Referência de Estrutura | Linguagem Visual & Densidade | Características Especiais |
| :--- | :--- | :--- | :--- |
| **ACADEMY** | **Coursera** | Editorial, acadêmica, densidade equilibrada. Espaço generoso, ementas estruturadas, badges formais. | Títulos com serifas institucionais, status de conclusão rigoroso. |
| **PRACTICE** | **Duolingo / Astra** | Interativa, gamificada, foco cognitivo imediato. | Árvore de competências, aneis de precisão, contadores de streak e XP. |
| **STUDIO** | **Pro DAW (Logic/ProTools)**| Profissional, técnica, densidade máxima. Fundo escuro controlado (`#18181b`). | Decibelímetro, faders verticais, formas de onda com playhead vermelho. |
| **SCORE** | **Dorico / MuseScore** | Editorial musical, papel nobre branco, contraste absoluto. | Toolbar de articulações e notas, compassos numerados, zoom vetorial. |
| **PROFILE** | **LinkedIn** | Profissional, credenciais comprovadas, hierarquia de autoridade. | Histórico acadêmico formal, selo de verificação, portfólio auditado. |
| **COMMUNITY** | **Skool** | Social com moderação pedagógica, alta legibilidade de tópicos e respostas. | Indicador de resposta aceita pelo professor, filtros por tags de matéria. |
| **ROOM** | **Skool / Google Classroom**| Educacional, orientada à tutoria e tarefas. | Banner do professor, prazos destacados, entregas em áudio/vídeo. |
| **KIDS** | **Adaptação Inclusiva** | Mesma paleta (sem arco-íris pueril), alvos de toque $\ge 48\text{px}$, instruções diretas. | Textos objetivos, fontes 15% maiores, ausência de menus complexos. |

---

## 3. CATÁLOGO COMPLETO DE COMPONENTES

Todos os componentes implementam os 13 estados fundamentais:
`desktop`, `tablet`, `mobile`, `keyboard`, `accessibility (A11y/ARIA)`, `loading`, `empty`, `error`, `disabled`, `selected`, `active`, `completed`, `locked`.

### 3.1 Primitivas Base & Formulários
- **`Button` & `IconButton`:** Suporte a variantes (`primary`, `secondary`, `outline`, `ghost`, `danger`, `accent`), tamanhos (`sm`, `md`, `lg`, `kids`), ícones e estado de carregamento com spinner acessível.
- **`Input` & `Search`:** Campos com suporte a ícones prefixados/sufixados, mensagens de erro acessíveis, botão de limpar busca e atalho de teclado (`/` ou `Cmd+K`).
- **`Select`:** Menu suspenso estilizado com indicador nativo e acessibilidade por teclado (`ArrowDown`, `Enter`).
- **`Checkbox`, `RadioGroup`, `Switch`:** Controles booleanos com anel de foco vermelho institucional de alto contraste.

### 3.2 Navegação & Estrutura
- **`Sidebar`:** Navegação lateral retrátil com colapso em tablet e drawer em mobile, exibindo atalhos rápidos dos 12 domínios e estado de seleção evidente.
- **`Topbar`:** Barra superior institucional contendo migalhas de pão (`Breadcrumbs`), pesquisa universal, notificações, alternador de audiência (`Traditional` vs `Kids`) e avatar do usuário.
- **`Tabs` & `SegmentedControl`:** Alternadores de contexto com underline animado e navegação por setas de teclado (`role="tablist"`).
- **`Pagination`:** Paginação numérica completa com salto de página, indicador de total e botões anterior/próximo acessíveis.

### 3.3 Cards & Nós de Domínio
- **`Card`:** Contêiner básico com controle de elevação e padding matemático.
- **`CourseCard`:** Card padrão Coursera com selo de nível, carga horária, professor, barra de progresso e botão de matrícula/continuação.
- **`LessonCard`:** Card de aula com indicador de status (`locked`, `in_progress`, `completed`), duração e tipo de mídia (texto, áudio, partitura).
- **`PracticeCard`:** Card de exercício interativo com precisão média, meta de tempo e XP concedido.
- **`SkillNode`:** Nódulo da árvore de habilidades estilo Duolingo/Astra com coroa de maestria (1 a 5), estado bloqueado com cadeado, estado ativo pulsante e anel de progresso.

### 3.4 Telemetria, Gamificação & Credenciais
- **`ProgressBar` & `ProgressRing`:** Indicadores determinísticos de avanço linear e circular em SVG com atributos ARIA (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- **`XPIndicator` & `Streak`:** Mostradores compactos de pontuação de experiência e dias consecutivos com chama indicadora e estado congelado.
- **`Badge`, `Credential` & `Certificate`:** Selos formais com selo de autenticidade, código de verificação criptográfica e modal de pré-visualização de diploma.

### 3.5 Identidade & Comunidade
- **`Avatar`:** Foto do usuário, iniciais automáticas ou avatar ilustrado infantil, com status de presença (online/offline).
- **`ProfileHeader`:** Cabeçalho profissional padrão LinkedIn com capa, foto, título acadêmico, afiliação institucional, estatísticas de estudo e ações de conexão.
- **`FeedCard` & `Post`:** Item de discussão da comunidade com cabeçalho de autor, corpo em Markdown, anexos multimídia e contador de upvotes.
- **`ForumCard` & `EventCard`:** Cartões de seções do fórum e eventos ao vivo (masterclasses, bancas) com data, contagem de participantes e botão de inscrição.
- **`RoomCard`:** Cartão da sala do professor com número de membros ativos, próximas aulas e status de matrícula.

### 3.6 Estúdio, Notação Musical & Áudio
- **`Track`:** Pista de áudio/MIDI da DAW com botões de Mute, Solo, fader de volume, pan e visualização de clipes.
- **`Timeline`:** Régua métrica de compassos e beats com agulha de reprodução (*playhead*) móvel.
- **`MixerChannel`:** Canal vertical de console profissional com fader tátil em dB, VU meter de pico e roteamento de sinal.
- **`PianoRoll`:** Grade matricial de teclado e notas MIDI com suporte a desenho de notas, velocidade e quantização.
- **`Staff` & `NotationToolbar`:** Renderizador de pentagrama musical com claves (Sol, Fá, Dó), armaduras de clave, compassos e barra de ferramentas de inserção de notas e acidentes.
- **`InstrumentKeyboard`:** Teclado virtual polifônico com teclas brancas e pretas responsivas, mapeamento de atalhos de computador e realce de notas tocadas.
- **`Tuner`:** Afinador estroboscópico/cromático com ponteiro analógico de alta precisão em *cents* (tolerância ajustável) e frequência em Hz.
- **`Waveform`:** Visualizador de forma de onda estéreo com zoom temporal, seleção de região e cursor de reprodução.
- **`Player` & `Recorder`:** Módulos de transporte de áudio com Play, Pause, Stop, Record com armamento de gravação, metrônomo e contador de compasso.

### 3.7 Feedback, Estados & Overlays
- **`Modal` & `Drawer`:** Diálogos acessíveis com foco retido (*focus trap*), fechamento por `Escape` e backdrop com desfoque sutil.
- **`CommandPalette`:** Paleta de comandos universal acionada por `Ctrl+K` ou `Cmd+K` para navegação relâmpago entre módulos, cursos e ferramentas.
- **`Toast` & `Tooltip`:** Notificações flutuantes com auto-dispensamento e dicas de contexto acessíveis com atraso calibrado.
- **Estados Canônicos (`LoadingState`, `EmptyState`, `ErrorState`, `LockedState`, `CompletedState`):** Telas e cartões com ilustrações vetoriais sóbrias, mensagens humanas orientadas à ação e botões de recuperação.
- **`Skeleton`:** Carregadores em pulso neutro com dimensões espelhadas de textos, cards e tabelas.
- **`Table` & `DataGrid`:** Grades de dados com ordenação de colunas, seleção de linhas, paginação integrada e visualização condensada para desktop e mobile.

---

## 4. CONFORMIDADE E ACESSIBILIDADE (WCAG 2.2 AA)

1. **Relação de Contraste:** Mínimo de 4.5:1 para todo texto normal e 3:1 para textos grandes e componentes gráficos.
2. **Navegação por Teclado:** Toda ação acionável via clique deve possuir equivalente por teclado (`Enter`, `Space`) com anel de foco visível (`focus:ring-2 focus:ring-red-800`).
3. **Leitores de Tela:** Uso obrigatório de `aria-label`, `aria-expanded`, `aria-haspopup`, `aria-current` e regiões dinâmicas com `LiveRegion` para anúncios em tempo real.
4. **Motion e Redução de Movimento:** Respeito absoluto à preferência do sistema `prefers-reduced-motion: reduce`.
