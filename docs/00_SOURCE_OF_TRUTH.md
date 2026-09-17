# FONTE DA VERDADE TÉCNICA DO PROJETO (00_SOURCE_OF_TRUTH)

**Versão da Arquitetura:** 1.0.0 Canônica  
**Data:** 16 de Setembro de 2026  
**Status:** Documento Fundamental de Engenharia de Produto  
**Finalidade:** Estabelecer o repositório atual como a fonte de verdade técnica inegociável, definir padrões arquiteturais estritos, formalizar a política de referências explícitas e orientar a evolução dos próximos módulos sem destruição, simplificação indevida ou perda de código existente.

---

## 1. POLÍTICA FUNDAMENTAL DE ARQUITETURA DE REFERÊNCIA

Quando um módulo, fluxo ou tela especifica uma referência de mercado, a equipe de engenharia e IA deve **CLONAR A ESTRUTURA DE EXPERIÊNCIA, ARQUITETURA DE INFORMAÇÃO (IA), HIERARQUIA, ORGANIZAÇÃO, PADRÕES DE NAVEGAÇÃO, COMPOSIÇÃO DE TELAS, DENSIDADE FUNCIONAL, ESTADOS E LÓGICA DE INTERAÇÃO DA REFERÊNCIA**.

### 1.1 O que CLONAR (Obrigatório e Literal)
- **Estrutura de IA e Navegação:** Profundidade de níveis, menus laterais contextuais, trilhas de migalhas (*breadcrumbs*), fluxos de volta (*back flows*), abas de agrupamento e hierarquia de títulos.
- **Composição de Telas e Densidade:** Número e disposição de colunas, posicionamento de painéis laterais de progresso/sumário, densidade de informações em tabelas e cards.
- **Ciclos de Interação e Estados:** Máquinas de estado de exercícios (tentativa -> validação -> feedback imediato -> correção), barras de transporte de áudio, atalhos de teclado.
- **Métricas e Indicadores:** Porcentagens de conclusão, barras de domínio de habilidade, histórico de tentativas e registro imutável de atos.

### 1.2 O que NÃO COPIAR (Vedações Estritas)
- **NUNCA** copiar marcas, logotipos ou nomes registrados comerciais.
- **NUNCA** copiar código-fonte, CSS ou scripts proprietários das empresas de referência.
- **NUNCA** copiar paleta de cores corporativas específicas ou assets visuais protegidos (SVGs, ilustrações, fotos proprietárias).
- **NUNCA** copiar textos, termos de serviço ou materiais instrucionais de terceiros.
- **A adaptação é SEMPRE realizada através do conteúdo musical erudito e canônico da plataforma, da identidade visual com design tokens institucionais (paleta bordô/pedra/esmeralda) e da integração entre os 6 pilares do produto.**

### 1.3 Matriz de Referências por Domínio

| Domínio | Referência Explícita | Estrutura de Experiência a Clonar | Adaptação Institucional da Plataforma |
| :--- | :--- | :--- | :--- |
| **Academia (Aulas & Catálogo)** | **Coursera** | IA acadêmica formal: Programas plurianuais -> Trilhas -> Disciplinas -> Módulos -> Lições -> Leituras teóricas densas -> Exames somativos -> Certificado digital com hash auditável. | Teoria musical baseada na Universidade de Edimburgo, manuscritos históricos de Bach, repertório canônico e análise formal. |
| **Prática Micro-Learning** | **Duolingo** | Loops curtos de exercícios práticos, feedback imediato (verde/vermelho), reforço sonoro, barra de progresso contínuo na sessão, sequências (*streaks*) e tolerância a erros. | Identificação de intervalos, armaduras de clave, leitura de notas na pauta, solfejo e ditado rítmico/melódico. |
| **Treinador de Habilidades** | **Astra Trainer** | Dashboard de precisão técnica, telemetria milimétrica, treino repetitivo assistido por áudio, gráfico de evolução por habilidade musical. | Afinador cromático com desvio em centésimos (*cents*), precisão rítmica com latência em milissegundos e condução de vozes SATB. |
| **Perfil & Identidade** | **LinkedIn** | Arquitetura de perfil profissional: cabeçalho formal com headline e links, seções modulares customizáveis (pública/privada), vitrine de evidências, publicações e histórico comprovado. | 7 lentes de visibilidade: Academia, Prática, Estúdio, Mundos, Comunidade, Salas e Cátedra Docente, com evidências geradas automaticamente pelo sistema. |
| **Salas & Turmas** | **Skool** | Espaço controlado pelo professor (*Teacher-owned*): Mural de avisos da turma, sala de aula com tarefas anexadas, submissões dos alunos, calendário de encontros e ranking/engajamento. | Cátedras de instrumentos e composição, bancas virtuais, submissão de áudio/vídeo para avaliação pedagógica do professor. |
| **Estúdio & Projetos** | **DAWs Profissionais** (Logic/Cubase/ProTools) | Linha do tempo horizontal de pistas (*timeline*), mixer de canais com faders de volume, pan, botões solo/mute, barra de transporte com BPM, gravação e metrônomo. | Arranjo coral SATB, acompanhamento orquestral, sincronização com a partitura canônica. |
| **Notação Musical** | **Softwares Profissionais** (Finale/Sibelius/Dorico) | Edição e visualização em pauta formal, seleção de figuras de tempo, acidentes, ligaduras, claves e importação/exportação de MusicXML/MIDI. | Partituras canônicas integradas diretamente às análises históricas do Atlas de Mundos e lições da Academia. |

---

## 2. MAPA CANÔNICO DE ESTADO DO REPOSITÓRIO

Este mapa sintetiza o estado real do código no repositório, servindo de roteador para as próximas etapas de engenharia:

```
+---------------------------------------------------------------------------------------------------+
|                            MAPA TÉCNICO DE ESTADO DO REPOSITÓRIO                                  |
+---------------------------------------------------------------------------------------------------+
```

### 🟢 2.1 EXISTE E ESTÁ REAL (100% Funcional e Canônico)
- **Design System Completo:** Tokens tipográficos (`src/ui/design-system/tokens.ts`), paleta institucional completa, 46 componentes acessíveis e catálogo visual interativo (`/design-system`).
- **Sistema de Roteamento SPA:** `src/ui/navigation/router.tsx` com 46 rotas, suporte a parâmetros de URL, geração de migalhas de pão (*breadcrumbs*) e navegação integrada com histórico do navegador.
- **Casca e Layout Responsivo:** `AppShell`, `Header`, `Navigation` com os 6 pilares, `ScreenContainer` universal e alternador de personas em tempo de execução.
- **Modelo de Domínio & Contratos:** Tipagens canônicas completas em `src/domain/` e `src/contracts/` para usuários, permissões, perfis, auditoria, ferramentas e academia.
- **Matriz de Permissões RBAC & Entitlements:** `src/infrastructure/entitlements/entitlement-service.ts` e `capabilities.ts`, com verificação estrita de papéis e cotas institucionais.
- **Log Imutável de Auditoria Institucional:** `src/infrastructure/telemetry/audit-service.ts` e `PersistentAuditRepository`, gravando atos de segurança e acadêmicos.
- **Suite de Testes Automatizados:** 19 testes em `tests/` cobrindo teoria musical, gateways, repositórios, entitlements e design system passando com sucesso.

### 🟡 2.2 EXISTE MAS É MOCK (Funciona na UI, mas com Simulação Local)
- **Google OAuth:** `GoogleOAuthModal.tsx` simula a janela federada do Google, emitindo tokens fictícios em vez de conectar ao Google Workspace real.
- **Sessão & Tokens de Autenticação:** `AuthService` gera tokens JWT simulados no cliente e armazena em `LocalStorageAdapter`.
- **Análise de Áudio & Pitch:** `VoiceEarLabScreen.tsx` alterna estados de afinação pré-definidos ao clicar no microfone em vez de abrir um stream contínuo de microfone real no WebAudio.
- **DAW Virtual:** `DawProjectScreen.tsx` gerencia pistas e estados visuais de volume/pan/play/mute, mas não sintetiza áudio real por canal.
- **Editor de Partituras:** `ScoreEditorScreen.tsx` exibe partituras em Canvas 2D, mas não salva em arquivo MusicXML nem possui motor de edição interativa por nota.
- **Salas de Aula:** `CreateRoomScreen.tsx` e `RoomDetailScreen.tsx` utilizam formulários e telas com `setTimeout` sem persistência em repositório central de turmas.
- **Discussões da Comunidade:** `CommunityFeedScreen.tsx` e `TopicDetailScreen.tsx` guardam tópicos em arrays estáticos locais.

### 🟠 2.3 EXISTE PARCIALMENTE (Incompleto ou com Erros de Integração)
- **Academia Musical:** 
  - Possui todo o modelo de dados de alta precisão (`domain/academy.ts`), semente histórica de Edimburgo (`seed-academy-content.ts`), repositório de persistência (`academy.repository.ts`) e serviço de negócios (`academy.service.ts`).
  - *Problema:* Telas recém-adicionadas de avaliação, exames, histórico e certificado possuem incompatibilidades de tipagem estrita com as interfaces do serviço, necessitando de alinhamento de tipos.
- **Perfil Unificado de 7 Lentes:**
  - Repositório completo (`unified-profile.repository.ts`) e serviço (`profile.service.ts`) operantes.
  - *Problema:* A visualização das lentes no `ProfileOverviewScreen` depende de inserções manuais de evidências, sem gatilhos automáticos disparados por todas as telas do sistema.
- **Console Administrativo:**
  - Telas construídas com riqueza de layout e design tokens, mas consumindo dados locais hardcoded nos arquivos `.tsx`.

### 🔴 2.4 NÃO EXISTE (Funcionalidades Pendentes de Construção)
- **Backend HTTP Real (Node.js API):** Servidor Express ou Fastify rodando na porta 3000 para receber rotas `/api/v1/*`.
- **Motor Remoto de Teoria Musical & SATB em Python:** Microsserviço de inteligência musicológica e análise rigorosa de contraponto especificado no Doc 20.
- **Banco de Dados Relacional em Nuvem (Cloud SQL / PostgreSQL):** Tabelas relacionais, migrations e queries transacionais (Doc 63).
- **Sincronização em Tempo Real (WebSockets / WebRTC):** Protocolo de conferência e colaboração simultânea em salas de aula (Doc 28).
- **Importador/Exportador MusicXML e MIDI Completo:** Motor de serialização bidirecional compatível com softwares profissionais de notação.

### 🔧 2.5 PRECISA INTEGRAÇÃO (Telas que Precisam Ligar com Serviços Existentes)
- `AdminUsersScreen.tsx` -> Integrar com `userRepository.listAll()`.
- `AdminAuditScreen.tsx` -> Integrar com `auditRepository.listRecent()`.
- `AdminEnginesScreen.tsx` -> Integrar com `engineGateway.getHealthReport()`.
- `CommunityFeedScreen.tsx` -> Criar e integrar com repositório unificado de comunidade.
- `RoomsDirectoryScreen.tsx` & `RoomDetailScreen.tsx` -> Criar e integrar com repositório unificado de salas.
- `WorldsAtlasScreen.tsx` & `WorkDetailScreen.tsx` -> Integrar com catálogo de obras e manuscritos.

### 🔨 2.6 PRECISA REFACTOR (Ajustes de Tipagem e Desduplicação)
- **Resolução de Tipos da Academia:** Sincronizar propriedades entre `src/domain/academy.ts`, `src/services/application/academy.service.ts` e as telas de exames e certificados (`ActivityScreen`, `AssessmentScreen`, `CertificateScreen`, etc.) para garantir `npm run typecheck` 100% verde.
- **Desduplicação de Repositórios:** Fundir o legado `course.repository.ts` no canônico `academy.repository.ts`, eliminando tipos redundantes.
- **Unificação de Perfis:** Descontinuar `profile.repository.ts` em favor de `unified-profile.repository.ts`.

### ⚡ 2.7 PRECISA ENGINE (Módulos que Dependem de Motores de Áudio e Notação)
- `VoiceEarLabScreen.tsx` -> Conectar diretamente ao `WebAudioEngineAdapter` via `ToolSDK` para detecção de pitch em tempo real com microfone real do usuário.
- `DawProjectScreen.tsx` -> Integrar com o sintetizador WebAudio multicanal para reproduzir notas MIDI das faixas do arranjo.
- `ScoreEditorScreen.tsx` -> Integrar com o `CanonicalScoreEngineAdapter` para permitir inclusão e exclusão de notas na pauta com renderização dinâmica.

---

## 3. CONTRATO GLOBAL DE TELAS (OBRIGATÓRIO PARA QUALQUER TELA)

Toda tela da plataforma deve satisfazer **obrigatoriamente** o contrato formal unificado estabelecido em `docs/harness/16_SCREEN_CONTRACTS.md`:

```markdown
### Contrato de Tela Obrigatório:
1. **Screen ID & Nome:** Identificador único semântico (ex: `screen-academy-course-detail`).
2. **Domínio & Tipo de Usuário:** Qual dos 6 pilares pertence e público-alvo (Geral, Infantil, Professor, Admin).
3. **Pontos de Entrada e Saída:** De onde o usuário veio e para onde pode navegar.
4. **Propósito & Tarefas Principais:** O Job-to-be-Done central do usuário.
5. **Hierarquia e Layout:** Composição estrutural, seções e colunas.
6. **Árvore de Componentes:** Componentes estruturais e atômicos utilizados.
7. **Requisitos de Dados e Contratos de API:** DTOs e entidades necessárias para hidratação da tela.
8. **Ações do Usuário:** Todos os cliques, submissões e atalhos possíveis.
9. **Estados Completos da Tela:**
   - Loading State (esqueleto ou spinner acessível)
   - Empty State (feedback construtivo e ação recomendada)
   - Error State (alerta claro com possibilidade de retry)
   - Success State (confirmação visual de operações concluídas)
10. **Permissões & Matriz RBAC:** Capacidades exigidas para visualização ou interação.
11. **Responsividade & Acessibilidade:** Comportamento mobile/desktop, atributos ARIA, suporte a teclado e contraste WCAG AA.
12. **Telemetria & Auditoria:** Eventos analíticos disparados e registro no log imutável.
13. **Padrões de Referência Aplicados:** Indicação explícita de qual padrão (Coursera, Duolingo, LinkedIn, etc.) fundamenta a experiência.
```

---

## 4. DEFINIÇÃO DE PRONTO (DEFINITION OF DONE - DoD)

Uma tela ou funcionalidade **NÃO ESTÁ PRONTA** se apenas exibir dados estáticos simulados. Uma entrega só atinge o status de concluída quando cumpre integralmente os seguintes 15 critérios:

1. **UI & Design Tokens:** Construída exclusivamente com tokens institucionais (paleta bordô/pedra), tipografia serifada/sans equilibrada e sem anti-patterns visuais ("AI slop").
2. **Fluxo de UX & Navegação:** Transições lógicas, suporte a voltar no navegador e migalhas de pão precisas.
3. **Modelo de Domínio:** Todas as entidades tipadas em `src/domain/` sem uso de `any`.
4. **Contratos de Dados:** Interfaces de entrada e saída tipadas em `src/contracts/`.
5. **Serviços de Aplicação:** Lógica desacoplada da interface e orquestrada em `src/services/`.
6. **Lógica de Negócios & Validação:** Validações de limites, regras de negócio formais e prevenção de entradas corrompidas.
7. **Permissões Institucionais:** Verificação de papéis e capacidades antes de expor ou processar ações.
8. **Persistência Conectada:** Dados salvos e recuperados através da camada de repositórios.
9. **Tratamento de Erros:** Exibição amigável de falhas com opção de recuperação.
10. **Tratamento de Estado Vazio:** Orientações e botões de ação para guiar o usuário em telas sem conteúdo.
11. **Tratamento de Carregamento:** Feedback visual acessível enquanto dados assíncronos são resolvidos.
12. **Comportamento Responsivo:** Testado e funcional de 320px a 2560px de largura de tela.
13. **Acessibilidade Completa (WCAG AA):** Rótulos ARIA, foco visível de teclado e regiões vivas para leituras de status.
14. **Telemetria de Produto:** Disparo de eventos analíticos estruturados.
15. **Integridade de Build & Testes:** Aprovação absoluta em `npm run build` e `vitest run`.

---

## 5. DIRETRIZES DE PRESERVAÇÃO E PRÓXIMOS PASSOS

1. **Regra de Ouro:** Não destruir, reescrever arbitrariamente ou simplificar o que já está construído. O trabalho existente é patrimônio técnico consolidado.
2. **Prioridade Imediata para os Próximos Prompts:**
   - Realizar o refactoring cirúrgico dos tipos da Academia para garantir `npm run typecheck` perfeitamente limpo.
   - Conectar as telas de Admin, Comunidade e Salas aos repositórios e serviços de dados existentes.
   - Conectar os motores de áudio WebAudio e afinador real ao `VoiceEarLabScreen` e `DawProjectScreen`.
