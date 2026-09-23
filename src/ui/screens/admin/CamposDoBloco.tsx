import React from 'react';
import { LessonBlock } from '../../../domain/academy';
import { CamposFuncionais } from './CamposFuncionais';

/**
 * OS CAMPOS DE CADA TIPO DE BLOCO.
 *
 * 🔴 UM EDITOR POR TIPO, E NÃO UM CAMPO DE JSON
 * ---------------------------------------------
 * Seria muito mais curto oferecer uma caixa de texto com o JSON do bloco. E
 * seria inutilizável: quem revisa conteúdo musical não deve precisar saber que
 * `clef` aceita três valores, nem descobrir por tentativa que a nota se
 * escreve `C4` e não `dó`.
 *
 * Um editor que exige conhecer a forma interna do dado não é um editor: é o
 * arquivo com outra roupa.
 *
 * O QUE CADA CAMPO GARANTE
 * ------------------------
 * Os campos fechados — clave, modo, tipo de diagrama — são `select`, e por
 * isso não aceitam valor inválido. Os abertos são conferidos por
 * `problemasDoBloco` na gravação, que é onde a recusa tem efeito.
 *
 * A DICA DE FORMATO FICA JUNTO DO CAMPO
 * -------------------------------------
 * "C4 E4 G4" embaixo da caixa de notas evita a maior parte das recusas antes
 * de elas acontecerem. Mensagem de erro é o último recurso, não o primeiro.
 */

const rotulo = 'block text-[11px] font-semibold uppercase tracking-wide text-stone-500';
const campo =
  'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-anil-700 focus:outline-none';
const dica = 'mt-1 text-[11px] text-stone-500';

/** Notas como texto separado por espaço — é como quem escreve música digita. */
const paraTexto = (notas: readonly string[] | undefined) => (notas ?? []).join(' ');
const paraNotas = (texto: string) => texto.split(/[\s,]+/).filter(Boolean);

export const CamposDoBloco: React.FC<{
  bloco: LessonBlock;
  onChange: (b: LessonBlock) => void;
}> = ({ bloco, onChange }) => {
  switch (bloco.kind) {
    // -----------------------------------------------------------------------
    // Texto
    // -----------------------------------------------------------------------
    case 'MARKDOWN':
      return (
        <label className="block">
          <span className={rotulo}>Texto (.md)</span>
          <textarea
            value={bloco.markdown}
            onChange={(e) => onChange({ ...bloco, markdown: e.target.value })}
            rows={10}
            className={`${campo} font-mono`}
          />
          <span className={dica}>
            Markdown: <code>**negrito**</code>, <code>*itálico*</code>, <code>## título</code>,
            <code> - lista</code>.
          </span>
        </label>
      );

    case 'CALLOUT':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Natureza</span>
            <select
              value={bloco.type}
              onChange={(e) =>
                onChange({ ...bloco, type: e.target.value as typeof bloco.type })
              }
              className={campo}
            >
              <option value="info">Informação</option>
              <option value="historical">Nota histórica</option>
              <option value="warning">Atenção</option>
              <option value="tip">Dica</option>
            </select>
          </label>
          <label className="block">
            <span className={rotulo}>Título</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>
          <label className="block">
            <span className={rotulo}>Texto</span>
            <textarea
              value={bloco.text}
              onChange={(e) => onChange({ ...bloco, text: e.target.value })}
              rows={4}
              className={campo}
            />
          </label>
        </div>
      );

    case 'CHECKPOINT':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Pergunta</span>
            <textarea
              value={bloco.question}
              onChange={(e) => onChange({ ...bloco, question: e.target.value })}
              rows={2}
              className={campo}
            />
          </label>

          <fieldset>
            <legend className={rotulo}>Alternativas</legend>
            <p className={dica}>A marcada é a certa. Uma só.</p>
            <ul className="mt-2 space-y-2">
              {bloco.options.map((op, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`certa-${bloco.id}`}
                    checked={bloco.correctIndex === i}
                    onChange={() => onChange({ ...bloco, correctIndex: i })}
                    aria-label={`Marcar alternativa ${i + 1} como certa`}
                  />
                  <input
                    value={op}
                    onChange={(e) => {
                      const options = [...bloco.options];
                      options[i] = e.target.value;
                      onChange({ ...bloco, options });
                    }}
                    aria-label={`Alternativa ${i + 1}`}
                    className={`${campo} mt-0`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const options = bloco.options.filter((_, j) => j !== i);
                      onChange({
                        ...bloco,
                        options,
                        /** A resposta certa acompanha a remoção, senão apontaria para outra. */
                        correctIndex: Math.max(
                          0,
                          bloco.correctIndex > i ? bloco.correctIndex - 1 : bloco.correctIndex
                        ),
                      });
                    }}
                    className="shrink-0 rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    Tirar
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onChange({ ...bloco, options: [...bloco.options, ''] })}
              className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Acrescentar alternativa
            </button>
          </fieldset>

          <label className="block">
            <span className={rotulo}>Explicação</span>
            <textarea
              value={bloco.explanation}
              onChange={(e) => onChange({ ...bloco, explanation: e.target.value })}
              rows={3}
              className={campo}
            />
            <span className={dica}>
              É a parte que ensina — quem errou lê isto. Sem ela a verificação só reprova.
            </span>
          </label>
        </div>
      );

    case 'SLIDES':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Título da sequência</span>
            <input
              value={bloco.title}
              onChange={(e) => onChange({ ...bloco, title: e.target.value })}
              className={campo}
            />
          </label>

          <ul className="space-y-3">
            {bloco.slides.map((l, i) => (
              <li key={i} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-stone-400">
                    Lâmina {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...bloco, slides: bloco.slides.filter((_, j) => j !== i) })
                    }
                    className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    Tirar
                  </button>
                </div>
                <input
                  value={l.heading}
                  onChange={(e) => {
                    const slides = [...bloco.slides];
                    slides[i] = { ...l, heading: e.target.value };
                    onChange({ ...bloco, slides });
                  }}
                  aria-label={`Título da lâmina ${i + 1}`}
                  placeholder="Título"
                  className={campo}
                />
                <textarea
                  value={l.body}
                  onChange={(e) => {
                    const slides = [...bloco.slides];
                    slides[i] = { ...l, body: e.target.value };
                    onChange({ ...bloco, slides });
                  }}
                  aria-label={`Corpo da lâmina ${i + 1}`}
                  placeholder="Corpo"
                  rows={3}
                  className={campo}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() =>
              onChange({ ...bloco, slides: [...bloco.slides, { heading: '', body: '' }] })
            }
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700"
          >
            Acrescentar lâmina
          </button>
        </div>
      );

    // -----------------------------------------------------------------------
    // Música
    // -----------------------------------------------------------------------
    case 'STAFF':
      return (
        <div className="space-y-3">
          <label className="block">
            <span className={rotulo}>Clave</span>
            <select
              value={bloco.clef}
              onChange={(e) => onChange({ ...bloco, clef: e.target.value as typeof bloco.clef })}
              className={campo}
            >
              <option value="treble">Sol</option>
              <option value="bass">Fá</option>
              <option value="alto">Dó</option>
            </select>
          </label>

          <NotasDoBloco
            valor={bloco.notes}
            titulo="Notas na pauta"
            onChange={(notes) => onChange({ ...bloco, notes })}
          />

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={bloco.simultaneas ?? false}
              onChange={(e) => onChange({ ...bloco, simultaneas: e.target.checked || undefined })}
            />
            Notas simultâneas (acorde, empilhado na pauta)
          </label>

          <label className="block">
            <span className={rotulo}>Fórmula de compasso</span>
            <input
              value={bloco.timeSignature ?? ''}
              onChange={(e) => onChange({ ...bloco, timeSignature: e.target.value || undefined })}
              placeholder="4/4"
              className={campo}
            />
          </label>

          <label className="block">
            <span className={rotulo}>Legenda</span>
            <input
              value={bloco.caption ?? ''}
              onChange={(e) => onChange({ ...bloco, caption: e.target.value || undefined })}
              className={campo}
            />
          </label>
        </div>
      );

    case 'KEYBOARD':
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

          <NotasDoBloco
            valor={bloco.highlightNotes ?? []}
            titulo="Teclas em destaque"
            onChange={(highlightNotes) => onChange({ ...bloco, highlightNotes })}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={rotulo}>Oitava inicial</span>
              <input
                type="number"
                value={bloco.startOctave ?? 4}
                onChange={(e) => onChange({ ...bloco, startOctave: Number(e.target.value) })}
                className={campo}
              />
            </label>
            <label className="block">
              <span className={rotulo}>Quantas oitavas</span>
              <input
                type="number"
                min={1}
                max={4}
                value={bloco.octaves ?? 2}
                onChange={(e) => onChange({ ...bloco, octaves: Number(e.target.value) })}
                className={campo}
              />
            </label>
          </div>
        </div>
      );

    case 'AUDIO_EXAMPLE':
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

          <NotasDoBloco
            valor={bloco.notes}
            titulo="O que o player toca"
            onChange={(notes) => onChange({ ...bloco, notes })}
          />

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
        </div>
      );

    case 'INTERVAL_LAB':
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
              <span className={rotulo}>Nota grave</span>
              <input
                value={bloco.lowerNote}
                onChange={(e) => onChange({ ...bloco, lowerNote: e.target.value })}
                className={`${campo} font-mono`}
              />
            </label>
            <label className="block">
              <span className={rotulo}>Nota aguda</span>
              <input
                value={bloco.upperNote}
                onChange={(e) => onChange({ ...bloco, upperNote: e.target.value })}
                className={`${campo} font-mono`}
              />
            </label>
          </div>
          <span className={dica}>Notação científica: C4 é o dó central.</span>
        </div>
      );

    case 'CHORD_LAB':
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
          <NotasDoBloco
            valor={bloco.notes}
            titulo="Notas do acorde"
            onChange={(notes) => onChange({ ...bloco, notes })}
          />
        </div>
      );

    case 'SCALE_LAB':
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
              <span className={rotulo}>Tônica</span>
              <input
                value={bloco.tonic}
                onChange={(e) => onChange({ ...bloco, tonic: e.target.value })}
                className={`${campo} font-mono`}
              />
            </label>
            <label className="block">
              <span className={rotulo}>Modo</span>
              <select
                value={bloco.mode}
                onChange={(e) => onChange({ ...bloco, mode: e.target.value as typeof bloco.mode })}
                className={campo}
              >
                <option value="MAJOR">Maior</option>
                <option value="NATURAL_MINOR">Menor natural</option>
                <option value="HARMONIC_MINOR">Menor harmônica</option>
              </select>
            </label>
          </div>
        </div>
      );

    case 'DIAGRAM':
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
            <span className={rotulo}>Qual diagrama</span>
            <select
              value={bloco.diagram}
              onChange={(e) =>
                onChange({ ...bloco, diagram: e.target.value as typeof bloco.diagram })
              }
              className={campo}
            >
              <option value="CIRCLE_OF_FIFTHS">Ciclo das quintas</option>
              <option value="TONE_SEMITONE">Tom e semitom</option>
              <option value="INTERVAL_RULER">Régua de intervalos</option>
            </select>
            <span className={dica}>
              São desenhados por código, e por isso não há imagem para enviar.
            </span>
          </label>
          <label className="block">
            <span className={rotulo}>Legenda</span>
            <input
              value={bloco.caption ?? ''}
              onChange={(e) => onChange({ ...bloco, caption: e.target.value || undefined })}
              className={campo}
            />
          </label>
        </div>
      );

    /**
     * A biblioteca funcional tem editor proprio, em `CamposFuncionais`.
     * Sete tipos a mais aqui dentro fariam um arquivo onde se procura um campo
     * e nao se acha — o mesmo problema de um formulario de setenta campos.
     */
    case 'PLAYER':
    case 'PIANO_ROLL':
    case 'TUNER_LAB':
    case 'TABELA':
    case 'CITACAO':
    case 'LINHA_DO_TEMPO':
    case 'SESSAO_DE_EXERCICIOS':
      return <CamposFuncionais bloco={bloco} onChange={onChange} />;

    case 'VIDEO_PLACEHOLDER':
      /**
       * Declarado, e sem campo.
       *
       * A plataforma não hospeda vídeo (ADR-004): a mídia vive no Drive do
       * autor. Um campo aqui produziria um lugar para colar um endereço que
       * nada leria.
       */
      return (
        <p className="rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">
          Este bloco registra onde a aula gravada entrará. A plataforma ainda não hospeda vídeo, e
          por isso ele não tem o que editar — só existir ou ser removido.
        </p>
      );
  }
};

/**
 * O campo de notas, com a dica de formato colada nele.
 *
 * Existe separado porque aparece em seis tipos de bloco, e porque a dica é a
 * parte que evita a recusa: "dó" em vez de "C4" é o erro mais previsível de
 * quem revisa conteúdo em português.
 */
const NotasDoBloco: React.FC<{
  valor: readonly string[];
  titulo: string;
  onChange: (notas: string[]) => void;
}> = ({ valor, titulo, onChange }) => (
  <label className="block">
    <span className={rotulo}>{titulo}</span>
    <input
      value={paraTexto(valor)}
      onChange={(e) => onChange(paraNotas(e.target.value))}
      placeholder="C4 E4 G4"
      className={`${campo} font-mono`}
    />
    <span className={dica}>
      Notação científica, separada por espaço. <strong>C4</strong> é o dó central; use{' '}
      <strong>#</strong> para sustenido e <strong>b</strong> para bemol — <code>F#4</code>,{' '}
      <code>Bb3</code>.
    </span>
  </label>
);
