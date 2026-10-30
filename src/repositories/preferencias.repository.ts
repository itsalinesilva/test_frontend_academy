import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';

/**
 * As preferências deste aparelho (AUD-6).
 *
 * A tela de Configurações dizia "Configurações Salvas" e não guardava nada;
 * os interruptores de acessibilidade não mudavam a página. Agora cada escolha
 * vale na hora — vira atributo no `<html>`, que o CSS lê — e fica guardada.
 *
 * São do APARELHO, e não da conta: o microfone escolhido só existe neste
 * computador, e quem precisa de contraste alto precisa dele antes de entrar.
 */
export type PrioridadeDoAudio = 'latencia' | 'equilibrio' | 'estabilidade';

export interface Preferencias {
  /** `deviceId` do microfone; ausente = o padrão do sistema. */
  microfoneId?: string;
  prioridade: PrioridadeDoAudio;
  altoContraste: boolean;
  reduzirMovimento: boolean;
  leituraEspacada: boolean;
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  prioridade: 'equilibrio',
  altoContraste: false,
  reduzirMovimento: false,
  leituraEspacada: false,
};

/** O que o `AudioContext` entende por cada prioridade. */
export const DICA_DE_LATENCIA: Record<PrioridadeDoAudio, AudioContextLatencyCategory> = {
  latencia: 'interactive',
  equilibrio: 'balanced',
  estabilidade: 'playback',
};

const CHAVE = 'preferencias_v1';
const armazenamento = new LocalStorageAdapter();

export function lerPreferencias(): Preferencias {
  const salvas = armazenamento.get<Partial<Preferencias>>(CHAVE) ?? {};
  return { ...PREFERENCIAS_PADRAO, ...salvas };
}

export function salvarPreferencias(p: Preferencias): void {
  armazenamento.set(CHAVE, p);
  aplicarPreferencias(p);
}

/** Os atributos que o CSS de `index.css` lê. Atributo ausente = comportamento normal. */
export function aplicarPreferencias(p: Preferencias = lerPreferencias(), raiz?: HTMLElement): void {
  const html = raiz ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
  if (!html) return;
  const marcar = (nome: string, ligado: boolean) =>
    ligado ? html.setAttribute(nome, '') : html.removeAttribute(nome);
  marcar('data-alto-contraste', p.altoContraste);
  marcar('data-reduzir-movimento', p.reduzirMovimento);
  marcar('data-leitura-espacada', p.leituraEspacada);
}
