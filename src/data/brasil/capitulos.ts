/**
 * Os 18 capítulos do curso de História da Música Brasileira.
 *
 * A periodização segue a formação real do repertório: as três matrizes,
 * o período colonial, a corte, o romantismo, o nacionalismo em três gerações,
 * a vanguarda — e, em paralelo, a linha da música popular urbana, que no
 * Brasil não é apêndice da erudita mas história própria e igualmente central.
 *
 * As duas linhas correm juntas de propósito. Separá-las produziria um retrato
 * falso de um país onde elas nunca estiveram separadas.
 */

export interface CapituloBrasil {
  numero: number;
  titulo: string;
  periodo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
  minutos: number;
}

function cap(
  numero: number,
  titulo: string,
  periodo: string,
  descricao: string,
  objetivos: string[],
  competencia: string,
  minutos: number
): CapituloBrasil {
  return { numero, titulo, periodo, descricao, objetivos, competencia, minutos };
}

export const CAPITULOS_BRASIL: CapituloBrasil[] = [
  cap(1, 'As matrizes', 'Séc. XVI',
    'Indígena, africana e ibérica: o que cada matriz trouxe, e o que a historiografia exagerou ou apagou.',
    ['Descrever a contribuição de cada matriz formadora.',
     'Explicar por que a contribuição africana é sobretudo rítmica — e por que essa síntese é insuficiente.',
     'Reconhecer o peso da herança ibérica na tonalidade e na estrutura estrófica.'],
    'formacao', 50),

  cap(2, 'A música da catequese', 'Séc. XVI–XVII',
    'O uso missionário da música indígena, e o que se perdeu no processo.',
    ['Explicar a estratégia musical da catequese jesuítica.',
     'Situar o auto e o canto devocional na formação do repertório.',
     'Avaliar criticamente as fontes disponíveis sobre música indígena.'],
    'colonial', 40),

  cap(3, 'O barroco mineiro', 'Séc. XVIII',
    'As irmandades, os músicos mulatos e o repertório sacro das Minas do ouro.',
    ['Descrever a organização musical das irmandades religiosas.',
     'Caracterizar o repertório sacro mineiro e seu efetivo.',
     'Explicar a posição social do músico mulato no período.'],
    'colonial', 50),

  cap(4, 'A corte no Rio de Janeiro', '1808–1831',
    'A chegada da corte portuguesa, a Capela Real e José Maurício Nunes Garcia.',
    ['Explicar o impacto institucional da chegada da corte.',
     'Situar a obra de José Maurício e as condições em que foi produzida.',
     'Descrever a influência italiana no ambiente musical da corte.'],
    'imperio', 45),

  cap(5, 'A ópera e o romantismo imperial', '1831–1889',
    'Carlos Gomes, a ópera nacional e a questão do assunto brasileiro.',
    ['Situar a trajetória de Carlos Gomes entre o Brasil e a Itália.',
     'Discutir o que torna "nacional" uma ópera de linguagem italiana.',
     'Descrever a vida musical do Segundo Reinado.'],
    'imperio', 45),

  cap(6, 'A modinha e o lundu', 'Séc. XVIII–XIX',
    'Os dois gêneros que fundaram a música popular urbana brasileira.',
    ['Caracterizar a modinha e sua circulação entre salão e rua.',
     'Descrever o lundu e sua origem africana.',
     'Explicar o trânsito entre erudito e popular no período.'],
    'popular', 45),

  cap(7, 'O choro e a formação do popular urbano', '1870–1920',
    'Os conjuntos, a improvisação e a primeira linguagem instrumental brasileira.',
    ['Descrever a formação instrumental do choro.',
     'Explicar o papel da polca, da habanera e da valsa na sua origem.',
     'Caracterizar o choro como linguagem de improvisação.'],
    'popular', 50),

  cap(8, 'O samba e o Rio de Janeiro', '1910–1940',
    'Do terreiro ao rádio: a invenção de um gênero e a construção de um símbolo nacional.',
    ['Descrever as etapas de formação do samba urbano.',
     'Explicar o papel do rádio e da indústria fonográfica.',
     'Discutir criticamente a promoção do samba a símbolo nacional.'],
    'popular', 50),

  cap(9, 'A Semana de 22 e o projeto modernista', '1922–1930',
    'O programa de uma música brasileira erudita com base no folclore.',
    ['Descrever o programa estético do modernismo musical.',
     'Explicar a proposta de pesquisa folclórica como base da composição.',
     'Avaliar as tensões entre projeto nacional e linguagem europeia.'],
    'nacionalismo', 50),

  cap(10, 'Villa-Lobos', '1887–1959',
    'A obra que definiu o som do Brasil erudito, e os problemas que ela deixou.',
    ['Caracterizar as fases da produção de Villa-Lobos.',
     'Explicar a síntese entre matéria brasileira e forma europeia.',
     'Situar o canto orfeônico e suas implicações.'],
    'nacionalismo', 55),

  cap(11, 'A primeira e a segunda geração nacionalista', '1920–1950',
    'Os compositores que consolidaram o programa modernista.',
    ['Situar a primeira geração nacionalista e suas escolhas.',
     'Caracterizar a obra de Francisco Mignone e de Lorenzo Fernândez.',
     'Descrever o uso de material regional na linguagem de concerto.'],
    'nacionalismo', 50),

  cap(12, 'A terceira geração e Camargo Guarnieri', '1940–1970',
    'O rigor do artesanato nacionalista e a polêmica com a vanguarda.',
    ['Caracterizar a obra de Camargo Guarnieri.',
     'Explicar a controvérsia entre nacionalismo e dodecafonismo.',
     'Situar Radamés Gnattali entre o erudito e o popular.'],
    'nacionalismo', 50),

  cap(13, 'O entreato dodecafônico', '1939–1960',
    'Música Viva, a chegada da série ao Brasil e a ruptura com o programa nacional.',
    ['Descrever o movimento Música Viva e seu manifesto.',
     'Explicar a proposta dodecafônica no contexto brasileiro.',
     'Situar o conflito entre universalismo e nacionalismo.'],
    'vanguarda', 45),

  cap(14, 'A bossa nova', '1958–1964',
    'A reforma harmônica e rítmica que reorganizou a canção brasileira.',
    ['Descrever a inovação harmônica da bossa nova.',
     'Explicar a divisão rítmica do violão e seu efeito.',
     'Situar a bossa nova entre o samba e o jazz.'],
    'popular', 50),

  cap(15, 'Vanguarda e música nova', '1960–1980',
    'Os manifestos, a eletroacústica e a produção de concerto pós-nacionalista.',
    ['Descrever as correntes de vanguarda no Brasil.',
     'Situar a música eletroacústica brasileira.',
     'Explicar o abandono do programa nacionalista.'],
    'vanguarda', 45),

  cap(16, 'A canção sob a ditadura', '1964–1985',
    'Festivais, tropicalismo, censura e a canção como discurso público.',
    ['Situar os festivais televisivos e seu papel.',
     'Descrever o programa estético do tropicalismo.',
     'Explicar o funcionamento da censura e suas consequências.'],
    'popular', 50),

  cap(17, 'Regionalidades', 'Séc. XX',
    'Nordeste, Norte, Sul, Centro-Oeste: os repertórios que a síntese carioca não abarca.',
    ['Caracterizar os principais gêneros regionais.',
     'Explicar o baião e sua projeção nacional.',
     'Discutir a concentração da indústria no eixo Rio–São Paulo.'],
    'popular', 50),

  cap(18, 'Do fim do século XX ao presente', '1980–hoje',
    'A produção de concerto contemporânea, os cruzamentos e a circulação digital.',
    ['Caracterizar a música de concerto brasileira recente.',
     'Descrever os cruzamentos entre popular, erudito e tradições locais.',
     'Explicar o efeito da distribuição digital sobre a produção.'],
    'contemporaneo', 45),
];

export const COMPETENCIAS_BRASIL = Array.from(
  new Set(CAPITULOS_BRASIL.map((c) => c.competencia))
).sort();

export const CARGA_BRASIL = Math.ceil(
  CAPITULOS_BRASIL.reduce((a, c) => a + c.minutos, 0) / 60
);
