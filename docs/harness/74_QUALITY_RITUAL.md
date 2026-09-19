# 74 · Ritual de qualidade

> Como a verificação deste projeto **acontece periodicamente**, sem depender
> de alguém lembrar, e sem ficar mais cara conforme a plataforma cresce.
>
> Comando único: `npm run verificar`.

---

## Por que isto é um documento, e não um hábito

Hábito não escala e não sobrevive a troca de quem trabalha. O que este projeto
já viveu:

- três cursos inventados ficaram meses no catálogo porque ninguém procurou;
- um vazamento de dado entre alunos esteve no código até uma verificação
  automática perguntar "esta leitura filtra por `userId`?";
- uma tela de auditoria de segurança relatou um ataque inexistente até alguém
  ler o arquivo linha a linha.

Nenhum desses foi encontrado olhando tela. Todos foram encontrados quando
**passou a existir uma pergunta escrita** que alguém — ou algo — faz sempre.

---

## 1 · A cada alteração · automático

Roda sozinho. Nada a lembrar.

| Quando | O quê |
|---|---|
| Ao salvar | `tsc` no editor |
| Antes de terminar um trecho | `npm run verificar` |
| No `npm run build` | `tsc` · `vite build` · segredos · citações · pente fino |

`npm run verificar` passa inteiro, ou o trecho não terminou.

---

## 2 · A cada entrega · 10 minutos

Depois de `npm run verificar`, ler o relatório do pente fino — não só o
código de saída.

```bash
npm run qa
```

Três perguntas, nesta ordem:

1. **Algum número subiu?** Os tetos estão travados na suíte, mas ler o
   relatório mostra *onde* a dívida se concentra antes de virar quebra.
2. **Alguma verificação virou `ok` sem eu ter feito nada?** Pode ser progresso
   de outro trecho — ou pode ser a verificação tendo parado de enxergar. Já
   aconteceu: a leitura de atributos parava no `>` dentro de `(e) =>` e
   escondia cinquenta e nove achados.
3. **O que mudou tem antipadrão novo?** Se sim, entra em `73_ANTIPATTERNS.md`
   com o que custou, e ganha verificação.

### Registro

- `CLAUDE_STATE.md` — o estado agora
- `CLAUDE_AUDIT.md` — achados novos
- `CLAUDE_TODO.md` — pendências **medidas**, nunca estimadas

---

## 3 · A cada bloco de trabalho · 30 minutos

Um bloco é uma área fechada — Academy, Practice, Community.

```bash
npm run verificar
node scripts/auditar-rotas.mjs
npm run measure:parity
```

**Conferir:**

- [ ] Toda rota nova declara audiência em `audiencia.ts`, **com o motivo escrito**
- [ ] Todo defeito encontrado virou caso de teste, e o comentário descreve **o defeito**, não a correção
- [ ] Nenhuma tela nova escreve dado dentro de si
- [ ] Todo controle novo age de verdade
- [ ] Os quatro estados da tela são alcançáveis pelos dados
- [ ] O que ficou por fazer está no TODO, com número medido

---

## 4 · A cada marco · 2 horas · **manual**

> Esta é a passagem que **nenhum comando faz**, e é a que pegou o pior defeito
> do projeto.

Os testes rodam em jsdom, que não tem layout, não calcula `scrollLeft` e não
toca som. O campo de busca do cabeçalho ficava com o texto empurrado para fora
da vista durante a animação de largura — **não reproduzível em jsdom**. Só
apareceu abrindo o navegador.

### Roteiro

```bash
npm run dev
```

**Percurso do visitante** — janela anônima, sem sessão

1. Home — o que o visitante lê é sobre conhecer e se inscrever?
2. Catálogo → curso → grade. Nenhuma frase fala com quem não entrou?
3. Tentar `/academia/meu-aprendizado` — o convite aparece e o endereço se mantém?
4. Verificar uma credencial por código — abre sem conta?

**Percurso do aluno** — sessão iniciada

5. Entrar. Perfil e onboarding.
6. Matricular, abrir lição, concluir. **Recarregar a página**: o progresso ficou?
7. Simulado e prova. Ver a nota. Abrir o histórico.
8. Avaliar o curso. Ver a avaliação com o próprio nome.
9. Abrir tópico no fórum, responder. Inscrever-se num evento.

**Percurso do editor** — sessão administrativa

10. Abrir uma lição, clicar no lápis de um parágrafo, corrigir, salvar.
11. Ir à Biblioteca — **o livro saiu com a correção?**
12. Desfazer a correção. O texto publicado voltou?
13. Editar o livreto. Reabrir. A alteração ficou?

**Isolamento** — duas contas no mesmo navegador

14. Sair. Entrar com outra conta.
15. **O progresso, o histórico e os certificados da primeira sumiram da tela?**

**Interface**

16. Percorrer três telas **só com o teclado**. Chega em tudo? O foco é visível?
17. Estreitar a janela para largura de telefone. Alguma coisa vaza para os lados?
18. Abrir uma tela com armazenamento vazio. O estado vazio aparece e **diz o
    que existe no lugar**?

**Registrar o que for encontrado em `CLAUDE_TODO.md`, com a tela e o passo.**

---

## 5 · A cada release · 4 horas

Além de tudo acima:

- [ ] Gates de `43_RELEASE_GATES.md`
- [ ] `npm run build` limpo, incluindo segredos e citações
- [ ] **Cópia de segurança no Drive, de ponta a ponta** — a única defesa contra
      perda total ao limpar o navegador, e o item que mais tempo ficou sem ser
      verificado
- [ ] Restauração a partir da cópia
- [ ] Certificado impresso: nome institucional certo, ressalva de curso livre
      presente, verificação por código funcionando
- [ ] Revisão humana do texto novo — **nenhuma ferramenta daqui confere
      concordância, regência ou coesão**

---

## 6 · Quando a plataforma crescer

O custo não pode crescer junto. Três regras que mantêm isto barato:

### Verificação nova sempre que um antipadrão novo aparecer

O caminho é: defeito → antipadrão em `73_ANTIPATTERNS.md` → checador em
`scripts/qa/` → caso em `tests/pente-fino.test.ts`.

Foi assim que nasceram as verificações de conjunto de dados na tela, botão
falso em objeto de ação e sucesso sem efeito — **nenhuma delas foi imaginada;
todas vieram de um achado real**.

### Teto que só desce

A dívida é contada, não escondida. `tests/pente-fino.test.ts` trava cada
verificação num número medido; baixá-lo registra progresso, subi-lo quebra a
suíte, e a mensagem diz de quanto para quanto e em qual arquivo.

Travar em zero antes de a correção existir transformaria a suíte em mentira —
que é o problema que o ritual inteiro existe para corrigir.

### O relatório tem de continuar confiável

Verificação que acusa código correto ensina a ignorar o relatório. Antes de
confiar numa nova, rodá-la contra trecho **que se sabe certo** e exigir
silêncio.

---

## 7 · O que este ritual não cobre

Está em `72_QUALITY_SWEEP.md` e em `35_TEST_STRATEGY.md` §5. Em
resumo: gramática de verdade, correção musical do conteúdo, aparência,
mobile, e a cópia no Drive — que depende de conta Google real.

**Declarar isso faz parte do ritual.** Um processo que não diz o próprio
limite produz exatamente a falsa segurança que ele deveria evitar.

---

## Resumo

| Cadência | Tempo | Comando | Pega |
|---|---|---|---|
| A cada alteração | 0 | automático | forma |
| A cada entrega | 10 min | `npm run verificar` + ler `qa` | mentira do produto, regressão |
| A cada bloco | 30 min | + auditoria de rotas e paridade | estrutura, cobertura |
| A cada marco | 2 h | **manual, no navegador** | o que jsdom não alcança |
| A cada release | 4 h | + gates + Drive + revisão humana | perda de dado, texto |
