import { describe, it, expect, beforeEach } from 'vitest';
import { KidsAccountService } from '../src/services/application/kids-account.service';
import { PersistentKidsAccountRepository } from '../src/repositories/kids-account.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import {
  rotaBloqueadaParaKids,
  PERMISSOES_PADRAO,
  validarCredenciais,
  idadeEmAnos,
  derivarHashSenha,
} from '../src/domain/kids-account';

function servico() {
  return new KidsAccountService(new PersistentKidsAccountRepository(new MemoryStorageAdapter()));
}

const PEDIDO = {
  responsavelUserId: 'usr_adulto_1',
  nomeExibicao: 'Criança Teste',
  dataNascimento: '2017-05-10',
  nomeUsuario: 'crianca.teste',
  senha: 'violino2026',
};

describe('Criação da conta infantil', () => {
  let svc: KidsAccountService;

  beforeEach(() => {
    svc = servico();
  });

  it('a criança nasce atada a um responsável', async () => {
    const perfil = await svc.criarPerfilInfantil(PEDIDO);
    expect(perfil.responsavelUserId).toBe('usr_adulto_1');
    expect(perfil.userId).toMatch(/^usr_kid_/);
  });

  it('a conta adulta nasce GERENCIAL quando ainda não existia', async () => {
    // Quem chega para criar um perfil de criança não veio montar o próprio
    // perfil de músico. A conta existe para tutelar, e só.
    await svc.criarPerfilInfantil(PEDIDO);
    expect(await svc.modalidadeDaConta('usr_adulto_1')).toBe('GERENCIAL');
  });

  it('a conta gerencial pode virar perfil completo depois', async () => {
    await svc.criarPerfilInfantil(PEDIDO);
    await svc.abrirPerfilCompleto('usr_adulto_1');
    expect(await svc.modalidadeDaConta('usr_adulto_1')).toBe('COMPLETA');
  });

  it('a senha nunca é guardada em texto', async () => {
    const perfil = await svc.criarPerfilInfantil(PEDIDO);
    const serializado = JSON.stringify(perfil);
    expect(serializado).not.toContain('violino2026');
    expect(perfil.credenciais.hashSenha).toMatch(/^[0-9a-f]{64}$/);
    expect(perfil.credenciais.saltSenha).toMatch(/^[0-9a-f]{32}$/);
  });

  it('duas crianças não compartilham nome de usuário', async () => {
    await svc.criarPerfilInfantil(PEDIDO);
    await expect(
      svc.criarPerfilInfantil({ ...PEDIDO, responsavelUserId: 'usr_adulto_2' })
    ).rejects.toThrow(/já está em uso/i);
  });

  it('recusa data de nascimento de pessoa maior de idade', async () => {
    await expect(
      svc.criarPerfilInfantil({ ...PEDIDO, dataNascimento: '1990-01-01' })
    ).rejects.toThrow(/maior de idade/i);
  });

  it('nasce com todas as permissões sociais fechadas', async () => {
    // O padrão contrário — nascer aberto e depender de alguém lembrar de
    // fechar — transferiria para o descuido uma decisão sobre uma criança.
    const perfil = await svc.criarPerfilInfantil(PEDIDO);
    expect(perfil.permissoes.enviarPedidoConexao.permitido).toBe(false);
    expect(perfil.permissoes.receberPedidoConexao.permitido).toBe(false);
    expect(perfil.permissoes.entrarEmSalas.permitido).toBe(false);
    expect(perfil.permissoes.publicarNaComunidade.permitido).toBe(false);
  });
});

describe('Credenciais', () => {
  it('exige nome de usuário utilizável e senha de 8 caracteres', () => {
    expect(validarCredenciais('ab', 'violino2026')).toHaveLength(1);
    expect(validarCredenciais('nome valido', 'violino2026')).toHaveLength(1);
    expect(validarCredenciais('nome.valido', 'curta')).toHaveLength(1);
    expect(validarCredenciais('nome.valido', 'violino2026')).toEqual([]);
  });

  it('recusa senha que contenha o nome de usuário', () => {
    const problemas = validarCredenciais('joaozinho', 'joaozinho123');
    expect(problemas.some((p) => p.campo === 'senha')).toBe(true);
  });

  it('autentica com a senha certa e recusa a errada', async () => {
    const svc = servico();
    await svc.criarPerfilInfantil(PEDIDO);

    expect(await svc.autenticarCrianca('crianca.teste', 'violino2026')).not.toBeNull();
    expect(await svc.autenticarCrianca('crianca.teste', 'violino2027')).toBeNull();
  });

  it('usuário inexistente e senha errada dão a mesma resposta', async () => {
    // Respostas diferentes contariam a um estranho quais nomes de usuário de
    // criança existem na plataforma.
    const svc = servico();
    await svc.criarPerfilInfantil(PEDIDO);

    expect(await svc.autenticarCrianca('nao.existe', 'qualquer.senha')).toBeNull();
    expect(await svc.autenticarCrianca('crianca.teste', 'senha.errada')).toBeNull();
  });

  it('o mesmo salt reproduz o mesmo hash; salts diferentes, não', async () => {
    const a = await derivarHashSenha('violino2026');
    const b = await derivarHashSenha('violino2026', a.salt);
    const c = await derivarHashSenha('violino2026');

    expect(b.hash).toBe(a.hash);
    expect(c.hash).not.toBe(a.hash);
  });

  it('trocar a senha invalida a anterior', async () => {
    const svc = servico();
    const perfil = await svc.criarPerfilInfantil(PEDIDO);
    await svc.trocarSenha(perfil.userId, 'novaSenhaSegura');

    expect(await svc.autenticarCrianca('crianca.teste', 'violino2026')).toBeNull();
    expect(await svc.autenticarCrianca('crianca.teste', 'novaSenhaSegura')).not.toBeNull();
  });
});

describe('Ações sociais passam pelo responsável', () => {
  let svc: KidsAccountService;
  let criancaId: string;

  beforeEach(async () => {
    svc = servico();
    criancaId = (await svc.criarPerfilInfantil(PEDIDO)).userId;
  });

  it('permissão desligada bloqueia sem criar solicitação', async () => {
    const r = await svc.solicitarAcao(criancaId, 'CONEXAO_ENVIAR', 'Conectar com alguém');
    expect(r.desfecho).toBe('BLOQUEADA');
    expect(await svc.listarSolicitacoes('usr_adulto_1')).toEqual([]);
  });

  it('permitido com confirmação vira solicitação pendente', async () => {
    const perfil = (await svc.buscarPerfil(criancaId))!;
    await svc.atualizarPermissoes(criancaId, {
      ...perfil.permissoes,
      entrarEmSalas: { permitido: true, exigeConfirmacao: true },
    });

    const r = await svc.solicitarAcao(criancaId, 'SALA_ENTRAR', 'Entrar na sala Violino Iniciante', {
      sala: 'Violino Iniciante',
      conduzidaPor: 'Professor Convidado',
    });

    expect(r.desfecho).toBe('AGUARDA_RESPONSAVEL');
    const pendentes = await svc.listarSolicitacoes('usr_adulto_1');
    expect(pendentes).toHaveLength(1);
    expect(pendentes[0].situacao).toBe('PENDENTE');
    // O responsável decide com contexto, não com um "permitir/negar" seco.
    expect(pendentes[0].detalhes.conduzidaPor).toBe('Professor Convidado');
  });

  it('permitido sem confirmação passa direto', async () => {
    const perfil = (await svc.buscarPerfil(criancaId))!;
    await svc.atualizarPermissoes(criancaId, {
      ...perfil.permissoes,
      entrarEmSalas: { permitido: true, exigeConfirmacao: false },
    });

    const r = await svc.solicitarAcao(criancaId, 'SALA_ENTRAR', 'Entrar numa sala');
    expect(r.desfecho).toBe('PERMITIDA');
    expect(await svc.listarSolicitacoes('usr_adulto_1')).toEqual([]);
  });

  it('a solicitação chega ao responsável certo, e não a outro', async () => {
    const outro = await svc.criarPerfilInfantil({
      ...PEDIDO,
      responsavelUserId: 'usr_adulto_2',
      nomeUsuario: 'outra.crianca',
    });
    const perfilOutro = (await svc.buscarPerfil(outro.userId))!;
    await svc.atualizarPermissoes(outro.userId, {
      ...perfilOutro.permissoes,
      entrarEmSalas: { permitido: true, exigeConfirmacao: true },
    });
    await svc.solicitarAcao(outro.userId, 'SALA_ENTRAR', 'Entrar numa sala');

    expect(await svc.listarSolicitacoes('usr_adulto_1')).toEqual([]);
    expect(await svc.listarSolicitacoes('usr_adulto_2')).toHaveLength(1);
  });

  it('aprovar e recusar registram a decisão', async () => {
    const perfil = (await svc.buscarPerfil(criancaId))!;
    await svc.atualizarPermissoes(criancaId, {
      ...perfil.permissoes,
      publicarNaComunidade: { permitido: true, exigeConfirmacao: true },
    });

    const r1 = await svc.solicitarAcao(criancaId, 'COMUNIDADE_PUBLICAR', 'Publicar');
    const r2 = await svc.solicitarAcao(criancaId, 'COMUNIDADE_PUBLICAR', 'Publicar outra');
    if (r1.desfecho !== 'AGUARDA_RESPONSAVEL' || r2.desfecho !== 'AGUARDA_RESPONSAVEL') {
      throw new Error('esperava solicitações pendentes');
    }

    await svc.decidirSolicitacao(r1.solicitacao.id, true);
    await svc.decidirSolicitacao(r2.solicitacao.id, false, 'Vamos conversar sobre isso antes.');

    const todas = await svc.listarSolicitacoes('usr_adulto_1');
    const aprovada = todas.find((s) => s.id === r1.solicitacao.id)!;
    const recusada = todas.find((s) => s.id === r2.solicitacao.id)!;

    expect(aprovada.situacao).toBe('APROVADA');
    expect(recusada.situacao).toBe('RECUSADA');
    expect(recusada.motivoRecusa).toContain('conversar');
  });

  it('solicitação já decidida não se redecide', async () => {
    const perfil = (await svc.buscarPerfil(criancaId))!;
    await svc.atualizarPermissoes(criancaId, {
      ...perfil.permissoes,
      enviarPedidoConexao: { permitido: true, exigeConfirmacao: true },
    });
    const r = await svc.solicitarAcao(criancaId, 'CONEXAO_ENVIAR', 'Conectar');
    if (r.desfecho !== 'AGUARDA_RESPONSAVEL') throw new Error('esperava pendente');

    await svc.decidirSolicitacao(r.solicitacao.id, false, 'Não.');
    const segunda = await svc.decidirSolicitacao(r.solicitacao.id, true);

    expect(segunda?.situacao).toBe('RECUSADA');
  });

  it('as pendentes aparecem antes das já decididas', async () => {
    const perfil = (await svc.buscarPerfil(criancaId))!;
    await svc.atualizarPermissoes(criancaId, {
      ...perfil.permissoes,
      enviarPedidoConexao: { permitido: true, exigeConfirmacao: true },
    });
    const antiga = await svc.solicitarAcao(criancaId, 'CONEXAO_ENVIAR', 'Primeira');
    if (antiga.desfecho !== 'AGUARDA_RESPONSAVEL') throw new Error('esperava pendente');
    await svc.decidirSolicitacao(antiga.solicitacao.id, true);
    await svc.solicitarAcao(criancaId, 'CONEXAO_ENVIAR', 'Segunda');

    const lista = await svc.listarSolicitacoes('usr_adulto_1');
    expect(lista[0].situacao).toBe('PENDENTE');
  });
});

describe('A criança não alcança perfil de ninguém', () => {
  it('bloqueia o perfil de terceiros e o diretório', () => {
    expect(rotaBloqueadaParaKids('/profile/usr_qualquer')).toBe(true);
    expect(rotaBloqueadaParaKids('/profile/network')).toBe(true);
  });

  it('bloqueia comunidade, salas, estúdio e administração', () => {
    expect(rotaBloqueadaParaKids('/community')).toBe(true);
    expect(rotaBloqueadaParaKids('/community/feed')).toBe(true);
    expect(rotaBloqueadaParaKids('/rooms')).toBe(true);
    expect(rotaBloqueadaParaKids('/rooms/sala-1')).toBe(true);
    expect(rotaBloqueadaParaKids('/studio')).toBe(true);
    expect(rotaBloqueadaParaKids('/admin')).toBe(true);
    expect(rotaBloqueadaParaKids('/admin/credentials')).toBe(true);
  });

  it('o próprio perfil da criança continua aberto', () => {
    expect(rotaBloqueadaParaKids('/profile')).toBe(false);
    expect(rotaBloqueadaParaKids('/profile/edit')).toBe(false);
  });

  it('a Academia e a Prática continuam abertas', () => {
    // Restringir o social não significa restringir o estudo.
    expect(rotaBloqueadaParaKids('/academy')).toBe(false);
    expect(rotaBloqueadaParaKids('/academy/course/crs_1')).toBe(false);
    expect(rotaBloqueadaParaKids('/practice')).toBe(false);
    expect(rotaBloqueadaParaKids('/practice/skill-tree')).toBe(false);
  });

  it('um link colado de fora encontra o mesmo bloqueio', () => {
    // A checagem é na navegação, não num botão escondido — então um endereço
    // recebido por fora não contorna nada.
    expect(rotaBloqueadaParaKids('/profile/usr_desconhecido_vindo_de_fora')).toBe(true);
  });
});

describe('Idade', () => {
  it('calcula considerando o aniversário do ano corrente', () => {
    expect(idadeEmAnos('2017-05-10', new Date('2026-05-09'))).toBe(8);
    expect(idadeEmAnos('2017-05-10', new Date('2026-05-10'))).toBe(9);
  });

  it('data inválida não quebra o cálculo', () => {
    expect(idadeEmAnos('não é data')).toBe(0);
  });
});

describe('Padrões documentados', () => {
  it('o limite diário de estudo vem preenchido', () => {
    expect(PERMISSOES_PADRAO.limiteDiarioMinutos).toBeGreaterThan(0);
  });
});
