# 66 · Biblioteca de casos de teste

> A versão anterior deste documento listava casos **desejados** (T01…T74) sem
> dizer quais existiam. Isto é um inventário do que **existe e roda**, mais o
> que falta — com a distinção explícita, porque confundir as duas coisas é o
> antipadrão F1 dentro do documento que deveria preveni-lo.
>
> Estratégia e ordem: `35_TEST_STRATEGY.md`. Antipadrões: `73_ANTIPADROES.md`.

---

## Como um caso é escrito aqui

```ts
it('o domínio de habilidade de Ana não aparece para Bruno', async () => {
  /**
   * REGRESSÃO — `listMasteriesByUser(_userId)` recebia o identificador,
   * ignorava, e devolvia a tabela inteira. Quem abrisse o Practice depois
   * de Ana veria o desempenho dela por habilidade.
   */
```

Três regras:

1. **O nome descreve o comportamento**, em português, na voz de quem usa. Não
   "testa isolamento": *"o domínio de habilidade de Ana não aparece para Bruno"*.
2. **O comentário conta o defeito real**, não a categoria. É o que impede
   alguém apagar o caso numa refatoração por não entender para que servia.
3. **Regressão é marcada.** Quem lê sabe que aquilo já quebrou uma vez.

---

## Inventário — o que existe

### Verdade do produto · `tests/pente-fino.test.ts`

Roda o pente fino inteiro dentro da suíte. 26 casos: um por verificação
bloqueante, mais os tetos de acessibilidade e a cobertura de rotas.

Trava em zero: dado fabricado, conjunto de dados na tela, botão falso, sucesso
sem efeito, vazamento por leitura sem filtro, privilégio no cliente, dado no
console, injeção de HTML, promessa de titulação, ressalva de curso livre,
tela órfã, destino de navegação inexistente, mojibake, marcador inacabado,
markdown quebrado, e as quatro de acessibilidade.

### Identidade e autoridade · `tests/server-authority.test.ts`

| Responde |
|---|
| Assinatura RS256 do token contra o JWKS do Google, com `iss`/`aud`/`exp`/`nonce` |
| Recusa de confusão de algoritmo |
| Allowlist vazia ⇒ nenhum administrador |
| Falha de rede ⇒ **nega**, nunca libera |
| Nenhum caminho concede papel a partir de e-mail do cliente |

### Rotas e audiência · `tests/audiencia-das-rotas.test.ts`

| Responde |
|---|
| Vence o prefixo mais específico — `/academy` pública, `/academy/meu-aprendizado` não |
| Verificar credencial é público; as credenciais do aluno não |
| Quem entrou não fica preso na tela de entrar |
| Rota desconhecida é pública, e a auditoria acusa a omissão |
| Toda regra explica **por que** existe |
| Nenhuma tela órfã · nenhuma vaza conteúdo de logado |

### Persistência e isolamento · `tests/persistencia-e-isolamento.test.ts`

13 casos. Grava com uma instância, lê com outra — o mais perto de recarregar.

| Responde |
|---|
| Progresso, avaliação e frequência sobrevivem |
| Gravar de novo atualiza, não duplica |
| **Republicar o catálogo não apaga progresso** |
| Progresso, domínio de habilidade, sessão, avaliação e frequência de Ana não aparecem para Bruno |
| Conta nova no Practice tem sequência **zero** — regressão da semente fabricada |
| Meta do dia tem alvo, cumprimento zero |
| Ranking sem participante que a plataforma não tem |

### Fluxos e comunicação · `tests/fluxos-da-plataforma.test.ts`

21 casos. Percursos encadeados e o que não pode atravessar entre papéis.

| Grupo | Responde |
|---|---|
| Percurso do aluno | Histórico acompanha o percurso · prova reprovada não certifica · tudo sobrevive ao F5 |
| Vazamento aluno ↔ aluno | Progresso, submissões, certificados e histórico não atravessam · nome não vaza em certificado alheio |
| **Aluno ↔ administração** | A auditoria **não guarda o conteúdo do estudo** · correção editorial e progresso em chaves separadas · a edição leva o nome de quem editou |
| Comunidade | Tópico e resposta persistem, contagem é **contada** · inscrição idempotente · cancelar a de um não cancela a do outro |
| Docente | Sala criada aparece no diretório e é alcançável pelo endereço · nasce com zero, não com número bonito · "minhas turmas" filtra |
| Coerência de rota | O que o aluno produz exige login; o que a instituição publica, não |

### Edição editorial · `tests/edicao-editorial.test.ts`

17 casos. Responde à pergunta: *"vejo um erro gramatical, conserto, e isso
atualiza o livro?"*

| Responde |
|---|
| A correção troca o bloco certo, e só ele |
| Corrigir duas vezes deixa **uma** edição |
| Desfazer devolve o texto **publicado**, não a correção anterior |
| Toda leitura de lição já vem corrigida |
| **A correção sobrevive à republicação do catálogo** |
| O livro da biblioteca sai com a correção, sem segunda etapa |
| Prosa, destaque, verificação e lâminas são editáveis; laboratório, pauta e diagrama não |
| O livreto — exercícios, simulados e provas — grava e volta |

### Coesão de conteúdo · `tests/integridade-do-academy.test.ts`

| Responde |
|---|
| Todo curso tem módulos, lições e livreto, em número igual |
| Nenhuma lição sem conteúdo nem sem checkpoint · nenhuma é casca |
| **O capítulo N do livreto é o capítulo N do curso** — regressão dos 16 desalinhados |
| A competência cobrada é ensinada pelo curso |
| Simulado e prova só usam questões do próprio livreto |
| O livro cobre todos os capítulos · a biblioteca reflete o catálogo atual |
| **Nenhuma citação de fonte externa** |

### Domínio

| Arquivo | Responde |
|---|---|
| `carga-horaria.test.ts` | A carga é medida: 160 palavras/min, minutos por bloco, 3–5 min por questão |
| `booklet.test.ts` | Cobertura de competência antes de completar · sorteio determinístico |
| `frequencia-e-avaliacoes.test.ts` | Semana fecha · dia futuro não é falta · sequência não quebra à meia-noite |
| `avaliacao-dos-cursos.test.ts` | Média de lista vazia é `null`, nunca `0` |
| `kids-account.test.ts` | Derivação de senha infantil, com o custo que a encarece |

### Interface · `tests/ui/`

| Arquivo | Responde |
|---|---|
| `page-layout.test.tsx` | As seis formas canônicas · marcos de acessibilidade |
| `header-search.test.tsx` | A lupa abre, foca, **o que se digita aparece**, e submeter busca |
| `shell-e-catalogo.test.tsx` | Cartão de curso abre a lista ali mesmo · Explorar só com os nove pilares |
| `avaliacoes-e-explorar.test.tsx` | Estrelas são um `radiogroup` navegável · o formulário exige nota e comentário |
| `lesson-blocks.test.tsx` | A análise do laboratório vem do motor real, e só quando pedida |

---

## O que falta — e é pendência, não lacuna silenciosa

| # | Caso | Por que ainda não existe |
|---|---|---|
| F-01 | Cópia de segurança no Drive, de ponta a ponta | Exige conta Google real · bloqueado por `G.1` do TODO |
| F-02 | Restauração a partir da cópia | O caminho inverso não existe no produto |
| F-03 | Exportar e apagar todos os dados (LGPD) | Recurso não implementado |
| F-04 | Comportamento em navegador real | jsdom não tem layout nem som — roteiro manual em `74` §4 |
| F-05 | Largura de telefone e alvo de toque | Nenhuma verificação toca nisso |
| F-06 | Revisão gramatical dos 126 capítulos | Nenhuma ferramenta daqui confere concordância nem coesão |
| F-07 | Correção **musical** do conteúdo | Exige leitura de quem entende de música |
| F-08 | Contraste e hierarquia visual | Exige olho humano |
| F-09 | `navigate(variavel)` | Só destinos literais são conferidos |
| F-10 | Fila de moderação do fórum | Recurso não implementado |

---

## Rodar

```bash
npm test
npx vitest run tests/fluxos-da-plataforma.test.ts
npx vitest run tests/edicao-editorial.test.ts
npm run verificar
```
