# 43 · Portões de publicação

> Um portão não passa por acordo. Passa por execução.
>
> Ritual: `74_RITUAL_DE_QUALIDADE.md`. Antipadrões: `73_ANTIPADROES.md`.

---

## Portão 0 · Verdade — **automático, bloqueante**

```bash
npm run verificar
```

Passa inteiro, ou não há publicação. Cobre forma, verdade do produto,
domínio, persistência, isolamento, rota, fluxo e coesão.

**Reprova imediatamente, sem discussão:**

| Reprova | Antipadrão |
|---|---|
| Dado fabricado apresentado como real | A1 |
| Conjunto de registros escrito dentro da tela | A1 |
| Controle que não age, ou que afirma ter agido | A2, A3 |
| Leitura de dado de aluno sem filtro por `userId` | B1 |
| Privilégio administrativo decidido no cliente | B2 |
| Publicação de conteúdo apagando dado de gente | B3 |
| Promessa de titulação reconhecida | C1 |
| Citação de fonte, obra ou instituição | C2 |
| Tela órfã, ou destino de navegação inexistente | E1 |
| Tela pública prometendo o que só o aluno tem | E2 |

---

## Portões por área

Cada um exige o Portão 0 **mais** o que segue.

### 1 · Identidade e autoridade
Allowlist em variável de ambiente do servidor · allowlist vazia ⇒ nenhum
administrador · falha de rede **nega** · nenhum caminho concede papel a partir
de e-mail do cliente · `tests/server-authority.test.ts` verde.

### 2 · Persistência e recuperação
O que o aluno faz sobrevive a recarregar · republicar catálogo não apaga
progresso nem correção editorial · **cópia no Drive verificada de ponta a
ponta**, com conta real.

### 3 · Academy
Todo curso com módulos, lições e livreto em número igual · capítulo N do
livreto é o capítulo N do curso · competência cobrada é ensinada · nenhuma
lição casca · **o conteúdo é editável e a correção chega ao livro**.

### 4 · Practice
Motor é adaptador · **conta nova começa zerada** — sem sequência, meta nem
ranking semeados · medição real, não simulada.

### 5 · Perfil, comunidade e evidência
Visibilidade filtrada na origem · perfil de terceiro recebe projeção pública,
nunca o registro cru · tópico, resposta e inscrição persistem · impressão
criptográfica recalculada na verificação.

### 6 · Salas
Criar sala grava · o diretório lê · endereço desconhecido devolve vazio ·
capacidade respeitada.

### 7 · Ferramentas
Só oferecer o que existe · nenhum painel que responde sem consultar.

### 8 · Administração
Toda mutação auditada · a trilha registra o que aconteceu e **nada além** —
não guarda o conteúdo do estudo do aluno · o console lê dado real.

### 9 · Acessibilidade — **teto zero**
Todo campo com rótulo · todo botão com nome acessível · todo clicável
alcançável pelo teclado · toda imagem com `alt`.

### 10 · Interface e mobile
Roteiro manual de `74` §4 percorrido · largura de telefone conferida · os
quatro estados alcançáveis pelos dados.

### 11 · Texto
Ortografia e pontuação verdes · **revisão humana do texto novo** — nenhuma
ferramenta daqui confere concordância, regência ou coesão.

---

## O que este conjunto de portões NÃO garante

Declarar isto faz parte do portão. Um processo que não diz o próprio limite
produz a falsa segurança que deveria evitar.

- Gramática de verdade · correção musical do conteúdo
- Aparência: contraste, espaçamento, hierarquia
- Comportamento em navegador real — os testes rodam em jsdom, que não tem
  layout nem som
- Mobile
- Cópia no Drive, enquanto o Portão 2 não for cumprido com conta real

---

## Registro

Ao passar, anotar em `CLAUDE_STATE.md`: data, portões cumpridos, saída de
`npm run qa`, e **o que não foi verificado**.
