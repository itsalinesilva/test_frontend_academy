import { ArtigoDoConservatorio, novoArtigo } from '../domain/article';

/**
 * ARTIGOS DE FÁBRICA.
 *
 * São **autorais**. Usam o que as fontes trazem como insumo e dizem o que o
 * Conservatório conclui — nenhuma fonte é nomeada no texto, porque o texto é
 * nosso. A origem dos dados fica em `docs/harness/85_SOURCES_AND_COVERAGE.md`,
 * que é registro de engenharia e não sai daqui.
 *
 * POR QUE ESTES TRÊS
 * ------------------
 * A **auditoria** responde à pergunta que um acervo honesto precisa responder
 * sobre si mesmo: o que eu tenho, o que eu não tenho, e por quê. Sem ela, quem
 * consulta supõe que a ausência é do mundo.
 *
 * O **percurso de violino** faz o que um compêndio de método faz — ordenar o
 * repertório por dificuldade e explicar a ordem — sem reproduzir método
 * nenhum. As peças são de domínio público, a sequência é nossa, e o motivo de
 * cada uma está escrito.
 *
 * O **retrato do corpus brasileiro** existe porque a catalogação de origem do
 * concerto ocidental cobria o Brasil com quatro nomes, e o acervo passou a ter
 * setecentos e oitenta e três. Um salto desses precisa de um texto que diga de
 * onde ele veio.
 *
 * 🔴 O QUE NENHUM DELES PODE FAZER
 * --------------------------------
 * **Apresentar juízo de terceiro como apuração nossa.** As fontes publicam
 * curadorias — "recomendados", "mais buscados", "principais compositores" — e
 * elas são úteis. O que não se pode é escrever "os principais" ou "os mais
 * tocados": seriam medidas que ninguém fez aqui.
 *
 * Quando um recorte de fonte entra num artigo, o texto diz **de quem ele é** e
 * **o que ele mede**. "Os oito mais buscados no catálogo de origem" é
 * verificável; "os oito mais importantes" é opinião assinada por engano.
 */

export const SEED_ARTICLES: ArtigoDoConservatorio[] = [
  novoArtigo({
    id: 'art_auditoria_concerto_ocidental',
    tipo: 'AUDITORIA',
    titulo: 'Concerto ocidental: uma auditoria de repertório',
    subtitulo: 'O que o acervo cobre, o que não cobre, e o que isso significa para quem estuda',
    resumo:
      'O acervo cobre bem a espinha europeia de concerto, do Medieval ao século XX. Ficavam a descoberto a Antiguidade e o repertório brasileiro: a primeira por falta de música sobrevivente, e não de catalogação; o segundo por falta de quem o catalogasse. As duas foram medidas, e as duas mudaram de estado — este artigo diz como, e o que ainda não fecha.',
    etiquetas: ['acervo', 'auditoria', 'era_medieval', 'era_romantismo'],
    obras: [
      {
        obraId: 'obra-bar-canon-pachelbel',
        motivo:
          'O baixo obstinado é o procedimento barroco que atravessou três séculos. Está no acervo com edição própria, e serve de porta de entrada à era.',
      },
      {
        obraId: 'obra-rom-grieg-manha',
        motivo:
          'Representa o nacionalismo romântico, que é onde o acervo se afasta do eixo germânico-italiano pela primeira vez.',
      },
      {
        obraId: 'ant_epitafio_seikilos',
        motivo:
          'A peça mais completa que sobreviveu da Antiguidade: melodia e letra inteiras, gravadas numa coluna. Doze versos, e é o teto do que a era tem a oferecer em música notada.',
      },
      {
        obraId: 'ant_hinos_delficos',
        motivo:
          'Fragmentos em pedra, legíveis em parte. Estão aqui para mostrar o que "estado de conservação" significa numa ficha — e por que este campo substitui tonalidade nesta era.',
      },
      {
        obraId: 'ant_tratado_harmonica',
        motivo:
          'O que chegou inteiro da Antiguidade foi a teoria, e não a música. Catalogar um tratado como registro do acervo é a decisão que permitiu a era existir sem forçar ficha de obra onde não há obra.',
      },
      {
        obraId: 'guillaume-dufay--nuper-rosarum-flores',
        motivo:
          'A ponta fina da espinha europeia: o Medieval tem 161 obras contra as 10.389 do Romantismo, e a diferença é de sobrevivência, não de catalogação.',
      },
      {
        obraId: 'william-byrd--ad-dominum-cum-tribularer',
        motivo:
          'Byrd é um dos compositores em que o casamento com bibliotecas de partitura falha por sistema de catálogo: nosso registro usa uma numeração, a fonte de partitura usa outra.',
      },
      {
        obraId: 'mb-obra-108491',
        motivo:
          'Chiquinha Gonzaga escreveu opereta, e a catalogação de concerto ocidental não a registrava em nenhuma linha. É a medida mais direta do que o recorte de uma fonte esconde.',
      },
      {
        obraId: 'mb-obra-111307',
        motivo:
          'Nazareth, com 229 obras catalogadas, é o oposto exato da leitura antiga de que faltava repertório brasileiro. O que faltava era quem o catalogasse.',
      },
      {
        obraId: 'obra-bar-bach-prelude',
        motivo:
          'Uma das 17 que a plataforma reproduz — edição montada aqui, nota a nota. É a diferença entre saber onde a partitura está e poder tocá-la, que este artigo mede.',
      },
    ],
    pessoas: [
      {
        pessoaId: 'wolfgang-amadeus-mozart',
        papel: 'COMPOSITOR',
        motivo: 'Tem 53 obras nos recortes de destaque da fonte — o maior número de todos, e a medida de quanto aquela curadoria concentra no centro do cânone.',
      },
      {
        pessoaId: 'ludwig-van-beethoven',
        papel: 'COMPOSITOR',
        motivo: 'Segundo com 45, e o exemplo que a própria fonte usa para mostrar obra que está nas duas listas ao mesmo tempo — popular e recomendada.',
      },
      {
        pessoaId: 'johann-sebastian-bach',
        papel: 'COMPOSITOR',
        motivo: 'Terceiro com 41, e o compositor com mais obras do acervo inteiro: 978. A distância entre os dois números diz o que uma curadoria recorta.',
      },
      {
        pessoaId: 'heitor-villa-lobos',
        papel: 'COMPOSITOR',
        motivo: 'Nono com 26, e o único não-europeu entre os dez primeiros. Do lado brasileiro ele aparece por outra via inteira, com 250 obras.',
      },
      {
        pessoaId: 'guillaume-dufay',
        papel: 'COMPOSITOR',
        motivo: 'Representa a ponta fina da espinha europeia: o Medieval tem 161 obras contra as 10.389 do Romantismo, e a diferença é de sobrevivência.',
      },
      {
        pessoaId: 'william-byrd',
        papel: 'COMPOSITOR',
        motivo: 'O caso em que o cruzamento com biblioteca de partitura falha por sistema de catálogo: nosso registro usa uma numeração, a fonte de partitura usa outra.',
      },
      {
        pessoaId: 'mb-chiquinha-gonzaga',
        papel: 'COMPOSITOR',
        motivo: 'A catalogação de concerto ocidental não a tinha em nenhuma linha. É a medida mais direta do que o recorte de uma fonte esconde.',
      },
      {
        pessoaId: 'mb-ernesto-nazareth',
        papel: 'COMPOSITOR',
        motivo: 'Com 229 obras, é o oposto exato da leitura antiga de que faltava repertório brasileiro. O que faltava era quem o catalogasse.',
      },
    ],
    secoes: [
      {
        id: 'aud_00',
        ordem: 0,
        titulo: 'A curadoria do catálogo de origem, e o que ela é',
        markdown:
          'O catálogo de que este acervo nasceu marca duas coisas em cada obra, e são marcas binárias: **popular** e **recomendada**. Uma obra pode ter as duas, uma, ou nenhuma.\n\n' +
          'No que chegou aqui, isso dá:\n\n' +
          '| recorte da fonte | obras | com partitura localizada |\n' +
          '| :--- | ---: | ---: |\n' +
          '| recomendadas | 1.245 | 623 |\n' +
          '| populares | 401 | 215 |\n' +
          '| nas **duas** listas | 363 | — |\n\n' +
          'Do lado das pessoas, 204 compositores têm ao menos uma obra recomendada e 148 têm ao menos uma popular. A própria fonte mantém listas separadas de compositores em destaque — 23 populares e 77 recomendados —, e elas não são a mesma coisa que as marcas por obra.\n\n' +
          '🔴 **O que estes números não são.** Não são medida de execução: ninguém contou concertos. Não são linhagem, escola nem influência. E não são juízo do Conservatório.\n\n' +
          'A própria fonte conta que essas listas começaram a partir de verbetes de enciclopédia e de catálogos de biblioteca, e foram padronizadas depois. É curadoria útil, feita por gente que cataloga — e é exatamente por isso que ela entra aqui **com o nome de quem a fez**, e não como verdade musicológica.\n\n' +
          'Quem tem mais obra nesses recortes: Mozart (53), Beethoven (45), Bach (41), Schubert (33), Brahms e Dvořák (32 cada), Tchaikovsky (29), Haydn (27), **Villa-Lobos (26)** e Chopin (25). A nona posição vale um parágrafo: é o único não-europeu da lista, e é o mesmo Villa-Lobos que, do lado brasileiro, aparece por outra via inteira.',
      },
      {
        id: 'aud_01',
        ordem: 1,
        titulo: 'O que se pode dizer sobre um acervo',
        markdown:
          'Todo acervo tem recorte. O nosso não é exceção, e a diferença entre um catálogo confiável e um enganoso está em declarar qual é.\n\n' +
          'Um acervo que não diz o que não tem deixa quem consulta supor que a ausência é do **mundo**, e não do acervo. Quem procura música da Antiguidade e não encontra conclui que não há; quem procura repertório brasileiro e não encontra conclui a mesma coisa. As duas conclusões seriam erradas, e por motivos diferentes.',
      },
      {
        id: 'aud_02',
        ordem: 2,
        titulo: 'A espinha que está bem coberta',
        markdown:
          'Do canto medieval ao século XX, a música de concerto europeia está presente com densidade suficiente para sustentar o curso inteiro de história.\n\n' +
          'A distribuição é desigual, e a desigualdade é **verdadeira**: o Romantismo tem muito mais compositores catalogados que o Medieval. Isso não é falha de apuração — é o que sobreviveu, e o que a historiografia registrou.\n\n' +
          'Perseguir paridade de volume entre eras produziria preenchimento. O que se persegue é paridade de **qualidade do registro**: todo compositor com biografia, toda ficha dizendo o que se pode fazer com a obra.',
      },
      {
        id: 'aud_03',
        ordem: 3,
        titulo: 'A Antiguidade, e por que ela é outro problema',
        markdown:
          'O primeiro capítulo do curso trata da Antiguidade, e por muito tempo o acervo não teve obra nenhuma dela. A tentação era chamar isso de lacuna a preencher.\n\n' +
          'Não era. Sobreviveram cerca de quarenta fragmentos gregos notados, muitos ilegíveis, e o mais completo tem doze versos. **O que chegou inteiro foi a teoria**, não a música — e o capítulo do curso trata exatamente disso.\n\n' +
          'Forçar a ficha de obra ali seria o erro, e a era pedia outro tipo de registro: fragmento, tratado, sistema modal. Hoje são **oito registros**, e eles entraram como obras da era — com suporte, estado de conservação e datação no lugar de tonalidade e número de catálogo.\n\n' +
          'A lição vale além da Antiguidade: uma ficha com campos vazios porque **não há o que preencher** é diferente de uma ficha incompleta. A primeira está certa; a segunda é trabalho pela metade. Quem lê precisa conseguir distinguir as duas, e é a ficha que tem de dizer qual é qual.',
      },
      {
        id: 'aud_04',
        ordem: 4,
        titulo: 'O repertório brasileiro, que era o oposto',
        markdown:
          'Esta seção dizia que aqui não faltava música, faltava **edição**. Estava meio certa, e a metade errada era a que importava.\n\n' +
          'O acervo tinha quatro compositores brasileiros. A leitura óbvia era que o repertório carecia de edição digital; a leitura correta é que a **catalogação de origem** é do concerto ocidental, e cobre o Brasil pelos poucos nomes que atravessaram para as salas europeias. Villa-Lobos, Carlos Gomes, Camargo Guarnieri e Mignone estavam aqui por terem sido tocados em Milão e em Paris.\n\n' +
          'Hoje são **783 compositores e 6.917 obras**, e todas com o endereço da partitura. Nazareth tem 229; Chiquinha Gonzaga, que a catalogação ocidental não tinha em nenhuma linha, tem 156.\n\n' +
          'O que continua valendo é a conclusão sobre edição própria: das 6.917, o acervo tem **onde a partitura está**, e não o arquivo. Editorar é o caminho mais trabalhoso e o mais valioso — uma edição nossa toca aqui dentro por construção, e não depende de permissão de ninguém.',
      },
    ],
  }),

  novoArtigo({
    id: 'art_percurso_violino_nivelado',
    tipo: 'PERCURSO',
    titulo: 'Repertório nivelado para violinistas',
    subtitulo: 'O repertório graduado que o mundo usa, com a ordem refeita e o motivo de cada peça escrito',
    resumo:
      'Cinco níveis de repertório de domínio público, ordenados pelo que cada peça exige do arco e da mão esquerda. Os três primeiros tocam aqui dentro; os dois últimos têm a partitura catalogada e o endereço dela. A sequência é nossa; as peças são livres; o motivo de cada escolha está escrito.',
    etiquetas: ['violino', 'percurso', 'casa-violinistas'],
    obras: [
      {
        obraId: 'obra-cla-gossec-gavota',
        nivel: 1,
        motivo:
          'Frase curta, âmbito estreito e ritmo regular. Serve para firmar a distribuição do arco antes de qualquer exigência de mão esquerda.',
      },
      {
        obraId: 'obra-bar-minueto-sol',
        nivel: 1,
        motivo:
          'Andamento estável e desenho por graus conjuntos. É onde a mão esquerda encontra a primeira posição sem precisar deixá-la.',
      },
      {
        obraId: 'obra-rom-brahms-cancao-de-ninar',
        nivel: 2,
        motivo:
          'Exige som sustentado e ligadura longa — o arco passa a ter de durar, e não só articular.',
      },
      {
        obraId: 'obra-bar-jesu-alegria',
        nivel: 2,
        motivo:
          'Movimento contínuo em semínimas, sem pausa para reposicionar. Trabalha a economia do arco antes de trabalhar velocidade.',
      },
      {
        obraId: 'obra-bar-handel-alegria',
        nivel: 3,
        motivo:
          'Saltos maiores e articulação marcada. Pede troca de corda limpa em andamento que já não perdoa hesitação.',
      },
      {
        obraId: 'obra-bar-vivaldi-primavera',
        nivel: 3,
        motivo:
          'Tema com ornamentação e mudança de caráter dentro da frase. É a primeira peça do percurso em que a decisão interpretativa pesa tanto quanto a execução.',
      },
      {
        obraId: 'obra-bar-bach-prelude',
        nivel: 3,
        motivo:
          'Desenho contínuo em arpejo, sem melodia para se apoiar. O que se firma aqui é a regularidade da mão direita quando nada no som denuncia a irregularidade — e tudo denuncia.',
      },
      {
        obraId: 'mut-obra-part-1999',
        nivel: 4,
        motivo:
          'O primeiro salto para fora do que a plataforma reproduz: a edição existe em arquivo aberto, com transcritor nomeado, e o estudo passa a depender de ler a partitura em vez de imitar o som.',
      },
      {
        obraId: 'georg-philipp-telemann--12-fantasias-for-solo-violin-twv-40-14-25',
        nivel: 4,
        motivo:
          'Violino sozinho, sem baixo que sustente a harmonia — ela tem de sair do próprio arco. É o degrau em que a polifonia implícita deixa de ser conceito e vira problema de execução.',
      },
      {
        obraId: 'johann-sebastian-bach--partita-no-2-for-solo-violin-in-d-minor-bwv-1004',
        nivel: 5,
        motivo:
          'A Chaconne fecha esta partita, e fechar o percurso com ela é honesto quanto ao tamanho do salto: são quinze minutos que reúnem tudo o que os quatro níveis anteriores separaram.',
      },
      {
        obraId: 'niccolo-paganini--24-caprices-for-solo-violin-op-1-ms25',
        nivel: 5,
        motivo:
          'Está aqui como destino declarado, e não como meta. Um percurso que termina sem mostrar para onde ele leva deixa quem estuda sem medida do próprio avanço.',
      },
    ],
    pessoas: [
      {
        pessoaId: 'johann-sebastian-bach',
        papel: 'COMPOSITOR',
        motivo: 'Oito das 36 peças dos três volumes são dele — três minuetos no primeiro, uma musette no segundo, quatro no terceiro. É a autoria mais presente do repertório de entrada.',
      },
      {
        pessoaId: 'george-frideric-handel',
        papel: 'COMPOSITOR',
        motivo: 'Duas no Volume 2: o coro do Judas Macabeu e uma bourrée. Frase larga e articulação marcada, que é o que o segundo volume trabalha.',
      },
      {
        pessoaId: 'henry-purcell',
        papel: 'COMPOSITOR',
        motivo: 'O Rigadoon do Volume 1. Dança em compasso binário, com desenho por graus conjuntos — mão esquerda na primeira posição, sem sair dela.',
      },
      {
        pessoaId: 'robert-schumann',
        papel: 'COMPOSITOR',
        motivo: 'O Camponês Feliz no primeiro volume e Os Dois Granadeiros no segundo. A distância entre as duas mede o salto de um volume para o outro.',
      },
      {
        pessoaId: 'ludwig-van-beethoven',
        papel: 'COMPOSITOR',
        motivo: 'O Minueto em Sol do Volume 2 — a primeira peça do percurso em que o fraseado clássico exige decisão de caráter, e não só de execução.',
      },
      {
        pessoaId: 'johannes-brahms',
        papel: 'COMPOSITOR',
        motivo: 'A valsa do Volume 2, que é a canção de ninar. Som sustentado e ligadura longa: o arco passa a ter de durar, e não só articular.',
      },
      {
        pessoaId: 'niccolo-paganini',
        papel: 'COMPOSITOR',
        motivo: 'O tema da Dança das Bruxas aparece já no Volume 2, e os Caprichos inteiros fecham este percurso no nível 5. O mesmo nome nas duas pontas.',
      },
      {
        pessoaId: 'luigi-boccherini',
        papel: 'COMPOSITOR',
        motivo: 'O minueto que fecha o Volume 2 — e o exemplo de que repertório de entrada não é repertório menor: a peça é de concerto.',
      },
      {
        pessoaId: 'antonin-dvorak',
        papel: 'COMPOSITOR',
        motivo: 'A Humoresque do Volume 3. Rubato escrito, que é onde a interpretação deixa de ser opcional.',
      },
      {
        pessoaId: 'antonio-vivaldi',
        papel: 'COMPOSITOR',
        motivo: 'A Primavera fecha o nível 3 deste percurso: tema com ornamentação e mudança de caráter dentro da frase.',
      },
      {
        pessoaId: 'georg-philipp-telemann',
        papel: 'COMPOSITOR',
        motivo: 'As 12 Fantasias para violino solo, no nível 4. Sem baixo que sustente a harmonia, ela tem de sair do próprio arco.',
      },
      {
        pessoaId: 'jean-baptiste-lully',
        papel: 'COMPOSITOR',
        motivo: 'A gavota do Volume 2. Dança de corte francesa, com a acentuação deslocada que ela impõe ao arco.',
      },
    ],
    secoes: [
      {
        id: 'vln_01',
        ordem: 1,
        titulo: 'Por que uma ordem, e não uma lista',
        markdown:
          'Repertório sem ordem é catálogo. O que transforma catálogo em estudo é a **sequência** — e uma sequência só vale se o motivo de cada passo estiver dito.\n\n' +
          'A ordem abaixo não é por época nem por fama. É pelo que cada peça **exige** do instrumento: primeiro o arco, depois a sustentação, depois a decisão interpretativa. Uma peça famosa e difícil não é um bom começo, e uma peça obscura e simples pode ser.',
      },
      {
        id: 'vln_02',
        ordem: 2,
        titulo: 'O que se firma em cada nível',
        markdown:
          '**Nível 1 — o arco.** Distribuição, ponto de contato, som igual da ponta ao talão. A mão esquerda fica na primeira posição e não sai dela: uma dificuldade por vez.\n\n' +
          '**Nível 2 — a duração.** O arco passa a ter de sustentar a frase inteira. Ligadura longa e movimento contínuo expõem qualquer economia mal feita — e é aqui que a maioria dos vícios aparece.\n\n' +
          '**Nível 3 — a decisão.** Saltos, troca de corda em andamento, e ornamentação que muda o caráter da frase. A execução deixa de ser o assunto, e a interpretação passa a ser.',
      },
      {
        id: 'vln_03',
        ordem: 3,
        titulo: 'Como usar',
        markdown:
          'Cada peça abaixo abre a ficha dela no acervo, com a partitura que a plataforma renderiza e o botão de tocar. O percurso não tem prazo e não tem avaliação — quem decide quando passar de nível é quem toca.\n\n' +
          'Uma advertência que vale mais que o percurso inteiro: **nível não é velocidade**. Passar para o nível seguinte com o anterior tocado rápido e sujo é o caminho mais curto para um problema que leva anos para corrigir.',
      },
      {
        id: 'vln_05',
        ordem: 4,
        titulo: 'O repertório graduado que já existia, e de onde vêm estas peças',
        markdown:
          'Nada disto foi inventado aqui. Existe desde os anos 1940 um método japonês de violino cujo primeiro volume ordena dezessete peças por dificuldade, e os três primeiros volumes dele são o repertório de entrada mais usado no mundo.\n\n' +
          '**Este percurso não reproduz o método**, e a distinção é de modelagem antes de ser jurídica. No método, o volume é a unidade; aqui, a unidade é a obra, e cada uma está catalogada em nome de quem a escreveu:\n\n' +
          '| volume | peças | de quem são |\n' +
          '| :--- | ---: | :--- |\n' +
          '| Volume 1 | 17 | Bach (3 minuetos), Purcell, Schumann, T. H. Bayly, seis canções folclóricas — e seis do próprio autor do método |\n' +
          '| Volume 2 | 12 | Händel (2), Bach, Weber, Brahms, Schumann, Paganini, Thomas, Lully, Beethoven, Boccherini, Bayly |\n' +
          '| Volume 3 | 7 | Bach (4), Martini, Dvořák, Becker |\n\n' +
          'Somadas, são **36 peças de 15 autores diferentes**. Catalogar tudo isso como "repertório do método" apagaria quinze autorias de uma vez — e é o erro que este acervo não comete em lugar nenhum: a coletânea fica **entre** a pessoa e a obra, e não no lugar de nenhuma das duas.\n\n' +
          '🔴 **Seis peças do Volume 1 são do próprio autor do método** — as Variações sobre *Twinkle*, o Allegro, o Perpetual Motion, o Allegretto, o Andantino e o Etude. Ele morreu em 1998, e pela Lei 9.610/98 essas seis estão **protegidas até 2069**. Elas entram no catálogo como registro: existem, são dele, e não tocam aqui.\n\n' +
          'As outras trinta são de domínio público, e é delas que este percurso se serve — com a ordem refeita pelo que cada uma exige do arco e da mão esquerda, que é o trabalho autoral do Conservatório.',
      },
      {
        id: 'vln_04',
        ordem: 5,
        titulo: 'Do nível 4 em diante, a plataforma para de tocar',
        markdown:
          'Os três primeiros níveis usam peças que o Conservatório **reproduz**: a edição foi montada aqui, nota a nota, e dá para ouvir antes de tentar.\n\n' +
          'Do quarto em diante isso acaba, e a mudança é deliberada. O que o acervo tem dessas peças é o **endereço da partitura** — onde a edição está, sob que licença, e de quem é a transcrição. Ouvir deixa de ser um clique.\n\n' +
          'Isso não é limitação a contornar: é o degrau. Até o nível 3, imitar um som é um atalho legítimo e eficiente. A partir daqui, o que separa quem avança de quem trava é **ler**, e um percurso que continuasse dando o som pronto adiaria essa passagem indefinidamente.\n\n' +
          'Os níveis 4 e 5 existem, então, como destino declarado. Não são promessa de que a plataforma vai tocá-los amanhã — são a medida de onde o percurso leva.',
      },
    ],
  }),

  novoArtigo({
    id: 'art_corpus_brasileiro',
    tipo: 'ENSAIO',
    titulo: 'Seleção de Coletâneas Brasileiras',
    subtitulo: 'Vinte volumes publicados, o que há dentro deles, e por que uma coletânea não é uma lista de recomendação',
    resumo:
      'Vinte coletâneas do repertório brasileiro, catalogadas como objetos e não como etiqueta: livros que existiram, com organizador e data. Cinco estão abertas peça a peça: quarenta e uma peças, todas ligadas à obra e à partitura. O artigo percorre o que há dentro delas, e distingue o que é coletânea do que é curadoria.',
    etiquetas: ['acervo', 'reg_brasil', 'coletaneas', 'curadoria'],
    obras: [
      {
        obraId: 'mb-obra-111307',
        motivo:
          'Nazareth escreve para o piano de sala uma música que a sala não sabia nomear, entre o tango e o choro. A ficha dele tem 229 obras, e esta é a mais procurada de todo o catálogo de origem.',
      },
      {
        obraId: 'mb-obra-111734',
        motivo:
          'O Hino da Independência é atribuído a D. Pedro I, que tem 18 obras catalogadas. Serve de lembrete: a catalogação registra autoria declarada, e a discussão sobre ela é assunto de musicologia, não de ficha.',
      },
      {
        obraId: 'mb-obra-111710',
        motivo:
          'Sinhô num acervo de partitura, e não só na memória do samba. É o tipo de registro que a catalogação de concerto não faz, e que muda o que se pode estudar.',
      },
      {
        obraId: 'mb-obra-112224',
        motivo:
          'Zequinha de Abreu é conhecido por uma peça só, e tem 68 catalogadas. A distância entre as duas coisas é exatamente o que um acervo serve para encurtar.',
      },
      {
        obraId: 'mb-obra-111120',
        motivo:
          'Henrique Alves de Mesquita escreveu ópera e maxixe no mesmo tempo de vida. Está aqui porque desfaz a divisão entre repertório de concerto e repertório popular antes que ela se firme.',
      },
      {
        obraId: 'mb-obra-110489',
        motivo:
          'Neukomm era austríaco e compôs no Rio de Janeiro. Entra porque mostra que compositor brasileiro é categoria de atuação, e não de nascimento — e a ficha dele não afirma o que não sabe.',
      },
      {
        obraId: 'mb-obra-111204',
        motivo:
          'Abdon Milanez abre a listagem da fonte por ordem alfabética, com 19 obras. É o anônimo do catálogo: sem ele e os seus pares, o repertório brasileiro seriam oito nomes em vez de setecentos.',
      },
      {
        obraId: 'mb-obra-111166',
        motivo:
          'A oitava das mais procuradas na fonte. Carlos Gomes já estava no acervo pelo lado europeu — "Fosca" constava como título de ópera, sem partitura —, e é pela catalogação brasileira que a edição dela aparece.',
      },
      {
        obraId: 'heitor-villa-lobos--dancas-caracteristicas-africanas-a-85',
        motivo:
          'Villa-Lobos tinha ficha aqui antes de tudo isso, e com 250 obras. O que a catalogação brasileira acrescentou a ele não foi obra: foi a biografia inteira, no lugar de uma linha de descritor.',
      },
      {
        obraId: 'mb-obra-108491',
        motivo:
          'Chiquinha Gonzaga escrevendo opereta, num acervo que não tinha uma linha sobre ela. Das 156 obras que ela tem hoje, nenhuma veio do catálogo ocidental.',
      },
      {
        obraId: 'mb-obra-111301',
        motivo:
          'Abul é a ópera de Alberto Nepomuceno, que defendeu cantar em português quando a ópera brasileira se cantava em italiano. A briga dele é assunto de capítulo, e a partitura está catalogada.',
      },
      {
        obraId: 'mb-obra-114077',
        motivo:
          'Tom Jobim com 81 obras num acervo de partitura — e não em disco. É o que acontece quando a catalogação para de separar repertório de concerto de repertório popular.',
      },
      {
        obraId: 'mb-obra-111595',
        motivo:
          'Jocy de Oliveira está viva, e por isso a obra dela é protegida. A ficha registra que existe, diz de quem é, e aponta para onde está publicada — o prazo impede tocá-la aqui, e nada além disso.',
      },
      {
        obraId: 'mb-obra-106947',
        motivo:
          'Um dos 7 Motetos para os Sermões da Quaresma, de Luís Álvares Pinto — coletânea do século XVIII. É o tipo de objeto editorial que uma lista de recomendação não produz.',
      },
      {
        obraId: 'mb-obra-112212',
        motivo:
          'Luciano Gallet colheu melodia popular e a escreveu para piano. Está entre as coletâneas da fonte, e mostra o que uma coletânea é: um livro que existiu, e não uma seleção nossa.',
      },
      {
        obraId: 'mb-obra-108360',
        motivo:
          'Henrique Oswald assina nove das vinte coletâneas da fonte. Não é curadoria em favor dele: é o que sobrou catalogado, em volumes, de quem publicou em vida.',
      },

      /*
        AS COLETÂNEAS ABERTAS PEÇA A PEÇA.

        Uma de cada volume casado, com o número dela dentro do livro. O artigo
        lista as 41 no texto; aqui entram as que abrem cada coletânea, porque
        é por elas que se chega à ficha — e a ficha é onde a edição está.

        Citar as 41 faria o bloco de obras do artigo virar o índice inteiro,
        e o índice já está no texto, em ordem, que é onde a ordem informa.
      */
      {
        obraId: 'mb-obra-107654',
        motivo:
          'Abre os 12 Exercícios Brasileiros de Luciano Gallet, para piano a quatro mãos. O índice do volume é um mapa de gêneros do país numa página — valsa, dobrado, chorinho, modinha, maxixe, batuque.',
      },
      {
        obraId: 'mb-obra-107643',
        motivo:
          'Fecha o mesmo volume, e a ordem importa: Gallet põe o batuque no fim, depois de doze páginas de sala. A coletânea tem uma tese, e ela está na sequência.',
      },
      {
        obraId: 'mb-obra-113683',
        motivo:
          'Primeira da Machiette de Henrique Oswald, op. 2 nº 1. As doze estão catalogadas na ordem do volume — tocar a nona antes da segunda é ignorar a decisão de quem publicou.',
      },
      {
        obraId: 'mb-obra-113685',
        motivo:
          'A Valsa op. 2 nº 3, terceira peça da Machiette. É o exemplo que a arquitetura existe para proteger: sem a coletânea entre a pessoa e a obra, seria uma valsa solta de Oswald, e não a terceira página de um livro.',
      },
      {
        obraId: 'mb-obra-108544',
        motivo:
          'Abre as 7 Peças Características de Barrozo Netto. Repertório de caráter no sentido que o século XIX dava à palavra: cada peça um retrato, e o volume inteiro uma galeria.',
      },
      {
        obraId: 'mb-obra-111297',
        motivo:
          'O primeiro dos três quartetos de Alberto Nepomuceno, de 1890. Ele escreveu dois no mesmo ano, e o terceiro no seguinte — a coletânea reúne o que um catálogo por obra deixaria disperso.',
      },
    ],
    pessoas: [
      {
        pessoaId: 'mb-luciano-gallet',
        papel: 'COMPOSITOR',
        motivo: 'Colheu melodia popular e a escreveu para dois pianistas no mesmo instrumento. Os 12 Exercícios Brasileiros são um mapa de gêneros do país numa página.',
      },
      {
        pessoaId: 'mb-luis-alvares-pinto',
        papel: 'COMPOSITOR',
        motivo: 'Pernambucano do século XVIII, e a ponta mais antiga do corpus brasileiro que este acervo alcança. Os 7 Motetos estão catalogados peça a peça.',
      },
      {
        pessoaId: 'mb-barrozo-netto',
        papel: 'COMPOSITOR',
        motivo: 'As 7 Peças Características são repertório de caráter no sentido que o século XIX dava à palavra: cada peça um retrato, e o volume uma galeria.',
      },
      {
        pessoaId: 'mb-henrique-oswald',
        papel: 'COMPOSITOR',
        motivo: 'Assina nove das vinte coletâneas — um brasileiro publicando em italiano peças de sala alemãs, que é um resumo exato do que ele era.',
      },
      {
        pessoaId: 'mb-alberto-nepomuceno',
        papel: 'COMPOSITOR',
        motivo: 'Defendeu cantar em português quando a ópera brasileira se cantava em italiano. Tem 86 obras aqui, e os três quartetos numa coletânea própria.',
      },
      {
        pessoaId: 'mb-ernesto-nazareth',
        papel: 'COMPOSITOR',
        motivo: 'Com 229 obras, a maior ficha brasileira do acervo. Odeon é a partitura mais procurada de todo o catálogo de origem.',
      },
      {
        pessoaId: 'mb-chiquinha-gonzaga',
        papel: 'COMPOSITOR',
        motivo: 'Cento e cinquenta e seis obras, e a catalogação ocidental não a tinha em nenhuma linha. O viés do cânone atinge compositoras antes de qualquer outro grupo.',
      },
      {
        pessoaId: 'antonio-carlos-gomes',
        papel: 'COMPOSITOR',
        motivo: 'Já estava no acervo pelo lado europeu, e Fosca constava sem partitura. É pela catalogação brasileira que a edição dela aparece.',
      },
      {
        pessoaId: 'heitor-villa-lobos',
        papel: 'COMPOSITOR',
        motivo: 'Um dos quatro que atravessaram para o catálogo europeu. O que a catalogação brasileira acrescentou a ele não foi obra: foi a biografia inteira.',
      },
      {
        pessoaId: 'mb-tom-jobim',
        papel: 'COMPOSITOR',
        motivo: 'Oitenta e uma obras num acervo de partitura, e não em disco. É o que acontece quando a catalogação para de separar concerto de popular.',
      },
      {
        pessoaId: 'mb-zequinha-de-abreu',
        papel: 'COMPOSITOR',
        motivo: 'Conhecido por uma peça só, e com 68 catalogadas. A distância entre as duas coisas é o que um acervo serve para encurtar.',
      },
      {
        pessoaId: 'mb-jocy-de-oliveira',
        papel: 'COMPOSITOR',
        motivo: 'Nascida em 1936 e viva. A ficha registra que a obra existe, nomeia quem a fez e aponta para onde está publicada — e não a reproduz aqui.',
      },
      {
        pessoaId: 'mb-sinho',
        papel: 'COMPOSITOR',
        motivo: 'Num acervo de partitura, e não só na memória do samba. É o tipo de registro que a catalogação de concerto não faz.',
      },
      {
        pessoaId: 'mb-d-pedro-i',
        papel: 'COMPOSITOR',
        motivo: 'Dezoito obras catalogadas, entre elas o Hino da Independência. A catalogação registra autoria declarada; discuti-la é assunto de musicologia.',
      },
      {
        pessoaId: 'mb-henrique-alves-de-mesquita',
        papel: 'COMPOSITOR',
        motivo: 'Escreveu ópera e maxixe no mesmo tempo de vida, e desfaz a divisão entre repertório de concerto e popular antes que ela se firme.',
      },
      {
        pessoaId: 'mb-sigismund-neukomm',
        papel: 'COMPOSITOR',
        motivo: 'Austríaco que compôs no Rio de Janeiro. Mostra que compositor brasileiro é categoria de atuação, e não de nascimento.',
      },
      {
        pessoaId: 'mb-abdon-milanez',
        papel: 'COMPOSITOR',
        motivo: 'Abre a listagem da fonte por ordem alfabética, com 19 obras. Sem ele e os seus pares, o repertório brasileiro seriam oito nomes em vez de setecentos.',
      },
      {
        pessoaId: 'mb-jose-mauricio-nunes-garcia',
        papel: 'COMPOSITOR',
        motivo: 'Assina o Método de Pianoforte, que entra entre as coletâneas: é um volume publicado com ordem interna, e o que muda é a intenção de quem o escreveu.',
      },
      {
        pessoaId: 'mb-joao-francisco-leal',
        papel: 'COMPOSITOR',
        motivo: 'Assina as Modinhas de bom gosto e também aparece entre as dezessete assinaturas da Coleção de modinhas de 1842.',
      },
      {
        pessoaId: 'mb-nininha-velloso-guerra',
        papel: 'COMPOSITOR',
        motivo: 'A série "Com as crianças" é repertório pedagógico brasileiro escrito por uma compositora — duas coisas que a catalogação de origem raramente registra juntas.',
      },
    ],
    coletaneas: [
      {
        coletaneaId: 'col_gallet_12_exercicios',
        motivo: 'Aberta peça a peça: as doze estão casadas, e a ordem do volume é a tese dele — o batuque vem depois de doze páginas de sala.',
      },
      {
        coletaneaId: 'col_alvares_pinto_7_motetos',
        motivo: 'Sete motetos do século XVIII pernambucano, todos casados. A ponta mais antiga do corpus brasileiro neste acervo.',
      },
      {
        coletaneaId: 'col_barrozo_netto_7_pecas',
        motivo: 'Sete peças de caráter, todas casadas. Cada uma um retrato, e o volume inteiro uma galeria.',
      },
      {
        coletaneaId: 'col_oswald_machiette',
        motivo: 'O op. 2 inteiro e em ordem, doze peças casadas. É o caso que a arquitetura existe para proteger: a Valsa nº 3 é a terceira página de um livro.',
      },
      {
        coletaneaId: 'col_nepomuceno_quartetos',
        motivo: 'Três quartetos, dois deles de 1890. A coletânea reúne o que um catálogo por obra deixaria disperso.',
      },
      {
        coletaneaId: 'col_modinhas_laforge_1842',
        motivo: 'Dezessete assinaturas num volume só, editado por Pierre Laforge em 1842. Catalogá-la sob um autor apagaria dezesseis.',
      },
      {
        coletaneaId: 'col_modinhas_spix_martius',
        motivo: 'Dois naturalistas alemães anotaram estas melodias atravessando o país entre 1817 e 1820. Nenhum compôs uma nota, e os dois são a razão de o volume existir.',
      },
      {
        coletaneaId: 'col_modinhas_imperiais',
        motivo: 'Compiladas por Mário de Andrade. Compilar é outra coisa que compor, e o campo que guarda isso é outro.',
      },
      {
        coletaneaId: 'col_cancoes_populares_brasil',
        motivo: 'Anônima por decisão da fonte, e mantida assim: escolher um autor aqui seria inventar.',
      },
      {
        coletaneaId: 'col_metodo_pianoforte',
        motivo: 'Um método, e não uma antologia — entra assim mesmo, porque a estrutura é a mesma: volume publicado, com ordem interna.',
      },
      {
        coletaneaId: 'col_miguez_12_pecas',
        motivo: 'Catalogada pela ficha; o índice ainda não foi aberto. Coletânea sem peças listadas não é coletânea vazia.',
      },
      {
        coletaneaId: 'col_oswald_6_pecas_op14',
        motivo: 'Uma das nove de Henrique Oswald. Catalogada pela ficha, com a formação declarada.',
      },
      {
        coletaneaId: 'col_zapata_nuits_bresiliennes',
        motivo: 'Trinta canções com piano, de José Zapata y Amat. O título em francês diz para quem o volume foi publicado.',
      },
      {
        coletaneaId: 'col_mauricinas',
        motivo: 'Canções e valsas de José Maurício Nunes Garcia Junior — o filho, e não o pai, que assina o Método de Pianoforte.',
      },
      {
        coletaneaId: 'col_modinhas_bom_gosto',
        motivo: 'Modinhas de João Francisco Leal, que também assina peças na Coleção de modinhas de 1842.',
      },
      {
        coletaneaId: 'col_oswald_pagine_album',
        motivo: 'Seis peças pequenas para piano. Catalogada pela ficha, com o índice por abrir.',
      },
      {
        coletaneaId: 'col_oswald_six_morceaux',
        motivo: 'Op. 4 de Henrique Oswald, publicado em francês. Catalogada pela ficha.',
      },
      {
        coletaneaId: 'col_velloso_guerra_com_as_criancas',
        motivo: 'Repertório pedagógico brasileiro escrito por uma compositora, o que a catalogação de origem raramente registra.',
      },
      {
        coletaneaId: 'col_oswald_trois_morceaux',
        motivo: 'Op. 23 de Henrique Oswald. Catalogada pela ficha, com o índice por abrir.',
      },
      {
        coletaneaId: 'col_oswald_album_op36',
        motivo: 'Op. 36 de Henrique Oswald, o último dos nove volumes dele entre as vinte coletâneas.',
      },
    ],
    secoes: [
      {
        id: 'br_01',
        ordem: 1,
        titulo: 'O que é uma coletânea, e o que ela não é',
        markdown:
          'Uma **curadoria** é uma lista que alguém montou agora: os mais buscados, os recomendados, os oito principais. Uma **coletânea** foi publicada assim, por alguém, num ano.\n\n' +
          'A diferença parece de grau e é de natureza. A *Coleção de modinhas* que Pierre Laforge editou em 1842 diz o que se cantava no Rio daquele ano — é fonte primária sobre circulação de repertório. Nenhuma lista de recomendação diz isso, por melhor que seja.\n\n' +
          'Por isso a coletânea entra no acervo **como objeto**, entre a pessoa e a obra:\n\n' +
          '`Compositor → Coletânea → Obra → Edição → Partitura`\n\n' +
          'Ela não é obra: não se toca uma coletânea, tocam-se as peças dela. E não é edição: a mesma coletânea pode ter várias. O que ela tem de próprio, e que nenhuma das outras carrega, é a **ordem** — e a ordem é conteúdo. A *Machiette* é uma progressão, e tocar a nona antes da segunda é ignorar a decisão de quem a publicou.',
      },
      {
        id: 'br_02',
        ordem: 2,
        titulo: 'As cinco que estão abertas peça a peça',
        markdown:
          'Cinco coletâneas foram casadas contra o catálogo, uma peça por vez. **Quarenta e uma peças, quarenta e uma obras, quarenta e uma partituras localizadas** — sem sobra.\n\n' +
          '**Luciano Gallet — 12 Exercícios Brasileiros**, para piano a quatro mãos. O índice é um mapa de gêneros do país numa página: *Valsa sestrosa · Puladinho 1º · Dobrado · Chorinho · Modinha · Tanguinho · Schottisch brasileira · Seresta · Maxixe · Polca sertaneja · Puladinho 2º · Batuque*. Gallet colheu melodia popular e a escreveu para dois pianistas no mesmo instrumento, que é a formação de sala da época.\n\n' +
          '**Luís Álvares Pinto — 7 Motetos para os Sermões da Quaresma**, do século XVIII pernambucano: *Adoramus te Christe · Antífonas para o Domingo de Ramos · Attendite · Bajulans · Divertimentos Harmônicos · Dominus Jesus · Gradual Hoc Dies*. É a ponta mais antiga do corpus brasileiro que este acervo alcança.\n\n' +
          '**Barrozo Netto — 7 Peças Características**: *Bailado das borboletas · Dança dos gnomos · Flor em botão · Harmonia das sombras · Marcha dos elefantes · Pizzicato · Ponteio*. Repertório de caráter, no sentido que o século XIX dava à palavra — cada peça um retrato.\n\n' +
          '**Henrique Oswald — Machiette, 12 piccoli pezzi per pianoforte**, op. 2 inteiro e em ordem: *Le campane della sera · Scherzo · Valsa · Canzoneta · Ninna-nanna · Marcha · Romanza · 2ª Gavotta · Pastorale · Minueto · Sarabanda · La caccia*. Um brasileiro publicando em italiano peças de sala alemãs, que é um resumo exato do que ele era.\n\n' +
          '**Alberto Nepomuceno — Quartetos**, três: *nº 1 em si menor* e *nº 2 em mi bemol maior*, ambos de 1890, e o *nº 3 em ré menor*, de 1891. Dois quartetos num ano só.',
      },
      {
        id: 'br_03',
        ordem: 3,
        titulo: 'As quinze que estão só na ficha, e por que isso é dito',
        markdown:
          'As outras quinze estão catalogadas e **o índice delas ainda não foi aberto**. Estão aqui assim mesmo, com organizador e formação:\n\n' +
          '*12 Peças Características*, de Leopoldo Miguez · *6 Peças para piano op. 14*, *Pagine d\'Album*, *Six morceaux op. 4*, *Trois morceaux op. 23* e *Álbum op. 36*, todas de Henrique Oswald · *Les Nuits Brésiliennes*, 30 canções com piano, de José Zapata y Amat · *Mauricinas*, de José Maurício Nunes Garcia Junior · o *Método de Pianoforte*, de José Maurício Nunes Garcia · *Modinhas de bom gosto*, de João Francisco Leal · a *Série "Com as crianças"*, de Nininha Velloso Guerra · *Canções Populares do Brasil*, anônima · a *Coleção de modinhas* de Pierre Laforge, 1842 · as *Modinhas coletadas por Spix e von Martius* · as *Modinhas Imperiais*, compiladas por Mário de Andrade.\n\n' +
          '🔴 **Uma coletânea sem peças listadas não é uma coletânea vazia.** As duas desenham igual — uma lista sem itens —, e confundi-las faria a tela declarar ausência onde há trabalho por fazer. O catálogo distingue os dois estados e diz qual é qual.\n\n' +
          'Três dessas quinze merecem nota, porque o autor delas não compôs uma nota: **Pierre Laforge editou**, **Mário de Andrade compilou**, e **Spix e von Martius coletaram** — dois naturalistas alemães anotando melodias enquanto atravessavam o país entre 1817 e 1820. A coletânea existe por causa deles, e nenhum é o compositor. O campo que guarda isso é outro.\n\n' +
          'E a *Coleção de modinhas* traz dezessete assinaturas num volume só — Cândido Inácio da Silva, Lino José Nunes, Rafael Coelho Machado, Isidoro Bevilacqua, João Francisco Leal e mais doze, além de anônimos. Catalogá-la sob um autor apagaria dezesseis.',
      },
      {
        id: 'br_04',
        ordem: 4,
        titulo: 'O que a curadoria da fonte diz, e o que ela não diz',
        markdown:
          'O portal brasileiro também publica recortes: oito compositores em destaque e as oito partituras mais buscadas nele. São informações reais, e são **medidas dele**.\n\n' +
          'Escrever "os oito compositores mais importantes do Brasil" seria assinar um juízo que ninguém aqui apurou. Escrever "as oito obras mais tocadas" seria pior: ninguém mediu execução — mediram **busca no site**, que é outra coisa.\n\n' +
          'Os oito em destaque, com o que cada um tem catalogado aqui:\n\n' +
          '| compositor | | obras |\n' +
          '| :--- | :--- | ---: |\n' +
          '| Heitor Villa-Lobos | 1887–1959 | 250 |\n' +
          '| Ernesto Nazareth | 1863–1934 | 229 |\n' +
          '| Chiquinha Gonzaga | 1847–1935 | 156 |\n' +
          '| Antonio Carlos Gomes | 1836–1896 | 108 |\n' +
          '| Alberto Nepomuceno | 1864–1920 | 86 |\n' +
          '| Tom Jobim | 1927–1994 | 81 |\n' +
          '| Zequinha de Abreu | 1880–1935 | 68 |\n' +
          '| Jocy de Oliveira | 1936– | 12 |\n\n' +
          'E as oito mais procuradas: *Odeon* (Nazareth) · *Quem são eles* (Sinhô) · *Hino da Independência do Brasil* (D. Pedro I) · *Ai! Ai! Pobre pai* (Abdon Milanez) · *Uma noite no castelo* (Henrique Alves de Mesquita) · *Fosca* (Carlos Gomes) · *Marche à grand Orchestre militaire Nº 12* (Sigismund Neukomm) · *A dor de amar* (Zequinha de Abreu).\n\n' +
          '**Chiquinha Gonzaga com 156 obras** é a linha que mais diz. A catalogação de concerto ocidental não a tinha em nenhuma linha — zero. O viés do cânone que aquela fonte reproduz atinge compositoras antes de atingir qualquer outro grupo.\n\n' +
          '**Jocy de Oliveira nasceu em 1936 e está viva.** Obra viva não entra em domínio público, e a ficha dela diz isso: o catálogo registra que existe, nomeia quem a fez e aponta para onde está publicada. O que o prazo impede é tocá-la aqui dentro, e nada além disso.',
      },
      {
        id: 'br_05',
        ordem: 5,
        titulo: 'De quatro nomes a setecentos e oitenta e três',
        markdown:
          'Nada disto existia aqui há pouco tempo. O acervo tinha **quatro** compositores brasileiros: Villa-Lobos, Carlos Gomes, Camargo Guarnieri e Francisco Mignone.\n\n' +
          'A tentação é ler isso como tamanho do repertório. Não é: é tamanho da **catalogação de origem**, que é do concerto ocidental e cobre o Brasil como cobre qualquer periferia — pelos poucos que atravessaram para as salas europeias. Os quatro que estavam aqui são exatamente esses. Nenhum chegou por ser mais brasileiro que os outros; chegaram por terem sido tocados em Milão, em Paris, em Nova York.\n\n' +
          'Hoje são **783 compositores e 6.917 obras**, e **todas com o endereço da partitura** — cada uma chega com a página da edição. É a melhor cobertura de qualquer recorte deste acervo.\n\n' +
          'O que ainda não temos: **data de morte de 331 deles**, e sem ela não se afirma domínio público — a ficha diz indeterminado em vez de chutar, porque um chute aqui tem consequência jurídica. **Retrato de nenhum**, porque a fonte os hospeda num diretório que ela própria pede para não rastrear. E **o arquivo** da partitura: o que o acervo tem é onde ela está. A diferença entre saber o endereço e ter em mãos é a mesma entre uma biblioteca com catálogo e uma com estante.',
      },
    ],
  }),
];
