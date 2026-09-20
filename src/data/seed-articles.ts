import { ArtigoDoConservatorio, novoArtigo } from '../domain/article';

/**
 * ARTIGOS DE FÁBRICA.
 *
 * São **autorais**. Usam o que as fontes trazem como insumo e dizem o que o
 * Conservatório conclui — nenhuma fonte é nomeada no texto, porque o texto é
 * nosso. A origem dos dados fica em `docs/harness/85_SOURCES_AND_COVERAGE.md`,
 * que é registro de engenharia e não sai daqui.
 *
 * POR QUE ESTES DOIS PRIMEIRO
 * ---------------------------
 * A **auditoria** responde à pergunta que um acervo honesto precisa responder
 * sobre si mesmo: o que eu tenho, o que eu não tenho, e por quê. Sem ela, quem
 * consulta supõe que a ausência é do mundo.
 *
 * O **percurso de violino** faz o que um compêndio de método faz — ordenar o
 * repertório por dificuldade e explicar a ordem — sem reproduzir método
 * nenhum. As peças são de domínio público, a sequência é nossa, e o motivo de
 * cada uma está escrito.
 */

export const SEED_ARTICLES: ArtigoDoConservatorio[] = [
  novoArtigo({
    id: 'art_auditoria_concerto_ocidental',
    tipo: 'AUDITORIA',
    titulo: 'Concerto ocidental: uma auditoria de repertório',
    subtitulo: 'O que o acervo cobre, o que não cobre, e o que isso significa para quem estuda',
    resumo:
      'O acervo cobre bem a espinha europeia de concerto, do Medieval ao século XX. Fica a descoberto a Antiguidade — por falta de música sobrevivente, e não de catalogação — e o repertório brasileiro, que existe e aguarda edição. Este artigo mede as duas coisas.',
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
    ],
    secoes: [
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
          'O primeiro capítulo do curso de história trata da Antiguidade, e o acervo não tem obra nenhuma dela. A tentação é chamar isso de lacuna a preencher.\n\n' +
          'Não é. Sobreviveram cerca de quarenta fragmentos gregos notados, muitos ilegíveis, e o mais completo tem doze versos. **O que chegou inteiro foi a teoria**, não a música — e o capítulo do curso trata exatamente disso.\n\n' +
          'Forçar a ficha de obra ali seria o erro. A era pede outro tipo de registro: fragmento, tratado, sistema modal. É trabalho a fazer, e é diferente de catalogar mais obras.',
      },
      {
        id: 'aud_04',
        ordem: 4,
        titulo: 'O repertório brasileiro, que é o oposto',
        markdown:
          'Aqui não falta música. Falta **edição digital redistribuível**.\n\n' +
          'Nazareth, Chiquinha Gonzaga, Callado, Anacleto de Medeiros, Carlos Gomes — obra vasta, de domínio público, e com pouquíssima edição livre circulando em formato que uma plataforma possa renderizar.\n\n' +
          'O caminho aqui é o mais trabalhoso e o mais valioso: **editorar nós mesmos**. Uma edição nossa é nativa por construção e não depende de permissão de ninguém — e muda a posição do Conservatório de quem consome acervo comum para quem contribui com ele.',
      },
    ],
  }),

  novoArtigo({
    id: 'art_percurso_violino_nivelado',
    tipo: 'PERCURSO',
    titulo: 'Repertório nivelado para violinistas',
    subtitulo: 'Uma ordem de estudo, e o motivo de cada peça estar onde está',
    resumo:
      'Três níveis de repertório de domínio público, ordenados pelo que cada peça exige do arco e da mão esquerda. A sequência é nossa; as peças são livres; o motivo de cada escolha está escrito.',
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
    ],
  }),
];
