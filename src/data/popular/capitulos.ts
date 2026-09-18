/**
 * Os 14 capítulos do curso de História Social da Música Popular Brasileira.
 *
 * O QUE O DISTINGUE DO CURSO DE HISTÓRIA DA MÚSICA BRASILEIRA
 * -----------------------------------------------------------
 * Aquele conta o que se compôs; este conta **quem compôs, para quem, e em que
 * condições materiais**. A pergunta aqui não é como soa um maxixe: é por que o
 * maxixe apareceu quando apareceu, quem o tocava, quem pagava, e o que
 * aconteceu quando ele virou mercadoria.
 *
 * É por isso que o curso começa em Portugal, dois séculos antes do Brasil ter
 * cidade: a canção urbana nasce do mesmo processo que esvazia o campo, e sem
 * esse processo não se entende nada do que vem depois.
 *
 * Os dois cursos formam o programa de História da Música Brasileira. Este é a
 * extensão do primeiro, e pressupõe-no.
 */

export interface CapituloPopular {
  numero: number;
  titulo: string;
  periodo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
}

function cap(
  numero: number,
  titulo: string,
  periodo: string,
  descricao: string,
  objetivos: string[],
  competencia: string
): CapituloPopular {
  return { numero, titulo, periodo, descricao, objetivos, competencia };
}

export const CAPITULOS_POPULAR: CapituloPopular[] = [
  cap(1, 'A canção urbana nasce do esvaziamento do campo', 'Portugal, séc. XVI',
    'O processo que produz o indivíduo que canta sozinho, e por que ele antecede o Brasil em dois séculos.',
    ['Explicar a relação entre urbanização e o aparecimento do canto solista.',
     'Distinguir a festa coletiva do campo da canção individual da cidade.',
     'Situar a viola como instrumento do novo cantor urbano.'],
    'formacao-social'),

  cap(2, 'A serenata e o escudeiro', 'Portugal, séc. XVI–XVII',
    'O primeiro tipo de canção urbana, e o que ele revela sobre quem a cantava.',
    ['Caracterizar a cantiga de serenata e sua função social.',
     'Explicar a posição do escudeiro e o que ela diz sobre a música da época.',
     'Reconhecer a antecipação da seresta brasileira.'],
    'formacao-social'),

  cap(3, 'A cidade colonial e seus músicos', 'Brasil, séc. XVII–XVIII',
    'Quem fazia música nas vilas coloniais, de que vivia, e sob que restrições.',
    ['Descrever as condições materiais do músico na colônia.',
     'Explicar o papel das irmandades como empregador.',
     'Situar o músico mestiço na estrutura social do período.'],
    'colonial-social'),

  cap(4, 'Os barbeiros', 'Brasil, séc. XVIII–XIX',
    'Os conjuntos de escravizados e libertos que foram a primeira música profissional de rua.',
    ['Explicar o que eram as bandas de barbeiros e como funcionavam.',
     'Relacionar ofício manual e ofício musical no período escravista.',
     'Descrever o repertório e as funções que cumpriam.'],
    'colonial-social'),

  cap(5, 'Modinha: do salão à rua e de volta', 'Séc. XVIII–XIX',
    'A circulação de um gênero entre classes, e o que muda em cada travessia.',
    ['Descrever a dupla circulação da modinha.',
     'Explicar o que a passagem pelo salão faz com um gênero de rua.',
     'Reconhecer o papel da imprensa musical nessa circulação.'],
    'popular-urbano'),

  cap(6, 'Lundu: o corpo negro no salão branco', 'Séc. XVIII–XIX',
    'O primeiro gênero de origem africana aceito — e os termos dessa aceitação.',
    ['Explicar as condições em que o lundu foi admitido nos salões.',
     'Descrever o papel do teatro musicado na sua difusão.',
     'Analisar criticamente o que a aceitação exigiu do gênero.'],
    'popular-urbano'),

  cap(7, 'A polca e a invenção do maxixe', '1870–1900',
    'O que acontece quando uma dança europeia é tocada por músicos brasileiros para dançarinos brasileiros.',
    ['Descrever a chegada e a apropriação da polca.',
     'Explicar a formação do maxixe como dança e como música.',
     'Situar a reação das elites ao maxixe.'],
    'popular-urbano'),

  cap(8, 'O choro e o funcionalismo público', '1870–1920',
    'Por que a primeira linguagem instrumental brasileira foi feita por gente de classe média baixa.',
    ['Explicar a base social dos chorões.',
     'Relacionar emprego estável e possibilidade de virtuosismo amador.',
     'Descrever a roda como forma de circulação sem mercado.'],
    'popular-urbano'),

  cap(9, 'O carnaval de rua e a música de bloco', '1880–1930',
    'Do entrudo ao rancho e ao cordão: como a festa se organiza e quem a organiza.',
    ['Descrever a transformação do entrudo em carnaval organizado.',
     'Distinguir rancho, cordão e bloco pela composição social.',
     'Explicar a disputa pelo espaço público na festa.'],
    'popular-urbano'),

  cap(10, 'O samba entre a casa e a delegacia', '1900–1930',
    'O gênero perseguido que o Estado depois adotou, e o que aconteceu no caminho.',
    ['Descrever as condições de criação do samba urbano.',
     'Explicar a repressão policial e seus motivos declarados e reais.',
     'Analisar a passagem de prática perseguida a símbolo oficial.'],
    'popular-urbano'),

  cap(11, 'O rádio transforma música em mercadoria', '1930–1950',
    'A indústria cultural chega ao Brasil, e a canção passa a ter fabricante.',
    ['Explicar como o rádio alterou a forma e a duração da canção.',
     'Descrever o surgimento do profissional de música como assalariado.',
     'Analisar a relação entre patrocínio, censura e repertório.'],
    'industria'),

  cap(12, 'O disco, a autoria e o direito', '1930–1960',
    'Quando a criação coletiva encontra um sistema que só reconhece indivíduos.',
    ['Explicar o conflito entre criação coletiva e autoria individual.',
     'Descrever o funcionamento das editoras e da arrecadação.',
     'Analisar casos de apropriação de obra alheia no período.'],
    'industria'),

  cap(13, 'Classe média, disco e a canção de consumo', '1950–1970',
    'A quem a música popular passou a se dirigir, e o que isso fez com ela.',
    ['Relacionar poder de compra e definição de repertório.',
     'Explicar a segmentação do público por classe.',
     'Analisar criticamente a noção de "boa música popular".'],
    'industria'),

  cap(14, 'A música popular como objeto de disputa', '1960–hoje',
    'Quem tem autoridade para dizer o que presta, e o que essa disputa esconde.',
    ['Reconstituir as principais polêmicas sobre autenticidade musical.',
     'Explicar o funcionamento do juízo de gosto como marcador social.',
     'Situar a crítica musical como agente do processo.'],
    'critica'),
];

export const COMPETENCIAS_POPULAR = Array.from(
  new Set(CAPITULOS_POPULAR.map((c) => c.competencia))
).sort();
