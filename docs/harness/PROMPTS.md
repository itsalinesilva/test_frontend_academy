# PROMPTS.md — AI Studio Execution Sequence

## PROMPT 0 — Bootstrap

Leia `README.md`, `AGENTS.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DOMAIN.md`, `ADMIN.md`, `TOOLING.md` e `ROADMAP.md`.

Não implemente ainda a plataforma inteira.

Primeiro:
1. audite o workspace;
2. identifique stack atual;
3. identifique arquivos existentes;
4. identifique dependências;
5. identifique o que é real, parcial, mock ou inexistente;
6. proponha a árvore de implementação;
7. proponha o primeiro vertical slice.

Não invente capacidades existentes.

## PROMPT 1 — Foundation

Implemente somente a fundação:
- React;
- routing;
- Design System;
- API layer;
- Node.js server;
- configuração;
- autenticação;
- PostgreSQL integration;
- migrations;
- logging;
- error handling;
- health check;
- Admin allowlist server-side.

Não construir funcionalidades secundárias ainda.

## PROMPT 2 — Admin

Implemente a superfície Admin inicial.

Os emails administrativos são:
`alinealv.silv@gmail.com`
`office.alinesilva@gmail.com`

A autorização deve ser server-side.

Crie:
- Admin overview;
- users;
- health;
- errors;
- audit;
- basic content management.

Não exponha funções administrativas para usuários comuns.

## PROMPT 3 — Profile

Implemente:

Cadastro → Profile → edição → persistência → login novamente → Profile recuperado.

Uma identidade por usuário.

Prepare as seções:
- formação;
- prática;
- competências;
- instrumentos;
- Worlds;
- credentials;
- Studio;
- Rooms;
- Community.

## PROMPT 4 — Academy

Implemente a arquitetura de formação:

Program → Path → Course → Module → Lesson → Activity.

Inclua:
- catálogo;
- descoberta;
- página de curso;
- matrícula;
- progresso;
- conclusão;
- histórico.

Não transformar automaticamente tudo em cards.

## PROMPT 5 — Skill Builder

Implemente a camada de aplicação do Skill Builder.

Ela deve funcionar:
1. dentro de uma aula/trilha;
2. na Central Skill Builder.

Criar:
- Skill;
- Exercise;
- PracticeSession;
- PracticeAttempt;
- PracticePreset;
- SkillProgress;
- Evidence.

A ferramenta deve ser desacoplada do motor.

## PROMPT 6 — Engine Adapter

Crie a interface de integração para motores especializados.

O Node deve conversar com engines por adapters.

Não implementar um falso motor Python dentro do frontend.

Defina:
- request schema;
- response schema;
- engine status;
- async job;
- timeout;
- error state;
- normalized result.

## PROMPT 7 — Community

Implemente feed, posts, forums, topics, replies, connections e eventos.

Atividades musicais devem poder apontar para:
- course;
- lesson;
- skill;
- work;
- instrument;
- project;
- evidence.

## PROMPT 8 — Worlds

Implemente Worlds e progressão contextual.

Não criar um score absoluto de “melhor músico”.

Use dimensões:
- conhecimento;
- ouvido;
- leitura;
- técnica;
- performance;
- repertório;
- criação;
- produção;
- ensino;
- comunidade.

## PROMPT 9 — Studio split

Separe explicitamente:

Studio
├── Oficina / Skill Builder
└── Production Studio

A Oficina é para desenvolvimento de habilidades.

Production Studio é uma DAW real e será evoluído separadamente.

## PROMPT 10 — Vertical slice audit

Audite o fluxo completo:

Cadastro
→ Profile
→ Academia
→ trilha
→ curso
→ aula
→ Skill Builder
→ prática
→ Evidence
→ Progression
→ Profile.

Reporte:
- frontend;
- backend;
- banco;
- APIs;
- entidades;
- eventos;
- segurança;
- testes;
- gaps.

Não declarar sucesso somente pelo preview.
