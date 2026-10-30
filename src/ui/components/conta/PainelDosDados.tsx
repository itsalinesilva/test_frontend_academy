import React, { useEffect, useRef, useState } from 'react';
import { contaNoDrive, EstadoDaConta } from '../../../services/application/conta-no-drive.service';

const quando = (iso?: string) => (iso ? new Date(iso).toLocaleString('pt-BR') : 'nunca');

/**
 * Onde a conta fica guardada, e o que dá para fazer com ela (ADR-001.A).
 *
 * Os dois modos são escolha da pessoa: o Google Drive dela (padrão, e o que
 * sobrevive a trocar de aparelho) ou só este aparelho (o caso do celular).
 * Nos dois, a conta pode sair como arquivo e voltar de um arquivo.
 */
export const PainelDosDados: React.FC = () => {
  const [estado, setEstado] = useState<EstadoDaConta>(contaNoDrive.atual);
  const [recado, setRecado] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);
  useEffect(() => contaNoDrive.ouvir(setEstado), []);

  const tentar = async (f: () => Promise<void>, sucesso: string) => {
    setOcupado(true);
    setRecado(null);
    try {
      await f();
      setRecado({ tom: 'ok', texto: sucesso });
    } catch (e) {
      setRecado({ tom: 'erro', texto: (e as Error).message });
    } finally {
      setOcupado(false);
    }
  };

  const baixar = () => {
    try {
      const texto = contaNoDrive.exportar();
      const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `muscicapa-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setRecado({ tom: 'erro', texto: (e as Error).message });
    }
  };

  const restaurar = async (f: File) => {
    const r = contaNoDrive.importar(await f.text());
    setRecado(r.ok ? { tom: 'ok', texto: 'Dados restaurados. Recarregue a página para ver tudo.' } : { tom: 'erro', texto: r.motivo });
  };

  return (
    <div className="space-y-4 text-xs">
      <fieldset className="space-y-2">
        <legend className="font-semibold text-stone-900">Onde sua conta fica guardada</legend>
        <label className="flex items-start gap-2 rounded border border-stone-200 p-2.5">
          <input
            type="radio"
            name="onde-guardar"
            checked={estado.onde === 'drive'}
            onChange={() => contaNoDrive.escolher('drive')}
            className="mt-0.5 accent-anil-800"
          />
          <span>
            <span className="block font-semibold text-stone-900">No meu Google Drive</span>
            <span className="text-stone-600">
              Numa pasta privada que só a plataforma usa — você não a vê no Drive, e nenhum outro app a lê. Entrando
              em outro aparelho, sua conta volta inteira.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 rounded border border-stone-200 p-2.5">
          <input
            type="radio"
            name="onde-guardar"
            checked={estado.onde === 'aparelho'}
            onChange={() => contaNoDrive.escolher('aparelho')}
            className="mt-0.5 accent-anil-800"
          />
          <span>
            <span className="block font-semibold text-stone-900">Só neste aparelho</span>
            <span className="text-stone-600">
              Nada sai do navegador. Limpar os dados do navegador ou trocar de aparelho apaga a conta — baixe uma cópia
              de vez em quando.
            </span>
          </span>
        </label>
      </fieldset>

      {estado.onde === 'drive' && (
        <div className="space-y-2 rounded border border-stone-200 p-2.5">
          <p className="text-stone-700">
            {estado.conectado ? 'Conectado ao seu Google Drive.' : 'Ainda não conectado ao Google Drive nesta sessão.'}{' '}
            Última gravação: {quando(estado.ultimaGravacao)}.
            {estado.pendente && ' Há mudanças esperando para ir ao Drive.'}
          </p>
          {estado.erro && <p className="text-red-800">{estado.erro}</p>}
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              void tentar(
                () => (estado.conectado ? contaNoDrive.gravarAgora() : contaNoDrive.conectar(true)),
                'Sua conta está no seu Google Drive.'
              )
            }
            className="rounded-md bg-anil-800 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
          >
            {estado.conectado ? 'Gravar agora no Drive' : 'Conectar ao Google Drive'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={baixar} className="rounded-md border border-stone-300 bg-white px-3 py-1.5">
          Baixar minha conta (arquivo)
        </button>
        <button
          type="button"
          onClick={() => arquivo.current?.click()}
          className="rounded-md border border-stone-300 bg-white px-3 py-1.5"
        >
          Restaurar de um arquivo
        </button>
        <input
          ref={arquivo}
          type="file"
          accept="application/json,.json"
          aria-label="Arquivo da conta para restaurar"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void restaurar(f);
            e.target.value = '';
          }}
        />
      </div>

      {recado && (
        <p role={recado.tom === 'erro' ? 'alert' : 'status'} className={recado.tom === 'erro' ? 'text-red-800' : 'text-emerald-800'}>
          {recado.texto}
        </p>
      )}
    </div>
  );
};
