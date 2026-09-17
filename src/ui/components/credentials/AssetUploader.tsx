import React, { useRef, useState } from 'react';
import { EspecificacaoImagem } from '../../../domain/credential-design';
import { Check, Upload, X, AlertTriangle } from 'lucide-react';

/**
 * Campo de envio de imagem guiado pela matriz.
 *
 * O ponto desta peça é que a pessoa não precise adivinhar tamanho nem
 * formato: a especificação está escrita no próprio campo, o arquivo é medido
 * ao ser escolhido, e o que estiver fora do esperado vira um aviso explícito
 * — não uma falha silenciosa descoberta depois, num certificado impresso.
 *
 * Avisos não bloqueiam. Uma logo 40px maior que o ideal é perfeitamente
 * utilizável, e transformar isso em erro faria a pessoa redimensionar
 * arquivos à toa. O que bloqueia é formato incompatível, porque aí o
 * navegador simplesmente não desenha.
 */

export interface AssetUploaderProps {
  spec: EspecificacaoImagem;
  valor?: string;
  onChange: (dataUrl: string | undefined) => void;
}

interface Medida {
  largura: number;
  altura: number;
}

async function medirImagem(dataUrl: string, mime: string): Promise<Medida | null> {
  // SVG escala sem perda: medir o arquivo não diz nada sobre a qualidade
  // final, então não se mede.
  if (mime === 'image/svg+xml') return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ largura: img.naturalWidth, altura: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ spec, valor, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const aoEscolher = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setErro(null);
    setAviso(null);

    if (!spec.formatos.includes(arquivo.type)) {
      setErro(
        `Formato ${arquivo.type || 'desconhecido'} não é aceito aqui. Use ${spec.formatos
          .map((f) => f.replace('image/', '').replace('svg+xml', 'svg').toUpperCase())
          .join(' ou ')}.`
      );
      evento.target.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result));
      leitor.onerror = () => reject(new Error('leitura falhou'));
      leitor.readAsDataURL(arquivo);
    }).catch(() => null);

    if (!dataUrl) {
      setErro('Não foi possível ler o arquivo.');
      return;
    }

    const medida = await medirImagem(dataUrl, arquivo.type);
    if (medida) {
      const razaoIdeal = spec.larguraIdeal / spec.alturaIdeal;
      const razaoReal = medida.largura / medida.altura;

      if (medida.largura < spec.larguraIdeal || medida.altura < spec.alturaIdeal) {
        setAviso(
          `A imagem tem ${medida.largura}×${medida.altura}, menor que os ${spec.larguraIdeal}×${spec.alturaIdeal} usados no desenho. Vai aparecer serrilhada na impressão.`
        );
      } else if (Math.abs(razaoReal - razaoIdeal) > 0.12) {
        setAviso(
          `A proporção (${razaoReal.toFixed(2)}:1) não é a esperada (${razaoIdeal.toFixed(2)}:1). A imagem será encaixada no espaço, podendo deixar folga nas laterais.`
        );
      } else if (medida.largura > spec.larguraIdeal * 4) {
        setAviso(
          `A imagem é muito maior que o necessário (${medida.largura}px para ${spec.larguraIdeal}px). Funciona, mas engorda cada documento emitido.`
        );
      }
    }

    onChange(dataUrl);
  };

  const rotulosFormato = spec.formatos
    .map((f) => f.replace('image/', '').replace('svg+xml', 'SVG').replace('jpeg', 'JPG').toUpperCase())
    .join(' · ');

  return (
    <div className="space-y-2 rounded-md border border-zinc-700 bg-zinc-800/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-100">
            {spec.rotulo}
            {spec.obrigatoria && <span className="ml-1 text-red-400">*</span>}
          </p>
          <p className="font-mono text-[10px] text-stone-400">
            {spec.larguraIdeal}×{spec.alturaIdeal} · {rotulosFormato}
          </p>
        </div>
        {valor && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-400">
            <Check className="h-3 w-3" /> enviada
          </span>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-stone-400">{spec.orientacao}</p>

      {valor ? (
        <div className="flex items-center gap-2">
          <div className="flex h-14 flex-1 items-center justify-center rounded border border-zinc-700 bg-[repeating-conic-gradient(#3f3f46_0%_25%,#27272a_0%_50%)] bg-[length:12px_12px] p-1">
            <img src={valor} alt={spec.rotulo} className="max-h-12 max-w-full object-contain" />
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setAviso(null);
              setErro(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="flex shrink-0 items-center gap-1 rounded border border-zinc-600 px-2 py-1 text-[11px] text-stone-300 transition-colors hover:bg-zinc-700"
          >
            <X className="h-3 w-3" /> Remover
          </button>
        </div>
      ) : (
        <p className="text-[11px] italic leading-relaxed text-stone-500">{spec.semImagem}</p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-zinc-600 px-2 py-2 text-[11px] text-stone-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700/50">
        <Upload className="h-3.5 w-3.5" />
        {valor ? 'Substituir imagem' : 'Escolher imagem'}
        <input
          ref={inputRef}
          type="file"
          accept={spec.formatos.join(',')}
          onChange={aoEscolher}
          className="sr-only"
        />
      </label>

      {erro && (
        <p role="alert" className="flex items-start gap-1.5 text-[11px] leading-relaxed text-red-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {erro}
        </p>
      )}
      {aviso && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-400">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          {aviso}
        </p>
      )}
    </div>
  );
};
