import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { academyService } from '../../../services/application/academy.service';
import { editorialService } from '../../../services/application/editorial.service';
import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../../../domain/academy';
import { isEditableBlock, problemasDoBloco } from '../../../domain/editorial-edit';
import { CamposDoBloco } from './CamposDoBloco';

/**
 * A ENGINE EDITORIAL DE LIÇÕES — curso, módulo, lição, bloco.
 *
 * 🔴 POR QUE ESTA TELA EXISTE, SE JÁ HÁ EDIÇÃO NO TEATRO DA LIÇÃO
 * ---------------------------------------------------------------
 * O editor embutido no teatro serve para **corrigir o que se está lendo**:
 * achou o erro, consertou, seguiu lendo. É o melhor caminho para a correção
 * pontual, e continua existindo.
 *
 * O que ele não permite é trabalhar sobre o conjunto: ver quantas lições
 * existem, quais já foram tocadas, acrescentar um pentagrama onde não havia
 * nenhum, reordenar uma seção, e — o mais importante — **tirar o trabalho do
 * navegador**.
 *
 * 🔴 O QUE A TELA PRECISA DIZER, E DIZ
 * ------------------------------------
 * A edição grava em `localStorage`. Ela aparece na hora para quem editou, e
 * **não chega ao aluno** enquanto não virar commit. Uma tela que escondesse
 * isso faria alguém corrigir vinte lições e ir embora achando que publicou.
 *
 * Por isso o aviso de pendências é permanente enquanto houver mudança não
 * exportada, e não um rodapé discreto.
 */
/** "1 correção", "3 correções" — o recado conta tudo o que viaja no pacote. */
function contar(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

export const AdminLicoesScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { nome } = useCurrentUser();

  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [modulos, setModulos] = useState<AcademyModule[]>([]);
  const [licoes, setLicoes] = useState<AcademyLesson[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [cursoAberto, setCursoAberto] = useState<string | null>(null);
  const [licaoAberta, setLicaoAberta] = useState<string | null>(null);
  const [pendentes, setPendentes] = useState(0);
  const [recado, setRecado] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);

  const recarregarPendentes = useCallback(async () => {
    setPendentes(await editorialService.pendentes());
  }, []);

  useEffect(() => {
    let vivo = true;

    (async () => {
      try {
        const lidos = await academyService.getCourses();
        const mods = (await Promise.all(lidos.map((c) => academyService.getModules(c.id)))).flat();
        const lics = (await Promise.all(mods.map((m) => academyService.getLessons(m.id)))).flat();

        if (!vivo) return;
        setCursos(lidos);
        setModulos(mods);
        /** Já com a camada por cima: o editor abre o que está valendo. */
        setLicoes(await editorialService.licoesComEdicoes(lics));
        await recarregarPendentes();
      } finally {
        if (vivo) setCarregando(false);
      }
    })();

    return () => {
      vivo = false;
    };
  }, [recarregarPendentes]);

  const licao = useMemo(() => licoes.find((l) => l.id === licaoAberta) ?? null, [licoes, licaoAberta]);

  async function exportar() {
    const { json, nomeDoArquivo, resumo } = await editorialService.exportarPacote(nome ?? undefined);

    /**
     * Descarregar pelo navegador, e não copiar para a área de transferência.
     * O destino é um arquivo no repositório, e colar JSON de vinte lições num
     * editor é onde se perde metade.
     */
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeDoArquivo;
    a.click();
    URL.revokeObjectURL(url);

    setRecado({
      tom: 'ok',
      texto: `${contar(resumo.edicoes, 'correção', 'correções')}, ${contar(resumo.licoesCriadas, 'lição criada', 'lições criadas')}, ${contar(resumo.artigos, 'artigo', 'artigos')}, ${contar(resumo.livretos, 'livreto', 'livretos')} (${contar(resumo.questoes, 'questão', 'questões')}) e ${contar(resumo.secoesDeLivro, 'seção de livro', 'seções de livro')}, em ${nomeDoArquivo}. Falta o commit para chegar ao aluno.`,
    });
  }

  async function importar(arquivo: File) {
    const r = await editorialService.importarPacote(await arquivo.text());

    if (!r.ok) {
      setRecado({ tom: 'erro', texto: r.motivo ?? 'O pacote não pôde ser lido.' });
      return;
    }

    /**
     * O recado conta o que aconteceu, item a item. "Importado com sucesso"
     * esconderia o caso em que nada entrou porque tudo era mais antigo.
     */
    setRecado({
      tom: 'ok',
      texto: ([
        ['Edições', r.edicoes!],
        ['Lições', r.licoes!],
        ['Artigos', r.artigos!],
        ['Livretos', r.livretos!],
        ['Seções de livro', r.secoesDeLivro!],
      ] as const)
        .map(
          ([nome, c]) =>
            `${nome}: ${c.adicionadas} novas, ${c.substituidas} atualizadas, ${c.mantidas} mantidas por serem mais recentes.`
        )
        .join(' '),
    });

    const lics = (await Promise.all(modulos.map((m) => academyService.getLessons(m.id)))).flat();
    setLicoes(await editorialService.licoesComEdicoes(lics));
    await recarregarPendentes();
  }

  return (
    <PageLayout
      id="admin-licoes"
      form="detail"
      density="catalog"
      state={carregando ? 'loading' : 'content'}
      loadingMessage="Carregando o acervo de lições…"
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
                Lições e exercícios
              </h1>
              <p className="text-xs text-stone-600">
                {cursos.length} cursos · {modulos.length} módulos · {licoes.length} lições
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportar}
                className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-3 py-2 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar pacote
              </button>

              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:border-anil-700">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Importar
                <input
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  aria-label="Importar pacote editorial"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importar(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </header>

          {/*
            🔴 O AVISO DE PENDÊNCIA É PERMANENTE enquanto houver mudança.

            Sem ele, quem corrige vinte lições vai embora achando que publicou.
            A camada só chega ao aluno por commit, e isso precisa estar dito
            onde a pessoa está trabalhando.
          */}
          {pendentes > 0 && (
            <p
              role="status"
              className="rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs leading-relaxed text-stone-800"
            >
              <strong>
                {pendentes} {pendentes === 1 ? 'mudança' : 'mudanças'} gravadas neste navegador.
              </strong>{' '}
              Elas já valem para você, e <strong>ainda não chegaram ao aluno</strong>: exporte o
              pacote e leve-o ao repositório por commit. Limpar os dados do navegador apaga o que
              não foi exportado.
            </p>
          )}

          {recado && (
            <p
              role="status"
              className={`rounded-lg p-3 text-xs leading-relaxed ${
                recado.tom === 'ok'
                  ? 'bg-emerald-50 text-emerald-950'
                  : 'bg-red-50 text-red-950'
              }`}
            >
              {recado.texto}
            </p>
          )}

          {licao ? (
            <EditorDaLicao
              licao={licao}
              editadaPor={nome ?? ''}
              onFechar={() => setLicaoAberta(null)}
              onGravou={async () => {
                const lics = (
                  await Promise.all(modulos.map((m) => academyService.getLessons(m.id)))
                ).flat();
                setLicoes(await editorialService.licoesComEdicoes(lics));
                await recarregarPendentes();
              }}
            />
          ) : (
            <ListaDeCursos
              cursos={cursos}
              modulos={modulos}
              licoes={licoes}
              cursoAberto={cursoAberto}
              onAbrirCurso={(id) => setCursoAberto((a) => (a === id ? null : id))}
              onAbrirLicao={setLicaoAberta}
            />
          )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};

/** Curso → módulo → lição. A navegação é a mesma que a Academia publica. */
const ListaDeCursos: React.FC<{
  cursos: AcademyCourse[];
  modulos: AcademyModule[];
  licoes: AcademyLesson[];
  cursoAberto: string | null;
  onAbrirCurso: (id: string) => void;
  onAbrirLicao: (id: string) => void;
}> = ({ cursos, modulos, licoes, cursoAberto, onAbrirCurso, onAbrirLicao }) => (
  <ul className="space-y-2">
    {cursos.map((c) => {
      const meus = modulos.filter((m) => m.courseId === c.id).sort((a, b) => a.order - b.order);
      const quantasLicoes = licoes.filter((l) => l.courseId === c.id).length;

      return (
        <li key={c.id} className="rounded-xl border border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => onAbrirCurso(c.id)}
            aria-expanded={cursoAberto === c.id}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <span>
              <span className="block font-serif text-base font-bold text-stone-900">{c.title}</span>
              <span className="block text-[11px] text-stone-500">
                {meus.length} módulos · {quantasLicoes} lições
              </span>
            </span>
          </button>

          {cursoAberto === c.id && (
            <ol className="space-y-1 border-t border-stone-100 px-4 pb-4 pt-2">
              {meus.map((m) => {
                const doModulo = licoes
                  .filter((l) => l.moduleId === m.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <li key={m.id}>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-stone-400">
                      {m.order}. {m.title}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {doModulo.map((l) => (
                        <li key={l.id}>
                          <button
                            type="button"
                            onClick={() => onAbrirLicao(l.id)}
                            className="w-full rounded px-2 py-1 text-left text-xs text-stone-700 hover:bg-anil-50 hover:text-anil-800"
                          >
                            {l.variants?.TRADITIONAL?.title ?? l.canonicalContentId}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>
          )}
        </li>
      );
    })}
  </ul>
);

/**
 * O editor de uma lição: as seções, e os blocos de cada uma.
 *
 * O rascunho vive aqui e só desce ao serviço na gravação. Gravar a cada tecla
 * encheria a camada de versões intermediárias — e `anterior` passaria a
 * apontar para um estado que nunca foi publicado.
 */
const EditorDaLicao: React.FC<{
  licao: AcademyLesson;
  editadaPor: string;
  onFechar: () => void;
  onGravou: () => Promise<void>;
}> = ({ licao, editadaPor, onFechar, onGravou }) => {
  const variante = licao.variants?.TRADITIONAL;
  const [secaoAberta, setSecaoAberta] = useState<string | null>(
    variante?.sections[0]?.id ?? null
  );

  if (!variante) {
    return (
      <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
        Esta lição não tem variante adulta publicada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onFechar}
        className="flex items-center gap-1 text-xs text-stone-500 hover:text-anil-800"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Voltar à lista
      </button>

      <h2 className="font-serif text-xl font-bold text-stone-900">{variante.title}</h2>

      {variante.sections.map((secao) => (
        <section key={secao.id} className="rounded-xl border border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setSecaoAberta((a) => (a === secao.id ? null : secao.id))}
            aria-expanded={secaoAberta === secao.id}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <span className="text-sm font-semibold text-stone-900">{secao.title}</span>
            <span className="font-mono text-[10px] text-stone-500">
              {(secao.blocks ?? []).length} blocos
            </span>
          </button>

          {secaoAberta === secao.id && (
            <EditorDeBlocos
              lessonId={licao.id}
              secaoId={secao.id}
              publicados={secao.blocks ?? []}
              editadaPor={editadaPor}
              onGravou={onGravou}
            />
          )}
        </section>
      ))}
    </div>
  );
};

/** Os tipos que se pode acrescentar, com um exemplo já válido em cada um. */
const NOVOS: Array<{ rotulo: string; criar: (id: string) => LessonBlock }> = [
  { rotulo: 'Texto (.md)', criar: (id) => ({ kind: 'MARKDOWN', id, markdown: '' }) },
  {
    rotulo: 'Destaque',
    criar: (id) => ({ kind: 'CALLOUT', id, type: 'info', title: '', text: '' }),
  },
  {
    rotulo: 'Pentagrama',
    criar: (id) => ({ kind: 'STAFF', id, clef: 'treble', notes: ['C4', 'E4', 'G4'] }),
  },
  {
    rotulo: 'Player',
    criar: (id) => ({
      kind: 'AUDIO_EXAMPLE',
      id,
      title: 'Exemplo',
      notes: ['C4', 'E4', 'G4'],
      playMode: 'SEQUENCE',
    }),
  },
  { rotulo: 'Teclado', criar: (id) => ({ kind: 'KEYBOARD', id, highlightNotes: ['C4'] }) },
  {
    rotulo: 'Diagrama',
    criar: (id) => ({ kind: 'DIAGRAM', id, title: '', diagram: 'CIRCLE_OF_FIFTHS' }),
  },
  {
    rotulo: 'Verificação',
    criar: (id) => ({
      kind: 'CHECKPOINT',
      id,
      question: '',
      options: ['', ''],
      correctIndex: 0,
      explanation: '',
    }),
  },
  {
    rotulo: 'Lab de intervalo',
    criar: (id) => ({ kind: 'INTERVAL_LAB', id, title: '', lowerNote: 'C4', upperNote: 'E4' }),
  },
  {
    rotulo: 'Lab de acorde',
    criar: (id) => ({ kind: 'CHORD_LAB', id, title: '', notes: ['C4', 'E4', 'G4'] }),
  },
  {
    rotulo: 'Lab de escala',
    criar: (id) => ({ kind: 'SCALE_LAB', id, title: '', tonic: 'C4', mode: 'MAJOR' }),
  },

  // ---- a biblioteca funcional ---------------------------------------------
  {
    rotulo: 'Player com onda',
    criar: (id) => ({
      kind: 'PLAYER',
      id,
      title: 'Ouça',
      notes: ['C4', 'E4', 'G4'],
      playMode: 'SEQUENCE',
    }),
  },
  {
    rotulo: 'Rolo de piano',
    criar: (id) => ({
      kind: 'PIANO_ROLL',
      id,
      notas: [
        { nota: 'C4', inicioEmTempos: 0, duracaoEmTempos: 2 },
        { nota: 'E4', inicioEmTempos: 2, duracaoEmTempos: 2 },
      ],
    }),
  },
  {
    rotulo: 'Afinador',
    criar: (id) => ({ kind: 'TUNER_LAB', id, title: 'Cante a nota', notaAlvo: 'A4' }),
  },
  {
    rotulo: 'Tabela',
    criar: (id) => ({
      kind: 'TABELA',
      id,
      colunas: ['Modo', 'Terça', 'Sétima'],
      linhas: [['Maior', 'maior', 'maior']],
    }),
  },
  { rotulo: 'Citação', criar: (id) => ({ kind: 'CITACAO', id, texto: '', fonte: '' }) },
  {
    rotulo: 'Linha do tempo',
    criar: (id) => ({
      kind: 'LINHA_DO_TEMPO',
      id,
      title: '',
      marcos: [
        { ano: 1600, titulo: '' },
        { ano: 1750, titulo: '' },
      ],
    }),
  },
  {
    rotulo: 'Sessão de exercícios',
    criar: (id) => ({
      kind: 'SESSAO_DE_EXERCICIOS',
      id,
      title: '',
      vidas: 3,
      questoes: [
        {
          id: `${id}_q1`,
          enunciado: '',
          alternativas: ['', ''],
          corretaIndex: 0,
          explicacao: '',
        },
      ],
    }),
  },
];

const EditorDeBlocos: React.FC<{
  lessonId: string;
  secaoId: string;
  publicados: LessonBlock[];
  editadaPor: string;
  onGravou: () => Promise<void>;
}> = ({ lessonId, secaoId, publicados, editadaPor, onGravou }) => {
  const [rascunho, setRascunho] = useState<LessonBlock[]>(publicados);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  /** Reabrir a seção depois de gravar tem de mostrar o que foi gravado. */
  useEffect(() => setRascunho(publicados), [publicados]);

  const sujo = JSON.stringify(rascunho) !== JSON.stringify(publicados);

  function trocar(i: number, b: LessonBlock) {
    setRascunho((r) => r.map((x, j) => (j === i ? b : x)));
  }

  function mover(i: number, passo: number) {
    const j = i + passo;
    if (j < 0 || j >= rascunho.length) return;
    const copia = [...rascunho];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setRascunho(copia);
  }

  async function gravar() {
    setGravando(true);
    setErro(null);
    try {
      await editorialService.salvarBlocosDaSecao({
        lessonId,
        variante: 'TRADITIONAL',
        secaoId,
        blocos: rascunho,
        publicados,
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

  return (
    <div className="space-y-3 border-t border-stone-100 p-4">
      {rascunho.map((b, i) => {
        const problemas = problemasDoBloco(b);

        return (
          <article key={b.id} className="rounded-lg border border-stone-200 p-3">
            <header className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-anil-800">
                {b.kind}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label={`Subir bloco ${i + 1}`}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === rascunho.length - 1}
                  aria-label={`Descer bloco ${i + 1}`}
                  className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setRascunho((r) => r.filter((_, j) => j !== i))}
                  aria-label={`Remover bloco ${i + 1}`}
                  className="rounded p-1 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="mt-2">
              {isEditableBlock(b) ? (
                <CamposDoBloco bloco={b} onChange={(novo) => trocar(i, novo)} />
              ) : (
                <p className="text-xs text-stone-600">
                  Este tipo de bloco não tem campos para editar. Dá para removê-lo ou movê-lo.
                </p>
              )}
            </div>

            {/*
              O problema aparece ENQUANTO se edita, e não só ao gravar.
              Descobrir que a nota está errada depois de escrever a seção
              inteira é descobrir tarde.
            */}
            {problemas.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {problemas.map((p) => (
                  <li key={p} className="text-[11px] text-red-700">
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}

      <div className="flex flex-wrap gap-1.5">
        {NOVOS.map((n) => (
          <button
            key={n.rotulo}
            type="button"
            onClick={() =>
              setRascunho((r) => [
                ...r,
                /**
                 * Identificador derivado da seção e do relógio. Precisa ser
                 * único dentro da seção: id repetido faz a correção de um
                 * bloco pousar nos dois.
                 */
                n.criar(`${secaoId}_n${Date.now().toString(36)}`),
              ])
            }
            className="flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:border-anil-700 hover:text-anil-800"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {n.rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-950">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3 border-t border-stone-100 pt-3">
        <label className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Por que esta mudança
          </span>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Aparece no histórico de revisão"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={() => setRascunho(publicados)}
          disabled={!sujo}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Descartar
        </button>

        <button
          type="button"
          onClick={gravar}
          disabled={!sujo || gravando}
          className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          {gravando ? 'Gravando…' : 'Gravar seção'}
        </button>
      </div>
    </div>
  );
};
