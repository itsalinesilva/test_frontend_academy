import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { acervoService } from '../../../services/application/acervo.service';
import { editorialService } from '../../../services/application/editorial.service';
import { ArtigoDoConservatorio } from '../../../domain/article';
import {
  EdicaoDeArtigo,
  TIPOS_DE_ARTIGO,
  artigoEmBranco,
  problemasDoArtigo,
  rodapeDoArtigo,
} from '../../../domain/editorial-artigo';

/**
 * A ENGINE EDITORIAL DOS ARTIGOS.
 *
 * 🔴 A ANATOMIA É A DO ARTIGO, e não a de um formulário genérico
 * -------------------------------------------------------------
 * ```
 *   CABEÇALHO   tipo · título · subtítulo · resumo · autoria · instituição · data
 *   CORPO       seções, cada uma com título e .md
 *   CITAÇÕES    obra, pessoa, coletânea — cada uma com o MOTIVO
 *   RODAPÉ      derivado: quem assina, quando saiu, quando foi revisto, quantas referências
 * ```
 *
 * A ordem não é estética. É a ordem em que um texto acadêmico se monta, e é a
 * ordem em que ele é lido — quem revisa procura o resumo perto do título, não
 * no fim.
 *
 * 🔴 O RODAPÉ NÃO SE EDITA
 * ------------------------
 * Ele é calculado do artigo. Um rodapé digitado diverge do corpo no dia em que
 * uma citação entra e ninguém lembra de atualizá-lo — e aí a peça diz "12
 * obras" e percorre 14. Aqui ele aparece como **pré-visualização**, para quem
 * edita ver o que vai sair.
 *
 * 🔴 A CITAÇÃO EXIGE MOTIVO, E O CAMPO DIZ ISSO
 * ---------------------------------------------
 * Uma lista de obras sem justificativa é uma lista de opiniões escondidas.
 * A recusa vem do domínio; o que a tela faz é avisar antes, enquanto se edita.
 */
export const AdminArtigosScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { nome } = useCurrentUser();

  const [publicados, setPublicados] = useState<ArtigoDoConservatorio[]>([]);
  const [lidos, setLidos] = useState<ArtigoDoConservatorio[]>([]);
  const [edicoes, setEdicoes] = useState<EdicaoDeArtigo[]>([]);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pendentes, setPendentes] = useState(0);

  const recarregar = useCallback(async () => {
    const doSeed = acervoService.artigos();
    setPublicados(doSeed);
    setLidos(await editorialService.artigosComEdicoes(doSeed));
    setEdicoes(await editorialService.edicoesDeArtigos());
    setPendentes(await editorialService.pendentes());
  }, []);

  useEffect(() => {
    let vivo = true;
    recarregar().finally(() => {
      if (vivo) setCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, [recarregar]);

  const aberto = useMemo(() => lidos.find((a) => a.id === abertoId) ?? null, [lidos, abertoId]);

  function criar() {
    const id = `art_${Date.now().toString(36)}`;
    const novo = artigoEmBranco({ id, autoria: nome ?? '' });
    setLidos((l) => [...l, novo]);
    setAbertoId(id);
  }

  return (
    <PageLayout
      id="admin-artigos"
      form="detail"
      density="catalog"
      state={carregando ? 'loading' : 'content'}
      loadingMessage="Carregando os artigos…"
    >
      <PageLayout.Main>
        <div className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => navigate('/founder')}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-anil-800"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                Console
              </button>
              <h1 className="mt-1 font-serif text-2xl font-bold text-stone-900">
                Artigos da biblioteca
              </h1>
              <p className="text-xs text-stone-600">
                {publicados.length} publicados · {lidos.length - publicados.length} escritos aqui ·{' '}
                {edicoes.length} com edição
              </p>
            </div>

            {!aberto && (
              <button
                type="button"
                onClick={criar}
                className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Escrever artigo
              </button>
            )}
          </header>

          {pendentes > 0 && (
            <p
              role="status"
              className="rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs leading-relaxed text-stone-800"
            >
              <strong>
                {pendentes} {pendentes === 1 ? 'mudança' : 'mudanças'} gravadas neste navegador.
              </strong>{' '}
              Elas já valem para você, e <strong>ainda não chegaram ao aluno</strong>: exporte o
              pacote em Lições e exercícios e leve-o ao repositório por commit.
            </p>
          )}

          {aberto ? (
            <EditorDoArtigo
              artigo={aberto}
              publicado={publicados.find((a) => a.id === aberto.id) ?? null}
              editadaPor={nome ?? ''}
              temEdicao={edicoes.some((e) => e.artigoId === aberto.id)}
              onFechar={() => {
                setAbertoId(null);
                recarregar();
              }}
              onGravou={recarregar}
            />
          ) : (
            <ul className="space-y-2">
              {lidos.map((a) => {
                const edicao = edicoes.find((e) => e.artigoId === a.id);

                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setAbertoId(a.id)}
                      className="w-full rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-anil-700"
                    >
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-serif text-base font-bold text-stone-900">
                          {a.titulo || '(sem título)'}
                        </span>
                        {edicao && (
                          <span className="rounded-full bg-ouro-100 px-2 py-0.5 text-[10px] font-semibold text-stone-800">
                            {edicao.criado ? 'escrito aqui' : 'editado'}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-600">{a.subtitulo}</span>
                      <span className="mt-1 block text-[11px] text-stone-500">
                        {a.autoria} · {a.secoes.length} seções ·{' '}
                        {a.obras.length + a.pessoas.length + a.coletaneas.length} referências
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};

const rotulo = 'block text-[11px] font-semibold uppercase tracking-wide text-stone-500';
const campo =
  'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-anil-700 focus:outline-none';
const dica = 'mt-1 text-[11px] text-stone-500';

const EditorDoArtigo: React.FC<{
  artigo: ArtigoDoConservatorio;
  publicado: ArtigoDoConservatorio | null;
  editadaPor: string;
  temEdicao: boolean;
  onFechar: () => void;
  onGravou: () => Promise<void>;
}> = ({ artigo, publicado, editadaPor, temEdicao, onFechar, onGravou }) => {
  const [rascunho, setRascunho] = useState<ArtigoDoConservatorio>(artigo);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  useEffect(() => setRascunho(artigo), [artigo]);

  const problemas = problemasDoArtigo(rascunho);
  const rodape = rodapeDoArtigo(rascunho);
  const sujo = JSON.stringify(rascunho) !== JSON.stringify(artigo);

  const troca = <K extends keyof ArtigoDoConservatorio>(
    chave: K,
    valor: ArtigoDoConservatorio[K]
  ) => setRascunho((r) => ({ ...r, [chave]: valor }));

  async function gravar() {
    setGravando(true);
    setErro(null);
    try {
      await editorialService.salvarArtigo({
        artigo: rascunho,
        publicado,
        editadaPor,
        motivo: motivo.trim() || undefined,
      });
      await onGravou();
      setMotivo('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível gravar.');
    } finally {
      setGravando(false);
    }
  }

  async function remover() {
    await editorialService.removerArtigo(rascunho.id);
    onFechar();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onFechar}
        className="flex items-center gap-1 text-xs text-stone-500 hover:text-anil-800"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Voltar à lista
      </button>

      {/* ---------------------------------------------------------------- */}
      <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Cabeçalho do artigo">
        <h2 className="font-mono text-[10px] uppercase tracking-wide text-anil-800">Cabeçalho</h2>

        <div className="mt-3 space-y-3">
          <label className="block">
            <span className={rotulo}>Natureza do artigo</span>
            <select
              value={rascunho.tipo}
              onChange={(e) => troca('tipo', e.target.value as ArtigoDoConservatorio['tipo'])}
              className={campo}
            >
              {TIPOS_DE_ARTIGO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo} — {t.explica}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={rascunho.titulo}
              onChange={(e) => troca('titulo', e.target.value)}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Subtítulo</span>
            <input
              value={rascunho.subtitulo}
              onChange={(e) => troca('subtitulo', e.target.value)}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Resumo</span>
            <textarea
              value={rascunho.resumo}
              onChange={(e) => troca('resumo', e.target.value)}
              rows={3}
              className={campo}
            />
            <span className={dica}>
              Diz o que o artigo <strong>conclui</strong>, e não o que ele vai discutir — é por ele
              que alguém decide abrir.
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={rotulo}>Autoria</span>
              <input
                value={rascunho.autoria}
                onChange={(e) => troca('autoria', e.target.value)}
                className={campo}
              />
            </label>
            <label className="block">
              <span className={rotulo}>Instituição</span>
              <input
                value={rascunho.instituicao}
                onChange={(e) => troca('instituicao', e.target.value)}
                className={campo}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={rotulo}>Publicado em</span>
              <input
                type="date"
                value={rascunho.publicadoEm.slice(0, 10)}
                onChange={(e) =>
                  troca('publicadoEm', new Date(`${e.target.value}T00:00:00Z`).toISOString())
                }
                className={campo}
              />
            </label>
            <label className="block">
              <span className={rotulo}>Etiquetas</span>
              <input
                value={rascunho.etiquetas.join(', ')}
                onChange={(e) =>
                  troca(
                    'etiquetas',
                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="brasil, século XIX"
                className={campo}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <SecoesDoArtigo artigo={rascunho} onChange={setRascunho} />

      {/* ---------------------------------------------------------------- */}
      <CitacoesDoArtigo artigo={rascunho} onChange={setRascunho} />

      {/* ---------------------------------------------------------------- */}
      <section
        className="rounded-xl border border-stone-200 bg-stone-50 p-4"
        aria-label="Rodapé do artigo"
      >
        <h2 className="font-mono text-[10px] uppercase tracking-wide text-anil-800">
          Rodapé — como vai sair
        </h2>

        <p className="mt-2 text-sm text-stone-800">
          {rodape.autoria || '(sem autoria)'} · {rodape.instituicao}
        </p>
        <p className="mt-0.5 text-xs text-stone-600">
          Publicado em {rodape.publicadoEm.slice(0, 10)}
          {rodape.revisado && ` · revisto em ${rodape.atualizadoEm.slice(0, 10)}`}
        </p>
        <p className="mt-1 text-xs text-stone-600">
          {rodape.referencias.total} referências — {rodape.referencias.obras} obras,{' '}
          {rodape.referencias.pessoas} pessoas, {rodape.referencias.coletaneas} coletâneas.
        </p>

        {/*
          Dito onde quem edita vai procurar o campo e não achar. Sem esta linha,
          a ausência de campos parece esquecimento.
        */}
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
          O rodapé é <strong>calculado do artigo</strong>, e por isso não tem campos. Um rodapé
          digitado diverge do corpo no dia em que uma citação entra e ninguém lembra de atualizá-lo.
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      {problemas.length > 0 && (
        <ul className="space-y-0.5 rounded-lg bg-red-50 p-3">
          {problemas.map((p) => (
            <li key={p} className="text-[11px] text-red-800">
              {p}
            </li>
          ))}
        </ul>
      )}

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-950">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <label className="min-w-0 flex-1">
          <span className={rotulo}>Por que esta mudança</span>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Aparece no histórico de revisão"
            className={campo}
          />
        </label>

        {temEdicao && (
          <button
            type="button"
            onClick={remover}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-800"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {/*
              A palavra muda com o que o botão faz. Para artigo publicado, isto
              é REVERTER; para o escrito aqui, é apagar — ele não existe em
              lugar nenhum além da camada.
            */}
            {publicado ? 'Reverter ao publicado' : 'Apagar este artigo'}
          </button>
        )}

        <button
          type="button"
          onClick={() => setRascunho(artigo)}
          disabled={!sujo}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Descartar
        </button>

        <button
          type="button"
          onClick={gravar}
          disabled={gravando || problemas.length > 0}
          className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {gravando ? 'Gravando…' : 'Gravar artigo'}
        </button>
      </div>
    </div>
  );
};

const SecoesDoArtigo: React.FC<{
  artigo: ArtigoDoConservatorio;
  onChange: (a: ArtigoDoConservatorio) => void;
}> = ({ artigo, onChange }) => {
  /** A ordem é a POSIÇÃO, renumerada — buraco faria quem lê procurar a que falta. */
  const renumerar = (secoes: ArtigoDoConservatorio['secoes']) =>
    secoes.map((s, i) => ({ ...s, ordem: i + 1 }));

  function mover(i: number, passo: number) {
    const j = i + passo;
    if (j < 0 || j >= artigo.secoes.length) return;
    const copia = [...artigo.secoes];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange({ ...artigo, secoes: renumerar(copia) });
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Corpo do artigo">
      <h2 className="font-mono text-[10px] uppercase tracking-wide text-anil-800">Corpo</h2>

      <ol className="mt-3 space-y-3">
        {artigo.secoes.map((s, i) => (
          <li key={s.id} className="rounded-lg border border-stone-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase text-stone-400">Seção {s.ordem}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label={`Subir seção ${i + 1}`}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === artigo.secoes.length - 1}
                  aria-label={`Descer seção ${i + 1}`}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...artigo,
                      secoes: renumerar(artigo.secoes.filter((_, j) => j !== i)),
                    })
                  }
                  aria-label={`Remover seção ${i + 1}`}
                  className="rounded p-1 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <input
              value={s.titulo}
              onChange={(e) => {
                const secoes = [...artigo.secoes];
                secoes[i] = { ...s, titulo: e.target.value };
                onChange({ ...artigo, secoes });
              }}
              aria-label={`Título da seção ${i + 1}`}
              placeholder="Título da seção"
              className={campo}
            />

            <textarea
              value={s.markdown}
              onChange={(e) => {
                const secoes = [...artigo.secoes];
                secoes[i] = { ...s, markdown: e.target.value };
                onChange({ ...artigo, secoes });
              }}
              aria-label={`Texto da seção ${i + 1}`}
              rows={10}
              className={`${campo} font-mono`}
            />
            <span className={dica}>
              Markdown: <code>**negrito**</code>, <code>*itálico*</code>, <code>## título</code>,
              <code> - lista</code>.
            </span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() =>
          onChange({
            ...artigo,
            secoes: renumerar([
              ...artigo.secoes,
              {
                id: `${artigo.id}_s${Date.now().toString(36)}`,
                titulo: '',
                markdown: '',
                ordem: artigo.secoes.length + 1,
              },
            ]),
          })
        }
        className="mt-3 flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-anil-700"
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
        Acrescentar seção
      </button>
    </section>
  );
};

const CitacoesDoArtigo: React.FC<{
  artigo: ArtigoDoConservatorio;
  onChange: (a: ArtigoDoConservatorio) => void;
}> = ({ artigo, onChange }) => (
  <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Citações do artigo">
    <h2 className="font-mono text-[10px] uppercase tracking-wide text-anil-800">Citações</h2>
    <p className={dica}>
      Cada citação diz <strong>por que</strong> aquilo entra. Lista sem justificativa é lista de
      opiniões escondidas — quem lê não sabe se a peça está ali por ser representativa ou porque
      alguém gostou dela.
    </p>

    <ListaDeCitacoes
      titulo="Obras"
      itens={artigo.obras.map((o) => ({ id: o.obraId, motivo: o.motivo }))}
      onChange={(itens) =>
        onChange({ ...artigo, obras: itens.map((i) => ({ obraId: i.id, motivo: i.motivo })) })
      }
    />
    <ListaDeCitacoes
      titulo="Pessoas"
      itens={artigo.pessoas.map((p) => ({ id: p.pessoaId, motivo: p.motivo }))}
      onChange={(itens) =>
        onChange({ ...artigo, pessoas: itens.map((i) => ({ pessoaId: i.id, motivo: i.motivo })) })
      }
    />
    <ListaDeCitacoes
      titulo="Coletâneas"
      itens={artigo.coletaneas.map((c) => ({ id: c.coletaneaId, motivo: c.motivo }))}
      onChange={(itens) =>
        onChange({
          ...artigo,
          coletaneas: itens.map((i) => ({ coletaneaId: i.id, motivo: i.motivo })),
        })
      }
    />
  </section>
);

const ListaDeCitacoes: React.FC<{
  titulo: string;
  itens: Array<{ id: string; motivo: string }>;
  onChange: (itens: Array<{ id: string; motivo: string }>) => void;
}> = ({ titulo, itens, onChange }) => (
  <fieldset className="mt-4">
    <legend className={rotulo}>
      {titulo} ({itens.length})
    </legend>

    <ul className="mt-2 space-y-2">
      {itens.map((it, i) => (
        <li key={i} className="flex flex-wrap items-start gap-2 rounded-lg border border-stone-200 p-2">
          <input
            value={it.id}
            onChange={(e) => {
              const copia = [...itens];
              copia[i] = { ...it, id: e.target.value };
              onChange(copia);
            }}
            aria-label={`Identificador — ${titulo} ${i + 1}`}
            placeholder="identificador"
            className={`${campo} mt-0 w-full font-mono sm:w-56`}
          />
          <input
            value={it.motivo}
            onChange={(e) => {
              const copia = [...itens];
              copia[i] = { ...it, motivo: e.target.value };
              onChange(copia);
            }}
            aria-label={`Motivo — ${titulo} ${i + 1}`}
            placeholder="Por que esta entra aqui"
            className={`${campo} mt-0 min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => onChange(itens.filter((_, j) => j !== i))}
            aria-label={`Remover ${titulo} ${i + 1}`}
            className="rounded p-2 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>

    <button
      type="button"
      onClick={() => onChange([...itens, { id: '', motivo: '' }])}
      className="mt-2 flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:border-anil-700"
    >
      <Plus className="h-3 w-3" aria-hidden="true" />
      Acrescentar
    </button>
  </fieldset>
);
