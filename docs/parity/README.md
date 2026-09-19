# Paridade — índice

Documentação do que as plataformas de referência fazem, e do que o
Conservatório adota.

| Volume | Referência | Cobre | Base |
|---|---|---|---|
| `VOL1_COURSERA.md` | Coursera | Aprendizagem estruturada: catálogo, curso, progresso, avaliação, certificado | Auditoria do código |
| `VOL2_ASTRA_DUOLINGO.md` | Astra Trainer · Duolingo | Prática, progressão, competição, Atlas | **Capturas de tela reais, 18/09/2026** |

## A diferença entre os dois, e por que ela está escrita

O Volume 1 foi redigido **de memória, sem acesso à plataforma de
referência**, e afirmou paridade que não podia ter sido verificada. Ele
continua útil — a coluna "onde está no código" foi conferida arquivo a
arquivo —, mas a coluna de comparação com o Coursera é reconstrução, não
observação.

O Volume 2 descreve **o que aparece numa captura**. Onde não há captura,
está escrito que não há.

## Regra

> Paridade não se declara: mede-se.

`npm run measure:parity` conta estrutura declarada. `npm run qa` verifica que
a tela não mente. Nenhum dos dois diz que a tela está boa — isso é leitura
humana, e o roteiro está em `docs/harness/74_QUALITY_RITUAL.md` §4.

## Documentos ligados

- `docs/harness/75_ATLAS_TAXONOMY.md` — o catálogo de termos
- `docs/harness/76_PROGRESS_ECONOMY.md` — onde e como se conta
- `CLAUDE_TODO.md` seção **T** — o que fazer, em ordem
