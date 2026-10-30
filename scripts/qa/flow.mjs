/**
 * Pente fino de fluxo, de regra de negócio e de usabilidade.
 *
 * FLUXO — um botão que leva a lugar nenhum é pior que um botão ausente: o
 * aluno clica, nada acontece, e ele conclui que a plataforma está quebrada.
 * Aqui todo destino de navegação é conferido contra as rotas que o outlet
 * realmente atende.
 *
 * NEGÓCIO — o Conservatório oferece **curso livre**. Prometer diploma
 * reconhecido seria propaganda enganosa, não deslize de redação. Também não
 * pode haver dado fabricado para uma tela parecer cheia, nem citação de fonte
 * bibliográfica em nenhum lugar da plataforma.
 *
 * USABILIDADE — botão sem nome acessível é botão que leitor de tela anuncia
 * como "botão". Campo sem rótulo é campo que ninguém sabe preencher.
 */
import { readFileSync, existsSync } from 'node:fs';
import { readSource, screens, sourceExists, sources, stripComments, uiFiles } from './core.mjs';

const OUTLET = 'src/ui/screens/AppRouterOutlet.tsx';

/** Rotas que o outlet atende, por igualdade, prefixo ou fragmento. */
export function servedRoutes() {
  const src = stripComments(readSource(OUTLET));
  return [
    ...new Set(
      [
        ...src.matchAll(/currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g),
      ].map((m) => m[1])
    ),
  ];
}

/**
 * Destino de navegação que nenhuma rota atende.
 *
 * Só olha destinos literais. `navigate(destino)` com variável não dá para
 * conferir por leitura estática, e está anotado como não coberto.
 */
export function checkNavigationTargets() {
  const routes = servedRoutes();
  /**
   * A versão anterior deste teste NUNCA acusava nada.
   *
   * `routes` contém `/`, e a condição era
   * `clean === r || clean.startsWith(r) || clean.includes(r)`. Com `r = '/'`,
   * `startsWith` é verdadeiro para **todo caminho absoluto** — então qualquer
   * destino, existente ou inventado, passava.
   *
   * O verificador estava verde havia meses porque era incapaz de ficar
   * vermelho. Quem o encontrou foi a tabela de provas, que injeta o defeito e
   * exige a acusação.
   */
  const serves = (target) => {
    const clean = target.split('?')[0].split('#')[0];
    if (clean === '/') return true;

    return routes.some((r) => {
      if (r === '/') return false;
      if (clean === r) return true;
      // prefixo de verdade: `/academia/course` serve `/academia/course/x`
      return clean.startsWith(r.endsWith('/') ? r : `${r}/`);
    });
  };

  /**
   * Template: cada `${...}` vira um segmento de exemplo. Antes só aspas
   * simples eram lidas, e `navigate(\`/academiaa/course/${id}\`)` escapava — a
   * maior parte das navegações com identificador é escrita assim.
   *
   * Tirar a consulta aqui é certo para a TABELA de rotas; que o ROTEADOR
   * também a tire é outra pergunta, e é conferida no roteador de verdade em
   * `tests/ui/guardas-de-regressao.test.tsx` (RT-1: toda busca caía no 404
   * com este verificador verde).
   */
  const semInterpolacao = (t) => {
    let saida = '';
    let nivel = 0;
    for (let i = 0; i < t.length; i++) {
      if (nivel === 0 && t[i] === '$' && t[i + 1] === '{') {
        nivel = 1;
        i++;
        saida += 'x';
        continue;
      }
      if (nivel > 0) {
        if (t[i] === '{') nivel++;
        else if (t[i] === '}') nivel--;
        continue;
      }
      saida += t[i];
    }
    return saida;
  };

  const findings = [];
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;
    const chamadas = [
      ...[...content.matchAll(/navigate\(\s*'(\/[^']*)'/g)].map((m) => [m, m[1]]),
      ...[...content.matchAll(/navigate\(\s*`(\/[^`]*)`/g)].map((m) => [m, semInterpolacao(m[1])]),
    ];
    for (const [m, destino] of chamadas) {
      if (!serves(destino)) {
        findings.push({
          file,
          line: content.slice(0, m.index).split('\n').length,
          detail: `navega para "${destino}" e nenhuma rota atende`,
        });
      }
    }
  }
  return findings;
}

// --------------------------------------------------------------- negócio ---

/**
 * 🔴 TEXTO CITADO DE FONTE EXTERNA NÃO É AFIRMAÇÃO DA PLATAFORMA.
 *
 * Duas verificações acusaram o corpus brasileiro: uma biografia dizia que o
 * compositor "fez curso superior", outra que ele nasceu numa "ilha".
 *
 * As duas regras estão certas e o alvo estava errado. `curso superior` existe
 * para impedir que o Conservatório prometa titulação que curso livre não dá;
 * `ilha` existe para impedir que uma palavra aposentada do projeto volte ao
 * vocabulário. Nenhuma das duas tem a ver com o que a Música Brasilis escreveu
 * sobre a formação de um compositor morto em 1935, nem com a geografia do
 * lugar onde ele nasceu.
 *
 * Acusar aqui teria consequência pior que o falso positivo: a saída óbvia
 * seria **editar a biografia** para o verificador calar — e aí a plataforma
 * passaria a publicar como citação um texto que ela alterou.
 *
 * O recorte é estreito de propósito:
 *
 *   o arquivo tem de estar em `src/data/`, onde vivem os seeds;
 *   a linha tem de ser o valor de uma chave `"biografia"` **entre aspas** — o
 *   resto do arquivo segue sob as mesmas regras.
 *
 * A aspa na chave não é detalhe: é a assinatura de objeto gerado por
 * `JSON.stringify`. Seed escrito à mão usa identificador de TypeScript
 * (`biography: { pt: '...' }`), e continua verificado — biografia que nós
 * escrevemos é afirmação nossa.
 *
 * A primeira versão desta função procurava "GERADO POR" no cabeçalho, e não
 * funcionava: `sources()` entrega o código **sem comentários**, e o cabeçalho
 * é um comentário. Ela nunca casava, e a exclusão que eu tinha acabado de
 * escrever não excluía nada.
 */
function ehBiografiaCitada(file, linha) {
  return file.includes('src/data/') && /^\s*"biografia":\s*"/.test(linha);
}

/** Afirmações que o Conservatório não pode fazer sobre a própria titulação. */
const PROMESSA_INDEVIDA = [
  /reconhecid[oa]\s+pelo\s+MEC/i,
  /diploma\s+reconhecid/i,
  /curso\s+superior/i,
  /gradua[çc][ãa]o\s+reconhecid/i,
  /validade\s+nacional/i,
  /registro\s+no\s+MEC/i,
  /credenciad[oa]\s+pelo\s+minist[ée]rio/i,
];

export function checkDegreeClaims() {
  const findings = [];
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;

    /**
     * Linha a linha, e não sobre o conteúdo inteiro.
     *
     * Casar contra o arquivo todo dava a posição da PRIMEIRA ocorrência e
     * parava ali — uma segunda promessa no mesmo arquivo passava batido. E,
     * sem a linha em mãos, não havia como distinguir uma promessa nossa de uma
     * biografia citada que menciona a formação de alguém.
     */
    for (const [i, linha] of content.split('\n').entries()) {
      if (ehBiografiaCitada(file, linha)) continue;

      for (const re of PROMESSA_INDEVIDA) {
        const m = linha.match(re);
        if (m) {
          findings.push({
            file,
            line: i + 1,
            detail: `promete o que curso livre não dá: "${m[0]}"`,
          });
        }
      }
    }
  }
  return findings;
}

/**
 * A natureza de curso livre tem de estar escrita onde o certificado aparece.
 *
 * Não basta não mentir; a condição precisa estar dita, e dita na tela em que
 * a pessoa forma expectativa — certificado, credencial, apresentação do curso.
 */
export function checkFreeCourseDisclaimer() {
  const ALVOS = /Certificat|Credential|CoursePresentation/;
  /**
   * Conta como ressalva escrever a frase OU compor quem ja a desenha:
   * `CredentialCanvas` carrega `RESSALVA_CURSO_LIVRE` no proprio SVG,
   * justamente para nao poder ser esquecida por quem monta a tela.
   */
  const RESSALVA =
    /curso\s+livre|forma[çc][ãa]o\s+livre|certifica[çc][ãa]o\s+pr[óo]pria|n[ãa]o\s+substitui\s+forma[çc][ãa]o|RESSALVA_CURSO_LIVRE|CredentialCanvas/i;

  const findings = [];
  for (const { file, code: content } of screens()) {
    if (!ALVOS.test(file)) continue;
    if (!RESSALVA.test(content)) {
      findings.push({ file, detail: 'não diz que a certificação é de curso livre' });
    }
  }
  return findings;
}

/**
 * Dado fabricado.
 *
 * O catálogo já teve três cursos inventados, atribuídos a uma professora que
 * morreu em 1896, com retrato de banco de imagens. A tela ficava linda e
 * mentia. Nada disso volta.
 *
 * `voce@exemplo.com` dentro de um `placeholder` saiu da lista: ali não é dado
 * apresentado como real, é a convenção de mostrar o FORMATO esperado do campo.
 * O que continua proibido é o endereço de exemplo posando de cadastro.
 */
export function checkFabricatedData() {
  const SUSPEITO = [
    [/unsplash\.com|pexels\.com|placehold\.(co|it)|picsum\.photos|placekitten/i, 'imagem de banco genérico'],
    [/usr_founder|usr_demo|usr_fake|usr_teste/i, 'usuário fictício'],
    [/Clara\s+Schumann|John\s+Doe|Jane\s+Doe|Fulano|Beltrano|Sicrano/i, 'pessoa inventada'],
    [/example\.com|\btest@/i, 'endereço de exemplo'],
  ];
  const findings = [];
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;
    for (const [re, porque] of SUSPEITO) {
      const m = content.match(re);
      if (m) {
        findings.push({
          file,
          line: content.slice(0, content.indexOf(m[0])).split('\n').length,
          detail: `${porque}: "${m[0]}"`,
        });
      }
    }
  }
  return findings;
}

/**
 * Repertório só de domínio público.
 *
 * Tocar obra protegida sem licença é problema jurídico do Conservatório, não
 * detalhe de catálogo. Toda faixa declara o ano de domínio público.
 */
export function checkPublicDomainRepertoire() {
  const file = 'src/data/seed-player-repertoire.ts';
  if (!sourceExists(file)) return [];
  const src = stripComments(readSource(file));

  /**
   * ESTE VERIFICADOR ERA VAZIO, E O PIOR TIPO DE VAZIO.
   * ---------------------------------------------------
   * Ele procurava `{ id: '...' }` e cobrava de cada bloco a palavra
   * `dominioPublico`. O acervo, porém, é construído por chamadas a
   * `faixa('id', 'título', 'autor', ...)` — não há um único bloco daquela
   * forma no arquivo. O verificador varria trinta e três faixas e enxergava
   * zero, devolvendo lista vazia para sempre.
   *
   * Verde por cegueira é pior que vermelho: o relatório afirmava que o
   * repertório estava conferido, e ninguém tinha conferido nada.
   *
   * Agora ele lê o AUTOR de cada faixa e exige que esteja no rol declarado no
   * próprio arquivo de dados, com justificativa. Nome novo sem justificativa
   * não entra, que é a única forma de a regra valer para a faixa seguinte.
   */
  const rol = new Set(
    [...(src.split('AUTORES_DO_ACERVO')[1] ?? '').matchAll(/'([^']+)':\s*'([^']+)'/g)].map(
      (m) => m[1]
    )
  );

  if (rol.size === 0) {
    return [{ file, detail: 'AUTORES_DO_ACERVO não encontrado — a verificação ficaria vazia' }];
  }

  const findings = [];
  const chamadas = [...src.matchAll(/faixa\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g)];

  if (chamadas.length === 0 && /faixa\(/.test(src)) {
    return [{ file, detail: 'há chamadas a faixa() que este verificador não consegue ler' }];
  }

  for (const [, id, , autor] of chamadas) {
    if (!rol.has(autor)) {
      findings.push({
        file,
        detail: `faixa "${id}": o autor "${autor}" não está em AUTORES_DO_ACERVO — declare por que é domínio público`,
      });
    }
  }
  return findings;
}

/**
 * Extrai o corpo de cada manipulador, contando chaves.
 *
 * A VERSÃO ANTERIOR ERA CEGA AO CASO MAIS COMUM
 * ---------------------------------------------
 * Ela capturava com `onClick=\{([^}]*(?:\{[^}]*\}[^}]*)*)\}`. Em
 * `onClick={() => {}}` o `[^}]*` é guloso e engole também a chave de
 * ABERTURA do corpo — porque `{` não é `}`. O casamento terminava na primeira
 * chave de fechamento e o corpo capturado era `() => {`, que não casa com
 * nada. O `.{0,160}` da segunda forma tinha o defeito espelhado: guloso até o
 * fim da linha, trazia junto o que vinha depois e estragava a comparação.
 *
 * Resultado: `checkDeadButton` só via os `alert()`. Nunca viu um manipulador
 * vazio. O `onAction: () => {}` do editor de partituras passou batido por
 * isso, e acabou registrado à mão como pendência — quando a máquina deveria
 * tê-lo pegado.
 *
 * Contar chaves resolve os dois casos, e é o que uma linguagem com blocos
 * exige de quem quer ler o corpo de uma função.
 */
function manipuladores(content) {
  const out = [];
  const inicio = /\bon(?:Click|Action|Submit|Retry|Change)\s*[=:]\s*\{?\s*/g;

  for (const m of content.matchAll(inicio)) {
    let i = m.index + m[0].length;

    // a lista de parâmetros, se houver
    if (content[i] === '(') {
      let prof = 0;
      while (i < content.length) {
        if (content[i] === '(') prof++;
        else if (content[i] === ')' && --prof === 0) {
          i++;
          break;
        }
        i++;
      }
    } else if (/^\w+\s*=>/.test(content.slice(i, i + 40))) {
      i += content.slice(i).match(/^\w+/)[0].length; // parâmetro sem parênteses
    }

    const seta = content.slice(i, i + 8).match(/^\s*=>\s*/);
    if (!seta) continue; // referência a função nomeada: não é corpo para ler
    i += seta[0].length;

    let corpo;
    if (content[i] === '{') {
      let prof = 0;
      let j = i;
      while (j < content.length) {
        if (content[j] === '{') prof++;
        else if (content[j] === '}' && --prof === 0) {
          j++;
          break;
        }
        j++;
      }
      corpo = content.slice(i, j);
    } else {
      const fim = content.slice(i).search(/[\n;,]|\}/);
      corpo = content.slice(i, fim === -1 ? content.length : i + fim);
    }

    out.push({ corpo: corpo.trim(), index: m.index });
  }
  return out;
}


/**
 * Dado vazio LITERAL no lugar de uma leitura.
 *
 * O DEFEITO QUE ISTO PEGA
 * -----------------------
 * `PracticeLeagueScreen` chamava:
 *
 *     computeStandings([], scope, LeagueTier.BRONZE, weekOf(new Date()))
 *
 * com um array vazio literal, logo abaixo de um comentário afirmando que a
 * apuração "roda sobre as inscrições da semana". As missões recebiam
 * `EMPTY_ACTIVITY` cravada, a ofensiva recebia `streakDays={0}` e
 * `freezes={0}`.
 *
 * Nada disso aparecia como falha em lugar nenhum. A tela montava, os testes de
 * componente passavam, o estado vazio era elegante — e praticar todo dia
 * durante um mês não mudaria uma linha, porque nenhum dado tinha por onde
 * chegar ali. Nenhum verificador via, porque não há sintaxe errada: há uma
 * ausência, e ausência não tem forma.
 *
 * O SINAL
 * -------
 * Dentro de tela, uma função de APURAÇÃO — nome que começa por compute,
 * calcular, apurar, derive, resolve — recebendo `[]` ou `{}` literal como
 * primeiro argumento. Apurar sobre o vazio literal não é estado vazio: é
 * apurar sobre nada, sempre.
 *
 * Constante `EMPTY_*` passada a uma função de progresso cai na mesma regra.
 *
 * POR QUE ISTO NÃO ACUSA ESTADO INICIAL
 * -------------------------------------
 * `useState([])` e `useState(EMPTY_ACTIVITY)` são corretos e comuns: é o valor
 * de partida até a leitura chegar. O que se acusa é o vazio entrando na
 * APURAÇÃO, que é outra coisa.
 */
const APURACAO = /(compute|calcular|apurar|derive|resolver|rank|classificar|progress)\w*/i;

export function checkEmptyLiteralAsData() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (!/\/ui\/screens\//.test(file) || file.includes('.test.')) continue;

    for (const [i, line] of code.split('\n').entries()) {
      // `useState([])` e o ponto de partida, e nao a apuracao
      if (/useState\s*\(/.test(line)) continue;

      /**
       * Duas posicoes, e nao so a primeira.
       *
       * `missionProgress(missionsOfTheDay(u), EMPTY_ACTIVITY)` punha o vazio
       * no SEGUNDO argumento, e a primeira versao deste verificador olhava so
       * o primeiro — passava batido no defeito que o motivou.
       */
      /**
       * Duas formas, e nao so a primeira posicao.
       *
       * `missionProgress(missionsOfTheDay(u), EMPTY_ACTIVITY)` punha o vazio
       * no SEGUNDO argumento, depois de uma chamada aninhada. Qualquer regex
       * de argumento que nao atravesse parenteses erra esse caso — e era
       * justamente o defeito que motivou este verificador.
       *
       * Para a constante `EMPTY_*` a regra e mais simples e basta: dentro de
       * tela, a linha que cita uma funcao de apuracao E uma constante vazia
       * esta apurando sobre o vazio. `useState` ja saiu antes.
       */
      const ocorrencias = [
        ...line.matchAll(/\b(\w+)\s*\(\s*(\[\s*\]|\{\s*\})\s*,/g),
      ];

      const vazioNomeado = line.match(/\b(EMPTY_\w+)\b/);
      if (vazioNomeado) {
        const chamada = line.match(/\b(\w+)\s*\(/);
        if (chamada && APURACAO.test(chamada[1])) {
          ocorrencias.push([line, chamada[1], vazioNomeado[1]]);
        }
      }

      for (const m of ocorrencias) {
        const [, nome, vazio] = m;
        if (!APURACAO.test(nome)) continue;

        findings.push({
          file,
          line: i + 1,
          detail: `${nome}() apura sobre ${vazio} literal — nenhuma leitura chega ali, e o resultado e sempre o mesmo`,
        });
      }
    }
  }
  return findings;
}

/**
 * Botão falso.
 *
 * É o defeito mais caro da plataforma, porque mente sem ninguém perceber: a
 * tela fica com cara de pronta, o aluno clica, e o produto não faz nada — ou,
 * pior, abre um `alert()` do navegador dizendo o que faria.
 *
 * Um controle que não age ainda não existe. Ou ele age, ou sai da tela, ou
 * diz na própria etiqueta que ainda não está disponível.
 */
export function checkDeadButton() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    if (file.includes('design-system-catalog')) continue; // vitrine do sistema

    /**
     * Duas formas de escrever a mesma coisa.
     *
     * `onClick={...}` é o atributo em JSX; `onClick: ...` é a propriedade de
     * um objeto de ação, como o `primaryAction` do `ScreenContainer`. A
     * segunda escapava, e era justamente onde estavam os alertas das ações
     * principais das telas de administração.
     */
    for (const { corpo, index } of manipuladores(content)) {
      const line = content.slice(0, index).split('\n').length;

      if (/\balert\(|\bconfirm\(|\bprompt\(/.test(corpo)) {
        findings.push({ file, line, detail: `age só por alert do navegador: ${corpo.slice(0, 50)}` });
      } else if (/^(\{\s*\}|undefined|null|void 0)$/.test(corpo)) {
        findings.push({ file, line, detail: 'manipulador vazio — o controle não faz nada' });
      }
    }
  }
  return findings;
}

/**
 * Sucesso sem efeito.
 *
 * É o botão falso na versão silenciosa, e por isso mais difícil de ver: o
 * controle não abre `alert` nenhum — ele acende um "Salvo!" verde por três
 * segundos e apaga. Para quem usa, é indistinguível de ter salvado.
 *
 * `handleSaveScore` era exatamente isto: `setIsSaved(true)` seguido de um
 * `setTimeout` que desfazia. A partitura nunca ia a lugar nenhum.
 *
 * O sinal é: a função marca sucesso e não chama repositório, serviço nem
 * rede. Quem de fato grava chama alguém.
 */
export function checkSuccessWithoutEffect() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    if (file.includes('design-system-catalog')) continue;

    for (const m of content.matchAll(
      /const\s+(\w*(?:[Ss]ave|[Ss]alvar|[Ss]ubmit|[Ee]nviar|[Pp]ublic)\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]{0,700}?)\n\s{2}\};/g
    )) {
      const [, nome, corpo] = m;
      const marcaSucesso = /set(?:Is)?(?:Saved|Salvo|Sucesso|Success|Enviado|Publicado)\s*\(\s*true/i.test(corpo);
      if (!marcaSucesso) continue;

      const agiuDeVerdade =
        /[Rr]epository\.|[Ss]ervice\.|await\s|fetch\(|storage\.|localStorage\./.test(corpo);
      if (agiuDeVerdade) continue;

      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `${nome}() anuncia sucesso sem gravar nada`,
      });
    }
  }
  return findings;
}

/**
 * Promessa de funcionalidade futura escrita como se fosse presente.
 *
 * "Em breve" numa tela publicada é uma dívida que o aluno paga: ele procurou,
 * achou, e não pode usar. Vale existir enquanto estiver contado aqui.
 */
export function checkComingSoonPromise() {
  const findings = [];

  /**
   * TODO o `src`, e não só a interface.
   *
   * A versão anterior lia só `uiFiles()`. Uma promessa escrita num SERVIÇO e
   * renderizada pela tela passava intacta — o texto chega ao aluno do mesmo
   * jeito, e o verificador não via de onde veio.
   */
  for (const { file, code: content } of sources()) {
    if (file.includes('.test.')) continue;

    for (const m of content.matchAll(
      /em breve|brevemente|ainda n[ãa]o dispon[íi]vel|indispon[íi]vel no momento/gi
    )) {
      const line = content.slice(0, m.index).split('\n').length;
      const texto = content.split('\n')[line - 1] ?? '';

      /**
       * `motivo:` é exceção, e é estreita de propósito.
       *
       * Pelo contrato de `DisponibilidadeNoConservatorio`, `motivo` é
       * **obrigatório** e explica um estado JÁ DECLARADO: o item existe, está
       * catalogado e contado, e a frase diz por que ele não abriu ainda. Os
       * cinco livros do Conservatório são esse caso — existem, têm capítulos e
       * questões contados do livreto, e aguardam curadoria editorial.
       *
       * O defeito que este verificador existe para pegar é outro: "esta
       * funcionalidade estará disponível em breve" sobre o que não existe.
       * Promessa sem estado declarado.
       *
       * LIMITE: não há como aferir daqui se o item do `motivo` existe de
       * verdade. Quem escrevesse `motivo: 'em breve'` sobre vapor passaria —
       * e isso está declarado em `72_QUALITY_SWEEP.md`.
       */
      if (/\bmotivo\s*:/.test(texto)) continue;

      /**
       * Biografia citada da fonte — mesmo recorte de `ehBiografiaCitada`.
       *
       * "Em breve estreará sua ópera" dentro da biografia de um compositor é
       * frase de quem a escreveu, sobre a vida dele, em algum momento do
       * passado. Não é promessa do Conservatório sobre o produto.
       *
       * Acusar aqui teria a mesma consequência perversa do outro caso: a saída
       * óbvia seria **editar a citação** para o verificador calar, e a
       * plataforma passaria a publicar como citação um texto que ela alterou.
       */
      if (ehBiografiaCitada(file, texto)) continue;

      findings.push({ file, line, detail: `promete para depois: "${m[0]}"` });
    }
  }
  return findings;
}

/**
 * Conjunto de registros escrito dentro da tela.
 *
 * Este é o padrão que gerou quase todo o dado fabricado do projeto, e é mais
 * geral do que qualquer lista de nomes proibidos: uma tela declara um vetor
 * de objetos com `id`, `title`, `name` — um CONJUNTO DE DADOS — e o desenha
 * como se viesse do produto.
 *
 * Foi assim que três salas de aula com professores inventados, duas
 * masterclasses com data e contagem de inscritos inventadas, três recitais no
 * perfil de todo mundo e quatro eventos de auditoria de segurança inventados
 * chegaram à tela. O último é o mais grave: um administrador lendo
 * "tentativa de acesso não autenticado" precisa saber se aquilo aconteceu.
 *
 * Dado mora em repositório. A tela lê, e quando não há nada ela diz que não
 * há nada.
 */
export function checkDataInsideScreen() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    if (file.includes('design-system-catalog')) continue; // vitrine do sistema

    /**
     * Duas formas de escrever a mesma coisa.
     *
     * `const nome = [ {...} ]` era a única coberta. `useState([ {...} ])`
     * escapava — e foi ali que estavam as notificações inventadas: tarefa
     * avaliada por um professor que não existe, menção num fórum onde
     * ninguém escreveu.
     */
    const ocorrencias = [
      ...content.matchAll(/const\s+(\w+)\s*(?::[^=]+)?=\s*\[\s*\{([\s\S]{40,4000}?)\n\s*\];/g),
      ...content.matchAll(
        /const\s*\[\s*(\w+)[^\]]*\]\s*=\s*useState\(?\s*\[\s*\{([\s\S]{40,4000}?)\n\s*\]/g
      ),
    ];

    for (const m of ocorrencias) {
      const [, nome, corpo] = m;
      const registros = (corpo.match(/\n\s*\{/g) ?? []).length + 1;
      if (registros < 2) continue;
      if (!/\bid:\s*['"`]/.test(corpo)) continue;

      /**
       * Configuração de interface NÃO é dado do produto.
       *
       * Abas, filtros, itens de menu, figuras de nota na barra de notação e
       * etapas de um assistente são a estrutura da tela — pertencem ao
       * arquivo dela, e mudá-los é mudar a tela. Acusá-los junto com o
       * catálogo de eventos de auditoria afogaria o achado que importa.
       *
       * O que separa os dois é o tipo de campo. Dado do produto carrega
       * pessoa, data, contagem ou situação; configuração carrega rótulo e
       * ícone. Uma sala tem professor e número de alunos; uma aba tem título.
       */
      /**
       * O sinal pode estar em QUALQUER posição do nome do campo.
       *
       * `worksCount: 142` escapava, porque `\bcount` não casa dentro de
       * `worksCount` — não há limite de palavra entre `works` e `count`. O
       * resultado foi o Atlas passar batido com cinco eras e contagens de
       * obra inventadas: "142 obras canônicas" numa plataforma que não tem
       * acervo de obras nenhum.
       */
      const CAMPO_DE_DADO =
        /\b\w*(author|autor|teacher|professor|host|actor|ator|owner|email|timestamp|date|enrolled|inscrit|count|contagem|total|status|severity|version|xp|score|nota|grade|price|preco)\w*\s*:/i;
      /**
       * Segundo sinal: registro que se ABRE.
       *
       * `sampleResults` não tinha nenhum campo da lista acima — só `type`,
       * `title`, `context` e `link` — e passou batido, mostrando uma "Cátedra
       * Chopin" que não existe e uma obra que o Atlas não tem.
       *
       * O que denuncia é a combinação: título legível **mais** destino ou
       * corpo. Item de menu tem `label` e `path`; registro de produto tem
       * `title` e `link`, porque é coisa do acervo, e não comando da interface.
       */
      const REGISTRO_QUE_ABRE =
        /\btitle:\s*['"`]/.test(corpo) &&
        /\b(link|href|url|slug|context|message)\s*:/.test(corpo);

      /**
       * Menu do próprio console **não** é dado do acervo.
       *
       * `adminModules` tem `title` e `link` como `sampleResults`, e a regra
       * acima não os separava. O que separa é o DESTINO: item de navegação
       * aponta para uma rota que o outlet atende exatamente — `/founder/users`
       * —, enquanto registro de acervo aponta para um identificador inventado
       * — `/academia/course/harmonia-fundamental`.
       */
      const destinos = [...corpo.matchAll(/\b(?:link|href|path)\s*:\s*['"`](\/[^'"`]*)['"`]/g)].map(
        (d) => d[1]
      );
      const soNavegacao =
        destinos.length > 0 && destinos.every((d) => servedRoutes().includes(d));
      if (soNavegacao) continue;

      if (!CAMPO_DE_DADO.test(corpo) && !REGISTRO_QUE_ABRE) continue;
      // um item que CARREGA a propria acao e um comando, nao um registro
      if (/[^A-Za-z]action:\s*\(/.test(corpo)) continue;

      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `"${nome}": ${registros} registros escritos na tela — isto é dado, e dado vem de repositório`,
      });
    }
  }
  return findings;
}

/**
 * Ferramenta de desenvolvimento exposta a quem usa.
 *
 * O inspetor de estados do `ScreenContainer` aparecia em TODA tela
 * publicada, com o rótulo "Estados UI (populated)" e uma barra para forçar
 * erro, vazio e sucesso. O aluno via — e podia acionar — um painel de
 * depuração do time.
 *
 * O sinal é o nome: inspetor, depuração, simulador de papel, conta local de
 * desenvolvimento. Tudo isso existe legitimamente, e tudo isso pertence a
 * `import.meta.env.DEV`.
 *
 * LIMITE, DECLARADO
 * -----------------
 * A conferência é por ARQUIVO: acusa quando a marca aparece e o arquivo não
 * tem guarda de DEV nenhuma. Se um arquivo tem duas afordâncias e perde a
 * guarda de UMA, isto não pega — a outra guarda mantém o arquivo silencioso.
 *
 * Cobrir esse caso exigiria seguir o fluxo de controle até cada ponto de
 * renderização, e não vale o custo. Fica escrito aqui em vez de dar a
 * impressão de cobertura que não existe.
 */
export function checkDevToolInProduction() {
  /**
   * Nomes que só existem para o time.
   *
   * `stateTester` está aqui porque foi o caso real: `showStateTester` e
   * `setShowStateTester` governavam um painel que aparecia em toda tela
   * publicada.
   */
  const MARCAS =
    /(stateTester|state-tester|debugPanel|debug-panel|InspetorDe|inspetorDe|RoleSimulator|simuladorDePapel|ContaLocalDeDesenvolvimento)/i;

  const findings = [];
  for (const { file, code } of uiFiles()) {
    if (file.includes('design-system-catalog')) continue;
    if (/import\.meta\.env\.DEV/.test(code)) continue;

    /**
     * A guarda pertence a quem DEFINE a ferramenta, não a quem a compõe.
     *
     * `ContaLocalDeDesenvolvimento` já se protege sozinha — só renderiza
     * quando `DEV && !isGoogleSignInConfigured()`. Cobrar a guarda de novo
     * das telas de entrada acusaria código correto, que é o que mais
     * depressa faz um relatório perder autoridade.
     *
     * Por isso o arquivo é lido **sem as linhas de importação**, e os nomes
     * que ele importa não contam: quem importa está usando; quem declara
     * está definindo.
     */
    const importados = new Set(
      [...code.matchAll(/import\s+\{([^}]*)\}/g)]
        .flatMap((m) => m[1].split(','))
        .map((n) => n.trim().split(/\s+as\s+/).pop())
    );

    const semImports = code.replace(/^\s*import\s[^\n]*$/gm, '');
    const m = semImports.match(MARCAS);
    if (!m) continue;
    if ([...importados].some((n) => n && MARCAS.test(n))) continue;

    findings.push({
      file,
      line: semImports.slice(0, m.index).split('\n').length,
      detail: `"${m[0]}" sem guarda de DEV — ferramenta do time visível para quem usa`,
    });
  }
  return findings;
}

// ------------------------------------------------------------ usabilidade ---

/**
 * Botão só com ícone precisa de nome acessível.
 *
 * Sem isso o leitor de tela anuncia "botão" e a pessoa cega fica sem saber o
 * que aquilo faz. É o defeito de acessibilidade mais comum e o mais barato de
 * evitar.
 */
export function checkAccessibleName() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    for (const m of content.matchAll(/<button\b([\s\S]{0,400}?)<\/button>/g)) {
      const bloco = m[0];
      if (/aria-label|aria-labelledby|title=/.test(bloco)) continue;

      /**
       * O miolo do botão, sem os atributos da própria etiqueta de abertura.
       *
       * Isso importa: `className="… p-1 …"` está cheio de letras, e contá-las
       * como rótulo daria o botão por nomeado sempre.
       */
      const miolo = bloco.replace(/^<button\b[^>]*>/, '').replace(/<\/button>$/, '');

      // texto literal entre as etiquetas
      const soTexto = miolo.replace(/<[^>]*>/g, ' ').replace(/\{[\s\S]*?\}/g, ' ');
      if (/[A-Za-zÀ-ÿ]{2,}/.test(soTexto)) continue;

      /**
       * Rótulo vindo de expressão não dá para julgar daqui.
       *
       * `{actionLabel}`, `{item.label}` e `{enviando ? 'Salvando' : 'Enviar'}`
       * produzem texto em tempo de execução. Acusá-los enchia o relatório de
       * botões perfeitamente nomeados — e a responsabilidade, nesses casos, é
       * de quem passa a propriedade, não deste componente.
       *
       * O que sobra, e é o defeito de verdade, é o botão cujo miolo são só
       * ícones: `<button><X className="w-5 h-5" /></button>`.
       */
      const expressoes = miolo.match(/\{[\s\S]*?\}/g) ?? [];
      const soIcones = expressoes.every((e) => /^\{\s*<[A-Z]/.test(e));
      if (expressoes.length > 0 && !soIcones) continue;

      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: 'botão só com ícone e sem aria-label',
      });
    }
  }
  return findings;
}

/**
 * Campo de formulário sem rótulo associado.
 *
 * As três formas legítimas de rotular contam como rótulo, e reconhecê-las é o
 * que separa esta verificação de um gerador de ruído:
 *
 *   - `aria-label` no próprio campo;
 *   - `<label htmlFor="x">` apontando para o `id` do campo;
 *   - o campo dentro de um `<label>` que já traz o texto;
 *   - `{...props}` repassado, que pode carregar o rótulo de quem usa — aí a
 *     responsabilidade é de quem chama, e é ali que se cobra.
 */
/**
 * Os atributos de uma etiqueta JSX, do nome até o `>` que a fecha de verdade.
 *
 * Ler até o primeiro `>` não serve: `onChange={(e) => …}` tem um `>` dentro
 * da seta. Isso cortava a leitura antes do `aria-label` que vinha depois, e o
 * pente fino acusava campos perfeitamente rotulados — inclusive um que dizia
 * `aria-label="Selecionar todas as linhas"` três linhas abaixo.
 *
 * Aqui o `>` só conta fora de aspas e fora de `{}`.
 */
function tagAttributes(texto, inicio) {
  let keys = 0;
  let aspas = null;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === aspas) aspas = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') aspas = c;
    else if (c === '{') keys++;
    else if (c === '}') keys--;
    else if (c === '>' && keys === 0) return texto.slice(inicio, i);
  }
  return texto.slice(inicio, inicio + 400);
}

export function checkFieldLabel() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    for (const m of content.matchAll(/<(input|textarea|select)\b/g)) {
      const attrs = tagAttributes(content, m.index + m[0].length);
      if (/type=["']hidden["']/.test(attrs)) continue;
      if (/aria-label|aria-labelledby/.test(attrs)) continue;
      if (/\{\.\.\./.test(attrs)) continue;

      const id = attrs.match(/\bid=["']([^"']+)["']/);
      if (id && new RegExp(`htmlFor=["']${id[1]}["']`).test(content)) continue;
      // id vindo de variável: `id={inputId}` com htmlFor={inputId}
      const idExpr = attrs.match(/\bid=\{([^}]+)\}/);
      if (idExpr && new RegExp(`htmlFor=\\{${idExpr[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`).test(content))
        continue;

      // envolvido por <label> que traz texto
      const antes = content.slice(Math.max(0, m.index - 600), m.index);
      const aberturaDeLabel = antes.lastIndexOf('<label');
      if (aberturaDeLabel !== -1 && !antes.slice(aberturaDeLabel).includes('</label>')) continue;

      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `<${m[1]}> sem rótulo acessível`,
      });
    }
  }
  return findings;
}

/** Imagem sem texto alternativo. */
export function checkAltText() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    for (const m of content.matchAll(/<img\b([^>]*)>/g)) {
      if (!/\balt=/.test(m[1])) {
        findings.push({
          file,
          line: content.slice(0, m.index).split('\n').length,
          detail: '<img> sem alt',
        });
      }
    }
  }
  return findings;
}

/** Elemento clicável que o teclado não alcança. */
/**
 * A abertura inteira de uma etiqueta clicável, e não até o primeiro `>`.
 *
 * O DEFEITO QUE ISTO CORRIGE
 * --------------------------
 * A versão anterior casava `<(div|span|...)\b([^>]*onClick[^>]*)>`. O problema
 * é que `[^>]*` não atravessa o `>` da SETA: em
 *
 *     <div onClick={() => abrir()} onKeyDown={aoTeclado}>
 *
 * a lista de atributos era cortada no `=>`, e virava ` onClick={() =`. Tudo
 * que vinha DEPOIS do onClick — `onKeyDown`, `tabIndex`, `role` — ficava fora
 * do que o verificador examinava.
 *
 * Como manipulador em seta embutida é a forma comum, o verificador acusava
 * praticamente toda div clicável, inclusive as que tratam o teclado
 * corretamente. Falso positivo em massa é pior que verificador ausente:
 * ensina a ignorá-lo, e aí ele não serve nem para o caso verdadeiro.
 *
 * Quem achou isso não foi a varredura — foi o caso LIMPO da tabela de
 * cobertura, que exige que código correto não seja acusado.
 *
 * Contar chaves resolve: dentro de `{...}` a profundidade é maior que zero, e
 * o `>` da seta deixa de ser confundido com o fim da etiqueta.
 */
function aberturasClicaveis(content) {
  const out = [];
  for (const m of content.matchAll(/<(div|span|li|td|tr|section|article)\b/g)) {
    let i = m.index + m[0].length;
    let prof = 0;

    while (i < content.length) {
      const c = content[i];
      if (c === '{') prof++;
      else if (c === '}') prof--;
      else if (c === '<' && prof === 0) break; // etiqueta que não fechou: desiste
      else if (c === '>' && prof === 0) break;
      i++;
    }
    if (content[i] !== '>') continue;

    const attrs = content.slice(m.index + m[0].length, i);
    if (!/onClick/.test(attrs)) continue;

    out.push({ tag: m[1], attrs, index: m.index });
  }
  return out;
}

export function checkKeyboardReach() {
  const findings = [];
  for (const { file, code: content } of uiFiles()) {
    for (const m of aberturasClicaveis(content)) {
      const attrs = m.attrs;
      if (/role=|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(attrs)) continue;
      findings.push({
        file,
        line: content.slice(0, m.index).split('\n').length,
        detail: `<${m.tag} onClick> sem role nem tabIndex — o teclado não chega`,
      });
    }
  }
  return findings;
}

/**
 * Agregado inflado — a fabricação que nenhum nome falso denuncia.
 *
 * `checarDadoFabricado` procura Clara Schumann e usuário de mentira. Não
 * alcança isto, que estava no perfil de prática:
 *
 * ```
 *   const totalMinutes = results.reduce(…) + 125;
 *   const totalSessions = results.length + 8;
 *   const avgAcc = results.length > 0 ? média(…) : 86;
 * ```
 *
 * Somar em cima do dado real é pior que preencher tela vazia: o enchimento
 * fica indistinguível da medida, e ninguém o reconhece depois. E o `: 86` dá
 * 86% de precisão a quem nunca tocou uma nota — ausência apresentada como
 * desempenho.
 *
 * Só olha linha cujo destino é **medida relatada** — total, contagem, acurácia,
 * score, XP, ofensiva, minutos, percentual. Sem esse filtro, dimensionar um
 * `textarea` com `texto.split('\n').length + 2` seria acusado de fabricação, e
 * o verificador viraria ruído que se aprende a ignorar.
 *
 * Limite conhecido: só vê literal numérico ao lado de `reduce`, `.length` ou
 * `filter`. Enchimento vindo de constante nomeada passa, e está anotado em
 * `72_QUALITY_SWEEP.md`.
 */
const METRIC_NAME =
  /(total|count|contagem|quantid|acur|accuracy|precis|score|xp|streak|ofensiva|minut|hora|percent|media|média|avg|nivel|nível|level)/i;

export function checkInflatedAggregate() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (file.includes('.test.') || /\/(data|seed)/.test(file)) continue;

    for (const [i, line] of code.split('\n').entries()) {
      const target = line.match(/(?:const|let|var)\s+(\w+)\s*=|(\w+)\s*:/);
      const nome = target?.[1] ?? target?.[2] ?? '';
      if (!METRIC_NAME.test(nome)) continue;

      const note = (detail) =>
        findings.push({ file, line: i + 1, detail: `\`${nome}\` ${detail}` });

      // 1. soma literal logo depois de uma contagem ou redução
      const padding = line.match(/(reduce\s*\([\s\S]*?\)|\.length|\.filter\([^)]*\)\.length)\s*\+\s*(\d+)/);
      if (padding && Number(padding[2]) > 1) {
        note(`soma ${padding[2]} a um agregado real — o enchimento vira indistinguível da medida`);
      }

      // 2. ternário de lista vazia com número plausível no lugar do vazio
      const emptyCase = line.match(/\.length\s*[><=!]+\s*0\s*\?[\s\S]*?:\s*(\d+)\s*[;,)]/);
      if (emptyCase && Number(emptyCase[1]) > 1) {
        note(`sem dado nenhum, devolve ${emptyCase[1]} — ausência apresentada como medida`);
      }
    }
  }
  return findings;
}

/**
 * Vocabulário institucional — as palavras que saíram do projeto.
 *
 * Este conceito já foi renomeado duas vezes: `ilha` virou `tribo` porque ilha
 * dava ideia de lugar, e `tribo` virou `Casa` porque não distinguia estudante
 * de praticante. Cada renomeação deixou ocorrências para trás, e foi preciso
 * caçá-las à mão.
 *
 * Agora a máquina caça. A estrutura oficial está em
 * `80_INSTITUTIONAL_ARCHITECTURE.md` §11.
 */
const RETIRED_WORDS = [
  ['ilha', 'Região (lugar) ou Casa (grupo)'],
  ['tribo', 'Grêmio (curso), Casa (prática) ou Clube (comunidade)'],
];

export function checkRetiredVocabulary() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (file.includes('.test.')) continue;

    for (const [i, line] of code.split('\n').entries()) {
      /**
       * Biografia citada de fonte externa não entra: "nasceu na ilha de
       * Itaparica" é geografia, e não a palavra aposentada do projeto voltando
       * ao vocabulário. Ver `ehBiografiaCitada`.
       */
      if (ehBiografiaCitada(file, line)) continue;

      for (const [word, instead] of RETIRED_WORDS) {
        /**
         * Três formas, e nenhuma delas é "a palavra em qualquer lugar".
         *
         * A primeira versão exigia início de palavra, e por isso não via
         * `etapaDaTribo`, `listarTribos` nem `setTriboId` — em camelCase a
         * palavra vem depois de uma letra minúscula. Acusava ZERO sobre oito
         * ocorrências vivas, e o fixture do teste (`triboId`) era justamente a
         * única forma que ela enxergava: cobertura verde sobre cegueira.
         *
         * A correção ÓBVIA — permitir a palavra no meio — é pior que o
         * defeito: `ilha` vive dentro de `trilha`, `filha`, `milha` e
         * `empilhadas`. Sessenta e nove acusações, quase todas falsas, e
         * falso positivo em massa ensina a ignorar o verificador.
         *
         * O que separa os dois casos é o limite de CAIXA. Em camelCase, um
         * segmento novo começa com maiúscula: o `T` de `etapaDaTribo` é
         * fronteira; o `i` de `trilha` não é.
         */
        const inicioDeIdentificador = new RegExp(
          `(?:^|[^a-zà-ú])${word}s?(?:[A-Z_]|Id\b|\s*[:=.[])`,
          'i'
        );

        // Segmento de camelCase: minúscula seguida da palavra com inicial
        // maiúscula. Sensível a caixa DE PROPÓSITO — é a caixa que informa.
        const Palavra = word[0].toUpperCase() + word.slice(1);
        const segmentoCamel = new RegExp(`[a-zà-ú]${Palavra}s?(?![a-zà-ú])`);

        // Texto de tela: a palavra inteira, cercada por não-letras.
        // `aria-label="Filtrar por tribo"` não é identificador, e mesmo
        // assim é a palavra aposentada chegando ao aluno.
        const textoDeTela = new RegExp(
          `(?:^|[^a-zà-ú])${word}s?(?:[^a-zà-ú]|$)`,
          'i'
        );

        if (
          inicioDeIdentificador.test(line) ||
          segmentoCamel.test(line) ||
          textoDeTela.test(line)
        ) {
          findings.push({
            file,
            line: i + 1,
            detail: `"${word}" saiu do projeto; use ${instead}`,
          });
        }
      }
    }
  }
  return findings;
}

/**
 * Seção pessoal em tela que não sabe quem está olhando.
 *
 * A Academia mostrava, a quem nunca entrou: *"Seu progresso — você ainda não
 * se matriculou."* Para quem chega de fora aquilo não é uma seção vazia: é uma
 * seção **sem sujeito**. Não há "seu".
 *
 * A regra é independente de rota, e é por isso que funciona: **quem escreve
 * "seu" precisa saber se há um "seu"**. Uma tela que usa possessivo e não
 * consulta a sessão está afirmando uma relação que pode não existir.
 *
 * Limite conhecido: vê o texto literal. Possessivo montado por interpolação
 * passa, e está anotado em `72_QUALITY_SWEEP.md`.
 */
const POSSESSIVE_HEADING =
  /(Seu|Sua|Seus|Suas|Meu|Minha|Meus|Minhas)\s+(progresso|aprendizado|percurso|histórico|desempenho|conquistas?|certificados?|matrículas?|ofensiva|carteira|passaporte|repertório|caderno)/i;

/**
 * As rotas que cada tela atende, lidas do outlet.
 *
 * A primeira versão disto usava a PASTA da tela, e estava errada: `academy`
 * aparece como "exige login" por causa de `/academia/history`, e com isso a
 * regra pulava justamente a tela que a motivou — a home da Academia, que é
 * pública. Foi reintroduzir o defeito que mostrou o furo.
 */
function screenRoutes() {
  /**
   * Varredura linha a linha, e não uma janela de caracteres.
   *
   * A primeira versão casava a rota com o próximo `<XxxScreen` dentro de 200
   * caracteres, e pareava errado: `AcademyHomeScreen` saía ligada a
   * `/design-system`. Aqui a rota mais recente vale até aparecer a tela, que é
   * exatamente como o arquivo é escrito.
   */
  const lines = stripComments(readSource(OUTLET)).split('\n');
  const map = new Map();
  let pending = [];

  for (const line of lines) {
    for (const m of line.matchAll(
      /currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g
    )) {
      pending.push(m[1]);
    }
    const tag = line.match(/<(\w+Screen)/);
    if (tag && pending.length > 0) {
      map.set(tag[1], [...(map.get(tag[1]) ?? []), ...pending]);
      pending = [];
    }
  }
  return map;
}

/** Prefixos de rota que exigem login, lidos de `audiencia.ts`. */
function loginOnlyRoutes() {
  const src = readSource('src/ui/navigation/audiencia.ts');
  return [...src.matchAll(/rota:\s*'([^']+)',\s*audiencia:\s*'exigeLogin'/g)].map((m) => m[1]);
}

/**
 * O visitante alcança esta tela?
 *
 * Prefixo mais longo vence, como na tabela de audiência. Tela sem rota
 * conhecida conta como alcançável: é mais seguro acusar de menos do que
 * deixar passar.
 */
function reachableByVisitor(screen, routes, loginOnly) {
  const mine = routes.get(screen);
  if (!mine || mine.length === 0) return true;

  return mine.some((r) => {
    const match = loginOnly
      .filter((p) => r === p || r.startsWith(p))
      .sort((a, b) => b.length - a.length)[0];
    return !match;
  });
}

export function checkPersonalSectionWithoutSession() {
  const findings = [];

  const routes = screenRoutes();
  const loginOnly = loginOnlyRoutes();

  for (const { file, code } of sources()) {
    if (!/\/ui\/screens\//.test(file) || file.includes('.test.')) continue;

    const screen = file.split('/').pop().replace(/\.tsx?$/, '');
    // `auth` é visitante por definição: ali o possessivo fala do futuro.
    if (/\/screens\/auth\//.test(file)) continue;
    if (!reachableByVisitor(screen, routes, loginOnly)) continue;

    /**
     * Em `code`, e não no arquivo inteiro: o comentário que EXPLICA o defeito
     * precisa poder citá-lo, como no verificador de vocabulário aposentado.
     */
    const m = code.match(POSSESSIVE_HEADING);
    if (!m) continue;

    /**
     * A leitura da sessao, e nao a mera palavra `userId`.
     *
     * Com `userId` na lista este verificador nascia vazio: quase toda tela
     * menciona a variavel em algum lugar, e a condicao passava sempre. Foi
     * reintroduzindo o defeito original que isso apareceu.
     */
    if (/getActiveSession\(|useCurrentUser\(|useSessao\(/.test(code)) continue;

    findings.push({
      file,
      line: code.slice(0, code.indexOf(m[0])).split('\n').length,
      detail: `escreve "${m[0]}" e não consulta a sessão — seção sem sujeito para quem não entrou`,
    });
  }
  return findings;
}

/**
 * Número cravado apresentado como medida.
 *
 * O painel de administração mostrava "1.240 Usuários Matriculados", "42 Salas
 * de Aula Ativas" e "8.920 Eventos Auditados" — numa plataforma que tem zero
 * de cada um. Não era estado vazio mal desenhado: era **número inventado
 * posando de medição**, na tela que a fundadora usaria para decidir.
 *
 * Por que os verificadores anteriores não pegaram: `checkFabricatedData`
 * procura nome e imagem falsos; `checkInflatedAggregate` procura literal
 * somado a agregado real. Nenhum olhava o número solto no JSX.
 *
 * A regra: dentro de tela, texto que é **só um número formatado** — com
 * separador de milhar, porcentagem ou razão — é medida, e medida vem de
 * medição. Número que vem de variável não casa, porque não é literal.
 */
const METRIC_LITERAL = /^\s*(\d{1,3}(?:[.,]\d{3})+|\d+\s*%|\d+\s*\/\s*\d+(?:\s*\(\d+%\))?)\s*$/;

export function checkHardcodedMetric() {
  const findings = [];

  for (const { file, code } of sources()) {
    if (!/\/ui\/screens\//.test(file) || file.includes('.test.')) continue;

    const lines = code.split('\n');
    for (const [i, line] of lines.entries()) {
      /**
       * Só onde o número é o conteúdo inteiro de um elemento: `>1.240<`.
       * Atributo, classe e expressão ficam de fora.
       */
      /**
       * Todos os `>...<` da linha, e não só o primeiro.
       *
       * `const Z = () => <p className="x">8.920</p>` tem uma seta antes do
       * JSX, e o primeiro casamento era o espaço depois dela. A medida
       * cravada, que vinha em seguida, nunca era vista — o verificador
       * passava verde sobre o defeito que existia para pegar.
       */
      for (const inner of line.matchAll(/>([^<>{}]+)</g)) {
      const text = inner[1];
      const formatted = METRIC_LITERAL.test(text);

      /**
       * Inteiro simples só conta quando as linhas acima trazem um RÓTULO de
       * medida. `42` solto pode ser qualquer coisa; `42` embaixo de "Salas de
       * Aula Ativas" é um número inventado.
       */
      const bare = /^\s*\d{1,6}\s*$/.test(text);
      const labelNearby = lines
        .slice(Math.max(0, i - 4), i)
        .some((l) => /uppercase|text-xs text-stone-500|font-mono/.test(l) && />[^<>{}]*[A-Za-zÀ-ÿ]{4}/.test(l));

      if (!formatted && !(bare && labelNearby)) continue;

      findings.push({
        file,
        line: i + 1,
        detail: `"${text.trim()}" está cravado na tela — medida vem de medição`,
      });
      }
    }
  }
  return findings;
}
