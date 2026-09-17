# AGENTS.md — Canonical Agent Harness v1

Este arquivo é o contrato operacional para qualquer agente de IA que leia, altere, refatore ou implemente o projeto.

## 1. Fonte de verdade

A ordem de autoridade é:

1. código existente e contratos realmente presentes no workspace;
2. arquivos canônicos deste pacote;
3. decisões arquiteturais aprovadas durante o projeto;
4. documentação de produto;
5. referências externas;
6. preview visual.

Preview nunca é fonte de verdade arquitetural.

## 2. Regra contra invenção

O agente NÃO deve afirmar que uma capacidade existe sem evidência.

Classificações permitidas:
- VERIFIED
- EXISTING
- PARTIAL
- FRONT_ONLY
- BACK_ONLY
- EXTERNAL_ENGINE
- MOCK
- MISSING
- UNVERIFIED

UNVERIFIED não pode ser promovido silenciosamente para EXISTING.

## 3. Regra contra reconstrução destrutiva

Não:
- substituir uma implementação existente sem auditoria;
- apagar componentes funcionais para simplificar;
- trocar contratos sem declarar;
- duplicar entidades;
- criar persistência paralela;
- transformar uma integração externa em mock permanente;
- recriar motores especializados de baixa qualidade;
- criar uma segunda regra de negócio no frontend.

## 4. AI Studio

O AI Studio é uma superfície de construção e aceleração.

Ele pode implementar o frontend e a camada Node.js inicial.

Não tentar forçar toda a arquitetura Python para dentro do runtime Node.

Quando uma capacidade exigir motor Python:
- criar contrato;
- criar adapter;
- criar interface de serviço;
- manter fallback explícito apenas para desenvolvimento;
- marcar a implementação externa como dependência real.

## 5. Vertical slices

Sempre implementar por fluxo completo.

Um vertical slice deve atravessar, quando aplicável:

UI → API → domínio → persistência → resultado → Evidence → Progression → Profile.

Não construir dezenas de telas isoladas.

## 6. Não mockar produção

Mocks são permitidos em:
- testes;
- fixtures;
- desenvolvimento explicitamente identificado.

Não são permitidos como substituto permanente de:
- autenticação;
- banco;
- progresso;
- perfil;
- comunidade;
- ferramentas;
- engines;
- permissões.

## 7. Identidade

A identidade autenticada deve ser resolvida server-side.

Nunca confiar em:
- ownerId enviado pelo cliente;
- role enviado pelo cliente;
- isAdmin enviado pelo cliente;
- entitlement enviado pelo cliente.

## 8. Admin

A allowlist inicial é:

- `alinealv.silv@gmail.com`
- `office.alinesilva@gmail.com`

A decisão administrativa deve ocorrer no servidor.

O frontend apenas reflete o estado autorizado.

Admin deve possuir:
- dashboard operacional;
- usuários;
- conteúdo;
- cursos;
- trilhas;
- atividades;
- Community;
- Rooms;
- ferramentas;
- jobs;
- engines;
- logs;
- erros;
- métricas;
- health;
- permissões;
- entitlements;
- auditoria;
- configurações operacionais.

## 9. Design

Não redesenhar uma tela apenas porque uma alternativa parece mais moderna.

Não criar:
- cards sem função;
- CTAs artificiais;
- títulos redundantes;
- elementos decorativos sem significado;
- dashboards genéricos;
- gradientes chamativos;
- gamificação visual exagerada.

A função determina a interface.

## 10. Mudança arquitetural

Antes de uma alteração estrutural, registrar:
- problema;
- estado atual;
- conflito;
- decisão;
- impacto;
- migração;
- compatibilidade.

## 11. Relatório obrigatório

Depois de cada implementação:
- arquivos alterados;
- arquivos criados;
- arquivos removidos;
- endpoints;
- entidades;
- migrations;
- frontend;
- backend;
- motores externos;
- autenticação;
- autorização;
- testes;
- observabilidade;
- riscos;
- gaps.

## 12. Definition of Done

Uma funcionalidade não está pronta apenas porque compila ou aparece no preview.

Quando aplicável, deve ter:
- comportamento;
- persistência;
- API;
- segurança;
- autorização;
- estados de erro/loading;
- testes;
- observabilidade;
- documentação;
- integração com o ecossistema.

## 13. Stop conditions

Parar e reportar quando:
- o agente não consegue identificar o código que está modificando;
- existe conflito de contrato não resolvido;
- a implementação exige inventar uma API;
- a solução degrada uma capacidade existente;
- o agente precisaria fingir que um motor externo está integrado;
- uma alteração destrói o Design System sem justificativa.

Princípio final:

AUDITAR → CLASSIFICAR → PLANEJAR → IMPLEMENTAR → TESTAR → REPORTAR.
