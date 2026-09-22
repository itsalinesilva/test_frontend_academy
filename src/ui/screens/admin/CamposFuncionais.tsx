import React from 'react';
import { LessonBlock } from '../../../domain/academy';

/**
 * OS CAMPOS DOS BLOCOS DA BIBLIOTECA FUNCIONAL.
 *
 * Separado de `CamposDoBloco` porque aquele arquivo já cobria doze tipos, e um
 * arquivo de setecentas linhas onde se procura um campo é o mesmo problema que
 * um formulário de setenta campos: existe tudo, e não se acha nada.
 *
 * O contrato é o mesmo: um editor por tipo, com os campos que aquele bloco
 * tem, e a dica de formato colada no campo. Uma caixa de JSON seria mais curta
 * e inutilizável — quem revisa conteúdo musical não deve precisar saber que
 * `playMode` aceita dois valores.
 */

const rotulo = 'block text-[11px] font-semibold uppercase tracking-wide text-stone-500';
const campo =
  'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-anil-700 focus:outline-none';
const dica = 'mt-1 text-[11px] text-stone-500';

const separarNotas = (texto: string) => texto.split(/[\s,]+/).filter(Boolean);

/** Os tipos que este arquivo sabe editar. */
export type BlocoFuncional = Extract<
  LessonBlock,
  {
    kind:
      | 'PLAYER'
      | 'PIANO_ROLL'
      | 'TUNER_LAB'
      | 'TABELA'
      | 'CITACAO'
      | 'LINHA_DO_TEMPO'
      | 'SESSAO_DE_EXERCICIOS';
  }
>;

export const CamposFuncionais: React.FC<{
  bloco: BlocoFuncional;
  onChange: (b: LessonBlock) => void;
}> = ({ bloco, onChange }) => {
  switch (bloco.kind) {
    // -----------------------------------------------------------------------
    case 'PLAYER':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Descrição</span>
            <input
              value={bloco.description ?? ''}
              onChange={(e) => onChange({ ...bloco, description: e.target.value || undefined })}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>O que o player toca</span>
            <input
              value={bloco.notes.join(' ')}
              onChange={(e) => onChange({ ...bloco, notes: separarNotas(e.target.value) })}
              placeholder="C4 E4 G4"
              className={`${campo} font-mono`}
            />
            <span className={dica}>
              Notação científica. A forma de onda é <strong>derivada destas notas</strong> — não há
              arquivo de áudio para enviar.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={rotulo}>Como toca</span>
              <select
                value={bloco.playMode}
                onChange={(e) =>
                  onChange({ ...bloco, playMode: e.target.value as typeof bloco.playMode })
                }
                className={campo}
              >
                <option value="SEQUENCE">Uma após a outra</option>
                <option value="CHORD">Todas juntas</option>
              </select>
            </label>

            <label className="block">
              <span className={rotulo}>Andamento (bpm)</span>
              <input
                type="number"
                value={bloco.bpm ?? ''}
                onChange={(e) =>
                  onChange({ ...bloco, bpm: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="90"
                className={campo}
              />
            </label>
          </div>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={bloco.permiteMeiaVelocidade !== false}
              onChange={(e) => onChange({ ...bloco, permiteMeiaVelocidade: e.target.checked })}
              className="mt-0.5"
            />
            <span className="text-xs leading-relaxed text-stone-700">
              Oferecer meia velocidade — é o que torna audível a condução de vozes.
            </span>
          </label>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'PIANO_ROLL':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title ?? ''}
              onChange={(e) => onChange({ ...bloco, title: e.target.value || undefined })}
              className={campo}
            />
          </label>

          <fieldset>
            <legend className={rotulo}>Notas no tempo</legend>
            <p className={dica}>
              Nota, onde começa e quanto dura — em tempos. É o que torna visível o que a pauta
              esconde de quem ainda não lê: duração vira comprimento.
            </p>

            <ul className="mt-2 space-y-2">
              {bloco.notas.map((n, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    value={n.nota}
                    onChange={(e) => {
                      const notas = [...bloco.notas];
                      notas[i] = { ...n, nota: e.target.value };
                      onChange({ ...bloco, notas });
                    }}
                    aria-label={`Nota ${i + 1}`}
                    placeholder="C4"
                    className={`${campo} mt-0 w-20 font-mono`}
                  />
                  <input
                    type="number"
                    value={n.inicioEmTempos}
                    onChange={(e) => {
                      const notas = [...bloco.notas];
                      notas[i] = { ...n, inicioEmTempos: Number(e.target.value) };
                      onChange({ ...bloco, notas });
                    }}
                    aria-label={`Início da nota ${i + 1}`}
                    className={`${campo} mt-0 w-24`}
                  />
                  <input
                    type="number"
                    value={n.duracaoEmTempos}
                    onChange={(e) => {
                      const notas = [...bloco.notas];
                      notas[i] = { ...n, duracaoEmTempos: Number(e.target.value) };
                      onChange({ ...bloco, notas });
                    }}
                    aria-label={`Duração da nota ${i + 1}`}
                    className={`${campo} mt-0 w-24`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...bloco, notas: bloco.notas.filter((_, j) => j !== i) })
                    }
                    className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    Tirar
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...bloco,
                  notas: [
                    ...bloco.notas,
                    { nota: 'C4', inicioEmTempos: bloco.notas.length, duracaoEmTempos: 1 },
                  ],
                })
              }
              className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Acrescentar nota
            </button>
          </fieldset>

          <label className="block">
            <span className={rotulo}>Total de tempos</span>
            <input
              type="number"
              value={bloco.totalDeTempos ?? 16}
              onChange={(e) => onChange({ ...bloco, totalDeTempos: Number(e.target.value) })}
              className={campo}
            />
          </label>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'TUNER_LAB':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={rotulo}>Nota alvo</span>
              <input
                value={bloco.notaAlvo}
                onChange={(e) => onChange({ ...bloco, notaAlvo: e.target.value })}
                placeholder="A4"
                className={`${campo} font-mono`}
              />
            </label>

            <label className="block">
              <span className={rotulo}>Tolerância (cents)</span>
              <input
                type="number"
                min={1}
                value={bloco.toleranciaCents ?? 10}
                onChange={(e) => onChange({ ...bloco, toleranciaCents: Number(e.target.value) })}
                className={campo}
              />
              <span className={dica}>Ninguém canta exato — zero reprovaria todo mundo.</span>
            </label>
          </div>

          <label className="block">
            <span className={rotulo}>Instrução</span>
            <input
              value={bloco.prompt ?? ''}
              onChange={(e) => onChange({ ...bloco, prompt: e.target.value || undefined })}
              placeholder="Cante a nota lá."
              className={campo}
            />
          </label>

          <p className={dica}>
            Este bloco <strong>ouve pelo microfone</strong>. Sem permissão ele declara que não está
            medindo, em vez de mostrar um ponteiro parado no zero — que quem olha lê como afinado.
          </p>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'TABELA':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title ?? ''}
              onChange={(e) => onChange({ ...bloco, title: e.target.value || undefined })}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Colunas</span>
            <input
              value={bloco.colunas.join(' | ')}
              onChange={(e) => {
                const colunas = e.target.value.split('|').map((c) => c.trim());
                onChange({
                  ...bloco,
                  colunas,
                  /**
                   * As linhas acompanham o cabeçalho. Sem isto, tirar uma
                   * coluna deixaria células órfãs, e quem lê associaria o valor
                   * à coluna errada.
                   */
                  linhas: bloco.linhas.map((l) =>
                    Array.from({ length: colunas.length }, (_, i) => l[i] ?? '')
                  ),
                });
              }}
              placeholder="Modo | Terça | Sétima"
              className={campo}
            />
            <span className={dica}>Separe com barra vertical.</span>
          </label>

          <fieldset>
            <legend className={rotulo}>Linhas</legend>
            <ul className="mt-2 space-y-2">
              {bloco.linhas.map((linha, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    value={linha.join(' | ')}
                    onChange={(e) => {
                      const linhas = [...bloco.linhas];
                      const celulas = e.target.value.split('|').map((c) => c.trim());
                      linhas[i] = Array.from(
                        { length: bloco.colunas.length },
                        (_, j) => celulas[j] ?? ''
                      );
                      onChange({ ...bloco, linhas });
                    }}
                    aria-label={`Linha ${i + 1}`}
                    className={`${campo} mt-0`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...bloco, linhas: bloco.linhas.filter((_, j) => j !== i) })
                    }
                    className="shrink-0 rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    Tirar
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                onChange({ ...bloco, linhas: [...bloco.linhas, bloco.colunas.map(() => '')] })
              }
              className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Acrescentar linha
            </button>
          </fieldset>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'CITACAO':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Texto citado</span>
            <textarea
              value={bloco.texto}
              onChange={(e) => onChange({ ...bloco, texto: e.target.value })}
              rows={4}
              className={campo}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={rotulo}>Fonte</span>
              <input
                value={bloco.fonte}
                onChange={(e) => onChange({ ...bloco, fonte: e.target.value })}
                className={campo}
              />
            </label>

            <label className="block">
              <span className={rotulo}>Localização</span>
              <input
                value={bloco.localizacao ?? ''}
                onChange={(e) => onChange({ ...bloco, localizacao: e.target.value || undefined })}
                placeholder="1722, p. 14"
                className={campo}
              />
            </label>
          </div>

          <p className={dica}>
            A fonte é obrigatória — citação sem atribuição é plágio começando, e o acervo inteiro é
            construído sobre proveniência.
          </p>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'LINHA_DO_TEMPO':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>

          <fieldset>
            <legend className={rotulo}>Marcos</legend>
            <p className={dica}>
              A distância no desenho é a distância no tempo — dois séculos de silêncio entre dois
              marcos é o conteúdo, e não espaço em branco.
            </p>

            <ul className="mt-2 space-y-2">
              {bloco.marcos.map((m, i) => (
                <li key={i} className="rounded-lg border border-stone-200 p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={m.ano}
                      onChange={(e) => {
                        const marcos = [...bloco.marcos];
                        marcos[i] = { ...m, ano: Number(e.target.value) };
                        onChange({ ...bloco, marcos });
                      }}
                      aria-label={`Ano do marco ${i + 1}`}
                      className={`${campo} mt-0 w-24 font-mono`}
                    />
                    <input
                      value={m.titulo}
                      onChange={(e) => {
                        const marcos = [...bloco.marcos];
                        marcos[i] = { ...m, titulo: e.target.value };
                        onChange({ ...bloco, marcos });
                      }}
                      aria-label={`Título do marco ${i + 1}`}
                      placeholder="O que aconteceu"
                      className={`${campo} mt-0 min-w-0 flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...bloco, marcos: bloco.marcos.filter((_, j) => j !== i) })
                      }
                      aria-label={`Remover marco ${i + 1}`}
                      className="shrink-0 rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Tirar
                    </button>
                  </div>

                  <textarea
                    value={m.texto ?? ''}
                    onChange={(e) => {
                      const marcos = [...bloco.marcos];
                      marcos[i] = { ...m, texto: e.target.value || undefined };
                      onChange({ ...bloco, marcos });
                    }}
                    aria-label={`Texto do marco ${i + 1}`}
                    rows={2}
                    className={campo}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...bloco,
                  marcos: [...bloco.marcos, { ano: new Date().getFullYear(), titulo: '' }],
                })
              }
              className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Acrescentar marco
            </button>
          </fieldset>
        </div>
      );

    // -----------------------------------------------------------------------
    case 'SESSAO_DE_EXERCICIOS':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título da sessão</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Vidas</span>
            <input
              type="number"
              min={0}
              value={bloco.vidas ?? 0}
              onChange={(e) => onChange({ ...bloco, vidas: Number(e.target.value) })}
              className={campo}
            />
            <span className={dica}>
              Quantos erros a sessão tolera antes de encerrar. <strong>Zero desliga a regra</strong>{' '}
              — e desligar é legítimo: nem todo conteúdo pede tensão.
            </span>
          </label>

          <fieldset>
            <legend className={rotulo}>Questões</legend>

            <ul className="mt-2 space-y-3">
              {bloco.questoes.map((q, i) => (
                <li key={q.id} className="rounded-lg border border-stone-200 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-stone-400">
                      Questão {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...bloco, questoes: bloco.questoes.filter((_, j) => j !== i) })
                      }
                      aria-label={`Remover questão ${i + 1}`}
                      className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Tirar
                    </button>
                  </div>

                  <textarea
                    value={q.enunciado}
                    onChange={(e) => {
                      const questoes = [...bloco.questoes];
                      questoes[i] = { ...q, enunciado: e.target.value };
                      onChange({ ...bloco, questoes });
                    }}
                    aria-label={`Enunciado da questão ${i + 1}`}
                    placeholder="Que intervalo você ouviu?"
                    rows={2}
                    className={campo}
                  />

                  <label className="mt-2 block">
                    <span className={rotulo}>O que toca antes de responder</span>
                    <input
                      value={(q.notas ?? []).join(' ')}
                      onChange={(e) => {
                        const questoes = [...bloco.questoes];
                        const notas = separarNotas(e.target.value);
                        questoes[i] = { ...q, notas: notas.length ? notas : undefined };
                        onChange({ ...bloco, questoes });
                      }}
                      aria-label={`Notas da questão ${i + 1}`}
                      placeholder="C4 E4"
                      className={`${campo} font-mono`}
                    />
                    <span className={dica}>
                      Vazio é pergunta de leitura. Com notas, ela vira pergunta de ouvido.
                    </span>
                  </label>

                  <fieldset className="mt-2">
                    <legend className={rotulo}>Alternativas</legend>
                    <ul className="mt-1 space-y-1.5">
                      {q.alternativas.map((alt, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`certa-${q.id}`}
                            checked={q.corretaIndex === j}
                            onChange={() => {
                              const questoes = [...bloco.questoes];
                              questoes[i] = { ...q, corretaIndex: j };
                              onChange({ ...bloco, questoes });
                            }}
                            aria-label={`Marcar alternativa ${j + 1} da questão ${i + 1} como certa`}
                          />
                          <input
                            value={alt}
                            onChange={(e) => {
                              const questoes = [...bloco.questoes];
                              const alternativas = [...q.alternativas];
                              alternativas[j] = e.target.value;
                              questoes[i] = { ...q, alternativas };
                              onChange({ ...bloco, questoes });
                            }}
                            aria-label={`Alternativa ${j + 1} da questão ${i + 1}`}
                            className={`${campo} mt-0`}
                          />
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        const questoes = [...bloco.questoes];
                        questoes[i] = { ...q, alternativas: [...q.alternativas, ''] };
                        onChange({ ...bloco, questoes });
                      }}
                      className="mt-1.5 rounded-lg border border-stone-300 px-2.5 py-1 text-[11px] font-medium text-stone-700"
                    >
                      Acrescentar alternativa
                    </button>
                  </fieldset>

                  <label className="mt-2 block">
                    <span className={rotulo}>Explicação</span>
                    <textarea
                      value={q.explicacao}
                      onChange={(e) => {
                        const questoes = [...bloco.questoes];
                        questoes[i] = { ...q, explicacao: e.target.value };
                        onChange({ ...bloco, questoes });
                      }}
                      aria-label={`Explicação da questão ${i + 1}`}
                      rows={2}
                      className={campo}
                    />
                    <span className={dica}>Quem errou lê isto. Sem ela, a sessão só reprova.</span>
                  </label>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...bloco,
                  questoes: [
                    ...bloco.questoes,
                    {
                      id: `${bloco.id}_q${Date.now().toString(36)}`,
                      enunciado: '',
                      alternativas: ['', ''],
                      corretaIndex: 0,
                      explicacao: '',
                    },
                  ],
                })
              }
              className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Acrescentar questão
            </button>
          </fieldset>
        </div>
      );
  }
};
