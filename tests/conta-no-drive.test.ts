// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fundirCopia, lerCopia, montarCopia, soODe, NOME_DO_ARQUIVO } from '../src/domain/copia-de-seguranca';
import { DriveAppData, ErroDoDrive } from '../src/infrastructure/drive/drive-appdata';
import { ContaNoDrive } from '../src/services/application/conta-no-drive.service';
import { LocalStorageAdapter } from '../src/infrastructure/storage/storage-adapter';

/**
 * AUD-20 · ADR-001.A — A CONTA VIVE NO GOOGLE DRIVE DA PESSOA.
 *
 * Estava decidido desde o início (login Google, dados no Drive; no celular,
 * opção de ficar só no aparelho) e não existia: limpar o navegador apagava a
 * conta, e trocar de aparelho recomeçava do zero.
 */

describe('o que entra na cópia', () => {
  it('🔴 num aparelho compartilhado, o trabalho de outra pessoa NÃO vai para o meu Drive', () => {
    const c = montarCopia(
      {
        estudio_caderno_v1: JSON.stringify([
          { id: 'p1', autorId: 'eu', titulo: 'Minha' },
          { id: 'p2', autorId: 'outra', titulo: 'Dela' },
        ]),
        practice_results: JSON.stringify({ r1: { id: 'r1', userId: 'outra' }, r2: { id: 'r2', userId: 'eu' } }),
        editorial_licoes: JSON.stringify([{ id: 'l1', titulo: 'conteúdo sem dono' }]),
      },
      'eu'
    );
    expect(c.dados.estudio_caderno_v1).toEqual([{ id: 'p1', autorId: 'eu', titulo: 'Minha' }]);
    expect(c.dados.practice_results).toEqual({ r2: { id: 'r2', userId: 'eu' } });
    expect(c.dados.editorial_licoes).toEqual([{ id: 'l1', titulo: 'conteúdo sem dono' }]);
  });

  it('sessão, lista de contas do aparelho e preferências do aparelho nunca entram', () => {
    const c = montarCopia(
      {
        current_auth_session: '{"accessToken":"segredo"}',
        users_collection: '[{"email":"outra@x.org"}]',
        preferencias_v1: '{"altoContraste":true}',
        caderno: '[]',
      },
      'eu'
    );
    expect(Object.keys(c.dados)).toEqual(['caderno']);
    expect(JSON.stringify(c)).not.toMatch(/segredo|outra@x/);
  });

  it('chave que só tinha registros de outra pessoa não vira lista vazia na minha cópia', () => {
    const c = montarCopia({ caderno: JSON.stringify([{ id: 'x', autorId: 'outra' }]) }, 'eu');
    expect(c.dados).toEqual({});
  });

  it('registro solto de outra pessoa sai inteiro', () => {
    expect(soODe({ userId: 'outra', xp: 10 }, 'eu')).toBeUndefined();
    expect(soODe({ userId: 'eu', xp: 10 }, 'eu')).toEqual({ userId: 'eu', xp: 10 });
  });
});

describe('como a cópia volta', () => {
  const copia = montarCopia({ caderno: JSON.stringify([{ id: 'p1', autorId: 'eu', titulo: 'Do Drive' }]) }, 'eu');

  it('🔴 a cópia de OUTRA conta é recusada', () => {
    const r = lerCopia(JSON.stringify(copia), 'outra');
    expect(r).toEqual({ ok: false, motivo: expect.stringMatching(/outra conta/) });
  });

  it('arquivo qualquer é recusado com motivo', () => {
    expect(lerCopia('não é json', 'eu').ok).toBe(false);
    expect(lerCopia('{"a":1}', 'eu').ok).toBe(false);
  });

  it('🔴 restaurar não apaga o que outra pessoa tem no aparelho; o meu vence pelo id', () => {
    const fundido = fundirCopia(
      {
        caderno: JSON.stringify([
          { id: 'p1', autorId: 'eu', titulo: 'Local velho' },
          { id: 'p9', autorId: 'outra', titulo: 'Dela' },
        ]),
      },
      copia
    );
    const lista = JSON.parse(fundido.caderno) as Array<{ id: string; titulo: string }>;
    expect(lista.map((p) => p.titulo).sort()).toEqual(['Dela', 'Do Drive']);
  });
});

/** Um Drive falso, com as mesmas URLs da API de verdade. */
function driveFalso() {
  const arquivos = new Map<string, { nome: string; conteudo: string }>();
  const pedidos: Array<{ metodo: string; url: string }> = [];
  let seq = 0;
  const buscar = vi.fn(async (url: string, init: RequestInit = {}) => {
    const metodo = init.method ?? 'GET';
    pedidos.push({ metodo, url });
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tk');
    if (metodo === 'GET' && url.includes('/files?spaces=appDataFolder')) {
      const nome = decodeURIComponent(url.split('q=')[1].split('&')[0]).match(/'(.+)'/)![1];
      const files = [...arquivos.entries()].filter(([, a]) => a.nome === nome).map(([id]) => ({ id }));
      return new Response(JSON.stringify({ files }));
    }
    if (metodo === 'GET' && url.includes('alt=media')) {
      const id = url.split('/files/')[1].split('?')[0];
      return new Response(arquivos.get(id)!.conteudo);
    }
    if (metodo === 'POST') {
      const corpo = String(init.body);
      expect(corpo).toContain('"parents":["appDataFolder"]');
      const id = `f${++seq}`;
      const partes = corpo.split('\r\n\r\n');
      arquivos.set(id, { nome: JSON.parse(partes[1].split('\r\n')[0]).name, conteudo: partes[2].split('\r\n--')[0] });
      return new Response(JSON.stringify({ id }));
    }
    if (metodo === 'PATCH') {
      const id = url.split('/files/')[1].split('?')[0];
      arquivos.get(id)!.conteudo = String(init.body);
      return new Response('{}');
    }
    return new Response('', { status: 404 });
  });
  return { arquivos, pedidos, buscar: buscar as unknown as typeof fetch };
}

describe('o cliente do Drive', () => {
  it('cria o arquivo na pasta oculta da aplicação, e depois atualiza o MESMO arquivo', async () => {
    const f = driveFalso();
    const d = new DriveAppData(async () => ({ valor: 'tk', segundos: 3600 }), f.buscar);
    expect(await d.ler(NOME_DO_ARQUIVO)).toBeNull();
    await d.gravar(NOME_DO_ARQUIVO, '{"v":1}');
    await d.gravar(NOME_DO_ARQUIVO, '{"v":2}');
    expect(f.arquivos.size).toBe(1);
    expect(await d.ler(NOME_DO_ARQUIVO)).toBe('{"v":2}');
    expect(f.pedidos.filter((p) => p.metodo === 'POST')).toHaveLength(1);
  });

  it('Drive sem espaço vira mensagem clara', async () => {
    const d = new DriveAppData(
      async () => ({ valor: 'tk', segundos: 3600 }),
      (async () => new Response('{"error":{"errors":[{"reason":"storageQuotaExceeded"}]}}', { status: 403 })) as unknown as typeof fetch
    );
    await expect(d.gravar('x', '{}')).rejects.toMatchObject({ codigo: 'COTA' });
  });
});

describe('🔴 a conta atravessa aparelhos', () => {
  beforeEach(() => localStorage.clear());

  function contaCom(f: ReturnType<typeof driveFalso>, consentiu = true) {
    return new ContaNoDrive(() => {
      const d = new DriveAppData(async (interativo) => {
        if (!consentiu && !interativo) throw new ErroDoDrive('SEM_PERMISSAO', 'sem consentimento');
        consentiu = true;
        return { valor: 'tk', segundos: 3600 };
      }, f.buscar);
      return d;
    });
  }

  it('o que fiz num aparelho aparece no outro, depois de limpar tudo', async () => {
    const drive = driveFalso();

    /** Aparelho 1: conecta, escreve, grava. */
    const a1 = contaCom(drive, false);
    a1.entrou('eu', 'eu@x.org');
    await a1.conectar(true);
    await new LocalStorageAdapter().setItem('estudio_caderno_v1', [{ id: 'p1', autorId: 'eu', titulo: 'Fuga' }]);
    await a1.gravarAgora();
    expect(a1.atual).toMatchObject({ conectado: true, pendente: false });

    /** Aparelho 2 (navegador vazio): entrar basta — consentimento anterior, sem janela. */
    localStorage.clear();
    const a2 = contaCom(drive, true);
    a2.entrou('eu', 'eu@x.org');
    await vi.waitFor(() => expect(localStorage.getItem('amd_estudio_caderno_v1')).toContain('Fuga'));
  });

  it('mudança local marca pendente e vai sozinha para o Drive', async () => {
    vi.useFakeTimers();
    const drive = driveFalso();
    const c = contaCom(drive);
    c.entrou('eu');
    await c.conectar(true);
    await new LocalStorageAdapter().setItem('caderno', [{ id: 'a', autorId: 'eu' }]);
    expect(c.atual.pendente).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    vi.useRealTimers();
    await vi.waitFor(() => expect(c.atual.pendente).toBe(false));
    const guardado = JSON.parse([...drive.arquivos.values()][0].conteudo);
    expect(guardado.dados.caderno).toEqual([{ id: 'a', autorId: 'eu' }]);
  });

  it('🔴 conexão silenciosa do login + clique em "Conectar" ao mesmo tempo: UM arquivo só no Drive', async () => {
    const drive = driveFalso();
    const c = contaCom(drive);
    c.entrou('eu'); // dispara a conexão silenciosa, sem esperar
    await Promise.all([c.conectar(true), c.gravarAgora()]);
    expect(drive.arquivos.size).toBe(1);
  });

  it('sem consentimento ainda, mudar algo fica pendente — sem erro na cara da pessoa', async () => {
    const drive = driveFalso();
    const c = contaCom(drive, false);
    c.entrou('eu');
    await new LocalStorageAdapter().setItem('caderno', [{ id: 'a', autorId: 'eu' }]);
    await c.gravarAgora();
    expect(c.atual).toMatchObject({ conectado: false, pendente: true });
    expect(c.atual.erro).toBeUndefined();
    expect(drive.pedidos).toHaveLength(0);
  });

  it('"só neste aparelho": nada vai ao Drive', async () => {
    const drive = driveFalso();
    const c = contaCom(drive);
    c.entrou('eu');
    c.escolher('aparelho');
    await new LocalStorageAdapter().setItem('caderno', [{ id: 'a', autorId: 'eu' }]);
    await c.gravarAgora();
    expect(drive.pedidos.filter((p) => p.metodo !== 'GET')).toHaveLength(0);
  });

  it('exportar e importar funcionam sem Drive — é o caminho do celular', async () => {
    const c = contaCom(driveFalso());
    c.entrou('eu');
    c.escolher('aparelho');
    await new LocalStorageAdapter().setItem('caderno', [{ id: 'a', autorId: 'eu' }]);
    const arquivo = c.exportar();
    localStorage.clear();
    expect(c.importar(arquivo)).toEqual({ ok: true });
    expect(localStorage.getItem('amd_caderno')).toContain('"a"');
    expect(c.importar(arquivo.replace('"dono": "eu"', '"dono": "outra"')).ok).toBe(false);
  });
});
