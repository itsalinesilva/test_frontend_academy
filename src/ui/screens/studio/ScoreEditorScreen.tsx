import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Staff } from '../../components/domain/Staff';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { cadernoRepository } from '../../../repositories/caderno.repository';
import {
  FORMULAS,
  Figura,
  Formula,
  NOME_DA_FIGURA,
  NotaDoCaderno,
  PartituraDoCaderno,
  compassosQueTransbordam,
  nomeDeArquivo,
  paraMIDI,
  paraMusicXML,
  problemasDaPartitura,
  roteiroDeSom,
} from '../../../domain/caderno';
import { ArrowLeft, Download, Play, Save, Square, Undo2, Trash2 } from 'lucide-react';

/**
 * O EDITOR DE PARTITURAS DO ESTÚDIO — escrever, tocar, guardar, levar (M-10).
 *
 * Era fachada: um "Estudo Contrapontístico a Quatro Vozes" que ninguém
 * escreveu, notas desenhadas todas na mesma altura, e armadura e fórmula que
 * só trocavam o rótulo. Agora o que está na pauta é o que a pessoa escreveu,
 * e cada controle muda o que se vê, o que se ouve ou o que se baixa.
 *
 * `/studio/score?id=<id>` reabre uma partitura do caderno.
 */

const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const NOME: Record<string, string> = { C: 'dó', D: 'ré', E: 'mi', F: 'fá', G: 'sol', A: 'lá', B: 'si' };
const FIGURAS: Figura[] = ['whole', 'half', 'quarter', 'eighth'];

const novaId = () => `part_${Date.now().toString(36)}`;

function baixar(conteudo: BlobPart, tipo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export const ScoreEditorScreen: React.FC = () => {
  const { navigate, query } = useRouter();
  const { userId } = useCurrentUser();
  const idPedido = query.get('id');

  const [id, setId] = useState(() => idPedido ?? novaId());
  const [criadaEm, setCriadaEm] = useState(() => new Date().toISOString());
  const [titulo, setTitulo] = useState('');
  const [clave, setClave] = useState<'treble' | 'bass'>('treble');
  const [formula, setFormula] = useState<Formula>('4/4');
  const [andamento, setAndamento] = useState(80);
  const [notas, setNotas] = useState<NotaDoCaderno[]>([]);

  const [acidente, setAcidente] = useState<'' | '#' | 'b'>('');
  const [oitava, setOitava] = useState(4);
  const [figura, setFigura] = useState<Figura>('quarter');
  const [recado, setRecado] = useState<{ tom: 'ok' | 'erro'; texto: string } | null>(null);
  const [tocando, setTocando] = useState(false);
  const relogios = useRef<number[]>([]);

  /** Reabrir: a partitura vem do caderno, e é da pessoa — a de outra não abre. */
  useEffect(() => {
    if (!idPedido) return;
    let vivo = true;
    cadernoRepository.buscar(idPedido).then((p) => {
      if (!vivo) return;
      if (!p || (userId && p.autorId !== userId)) {
        setRecado({ tom: 'erro', texto: 'Esta partitura não está no seu caderno.' });
        return;
      }
      setId(p.id);
      setCriadaEm(p.criadaEm);
      setTitulo(p.titulo);
      setClave(p.clave);
      setFormula(p.formula);
      setAndamento(p.andamento);
      setNotas(p.notas);
    });
    return () => {
      vivo = false;
    };
  }, [idPedido, userId]);

  useEffect(() => () => relogios.current.forEach((r) => window.clearTimeout(r)), []);

  const partitura: PartituraDoCaderno = {
    id,
    autorId: userId ?? '',
    titulo,
    clave,
    formula,
    andamento,
    notas,
    criadaEm,
    atualizadaEm: criadaEm,
  };

  const transbordam = useMemo(() => compassosQueTransbordam(notas, formula), [notas, formula]);

  const escrever = (nota: string | null) => {
    setRecado(null);
    setNotas((n) => [...n, { nota, figura }]);
  };

  const parar = () => {
    relogios.current.forEach((r) => window.clearTimeout(r));
    relogios.current = [];
    setTocando(false);
  };

  /** Toca nota a nota, cada uma pelo tempo da SUA figura, no andamento escolhido. */
  const tocar = () => {
    if (tocando) return parar();
    let t = 0;
    setTocando(true);
    for (const { hz, segundos } of roteiroDeSom(partitura)) {
      const inicio = t;
      if (hz > 0) {
        relogios.current.push(window.setTimeout(() => webAudioSynth.playTone(hz, segundos * 0.95), inicio * 1000));
      }
      t += segundos;
    }
    relogios.current.push(window.setTimeout(() => setTocando(false), t * 1000));
  };

  const salvar = async () => {
    if (!userId) return;
    const problemas = problemasDaPartitura(partitura);
    if (problemas.length) {
      setRecado({ tom: 'erro', texto: problemas.join(' ') });
      return;
    }
    await cadernoRepository.salvar(partitura);
    setRecado({ tom: 'ok', texto: 'Guardada no seu caderno.' });
  };

  const exportar = (tipo: 'xml' | 'mid') => {
    const problemas = problemasDaPartitura({ ...partitura, titulo: titulo || 'partitura' });
    if (problemas.length) {
      setRecado({ tom: 'erro', texto: problemas.join(' ') });
      return;
    }
    const nome = nomeDeArquivo(titulo);
    if (tipo === 'xml') baixar(paraMusicXML(partitura), 'application/vnd.recordare.musicxml+xml', `${nome}.musicxml`);
    else baixar(paraMIDI(partitura), 'audio/midi', `${nome}.mid`);
  };

  const notasDaPauta = notas.map((n, i) => {
    if (!n.nota) return { id: `n${i}`, step: 'C' as const, octave: 4, duration: n.figura, pausa: true };
    const m = /^([A-G])([#b]?)(\d)$/.exec(n.nota)!;
    return {
      id: `n${i}`,
      step: m[1] as (typeof LETRAS)[number],
      octave: Number(m[3]),
      duration: n.figura,
      accidental: m[2] === '#' ? ('sharp' as const) : m[2] === 'b' ? ('flat' as const) : undefined,
    };
  });

  const campo = 'rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs';

  return (
    <ScreenContainer
      id="score-editor"
      title="Editor de Partituras"
      subtitle="Escreva nota a nota, ouça, guarde no seu caderno e leve em MusicXML ou MIDI."
      badgeLabel="Caderno"
      badgeVariant="neutral"
      primaryAction={{ label: 'Voltar ao estúdio', icon: ArrowLeft, onClick: () => navigate('/studio') }}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-3 text-xs">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="font-semibold text-stone-700">Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={campo} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-stone-700">Clave</span>
            <select aria-label="Clave" value={clave} onChange={(e) => setClave(e.target.value as 'treble' | 'bass')} className={campo}>
              <option value="treble">Sol</option>
              <option value="bass">Fá</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-stone-700">Compasso</span>
            <select aria-label="Compasso" value={formula} onChange={(e) => setFormula(e.target.value as Formula)} className={campo}>
              {FORMULAS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-stone-700">Andamento (BPM)</span>
            <input
              aria-label="Andamento"
              type="number"
              min={30}
              max={240}
              value={andamento}
              onChange={(e) => setAndamento(Number(e.target.value) || 80)}
              className={`${campo} w-20 font-mono`}
            />
          </label>
        </div>

        <Staff id="caderno-pauta" clef={clave} timeSignature={formula} notes={notasDaPauta} />

        {transbordam.length > 0 && (
          <p className="text-[11px] text-stone-500">
            No{transbordam.length > 1 ? 's compassos' : ' compasso'} {transbordam.join(', ')} uma figura passa da barra;
            a ligadura ainda não é escrita, e a nota fica inteira no compasso em que começa.
          </p>
        )}

        <section aria-label="Escrever" className="space-y-3 rounded-lg border border-stone-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Figura</span>
              <select aria-label="Figura" value={figura} onChange={(e) => setFigura(e.target.value as Figura)} className={campo}>
                {FIGURAS.map((f) => (
                  <option key={f} value={f}>
                    {NOME_DA_FIGURA[f]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Alteração</span>
              <select aria-label="Alteração" value={acidente} onChange={(e) => setAcidente(e.target.value as '' | '#' | 'b')} className={campo}>
                <option value="">natural</option>
                <option value="#">sustenido</option>
                <option value="b">bemol</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Oitava</span>
              <select aria-label="Oitava" value={oitava} onChange={(e) => setOitava(Number(e.target.value))} className={campo}>
                {[2, 3, 4, 5, 6].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LETRAS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => escrever(`${l}${acidente}${oitava}`)}
                aria-label={`Escrever ${NOME[l]}${acidente === '#' ? ' sustenido' : acidente === 'b' ? ' bemol' : ''}`}
                className="min-w-[3rem] rounded-lg border border-stone-300 px-3 py-2 font-serif text-sm text-stone-800 hover:border-anil-700 hover:text-anil-800"
              >
                {NOME[l]}
                {acidente === '#' ? '♯' : acidente === 'b' ? '♭' : ''}
              </button>
            ))}
            <button
              type="button"
              onClick={() => escrever(null)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:border-anil-700"
            >
              Pausa
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setNotas((n) => n.slice(0, -1))}
              disabled={notas.length === 0}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Desfazer a última
            </button>
            <button
              type="button"
              onClick={() => setNotas([])}
              disabled={notas.length === 0}
              className="flex items-center gap-1 rounded px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Limpar a pauta
            </button>
          </div>
        </section>

        {recado && (
          <p
            role={recado.tom === 'erro' ? 'alert' : 'status'}
            className={`rounded-lg p-3 text-xs ${recado.tom === 'ok' ? 'bg-emerald-50 text-emerald-950' : 'bg-red-50 text-red-950'}`}
          >
            {recado.texto}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={tocar}
            disabled={notas.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 disabled:opacity-40"
          >
            {tocando ? <Square className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {tocando ? 'Parar' : 'Tocar'}
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={!userId}
            className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
          >
            <Save className="h-4 w-4" aria-hidden="true" /> Guardar no caderno
          </button>
          <button
            type="button"
            onClick={() => exportar('xml')}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Baixar MusicXML
          </button>
          <button
            type="button"
            onClick={() => exportar('mid')}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Baixar MIDI
          </button>
        </div>
        {!userId && (
          <p className="text-[11px] text-stone-500">
            Escrever, tocar e baixar funcionam sem conta. Para guardar no caderno, entre — a partitura fica em seu nome.
          </p>
        )}
      </div>
    </ScreenContainer>
  );
};
