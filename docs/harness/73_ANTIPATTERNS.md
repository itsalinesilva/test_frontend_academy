# 73 · Antipadrões — o que não pode voltar

> Cada item deste catálogo **aconteceu neste repositório**. Não é lista de boas
> práticas genéricas: é o registro do que já foi construído errado, do estrago
> que causou, e da verificação que hoje impede a reincidência.
>
> Quem for implementar qualquer coisa aqui — pessoa ou agente — lê este
> documento antes. É mais curto que consertar depois.

---

## Como ler

Cada antipadrão tem quatro partes, e as quatro importam:

| Campo | Para quê |
|---|---|
| **O que é** | O padrão, descrito de forma reconhecível |
| **O que custou** | O caso real. Sem isto vira regra arbitrária e alguém "abre uma exceção" |
| **O certo** | O que fazer no lugar |
| **Quem vigia** | A verificação automática. Se não houver, está escrito que não há |

---

# A · Mentira do produto

> Esta família é a mais cara, porque **compila, passa no lint e a tela abre**.
> Nenhuma ferramenta de linguagem pega. Só uma verificação que pergunte "onde
> a tela está afirmando o que o produto não faz".

## A1 · Dado fabricado apresentado como real

**O que é.** Escrever registros no código da tela — pessoas, datas, contagens,
eventos — e desenhá-los como se viessem do produto.

**O que custou.**

- Três cursos inventados no catálogo, atribuídos a uma "Profa. Dra. Clara
  Schumann" — que morreu em 1896 — com retrato de banco de imagens.
- Conta recém-criada abria o Practice e via **sete dias de sequência de
  estudo que a pessoa não fez**, meta do dia com 18 dos 20 minutos cumpridos,
  e um ranking encabeçado por Bach.
- Todo perfil da plataforma exibia um recital no Theatro Municipal e uma
  gravação de Bach ao cravo francês em abril de 2024.
- `course.repository.ts`: **197 linhas de catálogo paralelo inventado que
  nenhuma tela consumia**. Existia, dava trabalho de manter, e mentia.
- A tela de auditoria de segurança relatava **uma tentativa de acesso não
  autenticado que nunca ocorreu**. Num painel de auditoria, evento inventado
  não é enfeite: é a informação em que alguém decide se houve incidente.

**O certo.** Dado mora em repositório. A tela lê. Quando não há nada, a tela
diz que não há — e diz bem. Vazio é informação correta, e é o que faz o
primeiro registro real significar alguma coisa.

> **Não vale o argumento "é só enquanto não tem dado".** Foi exatamente esse
> argumento que produziu todos os casos acima, e nenhum deles foi removido
> depois — ficaram até alguém procurar.

**Quem vigia.** `npm run qa` → `nenhum conjunto de dados escrito na tela` e
`nenhum dado fabricado no catálogo`. A primeira é a geral: acusa vetor de
objetos com campo de pessoa, data, contagem ou situação dentro de um `.tsx`.

---

## A2 · Botão falso

**O que é.** Controle que não age. Três formas, em ordem crescente de dano:

1. `onClick` vazio — não faz nada;
2. `onClick={() => alert('…')}` — abre um diálogo do navegador dizendo o que
   faria;
3. **o que afirma ter feito** — `alert('Inscrição confirmada')`,
   `alert('Registros sincronizados')`, `alert('Diagnóstico executado: todos
   os 4 motores responderam')`.

**O que custou.** Dezesseis ocorrências. A terceira forma é a grave: o aluno
lê "inscrição confirmada", fecha a aba, e não está inscrito em nada. O produto
não deixou de fazer — **mentiu dizendo que fez**.

**O certo.** Ou o controle age, ou sai da tela. Se o recurso ainda não existe,
o controle não existe, e o recurso vira linha em `CLAUDE_TODO.md`. Uma tela
com menos botões e nenhum mentiroso é melhor que o contrário.

**Quem vigia.** `npm run qa` → `nenhum botão falso`. Cobre `onClick={}` em JSX
e `onClick:` em objeto de ação — a segunda escapava, e era onde estavam os
alertas das ações principais das telas de administração.

---

## A3 · Sucesso sem efeito

**O que é.** A versão silenciosa do A2, e por isso mais difícil de ver. O
controle não abre alerta nenhum: acende um "Salvo!" verde por três segundos e
apaga.

**O que custou.** `handleSaveScore` era literalmente `setIsSaved(true)` seguido
de um `setTimeout` que desfazia. Para quem usa, **indistinguível de ter
salvado** — até voltar e não encontrar nada.

Do mesmo tipo: `CreateRoomScreen` chamava `setTimeout(400)`, escrevia
"Registrando sala…" e navegava de volta sem gravar. O professor voltava ao
diretório e a sala não estava lá.

**O certo.** Quem grava chama alguém — repositório, serviço ou rede. Estado de
sucesso é **consequência** da gravação, nunca substituto dela.

**Quem vigia.** `npm run qa` → `nenhum sucesso anunciado sem efeito`. O sinal
é: a função marca sucesso e não chama repositório, serviço nem rede.

---

## A4 · Ferramenta de desenvolvimento em produção

**O que é.** Afordância feita para o time ficar visível para quem usa.

**O que custou.** O inspetor de estados do `ScreenContainer` aparecia em
**toda tela publicada**, com o rótulo "Estados UI (populated)" e uma barra
para forçar erro, vazio e sucesso. O aluno via — e podia acionar — um painel
de depuração.

**O certo.** `import.meta.env.DEV`. E o mesmo vale para a conta local de
desenvolvimento, que só existe quando `DEV && !isGoogleSignInConfigured()` e
**nunca** recebe privilégio administrativo.

**Quem vigia.** Nada automático ainda. Está aberto em `CLAUDE_TODO.md`.

---

## A5 · Painel que responde sem consultar

**O que é.** Indicador de saúde, status ou métrica que sempre diz "está tudo
bem", sem medir nada.

**O que custou.** A tela de motores reportava "Motor de Áudio v1.8.2, 4,8 ms,
99,8%" — de componentes que não reportam versão, um deles citando uma
biblioteca que o projeto nem usa. O botão "Executar diagnóstico geral"
respondia com um alerta sem consultar coisa alguma. A Central de Ajuda tinha
um retângulo verde: "Todos os serviços operando · Status 100% Online".

**O certo.** Ou mede de verdade, ou não existe. A tela de motores virou um
**diagnóstico de capacidades**: verifica, neste navegador e na hora, se há
WebAudio, microfone, Web Crypto e armazenamento local — coisas que dá para
medir e das quais a plataforma de fato depende.

**Quem vigia.** Parcialmente, `nenhum sucesso anunciado sem efeito`. O caso
geral exige leitura humana.

---

# B · Vazamento e autoridade

> O produto não tem banco de dados: tudo vive no `localStorage` de um
> navegador **que pode ser compartilhado**. Computador de casa, de escola ou
> de biblioteca é dividido. Esta família descreve o modo de falha natural
> dessa arquitetura.

## B1 · Leitura de dado de aluno sem filtrar por usuário

**O que é.** Método que recebe `userId` e devolve a coleção inteira.

**O que custou.** `listMasteriesByUser(_userId)` — o sublinhado denuncia:
recebia o identificador, **ignorava**, e devolvia o domínio de habilidade de
todo mundo que já usara aquele navegador. Não precisa de ataque nenhum para
isso vazar: basta a segunda pessoa usar o produto.

**O certo.** Toda leitura de chave de aluno filtra por `userId`. Sem exceção,
inclusive quando "só tem um usuário mesmo".

**Quem vigia.** `npm run qa` → `leitura de dado de aluno filtra por usuário`.
E `tests/persistencia-e-isolamento.test.ts` prova, caso a caso, que o dado de
Ana não aparece para Bruno.

---

## B2 · Privilégio decidido no cliente

**O que é.** Comparar e-mail, papel ou qualquer estado local para liberar
acesso administrativo.

**O que custou.** Auditoria S-02: o repositório de usuários provisionava um
ADMIN só de ver um e-mail da lista de fundadoras. Quem editasse o
`localStorage` virava administrador.

**O certo.** A allowlist é **variável de ambiente do servidor**. A sessão traz
`isAdmin` porque o servidor a assinou. O cliente lê esse campo e nada mais.
Allowlist vazia ⇒ nenhum administrador.

> Exibir o papel não é conceder: `<Badge variant={u.role === 'ADMIN' ? …}>`
> dentro de um console que a sessão já protegeu é legítimo. O perigo é a
> comparação **abrir caminho** — dentro de `if`, antes de um `&&` que decide o
> que renderizar, ou atribuindo `isAdmin`.

**Quem vigia.** `npm run qa` → `privilégio de admin não é decidido no cliente`,
e `tests/server-authority.test.ts`.

---

## B3 · Publicar conteúdo apagando dado de gente

**O que é.** Reescrever chaves de armazenamento numa migração sem separar o
que é **conteúdo publicado** do que é **produzido por alguém**.

**O que custou.** Duas vezes, em direções opostas:

1. O catálogo só era gravado quando a chave faltava. Resultado: três cursos
   apagados do código **continuavam na tela para sempre**, porque a chave já
   estava lá. Foi preciso versionar e reescrever.
2. A correção criou o risco inverso. `conteudoPublicado()` reescreve `LESSONS`
   a cada versão — e a versão sobe **a cada alteração de conteúdo**. Uma edição
   editorial gravada ali morreria na publicação seguinte. Bastaria publicar um
   capítulo novo em qualquer curso para apagar, em silêncio, toda a revisão
   gramatical já feita.

**O certo.** Três categorias de chave, e elas nunca se misturam:

| Categoria | Exemplos | A publicação pode reescrever? |
|---|---|---|
| **Conteúdo publicado** | cursos, módulos, lições, atividades | **Sim** — é para isso que existe |
| **Dado do aluno** | progresso, tentativas, certificados, histórico, frequência | **Nunca** |
| **Trabalho editorial** | correções de texto, livretos | **Nunca** |

A camada editorial aplica a correção **por cima** do publicado na leitura, em
chave própria (`amd_academy_editorial_v1`) que a publicação não conhece.

**Quem vigia.** `npm run qa` → `publicar conteúdo não apaga dado do aluno`.
`tests/edicao-editorial.test.ts` e `tests/persistencia-e-isolamento.test.ts`
provam que correção e progresso sobrevivem à republicação.

---

## B4 · Dado pessoal no console

**O que é.** `console.log(user)`, `console.error(session)`.

**O certo.** Registrar a mensagem, não o objeto. `console.error('Falha ao
carregar o perfil', err)` é legítimo — a palavra "perfil" está no texto fixo.

**Quem vigia.** `npm run qa` → `nenhum dado pessoal vai ao console`, que
descarta os literais antes de testar os argumentos.

---

# C · Promessa que o negócio não pode cumprir

## C1 · Sugerir titulação reconhecida

**O que é.** Qualquer redação que aproxime o certificado de diploma regulado.

**O que custou.** O certificado dizia, no cabeçalho:
**"ACADEMIA MUSICAL DIGITAL · CÁTEDRA DE ENSINO SUPERIOR LIVRE"**. Dois erros
na mesma linha, e o segundo é sério: "ensino superior" é categoria regulada
que o Conservatório não oferece. Quem apresentasse o documento a um
empregador ou a uma secretaria é quem perderia.

**O certo.** O Conservatório oferece **curso livre de qualificação
profissional, com certificação própria, sem vínculo com o MEC**. Essa ressalva
fica no rodapé de todo certificado e credencial, **no documento impresso** —
não apenas na tela ao redor dele — e não é editável no Estúdio de Credenciais.

**Quem vigia.** `npm run qa` → `nenhuma promessa de titulação reconhecida` e
`a ressalva de curso livre está escrita`.

---

## C2 · Citar fonte, referência ou bibliografia

**O que é.** Mencionar obra, autor de referência, universidade ou método que
serviu de base para o conteúdo.

**A regra, textual.** *Nenhum conteúdo do framework de conhecimento deve ser
citado de nenhuma forma. Referências como Edinburgh, e qualquer outra
fonte ou livro, não devem ser mencionadas na plataforma de nenhuma forma.
Apenas o conteúdo é transmitido, no formato autoral que produzimos.*

**O que custou.** Um teste do próprio repositório **exigia** que a proveniência
do curso citasse "University of Edinburgh" — a citação transformada em
requisito. A asserção foi invertida.

**Quem vigia.** `npm run verify:citations` (17 termos proibidos, incluindo
"Edinburgh" e "Edimburgo"), encadeado ao `npm run build`.

---

## C3 · Repertório sem domínio público

**O que é.** Incluir obra protegida no catálogo de reprodução.

**O certo.** Toda faixa declara o domínio público. Não é detalhe de catálogo:
é exposição jurídica da instituição.

**Quem vigia.** `npm run qa` → `todo o repertório é de domínio público`.

---

# D · Interface que exclui

## D1 · Clicável que o teclado não alcança

**O que é.** `<div onClick>`. Não recebe foco, não responde a Enter nem a
Espaço, e leitor de tela não o anuncia.

**O que custou.** As alternativas das provas eram `<div onClick>`. **Quem
navega por teclado não conseguia responder à prova.** Não é desconforto: é o
produto inutilizável para uma parte das pessoas.

**O certo.** Controle é `<button>`. Quando `button` quebraria a semântica, o
tratamento é outro e é deliberado:

| Caso | Tratamento |
|---|---|
| Linha de tabela clicável | `tabIndex` + Enter, mantendo `<tr>` |
| Régua da linha do tempo | `role="slider"` operado pelas setas |
| Fundo de diálogo que fecha ao clicar fora | `role="presentation"` — é atalho de mouse, e o caminho garantido é Esc |

**Quem vigia.** `npm run qa` → `todo clicável alcançável pelo teclado`, com
teto travado em zero na suíte.

---

## D2 · Rótulo por proximidade

**O que é.** `<label>Texto</label>` seguido do campo como **irmão**, sem
`htmlFor`. Parece rótulo e não é: clicar no texto não põe foco no campo, e o
leitor de tela anuncia "caixa de edição" sem dizer de quê.

**O que custou.** 94 campos. Quase toda a base seguia esse padrão.

**O certo.** Par `htmlFor`/`id`, ou `<label>` envolvendo o campo, ou
`aria-label`. Placeholder **não é rótulo**: some ao digitar, e vários leitores
não o anunciam. Quando o placeholder mostra **formato** (`https://…`), ele
nem serve de `aria-label` — diz como digitar, não o quê.

**Quem vigia.** `npm run qa` → `todo campo tem rótulo`, teto zero.

---

## D3 · Botão só com ícone

**O que é.** `<button><X /></button>`. O leitor anuncia "botão".

**O que custou.** Treze — quatro botões de fechar e os controles "M" e "S" da
mesa de mixagem. Uma letra não é nome acessível.

**O certo.** `aria-label` descrevendo a **ação**, e refletindo o estado quando
ele muda: `aria-label={isMuted ? 'Reativar o som' : 'Silenciar'}`.

**Quem vigia.** `npm run qa` → `todo botão tem nome acessível`, teto zero.

---

# E · Estrutura

## E1 · Tela órfã

**O que é.** Tela que existe no código e nenhuma rota abre.

**O que custou.** 23 componentes órfãos na primeira auditoria — e entre eles
exatamente os da paridade: `MixerChannel`, `PianoRoll`, `Recorder`,
`NotationToolbar`, `DataGrid`. A paridade tinha falhado na **montagem**, não
na capacidade.

**Quem vigia.** `npm run qa` → `nenhuma tela órfã` e
`todo destino de navegação existe`.

---

## E2 · Rota sem audiência declarada

**O que é.** Rota que não diz a quem serve.

**O que custou.** Oitenta telas, e cada uma decidia sozinha se checava sessão.
Menos da metade checava. O resultado aparecia em frases como "Ver meus
certificados" numa tela aberta por visitante — uma promessa que a tela não
pode cumprir, porque o visitante não tem certificado nenhum.

**O certo.** `src/ui/navigation/audiencia.ts` declara `publica`,
`exigeLogin` ou `somenteVisitante` para **toda** rota, com o motivo escrito.
Vence o prefixo mais específico. Rota desconhecida é pública, e a auditoria
acusa a omissão — errar para o lado de não bloquear por engano.

**Quem vigia.** `npm run qa` → `nenhuma tela vaza conteúdo de logado`, e
`tests/audiencia-das-rotas.test.ts`.

---

## E3 · Estado de tela que os dados não governam

**O que é.** A tela declara ter estado vazio, de carregamento e de erro, e
nenhum deles é alcançável pelo que o repositório devolve.

**O que custou.** `ScreenContainer` tinha `initialState`, que semeia o estado
**uma vez**. Depois de montar, a lista chegar vazia não levava a tela ao
estado vazio. Telas declaravam `emptyProps` que nunca apareciam.

**O certo.** A propriedade `state`, quando passada, manda:

```tsx
state={dados === null ? 'loading' : visiveis.length === 0 ? 'empty' : 'populated'}
```

---

## E4 · Segunda fonte de verdade

**O que é.** Duas coleções descrevendo a mesma coisa.

**O que custou.** `course.repository.ts` era um catálogo inteiro paralelo ao
de `seed-academy-content.ts`. Ninguém sabia qual valia — e a resposta era
"nenhum", porque nenhuma tela lia o primeiro.

**O certo.** Uma fonte. Quando precisa de camada por cima — como a editorial —
ela é **derivação declarada e aplicada na leitura**, não cópia.

---

# F · Processo

## F1 · Declarar feito o que não foi verificado

**A regra.** Não se fecha item porque a tela existe. Fecha-se com código,
persistência, autorização, teste e documentação.

**O que custou.** Um documento de paridade afirmando "paridade alcançada" com
uma plataforma de referência, escrito **de memória, sem acesso a ela**. E a
afirmação de que a busca do cabeçalho estava consertada sem ter sido aberta no
navegador — ela continuava quebrada.

**O certo.** Rodar. Colar a saída. Quando não deu para verificar, dizer que não
deu, e por quê.

---

## F2 · Verificação que acusa código correto

**O que é.** Ferramenta de qualidade com falso positivo.

**O que custou.** Três casos, no próprio pente fino:

- busca de marcadores com `/i`: "em **todo** o catálogo" casava com `TODO`;
- lista de acentuação com "pratica" e "publica", que **são formas verbais
  corretas** sem acento — "o docente publica as tarefas";
- leitura de atributos parando no primeiro `>`: `onChange={(e) => …}` tem um
  `>` dentro da seta, o que escondia o `aria-label` que vinha três linhas
  abaixo. Cinquenta e nove campos acusados sem motivo.

**Por que importa mais do que parece.** Relatório que acusa código correto
ensina a ignorar o relatório. Um pente fino em que ninguém confia não protege
nada — e o dia em que ele acusar o defeito de verdade, vai ser ignorado junto.

**O certo.** Antes de confiar numa verificação nova, rodá-la contra código
**que se sabe correto** e conferir que ela fica calada.

---

## F3 · Remover o que não foi pedido

**A regra.** Auditoria produz diagnóstico, não demolição. Simplificar não é
apagar capacidade.

**O que custou.** Um trilho lateral inteiro — calendário de frequência e
painéis — foi removido numa "limpeza" que ninguém pediu. A tela caiu de 89
para 66 na medição de paridade.

---

# G · Preferências de quem decide o produto

> Isto não é gosto pessoal a ser tolerado: é critério de aceitação. Entregar
> contra estas preferências é retrabalho garantido.

## G1 · Cartão não é enfeite

Não usar cartão para "mockar informação num quadrado à toa". Cartão existe
quando há registro com identidade própria. Grade de cartões com número
inventado dentro é o antipadrão A1 com moldura.

## G2 · Sem legenda que repete o que o elemento já diz

Título inútil, subtítulo que parafraseia o título e rótulo redundante saem.

## G3 · Ícone onde cabe ícone

Quando a ação é óbvia por ícone, usar ícone — **com `aria-label`**. A busca do
cabeçalho é uma lupa que abre o campo ao clicar, discretamente. Não precisa de
título escrito ao lado.

## G4 · Menu de navegação só com telas

O menu Explorar lista os **nove pilares** e nada mais. Sub-rota, filtro e
parâmetro de consulta não são tela e não entram ali.

## G5 · Sem duplicar barra de navegação

Um cabeçalho. Não dois menus, um ao lado do outro, dizendo coisas parecidas.

## G6 · Dado ausente não é problema; função ausente é

*"Não importa que não tenha dados gravados, desde que a função esteja pronta.
É óbvio que não tem dado gravado."* Construir a arquitetura, a persistência e
o estado vazio honesto é entregar. Preencher com ficção para parecer cheio é
o antipadrão A1.

## G7 · Kids é restrito, não simplificado

A variante infantil **restringe** o que a criança alcança. Não é uma versão
pobre do conteúdo.

## G8 · Anil e ouro

A paleta institucional. Não introduzir cor de destaque nova sem decisão.

---

# Índice cruzado — antipadrão × verificação

| Antipadrão | Verificação automática | Arquivo de teste |
|---|---|---|
| A1 dado fabricado | `nenhum conjunto de dados escrito na tela`, `nenhum dado fabricado no catálogo` | `pente-fino` |
| A2 botão falso | `nenhum botão falso` | `pente-fino` |
| A3 sucesso sem efeito | `nenhum sucesso anunciado sem efeito` | `pente-fino` |
| A4 ferramenta em produção | — | `CLAUDE_TODO.md` |
| A5 painel sem consulta | parcial | leitura humana |
| B1 vazamento entre alunos | `leitura de dado de aluno filtra por usuário` | `persistencia-e-isolamento` |
| B2 privilégio no cliente | `privilégio de admin não é decidido no cliente` | `server-authority` |
| B3 publicar apagando | `publicar conteúdo não apaga dado do aluno` | `edicao-editorial`, `persistencia-e-isolamento` |
| B4 dado no console | `nenhum dado pessoal vai ao console` | `pente-fino` |
| C1 titulação | `nenhuma promessa de titulação reconhecida` | `pente-fino` |
| C2 citação | `npm run verify:citations` | `integridade-do-academy` |
| C3 repertório | `todo o repertório é de domínio público` | `pente-fino` |
| D1 teclado | `todo clicável alcançável pelo teclado` | `pente-fino` |
| D2 rótulo | `todo campo tem rótulo` | `pente-fino` |
| D3 nome acessível | `todo botão tem nome acessível` | `pente-fino` |
| E1 tela órfã | `nenhuma tela órfã`, `todo destino de navegação existe` | `audiencia-das-rotas` |
| E2 audiência | `nenhuma tela vaza conteúdo de logado` | `audiencia-das-rotas` |
| E3 estado | — | leitura humana |
| E4 segunda fonte | — | leitura humana |
| F1–F3, G1–G8 | — | leitura humana |

**As linhas com `—` são deliberadas.** Fingir que há verificação onde não há
seria cometer F1 dentro do documento que o proíbe.
