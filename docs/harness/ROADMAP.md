# ROADMAP.md — Implementation Order

## Phase 0 — Foundation

- repository;
- AGENTS;
- DESIGN;
- architecture;
- environment;
- CI;
- error handling;
- logging;
- authentication foundation;
- Admin allowlist;
- database foundation;
- API conventions.

## Phase 1 — Identity

Vertical slice:

Cadastro → login → Profile → editar Profile → persistir → logout/login → recuperar Profile.

## Phase 2 — Academy

Vertical slice:

Academia → programa → trilha → curso → módulo → aula → atividade → progresso → conclusão.

## Phase 3 — Evidence / Progression

Adicionar:
- Evidence;
- SkillProgress;
- badges;
- passport;
- profile evidence;
- academic history.

## Phase 4 — Community

Adicionar:
- feed;
- posts;
- forums;
- topics;
- replies;
- connections;
- events;
- moderation.

## Phase 5 — Skill Builder

Começar com um instrumento e poucas habilidades, mas com arquitetura genérica.

Fluxo:

Academy → Skill → Skill Builder → Practice → Result → Evidence → Progress.

Depois abrir:
- central Skill Builder;
- independent practice;
- presets;
- challenges.

## Phase 6 — Music Graph / Worlds

Adicionar:
- composers;
- works;
- periods;
- instruments;
- techniques;
- methods;
- Worlds;
- passports.

## Phase 7 — Score Studio / Interactive Practice

Construir editor/visualizador funcional e integração com engines apropriadas.

## Phase 8 — Instrument Simulators

Criar engine reutilizável de simuladores.

Começar com um instrumento piloto.

## Phase 9 — Voice / Ear Training

Adicionar engines e ferramentas especializadas.

## Phase 10 — Production Studio

Evoluir para ambiente de produção real.

## Phase 11 — Rooms

Professor → Room → course → lesson → material → student → event → community.

## Phase 12 — AI

Recomendação, assistência pedagógica, composição, análise e outras capacidades.

## Phase 13 — Mobile

Mesma identidade/core, com experiências móveis e offline quando apropriado.

## Phase 14 — Hardening

- segurança;
- performance;
- observabilidade;
- backups;
- testes;
- acessibilidade;
- disaster recovery;
- moderation;
- privacy;
- production operations.

## Regra

Cada fase deve entregar um fluxo integrado, não apenas telas.
