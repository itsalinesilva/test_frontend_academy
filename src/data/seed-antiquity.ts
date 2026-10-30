import { RegistroDaAntiguidade, dominioDaAntiguidade } from '../domain/antiquity-record';

/**
 * O QUE SOBROU DA ANTIGUIDADE, CATALOGADO COMO O QUE É.
 *
 * Nenhum destes é ficha de obra, e nenhum finge ser. São fragmentos, tratados
 * e inscrições — as únicas coisas que chegaram até nós.
 *
 * O QUE ESTA LISTA NÃO É
 * ----------------------
 * Não é o corpus completo da música antiga: não existe corpus completo. É o
 * que a historiografia registra como sobrevivente e legível o bastante para
 * dizer alguma coisa.
 *
 * O NÍVEL DE TRATAMENTO É O MESMO DAS OUTRAS ERAS
 * -----------------------------------------------
 * Cada item declara suporte, estado, procedência, extensão sobrevivente e o
 * que a plataforma pode oferecer sobre ele. A era tem menos registros que o
 * Romantismo porque sobreviveu menos — e não porque foi tratada com menos
 * cuidado.
 *
 * AS DEMONSTRAÇÕES SÃO NOSSAS
 * ---------------------------
 * Onde há `demonstracaoId`, ele aponta para material do próprio repertório —
 * a escala construída no sintetizador da plataforma. Não é o fragmento
 * tocando: é o procedimento que o fragmento documenta, demonstrado.
 */
export const REGISTROS_DA_ANTIGUIDADE: RegistroDaAntiguidade[] = [
  {
    id: 'ant_epitafio_seikilos',
    titulo: { pt: 'Epitáfio de Seikilos' },
    datacao: 'séc. I–II d.C.',
    natureza: 'MUSICA_NOTADA',
    suporte: 'PEDRA',
    estado: 'COMPLETO',
    procedencia: 'Estela funerária encontrada na Anatólia',
    descricao:
      'É a composição mais antiga que chegou completa — melodia e letra, com a notação alfabética grega escrita acima das sílabas. Doze versos numa coluna de pedra. O que ele prova é mais importante que o que ele toca: que o sistema de notação grego era funcional, e que dava para registrar altura e duração com precisão suficiente para alguém ler mil e oitocentos anos depois.',
    extensaoSobrevivente: '12 versos, íntegros',
    oferta: 'RECONSTRUCAO',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_hinos_delficos',
    titulo: { pt: 'Hinos délficos a Apolo' },
    datacao: 'c. 128 a.C.',
    natureza: 'MUSICA_NOTADA',
    suporte: 'PEDRA',
    estado: 'FRAGMENTARIO',
    procedencia: 'Blocos do Tesouro dos Atenienses, em Delfos',
    descricao:
      'Dois hinos gravados em pedra, com notação vocal e instrumental. Sobreviveram em pedaços: faltam trechos inteiros, e o que há basta para reconhecer a estrutura modal e o modo como a melodia acompanha o acento da palavra. São a maior extensão de música grega notada que se conhece.',
    extensaoSobrevivente: 'partes de dois hinos, com lacunas',
    oferta: 'RECONSTRUCAO',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_orestes',
    titulo: { pt: 'Coro de Orestes — fragmento' },
    datacao: 'c. séc. III a.C.',
    natureza: 'MUSICA_NOTADA',
    suporte: 'PAPIRO',
    estado: 'FRAGMENTARIO',
    procedencia: 'Papiro de Viena',
    descricao:
      'Um trecho de coro trágico com notação. O papiro está rasgado e o que resta são poucas linhas — mas nelas aparece o gênero enarmônico, com intervalos menores que o semitom. É a evidência material de que o ouvido grego dispunha de distinções que o sistema temperado depois eliminou.',
    extensaoSobrevivente: 'poucas linhas, muito danificadas',
    oferta: 'DEMONSTRACAO',
    demonstracaoId: 'ref-cromatica',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_mesomedes',
    titulo: { pt: 'Hinos de Mesomedes' },
    datacao: 'séc. II d.C.',
    natureza: 'MUSICA_NOTADA',
    suporte: 'COPIA_MEDIEVAL',
    estado: 'COMPLETO',
    procedencia: 'Manuscritos bizantinos, cópias de original perdido',
    descricao:
      'Vários hinos curtos que chegaram completos — mas por via indireta: copistas medievais os transmitiram junto de tratados teóricos, e não da pedra ou do papiro original. Isso os torna o caso mais instrutivo do conjunto, porque mostra que a transmissão da música antiga passou pela teoria, e não pela prática.',
    extensaoSobrevivente: 'vários hinos, íntegros',
    oferta: 'RECONSTRUCAO',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_oxirrinco',
    titulo: { pt: 'Hino cristão de Oxirrinco' },
    datacao: 'c. séc. III d.C.',
    natureza: 'MUSICA_NOTADA',
    suporte: 'PAPIRO',
    estado: 'FRAGMENTARIO',
    procedencia: 'Papiros de Oxirrinco, Egito',
    descricao:
      'O documento mais antigo de música cristã com notação — e a notação é grega. Está incompleto: o começo se perdeu e o papiro chegou rasgado na margem. O que ele documenta é a continuidade, e não a ruptura: a igreja primitiva não inventou um sistema próprio para registrar o que cantava — recebeu o que havia, escreveu com as letras que já se usavam, e só muito depois a notação ocidental tomaria outro rumo. É a evidência material de que a separação entre música pagã e música cristã é categoria nossa, e não do século III.',
    extensaoSobrevivente: 'fim de um hino, com o início perdido',
    oferta: 'DEMONSTRACAO',
    demonstracaoId: 'ref-escala-menor',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_tratado_harmonica',
    titulo: { pt: 'Tratados de harmônica grega' },
    datacao: 'séc. IV a.C. – II d.C.',
    natureza: 'TEORIA',
    suporte: 'TRATADO',
    estado: 'COMPLETO',
    descricao:
      'O que chegou inteiro da Antiguidade foi isto: a descrição do sistema. Tetracordes, os três gêneros — diatônico, cromático, enarmônico —, a combinação em sistemas de duas oitavas, e as espécies de oitava que receberam os nomes dório, frígio, lídio e mixolídio. A Idade Média herdou esses nomes, copiou-os, e os aplicou a outra coisa — o que é a origem de boa parte da confusão modal que atravessa mil anos.',
    extensaoSobrevivente: null,
    oferta: 'DEMONSTRACAO',
    demonstracaoId: 'ref-escala-maior',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_doutrina_ethos',
    titulo: { pt: 'A doutrina do ethos' },
    datacao: 'séc. IV a.C.',
    natureza: 'TEORIA',
    suporte: 'TRATADO',
    estado: 'COMPLETO',
    descricao:
      'A convicção de que cada modo age sobre o caráter de quem ouve — um torna corajoso, outro torna mole — e de que por isso a música é assunto político. Não sobreviveu como música: sobreviveu como argumento, e é o argumento que atravessou. A ideia de que ouvir certas coisas forma ou deforma quem ouve continua operando, com outras palavras, até hoje.',
    extensaoSobrevivente: null,
    oferta: 'SOMENTE_FICHA',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
  {
    id: 'ant_aulos',
    titulo: { pt: 'Aulos — o instrumento e o que ele impõe' },
    datacao: 'séc. VI a.C. em diante',
    natureza: 'ICONOGRAFIA',
    suporte: 'PEDRA',
    estado: 'COMPLETO',
    procedencia: 'Vasos, relevos e exemplares arqueológicos',
    descricao:
      'Não sobreviveu música de aulos, e sobreviveram aulos. Os furos dos exemplares encontrados permitem medir que alturas o instrumento produzia — e a medição contradiz parte do que os tratados dizem. É o caso em que o objeto corrige o texto, e por isso ele entra no acervo como registro de pleno direito.',
    extensaoSobrevivente: null,
    oferta: 'SOMENTE_FICHA',
    eraId: 'era_antiguidade',
    regionId: 'reg_europa_ocidental',
    publicDomain: dominioDaAntiguidade(),
  },
];
