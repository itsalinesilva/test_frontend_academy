import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  catalogoDoTitulo,
  formaDoTitulo,
  lerTitulo,
  tonalidadeDoTitulo,
} from '../src/domain/title-reading';
import { DEFAULT_GENRES } from '../src/data/seed-atlas';

/**
 * A LEITURA DO TÍTULO — o que ela promete, e o que ela recusa.
 *
 * O módulo lê três campos de catálogo de dentro do título. A fronteira que
 * estes testes guardam é uma só, e é a que importa: **ler não é deduzir**.
 *
 * Por isso há tantos casos de recusa quanto de acerto. Um leitor que acerta
 * `Sonata em dó maior, K. 545` e também "acerta" `Manhã` inventando uma forma
 * seria pior que nenhum leitor, porque o erro dele viria com cara de dado.
 */

describe('a forma escrita no título', () => {
  it('lê as formas nas grafias das línguas em que a fonte escreve', () => {
    expect(formaDoTitulo('Symphony no. 5')).toBe('sinfonia');
    expect(formaDoTitulo('Sinfonia in D')).toBe('sinfonia');
    expect(formaDoTitulo('Symphonie fantastique')).toBe('sinfonia');
    expect(formaDoTitulo('Klaviersonate')).toBe('sonata');
    expect(formaDoTitulo('Konzert für Violine')).toBe('concerto');
    expect(formaDoTitulo('Concierto de Aranjuez')).toBe('concerto');
  });

  it('a forma mais específica vence quando duas aparecem', () => {
    /**
     * `Sonata quasi una fantasia` é sonata. Se a ordem fosse por frequência,
     * a palavra mais comum roubaria a classificação da mais precisa.
     */
    expect(formaDoTitulo('Sonata quasi una fantasia')).toBe('sonata');
    expect(formaDoTitulo('Prelude and Fugue in C major')).toBe('fuga');
  });

  it('título que não nomeia forma nenhuma fica SEM forma', () => {
    /**
     * A recusa é a metade que importa. "Manhã" e "Melodia" são títulos
     * poéticos, e atribuir a eles a forma mais provável daquele compositor
     * encheria o filtro de classificação que ninguém apurou.
     */
    for (const t of ['Manhã', 'Melodia', 'Hino à alegria não é hino', 'Tema', 'Peça', 'Für Elise']) {
      expect(formaDoTitulo(t), `"${t}" ganhou forma que o título não dá`).toBeUndefined();
    }
  });

  it('não casa a forma dentro de outra palavra', () => {
    /**
     * `operation` contém `opera`, `trio` aparece dentro de `triology`. Sem
     * fronteira de palavra o filtro de gênero encheria de acidente.
     */
    expect(formaDoTitulo('Cooperation Suite')).toBe('suite');
    expect(formaDoTitulo('Patriotism')).toBeUndefined();
    expect(formaDoTitulo('Electrionics')).toBeUndefined();
  });

  it('TODA forma lida existe no catálogo de gêneros do Atlas', () => {
    /**
     * Sem isto, uma forma nova apareceria no filtro sem rótulo — crua ao lado
     * das que têm nome. Duas listas de gênero também divergiriam na primeira
     * vez que uma delas mudasse.
     */
    const slugs = new Set(DEFAULT_GENRES.map((g) => g.slug));
    const fonte = readFileSync('src/domain/title-reading.ts', 'utf-8');
    const bloco = fonte.split('const FORMAS')[1].split('];')[0];
    const lidas = [...bloco.matchAll(/\[\s*'([^']+)'/g)].map((m) => m[1]);

    expect(lidas.length, 'o rol de formas ficou vazio — o teste não olharia nada').toBeGreaterThan(30);
    for (const forma of lidas) {
      expect(slugs.has(forma), `a forma "${forma}" não tem gênero no Atlas`).toBe(true);
    }
  });
});

describe('o número de catálogo escrito no título', () => {
  it('lê as siglas dos catálogos temáticos', () => {
    expect(catalogoDoTitulo('Prelude in C major, BWV 846')).toBe('BWV 846');
    expect(catalogoDoTitulo('Sonata, K. 545')).toBe('K. 545');
    expect(catalogoDoTitulo('Symphony no. 9, D. 944')).toBe('D. 944');
    expect(catalogoDoTitulo('Concerto, RV 269')).toBe('RV 269');
    expect(catalogoDoTitulo('Messiah, HWV 56')).toBe('HWV 56');
    expect(catalogoDoTitulo('Bagatelle, WoO 59')).toBe('WoO 59');
  });

  it('normaliza as três grafias da fonte numa só', () => {
    /**
     * A fonte escreve `BWV.846`, `BWV 846` e `BWV. 846` para a mesma peça.
     * Três grafias do mesmo número não cruzam com nada — e cruzar é a única
     * coisa para que este campo serve.
     */
    for (const t of ['Fuga, BWV.846', 'Fuga, BWV 846', 'Fuga, BWV. 846', 'Fuga, BWV no. 846']) {
      expect(catalogoDoTitulo(t), t).toBe('BWV 846');
    }
  });

  it('o ponto segue a convenção de cada catálogo', () => {
    /**
     * Sigla que abrevia sobrenome leva ponto — Köchel, Deutsch. Sigla de
     * iniciais não leva. É convenção da musicologia, e não escolha nossa.
     */
    expect(catalogoDoTitulo('Sonata, K 545')).toBe('K. 545');
    expect(catalogoDoTitulo('Fantasia, Wq.61')).toBe('Wq. 61');
    expect(catalogoDoTitulo('Sinfonia, op. 55')).toBe('Op. 55');
    expect(catalogoDoTitulo('Prelude, BWV 846')).toBe('BWV 846');
    expect(catalogoDoTitulo('Concerto, TWV 51')).toBe('TWV 51');
  });

  it('título sem número de catálogo fica SEM número', () => {
    for (const t of ['Sonata quasi una fantasia', 'Clair de lune', 'Bolero']) {
      expect(catalogoDoTitulo(t), t).toBeUndefined();
    }
  });

  it('LIMITE DECLARADO: Hoboken com algarismo romano não é lido', () => {
    /**
     * `Hob. III:12` usa romano e dois pontos, e o leitor espera dígitos. Fica
     * SEM número, e não com um número errado — declarar o limite é o que
     * impede alguém de confiar numa cobertura que não existe.
     */
    expect(catalogoDoTitulo('String Quartet, Hob. III:12')).toBeUndefined();
  });
});

describe('a tonalidade escrita no título', () => {
  it('lê as três grafias da fonte', () => {
    expect(tonalidadeDoTitulo('Sonata in C major')).toBe('Dó maior');
    expect(tonalidadeDoTitulo('Präludium e-Moll, BWV 932')).toBe('Mi menor');
    expect(tonalidadeDoTitulo('Fugue en Do Dièse Mineur')).toBe('Dó sustenido menor');
  });

  it('lê a alteração, colada ou solta', () => {
    expect(tonalidadeDoTitulo('Sonata in B flat major')).toBe('Si bemol maior');
    expect(tonalidadeDoTitulo('Prelude in F-sharp minor')).toBe('Fá sustenido menor');
    expect(tonalidadeDoTitulo('Nocturne in E flat major')).toBe('Mi bemol maior');
  });

  it('🔴 o MODO é obrigatório, e este é o defeito que o exige', () => {
    /**
     * A primeira versão aceitava `in` seguido de nota, e classificou
     * *"Ich bin in mir vergnügt"* como estando em Mi — porque `in mi` casava.
     *
     * Sem a palavra que diz maior ou menor, qualquer preposição seguida de
     * duas letras vira tonalidade, e o filtro passa a mentir sobre milhares
     * de obras vocais em alemão.
     */
    expect(tonalidadeDoTitulo('Cantata no. 204: Ich bin in mir vergnugt, BWV.204')).toBeUndefined();
    expect(tonalidadeDoTitulo('Wir eilen mit schwachen')).toBeUndefined();
    expect(tonalidadeDoTitulo('Concerto in the Italian style')).toBeUndefined();
  });

  it('título sem tonalidade fica SEM tonalidade', () => {
    for (const t of ['Clair de lune', 'Bolero', 'Sonata quasi una fantasia']) {
      expect(tonalidadeDoTitulo(t), t).toBeUndefined();
    }
  });
});

describe('a leitura completa, sobre o acervo de verdade', () => {
  it('lê os três campos de um título que traz os três', () => {
    expect(lerTitulo('Sonata in B flat major, K. 545')).toEqual({
      forma: 'sonata',
      numeroDeCatalogo: 'K. 545',
      tonalidade: 'Si bemol maior',
    });
  });

  it('devolve só o que está escrito, e não completa o resto', () => {
    expect(lerTitulo('Cantata no. 204: Ich bin in mir vergnugt, BWV.204')).toEqual({
      forma: 'cantata',
      numeroDeCatalogo: 'BWV 204',
      tonalidade: undefined,
    });
  });

  it('o rendimento sobre as 24 mil obras servidas é o declarado', () => {
    /**
     * NÃO-VACUIDADE, e é o teste que mais importa aqui.
     *
     * As regras podem continuar compilando, rodando e devolvendo `undefined`
     * para tudo — foi assim que dois verificadores deste projeto passaram
     * meses verdes sobre cegueira. O piso é medido contra o arquivo real.
     */
    const obras = JSON.parse(readFileSync('src/data/acervo/obras.json', 'utf-8')) as Array<{
      t: string;
    }>;
    expect(obras.length, 'o acervo servido ficou vazio').toBeGreaterThan(20000);

    let forma = 0;
    let catalogo = 0;
    let tonalidade = 0;
    for (const o of obras) {
      const l = lerTitulo(o.t ?? '');
      if (l.forma) forma += 1;
      if (l.numeroDeCatalogo) catalogo += 1;
      if (l.tonalidade) tonalidade += 1;
    }

    const proporcao = (n: number) => n / obras.length;
    expect(proporcao(forma), 'a leitura de forma despencou').toBeGreaterThan(0.4);
    expect(proporcao(catalogo), 'a leitura de número de catálogo despencou').toBeGreaterThan(0.4);
    expect(proporcao(tonalidade), 'a leitura de tonalidade despencou').toBeGreaterThan(0.2);

    /**
     * O teto também é guardado. Uma regra frouxa demais — `in` sem modo — faria
     * a cobertura saltar, e salto de cobertura aqui é sinal de falso positivo,
     * e não de melhora.
     */
    expect(proporcao(tonalidade), 'a tonalidade casou demais — regra frouxa?').toBeLessThan(0.5);
  });
});
