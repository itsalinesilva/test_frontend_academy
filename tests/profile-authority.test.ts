import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentUnifiedProfileRepository } from '../src/repositories/unified-profile.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { resolveRouteParams } from '../src/ui/navigation/router';
import { criarPerfil, criarEvidencia, criarItemPortfolio } from './helpers/profile-factory';

/**
 * Regressões do COMANDO 4.
 *
 * Os seis defeitos abaixo eram inalcançáveis pela interface enquanto
 * `/profile/:userId` não existia: não havia como pedir o perfil de outra
 * pessoa. Criar a rota é justamente o que os tornaria exploráveis por URL,
 * então cada um é fixado aqui antes de a rota entrar em uso.
 */
describe('Autoridade do perfil (regressões P-01 a P-06)', () => {
  let repo: PersistentUnifiedProfileRepository;

  beforeEach(() => {
    repo = new PersistentUnifiedProfileRepository(new MemoryStorageAdapter());
  });

  // ---------------------------------------------------------------
  // P-01 — vazamento por substring
  // ---------------------------------------------------------------
  it('P-01: id desconhecido contendo "founder" NÃO devolve o perfil da fundadora', async () => {
    const intruso = await repo.findByUserId('usr_founder_999');
    expect(intruso).toBeNull();

    const outro = await repo.findByUserId('atacante-founder-x');
    expect(outro).toBeNull();
  });

  it('P-01: a plataforma nasce sem NENHUMA pessoa cadastrada', async () => {
    // O seed trazia um perfil completo da fundadora — cátedra, 420h de
    // estudo, percentil 99,8 — para alguém que nunca se cadastrou.
    expect(await repo.listPublicDirectory()).toEqual([]);
    expect(await repo.findByUserId('usr_founder_1')).toBeNull();
    expect(await repo.findByUserId('usr_founder_2')).toBeNull();
  });

  it('P-01: um perfil salvo resolve normalmente', async () => {
    await repo.save(criarPerfil('usr_ana'));
    expect((await repo.findByUserId('usr_ana'))?.userId).toBe('usr_ana');
  });

  it('P-01: id inexistente sem relação com fundador devolve null', async () => {
    expect(await repo.findByUserId('usr_ninguem')).toBeNull();
  });

  // ---------------------------------------------------------------
  // P-02 — projeção pública nunca carrega campo privado
  // ---------------------------------------------------------------
  it('P-02: a projeção pública descarta portfólio, evidências e links não públicos', async () => {
    await repo.save(
      criarPerfil('usr_bia', {
        evidences: [
          criarEvidencia('ev_pub', 'usr_bia', 'public'),
          criarEvidencia('ev_priv', 'usr_bia', 'private'),
        ],
        portfolio: [
          criarItemPortfolio('pf_pub', 'usr_bia', 'public'),
          criarItemPortfolio('pf_priv', 'usr_bia', 'private'),
        ],
        officialLinks: [
          { id: 'l1', label: 'Site', url: 'https://exemplo.org', type: 'website', isPublic: true },
          { id: 'l2', label: 'Interno', url: 'https://interno.exemplo.org', type: 'website', isPublic: false },
        ],
      })
    );

    const projecao = await repo.getPublicProjection('usr_bia');
    expect(projecao).not.toBeNull();

    // O que é privado não chega ao cliente — nem para ser escondido por CSS.
    const serializado = JSON.stringify(projecao);
    expect(serializado).not.toContain('ev_priv');
    expect(serializado).not.toContain('pf_priv');
    expect(serializado).not.toContain('interno.exemplo.org');

    expect(projecao!.evidences.map((e) => e.id)).toEqual(['ev_pub']);
    expect(projecao!.portfolio.map((p) => p.id)).toEqual(['pf_pub']);
    expect(projecao!.officialLinks.every((l) => l.isPublic)).toBe(true);
    expect(projecao!.sectionsConfig.every((c) => c.enabled && c.visibility === 'public')).toBe(true);
  });

  it('P-02: perfil inteiramente privado não tem projeção', async () => {
    await repo.save(criarPerfil('usr_carlos', { overallVisibility: 'private' }));
    expect(await repo.getPublicProjection('usr_carlos')).toBeNull();
  });

  // ---------------------------------------------------------------
  // P-04 — nenhuma conexão semeada aponta para perfil inexistente
  // ---------------------------------------------------------------
  it('P-04: nenhum perfil inicial traz conexão para alguém que não existe', async () => {
    // As 4 conexões semeadas apontavam para usr_gabriel_1, usr_clara_1,
    // usr_arthur_1 e usr_helena_1 — perfis que nunca existiram. Com
    // /profile/:userId ativo, cada card seria um link morto.
    for (const p of await repo.listPublicDirectory()) {
      for (const c of p.connectionsList ?? []) {
        expect(await repo.findByUserId(c.targetUserId)).not.toBeNull();
      }
    }
  });

  it('P-04: o contador de conexões bate com a lista', async () => {
    await repo.save(criarPerfil('usr_dani'));
    const perfil = await repo.findByUserId('usr_dani');
    expect(perfil!.community.connectionsCount).toBe((perfil!.connectionsList ?? []).length);
  });

  // ---------------------------------------------------------------
  // Diretório
  // ---------------------------------------------------------------
  it('o diretório público devolve apenas projeções, nunca registros crus', async () => {
    await repo.save(
      criarPerfil('usr_elis', {
        evidences: [criarEvidencia('ev_x', 'usr_elis', 'private')],
        portfolio: [criarItemPortfolio('pf_x', 'usr_elis', 'private')],
      })
    );

    const lista = await repo.listPublicDirectory();
    expect(lista.length).toBeGreaterThan(0);

    for (const p of lista) {
      expect(p.overallVisibility).not.toBe('private');
      expect(p.portfolio.every((i) => i.visibility === 'public')).toBe(true);
      expect(p.evidences.every((e) => e.visibility === 'public')).toBe(true);
    }
  });

  it('o diretório omite quem está privado', async () => {
    await repo.save(criarPerfil('usr_visivel'));
    await repo.save(criarPerfil('usr_oculto', { overallVisibility: 'private' }));

    const lista = await repo.listPublicDirectory();
    expect(lista.map((p) => p.userId)).toEqual(['usr_visivel']);
  });

  // ---------------------------------------------------------------
  // P-05 — a rota que faltava, e a precedência das estáticas
  // ---------------------------------------------------------------
  it('P-05: /profile/:userId resolve o parâmetro', () => {
    expect(resolveRouteParams('/profile/usr_founder_2')).toEqual({ userId: 'usr_founder_2' });
  });

  it('P-05: as rotas estáticas de /profile têm precedência sobre :userId', () => {
    // Sem precedência, /profile/edit seria "o perfil de um usuário chamado edit".
    expect(resolveRouteParams('/profile/edit')).toEqual({});
    expect(resolveRouteParams('/profile/portfolio')).toEqual({});
    expect(resolveRouteParams('/profile/network')).toEqual({});
  });
});
