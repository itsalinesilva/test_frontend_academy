import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';
import { Livreto, Avaliacao } from '../domain/booklet';
import { Anotacao } from '../domain/annotations';
import { fundirLivretos } from '../domain/pacote-editorial';
import { camadaPublicada } from './camada-publicada';

export interface BookletRepository {
  listarLivretos(): Promise<Livreto[]>;
  buscarLivreto(id: string): Promise<Livreto | null>;
  buscarLivretoDoCurso(cursoId: string): Promise<Livreto | null>;
  salvarLivreto(livreto: Livreto): Promise<Livreto>;
  excluirLivreto(id: string): Promise<boolean>;

  listarAvaliacoes(cursoId?: string): Promise<Avaliacao[]>;
  buscarAvaliacao(id: string): Promise<Avaliacao | null>;
  salvarAvaliacao(a: Avaliacao): Promise<Avaliacao>;
  excluirAvaliacao(id: string): Promise<boolean>;

  listarAnotacoes(userId: string, cursoId?: string): Promise<Anotacao[]>;
  salvarAnotacao(a: Anotacao): Promise<Anotacao>;
  excluirAnotacao(id: string): Promise<boolean>;
}

export class PersistentBookletRepository implements BookletRepository {
  private storage: StorageAdapter;
  private chaveLivretos = 'course_booklets_v1';
  private chaveAvaliacoes = 'course_assessments_v1';
  private chaveAnotacoes = 'course_annotations_v1';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private async mapa<T>(chave: string): Promise<Record<string, T>> {
    return (await this.storage.getItem<Record<string, T>>(chave)) ?? {};
  }

  private async gravar<T>(chave: string, mapa: Record<string, T>): Promise<void> {
    await this.storage.setItem(chave, mapa);
  }

  // ------------------------------------------------------------- livretos

  /**
   * Os livretos de fábrica entram na primeira leitura e depois ficam sob
   * controle de quem edita.
   *
   * Reintroduzir um livreto apagado seria desfazer uma decisão editorial —
   * por isso a semeadura só acontece quando o armazenamento está vazio, e não
   * a cada leitura.
   */
  private async mapaLivretos(): Promise<Record<string, Livreto>> {
    const bruto = await this.storage.getItem<Record<string, Livreto>>(this.chaveLivretos);
    if (bruto) return bruto;

    const { LIVRETOS_PADRAO } = await import('../data/seed-booklets');
    const inicial = Object.fromEntries(LIVRETOS_PADRAO.map((l) => [l.id, l]));
    await this.gravar(this.chaveLivretos, inicial);
    return inicial;
  }

  /**
   * O que vale: o livreto publicado (pacote commitado), com o deste navegador
   * por cima quando é mais novo (EE-21). Ler só o local deixava o aluno com a
   * questão errada que já tinha sido corrigida e publicada.
   */
  private async vigentes(): Promise<Livreto[]> {
    return fundirLivretos(camadaPublicada().livretos, Object.values(await this.mapaLivretos()))
      .resultado;
  }

  public async listarLivretos(): Promise<Livreto[]> {
    return (await this.vigentes()).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  }

  public async buscarLivreto(id: string): Promise<Livreto | null> {
    return (await this.vigentes()).find((l) => l.id === id) ?? null;
  }

  public async buscarLivretoDoCurso(cursoId: string): Promise<Livreto | null> {
    return (await this.vigentes()).find((l) => l.cursoId === cursoId) ?? null;
  }

  public async salvarLivreto(livreto: Livreto): Promise<Livreto> {
    const mapa = await this.mapaLivretos();
    const atualizado: Livreto = { ...livreto, updatedAt: new Date().toISOString() };
    mapa[livreto.id] = atualizado;
    await this.gravar(this.chaveLivretos, mapa);
    return atualizado;
  }

  public async excluirLivreto(id: string): Promise<boolean> {
    const mapa = await this.mapaLivretos();
    if (!mapa[id]) return false;
    delete mapa[id];
    await this.gravar(this.chaveLivretos, mapa);
    return true;
  }

  // ----------------------------------------------------------- avaliações

  public async listarAvaliacoes(cursoId?: string): Promise<Avaliacao[]> {
    const todas = Object.values(await this.mapa<Avaliacao>(this.chaveAvaliacoes));
    const filtradas = cursoId ? todas.filter((a) => a.cursoId === cursoId) : todas;
    // Simulados antes de provas: é a ordem em que o aluno os encontra.
    return filtradas.sort(
      (a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'SIMULADO' ? -1 : 1) ||
        a.titulo.localeCompare(b.titulo, 'pt-BR')
    );
  }

  public async buscarAvaliacao(id: string): Promise<Avaliacao | null> {
    return (await this.mapa<Avaliacao>(this.chaveAvaliacoes))[id] ?? null;
  }

  public async salvarAvaliacao(a: Avaliacao): Promise<Avaliacao> {
    const mapa = await this.mapa<Avaliacao>(this.chaveAvaliacoes);
    const atualizada: Avaliacao = { ...a, updatedAt: new Date().toISOString() };
    mapa[a.id] = atualizada;
    await this.gravar(this.chaveAvaliacoes, mapa);
    return atualizada;
  }

  public async excluirAvaliacao(id: string): Promise<boolean> {
    const mapa = await this.mapa<Avaliacao>(this.chaveAvaliacoes);
    if (!mapa[id]) return false;
    delete mapa[id];
    await this.gravar(this.chaveAvaliacoes, mapa);
    return true;
  }

  // ------------------------------------------------------------ anotações

  public async listarAnotacoes(userId: string, cursoId?: string): Promise<Anotacao[]> {
    const todas = Object.values(await this.mapa<Anotacao>(this.chaveAnotacoes));
    return todas
      .filter((a) => a.userId === userId && (!cursoId || a.cursoId === cursoId))
      .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm));
  }

  public async salvarAnotacao(a: Anotacao): Promise<Anotacao> {
    const mapa = await this.mapa<Anotacao>(this.chaveAnotacoes);
    const atualizada: Anotacao = { ...a, updatedAtIso: new Date().toISOString() };
    mapa[a.id] = atualizada;
    await this.gravar(this.chaveAnotacoes, mapa);
    return atualizada;
  }

  public async excluirAnotacao(id: string): Promise<boolean> {
    const mapa = await this.mapa<Anotacao>(this.chaveAnotacoes);
    if (!mapa[id]) return false;
    delete mapa[id];
    await this.gravar(this.chaveAnotacoes, mapa);
    return true;
  }
}
