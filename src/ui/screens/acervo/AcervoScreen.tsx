import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import {
  acervoService,
  FiltroDoAcervo,
  ItemDoAcervo,
  ResumoDoAcervo,
  SecaoDoAcervo,
} from '../../../services/application/acervo.service';
import { Faceta, descreverCobertura } from '../../../domain/catalog-facets';
import {
  AlvoDaBusca,
  EtapaMontada,
  ROTULO_DO_ALVO,
  montarFunil,
  quantosRecortes,
} from '../../../domain/catalog-funnel';
import { ArtigoDoConservatorio } from '../../../domain/article';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

/**
 * O ACERVO DO CONSERVATÓRIO.
 *
 * 🔴 O QUE ESTA TELA ERA
 * ----------------------
 * Um amontoado. Seis abas no mesmo nível — obras, pessoas, movimentos,
 * biblioteca, artigos, pendências —, onze seletores de filtro lado a lado sem
 * ordem nem hierarquia, uma busca, dois cartões soltos e a listagem. Tudo na
 * mesma altura visual, tudo competindo pela atenção.
 *
 * A biblioteca oficial — que é **a produção desta escola** — tinha sido
 * reduzida a dois cartões perdidos no meio do catálogo do mundo.
 *
 * A ESTRUTURA AGORA
 * -----------------
 *   BANNER       o que é esta tela, e tudo o que ela oferece
 *   DUAS SEÇÕES  Biblioteca · Acervo de compositores
 *
 *   Biblioteca   a vitrine da produção própria: artigos e livros, em
 *                carrosséis paginados. É o que a escola escreveu.
 *
 *   Acervo       o catálogo do repertório. Busca no centro, funil no canto, e
 *                a listagem embaixo — sem onze caixas disputando espaço.
 *
 * O FUNIL, E POR QUE ELE É UM FUNIL
 * ---------------------------------
 * Os eixos não aparecem mais todos de uma vez. Vivem num painel que abre pelo
 * ícone, organizados em **etapas numeradas**, na ordem em que um catálogo
 * musical estreita a busca — quando, onde, por onde sai o som, como se
 * organiza, o detalhe. Cada opção traz a contagem do que devolve, apurada
 * sobre o recorte atual.
 */

const TODOS = '__todos__';

/** Itens por página na listagem do catálogo. */
const POR_PAGINA = 24;

/** Itens por página nos carrosséis da biblioteca. */
const POR_VITRINE = 3;

/**
 * Os recortes do acervo, e o que NÃO entra.
 *
 * 🔴 PARTITURA SEM DONO NÃO VAI PARA A TELA.
 *
 * Havia dois recortes aqui que mostravam a mesma coisa: `PARTITURAS` listava
 * as mil trezentas e quarenta e nove edições, e `PENDENTES` listava as mil
 * cento e sessenta e nove delas que **não acharam obra**. Oitenta e seis por
 * cento do primeiro era o segundo.
 *
 * Um arquivo que não está ligado a nenhuma obra não é catálogo: é matéria-prima
 * de catalogação. Quem consulta um acervo procura a obra, e chega à edição
 * **pela ficha dela** — que é onde a edição significa alguma coisa.
 *
 * As mil cento e sessenta e nove não foram descartadas: continuam na fila de
 * resolução, em `partiturasPendentes()`, e voltam à tela quando tiverem obra.
 * O que sai é a **vitrine de coisa sem endereço**.
 */
const ALVOS: AlvoDaBusca[] = ['OBRAS', 'COMPOSITORES', 'MOVIMENTOS', 'ANTIGUIDADE'];

// ---------------------------------------------------------------------------
// Peças
// ---------------------------------------------------------------------------

/**
 * O retrato, ou as iniciais.
 *
 * Nunca foto de banco: inventar a aparência de uma pessoa real é pior que não
 * ter retrato. Já houve aqui um avatar de docente tirado de banco de imagens.
 */
const Retrato: React.FC<{ url?: string; nome: string; pequeno?: boolean }> = ({
  url,
  nome,
  pequeno,
}) => {
  const classe = pequeno ? 'h-7 w-7 text-[10px]' : 'h-12 w-12 text-xs';

  if (!url) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600 ${classe}`}
      >
        {nome
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0])
          .join('')
          .toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={`Retrato de ${nome}`}
      loading="lazy"
      className={`shrink-0 rounded-full object-cover ${classe}`}
    />
  );
};

/**
 * Um carrossel paginado.
 *
 * Paginado, e não rolável: numa vitrine de três itens a barra de rolagem
 * esconde o que existe e obriga a arrastar para descobrir. A paginação diz
 * quantos há antes de qualquer gesto.
 */
const Vitrine: React.FC<{
  titulo: string;
  descricao: string;
  total: number;
  pagina: number;
  onPagina: (n: number) => void;
  children: React.ReactNode;
}> = ({ titulo, descricao, total, pagina, onPagina, children }) => {
  const paginas = Math.max(1, Math.ceil(total / POR_VITRINE));

  return (
    <section className="space-y-3" aria-label={titulo}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">{titulo}</h3>
          <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-stone-600">{descricao}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-stone-500">
            {total.toLocaleString('pt-BR')} no total
          </span>
          {paginas > 1 && (
            <>
              <button
                type="button"
                disabled={pagina === 1}
                onClick={() => onPagina(pagina - 1)}
                aria-label={`Anteriores de ${titulo}`}
                className="rounded-full border border-stone-300 bg-white p-1.5 text-stone-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="font-mono text-[11px] text-stone-500">
                {pagina}/{paginas}
              </span>
              <button
                type="button"
                disabled={pagina >= paginas}
                onClick={() => onPagina(pagina + 1)}
                aria-label={`Próximos de ${titulo}`}
                className="rounded-full border border-stone-300 bg-white p-1.5 text-stone-700 disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
};

/** Uma linha da listagem do catálogo. */
const Linha: React.FC<{
  item: ItemDoAcervo;
  onAbrir?: () => void;
  onAbrirAutor?: () => void;
}> = ({ item, onAbrir, onAbrirAutor }) => {
  const tocavel = item.disponibilidade.modo === 'EXPERIENCIA_COMPLETA';

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 gap-3">
          {item.secao === 'COMPOSITORES' && <Retrato url={item.imagemUrl} nome={item.titulo} />}

          <div className="min-w-0">
            {onAbrir ? (
              <button
                type="button"
                onClick={onAbrir}
                className="text-left text-sm font-semibold text-anil-800 underline underline-offset-2 hover:text-anil-700"
              >
                {item.titulo}
              </button>
            ) : (
              <h3 className="text-sm font-semibold text-stone-900">{item.titulo}</h3>
            )}

            {/*
              A autoria como CAMINHO, e não como texto solto. Se a autoria é a
              matriz do catálogo, ela leva à pessoa com um clique.
            */}
            {item.autorId && onAbrirAutor ? (
              <button
                type="button"
                onClick={onAbrirAutor}
                className="mt-1 flex items-center gap-1.5 text-xs text-stone-600 hover:text-anil-800"
              >
                <Retrato url={item.autorImagemUrl} nome={item.autorNome ?? '?'} pequeno />
                <span className="underline underline-offset-2">{item.autorNome}</span>
              </button>
            ) : (
              item.linhaDeApoio && (
                <p className="mt-0.5 text-xs text-stone-500">{item.linhaDeApoio}</p>
              )
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            tocavel ? 'bg-anil-50 text-anil-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {tocavel ? 'Disponível para estudo' : 'Catalogado'}
        </span>
      </div>

      {item.etiquetas.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.etiquetas.map((e) => (
            <li
              key={e}
              className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-600"
            >
              {e}
            </li>
          ))}
        </ul>
      )}

      {/*
        O selo nunca fica sozinho. "Catalogado" sem motivo deixa quem consulta
        sem saber se o limite é a lei, a falta de edição ou algo provisório.
      */}
      <p className="mt-2 text-xs leading-relaxed text-stone-600">{item.disponibilidade.motivo}</p>

      {item.disponibilidade.linkOficial && (
        <a
          href={item.disponibilidade.linkOficial.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium text-anil-800 underline underline-offset-2"
        >
          Consultar em {item.disponibilidade.linkOficial.rotulo}
        </a>
      )}
    </li>
  );
};

/**
 * Um eixo dentro de uma etapa, com a contagem do que cada opção devolve.
 *
 * A ajuda fica FORA do `<label>`: dentro dele, o texto de apoio entra no nome
 * acessível do campo, e quem usa leitor de tela ouve a frase inteira a cada
 * foco — o seletor de era chegou a se chamar "Era Quando a obra foi escrita,
 * no recorte de sete eras do curso."
 */
const EixoDoFunil: React.FC<{
  faceta: Faceta;
  valor: string;
  unidade: string;
  onChange: (v: string) => void;
}> = ({ faceta, valor, unidade, onChange }) => {
  const cobertura = descreverCobertura(faceta, unidade);
  const idDaAjuda = `funil-${faceta.campo}-${faceta.rotulo}`;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-xs text-stone-600">
        <span className="font-medium text-stone-700">{faceta.rotulo}</span>
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={idDaAjuda}
          className="rounded border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-800"
        >
          <option value={TODOS}>Todos</option>
          {faceta.opcoes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.rotulo} ({o.quantos.toLocaleString('pt-BR')})
            </option>
          ))}
        </select>
      </label>
      <p id={idDaAjuda} className="text-[11px] leading-snug text-stone-500">
        {faceta.ajuda}
        {cobertura && <span className="block text-stone-600">{cobertura}</span>}
      </p>
    </div>
  );
};

/**
 * O PAINEL DO FUNIL.
 *
 * Fica fechado atrás do ícone, e é isso que deixa a tela limpa. Aberto, mostra
 * as etapas **numeradas**, cada uma com a pergunta que responde e os eixos que
 * a compõem — em vez de onze seletores soltos disputando espaço com a lista.
 */
const PainelDoFunil: React.FC<{
  etapas: EtapaMontada[];
  escolhas: Record<string, string>;
  unidade: string;
  onEscolher: (campo: string, valor: string) => void;
  onLimpar: () => void;
  onFechar: () => void;
}> = ({ etapas, escolhas, unidade, onEscolher, onLimpar, onFechar }) => (
  <div
    id="painel-do-funil"
    className="absolute right-0 z-20 mt-2 w-full max-w-xl rounded-xl border border-stone-200 bg-white p-4 shadow-xl"
  >
    <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
      <p className="font-serif text-sm font-bold text-stone-900">
        Afunilar o acervo
        <span className="ml-2 font-mono text-[11px] font-normal text-stone-500">
          {etapas.length} {etapas.length === 1 ? 'etapa' : 'etapas'}
        </span>
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onLimpar}
          className="text-xs font-medium text-anil-800 underline underline-offset-2"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar o funil"
          className="rounded p-1 text-stone-500 hover:text-stone-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <ol className="mt-3 max-h-[60vh] space-y-4 overflow-y-auto">
      {etapas.map((etapa) => (
        <li key={etapa.numero}>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-anil-800 font-mono text-[10px] font-bold text-white">
              {etapa.numero}
            </span>
            <span className="text-xs font-semibold text-stone-800">{etapa.pergunta}</span>
            {etapa.escolhidos > 0 && (
              <span className="rounded-full bg-anil-50 px-1.5 py-0.5 font-mono text-[10px] text-anil-800">
                {etapa.escolhidos}
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2">
            {etapa.facetas
              .filter((f) => f.opcoes.length > 0)
              .map((f) => (
                <EixoDoFunil
                  key={`${f.campo}-${f.rotulo}`}
                  faceta={f}
                  valor={escolhas[f.campo] ?? TODOS}
                  unidade={unidade}
                  onChange={(v) => onEscolher(f.campo, v)}
                />
              ))}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

// ---------------------------------------------------------------------------
// A tela
// ---------------------------------------------------------------------------

type Aba = 'BIBLIOTECA' | 'ACERVO';

export const AcervoScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [aba, setAba] = useState<Aba>('BIBLIOTECA');
  const [alvo, setAlvo] = useState<AlvoDaBusca>('OBRAS');

  const [busca, setBusca] = useState('');
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [funilAberto, setFunilAberto] = useState(false);

  const [itens, setItens] = useState<ItemDoAcervo[]>([]);
  const [facetas, setFacetas] = useState<Faceta[]>([]);
  const [resumo, setResumo] = useState<ResumoDoAcervo | null>(null);
  const [falhaDeCarga, setFalhaDeCarga] = useState<string | null>(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [pagina, setPagina] = useState(1);

  const [artigos, setArtigos] = useState<ArtigoDoConservatorio[]>([]);
  const [paginaDeArtigos, setPaginaDeArtigos] = useState(1);
  const [paginaDeLivros, setPaginaDeLivros] = useState(1);

  const areaDoFunil = useRef<HTMLDivElement>(null);

  const livros = useMemo(() => acervoService.livros(), []);

  const filtro: FiltroDoAcervo = useMemo(() => {
    const recortado: Record<string, string> = {};
    for (const [campo, valor] of Object.entries(escolhas)) {
      if (valor && valor !== TODOS) recortado[campo] = valor;
    }
    return { ...recortado, busca: busca.trim() || undefined };
  }, [escolhas, busca]);

  useEffect(() => {
    setArtigos(acervoService.artigos());
    let vivo = true;
    acervoService.resumo().then((r) => vivo && setResumo(r));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    let vivo = true;

    acervoService.listar(alvo as SecaoDoAcervo, filtro).then((lista) => {
      if (!vivo) return;
      setItens(lista);
      /** Recorte novo, página um: continuar na página sete de outra busca confunde. */
      setPagina(1);
      setFalhaDeCarga(acervoService.falhaDeCarga());
      setCarregandoInicial(false);
    });

    acervoService.facetas(alvo as SecaoDoAcervo, filtro).then((f) => vivo && setFacetas(f));

    return () => {
      vivo = false;
    };
  }, [alvo, filtro]);

  /** Trocar o que se procura zera o funil: os eixos de um alvo não valem no outro. */
  useEffect(() => {
    setEscolhas({});
  }, [alvo]);

  /**
   * Recorte que aponta para nada se limpa sozinho.
   *
   * As facetas se compõem, então um valor já escolhido pode cair fora da lista
   * nova. Sem isto o seletor fica em branco e a lista vem vazia — quem olha
   * conclui que o acervo não tem nada, e não que a combinação não existe.
   */
  useEffect(() => {
    if (facetas.length === 0) return;

    const orfaos = Object.entries(escolhas).filter(([campo, valor]) => {
      if (!valor || valor === TODOS) return false;
      const f = facetas.find((x) => x.campo === campo);
      return !f || !f.opcoes.some((o) => o.id === valor);
    });

    if (orfaos.length === 0) return;
    setEscolhas((r) => {
      const limpo = { ...r };
      for (const [campo] of orfaos) delete limpo[campo];
      return limpo;
    });
  }, [facetas, escolhas]);

  /** O funil fecha no Escape e no clique fora — é painel, e não outra tela. */
  useEffect(() => {
    if (!funilAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setFunilAberto(false);
    const aoClicarFora = (e: MouseEvent) => {
      if (areaDoFunil.current && !areaDoFunil.current.contains(e.target as Node)) {
        setFunilAberto(false);
      }
    };
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('mousedown', aoClicarFora);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('mousedown', aoClicarFora);
    };
  }, [funilAberto]);

  const etapas = useMemo(() => montarFunil(alvo, facetas, escolhas), [alvo, facetas, escolhas]);
  const recortes = quantosRecortes(escolhas);

  const totalDePaginas = Math.max(1, Math.ceil(itens.length / POR_PAGINA));
  const daPagina = itens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const unidade =
    alvo === 'COMPOSITORES'
      ? 'pessoas'
      : alvo === 'MOVIMENTOS'
        ? 'movimentos'
        : alvo === 'PARTITURAS'
          ? 'partituras'
          : alvo === 'ANTIGUIDADE'
            ? 'registros'
            : 'obras';

  const artigosDaPagina = artigos.slice(
    (paginaDeArtigos - 1) * POR_VITRINE,
    paginaDeArtigos * POR_VITRINE
  );
  const livrosDaPagina = livros.slice(
    (paginaDeLivros - 1) * POR_VITRINE,
    paginaDeLivros * POR_VITRINE
  );

  return (
    <ScreenContainer
      id="acervo"
      title="Acervo"
      subtitle="A biblioteca do Conservatório e o catálogo do repertório."
      badgeLabel="Acervo"
      badgeVariant="neutral"
      secondaryActions={[{ label: 'Ver no mapa do Atlas', onClick: () => navigate('/worlds') }]}
      state={carregandoInicial ? 'loading' : 'populated'}
      loadingMessage="Abrindo o acervo…"
    >
      <div className="space-y-8">
        {/* ------------------------------------------------------- o banner */}
        <section className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-wide text-anil-800">
            Conservatório Muscicapa
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
            O Acervo do Conservatório
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-700">
            Duas coisas vivem aqui, e elas são diferentes. A <strong>Biblioteca</strong> é o que
            esta escola escreve: os livros de cada curso e os artigos assinados — auditoria do
            próprio acervo, percurso de estudo, ensaio. O{' '}
            <strong>Acervo de compositores</strong> é o repertório que ela estuda: obras, pessoas,
            movimentos e partituras, registrados existam ou não disponíveis para estudo aqui.
          </p>

        </section>

        {/* ------------------------------------------ a navbar de duas seções */}
        <nav aria-label="Seções do acervo" className="border-b border-stone-200">
          <ul className="-mb-px flex gap-1">
            {(
              [
                ['BIBLIOTECA', 'Biblioteca'],
                ['ACERVO', 'Acervo de compositores'],
              ] as [Aba, string][]
            ).map(([id, rotulo]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setAba(id)}
                  aria-current={aba === id ? 'page' : undefined}
                  className={`border-b-2 px-4 py-2.5 text-sm transition-colors ${
                    aba === id
                      ? 'border-anil-800 font-semibold text-anil-800'
                      : 'border-transparent text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {rotulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* =================================================== A BIBLIOTECA */}
        {aba === 'BIBLIOTECA' && (
          <div className="space-y-8">
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif text-xl font-bold text-stone-900">A biblioteca oficial</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
                O que o Conservatório <strong>produz</strong>, e não o que ele cataloga. Os artigos
                são texto autoral assinado, com data, e toda obra que citam explica por que está
                ali. Os livros nascem de um curso: cada capítulo e cada questão vêm do próprio
                material, contados — nenhum número escrito à mão.
              </p>
            </section>

            <Vitrine
              titulo="Artigos publicados"
              descricao="Auditoria do próprio acervo, percurso de estudo e ensaio. Abertos a quem chega."
              total={artigos.length}
              pagina={paginaDeArtigos}
              onPagina={setPaginaDeArtigos}
            >
              {artigosDaPagina.map((a) => (
                <li key={a.id}>
                  {/*
                    O CARD INTEIRO ABRE O ARTIGO.

                    Antes ele mostrava o resumo e não levava a lugar nenhum — o
                    texto existia, seção por seção, e ninguém conseguia ler.
                  */}
                  <button
                    type="button"
                    onClick={() => navigate(`/acervo/artigo/${a.id}`)}
                    className="flex h-full w-full flex-col rounded-lg border border-stone-200 bg-white p-4 text-left transition-colors hover:border-anil-700"
                  >
                  <span className="w-fit rounded border border-ouro-300 bg-ouro-50 px-1.5 py-0.5 font-mono text-[10px] text-ouro-900">
                    {a.tipo === 'AUDITORIA'
                      ? 'Auditoria'
                      : a.tipo === 'PERCURSO'
                        ? 'Percurso de estudo'
                        : 'Ensaio'}
                  </span>
                  <h4 className="mt-2 font-serif text-base font-bold leading-tight text-stone-900">
                    {a.titulo}
                  </h4>
                  <p className="mt-1 text-xs text-stone-500">{a.subtitulo}</p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-700">{a.resumo}</p>
                  <p className="mt-3 border-t border-stone-100 pt-2 font-mono text-[11px] text-stone-500">
                    {a.autoria} · {new Date(a.publicadoEm).getFullYear()} · {a.obras.length}{' '}
                    {a.obras.length === 1 ? 'obra citada' : 'obras citadas'}
                  </p>
                  <span className="mt-2 text-xs font-medium text-anil-800 underline underline-offset-2">
                    Ler o artigo
                  </span>
                  </button>
                </li>
              ))}
            </Vitrine>

            <Vitrine
              titulo="Livros do Conservatório"
              descricao="Um por curso. Em curadoria editorial antes de abrir — e o que existe aparece com a contagem, em vez de ficar escondido."
              total={livros.length}
              pagina={paginaDeLivros}
              onPagina={setPaginaDeLivros}
            >
              {livrosDaPagina.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-col rounded-lg border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-bold leading-tight text-stone-900">
                      {l.titulo}
                    </h4>
                    {!l.liberado && (
                      /*
                        O SELO DIZ O ESTADO, e não um prazo.

                        Aqui dizia "em breve" — e "em breve" é promessa: ninguém
                        se comprometeu com data, e quem lê passa a esperar uma.
                        "Em curadoria" é verdade sobre onde o livro está, e o
                        motivo logo abaixo diz o resto.
                      */
                      <span className="flex shrink-0 items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        em curadoria
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-mono text-[11px] text-stone-500">
                    {l.capitulos} {l.capitulos === 1 ? 'capítulo' : 'capítulos'} · {l.questoes}{' '}
                    {l.questoes === 1 ? 'questão' : 'questões'}
                  </p>

                  {/*
                    O MOTIVO NUNCA FICA SÓ NUM `title`. "Em breve" sem explicação
                    deixa quem consulta sem saber se o livro existe, se está
                    sendo escrito, ou se foi cancelado.
                  */}
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-stone-600">{l.motivo}</p>
                </li>
              ))}
            </Vitrine>
          </div>
        )}

        {/* ============================================= O ACERVO DE PESSOAS */}
        {aba === 'ACERVO' && (
          <div className="space-y-5">
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="font-serif text-xl font-bold text-stone-900">
                O acervo de compositores
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
                O repertório que o Conservatório <strong>estuda</strong>. Toda obra aparece,
                qualquer que seja a situação de direito autoral — o que muda é o que a ficha diz:
                se toca aqui, se está apenas registrada, e para onde ir quando alguém quiser mais.
                Esconder o que não toca deixaria o catálogo de uma escola mutilado.
              </p>

              {/*
                AS MÉTRICAS VIVEM AQUI, e não no banner do topo.

                Lá em cima elas misturavam as duas seções — livros e artigos ao
                lado de obras e pessoas — e o banner passava a falar de tudo ao
                mesmo tempo. Ele apresenta as duas seções; o número pertence à
                seção que ele conta.
              */}
              {resumo && (
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { t: 'Obras catalogadas', v: resumo.obras },
                    { t: 'Compositores', v: resumo.compositores },
                    { t: 'Movimentos', v: resumo.movimentos },
                    { t: 'Para estudo aqui', v: resumo.tocaveis },
                  ].map((m) => (
                    <div
                      key={m.t}
                      className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
                    >
                      <dt className="text-[11px] leading-tight text-stone-600">{m.t}</dt>
                      <dd className="font-mono text-lg font-bold leading-none text-stone-900">
                        {m.v.toLocaleString('pt-BR')}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {/*
                A FILA DE RESOLUÇÃO NÃO APARECE AQUI, e isso é deliberado.

                Houve um recorte navegável de edições sem obra; depois, um
                aviso contando quantas eram. Os dois estavam errados pelo mesmo
                motivo: um número que quem lê não pode endereçar não informa,
                atrapalha. Quem abre um acervo quer a obra — a contagem do
                trabalho interno de catalogação é assunto de quem cataloga.

                A fila continua existindo e continua contada, em
                `resumo().naFilaDeResolucao`, que é o que o pente fino exige.
                Ela volta à tela quando cada edição tiver obra: na ficha da
                obra, que é onde uma edição significa alguma coisa.
              */}
            </section>

            {/* ------------------- a lupa no centro, o funil no canto ------------------- */}
            <div className="relative" ref={areaDoFunil}>
              <div className="flex items-start gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    aria-hidden="true"
                  />
                  <label htmlFor="busca-do-acervo" className="sr-only">
                    Buscar no acervo
                  </label>
                  <input
                    id="busca-do-acervo"
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Título, pessoa, número de catálogo…"
                    className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                {/*
                  O FUNIL É UM ÍCONE, e é isso que deixa a tela limpa.

                  Os onze seletores viviam abertos, lado a lado, disputando a
                  atenção com a listagem — e a busca estava repetida dentro
                  deles. Fechado, a tela mostra o que a pessoa veio ver; aberto,
                  mostra o caminho inteiro de afunilamento de uma vez.
                */}
                <button
                  type="button"
                  onClick={() => setFunilAberto((v) => !v)}
                  aria-expanded={funilAberto}
                  aria-controls="painel-do-funil"
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                    funilAberto || recortes > 0
                      ? 'border-anil-800 bg-anil-800 text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-anil-700'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Filtrar
                  {recortes > 0 && (
                    <span className="rounded-full bg-white/20 px-1.5 font-mono text-[11px]">
                      {recortes}
                    </span>
                  )}
                </button>
              </div>

              {funilAberto && (
                <PainelDoFunil
                  etapas={etapas}
                  escolhas={escolhas}
                  unidade={unidade}
                  onEscolher={(campo, valor) => setEscolhas((r) => ({ ...r, [campo]: valor }))}
                  onLimpar={() => setEscolhas({})}
                  onFechar={() => setFunilAberto(false)}
                />
              )}
            </div>

            {/* ----------------------------------------------- o que se procura */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ul className="flex flex-wrap gap-1.5" aria-label="O que você procura">
                {ALVOS.map((a) => (
                  <li key={a}>
                    <button
                      type="button"
                      onClick={() => setAlvo(a)}
                      aria-current={alvo === a ? 'true' : undefined}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        alvo === a
                          ? 'border-anil-800 bg-anil-800 text-white'
                          : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                      }`}
                    >
                      {ROTULO_DO_ALVO[a]}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="font-mono text-xs text-stone-500">
                {itens.length.toLocaleString('pt-BR')}{' '}
                {itens.length === 1 ? 'resultado' : 'resultados'}
                {totalDePaginas > 1 &&
                  ` · página ${pagina} de ${totalDePaginas.toLocaleString('pt-BR')}`}
              </p>
            </div>

            {/*
              "Vazio" e "inalcançável" são coisas diferentes. Quando o catálogo
              servido não chega, a listagem cai para o repertório próprio e todo
              compositor aparece com zero — sem esta linha, quem olha conclui que
              o acervo está vazio.
            */}
            {falhaDeCarga && (
              <div className="rounded-lg border border-ouro-300 bg-ouro-50 p-3" role="status">
                <p className="text-xs font-semibold text-stone-900">
                  O catálogo completo não carregou
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-700">
                  O que aparece abaixo é só o repertório próprio do Conservatório. As vinte e
                  quatro mil obras catalogadas vivem num arquivo servido que não respondeu (
                  {falhaDeCarga}). Recarregar a página costuma resolver.
                </p>
              </div>
            )}

            {itens.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                <p className="text-sm font-medium text-stone-700">Nada com esse recorte</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
                  Nenhum item do acervo corresponde ao que foi escolhido. Afrouxe uma etapa do
                  funil ou limpe a busca.
                </p>
                {recortes > 0 && (
                  <button
                    type="button"
                    onClick={() => setEscolhas({})}
                    className="mt-3 text-xs font-medium text-anil-800 underline underline-offset-2"
                  >
                    Limpar os {recortes} recortes
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {daPagina.map((i) => (
                  <Linha
                    key={i.id}
                    item={i}
                    onAbrir={
                      i.secao === 'OBRAS'
                        ? () => navigate(`/acervo/obra/${i.id}`)
                        : i.secao === 'COMPOSITORES'
                          ? () => navigate(`/acervo/compositor/${i.id}`)
                          : undefined
                    }
                    onAbrirAutor={
                      i.autorId ? () => navigate(`/acervo/compositor/${i.autorId}`) : undefined
                    }
                  />
                ))}
              </ul>
            )}

            {totalDePaginas > 1 && (
              <nav
                className="flex flex-wrap items-center justify-between gap-3"
                aria-label="Páginas do acervo"
              >
                <button
                  type="button"
                  disabled={pagina === 1}
                  onClick={() => setPagina((n) => Math.max(1, n - 1))}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 disabled:opacity-40"
                >
                  Anterior
                </button>

                <span className="font-mono text-xs text-stone-500">
                  {((pagina - 1) * POR_PAGINA + 1).toLocaleString('pt-BR')}–
                  {Math.min(pagina * POR_PAGINA, itens.length).toLocaleString('pt-BR')} de{' '}
                  {itens.length.toLocaleString('pt-BR')}
                </span>

                <button
                  type="button"
                  disabled={pagina >= totalDePaginas}
                  onClick={() => setPagina((n) => Math.min(totalDePaginas, n + 1))}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 disabled:opacity-40"
                >
                  Próxima
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
