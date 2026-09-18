# 40 · Agentes — papéis e regras universais

> **Os contratos operacionais são dois, e este documento não os substitui:**
>
> - `HARNESS_CLAUDE.md` — agente conversacional, com terminal
> - `HARNESS_AI_STUDIO.md` — geração assistida, sem o repositório em mãos
>
> Aqui ficam os papéis e as regras que valem para qualquer um dos dois.

---

## Papéis

Um mesmo agente costuma vestir vários. O que importa é saber **o que cada
papel protege**, para reconhecer quando se está passando por cima dele.

| Papel | Protege |
|---|---|
| Arquiteto | Os contratos |
| Produto | Os fluxos de quem usa |
| Interface | O sistema de design |
| Domínio | A regra e a persistência |
| Motor | A correção musical e de sinal |
| Qualidade | Tenta quebrar |
| Segurança | Modela a ameaça |
| Conteúdo | Proveniência e propriedade intelectual |
| Publicação | Reprodutibilidade |

---

## Regras universais

1. Ler os documentos da área **antes** de escrever.
2. Procurar antes de criar.
3. Reaproveitar abstração existente.
4. Nunca duplicar entidade de domínio dentro de uma funcionalidade.
5. Nunca contornar autorização.
6. Nunca mudar contrato em silêncio.
7. **Nunca marcar como completo o que não foi verificado.**
8. Testar antes e depois.
9. Documentar mudança arquitetural.
10. Deixar o repositório melhor do que encontrou.

### As cinco que este projeto aprendeu errando

11. **Não inventar dado para preencher tela.** Foi o defeito mais caro daqui:
    três cursos inventados, uma semana de estudo que ninguém fez, um ataque
    que nunca houve. Ver `73_ANTIPADROES.md` §A1.
12. **Não desenhar controle que não age** — e muito menos um que *afirme* ter
    agido. §A2, §A3.
13. **Não remover o que não foi pedido.** Auditoria produz diagnóstico, não
    demolição. Um trilho lateral inteiro já sumiu numa limpeza não solicitada.
14. **Não baixar o rigor para o teste passar.** As iterações do PBKDF2 das
    contas infantis são lentas de propósito.
15. **Não escrever verificação que acuse código correto.** Relatório em que
    ninguém confia não protege nada — e no dia em que acusar o defeito de
    verdade, vai ser ignorado junto. §F2.

---

## Faça

Esquema tipado · commits pequenos · sinalizador de funcionalidade · fixture ·
adaptador · versão de dependência fixada · componente acessível · teste
determinístico · estado vazio que **diz o que existe no lugar**.

## Não faça

Papel de usuário no código · segredo no código · saída de motor fabricada ·
cópia de interface de concorrente · bloco enorme de dado dentro de componente ·
remoção silenciosa de funcionalidade pedida · segunda fonte de verdade ·
persistência paralela.

---

## Relatório de conclusão

Obrigatório, e nesta ordem:

1. **Arquivos alterados**
2. **Contratos usados**
3. **Testes rodados** — com a saída, não com "deve passar"
4. **Limitações conhecidas**
5. **O que NÃO foi verificado**, e por quê
6. Dependências novas · licença a revisar · migrações
7. Rotas validadas

A classificação de capacidade é obrigatória:

`VERIFIED` · `EXISTING` · `PARTIAL` · `FRONT_ONLY` · `BACK_ONLY` ·
`EXTERNAL_ENGINE` · `MOCK` · `MISSING` · `UNVERIFIED`

**`UNVERIFIED` não vira `EXISTING` em silêncio.**
