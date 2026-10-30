import React, { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { contaNoDrive, EstadoDaConta } from '../../../services/application/conta-no-drive.service';

/**
 * O pedido para conectar o Drive (ADR-001.A).
 *
 * A conta vive no Google Drive da pessoa, e o Google só abre a janela de
 * consentimento com um clique dela. Enquanto esse clique não acontece, os
 * dados ficam só neste navegador — e a pessoa precisa saber disso, e poder
 * escolher ficar assim (o caso do celular).
 */
export const AvisoDaConta: React.FC<{ logado: boolean }> = ({ logado }) => {
  const [estado, setEstado] = useState<EstadoDaConta>(contaNoDrive.atual);
  const [conectando, setConectando] = useState(false);
  useEffect(() => contaNoDrive.ouvir(setEstado), []);

  if (!logado || estado.onde !== 'drive' || estado.conectado) return null;

  return (
    <aside
      role="region"
      aria-label="Onde sua conta fica guardada"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-stone-800 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2">
        <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
        <span>
          Sua conta fica guardada no seu Google Drive, numa pasta privada que só a plataforma usa. Enquanto você não
          conectar, o que fizer aqui fica só neste navegador.
          {estado.erro && <strong className="block text-red-800">{estado.erro}</strong>}
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={conectando}
          onClick={() => {
            setConectando(true);
            void contaNoDrive.conectar(true).finally(() => setConectando(false));
          }}
          className="rounded-md bg-anil-800 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
        >
          {conectando ? 'Conectando…' : 'Conectar ao Google Drive'}
        </button>
        <button
          type="button"
          onClick={() => contaNoDrive.escolher('aparelho')}
          className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-stone-700"
        >
          Guardar só neste aparelho
        </button>
      </div>
    </aside>
  );
};
