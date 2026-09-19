import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';
import {
  PerfilInfantil,
  SolicitacaoParental,
  ModalidadeContaAdulta,
} from '../domain/kids-account';

export interface RegistroResponsavel {
  userId: string;
  modalidade: ModalidadeContaAdulta;
  criadoEm: string;
}

export interface KidsAccountRepository {
  listarPerfis(responsavelUserId: string): Promise<PerfilInfantil[]>;
  buscarPerfil(userId: string): Promise<PerfilInfantil | null>;
  buscarPorNomeUsuario(nomeUsuario: string): Promise<PerfilInfantil | null>;
  salvarPerfil(perfil: PerfilInfantil): Promise<PerfilInfantil>;
  excluirPerfil(userId: string): Promise<boolean>;

  listarSolicitacoes(responsavelUserId: string): Promise<SolicitacaoParental[]>;
  salvarSolicitacao(s: SolicitacaoParental): Promise<SolicitacaoParental>;
  buscarSolicitacao(id: string): Promise<SolicitacaoParental | null>;

  buscarResponsavel(userId: string): Promise<RegistroResponsavel | null>;
  salvarResponsavel(r: RegistroResponsavel): Promise<RegistroResponsavel>;
}

export class PersistentKidsAccountRepository implements KidsAccountRepository {
  private storage: StorageAdapter;
  private chavePerfis = 'kids_profiles_v1';
  private chaveSolicitacoes = 'kids_requests_v1';
  private chaveResponsaveis = 'kids_guardians_v1';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private async mapa<T>(chave: string): Promise<Record<string, T>> {
    return (await this.storage.getItem<Record<string, T>>(chave)) ?? {};
  }

  // ------------------------------------------------------------------ perfis

  public async listarPerfis(responsavelUserId: string): Promise<PerfilInfantil[]> {
    const todos = Object.values(await this.mapa<PerfilInfantil>(this.chavePerfis));
    return todos
      .filter((p) => p.responsavelUserId === responsavelUserId)
      .sort((a, b) => a.nomeExibicao.localeCompare(b.nomeExibicao, 'pt-BR'));
  }

  public async buscarPerfil(userId: string): Promise<PerfilInfantil | null> {
    return (await this.mapa<PerfilInfantil>(this.chavePerfis))[userId] ?? null;
  }

  public async buscarPorNomeUsuario(nomeUsuario: string): Promise<PerfilInfantil | null> {
    const alvo = nomeUsuario.trim().toLowerCase();
    const todos = Object.values(await this.mapa<PerfilInfantil>(this.chavePerfis));
    return todos.find((p) => p.credenciais.nomeUsuario.toLowerCase() === alvo) ?? null;
  }

  public async salvarPerfil(perfil: PerfilInfantil): Promise<PerfilInfantil> {
    const mapa = await this.mapa<PerfilInfantil>(this.chavePerfis);
    mapa[perfil.userId] = perfil;
    await this.storage.setItem(this.chavePerfis, mapa);
    return perfil;
  }

  public async excluirPerfil(userId: string): Promise<boolean> {
    const mapa = await this.mapa<PerfilInfantil>(this.chavePerfis);
    if (!mapa[userId]) return false;
    delete mapa[userId];
    await this.storage.setItem(this.chavePerfis, mapa);
    return true;
  }

  // ----------------------------------------------------------- solicitações

  public async listarSolicitacoes(responsavelUserId: string): Promise<SolicitacaoParental[]> {
    const todas = Object.values(await this.mapa<SolicitacaoParental>(this.chaveSolicitacoes));
    return todas
      .filter((s) => s.responsavelUserId === responsavelUserId)
      // Pendentes primeiro: é o que exige ação. Dentro de cada grupo, a mais
      // recente antes — uma criança esperando aval não deve ficar no fim da
      // fila porque pediu ontem.
      .sort((a, b) => {
        if (a.situacao !== b.situacao) {
          if (a.situacao === 'PENDENTE') return -1;
          if (b.situacao === 'PENDENTE') return 1;
        }
        return b.criadaEm.localeCompare(a.criadaEm);
      });
  }

  public async buscarSolicitacao(id: string): Promise<SolicitacaoParental | null> {
    return (await this.mapa<SolicitacaoParental>(this.chaveSolicitacoes))[id] ?? null;
  }

  public async salvarSolicitacao(s: SolicitacaoParental): Promise<SolicitacaoParental> {
    const mapa = await this.mapa<SolicitacaoParental>(this.chaveSolicitacoes);
    mapa[s.id] = s;
    await this.storage.setItem(this.chaveSolicitacoes, mapa);
    return s;
  }

  // ----------------------------------------------------------- responsáveis

  public async buscarResponsavel(userId: string): Promise<RegistroResponsavel | null> {
    return (await this.mapa<RegistroResponsavel>(this.chaveResponsaveis))[userId] ?? null;
  }

  public async salvarResponsavel(r: RegistroResponsavel): Promise<RegistroResponsavel> {
    const mapa = await this.mapa<RegistroResponsavel>(this.chaveResponsaveis);
    mapa[r.userId] = r;
    await this.storage.setItem(this.chaveResponsaveis, mapa);
    return r;
  }
}
