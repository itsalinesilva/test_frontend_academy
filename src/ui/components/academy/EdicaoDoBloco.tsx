import React, { useState } from 'react';
import { LessonBlock } from '../../../domain/academy';
import {
  EdicaoEditorial,
  AlvoDaEdicao,
  idDaEdicao,
  blocoEhTextual,
} from '../../../domain/edicao-editorial';
import { Pencil, RotateCcw, Check, X } from 'lucide-react';

interface EdicaoDoBlocoProps {
  licaoId: string;
  alvo: Extract<AlvoDaEdicao, { tipo: 'BLOCO' }>;
  bloco: LessonBlock;
  /** O bloco como o Conservatório publicou, para o botão de reverter. */
  publicado: LessonBlock;
  editado: boolean;
  editadaPor: string;
  onSalvar: (edicao: EdicaoEditorial) => Promise<void>;
  onReverter: (id: string) => Promise<void>;
  children: React.ReactNode;
}

/**
 * Correção de conteúdo no lugar onde o erro é visto.
 *
 * POR QUE AQUI, E NÃO NUMA TELA DE ADMINISTRAÇÃO À PARTE
 * ------------------------------------------------------
 * Quem revisa encontra o erro **lendo a lição**. Um editor separado obrigaria
 * a sair da leitura, achar o capítulo numa lista, achar o bloco dentro dele e
 * torcer para ser o mesmo — três oportunidades de corrigir o parágrafo
 * errado, e uma fricção que faz a correção não acontecer.
 *
 * Aqui o caminho é: ler, ver o erro, corrigir, continuar lendo.
 *
 * O CONTROLE SÓ EXISTE PARA ADMINISTRADOR
 * ---------------------------------------
 * Quem decide isso é a sessão assinada pelo servidor. O componente não julga
 * papel nem e-mail: recebe `children` já dentro de uma tela que só o monta
 * quando `ehAdmin` da sessão é verdadeiro.
 */
export const EdicaoDoBloco: React.FC<EdicaoDoBlocoProps> = ({
  licaoId,
  alvo,
  bloco,
  publicado,
  editado,
  editadaPor,
  onSalvar,
  onReverter,
  children,
}) => {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<LessonBlock>(bloco);
  const [motivo, setMotivo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const id = idDaEdicao(licaoId, alvo);
  const editavel = blocoEhTextual(bloco);

  const abrir = () => {
    setRascunho(bloco);
    setMotivo('');
    setErro(null);
    setEditando(true);
  };

  const confirmar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({
        id,
        licaoId,
        alvo,
        conteudo: rascunho,
        anterior: publicado,
        editadaPor,
        editadaEm: new Date().toISOString(),
        motivo: motivo.trim() || undefined,
      });
      setEditando(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a correção.');
    } finally {
      setSalvando(false);
    }
  };

  if (!editando) {
    return (
      <div className="group relative">
        {children}

        <div className="absolute -top-2 right-0 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {editado && (
            <>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] text-amber-900">
                editado
              </span>
              <button
                type="button"
                onClick={() => onReverter(id)}
                aria-label="Voltar ao texto publicado"
                title="Voltar ao texto publicado"
                className="rounded border border-stone-300 bg-white p-1 text-stone-500 hover:text-stone-900"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}
          {editavel && (
            <button
              type="button"
              onClick={abrir}
              aria-label="Corrigir este trecho"
              title="Corrigir este trecho"
              className="rounded border border-stone-300 bg-white p-1 text-stone-500 hover:text-anil-800"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-anil-300 bg-anil-50/40 p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-anil-900">
        Corrigindo — {rotuloDoTipo(bloco.kind)}
      </p>

      {erro && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {erro}
        </p>
      )}

      <CamposDoBloco bloco={rascunho} aoMudar={setRascunho} idBase={id} />

      <div className="space-y-1">
        <label htmlFor={`${id}-motivo`} className="block text-xs text-stone-600">
          Motivo da correção (opcional, aparece no histórico)
        </label>
        <input
          id={`${id}-motivo`}
          type="text"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex.: concordância verbal no segundo período"
          className="w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-xs"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancelar
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={salvando}
          className="inline-flex items-center gap-1 rounded bg-anil-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-anil-700 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {salvando ? 'Salvando…' : 'Salvar correção'}
        </button>
      </div>
    </div>
  );
};

function rotuloDoTipo(kind: LessonBlock['kind']): string {
  const nomes: Partial<Record<LessonBlock['kind'], string>> = {
    MARKDOWN: 'parágrafo',
    CALLOUT: 'destaque',
    CHECKPOINT: 'verificação de leitura',
    SLIDES: 'sequência de lâminas',
  };
  return nomes[kind] ?? kind.toLowerCase();
}

/**
 * Os campos de cada tipo de bloco.
 *
 * Um `CHECKPOINT` não é uma caixa de texto: tem pergunta, alternativas,
 * resposta certa e explicação. Editá-lo como texto corrido deixaria a
 * explicação contradizendo a pergunta sem que ninguém percebesse — e o aluno
 * descobre isso respondendo errado uma questão que estava certa.
 */
const CamposDoBloco: React.FC<{
  bloco: LessonBlock;
  aoMudar: (b: LessonBlock) => void;
  idBase: string;
}> = ({ bloco, aoMudar, idBase }) => {
  const areaClasse =
    'w-full rounded border border-stone-300 bg-white px-2 py-1.5 font-serif text-sm leading-relaxed text-stone-900';

  if (bloco.kind === 'MARKDOWN') {
    return (
      <div className="space-y-1">
        <label htmlFor={`${idBase}-md`} className="block text-xs text-stone-600">
          Texto (markdown)
        </label>
        <textarea
          id={`${idBase}-md`}
          rows={Math.min(24, Math.max(6, bloco.markdown.split('\n').length + 2))}
          value={bloco.markdown}
          onChange={(e) => aoMudar({ ...bloco, markdown: e.target.value })}
          className={areaClasse}
        />
      </div>
    );
  }

  if (bloco.kind === 'CALLOUT') {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-titulo`} className="block text-xs text-stone-600">
            Título do destaque
          </label>
          <input
            id={`${idBase}-titulo`}
            type="text"
            value={bloco.title}
            onChange={(e) => aoMudar({ ...bloco, title: e.target.value })}
            className={areaClasse}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idBase}-texto`} className="block text-xs text-stone-600">
            Texto do destaque
          </label>
          <textarea
            id={`${idBase}-texto`}
            rows={4}
            value={bloco.text}
            onChange={(e) => aoMudar({ ...bloco, text: e.target.value })}
            className={areaClasse}
          />
        </div>
      </div>
    );
  }

  if (bloco.kind === 'CHECKPOINT') {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-pergunta`} className="block text-xs text-stone-600">
            Pergunta
          </label>
          <textarea
            id={`${idBase}-pergunta`}
            rows={2}
            value={bloco.question}
            onChange={(e) => aoMudar({ ...bloco, question: e.target.value })}
            className={areaClasse}
          />
        </div>

        <fieldset className="space-y-1">
          <legend className="text-xs text-stone-600">
            Alternativas — marque a correta
          </legend>
          {bloco.options.map((opcao, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`${idBase}-correta`}
                checked={bloco.correctIndex === i}
                onChange={() => aoMudar({ ...bloco, correctIndex: i })}
                aria-label={`Marcar a alternativa ${i + 1} como correta`}
                className="accent-anil-800"
              />
              <input
                type="text"
                value={opcao}
                aria-label={`Texto da alternativa ${i + 1}`}
                onChange={(e) => {
                  const opcoes = [...bloco.options];
                  opcoes[i] = e.target.value;
                  aoMudar({ ...bloco, options: opcoes });
                }}
                className="flex-1 rounded border border-stone-300 px-2 py-1 text-xs"
              />
            </div>
          ))}
        </fieldset>

        <div className="space-y-1">
          <label htmlFor={`${idBase}-explicacao`} className="block text-xs text-stone-600">
            Explicação — o aluno lê depois de responder
          </label>
          <textarea
            id={`${idBase}-explicacao`}
            rows={3}
            value={bloco.explanation}
            onChange={(e) => aoMudar({ ...bloco, explanation: e.target.value })}
            className={areaClasse}
          />
        </div>
      </div>
    );
  }

  if (bloco.kind === 'SLIDES') {
    return (
      <div className="space-y-3">
        {bloco.slides.map((lamina, i) => (
          <div key={i} className="space-y-1 rounded border border-stone-200 bg-white p-2">
            <label htmlFor={`${idBase}-lam-${i}-h`} className="block text-xs text-stone-600">
              Lâmina {i + 1} — título
            </label>
            <input
              id={`${idBase}-lam-${i}-h`}
              type="text"
              value={lamina.heading}
              onChange={(e) => {
                const slides = [...bloco.slides];
                slides[i] = { ...lamina, heading: e.target.value };
                aoMudar({ ...bloco, slides });
              }}
              className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
            />
            <label htmlFor={`${idBase}-lam-${i}-b`} className="block text-xs text-stone-600">
              Lâmina {i + 1} — texto
            </label>
            <textarea
              id={`${idBase}-lam-${i}-b`}
              rows={3}
              value={lamina.body}
              onChange={(e) => {
                const slides = [...bloco.slides];
                slides[i] = { ...lamina, body: e.target.value };
                aoMudar({ ...bloco, slides });
              }}
              className="w-full rounded border border-stone-300 px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-xs text-stone-600">
      Este bloco é gerado a partir de notas musicais e não se edita como texto.
    </p>
  );
};
