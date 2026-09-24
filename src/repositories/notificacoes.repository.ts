import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';

/**
 * Os avisos de cada pessoa (AUD-10).
 *
 * A central de notificações dizia, com razão, que a plataforma não emitia
 * nenhuma. Agora os avisos PESSOAIS nascem onde as coisas acontecem — o
 * certificado emitido, a habilidade que subiu de nível — e ficam na conta da
 * pessoa: vão para o Drive junto com o resto (cada aviso tem `userId`, e a
 * cópia leva só os de quem é dono). Os avisos das SALAS vêm do servidor, que
 * é onde as salas vivem (`/api/v1/salas-novidades`).
 */
export type TipoDeAviso = 'CERTIFICADO' | 'NIVEL' | 'SALA_POST' | 'SALA_COMENTARIO' | 'SALA_CURTIDA' | 'SALA_ENCONTRO' | 'SALA_APROVADO';

export interface Aviso {
  id: string;
  userId: string;
  tipo: TipoDeAviso;
  titulo: string;
  texto: string;
  /** Endereço dentro da plataforma — nunca link externo. */
  link: string;
  em: string;
}

interface Leitura {
  userId: string;
  /** Tudo até aqui foi visto. Um marco, e não uma lista: a lista cresceria para sempre. */
  lidasAte: string;
}

const CHAVE = 'notificacoes_v1';
const CHAVE_LEITURA = 'notificacoes_lidas_v1';
const LIMITE_POR_PESSOA = 200;

export class NotificacoesRepository {
  constructor(private readonly storage = new LocalStorageAdapter()) {}

  private todos(): Aviso[] {
    return this.storage.get<Aviso[]>(CHAVE) ?? [];
  }

  listar(userId: string): Aviso[] {
    return this.todos()
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.em.localeCompare(a.em));
  }

  /** Emite um aviso. O mesmo `id` não entra duas vezes: emitir de novo o mesmo certificado não duplica. */
  emitir(aviso: Omit<Aviso, 'em'> & { em?: string }): void {
    const todos = this.todos();
    if (todos.some((a) => a.id === aviso.id)) return;
    const novo: Aviso = { ...aviso, em: aviso.em ?? new Date().toISOString() };
    const daPessoa = [novo, ...todos.filter((a) => a.userId === aviso.userId)]
      .sort((a, b) => b.em.localeCompare(a.em))
      .slice(0, LIMITE_POR_PESSOA);
    this.storage.set(CHAVE, [...todos.filter((a) => a.userId !== aviso.userId), ...daPessoa]);
  }

  lidasAte(userId: string): string {
    return (this.storage.get<Leitura[]>(CHAVE_LEITURA) ?? []).find((l) => l.userId === userId)?.lidasAte ?? '';
  }

  marcarTodasComoLidas(userId: string, ate: string = new Date().toISOString()): void {
    const outras = (this.storage.get<Leitura[]>(CHAVE_LEITURA) ?? []).filter((l) => l.userId !== userId);
    this.storage.set(CHAVE_LEITURA, [...outras, { userId, lidasAte: ate }]);
  }
}

export const notificacoesRepository = new NotificacoesRepository();
