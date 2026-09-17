# 01 — PRODUCT SYSTEM / CAPABILITY MAP

## 1. Sistemas de produto
| Sistema | Função | Benchmark funcional | Saída principal |
|---|---|---|---|
| Academy | Formação | Coursera | competência, completion, certificate |
| Worlds | exploração musical | atlas/encyclopedia/game layer | passport, discovery, context |
| Community | participação | rede social + fóruns | posts, topics, connections, reputation |
| Studio Lab | oficina/skill builder | ferramentas de prática | attempts, skill evidence |
| Production Studio | criação/produção | DAW | projects, recordings, mixes |
| Rooms | ensino/comunidade | Skool | courses, classes, events |
| Profile | identidade | LinkedIn-like | CV, portfolio, history |

## 2. Objetos transversais
User, Profile, Role/Title, Skill, Course, Path, World, Passport, Badge, Credential, Microcredential, Work, Composer, Instrument, Exercise, Attempt, PracticeSession, Evidence, Artifact, Project, Room, School, Post, Forum, Topic, Event, Connection, Ranking, Notification, Entitlement.

## 3. Regra de integração
Qualquer atividade relevante deve produzir um evento de domínio. Ex.: `exercise.completed`, `course.completed`, `practice.recorded`, `artifact.published`, `credential.issued`, `room.joined`. Eventos alimentam progressão, analytics, perfil e comunidade sem duplicar lógica.

## 4. Capabilities
`academy.learn`, `practice.basic`, `studio.basic`, `studio.production.full`, `teacher.room.create`, `teacher.room.manage`, `admin.*`. Entitlements são avaliados no backend. O frontend só reflete estado autorizado.

## 5. Navegação principal
Desktop: Academy | Worlds | Community | Studio | Rooms | Profile. Admin aparece somente a administradores. Mobile usa navegação contextual com as mesmas áreas canônicas.
