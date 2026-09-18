import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { bookletService } from '../../../services/application/booklet.service';
import { academyService } from '../../../services/application/academy.service';
import {
  Livreto,
  CapituloLivreto,
  Questao,
  Choice,
  Avaliacao,
  TipoQuestao,
  DificuldadeQuestao,
  ProblemaDeLivreto,
  totalDeQuestoes,
  RelatorioDeEquivalencia,
} from '../../../domain/booklet';
import { AcademyCourse } from '../../../domain/academy';
import {
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ListChecks,
  GripVertical,
} from 'lucide-react';

/**
 * Editor de livretos de exercício.
 *
 * O caderno de cada curso, capítulo por capítulo, questão por questão —
 * editável inteiro: acrescentar, remover, reescrever, reordenar.
 *
 * DUAS COISAS QUE A TELA FAZ E QUE NÃO SÃO ÓBVIAS
 * -----------------------------------------------
 * 1. **Valida enquanto se escreve, e distingue erro de aviso.** Capítulo sem
 *    questão é trabalho em andamento e não trava o salvamento; resposta que
 *    não está entre as alternativas é defeito e trava. A diferença é o que
 *    permite salvar no meio da revisão sem publicar questão quebrada.
 *
 * 2. **O simulado se regenera do livreto.** Não há o que editar nele
 *    separadamente: ele É o livreto inteiro, na ordem dos capítulos. Editar o
 *    enunciado aqui conserta nos dois lugares.
 */

const ROTULO_TIPO: Record<TipoQuestao, string> = {
  MULTIPLA_ESCOLHA: 'Múltipla escolha',
  VERDADEIRO_FALSO: 'Verdadeiro ou falso',
  RESPOSTA_CURTA: 'Resposta curta',
  IDENTIFICACAO: 'Identificação',
};

const ROTULO_DIFICULDADE: Record<DificuldadeQuestao, string> = {
  basica: 'Básica',
  intermediaria: 'Intermediária',
  avancada: 'Avançada',
};

export const BookletEditorScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [livretos, setLivretos] = useState<Livreto[]>([]);
  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Livreto | null>(null);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [recado, setRecado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [equivalencia, setEquivalencia] = useState<RelatorioDeEquivalencia | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [lista, cursosLista] = await Promise.all([
        bookletService.listarLivretos(),
        academyService.getCourses(),
      ]);
      setLivretos(lista);
      setCursos(cursosLista);
      setSelecionadoId((atual) => atual ?? lista[0]?.id ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar os livretos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const achado = livretos.find((l) => l.id === selecionadoId) ?? null;
    setRascunho(achado ? (JSON.parse(JSON.stringify(achado)) as Livreto) : null);
    if (achado) {
      bookletService.listarAvaliacoes(achado.cursoId).then(setAvaliacoes).catch(() => setAvaliacoes([]));
    }
  }, [selecionadoId, livretos]);

  const problemas: ProblemaDeLivreto[] = useMemo(
    () => (rascunho ? bookletService.validar(rascunho) : []),
    [rascunho]
  );
  const temErro = problemas.some((p) => p.gravidade === 'erro');

  const avisar = (t: string) => {
    setRecado(t);
    setTimeout(() => setRecado(null), 4000);
  };

  const alterarCapitulo = (capId: string, mudanca: Partial<CapituloLivreto>) => {
    setRascunho((r) =>
      r
        ? { ...r, capitulos: r.capitulos.map((c) => (c.id === capId ? { ...c, ...mudanca } : c)) }
        : r
    );
  };

  const alterarQuestao = (capId: string, qId: string, mudanca: Partial<Questao>) => {
    setRascunho((r) =>
      r
        ? {
            ...r,
            capitulos: r.capitulos.map((c) =>
              c.id === capId
                ? { ...c, questoes: c.questoes.map((q) => (q.id === qId ? { ...q, ...mudanca } : q)) }
                : c
            ),
          }
        : r
    );
  };

  const alterarAlternativa = (capId: string, qId: string, altId: string, texto: string) => {
    setRascunho((r) =>
      r
        ? {
            ...r,
            capitulos: r.capitulos.map((c) =>
              c.id === capId
                ? {
                    ...c,
                    questoes: c.questoes.map((q) =>
                      q.id === qId
                        ? {
                            ...q,
                            choices: q.choices.map((a) =>
                              a.id === altId ? { ...a, texto } : a
                            ),
                          }
                        : q
                    ),
                  }
                : c
            ),
          }
        : r
    );
  };

  const salvar = async () => {
    if (!rascunho) return;
    try {
      await bookletService.salvarLivreto(rascunho);
      await carregar();
      avisar('Livreto salvo. O simulado acompanha — ele é o livreto inteiro.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const regerarSimulado = async () => {
    if (!rascunho) return;
    try {
      await bookletService.salvarLivreto(rascunho);
      await bookletService.regerarSimulado(rascunho.cursoId);
      setAvaliacoes(await bookletService.listarAvaliacoes(rascunho.cursoId));
      avisar('Simulado atualizado com as questões do livreto.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível gerar o simulado.');
    }
  };

  const conferirProva = async (prova: Avaliacao) => {
    try {
      setEquivalencia(await bookletService.conferirProva(prova));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível conferir.');
    }
  };

  const nomeDoCurso = (cursoId: string) =>
    cursos.find((c) => c.id === cursoId)?.title ?? cursoId;

  return (
    <PageLayout
      id="booklet-editor"
      form="detail"
      density="operational"
      asideLabel="Livretos"
      state={isLoading ? 'loading' : erro && !rascunho ? 'error' : livretos.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando os livretos..."
      errorProps={{ message: erro ?? '', onRetry: carregar }}
      emptyProps={{
        title: 'Nenhum livreto ainda',
        description:
          'Os livretos de exercício são gerados junto com cada curso, a partir do estudo do acervo. Assim que um curso ficar pronto, o caderno dele aparece aqui para revisão.',
        actionLabel: 'Ver os cursos',
        onAction: () => navigate('/admin/content'),
      }}
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">Livretos de exercício</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
            O caderno de cada curso, capítulo por capítulo. O simulado final usa exatamente estas
            questões — corrigir aqui corrige nos dois lugares.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Cadernos
          </p>
          <ul className="space-y-1">
            {livretos.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelecionadoId(l.id)}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    selecionadoId === l.id
                      ? 'bg-anil-900 font-semibold text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {l.titulo}
                  <span className="block font-mono text-[10px] opacity-70">
                    {l.capitulos.length} cap · {totalDeQuestoes(l)} questões
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {rascunho && (
          <Card variant="default" padding="md" className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Avaliações do curso
            </p>
            {avaliacoes.length === 0 ? (
              <p className="text-xs leading-relaxed text-stone-500">
                Nenhuma ainda. O simulado sai do livreto; a prova é escrita à parte.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {avaliacoes.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-stone-700">{a.titulo}</span>
                    {a.tipo === 'PROVA' && (
                      <button
                        type="button"
                        onClick={() => conferirProva(a)}
                        className="shrink-0 text-[10px] text-anil-700 hover:underline"
                      >
                        conferir
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={regerarSimulado}>
              <ListChecks className="mr-1 h-3.5 w-3.5" /> Gerar simulado
            </Button>
          </Card>
        )}

        {equivalencia && (
          <Card
            variant="default"
            padding="md"
            className={`space-y-2 ${equivalencia.equivalente ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}
          >
            <p className="text-xs font-semibold text-stone-900">
              {equivalencia.equivalente
                ? 'A prova cobre o que o curso ensinou.'
                : 'A prova não está equivalente.'}
            </p>
            {equivalencia.faltando.length > 0 && (
              <p className="text-[11px] leading-relaxed text-amber-900">
                Não cobrado na prova: {equivalencia.faltando.join(', ')}.
              </p>
            )}
            {equivalencia.excedentes.length > 0 && (
              <p className="text-[11px] leading-relaxed text-amber-900">
                Cobrado sem ter sido ensinado: {equivalencia.excedentes.join(', ')}.
              </p>
            )}
            <button
              type="button"
              onClick={() => setEquivalencia(null)}
              className="text-[10px] text-stone-500 hover:underline"
            >
              fechar
            </button>
          </Card>
        )}
      </PageLayout.Aside>

      <PageLayout.Main>
        {rascunho && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-base font-bold text-stone-900">{rascunho.titulo}</h2>
                <p className="font-mono text-[11px] text-stone-500">
                  {nomeDoCurso(rascunho.cursoId)} · {totalDeQuestoes(rascunho)} questões
                </p>
              </div>
              <div className="flex items-center gap-2">
                {recado && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {recado}
                  </span>
                )}
                <Button variant="primary" size="sm" onClick={salvar} disabled={temErro}>
                  <Save className="mr-1 h-3.5 w-3.5" /> Salvar
                </Button>
              </div>
            </div>

            {problemas.length > 0 && (
              <ul className="space-y-1 rounded-md border border-stone-200 bg-stone-50 p-3">
                {problemas.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-[11px] leading-relaxed ${
                      p.gravidade === 'erro' ? 'text-red-800' : 'text-amber-800'
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{p.mensagem}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Capítulos */}
            <div className="space-y-3">
              {rascunho.capitulos
                .slice()
                .sort((a, b) => a.numero - b.numero)
                .map((capitulo) => {
                  const aberto = abertos.has(capitulo.id);
                  return (
                    <Card key={capitulo.id} variant="default" padding="md" className="space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setAbertos((s) => {
                              const n = new Set(s);
                              if (n.has(capitulo.id)) n.delete(capitulo.id);
                              else n.add(capitulo.id);
                              return n;
                            })
                          }
                          className="shrink-0 text-stone-500 hover:text-stone-900"
                          aria-label={aberto ? 'Recolher capítulo' : 'Abrir capítulo'}
                        >
                          {aberto ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <span className="font-mono text-xs text-stone-400">{capitulo.numero}</span>
                        <input
                          type="text"
                          aria-label={`Título do capítulo ${capitulo.numero}`}
                          value={capitulo.titulo}
                          onChange={(e) => alterarCapitulo(capitulo.id, { titulo: e.target.value })}
                          className="flex-1 rounded border border-transparent px-1 py-0.5 font-serif text-sm font-bold text-stone-900 hover:border-stone-200 focus:border-stone-400 focus:outline-none"
                        />
                        <span className="shrink-0 font-mono text-[10px] text-stone-400">
                          {capitulo.questoes.length} q
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRascunho((r) =>
                              r
                                ? { ...r, capitulos: r.capitulos.filter((c) => c.id !== capitulo.id) }
                                : r
                            )
                          }
                          className="shrink-0 text-stone-400 hover:text-red-700"
                          aria-label="Remover capítulo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {aberto && (
                        <div className="space-y-3 border-t border-stone-100 pt-3">
                          {capitulo.questoes.map((q, indice) => (
                            <EditorDeQuestao
                              key={q.id}
                              questao={q}
                              indice={indice + 1}
                              onChange={(m) => alterarQuestao(capitulo.id, q.id, m)}
                              onAlternativa={(altId, texto) =>
                                alterarAlternativa(capitulo.id, q.id, altId, texto)
                              }
                              onRemover={() =>
                                alterarCapitulo(capitulo.id, {
                                  questoes: capitulo.questoes.filter((x) => x.id !== q.id),
                                })
                              }
                            />
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              alterarCapitulo(capitulo.id, {
                                questoes: [...capitulo.questoes, bookletService.criarQuestao()],
                              })
                            }
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Nova questão
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRascunho((r) =>
                  r
                    ? {
                        ...r,
                        capitulos: [
                          ...r.capitulos,
                          bookletService.criarCapitulo(r.capitulos.length + 1, 'Novo capítulo'),
                        ],
                      }
                    : r
                )
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Novo capítulo
            </Button>
          </div>
        )}
      </PageLayout.Main>
    </PageLayout>
  );
};

// ---------------------------------------------------------------------------

const EditorDeQuestao: React.FC<{
  questao: Questao;
  indice: number;
  onChange: (m: Partial<Questao>) => void;
  onAlternativa: (altId: string, texto: string) => void;
  onRemover: () => void;
}> = ({ questao, indice, onChange, onAlternativa, onRemover }) => {
  const problemas = bookletService.validarQuestao(questao);

  return (
    <div className="space-y-2 rounded-md border border-stone-200 bg-stone-50/60 p-3">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-1 h-3.5 w-3.5 shrink-0 text-stone-300" />
        <span className="mt-1 font-mono text-[10px] text-stone-400">{indice}</span>
        <textarea
        aria-label="Enunciado da questão"
          value={questao.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="Enunciado da questão"
          rows={2}
          className="flex-1 rounded border border-stone-300 p-2 text-xs text-stone-900 focus:border-stone-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={onRemover}
          className="mt-1 shrink-0 text-stone-400 hover:text-red-700"
          aria-label="Remover questão"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={questao.tipo}
          onChange={(e) => onChange({ tipo: e.target.value as TipoQuestao })}
          className="rounded border border-stone-300 px-2 py-1 text-[11px]"
          aria-label="Tipo da questão"
        >
          {(Object.keys(ROTULO_TIPO) as TipoQuestao[]).map((t) => (
            <option key={t} value={t}>
              {ROTULO_TIPO[t]}
            </option>
          ))}
        </select>
        <select
          value={questao.dificuldade}
          onChange={(e) => onChange({ dificuldade: e.target.value as DificuldadeQuestao })}
          className="rounded border border-stone-300 px-2 py-1 text-[11px]"
          aria-label="Dificuldade"
        >
          {(Object.keys(ROTULO_DIFICULDADE) as DificuldadeQuestao[]).map((d) => (
            <option key={d} value={d}>
              {ROTULO_DIFICULDADE[d]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={questao.competencias.join(', ')}
          onChange={(e) =>
            onChange({
              competencias: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="competências, separadas por vírgula"
          className="flex-1 rounded border border-stone-300 px-2 py-1 text-[11px]"
          aria-label="Competências verificadas"
        />
      </div>

      {questao.tipo !== 'RESPOSTA_CURTA' ? (
        <ul className="space-y-1">
          {questao.choices.map((a: Choice) => (
            <li key={a.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`resposta-${questao.id}`}
                checked={questao.resposta === a.id}
                onChange={() => onChange({ resposta: a.id })}
                className="accent-anil-800"
                aria-label={`Marcar alternativa ${a.id} como correta`}
              />
              <input
                type="text"
                aria-label={`Texto da alternativa ${a.id}`}
                value={a.texto}
                onChange={(e) => onAlternativa(a.id, e.target.value)}
                placeholder={`Alternativa ${a.id}`}
                className="flex-1 rounded border border-stone-300 px-2 py-1 text-[11px]"
              />
            </li>
          ))}
        </ul>
      ) : (
        <input
        aria-label="Resposta aceita"
          type="text"
          value={questao.resposta}
          onChange={(e) => onChange({ resposta: e.target.value })}
          placeholder="Resposta aceita"
          className="w-full rounded border border-stone-300 px-2 py-1 text-[11px]"
        />
      )}

      <textarea
        aria-label="Por que a resposta é essa — o aluno lê isto depois de responder"
        value={questao.explanation}
        onChange={(e) => onChange({ explanation: e.target.value })}
        placeholder="Por que a resposta é essa — o aluno lê isto depois de responder"
        rows={2}
        className="w-full rounded border border-stone-300 p-2 text-[11px] text-stone-800 focus:border-stone-500 focus:outline-none"
      />

      {problemas.length > 0 && (
        <ul className="space-y-0.5">
          {problemas.map((p, i) => (
            <li
              key={i}
              className={`text-[10px] ${p.gravidade === 'erro' ? 'text-red-700' : 'text-amber-700'}`}
            >
              {p.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
