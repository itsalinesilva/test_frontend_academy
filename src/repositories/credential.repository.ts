import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';
import { TemplateCredencial, TipoCredencial } from '../domain/credential-design';
import { CredencialEmitida } from '../domain/credential';
import { TEMPLATES_PADRAO } from '../data/seed-credential-templates';

export interface CredentialRepository {
  listarTemplates(): Promise<TemplateCredencial[]>;
  buscarTemplate(id: string): Promise<TemplateCredencial | null>;
  salvarTemplate(template: TemplateCredencial): Promise<TemplateCredencial>;
  excluirTemplate(id: string): Promise<boolean>;

  listarEmitidas(userId?: string): Promise<CredencialEmitida[]>;
  buscarPorCodigo(codigo: string): Promise<CredencialEmitida | null>;
  salvarEmitida(credencial: CredencialEmitida): Promise<CredencialEmitida>;
}

export class PersistentCredentialRepository implements CredentialRepository {
  private storage: StorageAdapter;
  private chaveTemplates = 'credential_templates_v1';
  private chaveEmitidas = 'credentials_issued_v1';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  /**
   * Os três templates de fábrica são dados de DESIGN, não de pessoas.
   *
   * Diferente do seed de perfis que foi removido, aqui semear é correto: um
   * estúdio de credenciais que abre vazio obriga a desenhar um certificado do
   * zero antes de emitir o primeiro. Estes três não afirmam nada sobre
   * ninguém — são pontos de partida editáveis.
   */
  private async mapaTemplates(): Promise<Record<string, TemplateCredencial>> {
    const bruto = await this.storage.getItem<Record<string, TemplateCredencial>>(this.chaveTemplates);
    if (bruto && Object.keys(bruto).length > 0) {
      // Templates de fábrica que tenham sido removidos do armazenamento por
      // versão anterior voltam; os editados pela usuária permanecem como ela
      // deixou.
      const completo = { ...bruto };
      for (const padrao of TEMPLATES_PADRAO) {
        if (!completo[padrao.id]) completo[padrao.id] = padrao;
      }
      return completo;
    }
    const inicial = Object.fromEntries(TEMPLATES_PADRAO.map((t) => [t.id, t]));
    await this.storage.setItem(this.chaveTemplates, inicial);
    return inicial;
  }

  public async listarTemplates(): Promise<TemplateCredencial[]> {
    const mapa = await this.mapaTemplates();
    const ordem: Record<TipoCredencial, number> = { CERTIFICADO: 0, CREDENCIAL: 1, BADGE: 2 };
    return Object.values(mapa).sort(
      (a, b) => ordem[a.tipo] - ordem[b.tipo] || a.nome.localeCompare(b.nome, 'pt-BR')
    );
  }

  public async buscarTemplate(id: string): Promise<TemplateCredencial | null> {
    return (await this.mapaTemplates())[id] ?? null;
  }

  public async salvarTemplate(template: TemplateCredencial): Promise<TemplateCredencial> {
    const mapa = await this.mapaTemplates();
    const atualizado: TemplateCredencial = { ...template, updatedAt: new Date().toISOString() };
    mapa[template.id] = atualizado;
    await this.storage.setItem(this.chaveTemplates, mapa);
    return atualizado;
  }

  public async excluirTemplate(id: string): Promise<boolean> {
    const mapa = await this.mapaTemplates();
    const alvo = mapa[id];
    // Um template de fábrica não se apaga: ele é a referência de estrutura
    // para a qual sempre se pode voltar. Duplicar e editar a cópia é o
    // caminho previsto.
    if (!alvo || alvo.ehPadrao) return false;
    delete mapa[id];
    await this.storage.setItem(this.chaveTemplates, mapa);
    return true;
  }

  // -------------------------------------------------------------------------

  private async mapaEmitidas(): Promise<Record<string, CredencialEmitida>> {
    return (await this.storage.getItem<Record<string, CredencialEmitida>>(this.chaveEmitidas)) ?? {};
  }

  public async listarEmitidas(userId?: string): Promise<CredencialEmitida[]> {
    const todas = Object.values(await this.mapaEmitidas());
    const filtradas = userId ? todas.filter((c) => c.userId === userId) : todas;
    return filtradas.sort((a, b) => b.emitidaEm.localeCompare(a.emitidaEm));
  }

  public async buscarPorCodigo(codigo: string): Promise<CredencialEmitida | null> {
    const mapa = await this.mapaEmitidas();
    // A busca ignora caixa e espaços: o código costuma ser digitado lendo de
    // um papel impresso.
    const normalizado = codigo.trim().toUpperCase().replace(/\s+/g, '');
    return (
      Object.values(mapa).find((c) => c.codigo.toUpperCase() === normalizado) ?? null
    );
  }

  public async salvarEmitida(credencial: CredencialEmitida): Promise<CredencialEmitida> {
    const mapa = await this.mapaEmitidas();
    mapa[credencial.id] = credencial;
    await this.storage.setItem(this.chaveEmitidas, mapa);
    return credencial;
  }
}
