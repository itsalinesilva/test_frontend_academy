import { describe, it, expect, beforeEach } from 'vitest';
import { CredentialService } from '../src/services/application/credential.service';
import { PersistentCredentialRepository } from '../src/repositories/credential.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import {
  validarTemplate,
  gerarCodigoVerificacao,
  codigoEhValido,
  TemplateCredencial,
  CANVAS,
} from '../src/domain/credential-design';
import { TEMPLATES_PADRAO } from '../src/data/seed-credential-templates';
import { RESSALVA_CURSO_LIVRE } from '../src/domain/credential-design';

function servico() {
  return new CredentialService(new PersistentCredentialRepository(new MemoryStorageAdapter()));
}

const DADOS = {
  nomeTitular: 'Pessoa Titular',
  tituloDocumento: 'Harmonia Funcional',
  nomeCurso: 'Harmonia Funcional e Condução de Vozes',
  descricao: 'concluiu o programa com aproveitamento.',
  cargaHoraria: '180 horas',
  dataEmissao: '17 de setembro de 2026',
  nomeInstituicao: 'Academia Musical Digital',
};

describe('Matrizes de fábrica', () => {
  it('as três matrizes padrão são estruturalmente válidas', () => {
    for (const template of TEMPLATES_PADRAO) {
      const wrong = validarTemplate(template).filter((p) => p.gravidade === 'erro');
      expect(wrong, `${template.nome}: ${wrong.map((e) => e.mensagem).join(' ')}`).toEqual([]);
    }
  });

  it('nenhum elemento das matrizes padrão sai da área do documento', () => {
    // Um elemento fora da área é um documento cortado na impressão.
    for (const template of TEMPLATES_PADRAO) {
      const canvas = CANVAS[template.tipo];
      for (const el of template.elementos) {
        if (el.kind === 'MOLDURA') continue;
        expect(el.caixa.x, `${template.nome}/${el.id}`).toBeGreaterThanOrEqual(0);
        expect(el.caixa.y, `${template.nome}/${el.id}`).toBeGreaterThanOrEqual(0);
        expect(el.caixa.x + el.caixa.largura).toBeLessThanOrEqual(canvas.largura);
        expect(el.caixa.y + el.caixa.altura).toBeLessThanOrEqual(canvas.altura);
      }
    }
  });

  it('certificado e credencial levam QR; o badge não precisa', () => {
    const temQr = (t: TemplateCredencial) => t.elementos.some((e) => e.kind === 'QRCODE');
    expect(temQr(TEMPLATES_PADRAO.find((t) => t.tipo === 'CERTIFICADO')!)).toBe(true);
    expect(temQr(TEMPLATES_PADRAO.find((t) => t.tipo === 'CREDENCIAL')!)).toBe(true);
  });
});

describe('Validação da matriz', () => {
  it('acusa a falta de um campo obrigatório', () => {
    const base = TEMPLATES_PADRAO.find((t) => t.tipo === 'CERTIFICADO')!;
    const semTitular: TemplateCredencial = {
      ...base,
      elementos: base.elementos.filter((e) => !(e.kind === 'CAMPO' && e.campo === 'nomeTitular')),
    };
    const wrong = validarTemplate(semTitular).filter((p) => p.gravidade === 'erro');
    expect(wrong).toHaveLength(1);
    expect(wrong[0].mensagem).toContain('Nome de quem recebe');
  });

  it('o certificado aceita identificar a conquista por título OU por curso', () => {
    const base = TEMPLATES_PADRAO.find((t) => t.tipo === 'CERTIFICADO')!;
    // A matriz clássica usa o nome do curso; exigir também um título próprio
    // obrigaria a repetir a mesma informação no papel.
    expect(validarTemplate(base).filter((p) => p.gravidade === 'erro')).toEqual([]);

    const semNenhum: TemplateCredencial = {
      ...base,
      elementos: base.elementos.filter(
        (e) => !(e.kind === 'CAMPO' && (e.campo === 'nomeCurso' || e.campo === 'tituloDocumento'))
      ),
    };
    const wrong = validarTemplate(semNenhum).filter((p) => p.gravidade === 'erro');
    expect(wrong.some((e) => e.mensagem.includes('identificar a conquista'))).toBe(true);
  });

  it('acusa elemento que sai da área do documento', () => {
    const base = TEMPLATES_PADRAO.find((t) => t.tipo === 'BADGE')!;
    const vazando: TemplateCredencial = {
      ...base,
      elementos: base.elementos.map((e) =>
        e.kind === 'CAMPO' && e.id === 'titulo'
          ? { ...e, caixa: { ...e.caixa, x: 480, largura: 300 } }
          : e
      ),
    };
    const wrong = validarTemplate(vazando).filter((p) => p.gravidade === 'erro');
    expect(wrong.some((e) => e.elementoId === 'titulo')).toBe(true);
  });

  it('avisa (sem bloquear) quando falta QR num documento imprimível', () => {
    const base = TEMPLATES_PADRAO.find((t) => t.tipo === 'CERTIFICADO')!;
    const semQr: TemplateCredencial = {
      ...base,
      elementos: base.elementos.filter((e) => e.kind !== 'QRCODE'),
    };
    const problemas = validarTemplate(semQr);
    expect(problemas.some((p) => p.gravidade === 'aviso')).toBe(true);
    expect(problemas.some((p) => p.gravidade === 'erro')).toBe(false);
  });

  it('o serviço recusa salvar uma matriz com erro estrutural', async () => {
    const svc = servico();
    const base = TEMPLATES_PADRAO.find((t) => t.tipo === 'CERTIFICADO')!;
    const quebrada: TemplateCredencial = {
      ...base,
      id: 'tpl_quebrada',
      ehPadrao: false,
      elementos: base.elementos.filter((e) => !(e.kind === 'CAMPO' && e.campo === 'nomeTitular')),
    };
    await expect(svc.salvarTemplate(quebrada)).rejects.toThrow(/inválido/i);
  });
});

describe('Código de verificação', () => {
  it('sai no formato esperado e passa na própria validação', () => {
    for (let i = 0; i < 40; i++) {
      expect(codigoEhValido(gerarCodigoVerificacao())).toBe(true);
    }
  });

  it('não usa caracteres que se confundem ao ler de um papel', () => {
    // 0/O, 1/I/L, 5/S, 2/Z, 8/B são o motivo de metade dos códigos digitados
    // errado. Nenhum deles aparece.
    const amostra = Array.from({ length: 200 }, () => gerarCodigoVerificacao()).join('');
    const corpo = amostra.replace(/CMU|-/g, '');
    for (const proibido of ['0', 'O', '1', 'I', 'L', '5', 'S', '2', 'Z', '8', 'B']) {
      expect(corpo, `caractere ambíguo "${proibido}"`).not.toContain(proibido);
    }
  });

  it('não repete em 500 emissões', () => {
    const codigos = new Set(Array.from({ length: 500 }, () => gerarCodigoVerificacao()));
    expect(codigos.size).toBe(500);
  });
});

describe('Emissão e verificação', () => {
  let svc: CredentialService;

  beforeEach(() => {
    svc = servico();
  });

  it('emite, registra e verifica como válido', async () => {
    const c = await svc.emitir({
      templateId: 'tpl_certificado_classico',
      userId: 'usr_1',
      dados: DADOS,
    });

    expect(codigoEhValido(c.codigo)).toBe(true);
    expect(c.sha256Hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(c.dados.urlVerificacao).toContain(c.codigo);

    const resultado = await svc.verificar(c.codigo);
    expect(resultado.situacao).toBe('VALIDA');
  });

  it('o código é encontrado independentemente de caixa e espaços', async () => {
    const c = await svc.emitir({ templateId: 'tpl_badge_selo', userId: 'usr_1', dados: DADOS });
    expect((await svc.verificar(c.codigo.toLowerCase())).situacao).toBe('VALIDA');
    expect((await svc.verificar(`  ${c.codigo}  `)).situacao).toBe('VALIDA');
  });

  it('código inexistente devolve NAO_ENCONTRADA, e não um erro', async () => {
    expect((await svc.verificar('CMU-XXXX-XXXX')).situacao).toBe('NAO_ENCONTRADA');
  });

  it('detecta adulteração do conteúdo registrado', async () => {
    const repo = new PersistentCredentialRepository(new MemoryStorageAdapter());
    const local = new CredentialService(repo);
    const c = await local.emitir({
      templateId: 'tpl_certificado_classico',
      userId: 'usr_1',
      dados: DADOS,
    });

    // Alguém edita o armazenamento e promove a carga horária.
    await repo.salvarEmitida({
      ...c,
      dados: { ...c.dados, cargaHoraria: '1800 horas' },
    });

    const resultado = await local.verificar(c.codigo);
    expect(resultado.situacao).toBe('ADULTERADA');
  });

  it('adulteração tem precedência sobre revogação e validade', async () => {
    // Um documento cujo conteúdo não confere não deve ser descrito como
    // "apenas expirado" — isso soaria como problema burocrático.
    const repo = new PersistentCredentialRepository(new MemoryStorageAdapter());
    const local = new CredentialService(repo);
    const c = await local.emitir({
      templateId: 'tpl_credencial_cartao',
      userId: 'usr_1',
      dados: { ...DADOS, dataValidade: '2020-01-01' },
    });
    await repo.salvarEmitida({
      ...c,
      revogadaEm: new Date().toISOString(),
      dados: { ...c.dados, nomeTitular: 'Outra Pessoa' },
    });

    expect((await local.verificar(c.codigo)).situacao).toBe('ADULTERADA');
  });

  it('reconhece documento revogado', async () => {
    const c = await svc.emitir({ templateId: 'tpl_credencial_cartao', userId: 'usr_1', dados: DADOS });
    await svc.revogar(c.codigo, 'Emitida por engano para a turma errada.');

    const resultado = await svc.verificar(c.codigo);
    expect(resultado.situacao).toBe('REVOGADA');
    expect(resultado.situacao === 'REVOGADA' && resultado.credencial.motivoRevogacao).toContain('engano');
  });

  it('reconhece documento fora da validade', async () => {
    const c = await svc.emitir({
      templateId: 'tpl_credencial_cartao',
      userId: 'usr_1',
      dados: { ...DADOS, dataValidade: '2020-01-01' },
    });
    expect((await svc.verificar(c.codigo)).situacao).toBe('EXPIRADA');
  });

  it('data de validade ilegível não derruba a verificação', async () => {
    const c = await svc.emitir({
      templateId: 'tpl_credencial_cartao',
      userId: 'usr_1',
      dados: { ...DADOS, dataValidade: 'enquanto durar o vínculo' },
    });
    expect((await svc.verificar(c.codigo)).situacao).toBe('VALIDA');
  });
});

describe('O desenho vai congelado com o documento', () => {
  it('editar a matriz depois NÃO altera o que já foi emitido', async () => {
    const svc = servico();
    const emitida = await svc.emitir({
      templateId: 'tpl_certificado_classico',
      userId: 'usr_1',
      dados: DADOS,
    });
    const corOriginal = emitida.templateSnapshot.tokens.corPrimaria;

    // A fundadora decide a identidade visual e muda a marca.
    const copia = await svc.duplicarTemplate('tpl_certificado_classico', 'Certificado v2');
    await svc.salvarTemplate({
      ...copia,
      tokens: { ...copia.tokens, corPrimaria: '#0f766e' },
    });
    const original = (await svc.buscarTemplate('tpl_certificado_classico'))!;
    await svc.salvarTemplate({ ...original, tokens: { ...original.tokens, corPrimaria: '#0f766e' } });

    const verificada = await svc.verificar(emitida.codigo);
    expect(verificada.situacao).toBe('VALIDA');
    expect(
      verificada.situacao === 'VALIDA' && verificada.credencial.templateSnapshot.tokens.corPrimaria
    ).toBe(corOriginal);
  });

  it('a mudança de desenho não conta como adulteração', async () => {
    // O hash cobre o que o documento afirma, não a espessura da moldura.
    const svc = servico();
    const emitida = await svc.emitir({
      templateId: 'tpl_badge_selo',
      userId: 'usr_1',
      dados: DADOS,
    });
    const t = (await svc.buscarTemplate('tpl_badge_selo'))!;
    await svc.salvarTemplate({ ...t, tokens: { ...t.tokens, espessuraMoldura: 9 } });

    expect((await svc.verificar(emitida.codigo)).situacao).toBe('VALIDA');
  });
});

describe('Ciclo de vida das matrizes', () => {
  it('matriz de fábrica não pode ser apagada', async () => {
    const svc = servico();
    expect(await svc.excluirTemplate('tpl_certificado_classico')).toBe(false);
    expect(await svc.buscarTemplate('tpl_certificado_classico')).not.toBeNull();
  });

  it('a cópia de uma matriz de fábrica é editável e apagável', async () => {
    const svc = servico();
    const copia = await svc.duplicarTemplate('tpl_certificado_classico');
    expect(copia.ehPadrao).toBe(false);
    expect(copia.id).not.toBe('tpl_certificado_classico');
    expect(await svc.excluirTemplate(copia.id)).toBe(true);
  });

  it('uma matriz nova nasce já válida, pronta para emitir', async () => {
    const svc = servico();
    for (const tipo of ['CERTIFICADO', 'CREDENCIAL', 'BADGE'] as const) {
      const nova = svc.criarTemplateVazio(tipo, `Teste ${tipo}`);
      const wrong = validarTemplate(nova).filter((p) => p.gravidade === 'erro');
      expect(wrong, `${tipo}: ${wrong.map((e) => e.mensagem).join(' ')}`).toEqual([]);
    }
  });

  it('listar devolve certificados, credenciais e badges nessa ordem', async () => {
    const svc = servico();
    const tipos = (await svc.listarTemplates()).map((t) => t.tipo);
    expect(tipos.indexOf('CERTIFICADO')).toBeLessThan(tipos.indexOf('CREDENCIAL'));
    expect(tipos.indexOf('CREDENCIAL')).toBeLessThan(tipos.indexOf('BADGE'));
  });
});

describe('Ressalva de curso livre', () => {
  it('diz o que o documento é, sem eufemismo', () => {
    // Quem recebe o certificado pode apresentá-lo a um empregador ou a uma
    // secretaria. Essas pessoas precisam saber o que estão lendo sem ter de
    // perguntar — e um certificado que se deixa confundir com diploma
    // reconhecido prejudica primeiro quem o recebeu.
    expect(RESSALVA_CURSO_LIVRE).toContain('Curso livre');
    expect(RESSALVA_CURSO_LIVRE).toContain('MEC');
    expect(RESSALVA_CURSO_LIVRE).toContain('Conservatório Muscicapa');
  });

  it('nenhuma matriz de fábrica a declara como elemento editável', () => {
    // Ela é desenhada pelo componente, fora do template. Se estivesse no
    // template, bastaria apagar o elemento — ou criar uma matriz nova — para
    // o certificado sair sem a ressalva.
    for (const t of TEMPLATES_PADRAO) {
      const textos = t.elementos
        .filter((e) => e.kind === 'TEXTO_FIXO')
        .map((e) => (e.kind === 'TEXTO_FIXO' ? e.texto : ''));
      expect(textos).not.toContain(RESSALVA_CURSO_LIVRE);
    }
  });

  it('as matrizes deixam o rodapé livre para ela', () => {
    for (const t of TEMPLATES_PADRAO) {
      if (t.tipo === 'BADGE') continue;
      const canvas = CANVAS[t.tipo];
      for (const el of t.elementos) {
        if (el.kind === 'MOLDURA' || el.kind === 'QRCODE') continue;
        expect(
          el.caixa.y + el.caixa.altura,
          `${t.nome}/${el.id} invade a faixa da ressalva`
        ).toBeLessThanOrEqual(canvas.altura - 22);
      }
    }
  });
});
