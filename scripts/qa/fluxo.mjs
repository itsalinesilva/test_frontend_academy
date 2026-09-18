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
import { fontes, interfaces, telas, semComentarios } from './nucleo.mjs';

const OUTLET = 'src/ui/screens/AppRouterOutlet.tsx';

/** Rotas que o outlet atende, por igualdade, prefixo ou fragmento. */
export function rotasAtendidas() {
  const src = semComentarios(readFileSync(OUTLET, 'utf-8'));
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
export function checarDestinosDeNavegacao() {
  const rotas = rotasAtendidas();
  const atende = (destino) => {
    const limpo = destino.split('?')[0].split('#')[0];
    if (limpo === '/' ) return true;
    return rotas.some(
      (r) => limpo === r || limpo.startsWith(r) || limpo.includes(r)
    );
  };

  const achados = [];
  for (const { arquivo, codigo: conteudo } of fontes()) {
    if (arquivo.includes('.test.')) continue;
    for (const m of conteudo.matchAll(/navigate\(\s*'(\/[^']*)'/g)) {
      if (!atende(m[1])) {
        achados.push({
          arquivo,
          linha: conteudo.slice(0, m.index).split('\n').length,
          detalhe: `navega para "${m[1]}" e nenhuma rota atende`,
        });
      }
    }
  }
  return achados;
}

// --------------------------------------------------------------- negócio ---

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

export function checarPromessaDeTitulacao() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of fontes()) {
    if (arquivo.includes('.test.')) continue;
    for (const re of PROMESSA_INDEVIDA) {
      const m = conteudo.match(re);
      if (m) {
        achados.push({
          arquivo,
          linha: conteudo.slice(0, conteudo.indexOf(m[0])).split('\n').length,
          detalhe: `promete o que curso livre não dá: "${m[0]}"`,
        });
      }
    }
  }
  return achados;
}

/**
 * A natureza de curso livre tem de estar escrita onde o certificado aparece.
 *
 * Não basta não mentir; a condição precisa estar dita, e dita na tela em que
 * a pessoa forma expectativa — certificado, credencial, apresentação do curso.
 */
export function checarRessalvaDeCursoLivre() {
  const ALVOS = /Certificat|Credential|CoursePresentation/;
  /**
   * Conta como ressalva escrever a frase OU compor quem ja a desenha:
   * `CredentialCanvas` carrega `RESSALVA_CURSO_LIVRE` no proprio SVG,
   * justamente para nao poder ser esquecida por quem monta a tela.
   */
  const RESSALVA =
    /curso\s+livre|forma[çc][ãa]o\s+livre|certifica[çc][ãa]o\s+pr[óo]pria|n[ãa]o\s+substitui\s+forma[çc][ãa]o|RESSALVA_CURSO_LIVRE|CredentialCanvas/i;

  const achados = [];
  for (const { arquivo, codigo: conteudo } of telas()) {
    if (!ALVOS.test(arquivo)) continue;
    if (!RESSALVA.test(conteudo)) {
      achados.push({ arquivo, detalhe: 'não diz que a certificação é de curso livre' });
    }
  }
  return achados;
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
export function checarDadoFabricado() {
  const SUSPEITO = [
    [/unsplash\.com|pexels\.com|placehold\.(co|it)|picsum\.photos|placekitten/i, 'imagem de banco genérico'],
    [/usr_founder|usr_demo|usr_fake|usr_teste/i, 'usuário fictício'],
    [/Clara\s+Schumann|John\s+Doe|Jane\s+Doe|Fulano|Beltrano|Sicrano/i, 'pessoa inventada'],
    [/example\.com|test@/i, 'endereço de exemplo'],
  ];
  const achados = [];
  for (const { arquivo, codigo: conteudo } of fontes()) {
    if (arquivo.includes('.test.')) continue;
    for (const [re, porque] of SUSPEITO) {
      const m = conteudo.match(re);
      if (m) {
        achados.push({
          arquivo,
          linha: conteudo.slice(0, conteudo.indexOf(m[0])).split('\n').length,
          detalhe: `${porque}: "${m[0]}"`,
        });
      }
    }
  }
  return achados;
}

/**
 * Repertório só de domínio público.
 *
 * Tocar obra protegida sem licença é problema jurídico do Conservatório, não
 * detalhe de catálogo. Toda faixa declara o ano de domínio público.
 */
export function checarRepertorioLivre() {
  const arquivo = 'src/data/seed-player-repertoire.ts';
  if (!existsSync(arquivo)) return [];
  const src = semComentarios(readFileSync(arquivo, 'utf-8'));
  const achados = [];
  const faixas = [...src.matchAll(/\{\s*id:\s*'([^']+)'([\s\S]*?)\n\s{2}\}/g)];
  for (const [, id, corpo] of faixas) {
    if (!/dominioPublico|publicDomain|dom[íi]nio p[úu]blico/i.test(corpo)) {
      achados.push({ arquivo, detalhe: `faixa "${id}" não declara domínio público` });
    }
  }
  return achados;
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
export function checarBotaoFalso() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    if (arquivo.includes('design-system-catalog')) continue; // vitrine do sistema

    /**
     * Duas formas de escrever a mesma coisa.
     *
     * `onClick={...}` é o atributo em JSX; `onClick: ...` é a propriedade de
     * um objeto de ação, como o `primaryAction` do `ScreenContainer`. A
     * segunda escapava, e era justamente onde estavam os alertas das ações
     * principais das telas de administração.
     */
    const ocorrencias = [
      ...conteudo.matchAll(/onClick=\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g),
      ...conteudo.matchAll(/\bon(?:Click|Action|Submit|Retry):\s*(\([^)]*\)\s*=>.{0,160})/g),
    ];
    for (const m of ocorrencias) {
      const corpo = m[1];
      const linha = conteudo.slice(0, m.index).split('\n').length;

      if (/\balert\(|\bconfirm\(|\bprompt\(/.test(corpo)) {
        achados.push({ arquivo, linha, detalhe: `age só por alert do navegador: ${corpo.slice(0, 50)}` });
      } else if (/^\(\)\s*=>\s*(\{\s*\}|undefined|null|void 0)\s*$/.test(corpo.trim())) {
        achados.push({ arquivo, linha, detalhe: 'onClick vazio — o botão não faz nada' });
      }
    }
  }
  return achados;
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
export function checarSucessoSemEfeito() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    if (arquivo.includes('design-system-catalog')) continue;

    for (const m of conteudo.matchAll(
      /const\s+(\w*(?:[Ss]ave|[Ss]alvar|[Ss]ubmit|[Ee]nviar|[Pp]ublic)\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]{0,700}?)\n\s{2}\};/g
    )) {
      const [, nome, corpo] = m;
      const marcaSucesso = /set(?:Is)?(?:Saved|Salvo|Sucesso|Success|Enviado|Publicado)\s*\(\s*true/i.test(corpo);
      if (!marcaSucesso) continue;

      const agiuDeVerdade =
        /[Rr]epository\.|[Ss]ervice\.|await\s|fetch\(|storage\.|localStorage\./.test(corpo);
      if (agiuDeVerdade) continue;

      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: `${nome}() anuncia sucesso sem gravar nada`,
      });
    }
  }
  return achados;
}

/**
 * Promessa de funcionalidade futura escrita como se fosse presente.
 *
 * "Em breve" numa tela publicada é uma dívida que o aluno paga: ele procurou,
 * achou, e não pode usar. Vale existir enquanto estiver contado aqui.
 */
export function checarPromessaDeEmBreve() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    for (const m of conteudo.matchAll(/em breve|brevemente|ainda não disponível|indisponível no momento/gi)) {
      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: `promete para depois: "${m[0]}"`,
      });
    }
  }
  return achados;
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
export function checarDadosDentroDaTela() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    if (arquivo.includes('design-system-catalog')) continue; // vitrine do sistema

    // const nome = [ { ... id: ... }, { ... } ]  — dois ou mais registros
    for (const m of conteudo.matchAll(/const\s+(\w+)\s*(?::[^=]+)?=\s*\[\s*\{([\s\S]{40,4000}?)\n\s*\];/g)) {
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
      const CAMPO_DE_DADO =
        /\b(author|autor|teacher|professor|host|actor|ator|owner|email|timestamp|date|data|createdAt|publishedAt|dueDate|enrolled|inscrit|membersCount|studentCount|count|status|severity|version|xp|score|nota|grade|price|preco)\s*:/i;
      if (!CAMPO_DE_DADO.test(corpo)) continue;
      // um item que CARREGA a propria acao e um comando, nao um registro
      if (/[^A-Za-z]action:\s*\(/.test(corpo)) continue;

      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: `"${nome}": ${registros} registros escritos na tela — isto é dado, e dado vem de repositório`,
      });
    }
  }
  return achados;
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
export function checarFerramentaDeDesenvolvimento() {
  /**
   * Nomes que só existem para o time.
   *
   * `stateTester` está aqui porque foi o caso real: `showStateTester` e
   * `setShowStateTester` governavam um painel que aparecia em toda tela
   * publicada.
   */
  const MARCAS =
    /(stateTester|state-tester|debugPanel|debug-panel|InspetorDe|inspetorDe|RoleSimulator|simuladorDePapel|ContaLocalDeDesenvolvimento)/i;

  const achados = [];
  for (const { arquivo, codigo } of interfaces()) {
    if (arquivo.includes('design-system-catalog')) continue;
    if (/import\.meta\.env\.DEV/.test(codigo)) continue;

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
      [...codigo.matchAll(/import\s+\{([^}]*)\}/g)]
        .flatMap((m) => m[1].split(','))
        .map((n) => n.trim().split(/\s+as\s+/).pop())
    );

    const semImports = codigo.replace(/^\s*import\s[^\n]*$/gm, '');
    const m = semImports.match(MARCAS);
    if (!m) continue;
    if ([...importados].some((n) => n && MARCAS.test(n))) continue;

    achados.push({
      arquivo,
      linha: semImports.slice(0, m.index).split('\n').length,
      detalhe: `"${m[0]}" sem guarda de DEV — ferramenta do time visível para quem usa`,
    });
  }
  return achados;
}

// ------------------------------------------------------------ usabilidade ---

/**
 * Botão só com ícone precisa de nome acessível.
 *
 * Sem isso o leitor de tela anuncia "botão" e a pessoa cega fica sem saber o
 * que aquilo faz. É o defeito de acessibilidade mais comum e o mais barato de
 * evitar.
 */
export function checarNomeAcessivel() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    for (const m of conteudo.matchAll(/<button\b([\s\S]{0,400}?)<\/button>/g)) {
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

      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: 'botão só com ícone e sem aria-label',
      });
    }
  }
  return achados;
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
function atributosDaEtiqueta(texto, inicio) {
  let chaves = 0;
  let aspas = null;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === aspas) aspas = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') aspas = c;
    else if (c === '{') chaves++;
    else if (c === '}') chaves--;
    else if (c === '>' && chaves === 0) return texto.slice(inicio, i);
  }
  return texto.slice(inicio, inicio + 400);
}

export function checarRotuloDeCampo() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    for (const m of conteudo.matchAll(/<(input|textarea|select)\b/g)) {
      const attrs = atributosDaEtiqueta(conteudo, m.index + m[0].length);
      if (/type=["']hidden["']/.test(attrs)) continue;
      if (/aria-label|aria-labelledby/.test(attrs)) continue;
      if (/\{\.\.\./.test(attrs)) continue;

      const id = attrs.match(/\bid=["']([^"']+)["']/);
      if (id && new RegExp(`htmlFor=["']${id[1]}["']`).test(conteudo)) continue;
      // id vindo de variável: `id={inputId}` com htmlFor={inputId}
      const idExpr = attrs.match(/\bid=\{([^}]+)\}/);
      if (idExpr && new RegExp(`htmlFor=\\{${idExpr[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`).test(conteudo))
        continue;

      // envolvido por <label> que traz texto
      const antes = conteudo.slice(Math.max(0, m.index - 600), m.index);
      const aberturaDeLabel = antes.lastIndexOf('<label');
      if (aberturaDeLabel !== -1 && !antes.slice(aberturaDeLabel).includes('</label>')) continue;

      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: `<${m[1]}> sem rótulo acessível`,
      });
    }
  }
  return achados;
}

/** Imagem sem texto alternativo. */
export function checarTextoAlternativo() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    for (const m of conteudo.matchAll(/<img\b([^>]*)>/g)) {
      if (!/\balt=/.test(m[1])) {
        achados.push({
          arquivo,
          linha: conteudo.slice(0, m.index).split('\n').length,
          detalhe: '<img> sem alt',
        });
      }
    }
  }
  return achados;
}

/** Elemento clicável que o teclado não alcança. */
export function checarAlcancePorTeclado() {
  const achados = [];
  for (const { arquivo, codigo: conteudo } of interfaces()) {
    for (const m of conteudo.matchAll(/<(div|span|li|td|tr|section|article)\b([^>]*onClick[^>]*)>/g)) {
      const attrs = m[2];
      if (/role=|tabIndex|onKeyDown|onKeyUp|onKeyPress/.test(attrs)) continue;
      achados.push({
        arquivo,
        linha: conteudo.slice(0, m.index).split('\n').length,
        detalhe: `<${m[1]} onClick> sem role nem tabIndex — o teclado não chega`,
      });
    }
  }
  return achados;
}
