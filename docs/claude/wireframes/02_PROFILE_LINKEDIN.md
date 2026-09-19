# WIREFRAMES — 02 · PERFIL (referência estrutural: LinkedIn)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/profile`, `/profile/:userId`, `/profile/portfolio`, `/profile/edit`
**Densidade:** `CATALOG`

> **O que clonamos:** a arquitetura de um perfil profissional de alta credibilidade — capa + cabeçalho denso com identidade e ações, seções modulares empilhadas com "ver mais", vitrine em destaque, prova social, trilho lateral contextual, e a distinção entre **visão do dono** e **visão do visitante**.
>
> **O que adaptamos:** é um LinkedIn **de músicos**. As seções são as 7 lentes da plataforma. Não há vagas, recrutadores, anúncios, mensagens privadas nem "quem viu seu perfil". Toda conquista é lastreada em **evidência auditada** gerada pelos motores — não em texto autodeclarado.

---

## 1. ESTADO ATUAL — o melhor do repositório, e ainda assim divergente

`ProfileOverviewScreen` tem **672 linhas**, 19 componentes de aba reais e agrupamento por clusters. É a tela com maior paridade estrutural do projeto.

Divergências medidas:
- implementa as 19 abas **à mão**, com scroller próprio, em vez do componente `Tabs` (`Tabs`: 0 usos em telas);
- `ProfileHeader` e `Credential` existem e estão **órfãos** — o cabeçalho é redesenhado manualmente;
- sem trilho lateral fixo; sem `sticky` em lugar algum;
- sem rota de perfil de terceiros (`/profile/:userId`) — **é impossível ver o perfil de outra pessoa**, o que esvazia a premissa de rede profissional;
- `currentProgress = 35` fixo em `RecordingsTab`; mídia semeada aponta para som de chuva e domínios inexistentes.

---

## 2. `/profile` — Forma C

```
┌───────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ CAPA · 1584×396 · imagem própria ou textura institucional ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ CABEÇALHO ▸ ProfileHeader (órfão — reconectar)            │ │
│ │  ┌────┐                                                   │ │
│ │  │ AV │  Aline Silva                        [Editar] [⋯]  │ │
│ │  │152 │  Cravista · Pesquisadora em Performance Histórica │ │
│ │  └────┘  🎹 Cravo · Órgão · Piano                         │ │
│ │          📍 Rio de Janeiro · 🔗 alinesilva.mus.br         │ │
│ │          47 conexões · 3 credenciais · 12 evidências      │ │
│ │          [Conectar] [Mensagem] ← só na visão de visitante │ │
│ └───────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ CLUSTERS ▸ SegmentedControl                                   │
│ [ Tudo │ Acadêmico │ Músico │ Comunidade │ Docente ]           │
├───────────────────────────────────────────────────────────────┤
│ ABAS ▸ Tabs · sticky top-16 · scroller horizontal             │
│ [Início│Sobre│Atividade│Experiência│Formação│Competências│…]   │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8  SEÇÕES                     │ col 9–12 ▸ sticky top-20│
│                                     │                         │
│ ┌─────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ SOBRE                      [✎]  │ │ │ VISIBILIDADE        │ │
│ │ 3 linhas + "…ver mais"          │ │ │ 🌐 Público          │ │
│ └─────────────────────────────────┘ │ │ [Gerenciar seções]  │ │
│ ┌─────────────────────────────────┐ │ └─────────────────────┘ │
│ │ EM DESTAQUE                [+]  │ │ ┌─────────────────────┐ │
│ │ ┌────────┐┌────────┐┌────────┐  │ │ │ SEU PAINEL          │ │
│ │ │gravação││partitura││certif.│  │ │ │ ▸ 2 disciplinas     │ │
│ │ │ ▶ 2:14 ││  🎼    ││  📜   │  │ │ │ ▸ 7 dias de ofensiva│ │
│ │ └────────┘└────────┘└────────┘  │ │ │ ▸ 12 evidências     │ │
│ │  ← carrossel horizontal         │ │ │ ▸ 3 projetos        │ │
│ └─────────────────────────────────┘ │ └─────────────────────┘ │
│ ┌─────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ ATIVIDADE                       │ │ │ PESSOAS SEMELHANTES │ │
│ │ ● publicou análise da BWV 1001  │ │ │ [av] nome · instr.  │ │
│ │ ● concluiu Módulo 2      (auto) │ │ │ [av] nome · instr.  │ │
│ │ ● registrou 45min de prática    │ │ └─────────────────────┘ │
│ │ [Ver toda a atividade →]        │ │ ┌─────────────────────┐ │
│ └─────────────────────────────────┘ │ │ CÁTEDRA (docente)   │ │
│ ┌─────────────────────────────────┐ │ │ 2 salas · 24 alunos │ │
│ │ CREDENCIAIS ▸ Credential(órfão) │ │ └─────────────────────┘ │
│ │ 📜 Fundamentos · 12h · verificar│ │                         │
│ └─────────────────────────────────┘ │                         │
│ ┌─────────────────────────────────┐ │                         │
│ │ COMPETÊNCIAS                    │ │                         │
│ │ Percepção Intervalar ▓▓▓▓░ 78%  │ │                         │
│ │   ↳ 12 evidências · 3 avaliações│ │                         │
│ │ Leitura em Clave de Fá ▓▓░░ 41% │ │                         │
│ └─────────────────────────────────┘ │                         │
│ ┌─ FORMAÇÃO ─┐ ┌─ EXPERIÊNCIA ─┐    │                         │
│ ┌─ PROJETOS ─┐ ┌─ GRAVAÇÕES ──┐    │                         │
│ ┌─ PARTITURAS┐ ┌─ PASSAPORTES ┐    │                         │
│ ┌─ CONQUISTAS┐ ┌─ COMUNIDADE ─┐    │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

---

## 3. AS SEÇÕES E SUA ORIGEM DE DADOS

**Regra inviolável:** toda seção é alimentada por dados reais do domínio. Seção sem dados exibe `EMPTY` com a ação que a preenche — **nunca** dado fabricado.

| Seção | Lente | Fonte real | Estado vazio |
| :--- | :--- | :--- | :--- |
| Sobre | — | `UnifiedProfileRecord.headline/bio` | "Apresente-se" |
| Em destaque | todas | `PortfolioItem[]` selecionados | "Destaque seu melhor trabalho" |
| Atividade | todas | eventos de domínio | "Sua atividade aparecerá aqui" |
| Experiência | — | entradas editáveis | "Adicione sua trajetória" |
| Formação | Academia | matrículas + certificados | "Matricule-se" → catálogo |
| Competências | Academia + Prática | `SkillProgress` + evidências | "Pratique para medir" |
| Credenciais | Academia | `AcademicCertificateRecord` | "Conclua uma disciplina" |
| Portfólio | todas | `PortfolioItem[]` | "Publique uma evidência" |
| Projetos | Estúdio | `StudioProject[]` | "Crie um projeto" |
| Gravações | Estúdio | `Recording[]` | "Grave uma execução" |
| Partituras | Notação | `Score[]` | "Crie uma partitura" |
| Prática | Prática | `PracticeProfile` + ofensiva | "Comece a praticar" |
| Histórico | Academia | `AcademicHistoryEntry[]` | — |
| Passaportes | Mundos | carimbos por era | "Explore o Atlas" |
| Conquistas | Gamificação | `Badge[]` | "Sua primeira conquista espera" |
| Comunidade | Comunidade | posts + respostas aprovadas | "Participe do fórum" |
| Salas | Salas | matrículas em cátedras | "Encontre uma cátedra" |
| Eventos | Comunidade | inscrições | "Veja os próximos recitais" |
| Cátedra | Docente | salas próprias, alunos, método | só para professores |

**Cada item de evidência exibe:** artefato · motor que o gerou · data · métrica aferida · visibilidade. Sem essa cadeia, o item não é evidência — é alegação.

---

## 4. DONO vs. VISITANTE — `/profile/:userId`

Hoje esta rota **não existe**. É o gap mais grave do domínio: uma rede profissional onde ninguém vê o perfil de ninguém.

| Elemento | Dono | Visitante | Visitante sem login |
| :--- | :---: | :---: | :---: |
| Editar / adicionar | ✓ | — | — |
| Seções privadas | ✓ com selo 🔒 | — | — |
| Painel pessoal no trilho | ✓ | — | — |
| Gerenciar visibilidade | ✓ | — | — |
| Conectar / Seguir | — | ✓ | → login |
| Ver evidências públicas | ✓ | ✓ | ✓ |
| Contato | — | conforme privacidade | — |

A visibilidade por seção (`Público` / `Somente conexões` / `Privado`) já existe em `profile.service` e **precisa ser respeitada na projeção**, não apenas no formulário.

---

## 5. `/profile/portfolio` — Forma B

Vitrine curada, mais visual que o perfil.

```
┌───────────────────────────────────────────────────────────────┐
│ Portfólio de Aline Silva          [Publicar item] [Compartilhar]│
│ [ Todos │ Gravações │ Partituras │ Análises │ Certificados ]  │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12 · grade 3 colunas                 │
│ Tipo · Período   │ ┌──────────┐┌──────────┐┌──────────┐       │
│ Instrumento      │ │  ▶ capa  ││  🎼      ││  📜      │       │
│ Era              │ │ Chaconne ││ Coral    ││ Certif.  │       │
│ Visibilidade     │ │ ▪evidência│ ▪evidência│ ▪verificá.│      │
│                  │ └──────────┘└──────────┘└──────────┘       │
└──────────────────┴────────────────────────────────────────────┘
```
Reordenação por arrastar (dono) · cada item abre em `Modal` *(órfão — 0 usos)* com player real, metadados e proveniência.

---

## 6. `/profile/edit` — Forma A

Formulário em seções espelhando as do perfil, com salvamento por seção (não um botão gigante no fim), pré-visualização de como o visitante vê, e controle de visibilidade ao lado de cada seção.

---

## 7. MATRIZ DE APLICAÇÃO

| Rota | Forma | Trilho | Abas | Situação |
| :--- | :---: | :---: | :---: | :--- |
| `/profile` | C | ✓ | ✓ `Tabs` | existe, sem trilho e com abas manuais |
| `/profile/:userId` | C | ✓ | ✓ | **não existe — criar** |
| `/profile/portfolio` | B | ✓ filtros | ✓ | existe, sem filtros |
| `/profile/edit` | A | — | ✓ seções | existe |

---

## 8. CRUZAMENTOS OBRIGATÓRIOS

| Origem | Destino |
| :--- | :--- |
| Certificado da Academia | Credenciais ✅ *(funciona)* |
| Sessão de Prática | Competências + Prática ✅ *(funciona)* |
| Projeto do Estúdio | Projetos + Gravações ❌ |
| Partitura do Editor | Partituras ❌ |
| Carimbo do Atlas | Passaportes ❌ |
| Post da Comunidade | Atividade + Comunidade ❌ |
| Item do portfólio | Submissão à banca da Sala ❌ |
