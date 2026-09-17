# 03 — AUDITORIA DE DIFERENCIAIS

**Criado:** 2026-09-17
**Natureza:** documento vivo · auditado a cada missão
**Regra que governa este documento:**

> **Nenhuma linha aqui pode ser dita publicamente enquanto não estiver `REAL`.**
> Um diferencial `PLANEJADO` anunciado como pronto não é marketing otimista — é a mesma falha que a auditoria encontrou no produto ("142 obras do Barroco" sobre 5 registros). Numa plataforma acadêmica, credibilidade é o ativo; uma alegação desmentida custa mais do que dez diferenciais calados.

**Status:** `REAL` verificável hoje · `EM CONSTRUÇÃO` começado e medível · `PLANEJADO` decidido, não construído

---

## 1. SOBERANIA DE DADOS — o diferencial mais raro

### 1.1 O usuário é dono dos próprios dados · `EM CONSTRUÇÃO`

A arquitetura é **local-first**: aprendizado, prática, projetos e partituras vivem no `localStorage` do próprio navegador, com backup em **pasta privada do Google Drive do usuário** (ADR-001.A).

**Por que isso é raro:** a norma do setor é o oposto — os dados de estudo ficam no servidor da empresa, e o usuário os acessa por permissão. Aqui a relação se inverte.

**Consequência verificável:** a plataforma **não tem como** vender, analisar ou perder os dados de aprendizado de ninguém, porque não os possui. Não é política de privacidade; é impossibilidade arquitetural.

| Verificação | Como comprovar |
| :--- | :--- |
| Nenhum dado pessoal em servidor | `grep` por chamadas de persistência remota — a API tem 5 endpoints, todos de identidade |
| Backup na conta do usuário | escopo `drive.appdata`, pasta invisível até para a plataforma |

**Ressalva honesta:** limpar o navegador sem backup configurado perde o progresso. O backup no Drive é o que fecha esse risco — e **ainda não está implementado** (item 15.6). Enquanto não estiver, este diferencial não pode ser anunciado.

### 1.2 Escopos mínimos · `REAL`

`drive.appdata` e `drive.file` — ambos classificados pelo Google como **não sensíveis**. A plataforma não pede acesso ao Drive inteiro, só ao que ela mesma criou.

---

## 2. RIGOR ACADÊMICO — proveniência como funcionalidade

### 2.1 Proveniência por campo · `PLANEJADO`

`FieldProvenance` (ADR-007): cada campo de compositor e obra registra **de qual fonte veio**, quando e com que confiança. A biografia de uma fonte, as datas de outra, o identificador de obra de uma terceira.

**Por que é diferencial:** plataformas de música tratam metadados como verdade anônima. Aqui, cada afirmação tem origem rastreável — o padrão de uma biblioteca, não de um catálogo comercial.

### 2.2 Domínio público calculado, não presumido · `PLANEJADO`

`PublicDomainAssessment` computa vida + 70 anos a partir da data de morte do autor (Wikidata `P570`), com a ressalva de que a **edição** tem direito próprio, independente da obra (`21.1 §5`).

**Por que importa:** a maioria trata "é antigo, então é livre" como regra. Isso está errado e gera risco. Aqui o status é calculado e auditável.

### 2.3 Citação com página · `EM CONSTRUÇÃO`

Os `CHECKPOINT` das lições já citam fonte e capítulo. Após a ingestão (COMANDO 8), a citação será **página a página**.

**Ressalva ativa:** as citações atuais a Med, Piston e Kostka & Payne foram escritas antes da ingestão e estão marcadas como **não verificadas** (K-03). Não podem ser apresentadas como conferidas até a ingestão confirmar cada número.

---

## 3. PEDAGOGIA — o que a aula faz que vídeo não faz

### 3.1 Laboratórios ligados a motor real · `REAL`

As lições contêm **60 blocos interativos**, dos quais `INTERVAL_LAB`, `CHORD_LAB` e `SCALE_LAB` consultam o motor de teoria de verdade — não exibem resposta pré-escrita.

**Verificação:** `tests/ui/lesson-blocks.test.tsx` afirma valores que só um motor correto produz (7 semitons para a quinta justa; escala fechada na oitava; inversão derivada do baixo).

**Por que é diferencial:** o padrão do setor é vídeo + quiz. Aqui o aluno **ouve, manipula e verifica** dentro do parágrafo que introduz o conceito.

### 3.2 Correção de erros musicais do próprio motor · `REAL`

Ao ligar os laboratórios, o motor errou três vezes — oitava reduzida a uníssono, armadura sempre zero, inversão sempre fundamental. Os três foram corrigidos com **8 testes de regressão**, cada um documentando o defeito que previne.

**Por que registrar isso como diferencial:** demonstra que o conteúdo é **verificado por execução**, não só revisado por leitura. Numa plataforma de teoria musical, ensinar que C3→C4 é uníssono seria um erro de credibilidade irreparável.

### 3.3 Dupla variante por lição · `REAL`

Toda lição tem variante **Tradicional** e **Kids**, com linguagem e laboratórios próprios — não é a mesma lição com fonte maior.

### 3.4 Sem vídeo, e dizendo isso · `REAL`

A plataforma ainda não hospeda aula em vídeo. Em vez de omitir ou fingir um player, o bloco `VIDEO_PLACEHOLDER` registra discretamente onde a aula gravada entrará. **Há teste garantindo que não existe `iframe`, `video` nem `button`** — nada que sugira mídia disponível.

---

## 4. ACERVO E COMMONS

### 4.1 Contribuinte, não extrator · `PLANEJADO`

O Mutopia é forte em repertório europeu e **fraco em brasileiro**. A decisão (ADR-008) é **editorar nós mesmos, em MusicXML**, obras brasileiras de domínio público — Nazareth, Chiquinha Gonzaga, Callado, Carlos Gomes, Anacleto de Medeiros — e devolvê-las ao acervo comum sob licença livre.

> 🔴 **RESSALVA QUE DEVE ACOMPANHAR ESTA AFIRMAÇÃO SEMPRE:**
> Hoje isto é **decisão registrada, não realização**. Nenhuma edição foi produzida. A frase "somos contribuintes do acervo nacional" só pode ser dita publicamente **depois da primeira edição publicada sob licença livre** — e aí deve vir com o número exato de obras, não com adjetivo.

**Por que vale perseguir:** move a plataforma de consumidora para produtora de patrimônio. É o tipo de diferencial que não se copia com dinheiro — se constrói com trabalho editorial.

### 4.2 Respeito a `robots.txt` como política declarada · `REAL`

Verificado e documentado: IMSLP proíbe `/images/` e `/imglnks/`; Música Brasilis proíbe `/media/`. A plataforma **não busca arquivos desses caminhos** e usa as duas fontes apenas para **metadados e cruzamento**.

**Por que é diferencial:** raspagem silenciosa é comum no setor. Declarar a restrição — e desenhar em volta dela — é postura institucional, e é exatamente o que torna uma parceria futura possível.

### 4.3 Tudo nativo, sem redirecionar · `PLANEJADO`

Mutopia fornece **MIDI e LilyPond**, não só PDF: a partitura é renderizada na nossa pauta, com playhead próprio e ligação com Score Studio e prática. Obra sem edição livre mostra estado honesto, **sem link de saída**.

### 4.4 Atlas de dois eixos · `EM CONSTRUÇÃO`

Eras × instrumentos, cruzando na obra (ADR-006). A Chaconne é Barroco **e** Violino; quem a estuda carimba os dois. Ilhas sem corpus ficam `PLANNED` — e há **teste que impede** uma ilha se declarar navegável sem acervo real em disco.

---

## 5. SEGURANÇA E GOVERNANÇA

### 5.1 Identidade verificada criptograficamente · `REAL`

ID token do Google verificado contra o JWKS, com validação de `iss`/`aud`/`exp`/`nonce` e recusa de confusão de algoritmo. Sessão em JWS HS256 com comparação em tempo constante.

**Verificação:** 16 testes de autorização; 5 vetores de ataque recusados (404/401/401/401/401).

### 5.2 Sem senha, por construção · `REAL`

Não há `passwordHash`, recuperação nem redefinição — a superfície foi **eliminada**, não remendada. Não há o que vazar.

### 5.3 Auditoria com cadeia HMAC · `REAL`

Cada registro assina conteúdo + assinatura anterior. Alterar qualquer elo quebra `verifyChain()`, que aponta o `seq` comprometido.

### 5.4 Guarda de vazamento no build · `REAL`

`npm run build` falha se qualquer segredo aparecer em `dist/`. **Reprovou na primeira execução**, encontrando um e-mail remanescente.

---

## 6. ACESSIBILIDADE — a maior oportunidade aberta

### 6.1 Estado atual · 🔴 `PLANEJADO`

**67 de 72 telas têm zero atributos `aria`.** WCAG AA nunca foi medido. `LiveRegion` e `VisuallyHidden` existem e estavam órfãos.

### 6.2 Por que é a oportunidade mais valiosa do produto

Educação musical tem relação direta com deficiência visual — historicamente, uma das áreas de maior presença de músicos cegos. **Uma plataforma de teoria musical genuinamente acessível a leitor de tela seria rara a ponto de ser notícia.**

Os blocos interativos tornam isso viável de um jeito que vídeo não permite: `INTERVAL_LAB` é **som + texto**, não imagem. A `PageLayout` já entrega marcos ARIA, `role="tablist"` e anúncio de estado.

**O que falta:** `role="meter"` com `aria-valuetext` nos medidores de afinação, descrição textual de cada diagrama SVG, e auditoria com `axe`.

> **Isto deveria virar meta explícita do produto**, não item de conformidade. É diferencial, é impacto social real e está ao alcance.

### 6.3 Funciona sem conexão · `PLANEJADO`

Local-first significa que a plataforma **pode** funcionar integralmente offline. Para estudantes em regiões com conectividade ruim, isso não é conveniência — é acesso. Exige service worker e cache do acervo (não planejado ainda).

---

## 7. LÍNGUA E ALCANCE

### 7.1 Teoria musical acadêmica em português · `EM CONSTRUÇÃO`

O corpus sério de teoria é majoritariamente anglófono. Ter Bohumil Med como **base oficial** (ADR-002), com Vasco Mariz e Tinhorão para história brasileira, cria algo que quase não existe: formação musical rigorosa, em português, gratuita.

### 7.2 Gratuita · `EM CONSTRUÇÃO` — com ressalva

Nenhum conteúdo atrás de paywall.

> ⚠️ **Ressalva que deve constar:** custo de infraestrutura é baixo por projeto — Cloudflare Pages, sem banco, mídia no Drive do usuário — mas **não é zero**, e trabalho editorial não é gratuito. Uma plataforma sem modelo de sustentação tem prazo de validade. Anunciar "gratuita para sempre" sem plano é promessa que pode não se cumprir. O `domain/commercial.ts` existe (107 linhas, órfão) e prevê planos.

---

## 8. PLACAR — o que pode ser dito hoje

| Categoria | `REAL` | `EM CONSTRUÇÃO` | `PLANEJADO` |
| :--- | ---: | ---: | ---: |
| Soberania de dados | 1 | 1 | — |
| Rigor acadêmico | — | 1 | 2 |
| Pedagogia | 4 | — | — |
| Acervo e commons | 1 | 1 | 2 |
| Segurança | 4 | — | — |
| Acessibilidade | — | — | 2 |
| Língua e alcance | — | 2 | — |
| **Total** | **10** | **5** | **6** |

**Hoje são anunciáveis 10 diferenciais** — concentrados em pedagogia e segurança, que são justamente os construídos com verificação por execução.

---

## 9. OPORTUNIDADES IDENTIFICADAS

Registradas conforme a diretriz de sempre apontar onde dá para ser mais completo.

| # | Oportunidade | Por quê | Custo |
| :--- | :--- | :--- | :--- |
| O-1 | **Acessibilidade como meta de produto**, não conformidade | Educação musical e deficiência visual têm relação histórica direta; blocos sonoros viabilizam o que vídeo não viabiliza | médio |
| O-2 | **Editar e publicar repertório brasileiro livre** | Move de extratora a contribuinte; não se copia com dinheiro | alto, contínuo |
| O-3 | **Funcionamento offline completo** | Acesso real onde a conexão é ruim | médio |
| O-4 | **Certificado verificável por assinatura, sem banco** | Ed25519: qualquer um verifica sem consultar servidor nosso | baixo |
| O-5 | **Exportar o próprio acervo** — JSON + MusicXML + áudio | Coerente com soberania de dados: sair é tão fácil quanto entrar | baixo |
| O-6 | **Publicar a API de conhecimento** | Se resolvemos entidades com proveniência, outros podem usar — e isso cria autoridade | médio |
| O-7 | **Modo de baixa largura de banda** | Síntese WebAudio pesa bytes, não megabytes; a aula pode rodar em 2G | baixo |
| O-8 | **Trilha para músico com deficiência auditiva** | Notação e análise visual sem depender de escuta; quase inexplorado no setor | alto |

---

## 10. COMO ESTE DOCUMENTO É AUDITADO

A cada missão: reavaliar o status de cada item, mover o que se comprovou, **rebaixar o que regrediu**, e registrar oportunidades novas.

**Um item só sobe para `REAL` com verificação executável apontada nominalmente** — teste, comando ou medição. Sem isso, permanece `EM CONSTRUÇÃO`, por melhor que pareça.
