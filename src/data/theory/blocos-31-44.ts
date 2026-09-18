import { LessonBlock } from '../../domain/academy';

/**
 * Capítulos XXXI a XLIV — das escalas artificiais à apojatura.
 *
 * Bloco misto: fecha o que faltava de escalas e de sinais de execução,
 * percorre a notação abreviada e o vocabulário de partitura, e abre a
 * harmonia com as tríades e a cifragem.
 */
export const BLOCOS_31_44: Record<number, LessonBlock[]> = {
  // -------------------------------------------------------------------------
  31: [
    {
      kind: 'MARKDOWN',
      id: 'c31_intro',
      markdown:
        'As escalas maiores e menores nasceram da prática e se consolidaram por uso. As **escalas artificiais** nascem do contrário: são construídas a partir de um **princípio**, geralmente de simetria, e depois postas à prova na composição.\n\n' +
        'Compositores recorreram a elas justamente quando quiseram escapar da atração tonal. Uma escala simétrica não tem sensível, não tem hierarquia entre os graus, e por isso não aponta para nenhum centro.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c31_tons',
      markdown:
        '## Escala de tons inteiros\n\n' +
        'Seis notas, todas separadas por **um tom**. Dó, ré, mi, fá♯, sol♯, lá♯, dó.\n\n' +
        'Consequências diretas da simetria total:\n' +
        '- não há semitom, logo não há sensível;\n' +
        '- não há quinta justa, logo não há tríade maior nem menor;\n' +
        '- qualquer nota pode ser tomada como início sem que nada mude;\n' +
        '- existem apenas **duas** escalas de tons inteiros distintas, porque a terceira já repete a primeira.\n\n' +
        'O resultado é uma sonoridade flutuante, sem direção, que o repertório impressionista explorou sistematicamente.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c31_audio_tons',
      title: 'Escala de tons inteiros',
      description:
        'Seis tons iguais. Repare que ela não "chega" a lugar nenhum — falta-lhe o semitom que resolveria.',
      notes: ['C4', 'D4', 'E4', 'F#4', 'G#4', 'A#4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 84,
    },
    {
      kind: 'MARKDOWN',
      id: 'c31_octatonica',
      markdown:
        '## Escala octatônica\n\n' +
        'Oito notas, alternando **tom e semitom** de forma regular. Há duas versões conforme se comece por tom ou por semitom, e existem apenas **três** escalas octatônicas distintas.\n\n' +
        'Ao contrário da de tons inteiros, a octatônica **contém** tríades maiores, menores e acordes de sétima diminuta — quatro de cada, distribuídos simetricamente. Isso a torna bem mais versátil: permite harmonia reconhecível sem estabelecer tonalidade.\n\n' +
        'É a escala de eleição de boa parte da música russa do início do século XX e, mais tarde, de certo jazz modal.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c31_cromatica',
      markdown:
        '## Cromática e outras construções\n\n' +
        'A **escala cromática** usa os doze semitons. É a saturação total do sistema temperado e, tomada sozinha, não define nada — serve como material, como ornamento ou como base do serialismo, conforme o uso.\n\n' +
        'A grafia da cromática segue uma convenção: **sustenidos ao subir, bemóis ao descer**, porque a direção do movimento indica a tendência das notas alteradas.\n\n' +
        'Há ainda escalas construídas por outros princípios, como as de transposição limitada — escalas cuja simetria faz com que transpô-las produza, a partir de certo ponto, as mesmas notas de volta. A de tons inteiros e a octatônica são os dois casos mais conhecidos dessa família.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c31_check',
      question: 'Por que a escala de tons inteiros não estabelece tonalidade?',
      options: [
        'Porque tem poucas notas',
        'Porque não tem semitom, logo não tem sensível nem hierarquia entre graus',
        'Porque é moderna',
        'Porque não pode ser transposta',
      ],
      correctIndex: 1,
      explanation:
        'A simetria total elimina o semitom. Sem sensível e sem quinta justa, nenhuma nota tem privilégio sobre as outras, e não há centro.',
    },
  ],

  // -------------------------------------------------------------------------
  32: [
    {
      kind: 'MARKDOWN',
      id: 'c32_intro',
      markdown:
        '**Quiáltera** é um grupo de notas que contraria a divisão natural do compasso: toca-se um número de figuras diferente do que caberia ali.\n\n' +
        'Escreve-se um **número** sobre ou sob o grupo, frequentemente com colchete. O número diz quantas figuras há; o contexto diz quantas caberiam.\n\n' +
        'A quiáltera mais comum é a **tercina**: três figuras no lugar de duas. Em seguida vêm a **quintina** (cinco por quatro), a **sextina** (seis por quatro) e a **septina** (sete por quatro).',
    },
    {
      kind: 'MARKDOWN',
      id: 'c32_dois_tipos',
      markdown:
        '## Quiáltera de aumento e de diminuição\n\n' +
        'A distinção costuma escapar, e é simples.\n\n' +
        'A quiáltera é de **diminuição** quando contém **mais** figuras do que caberiam: três colcheias no tempo de duas. Cada figura é tocada mais depressa que o seu valor escrito.\n\n' +
        'A quiáltera é de **aumento** quando contém **menos**: duas colcheias no tempo de três, em compasso composto. Cada figura é tocada mais devagar que o valor escrito. Chama-se **duína**, e é o recurso oposto da tercina.\n\n' +
        'A regra geral: mais figuras que o normal, cada uma encolhe; menos figuras, cada uma estica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c32_composto',
      markdown:
        '## Quiáltera em compasso composto\n\n' +
        'Em compasso composto o tempo já se divide por três. Uma tercina ali não teria sentido — seria a divisão normal.\n\n' +
        'O que contraria a norma em compasso composto é a **duína** (duas no lugar de três) e a **quatrina** (quatro no lugar de três). São elas que produzem, em 6/8, o efeito de deslocamento que a tercina produz em 2/4.\n\n' +
        'A simetria é exata: cada sistema de divisão tem como quiáltera a divisão do outro.',
    },
    {
      kind: 'CALLOUT',
      id: 'c32_call',
      type: 'tip',
      title: 'Como se aprende a tocar tercina',
      text:
        'Não se conta "um-dois-três" depressa: isso produz tercina desigual. Conta-se uma palavra de três sílabas iguais dentro do tempo — "la-ra-ja", "a-ba-ca" — e mantém-se o pulso batendo no pé. A tercina precisa ser regular POR DENTRO, e é essa regularidade que o método por sílabas garante.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c32_audio',
      title: 'Tercinas sobre pulso constante',
      description: 'Três notas por tempo, com o pulso constante por baixo.',
      notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F4'],
      playMode: 'SEQUENCE',
      bpm: 160,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c32_check',
      question: 'Em compasso 6/8, que quiáltera contraria a divisão natural?',
      options: [
        'A tercina',
        'A sextina',
        'A duína',
        'Nenhuma; 6/8 não admite quiáltera',
      ],
      correctIndex: 2,
      explanation:
        'Em 6/8 o tempo já se divide por três, e a tercina seria a divisão normal. Quem contraria é a duína: duas figuras no lugar de três.',
    },
  ],

  // -------------------------------------------------------------------------
  33: [
    {
      kind: 'MARKDOWN',
      id: 'c33_intro',
      markdown:
        '**Dinâmica** é a indicação de intensidade. Escreve-se abaixo da pauta nos instrumentos, e acima nas partes vocais.\n\n' +
        '| Sinal | Termo | Sentido |\n' +
        '|---|---|---|\n' +
        '| ppp | pianississimo | o mais fraco possível |\n' +
        '| pp | pianissimo | muito fraco |\n' +
        '| p | piano | fraco |\n' +
        '| mp | mezzo-piano | meio fraco |\n' +
        '| mf | mezzo-forte | meio forte |\n' +
        '| f | forte | forte |\n' +
        '| ff | fortissimo | muito forte |\n' +
        '| fff | fortississimo | o mais forte possível |\n\n' +
        'A escala continua nos dois extremos — há partituras com quatro e cinco letras —, e a cada letra acrescentada o sentido é apenas "mais ainda".',
    },
    {
      kind: 'MARKDOWN',
      id: 'c33_transicoes',
      markdown:
        '## Mudanças graduais e acentos\n\n' +
        '**Crescendo** (*cresc.*) — aumentar progressivamente. Sinal: duas linhas que se abrem.\n\n' +
        '**Diminuendo** (*dim.*) ou **decrescendo** — diminuir progressivamente. Sinal: duas linhas que se fecham.\n\n' +
        'Os sinais angulares e as abreviaturas escritas são equivalentes; usam-se os primeiros em trechos curtos e as segundas em trechos longos.\n\n' +
        'Acentos pontuais:\n' +
        '- **sf** / **sfz** (*sforzando*) — ataque súbito e forte numa nota isolada\n' +
        '- **fp** — forte imediatamente seguido de piano\n' +
        '- **rfz** (*rinforzando*) — reforço de um trecho breve, não de uma nota só\n' +
        '- **>** — acento na nota\n' +
        '- **subito p** / **subito f** — mudança abrupta, sem transição',
    },
    {
      kind: 'CALLOUT',
      id: 'c33_call',
      type: 'warning',
      title: 'Dinâmica é relativa, não absoluta',
      text:
        'Um pianissimo de quarteto de cordas e um pianissimo de orquestra sinfônica são volumes completamente diferentes. A dinâmica indica uma posição DENTRO da escala daquela obra e daquele efetivo — nunca um número de decibéis. Por isso a mesma letra pede execuções distintas em contextos distintos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c33_pratica',
      markdown:
        '## O que a dinâmica realmente organiza\n\n' +
        'A função da dinâmica não é apenas variar o volume: é construir **relevo**.\n\n' +
        'Numa textura de várias vozes, a dinâmica separa o que é primeiro plano do que é acompanhamento. Num trecho longo, ela desenha a curva que leva ao ponto culminante. Numa repetição literal, ela é frequentemente a única coisa que muda — e por isso decide o sentido da repetição.\n\n' +
        'Tocar todas as dinâmicas escritas e ainda assim tocar sem relevo é possível, e é um dos defeitos mais comuns da execução mecânica.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c33_check',
      question: 'O que indica fp?',
      options: [
        'Crescer de forte a piano',
        'Forte seguido imediatamente de piano',
        'Muito forte',
        'Forte apenas na primeira nota do grupo',
      ],
      correctIndex: 1,
      explanation:
        'fp pede um ataque forte e a queda imediata a piano, sem transição. Não é gradual.',
    },
  ],

  // -------------------------------------------------------------------------
  34: [
    {
      kind: 'MARKDOWN',
      id: 'c34_intro',
      markdown:
        'Além de velocidade e intensidade, a partitura indica **caráter** — o modo como a música deve ser tocada, e não a que velocidade nem com que força.\n\n' +
        'Essas indicações aparecem junto ao termo de andamento, muitas vezes formando uma expressão só: *Allegro con brio*, *Andante cantabile*, *Adagio sostenuto*. O primeiro termo dá a velocidade; o segundo, o espírito.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c34_termos',
      markdown:
        '## Indicações de caráter mais frequentes\n\n' +
        '| Termo | Sentido |\n' +
        '|---|---|\n' +
        '| cantabile | como quem canta |\n' +
        '| dolce | doce, suave |\n' +
        '| espressivo | com expressão |\n' +
        '| con brio | com vigor |\n' +
        '| con fuoco | com fogo |\n' +
        '| con moto | com movimento |\n' +
        '| grazioso | gracioso |\n' +
        '| maestoso | majestoso |\n' +
        '| scherzando | brincando |\n' +
        '| sostenuto | sustentado |\n' +
        '| tranquillo | tranquilo |\n' +
        '| appassionato | apaixonado |\n' +
        '| risoluto | resoluto, decidido |\n' +
        '| lamentoso | queixoso |\n' +
        '| semplice | simples, sem afetação |\n\n' +
        'Alguns desses termos afetam indiretamente o andamento — *sostenuto* tende a segurar, *con moto* tende a empurrar —, mas o que eles designam primariamente é atitude.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c34_modificadores',
      markdown:
        '## Modificadores\n\n' +
        'Alguns termos não significam nada sozinhos: apenas modificam outro.\n\n' +
        '- **molto** — muito\n' +
        '- **poco** — pouco; **poco a poco** — pouco a pouco\n' +
        '- **assai** — bastante\n' +
        '- **meno** — menos; **più** — mais\n' +
        '- **quasi** — quase\n' +
        '- **ma non troppo** — mas não demais\n' +
        '- **sempre** — sempre, continuamente\n' +
        '- **subito** — súbito, de repente\n\n' +
        'Combinam-se livremente: *Allegro ma non troppo*, *poco a poco crescendo*, *sempre staccato*, *più mosso*. Conhecer a dúzia de modificadores dispensa decorar centenas de expressões compostas.',
    },
    {
      kind: 'CALLOUT',
      id: 'c34_call',
      type: 'info',
      title: 'Por que italiano',
      text:
        'A notação moderna consolidou-se na Itália entre os séculos XVI e XVIII, e as indicações viajaram com ela. Compositores de outras línguas passaram a escrever em alemão, francês ou português a partir do século XIX — e, mesmo assim, o italiano permaneceu como vocabulário comum, porque já era compreendido em toda parte.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c34_check',
      question: 'O que significa "Allegro ma non troppo"?',
      options: [
        'Rápido e muito',
        'Rápido, mas não demais',
        'Rápido no começo e lento depois',
        'Rápido e forte',
      ],
      correctIndex: 1,
      explanation:
        '*ma non troppo* é um modificador que atenua: pede o andamento indicado sem exagero.',
    },
  ],

  // -------------------------------------------------------------------------
  35: [
    {
      kind: 'MARKDOWN',
      id: 'c35_intro',
      markdown:
        'Chamam-se **exóticas**, na terminologia tradicional, as escalas provenientes de tradições musicais fora do sistema tonal europeu. O termo é herdado e impreciso — para quem está dentro dessas tradições, a exótica é a nossa —, mas é o que a bibliografia consagrou.\n\n' +
        'O que importa é o fato técnico: são organizações de alturas com distribuições de intervalos que a escala diatônica não produz, e que por isso soam imediatamente distintas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c35_pentatonicas',
      markdown:
        '## Pentatônicas\n\n' +
        'Cinco notas, **sem semitons**. É provavelmente a formação escalar mais difundida do planeta, presente de forma independente na China, na África subsaariana, na Escócia, nos Andes e no blues.\n\n' +
        '**Pentatônica maior** — I, II, III, V, VI. Sobre dó: dó, ré, mi, sol, lá.\n' +
        '**Pentatônica menor** — I, III♭, IV, V, VII♭. Sobre lá: lá, dó, ré, mi, sol.\n\n' +
        'As duas são **modos uma da outra**, exatamente como maior e relativa menor.\n\n' +
        'A ausência de semitom explica a difusão: sem semitom não há atrito, e qualquer combinação de notas soa aceitável. É por isso que as teclas pretas do piano, que formam uma pentatônica, permitem improvisar sem erro audível.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c35_audio_penta',
      title: 'Pentatônica maior sobre dó',
      description: 'Cinco notas, nenhum semitom. Nada atrita.',
      notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 92,
    },
    {
      kind: 'MARKDOWN',
      id: 'c35_outras',
      markdown:
        '## Outras formações\n\n' +
        '**Escala cigana** ou húngara — tem **duas** segundas aumentadas, entre II–III e VI–VII. O salto característico repete-se, e é essa dupla ocorrência que produz o caráter.\n\n' +
        '**Escala árabe** e os **maqamat** — o sistema árabe divide a oitava em intervalos menores que o semitom temperado, incluindo o chamado três-quartos de tom. A notação ocidental não consegue escrevê-los sem sinais adicionais, e qualquer transcrição em doze semitons é aproximação.\n\n' +
        '**Escalas de outras tradições asiáticas** — vários sistemas organizam-se por princípios que não a divisão em doze partes iguais, e alguns não tomam a oitava como unidade de repetição.\n\n' +
        '**Escala de blues** — pentatônica menor acrescida da quinta diminuta. Na prática vocal e instrumental de origem, as notas características são de altura flexível, tocadas entre os graus temperados — as chamadas *blue notes*, que a grafia em doze semitons também apenas aproxima.',
    },
    {
      kind: 'CALLOUT',
      id: 'c35_call',
      type: 'warning',
      title: 'O limite da nossa notação',
      text:
        'Boa parte do que se chama de escala exótica NÃO cabe na pauta de doze semitons. Transcrever um maqam ou uma escala de gamelão em notação ocidental produz uma aproximação que perde justamente o que caracteriza o sistema. É preciso saber que a transcrição é uma tradução, e não o original.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c35_check',
      question: 'Por que a pentatônica permite improvisar sem produzir atrito?',
      options: [
        'Porque tem poucas notas',
        'Porque não contém semitons',
        'Porque é sempre maior',
        'Porque não tem tônica',
      ],
      correctIndex: 1,
      explanation:
        'A ausência de semitons elimina os intervalos de maior atrito. Qualquer combinação de notas da escala soa aceitável sobre a harmonia correspondente.',
    },
  ],

  // -------------------------------------------------------------------------
  36: [
    {
      kind: 'MARKDOWN',
      id: 'c36_intro',
      markdown:
        'A notação desenvolveu um conjunto de **abreviaturas**: sinais que encurtam a escrita sem alterar em nada o que se toca. Existem por economia de papel e de tempo de cópia — razão histórica que hoje se traduz em legibilidade.\n\n' +
        'Quem não as conhece simplesmente não consegue ler a partitura, porque o que está escrito não se parece com o que deve soar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c36_repeticao',
      markdown:
        '## Sinais de repetição\n\n' +
        '**Barras de repetição** — dois pontos junto à barra dupla delimitam o trecho a repetir. Se não há barra de abertura, repete-se desde o início.\n\n' +
        '**Casas 1 e 2** (ou primeira e segunda vez) — colchetes numerados sobre os compassos finais do trecho. Na primeira passagem toca-se a casa 1; na repetição, pula-se para a casa 2. Podem existir três ou mais casas.\n\n' +
        '**Da capo (D.C.)** — voltar ao início.\n' +
        '**Dal segno (D.S.)** — voltar ao sinal §.\n' +
        '**al Fine** — e terminar onde estiver escrito *Fine*.\n' +
        '**al Coda** / **To Coda** — ao chegar no sinal ⊕, saltar para a seção final marcada como *Coda*.\n\n' +
        'Combinam-se: *D.S. al Coda* significa voltar ao segno, tocar até o sinal de coda e então saltar para a coda.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c36_compasso',
      markdown:
        '## Repetição de compasso e de grupo\n\n' +
        '**Compasso igual ao anterior** — o sinal ⁄. com dois pontos, centrado no compasso, manda repetir integralmente o compasso precedente.\n\n' +
        '**Dois compassos iguais** — o mesmo sinal atravessando a barra, com o número 2.\n\n' +
        '**Grupo repetido** — uma barra oblíqua sobre a haste manda repetir o grupo de figuras anterior dentro do tempo.\n\n' +
        '**Compassos de pausa múltipla** — um traço grosso com um número acima indica quantos compassos inteiros de silêncio há. É indispensável em partes de orquestra, onde um instrumento pode passar trinta compassos calado.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c36_tremolo',
      markdown:
        '## Tremolo e abreviatura de figuras\n\n' +
        'Barras oblíquas cortando a haste de uma nota indicam que ela deve ser **subdividida** em figuras menores. Uma barra significa colcheias, duas significam semicolcheias, três significam fusas.\n\n' +
        'Uma mínima com duas barras vale duas semínimas de semicolcheias repetidas: escreve-se uma figura e tocam-se oito.\n\n' +
        'Entre **duas** notas diferentes, as mesmas barras indicam **tremolo**: alternância rápida entre elas, repetida pela duração escrita.\n\n' +
        'Há ainda o **tremolo indeterminado** das cordas, com três barras e sem ritmo fixo, que pede repetição o mais rápido possível sem contagem.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c36_oitava',
      markdown:
        '## Sinais de oitava\n\n' +
        '**8va** sobre a pauta — tocar uma oitava acima do escrito.\n' +
        '**8vb** sob a pauta — tocar uma oitava abaixo.\n' +
        '**15ma** — duas oitavas acima. O número é 15, e não 16, pela mesma aritmética das inversões: duas oitavas somadas compartilham a nota do meio.\n\n' +
        'A linha tracejada que segue o sinal indica até onde ele vale; termina com um pequeno gancho descendente. Servem exatamente ao mesmo propósito das claves alternativas: evitar acúmulo de linhas suplementares.',
    },
    {
      kind: 'CALLOUT',
      id: 'c36_call',
      type: 'tip',
      title: 'Antes de tocar, mapeie os saltos',
      text:
        'Uma partitura com D.S. al Coda, três casas e repetições aninhadas tem um percurso que não é o da esquerda para a direita. Vale marcar com lápis a ordem real dos compassos ANTES de tentar tocar — errar o caminho em ensaio custa mais tempo do que mapeá-lo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c36_check',
      question: 'O que significa "D.S. al Coda"?',
      options: [
        'Voltar ao início e tocar até o fim',
        'Voltar ao sinal, tocar até a marca de coda e saltar para a coda',
        'Repetir o último compasso',
        'Tocar uma oitava acima',
      ],
      correctIndex: 1,
      explanation:
        'Dal segno manda voltar ao §; al Coda manda, ao encontrar a marca ⊕, saltar para a seção final.',
    },
  ],

  // -------------------------------------------------------------------------
  37: [
    {
      kind: 'MARKDOWN',
      id: 'c37_intro',
      markdown:
        'Há um conjunto de termos que aparecem nas partituras e que não se deduzem de nada: é preciso conhecê-los. Reúnem-se aqui os de uso mais frequente, agrupados pelo que governam.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c37_execucao',
      markdown:
        '## Termos de execução\n\n' +
        '| Termo | Sentido |\n' +
        '|---|---|\n' +
        '| tutti | todos tocam |\n' +
        '| solo | um só |\n' +
        '| soli | um naipe inteiro em destaque |\n' +
        '| divisi (div.) | o naipe divide-se em partes |\n' +
        '| unisono (unis.) | volta a tocar junto |\n' +
        '| a due (a2) | dois executantes na mesma linha |\n' +
        '| loco | voltar ao registro escrito, após 8va |\n' +
        '| simile | continuar do mesmo modo |\n' +
        '| segue | prosseguir sem interrupção |\n' +
        '| attacca | emendar o movimento seguinte sem pausa |\n' +
        '| G.P. | pausa geral: todos calam |\n' +
        '| tacet | o instrumento não toca esta seção |',
    },
    {
      kind: 'MARKDOWN',
      id: 'c37_instrumentos',
      markdown:
        '## Termos de técnica instrumental\n\n' +
        '**Cordas** — *arco* (com o arco), *pizzicato* (pinçado), *col legno* (com a madeira do arco), *sul ponticello* (junto ao cavalete, som metálico), *sul tasto* (sobre o espelho, som abafado), *con sordina* (com surdina), *senza sordina* (sem surdina).\n\n' +
        '**Teclado** — *con pedale*, *senza pedale*, *una corda* (pedal esquerdo), *tre corde* (sem o pedal esquerdo), *m.d.* e *m.e.* (mão direita e mão esquerda).\n\n' +
        '**Sopros** — *flatterzunge* (frulato), *bouché* (som tapado, na trompa), *campana in aria* (pavilhão ao alto).\n\n' +
        '**Voz** — *a bocca chiusa* (boca fechada), *parlato* (falado), *sotto voce* (a meia voz).',
    },
    {
      kind: 'CALLOUT',
      id: 'c37_call',
      type: 'info',
      title: 'Não é vocabulário de decorar',
      text:
        'Ninguém decora uma lista dessas. Consulta-se conforme aparece, e a repetição faz o resto. O que convém memorizar são os que mudam radicalmente a execução — pizzicato, con sordina, divisi — porque errá-los produz um resultado audivelmente errado.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c37_check',
      question: 'O que indica "attacca" no fim de um movimento?',
      options: [
        'Tocar mais forte',
        'Emendar o movimento seguinte sem pausa',
        'Repetir o movimento',
        'Atacar cada nota com acento',
      ],
      correctIndex: 1,
      explanation:
        '*Attacca* proíbe a pausa entre movimentos: o seguinte começa imediatamente, sem intervalo.',
    },
  ],

  // -------------------------------------------------------------------------
  38: [
    {
      kind: 'MARKDOWN',
      id: 'c38_intro',
      markdown:
        '**Escala geral** é o conjunto de todas as alturas que o sistema é capaz de escrever, do mais grave ao mais agudo, reunidas numa referência única.\n\n' +
        'Ela é maior do que o ouvido humano alcança e muito maior do que qualquer instrumento produz. Serve como mapa: é nela que se situa a extensão de cada voz e de cada instrumento.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c38_registros',
      markdown:
        '## Os registros\n\n' +
        'A escala geral divide-se convencionalmente em regiões.\n\n' +
        '**Subgrave** — abaixo da extensão da voz humana; domínio do contrabaixo, do contrafagote e dos registros graves do órgão. As alturas são percebidas tanto como som quanto como vibração.\n\n' +
        '**Grave** — região do baixo vocal, do violoncelo, do fagote, da tuba.\n\n' +
        '**Médio** — a região central, onde a voz humana e a maior parte dos instrumentos são mais confortáveis e mais expressivos.\n\n' +
        '**Agudo** — soprano, violino, flauta, trompete.\n\n' +
        '**Superagudo** — o extremo, onde a percepção de altura começa a se degradar e o timbre se estreita.\n\n' +
        'As fronteiras não são exatas, e é justamente por isso que se usam sete claves: cada uma centraliza uma faixa da escala geral dentro das cinco linhas da pauta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c38_extensoes',
      markdown:
        '## Extensão, tessitura e âmbito\n\n' +
        'Três palavras que não são sinônimas.\n\n' +
        '**Extensão** — tudo o que o instrumento ou a voz consegue produzir, do limite grave ao limite agudo.\n\n' +
        '**Tessitura** — a faixa dentro dessa extensão em que o som é confortável e soa bem por tempo prolongado. É sempre menor que a extensão.\n\n' +
        '**Âmbito** — a faixa efetivamente usada numa peça determinada.\n\n' +
        'Escrever dentro da extensão mas fora da tessitura produz partes tocáveis e desconfortáveis — erro frequente de quem orquestra pela tabela de limites.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c38_check',
      question: 'Qual a diferença entre extensão e tessitura?',
      options: [
        'Nenhuma; são sinônimos',
        'Extensão é tudo o que se consegue produzir; tessitura é a faixa confortável dentro dela',
        'Tessitura é mais ampla que extensão',
        'Extensão vale para vozes e tessitura para instrumentos',
      ],
      correctIndex: 1,
      explanation:
        'A extensão são os limites absolutos; a tessitura é a região confortável e sustentável, sempre menor que a extensão.',
    },
  ],

  // -------------------------------------------------------------------------
  39: [
    {
      kind: 'MARKDOWN',
      id: 'c39_intro',
      markdown:
        'Uma altura precisa ser nomeada de forma inequívoca: dizer "dó" não basta, porque existem muitos dós. Os sistemas de nomenclatura resolvem isso acrescentando um índice.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c39_sistemas',
      markdown:
        '## Os sistemas em uso\n\n' +
        '**Índice acústico internacional** — o mais usado hoje. A letra seguida de um número, em que a oitava muda **a cada dó**. O dó central é **C4**, o lá de afinação é **A4** (440 Hz), e o dó uma oitava abaixo do central é C3.\n\n' +
        '**Nomenclatura alemã** — usa maiúsculas para o registro grave e minúsculas com linhas para o agudo: C, c, c′, c″. Aparece em edições e em literatura musicológica de língua alemã.\n\n' +
        '**Nomenclatura por registro nomeado** — dó grave, dó médio, dó agudo. É imprecisa e sobrevive na conversa cotidiana.\n\n' +
        'Uma peculiaridade do sistema alfabético que já apareceu no capítulo II vale recordar: em alemão, **B** designa o si bemol, e o si natural é escrito **H**. Ler "B" numa edição alemã como si natural é erro grosseiro e frequente.',
    },
    {
      kind: 'CALLOUT',
      id: 'c39_call',
      type: 'info',
      title: 'Por que o dó central é C4 e não C1',
      text:
        'Porque a numeração começa em C0, uma nota abaixo do que a maioria dos instrumentos produz, e conta para cima. O dó central cai no quarto grupo. A escolha é convenção de acústica, não de música — e é por isso que ela às vezes parece arbitrária a quem vem da partitura.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c39_teclado',
      title: 'Três dós, três índices',
      highlightNotes: ['C3', 'C4', 'C5'],
      startOctave: 3,
      octaves: 3,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c39_check',
      question: 'Numa edição alemã, a letra B designa que nota?',
      options: ['Si natural', 'Si bemol', 'Dó', 'Lá'],
      correctIndex: 1,
      explanation:
        'Na tradição alemã, B é o si bemol e H é o si natural. Confundir os dois altera a nota tocada.',
    },
  ],

  // -------------------------------------------------------------------------
  40: [
    {
      kind: 'MARKDOWN',
      id: 'c40_intro',
      markdown:
        '**Acorde** é a combinação de três ou mais sons simultâneos. O **acorde de quinta**, ou **tríade**, é o mais simples: três notas empilhadas por terças.\n\n' +
        '- **Fundamental** — a nota sobre a qual o acorde se constrói e que lhe dá o nome.\n' +
        '- **Terça** — uma terça acima da fundamental. É ela que decide se o acorde é maior ou menor.\n' +
        '- **Quinta** — uma quinta acima da fundamental. É ela que decide se o acorde é perfeito, aumentado ou diminuto.\n\n' +
        'O nome "acorde de quinta" vem do intervalo entre a nota mais grave e a mais aguda no estado fundamental.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c40_quatro',
      markdown:
        '## As quatro qualidades\n\n' +
        '| Qualidade | Terça | Quinta | Sobre dó |\n' +
        '|---|---|---|---|\n' +
        '| Maior | maior | justa | dó–mi–sol |\n' +
        '| Menor | menor | justa | dó–mi♭–sol |\n' +
        '| Diminuto | menor | diminuta | dó–mi♭–sol♭ |\n' +
        '| Aumentado | maior | aumentada | dó–mi–sol♯ |\n\n' +
        'Duas dessas tríades são **simétricas**: a diminuta empilha duas terças menores, e a aumentada empilha duas terças maiores. A simetria tem consequência prática — a tríade aumentada tem apenas quatro formas distintas no total, porque suas inversões produzem outras tríades aumentadas.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c40_lab_maior',
      title: 'Tríade maior',
      notes: ['C4', 'E4', 'G4'],
      prompt: 'Terça maior embaixo, menor em cima. Estável e claro.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c40_lab_menor',
      title: 'Tríade menor',
      notes: ['C4', 'D#4', 'G4'],
      prompt: 'Terça menor embaixo. Mesma quinta, caráter oposto.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c40_lab_dim',
      title: 'Tríade diminuta',
      notes: ['B3', 'D4', 'F4'],
      prompt: 'Duas terças menores. A quinta diminuta traz o trítono para dentro do acorde.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c40_lab_aum',
      title: 'Tríade aumentada',
      notes: ['C4', 'E4', 'G#4'],
      prompt: 'Duas terças maiores. Simétrica, e por isso sem direção definida.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c40_campo',
      markdown:
        '## As tríades sobre os graus da escala\n\n' +
        'Construindo uma tríade sobre cada grau da escala maior, usando só as notas da tonalidade, obtêm-se sete acordes com qualidades fixas:\n\n' +
        '| Grau | Qualidade | Em dó maior |\n' +
        '|---|---|---|\n' +
        '| I | maior | dó |\n' +
        '| II | menor | ré menor |\n' +
        '| III | menor | mi menor |\n' +
        '| IV | maior | fá |\n' +
        '| V | maior | sol |\n' +
        '| VI | menor | lá menor |\n' +
        '| VII | diminuto | si diminuto |\n\n' +
        'A sequência **M m m M M m dim** é a mesma em **qualquer** tonalidade maior — ela depende do padrão de tons e semitons, não das notas. Decorá-la resolve a análise de boa parte do repertório.\n\n' +
        'Na escala menor natural o padrão é **m dim M m m M M**, e a menor harmônica o altera de modo decisivo ao elevar o VII: o V torna-se **maior**, que é justamente a razão de ser daquela alteração.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c40_check',
      question: 'Que tríade se forma sobre o VII grau de uma escala maior?',
      options: ['Maior', 'Menor', 'Diminuta', 'Aumentada'],
      correctIndex: 2,
      explanation:
        'Em dó maior, si–ré–fá: terça menor e quinta diminuta. A tríade do VII grau é diminuta em qualquer tonalidade maior.',
    },
  ],

  // -------------------------------------------------------------------------
  41: [
    {
      kind: 'MARKDOWN',
      id: 'c41_intro',
      markdown:
        'Além das quatro qualidades básicas, a quinta da tríade pode ser alterada isoladamente, produzindo acordes que não pertencem ao campo diatônico.\n\n' +
        'A alteração mais frequente é a que gera a **tríade aumentada** a partir de uma maior — elevando a quinta em um semitom. Como o acorde resultante é simétrico, ele perde a direção e pode resolver de vários modos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c41_uso',
      markdown:
        '## Como o acorde alterado funciona\n\n' +
        'A quinta alterada raramente é decorativa: quase sempre ela é uma **nota em movimento** capturada no acorde.\n\n' +
        'A quinta **elevada** tende a subir, resolvendo por semitom na nota seguinte. Uma sequência frequente é a dominante com quinta aumentada resolvendo na terça do acorde de tônica.\n\n' +
        'A quinta **abaixada** tende a descer, e frequentemente prepara uma cadência ou um acorde de sexta aumentada.\n\n' +
        'Ler o acorde alterado como condução de voz, e não como sonoridade isolada, é o que torna a análise compreensível: o acidente que parece estranho está ali porque uma voz está caminhando.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c41_lab_5aum',
      title: 'Tríade maior com quinta aumentada',
      notes: ['C4', 'E4', 'G#4'],
      prompt: 'A quinta subiu meio tom. Ouça a tensão para cima.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c41_lab_5dim',
      title: 'Tríade maior com quinta abaixada',
      notes: ['C4', 'E4', 'F#4'],
      prompt: 'A quinta desceu meio tom. Ouça a tensão para baixo — e o trítono contra a fundamental.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c41_check',
      question: 'Por que a tríade aumentada não tem direção definida de resolução?',
      options: [
        'Porque é dissonante demais',
        'Porque é simétrica: empilha duas terças maiores iguais',
        'Porque não existe na escala maior',
        'Porque tem quatro notas',
      ],
      correctIndex: 1,
      explanation:
        'Sendo simétrica, qualquer uma das três notas pode ser ouvida como fundamental, e o acorde pode resolver em várias direções igualmente plausíveis.',
    },
  ],

  // -------------------------------------------------------------------------
  42: [
    {
      kind: 'MARKDOWN',
      id: 'c42_intro',
      markdown:
        'Um acorde está no **estado fundamental** quando a fundamental é a nota mais grave. Quando outra nota ocupa o baixo, o acorde está **invertido**.\n\n' +
        'A tríade tem três notas e, portanto, três disposições possíveis:\n\n' +
        '**Estado fundamental** — fundamental no baixo. Intervalos acima do baixo: terça e quinta.\n' +
        '**Primeira inversão** — a **terça** no baixo. Intervalos: terça e sexta.\n' +
        '**Segunda inversão** — a **quinta** no baixo. Intervalos: quarta e sexta.\n\n' +
        'Repare: o acorde continua sendo o mesmo. As notas são as mesmas, a fundamental é a mesma, o nome é o mesmo. O que muda é qual delas está embaixo.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c42_lab_fund',
      title: 'Dó maior — estado fundamental',
      notes: ['C4', 'E4', 'G4'],
      prompt: 'Dó no baixo. Máxima estabilidade.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c42_lab_1inv',
      title: 'Dó maior — primeira inversão',
      notes: ['E4', 'G4', 'C5'],
      prompt: 'Mi no baixo. Mais leve, mais móvel, ainda consonante.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c42_lab_2inv',
      title: 'Dó maior — segunda inversão',
      notes: ['G4', 'C5', 'E5'],
      prompt: 'Sol no baixo. Ouça a instabilidade: este acorde quer ir a outro lugar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c42_efeito',
      markdown:
        '## O que cada inversão produz\n\n' +
        'O **estado fundamental** é o mais estável. É onde se conclui.\n\n' +
        'A **primeira inversão** é leve e fluida. Usa-se para suavizar o baixo, para dar movimento por graus conjuntos e para evitar saltos desnecessários na linha grave.\n\n' +
        'A **segunda inversão** é **instável**, e a razão é precisa: o intervalo de quarta justa contra o baixo é tratado como dissonância. O acorde não se sustenta sozinho e exige continuação.\n\n' +
        'Os usos consagrados da segunda inversão são poucos e bem definidos: a **cadencial**, em que o acorde de tônica em segunda inversão prepara a dominante no tempo forte; a **de passagem**, com o baixo caminhando por graus conjuntos; e a **de bordadura**, com o baixo repetido. Fora desses casos, ela soa mal colocada — e essa não é regra de gosto, é consequência da quarta contra o baixo.',
    },
    {
      kind: 'CALLOUT',
      id: 'c42_call',
      type: 'tip',
      title: 'Como identificar a inversão',
      text:
        'Olhe a nota mais grave e pergunte que função ela tem no acorde. Se é a fundamental, estado fundamental. Se é a terça, primeira inversão. Se é a quinta, segunda inversão. As notas agudas não interferem nessa análise: a inversão é decidida exclusivamente pelo baixo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c42_check',
      question: 'Por que a segunda inversão é considerada instável?',
      options: [
        'Porque contém terça menor',
        'Porque a quarta justa contra o baixo é tratada como dissonância',
        'Porque a fundamental não aparece',
        'Porque tem só três notas',
      ],
      correctIndex: 1,
      explanation:
        'Na segunda inversão, o intervalo entre o baixo e a fundamental é de quarta justa — dissonante contra o baixo, e portanto exigindo resolução.',
    },
  ],

  // -------------------------------------------------------------------------
  43: [
    {
      kind: 'MARKDOWN',
      id: 'c43_intro',
      markdown:
        '**Cifra** é a representação de um acorde por um símbolo compacto. Ela descreve o acorde — que notas o compõem — sem prescrever como distribuí-lo, o que fica a critério de quem toca.\n\n' +
        'É por isso que a cifra é o sistema da música popular, do choro ao jazz: ela dá a harmonia e deixa a realização em aberto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c43_leitura',
      markdown:
        '## Como se lê uma cifra\n\n' +
        'A cifra tem três partes, e a ordem é fixa.\n\n' +
        '**1. A letra** — a fundamental. C, D, E, F, G, A, B, com acidentes se necessário. Sozinha, significa tríade maior.\n\n' +
        '**2. A qualidade:**\n' +
        '- **m** ou **−** — menor: Cm, Am\n' +
        '- **°** ou **dim** — diminuto: C°\n' +
        '- **+** ou **aug** — aumentado: C+\n' +
        '- **sus4** — a terça é substituída pela quarta: Csus4\n' +
        '- **sus2** — a terça é substituída pela segunda: Csus2\n\n' +
        '**3. O baixo**, quando é diferente da fundamental — indicado por uma barra: **C/E** significa acorde de dó maior com mi no baixo, ou seja, primeira inversão.\n\n' +
        'A notação da barra é a forma corrente de escrever inversão em cifra, e também serve para baixos que nem pertencem ao acorde, como C/F♯.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c43_lab_sus4',
      title: 'Csus4',
      notes: ['C4', 'F4', 'G4'],
      prompt: 'A quarta no lugar da terça. Nem maior nem menor — e pedindo resolução na terça.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c43_vs_baixo',
      markdown:
        '## Cifra e baixo cifrado não são a mesma coisa\n\n' +
        'A **cifra moderna** parte da **fundamental**: o símbolo nomeia o acorde, e o baixo é uma informação adicional.\n\n' +
        'O **baixo cifrado** barroco parte do **baixo**: escreve-se a linha do baixo e, sob ela, números que indicam os intervalos a construir **acima daquela nota**. Um 6 significa sexta e terça acima do baixo; um 6/4 significa sexta e quarta.\n\n' +
        'Consequência: os mesmos três sons recebem símbolos diferentes nos dois sistemas. Dó maior com mi no baixo é **C/E** em cifra moderna e **6** sobre um mi em baixo cifrado.\n\n' +
        'Os dois sistemas convivem, e traduzir um para o outro é exercício obrigatório de quem estuda harmonia.',
    },
    {
      kind: 'CALLOUT',
      id: 'c43_call',
      type: 'warning',
      title: 'A cifra não é notação completa',
      text:
        'Ela informa quais notas soam, não em que oitava, em que disposição, com que ritmo nem com que condução de vozes. Duas realizações da mesma cifra podem soar completamente diferentes e ambas estarem corretas. Quem toca por cifra está compondo a realização — e isso é parte do sistema, não uma falha dele.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c43_check',
      question: 'O que significa a cifra Am/C?',
      options: [
        'Lá menor e dó maior tocados juntos',
        'Lá menor com dó no baixo — primeira inversão',
        'Lá menor com sétima',
        'Dó maior com lá no baixo',
      ],
      correctIndex: 1,
      explanation:
        'A letra antes da barra é o acorde; depois da barra, o baixo. Dó é a terça de lá menor, logo trata-se da primeira inversão.',
    },
  ],

  // -------------------------------------------------------------------------
  44: [
    {
      kind: 'MARKDOWN',
      id: 'c44_intro',
      markdown:
        '**Ornamentos** são notas acrescentadas à melodia principal para enfeitá-la. Escrevem-se por sinais convencionais ou por notas de tamanho reduzido, e a sua execução varia conforme o período e a região.\n\n' +
        'A **apojatura** é o ornamento mais importante, e o único que **toma tempo da nota principal**. Os demais cabem dentro da duração dela; a apojatura a encurta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c44_duas',
      markdown:
        '## Apojatura longa e apojatura breve\n\n' +
        'A **apojatura longa** toma, convencionalmente, **metade** da duração da nota principal — ou **dois terços**, se a principal for pontuada. Escreve-se como nota pequena sem traço na haste.\n\n' +
        'Ela cai **no tempo**, e não antes dele: o ouvinte percebe primeiro a apojatura, depois a resolução. É essa a origem do seu efeito expressivo — trata-se de uma dissonância acentuada resolvendo na nota consonante.\n\n' +
        'A **apojatura breve**, ou *acciaccatura*, é executada o mais rápido possível, tomando um tempo mínimo da principal. Escreve-se como nota pequena com um **traço oblíquo** cortando a haste. O traço é toda a diferença gráfica entre as duas.',
    },
    {
      kind: 'CALLOUT',
      id: 'c44_call',
      type: 'warning',
      title: 'A apojatura soa no tempo',
      text:
        'É o erro mais comum de execução: tocar a apojatura ANTES do tempo, como se fosse uma anacruse. Ela é uma dissonância acentuada — precisa cair no tempo forte para produzir o atrito que a justifica. Tocada antes, o efeito desaparece completamente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c44_funcao',
      markdown:
        '## Apojatura como nota estranha\n\n' +
        'Na análise harmônica, a apojatura é uma **nota estranha ao acorde** — não pertence à harmonia, e resolve por grau conjunto numa nota que pertence.\n\n' +
        'Isso a aparenta a outras notas estranhas: o **retardo**, que é preparado na harmonia anterior; a **antecipação**, que chega antes da mudança de acorde; a **bordadura**, que sai e volta; e a **nota de passagem**, que liga duas notas do acorde por grau conjunto.\n\n' +
        'O que distingue a apojatura é ser **acentuada e não preparada**: ela aparece de repente, no tempo forte, criando atrito, e resolve em seguida.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c44_audio',
      title: 'Apojatura e resolução',
      description:
        'A nota estranha cai no tempo e resolve por grau conjunto. Ouça o atrito e o alívio.',
      notes: ['D4', 'C4', 'F4', 'E4', 'A4', 'G4'],
      playMode: 'SEQUENCE',
      bpm: 72,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c44_check',
      question: 'O que distingue a apojatura dos demais ornamentos?',
      options: [
        'É executada mais rápido',
        'Toma parte da duração da nota principal',
        'Só aparece em música antiga',
        'Usa sempre a nota inferior',
      ],
      correctIndex: 1,
      explanation:
        'A apojatura ocupa tempo da nota principal, encurtando-a. Os demais ornamentos cabem dentro da duração dela sem reduzi-la.',
    },
  ],
};
