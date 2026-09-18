import React, { useState } from 'react';
import { SeletorDeEstrelas } from './Estrelas';
import { Estrelas as NotaEstrelas, podeAvaliar } from '../../../domain/reviews';

export interface FormularioDeAvaliacaoProps {
  id?: string;
  concluiuOCurso: boolean;
  jaAvaliou: boolean;
  /** Valores da avaliação existente, quando está reavaliando. */
  valorInicial?: { estrelas: NotaEstrelas; comentario: string; anonima: boolean };
  onEnviar: (dados: {
    estrelas: NotaEstrelas;
    comentario: string;
    anonima: boolean;
  }) => Promise<void>;
}

const MIN_COMENTARIO = 20;
const MAX_COMENTARIO = 1500;

/**
 * Formulário de avaliação de curso.
 *
 * Só abre para quem concluiu — a nota descreve a experiência inteira, e quem
 * parou no capítulo três não tem como julgá-la. Quem já avaliou pode reavaliar:
 * a opinião muda, e uma nota antiga presa para sempre seria pior que nenhuma.
 *
 * O comentário tem mínimo. Avaliação de uma palavra não informa ninguém, e
 * cinco estrelas sem texto não ajudam quem está decidindo se faz o curso.
 */
export const FormularioDeAvaliacao: React.FC<FormularioDeAvaliacaoProps> = ({
  id = 'form-avaliacao',
  concluiuOCurso,
  jaAvaliou,
  valorInicial,
  onEnviar,
}) => {
  const [estrelas, setEstrelas] = useState<NotaEstrelas | null>(valorInicial?.estrelas ?? null);
  const [comentario, setComentario] = useState(valorInicial?.comentario ?? '');
  const [anonima, setAnonima] = useState(valorInicial?.anonima ?? false);
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!concluiuOCurso) {
    return (
      <p id={id} className="text-sm leading-relaxed text-stone-600">
        A avaliação abre quando você concluir o curso. A nota descreve a experiência inteira, e
        por isso só quem chegou ao fim pode dá-la.
      </p>
    );
  }

  if (!aberto) {
    return (
      <div id={id}>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
        >
          {jaAvaliou ? 'Editar minha avaliação' : 'Avaliar este curso'}
        </button>
      </div>
    );
  }

  const faltam = MIN_COMENTARIO - comentario.trim().length;
  const valido = estrelas !== null && faltam <= 0 && comentario.trim().length <= MAX_COMENTARIO;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido || estrelas === null) return;

    setEnviando(true);
    setErro(null);
    try {
      await onEnviar({ estrelas, comentario: comentario.trim(), anonima });
      setAberto(false);
    } catch {
      setErro('Não foi possível salvar sua avaliação. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form id={id} onSubmit={enviar} className="space-y-4 rounded-xl bg-stone-50 p-5">
      <div>
        <p className="mb-2 text-sm font-medium text-stone-900">Que nota você dá a este curso?</p>
        <SeletorDeEstrelas
          id={`${id}-estrelas`}
          valor={estrelas}
          onChange={setEstrelas}
          disabled={enviando}
        />
      </div>

      <div>
        <label htmlFor={`${id}-texto`} className="mb-1.5 block text-sm font-medium text-stone-900">
          O que você diria a quem está pensando em fazer?
        </label>
        <textarea
          id={`${id}-texto`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          maxLength={MAX_COMENTARIO}
          disabled={enviando}
          aria-describedby={`${id}-ajuda`}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-anil-700 focus:ring-1 focus:ring-anil-700 disabled:opacity-60"
        />
        <p id={`${id}-ajuda`} className="mt-1 text-xs text-stone-500">
          {faltam > 0
            ? `Faltam ${faltam} caracteres.`
            : `${comentario.trim().length} de ${MAX_COMENTARIO} caracteres.`}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={anonima}
          onChange={(e) => setAnonima(e.target.checked)}
          disabled={enviando}
          className="h-4 w-4 rounded border-stone-300 text-anil-800 focus:ring-anil-700"
        />
        Publicar sem meu nome
      </label>

      {erro && (
        <p role="alert" className="text-sm text-red-700">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!valido || enviando}
          className="rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? 'Salvando…' : 'Publicar avaliação'}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          disabled={enviando}
          className="rounded-md px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          Cancelar
        </button>
      </div>

      {!podeAvaliar(concluiuOCurso, jaAvaliou) && jaAvaliou && (
        <p className="text-xs text-stone-500">
          Você já avaliou este curso. Publicar de novo substitui a avaliação anterior.
        </p>
      )}
    </form>
  );
};
