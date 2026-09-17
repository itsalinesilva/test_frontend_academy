# CONSTITUIÇÃO DEFINITIVA DO PRODUTO (01_PRODUCT_CONSTITUTION)

**Status:** Documento Constitucional Supremo e Vinculante  
**Versão:** 1.0.0 Canônica  
**Data:** 16 de Setembro de 2026  
**Autoridade:** Conselho Acadêmico, Artístico e de Engenharia da Academia Musical Digital  
**Âmbito de Aplicação:** Obrigatório para todas as especificações, modelos de domínio, telas, contratos de API, motores computacionais e código-fonte da plataforma.

---

## 1. HIERARQUIA DE AUTORIDADE ARQUITETURAL

Toda e qualquer decisão de produto, design, engenharia, infraestrutura ou inteligência artificial deve respeitar rigorosamente a cadeia de subordinação normativa:

```
                  MASTER PRODUCT SPEC (Visão & Fundamentos)
                                      ↓
                PRODUCT CONSTITUTION (Constituição do Produto)
                                      ↓
                   DOMAIN MODEL (Entidades, Regras & Tipos)
                                      ↓
             SCREEN ARCHITECTURE (Hierarquia, IA & Navegação)
                                      ↓
             UX CONTRACTS (Interações, Estados, Telas & A11y)
                                      ↓
              API CONTRACTS (DTOs, Endpoints, Protocolos)
                                      ↓
                     IMPLEMENTATION (Código Executável)
```

1. **Master Product Spec:** A definição mestre de propósito institucional, rigor histórico-musicólogo e integridade pedagógica.
2. **Product Constitution:** Esta carta de princípios invioláveis, regras de clonagem de experiência, definição de entidades e integração transversal obrigatória.
3. **Domain Model:** A representação formal do conhecimento em TypeScript/Python/SQL (`src/domain/`), que traduz os preceitos constitucionais em tipos estritos e invariantes de negócios.
4. **Screen Architecture:** A topologia de rotas, layouts e estrutura de informação das 46 telas do sistema.
5. **UX Contracts:** A especificação de cada tela segundo o contrato obrigatório de 25 dimensões (DoD, estados de carregamento, vazio, erro, sucesso, teclado e leitores de tela).
6. **API Contracts:** As interfaces canônicas de transporte (`src/contracts/` e schemas REST/WebSocket).
7. **Implementation:** O código-fonte efetivo (componentes React, repositórios, adapters de áudio, banco de dados). Nenhuma implementação tem autoridade para desviar dos níveis superiores.

---

## 2. POLÍTICA ESTRITA DE CLONAGEM DE ESTRUTURA DE EXPERIÊNCIA

Quando uma referência é indicada para qualquer módulo ou tela, a regra mandatória é **CLONAR A ESTRUTURA DE EXPERIÊNCIA, ARQUITETURA DE INFORMAÇÃO, HIERARQUIA, DENSIDADE FUNCIONAL, COMPOSIÇÃO DE TELAS, CICLOS DE INTERAÇÃO E MÁQUINAS DE ESTADO**.

Isso **NÃO** significa copiar marca, logotipo, identidade cromática de terceiros, textos proprietários ou código fonte protegido. A personalização é integralmente executada pela identidade visual própria e pelo corpus musical erudito e canônico da Academia Musical Digital.

### 2.1 Mapeamento das 7 Referências Canônicas

#### 1. Coursera → Clonado na Academia (Academy)
A Academia reproduz com fidelidade matemática a arquitetura de ensino superior formal:
- **Catálogo & Busca Multifacetada:** Filtros combinados por nível (Fundamental, Intermediário, Avançado), modalidade, instrumento, carga horária e competências atestadas.
- **Hierarquia Acadêmica Estruturada:** Programa Plurianual → Trilha Pedagógica → Disciplina Curricular → Módulo Temático → Lição Formal.
- **Páginas de Apresentação de Disciplina:** Ementa completa, biografia acadêmica dos docentes, competências desenvolvidas, bibliografia de referência (Edimburgo, Bach-Gesellschaft, Schenker) e syllabus cronológico.
- **Ambiente de Aula & Leitura:** Texto acadêmico formatado com citações formais, tocadores de trechos de áudio, partituras embebidas em alta resolução e marcação de progresso com tempo de estudo.
- **Avaliações Somativas & Exames:** Provas formais com cronômetro, bloqueio de consulta externa, questões ponderadas, correção de respostas e gabarito analítico detalhado pós-exame.
- **Histórico Escolar & Certificação:** Livro de registro imutável com atos acadêmicos e diplomas digitais verificáveis contendo hash SHA-256, carga horária e assinatura institucional.

#### 2. Duolingo → Clonado no Loop de Prática (Practice Loop & Skill Tree)
O subsistema de prática e micro-habilidades reproduz a mecânica de engajamento e feedback ágil:
- **Micro-Competências Isoladas:** Decomposição do conhecimento musical em átomos mensuráveis (ex: Reconhecimento de Intervalo de 3ª Maior, Identificação de Semitom Diatônico, Ditado Rítmico em 6/8).
- **Exercícios com Feedback Instantâneo:** Resposta imediata por cor (verde de confirmação / vermelho de correção), acompanhada de sonorização sintetizada da resposta correta versus a resposta dada pelo aluno.
- **Ciclos Rápidos de Retenção:** Sessões de 5 a 10 desafios com barra de progresso contínua no topo, vidas/tolerância calibrada a erros e reforço sonoro.
- **Progressão & Gamificação Séria:** Sequências de dias de estudo consecutivo (*streaks*), pontos de experiência técnica (*XP*), cálculo de domínio percentual (*mastery*) e árvores ramificadas de habilidades desbloqueáveis.

#### 3. Astra Trainer → Clonado no Treinamento & Telemetria de Habilidades
O subsistema de medição instrumental e vocal reproduz a precisão biomecânica e telemetria desportiva:
- **Telemetria de Altura (Pitch):** Medição de frequência fundamental ($f_0$) com desvio milimétrico expresso em centésimos (*cents*), indicando precisão em relação à afinação temperada canônica (A4 = 440 Hz ou 415 Hz barroco).
- **Telemetria Rítmica & Temporal:** Detecção de ataque de notas com precisão de milissegundos ($ms$), calculando atrasos (*drag*) ou antecipações (*rush*) em relação à grade métrica.
- **Gráficos de Evolução Contínua:** Painéis de desempenho acumulado por sessão, curvas de precisão ao longo do tempo e identificação de pontos de atrito técnico.

#### 4. LinkedIn → Clonado no Perfil Único & Portfólio de Evidências
A identidade musical do usuário reproduz a robustez de uma rede profissional de alta credibilidade:
- **Arquitetura de Perfil Profissional:** Cabeçalho formal com foto/avatar institucional, nome canônico, headline de especialidade artística, biografia, instrumentos dominados e links oficiais.
- **Vitrine Modular de 7 Lentes:** Painéis ativáveis e reordenáveis com controles independentes de privacidade (Público, Somente Conexões, Privado):
  1. *Academia:* Disciplinas concluídas, diplomas e carga horária certificada.
  2. *Prática:* Nível de domínio técnico, horas de estudo instrumental acumuladas e streaks.
  3. *Estúdio:* Projetos de arranjo e composições ativas.
  4. *Mundos:* Passaportes históricos carimbados e obras dominadas no atlas.
  5. *Comunidade:* Artigos musicológicos publicados, respostas aprovadas e reputação.
  6. *Salas:* Turmas em que atua como aluno participante.
  7. *Cátedra Docente:* Espaço dedicado do professor com suas turmas, alunos e metodologia.
- **Portfólio Baseado em Evidências Reais:** Cada conquista é obrigatoriamente lastreada por um artefato verificável (áudio gravado, partitura analisada, parecer de professor ou certificado auditável).
- **Conexões & Recomendações:** Rede de contatos artísticos entre estudantes, músicos cameristas e docentes.

#### 5. Skool → Clonado nas Salas do Professor (Teacher Rooms & Community)
O ambiente do docente reproduz a gestão unificada de comunidade e ensino:
- **Espaço Pertencente ao Docente (*Teacher-Owned*):** Cada professor possui sua sala de cátedra soberana, com identidade, regras de conduta e diretrizes pedagógicas próprias.
- **Mural de Avisos da Turma:** Linha do tempo com postagens oficiais do mestre, orientações semanais e materiais complementares anexados.
- **Ambiente de Tarefas & Entrega de Repertório:** Definição de prazos para submissão de vídeos ou gravações de obras, com fila de correção dedicada para o professor emitir pareceres críticos e notas.
- **Diretório de Membros & Engajamento:** Lista de alunos matriculados na cátedra, métricas de frequência e participação em masterclasses.
- **Calendário de Eventos da Cátedra:** Programação de encontros ao vivo, bancas de avaliação e recitais de classe.

#### 6. DAW Profissional → Clonado no Estúdio de Produção (Digital Audio Workstation)
O ambiente de produção sonora reproduz a ergonomia de suítes de padrão industrial (Logic, Pro Tools, Cubase):
- **Linha do Tempo Multicanal (*Multitrack Timeline*):** Pistas horizontais sincronizadas com suporte a áudio gravado e trilhas MIDI.
- **Mixer com Roteamento Completo:** Canais com faders de volume de alta resolução, potenciômetros de pan estéreo, botões individuais de *Mute* e *Solo*, medidores de pico (Peak/RMS) e barramentos de envio (*busses*).
- **Piano Roll & Edição:** Grade matricial para inserção, quantização e estiramento de notas MIDI com controle de velocidade de ataque (*velocity*).
- **Barra de Transporte Canônica:** Controles padronizados de Play, Pause, Stop, Record, Loop contínuo, marcador de compasso/tempo/tique e metrônomo calibrável em BPM e fórmulas de compasso.
- **Renderização & Exportação:** Capacidade de mixdown e renderização em stems isolados ou áudio master estéreo.

#### 7. Software Profissional de Partitura → Clonado no Editor de Notação
O ambiente de composição e gravação gráfica reproduz o rigor editorial de softwares de ponta (Dorico, Sibelius, Finale):
- **Pautas Canônicas & Claves:** Pauta padrão de 5 linhas com suporte a clave de sol, clave de fá, claves de dó (alto e tenor) e sistemas para piano e conjuntos de câmara/coral SATB.
- **Armaduras de Clave & Fórmulas de Compasso:** Suporte a todas as tonalidades maiores e menores pelo ciclo das quintas, compassos simples (2/4, 3/4, 4/4) e compostos (6/8, 9/8, 12/8).
- **Figuras Rítmicas & Pausas:** Semibreves, mínimas, semínimas, colcheias, semicolcheias, fusas, quiálteras, pausas equivalentes e pontos de aumento.
- **Sinais de Dinâmica & Articulação:** Legatos, staccatos, tenutos, acentos, fermatas, crescendos e diminuendos com representação gráfica canônica.
- **Reprodução Sonora & Interoperabilidade:** Síntese em tempo real da partitura com motor de playback polifônico e suporte a importação/exportação nos padrões universais **MusicXML** e **MIDI**.

---

## 3. IDENTIDADE VISUAL INSTITUCIONAL DA PLATAFORMA

A plataforma repudia qualquer estética genérica ("AI slop", gradientes roxos desprovidos de propósito ou neons artificiais). A sua identidade visual é **sóbria, austera, nobre e rigorosamente acadêmica**:

```
+---------------------------------------------------------------------------------------------------+
|                                  PALETA DE CORES INSTITUCIONAL                                    |
+---------------------------------------------------------------------------------------------------+
|  Fundo Primário:    Branco Puro e Pedra Claro (#FFFFFF / #FAFAF9 / #F5F5F4)                       |
|  Texto & Tinta:     Preto Marfim e Grafite Profundo (#1C1917 / #292524)                           |
|  Acento Nobre:      Vermelho Carmesim / Bordô Acadêmico (#8B1E2D / #6B1420)                       |
|  Suporte Auxiliar:  Verde Esmeralda (#1B6B4A para aprovações) e Âmbar Ouro (#B47318 para avisos) |
+---------------------------------------------------------------------------------------------------+
```

- **Tipografia:** Tipografia com serifa clássica e equilibrada para títulos acadêmicos, nomes de obras e diplomas; tipografia sem serifa de alta legibilidade para tabelas, código, parâmetros técnicos de DAW e interfaces de prática.
- **Linguagem:** Tom formal, erudito, encorajador, rigoroso do ponto de vista histórico-musicólogo e acessível em múltiplos níveis de formação.
- **Espaçamento e Proporção:** Margens amplas, respiro entre seções de alta densidade e proporção áurea na distribuição de colunas.

---

## 4. O PRINCÍPIO DO CRUZAMENTO OBRIGATÓRIO ENTRE SISTEMAS

**Nenhum módulo da plataforma é uma ilha isolada.** Todo ato realizado em um sistema deve gerar reverberações, reflexos e dados em outros sistemas através do **Barramento Universal de Eventos e Evidências**:

```
                         CICLO TRANSVERSAL INTEGRADO
                         
        [ Academia: Curso de Harmonia Tonal ]
                         ↓
        [ Prática: Exercício de Condução de Vozes ]
                         ↓
        [ Notação: Partitura do Coral a 4 Vozes ]
                         ↓
        [ Estúdio: Gravação das Vozes no DAW ]
                         ↓
        [ Auditoria: Emissão de Evidência Auditada ]
                         ↓
        [ Perfil: Adição à Vitrine do Aluno ]
                         ↓
        [ Portfólio: Item Publicado com Parecer ]
                         ↓
        [ Passaporte: Carimbo da Era Barroca ]
                         ↓
        [ Comunidade: Análise Compartilhada no Fórum ]
```

### Regras Mandatórias de Cruzamento:
1. **Curso → Prática:** Concluir a leitura teórica de uma lição desbloqueia imediatamente o conjunto correspondente de exercícios práticos na árvore de habilidades.
2. **Prática → Notação:** O estudante pode abrir qualquer exercício rítmico ou harmônico diretamente no Editor de Partituras para expandir o arranjo.
3. **Notação → Estúdio:** Toda partitura criada no editor pode ser importada com 1 clique como trilhas MIDI separadas dentro de um projeto de DAW.
4. **Estúdio → Evidência:** A gravação finalizada de uma interpretação ou composição gera uma `Evidence` canônica, assinada digitalmente com metadados de execução.
5. **Evidência → Perfil & Portfólio:** Toda evidência pode ser projetada pelo aluno em sua lente de estúdio ou portfólio profissional com controle de visibilidade.
6. **Curso & Prática → Passaporte Histórico:** O domínio de obras de determinado compositor ou período carimba automaticamente o passaporte cultural do aluno no Atlas dos Mundos.
7. **Portfólio → Salas & Comunidade:** O aluno pode submeter itens de seu portfólio para a banca de sua Sala de Cátedra ou publicá-los no Fórum para debate musicológico entre pares.

---

## 5. CAPACIDADES E PAPÉIS TRANSITÁVEIS (NÃO SÃO MUNDOS ISOLADOS)

> [!IMPORTANT]
> **REGRA CONSTITUCIONAL INVIOLÁVEL:**
> `Student` (Aluno), `Musician` (Músico), `Professor` (Professor) e `Admin` (Administrador) **SÃO PAPÉIS E CAPACIDADES ACUMULÁVEIS, NÃO MUNDOS SEPARADOS OU SILOS HERMÉTICOS**.

- Um mesmo ser humano na plataforma pode, simultaneamente:
  - Estar matriculado como **Aluno** em um curso de Cravo Histórico;
  - Gravar e compor como **Músico** ativo em seus projetos no Estúdio;
  - Lecionar como **Professor** titular em sua própria Sala de Cátedra de Harmonia;
  - Exercer funções de **Admin** (quando outorgadas) para homologação curricular.
- **Proibição de Bloqueio Arbitrário:** É expressamente proibido exigir que o usuário deslogue ou alterne para uma conta segregada para praticar, compor ou acessar materiais. A navegação entre os 6 pilares é contínua e universal.

---

## 6. DICIONÁRIO DE ENTIDADES FUNDAMENTAIS DO PRODUTO

### 6.1 Atores & Identidades
- **`Student` (Aluno):** Capacidade atribuída ao usuário que se inscreve em disciplinas, cumpre lições, treina micro-competências, submete exames e acumula histórico escolar.
- **`Musician` (Músico):** Capacidade atribuída ao usuário que cria arranjos, manipula o DAW, edita partituras, afina instrumentos, grava performances e constrói seu portfólio artístico de repertório.
- **`Professor` (Professor):** Capacidade outorgada ao docente para criar e titularizar Salas de Cátedra (`Teacher Rooms`), desenhar planos de estudo, prescrever repertório, avaliar tarefas e conceder pareceres pedagógicos formais.
- **`Admin` (Administrador):** Capacidade institucional de alta guarda para homologar matrizes curriculares, auditar logs imutáveis, gerir permissões e moderar o ambiente comunitário.
- **`Child / Kids` (Modo Infantil / Menor Protegido):** Estado de experiência protegido para menores de idade, exigindo vínculo com e-mail de responsável legal, limitando interações comunitárias abertas e ativando interfaces de alta ludicidade sem desvirtuar o rigor do aprendizado.

### 6.2 Estrutura de Ensino & Avaliação
- **`Teacher Room` (Sala do Professor):** Espaço soberano de aula gerenciado pelo docente, contendo membros matriculados, quadro de recados, calendário de encontros e repositório de tarefas.
- **`Program` (Programa Acadêmico):** Agrupamento curricular de maior escopo, compreendendo múltiplos ciclos formativos e certificações intermediárias (ex: Formação Completa em Teoria & Percepção).
- **`Path` (Trilha de Aprendizado):** Sequência ordenada de disciplinas e competências com pré-requisitos lógicos claros.
- **`Course` (Disciplina / Curso):** Unidade pedagógica estruturada em torno de um tema formal, composta por módulos, carga horária definida, bibliografia e corpo docente.
- **`Module` (Módulo Didático):** Unidade temática dentro de um curso, agrupando lições sequenciais e culminando em uma avaliação somativa.
- **`Lesson` (Lição / Aula):** Unidade elementar de instrução contendo fundamentação teórica, exemplos em áudio, partituras analisadas e verificação de leitura.
- **`Practice` (Prática / Treino):** Sessão interativa de exercícios curtos com feedback em tempo real para consolidação de reflexos musculares e cognitivos.
- **`Skill` (Competência / Habilidade):** Átomo mensurável de domínio musical (ex: *Identificação auditiva da sensível tonal*, *Leitura à primeira vista em clave de fá*).

### 6.3 Mundos Culturais & Conquistas
- **`World` (Mundo / Era Musical):** Território histórico-cultural do atlas musical (Barroco, Classicismo, Romantismo, Modernismo, Tradição Brasileira) contendo contextos geopolíticos, escolas estilísticas e árvores genealógicas de compositores.
- **`Passport` (Passaporte Cultural):** Documento digital de bordo do estudante que acumula carimbos oficiais à medida que ele estuda, analisa e interpreta obras das diferentes eras.
- **`Badge` (Distintivo de Conquista):** Reconhecimento visual de marcos de engajamento (ex: 30 dias de sequência ininterrupta de estudo, conclusão de módulo sem erros).
- **`Credential` (Credencial Acadêmica):** Diploma ou certificado emitido pela Academia, provido de código de verificação público, chave criptográfica e ementa integral.
- **`Evidence` (Evidência Auditada):** Registro imutável gerado por um motor da plataforma atestando a realização concreta de uma tarefa musical (gravação analisada, partitura entregue, exame corrigido).

### 6.4 Criação, Produção & Estúdio
- **`Score` (Partitura Canônica):** Estrutura gráfica e semântica contendo pautas, notas, compassos, armaduras e anotações expressivas, serializável em MusicXML e MIDI.
- **`Recording` (Gravação de Áudio):** Registro fonográfico de uma execução vocal ou instrumental capturada através do motor de áudio.
- **`Studio Project` (Projeto de DAW):** Entidade de produção musical contendo arranjo multipista, parâmetros de mixagem, automações de efeitos e roteamento de sinal.
- **`Portfolio` (Portfólio Profissional):** Acervo selecionado pelo próprio músico em seu perfil, exibindo suas melhores obras, gravações e certificados para visualização pública ou acadêmica.

### 6.5 Comunidade & Relações
- **`Forum` (Fórum Musicológico):** Espaço de debate acadêmico e técnico organizado por categorias de saber (Análise, Harmonia, Repertório, Instrumentos).
- **`Post` (Publicação / Tópico):** Artigo, dúvida ou análise técnica submetida por um membro da comunidade, aberta a comentários com marcação de resposta homologada.
- **`Event` (Evento Acadêmico / Artístico):** Masterclasses ao vivo, bancas de avaliação, audições de classe e recitais programados.
- **`Connection` (Conexão / Relação de Pares):** Vínculo bilateral de coleguismo estabelecido entre dois músicos na plataforma para acompanhamento mútuo de estudos e colaborações em câmara.

---

## 7. DISPOSIÇÕES FINAIS E TRANSITÓRIAS

1. **Vigência Imediata:** Esta constituição entra em vigor no momento de sua promulgação e revoga quaisquer disposições informais ou orientações provisórias em contrário.
2. **Inviolabilidade:** Nenhum módulo futuro poderá ser aceito no repositório se violar o princípio de clonagem estrutural das 7 referências, a identidade visual sóbria, o cruzamento entre sistemas ou a natureza cumulativa e fluida dos papéis do usuário.
3. **Fonte de Consulta:** Qualquer dúvida de prioridade na implementação de telas ou serviços deve ser dirimida confrontando a árvore de autoridade deste documento.
