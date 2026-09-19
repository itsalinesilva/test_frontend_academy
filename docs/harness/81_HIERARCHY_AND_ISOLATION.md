# 81 · Hierarquia, partição e isolamento

> Companheiro de `SECURITY.md` e de `80_INSTITUTIONAL_ARCHITECTURE.md`. Aquele
> trata de autenticação e de segredo; `80` trata de **quem a pessoa é** na
> instituição. Este trata de **o que ela alcança**, e de como isso é garantido.

---

## 1 · Três públicos, e eles não se misturam

| Público | O que é | O que alcança |
|---|---|---|
| **Visitante** | quem não entrou | o que a instituição publica |
| **Aluno** | quem tem sessão | o que publica + o que é dele |
| **Administração** | quem tem outorga assinada pelo servidor | os dois + o console |

A administração **não deixa de ser aluno**: quem administra também estuda, e
abrir `/profile` como administrador mostra o próprio perfil, não um painel.
Papel acrescenta; não substitui.

> **Fundadora é fato institucional; admin é autorização técnica.** A primeira
> vive na Associação (`80 §3`), a segunda na sessão. Decidir permissão a partir
> de dado de perfil foi como a auditoria S-02 encontrou a plataforma, e é a
> conclusão que não pode voltar: quem editasse o `localStorage` viraria
> administrador.

---

## 2 · A declaração é a fonte

Toda rota declara a sua audiência em `src/ui/navigation/audiencia.ts`. São
quatro níveis:

| Nível | Sem sessão | Com sessão | Com outorga |
|---|---|---|---|
| `publica` | abre | abre | abre |
| `exigeLogin` | convite para entrar | abre | abre |
| `somenteVisitante` | abre | avisa que não há o que fazer ali | idem |
| `exigeAdmin` | recusa | **recusa** | abre |

**Prefixo mais longo vence.** `/academy` é pública; `/academy/history` exige
login; a regra mais específica ganha da genérica.

**Omissão vale como pública**, e isso é deliberado: erra para o lado de não
bloquear, em vez de trancar o catálogo por esquecimento. O risco disso é real,
e é por isso que existe verificação de máquina — ver §5.

### O que estava partido até 19/09

`/admin` estava declarada como `exigeLogin`. Quem de fato barrava o aluno
comum era um efeito no `AppRouterOutlet`, chamando
`authService.checkRouteAccess`. **A proteção funcionava** — e mesmo assim
estava errada, porque a hierarquia vivia em dois sistemas: um declarativo, que
a auditoria lê, e um imperativo, que ela não lia.

Duas fontes de verdade sobre quem alcança o quê divergem na primeira rota
nova. Uma tela administrativa criada fora do prefixo `/admin` não seria
protegida por ninguém, e a tabela continuaria dizendo que estava tudo certo.

Agora a declaração é a fonte, a guarda a aplica, e `checkRouteAccess` continua
como **segunda camada** — defesa em profundidade, e não verdade concorrente.

---

## 3 · Três camadas, e cada uma sozinha é insuficiente

| Camada | O que garante | O que **não** garante |
|---|---|---|
| **Rota** — `GuardaDeAudiencia` | a tela não monta para quem não pode | nada sobre os dados |
| **Leitura** — serviço exige `userId` | registro de alguém só se lê sendo esse alguém | nada sobre escrita |
| **Servidor** — sessão assinada | a outorga não se forja no cliente | nada sobre a tela |

A camada de rota sozinha seria teatro: quem chama o serviço direto não passa
por tela nenhuma. A camada de leitura sozinha deixaria a tela montar e depois
ficar vazia, dizendo à pessoa que algo existe ali. As três juntas é que
fecham.

> **Buscar um registro por identificador é tão vazável quanto listar todos** —
> pior, até: o identificador único dá a sensação de já ser credencial, quando
> é só um endereço. Quem tem o endereço não é, por isso, o dono.

---

## 4 · O que cada público vê de uma tela

Tela em rota pública **não mostra seção pessoal vazia**. Dizer a quem nunca
entrou "Seu progresso: você ainda não se matriculou" não é um estado vazio: é
uma seção **sem sujeito**.

Para quem chega de fora, o espaço vai para o **convite** — o que é este
espaço, o que a pessoa leva, como começa. Ver `VisitorInvitation`.

| Tela | Visitante | Aluno |
|---|---|---|
| Academia | convite, números reais, ressalva de curso livre | progresso e próximo passo |
| Atlas | convite: carimbos, passaporte, simulador | o mapa com o próprio passaporte |
| Comunidade | ler é aberto; a ação principal é entrar | escrever, responder, Clubes |

---

## 5 · O que a máquina verifica

| Verificação | O que barra |
|---|---|
| `checkAdminScreensBehindAdminAudience` | tela administrativa em rota que não exige administração |
| `checkGuardCoversEveryAudience` | nível novo no tipo que a guarda não trata |
| `checkPersonalRouteInheritingPublic` | rota de registro pessoal valendo como pública, servida por tela que não consulta a sessão |
| `checkRecordOwnership` | serviço que devolve registro pessoal sem receber `userId` |
| `checkPerUserFilter` | listagem de dado de aluno sem filtro |
| `checkPersonalSectionWithoutSession` | seção possessiva em tela que o visitante alcança |
| `checkAdminAuthority` | privilégio decidido no cliente |
| `checkKeyCollision` | duas coisas diferentes na mesma chave de armazenamento |
| `checkPublishKeepsStudentData` | publicar conteúdo apagando dado do aluno |

E em fluxo real, com a guarda renderizada para cada público:
`tests/ui/audience-guard.test.tsx`.

### O que a máquina NÃO alcança

- Rota pessoal com **nome neutro** — a regra lê o caminho
- Possessivo montado por **interpolação** — a regra lê texto literal
- Escrita indevida no servidor — quem garante é o servidor, não o pente fino
- Se a mensagem de recusa é a **certa** para a pessoa; só leitura humana diz

---

## 6 · Regras de recusa

| Regra | Razão |
|---|---|
| A recusa **não descreve** o que há do outro lado | descrever o console a quem não pode entrar é dar o mapa da casa |
| Não se distingue "não existe" de "não é seu" | distinguir transforma a tela em oráculo de identificadores válidos |
| Exigir login **convida**, não redireciona | redirecionar apaga o endereço que a pessoa queria |
| Rota pública **não espera** pela sessão | "Verificando sua sessão…" antes do catálogo é o pior primeiro contato |
| Rota protegida **não mostra antes de saber** | mostrar e esconder deixa o conteúdo num print |

---

## 7 · Ao criar uma rota nova

1. Declarar a audiência em `audiencia.ts`, com o **porquê** escrito
2. Se serve registro pessoal, o serviço recebe `userId` e confere o dono
3. Se é administrativa, `exigeAdmin` — e nunca só `exigeLogin`
4. Se é pública e a tela tem seção pessoal, a tela consulta a sessão
5. `npm run qa` antes de abrir o commit

> O campo `porque` não serve ao runtime: serve à revisão. Regra de audiência
> sem justificativa é regra que ninguém ousa mudar, porque ninguém sabe o que
> ela protegia.
