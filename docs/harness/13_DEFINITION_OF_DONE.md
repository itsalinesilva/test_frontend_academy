# 13 — DEFINITION OF DONE

A feature is not done when it renders.

## Functional
Happy path; validation; persistence; authorization; loading/empty/error/success/processing/offline states; undo/redo where editing; autosave where relevant; recovery; import/export where category requires it.

## Quality
Unit + integration + contract + E2E + accessibility + performance + security tests appropriate to risk.

## Tool completeness
A tool is complete only when its canonical workflow can be performed end-to-end, results are trustworthy, state survives reload, errors are recoverable, media/notation/audio are handled correctly, and outputs integrate with profile/evidence where relevant.

## Academic
Prerequisites, progression, assessment, feedback, source provenance and completion must be coherent.

## Kids
Guardian controls, safe defaults, age-appropriate language, privacy, moderation and continuity of history.

## Release
No critical security issue; no data-loss path; migrations reversible or backed up; observability present; docs updated; ADR created for architectural change.

A SCREEN IS NOT COMPLETE WHEN:

- it renders;
- it looks polished;
- buttons exist;
- mock data appears.

A SCREEN IS COMPLETE ONLY WHEN:

UI
+
UX FLOW
+
DOMAIN MODEL
+
DATA CONTRACT
+
API
+
BUSINESS LOGIC
+
PERMISSIONS
+
PERSISTENCE
+
ERROR STATES
+
EMPTY STATES
+
LOADING STATES
+
RESPONSIVE BEHAVIOR
+
ACCESSIBILITY
+
ANALYTICS
+
TESTS
+
INTEGRATION
---

## Adendo de 2026-09-18 — o que a auditoria mostrou que faltava aqui

Este documento já dizia que "uma tela não está pronta quando renderiza". O que
faltava era a **lista do que passou mesmo assim** — porque cada item abaixo
atravessou esta definição de pronto sem ser barrado.

### Uma tela não está pronta se

- [ ] **Algum dado que ela mostra está escrito nela.** Conjunto de registros
      com pessoa, data, contagem ou situação vem de repositório. Configuração
      de interface — abas, filtros, itens de menu — é estrutura e mora na tela.
- [ ] **Algum controle não age.** Inclusive o que acende "Salvo!" por três
      segundos sem gravar. Se o recurso não existe, o controle não existe.
- [ ] **Os estados declarados não são alcançáveis pelos dados.** `emptyProps`
      que nunca aparece é decoração.
- [ ] **A rota não declarou audiência** em `audiencia.ts`, com o motivo escrito.
- [ ] **Alguma leitura de dado de aluno não filtra por `userId`.**
- [ ] **Algum privilégio é decidido no cliente.**
- [ ] **Algum campo está sem rótulo, algum botão sem nome, ou algum clicável
      fora do alcance do teclado.**
- [ ] **A tela promete o que curso livre não entrega.**
- [ ] **Há citação de fonte, obra ou instituição.**

### E não está pronta se ninguém rodou

```bash
npm run verificar
```

Ver `35_TEST_STRATEGY.md` para a ordem das camadas, `73_ANTIPATTERNS.md` para
o que cada item acima já custou, e `74_QUALITY_RITUAL.md` para a
periodicidade.

### O que "pronto" nunca significou aqui

**"Pronto" não é "tem dado gravado".** Arquitetura construída, persistência
funcionando e estado vazio honesto é pronto. Dado aparece com o tempo.

Preencher com ficção para parecer cheio não é pronto: é o antipadrão A1.
