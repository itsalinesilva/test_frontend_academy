import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentUnifiedProfileRepository } from '../src/repositories/unified-profile.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { resolveRouteParams } from '../src/ui/navigation/router';

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

  it('P-01: os fundadores reais continuam resolvendo', async () => {
    const um = await repo.findByUserId('usr_founder_1');
    const dois = await repo.findByUserId('usr_founder_2');
    expect(um?.userId).toBe('usr_founder_1');
    expect(dois?.userId).toBe('usr_founder_2');
  });

  it('P-01: id inexistente sem relação com fundador devolve null', async () => {
    expect(await repo.findByUserId('usr_ninguem')).toBeNull();
  });

  // ---------------------------------------------------------------
  // P-02 — projeção pública nunca carrega campo privado
  // ---------------------------------------------------------------
  it('P-02: a projeção pública descarta portfólio, evidências e links não públicos', async () => {
    const completo = await repo.findByUserId('usr_founder_1');
    expect(completo).not.toBeNull();

    const projecao = await repo.getPublicProjection('usr_founder_1');
    expect(projecao).not.toBeNull();

    expect(projecao!.portfolio.every((p) => p.visibility === 'public')).toBe(true);
    expect(projecao!.evidences.every((e) => e.visibility === 'public')).toBe(true);
    expect(projecao!.officialLinks.every((l) => l.isPublic)).toBe(true);
    expect(projecao!.sectionsConfig.every((s) => s.enabled && s.visibility === 'public')).toBe(true);
  });

  it('P-02: perfil inteiramente privado não tem projeção', async () => {
    const completo = await repo.findByUserId('usr_founder_2');
    await repo.save({ ...completo!, overallVisibility: 'private' });

    expect(await repo.getPublicProjection('usr_founder_2')).toBeNull();
  });

  // ---------------------------------------------------------------
  // P-04 — nenhuma conexão semeada aponta para perfil inexistente
  // ---------------------------------------------------------------
  it('P-04: toda conexão semeada resolve para um perfil que existe', async () => {
    const perfil = await repo.findByUserId('usr_founder_1');
    const conexoes = perfil?.connectionsList ?? [];

    for (const c of conexoes) {
      const alvo = await repo.findByUserId(c.targetUserId);
      expect(alvo, `conexão ${c.id} aponta para ${c.targetUserId}, que não existe`).not.toBeNull();
    }
  });

  it('P-04: o contador de conexões bate com a lista', async () => {
    const perfil = await repo.findByUserId('usr_founder_1');
    expect(perfil!.community.connectionsCount).toBe((perfil!.connectionsList ?? []).length);
  });

  // ---------------------------------------------------------------
  // Diretório
  // ---------------------------------------------------------------
  it('o diretório público devolve apenas projeções, nunca registros crus', async () => {
    const lista = await repo.listPublicDirectory();
    expect(lista.length).toBeGreaterThan(0);

    for (const p of lista) {
      expect(p.overallVisibility).not.toBe('private');
      expect(p.portfolio.every((i) => i.visibility === 'public')).toBe(true);
      expect(p.evidences.every((e) => e.visibility === 'public')).toBe(true);
    }
  });

  it('o diretório omite quem está privado', async () => {
    const completo = await repo.findByUserId('usr_founder_2');
    await repo.save({ ...completo!, overallVisibility: 'private' });

    const lista = await repo.listPublicDirectory();
    expect(lista.some((p) => p.userId === 'usr_founder_2')).toBe(false);
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
