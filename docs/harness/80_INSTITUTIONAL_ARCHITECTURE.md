# 80 · Arquitetura institucional e social

> **Este documento é a autoridade máxima de estrutura.** Quando qualquer outro
> documento, domínio ou tela discordar dele, quem está errado é o outro. Ele
> define o que cada corpo do Conservatório é, e — mais importante — o que cada
> um **não** é.

---

## 1 · O problema que isto resolve

Estavam em uso, como se fossem sinônimos: comunidade, laboratório, clube,
casa, grêmio, tribo. Seis palavras para o que parecia uma coisa só.

Não eram sinônimos. Eram **camadas diferentes** de uma estrutura que ainda não
tinha sido escrita — e enquanto ela não existia, cada tela inventava a sua. Foi
assim que "tribo" acabou carregando, sozinha, a função social do praticante, do
estudante e do grupo de interesse ao mesmo tempo.

A regra que organiza tudo cabe em oito linhas:

> **Associação** identifica o corpo institucional.
> **Comunidade** identifica o corpo social.
> **Academia** identifica a estrutura curricular.
> **Grêmio** identifica onde o estudante se forma.
> **Laboratório** identifica onde a atividade prática acontece.
> **Casa** identifica onde o praticante se compromete.
> **Clube** identifica com quem a comunidade se organiza.
> **Liga** identifica como se compete e se progride.

---

## 2 · A árvore

```text
CONSERVATÓRIO MUSCICAPA
│
├── ASSOCIAÇÃO ─────────── corpo institucional
│   ├── Fundadora
│   ├── Contribuintes
│   ├── Administração
│   └── Governança e patrimônio
│
├── COMUNIDADE ─────────── corpo social
│   ├── Estudantes · Professores · Músicos
│   ├── Praticantes · Pesquisadores
│   └── CLUBES ─────────── fóruns independentes, criados pelos usuários
│
├── ACADEMIA ───────────── estrutura curricular
│   ├── Cursos, programas, disciplinas, lições, avaliações
│   └── GRÊMIOS ────────── pertencimento acadêmico · um por curso
│         └── vincula os Clubes daquela área
│
├── LABORATÓRIOS ───────── onde a atividade prática acontece
│   ├── Laboratório de Violino · de Teoria · de Ritmo · de Escuta · …
│   └── CASAS ──────────── pertencimento prático
│
└── LIGAS ──────────────── transversais: nascem no Grêmio, na Casa ou no Clube
```

> **Liga não é uma pasta paralela.** Ela é uma entidade que **um contexto
> cria**: a mesma mecânica serve à liga oficial do Conservatório, à do Grêmio,
> à da Casa e à interna de um Clube. Modelá-la como quarto ramo da árvore
> sugeriria que existe uma liga só, e ela seria a errada.

---

## 3 · Associação — o corpo institucional

Não é comunidade de usuários. É quem **mantém** o Conservatório.

| Papel | Hoje |
|---|---|
| Fundadora | uma só |
| Contribuintes | nenhum ainda — a estrutura existe, a lista está vazia |
| Administração | a fundadora; **pode mudar** |
| Governança | da fundadora |
| Patrimônio e decisões institucionais | da Associação |

> **A lista de contribuintes vazia mostra a forma, e não gente inventada.** É a
> mesma regra da liga sem participantes. Uma associação que abre com nomes de
> exemplo mente sobre quem a sustenta — e isso é o tipo de mentira com
> consequência jurídica, não só de produto.

O privilégio administrativo **não vem daqui**: continua vindo de concessão
assinada pelo servidor, como em `SECURITY.md`. Ser fundadora na Associação é
um fato institucional; ser admin é uma autorização técnica. Confundir as duas
seria decidir permissão a partir de dado de perfil.

---

## 4 · Comunidade — o corpo social

A Comunidade é a **população** do Conservatório, e não uma sala nem um fórum.

Inclui estudantes, professores, músicos, praticantes, pesquisadores e demais
usuários autorizados — e inclui os **Clubes**, que são a forma como essa
população se organiza por conta própria.

O modelo de leitura é o de um agregador de fóruns: **cada Clube é um corpo
independente**, com o seu próprio fórum, as suas regras de convívio e a sua
dinâmica. A Comunidade é o conjunto deles mais as pessoas.

---

## 5 · Academia e Grêmio

### Academia

A estrutura curricular: cursos, programas, disciplinas, lições, atividades,
simulados, provas, certificados. É o que já existe em `domain/academy.ts`.

### Grêmio — pertencimento acadêmico

**Curso → Grêmio.** Matricular-se no Curso de Teoria Musical faz a pessoa
pertencer ao Grêmio de Teoria Musical. Não há formulário, não há convite, não
há escolha: o pertencimento é consequência da matrícula.

| O Grêmio reúne | |
|---|---|
| Estudantes daquele curso | Professores |
| Lições e pesquisas | Repertórios |
| Discussões e eventos | Resultados acadêmicos |

O que o Grêmio dá ao curso é **identidade social permanente** — em vez de ele
ser apenas uma sequência de páginas que se termina e se esquece.

> **O Grêmio não expira quando o curso termina.** Quem concluiu Teoria continua
> do Grêmio de Teoria. Expirar transformaria formação em assinatura.

---

## 6 · Laboratório e Casa

### Laboratório — onde a atividade acontece

**Laboratório é uma unidade funcional, e não o nome do produto.** Há vários:
Laboratório de Violino, de Teoria, de Ritmo, de Escuta. Cada um reúne as
ferramentas, os estúdios, as oficinas, as pesquisas, as imersões, as práticas,
as lições de prática e a aquisição de repertório **daquela área**.

> **Correção registrada.** O documento `77` afirmou, em 18/09, que "Laboratório"
> era o guarda-chuva que substituía "Practice". Está errado e foi corrigido:
> Laboratório é unidade de atividade; o guarda-chuva da rota é outro assunto,
> aberto em `CLAUDE_TODO.md` F-2.

### Casa — pertencimento prático

A Casa nasce da **prática recorrente**, não da matrícula. Quem pratica violino
com constância dentro do sistema pertence à **Casa do Violino** — e isso é
diferente de "estar fazendo um curso de violino".

| O Grêmio mede | A Casa mede |
|---|---|
| matrícula e trajetória acadêmica | prática recorrente e compromisso |
| lições, avaliações, certificado | treino, desempenho, repertório, sessões |
| onde a pessoa **se forma** | onde a pessoa **se compromete** |

Uma pessoa pode ter Grêmio sem Casa — matriculou-se e não praticou. Pode ter
Casa sem Grêmio — pratica sem cursar, que é caso previsto desde 18/09. E pode
ter os dois, que é o percurso completo.

> **"Tribo" sai do projeto.** Era o nome que carregava sozinho a função que
> agora se divide entre Grêmio, Casa e Clube — e por isso nunca coube em lugar
> nenhum. `domain/tribe.ts` passa a `domain/house.ts`, e o recorte de liga
> `TRIBE` passa a `HOUSE`. É a segunda vez que este conceito é renomeado: antes
> foi `ilha` → `tribo`, porque ilha dava ideia de lugar. Agora é tribo → Casa,
> porque tribo não distinguia estudante de praticante.

---

## 7 · Clube — o que a comunidade cria

O Clube **não pertence institucionalmente** ao Conservatório do mesmo modo que
o Grêmio e a Casa. Ele é criado pelos próprios usuários, sobre a
infraestrutura do Conservatório.

| O Conservatório fornece | Os participantes fazem |
|---|---|
| fórum, posts, eventos | o conteúdo |
| XP, ranking, desafios, campanhas | a dinâmica |
| ferramentas, moderação, acompanhamento | as regras de convívio |

### A regra: não existe Clube sem Grêmio

> **Todo Clube tem vinculação a um Grêmio.** E para participar de um Clube é
> preciso ter o pertencimento-base ao Grêmio correspondente.

```
Grêmio de Violino
  ├── Clube de Violino Barroco
  ├── Clube de Violino Romântico
  ├── Clube de Técnica de Arco
  └── Clube de Repertório
```

Sem essa regra os Clubes ficariam soltos, sem relação com a estrutura musical
do Conservatório — e a Comunidade viraria uma rede social genérica que por
acaso fala de música. A vinculação é o que a mantém sendo o corpo social **de
um conservatório**.

Uma pessoa participa de quantos Clubes quiser, desde que tenha o Grêmio-base
de cada um.

---

## 8 · Liga — a camada transversal

A Liga é a mecânica de competição e progressão, e **o contexto que a cria
define o que ela é**:

| Nasce em | É | Exemplo |
|---|---|---|
| Conservatório | oficial | Liga da Plataforma |
| Grêmio | oficial | Liga de Violino |
| Casa | oficial | Liga de Prática |
| Clube | comunitária | Liga interna do Clube de Repertório |

A liga oficial é **monitoramento institucional constante**: acompanha quase
todas as funções e experiências, com algoritmo prévio e sistematizado — e esse
mesmo algoritmo cobre o desempenho dentro dos Clubes, ainda que o Clube seja
comunitário. A regra de apuração é uma só; o que muda é o recorte.

A mecânica já existe em `domain/league.ts`: XP da semana, 20% sobe, 20% cai,
esqueleto quando não há participante. O que muda aqui é o **recorte**, que
passa a ser `PLATFORM | GUILD | HOUSE | CLUB | ERA`.

---

## 9 · Os dois eixos

A mesma pessoa percorre dois caminhos ao mesmo tempo, e eles se encontram no
Passaporte:

```
eixo acadêmico     Conservatório → Academia → Curso → Grêmio → Clube
eixo prático       Conservatório → Laboratório → Casa → Liga → Resultado
                                        ↓
                               PASSAPORTE E PERFIL
```

Uma única prática pode gerar, de uma vez:

**Curso → Grêmio → Laboratório → Casa → Clube → Liga → Resultado → Perfil**

É isto que separa o Conservatório de "um Duolingo com fórum": o percurso tem
consequência institucional, social e prática ao mesmo tempo, e as três ficam
registradas.

---

## 10 · O que o Passaporte passa a responder

O Passaporte deixa de ser só a estante de carimbos (`78`) e passa a ser
também a **carteira de pertencimento**. Ele responde, nesta ordem:

| Pergunta | Se não houver |
|---|---|
| Academia — está cursando? | vazio, e diz como se matricular |
| Qual Grêmio? | vazio |
| Laboratório — está praticando? | vazio |
| Qual Casa? | vazio |
| Comunidade — está conectada? | vazio |
| Qual Clube? | vazio |

> **Vazio é vazio.** Nenhum pertencimento de exemplo, nenhum grêmio sugerido,
> nenhuma casa "recomendada" preenchendo a lacuna. Um passaporte que começa
> parecendo usado tira o sentido de usá-lo — e aqui seria pior, porque
> pertencimento falso é afirmação sobre a vida da pessoa.

O que **consta** aparece como parte do perfil, acumulando recompensas, XP,
emblemas, credenciais, histórico e jornada em todo o sistema.

---

## 11 · Tabela de decisão — qual palavra usar

| Se você quer dizer… | Use | Nunca use |
|---|---|---|
| O corpo que mantém a instituição | **Associação** | Comunidade, equipe |
| A população de usuários | **Comunidade** | Rede, público |
| A estrutura curricular | **Academia** | Escola, EAD |
| Pertencimento por curso | **Grêmio** | Turma, classe, tribo |
| Onde a prática acontece | **Laboratório** | Practice, área, oficina |
| Pertencimento por prática | **Casa** | Tribo, ilha, grupo |
| Grupo criado por usuários | **Clube** | Comunidade, grupo, fórum |
| Competição e progressão | **Liga** | Ranking, campeonato |
| Posição dentro da liga | **Classificação** | Ranking |
| A carteira de pertencimento e conquistas | **Passaporte** | Troféus, galeria |

---

## 12 · O que isto obriga a corrigir

| # | Correção | Estado |
|---|---|:---:|
| 1 | `domain/tribe.ts` → `domain/house.ts`, `Tribe` → `House` | ⬜ |
| 2 | Recorte de liga `TRIBE` → `HOUSE`, e acrescentar `GUILD` e `CLUB` | ⬜ |
| 3 | `77` deixa de dizer que Laboratório é o guarda-chuva | ⬜ |
| 4 | `75` retira "tribo" da tabela de decisão e aponta para cá | ⬜ |
| 5 | Domínio de Grêmio, derivado da matrícula em curso | ⬜ |
| 6 | Domínio de Casa, derivado da prática recorrente | ⬜ |
| 7 | Domínio de Clube, com vinculação obrigatória a Grêmio | ⬜ |
| 8 | Passaporte responde às seis perguntas de §10 | ⬜ |
| 9 | Associação: fundadora e lista vazia de contribuintes | ⬜ |
| 10 | Verificação que falhe se "tribo" voltar ao código | ⬜ |
