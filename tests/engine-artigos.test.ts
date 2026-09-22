import { describe, it, expect, beforeEach } from 'vitest';
import { EditorialService } from '../src/services/application/editorial.service';
import { EditorialRepository } from '../src/repositories/editorial.repository';
import { EditorialEdit, EditorialLesson } from '../src/domain/editorial-edit';
import {
  EdicaoDeArtigo,
  TIPOS_DE_ARTIGO,
  aplicarEdicoesDeArtigos,
  artigoEmBranco,
  idDaEdicaoDeArtigo,
  problemasDoArtigo,
  rodapeDoArtigo,
} from '../src/domain/editorial-artigo';
import { ArtigoDoConservatorio } from '../src/domain/article';
import { SEED_ARTICLES } from '../src/data/seed-articles';
import { VERSAO_DO_PACOTE } from '../src/domain/pacote-editorial';

/**
 * A ENGINE EDITORIAL DOS ARTIGOS.
 *
 * 🔴 O MESMO DEFEITO DAS LIÇÕES, NO OUTRO CANTO DA CASA
 * -----------------------------------------------------
 * Os artigos vivem em `src/data/seed-articles.ts`, compilados no pacote.
 * Corrigir uma vírgula num artigo publicado exigia mudar o código e publicar de
 * novo — e quem revisa texto não é quem publica código.
 *
 * O QUE ESTES CASOS GUARDAM QUE OS DA LIÇÃO NÃO GUARDAM
 * -----------------------------------------------------
 * Artigo sai **assinado e datado**. Um resumo vazio ou uma citação sem motivo
 * entra na biblioteca com o nome de alguém embaixo, e quem gravou já saiu
 * quando alguém percebe. Por isso a validação aqui é mais dura que a dos
 * blocos de lição.
 */

class RepoDeMemoria implements EditorialRepository {
  public edicoes: EditorialEdit[] = [];
  public licoes: EditorialLesson[] = [];
  public arts: EdicaoDeArtigo[] = [];

  async todas() {
    return this.edicoes;
  }
  async daLicao(id: string) {
    return this.edicoes.filter((e) => e.lessonId === id);
  }
  async salvar(e: EditorialEdit) {
    this.edicoes.push(e);
    return e;
  }
  async reverter(id: string) {
    this.edicoes = this.edicoes.filter((e) => e.id !== id);
  }
  async historico() {
    return this.edicoes;
  }
  async licoesCriadas() {
    return this.licoes;
  }
  async salvarLicaoCriada(l: EditorialLesson) {
    this.licoes.push(l);
    return l;
  }
  async removerLicaoCriada(id: string) {
    this.licoes = this.licoes.filter((l) => l.id !== id);
  }
  async artigos() {
    return this.arts;
  }
  async salvarArtigo(a: EdicaoDeArtigo) {
    const i = this.arts.findIndex((x) => x.id === a.id);
    const anterior = i >= 0 ? this.arts[i].anterior : a.anterior;
    const gravada = { ...a, anterior };
    if (i >= 0) this.arts[i] = gravada;
    else this.arts.push(gravada);
    return gravada;
  }
  async removerArtigo(artigoId: string) {
    this.arts = this.arts.filter((a) => a.artigoId !== artigoId);
  }
  async substituirTudo(e: {
    edicoes: EditorialEdit[];
    licoesCriadas: EditorialLesson[];
    artigos: EdicaoDeArtigo[];
  }) {
    this.edicoes = e.edicoes;
    this.licoes = e.licoesCriadas;
    this.arts = e.artigos;
  }
}

const bom = (): ArtigoDoConservatorio => ({
  id: 'art_teste',
  tipo: 'ENSAIO',
  titulo: 'O contraponto no Brasil',
  subtitulo: 'Uma leitura das fontes do século XIX',
  resumo:
    'O contraponto brasileiro do século XIX não é imitação europeia: ele resolve problemas próprios, e este artigo mostra quais.',
  autoria: 'Aline Alves Silva',
  instituicao: 'Conservatório Muscicapa',
  secoes: [
    { id: 's1', titulo: 'O ponto de partida', markdown: 'Texto da primeira seção.', ordem: 1 },
    { id: 's2', titulo: 'As fontes', markdown: 'Texto da segunda seção.', ordem: 2 },
  ],
  obras: [{ obraId: 'obra_1', motivo: 'Abre a série de estudos de contraponto do período.' }],
  pessoas: [
    { pessoaId: 'p1', motivo: 'Compôs a maior parte do repertório examinado aqui.', papel: 'COMPOSITOR' },
  ],
  coletaneas: [{ coletaneaId: 'c1', motivo: 'Reúne as peças citadas na segunda seção.' }],
  etiquetas: ['brasil', 'século XIX'],
  publicadoEm: '2026-03-01T00:00:00.000Z',
  atualizadoEm: '2026-03-01T00:00:00.000Z',
});

let repo: RepoDeMemoria;
let servico: EditorialService;

beforeEach(() => {
  repo = new RepoDeMemoria();
  servico = new EditorialService(repo);
});

describe('🔴 a validação é mais dura aqui — o artigo sai assinado', () => {
  it('um artigo completo passa sem reclamação', () => {
    expect(problemasDoArtigo(bom())).toEqual([]);
  });

  it('cabeçalho incompleto é recusado, campo a campo', () => {
    expect(problemasDoArtigo({ ...bom(), titulo: ' ' }).join(' ')).toMatch(/sem título/i);
    expect(problemasDoArtigo({ ...bom(), subtitulo: '' }).join(' ')).toMatch(/sem subtítulo/i);
    expect(problemasDoArtigo({ ...bom(), autoria: '' }).join(' ')).toMatch(/assinad/i);
    expect(problemasDoArtigo({ ...bom(), instituicao: '' }).join(' ')).toMatch(/instituição/i);
  });

  it('🔴 resumo curto é recusado — ele é o que decide se alguém abre', () => {
    /**
     * O resumo diz o que o artigo **conclui**, e não o que ele vai discutir.
     * Uma linha de dez palavras não consegue fazer isso.
     */
    const r = problemasDoArtigo({ ...bom(), resumo: 'Fala do contraponto.' });
    expect(r.join(' ')).toMatch(/curto demais/i);
  });

  it('data de publicação que não é data é recusada', () => {
    expect(problemasDoArtigo({ ...bom(), publicadoEm: 'ontem' }).join(' ')).toMatch(/data/i);
  });

  it('artigo sem seção, ou com seção vazia, é recusado', () => {
    expect(problemasDoArtigo({ ...bom(), secoes: [] }).join(' ')).toMatch(/nenhuma seção/i);

    const comVazia = {
      ...bom(),
      secoes: [{ id: 's1', titulo: 'Título', markdown: '   ', ordem: 1 }],
    };
    expect(problemasDoArtigo(comVazia).join(' ')).toMatch(/está vazia/i);
  });

  it('duas seções com a mesma ordem são recusadas', () => {
    /** Ordem repetida faz duas seções disputarem a mesma posição. */
    const a = {
      ...bom(),
      secoes: [
        { id: 's1', titulo: 'A', markdown: 'x', ordem: 1 },
        { id: 's2', titulo: 'B', markdown: 'y', ordem: 1 },
      ],
    };
    expect(problemasDoArtigo(a).join(' ')).toMatch(/mesma ordem/i);
  });

  it('🔴 citação sem MOTIVO é recusada, nos três tipos', () => {
    /**
     * Uma lista de obras sem justificativa é uma lista de opiniões escondidas:
     * quem lê não sabe se a peça está ali por ser representativa ou porque
     * alguém gostou dela.
     */
    expect(
      problemasDoArtigo({ ...bom(), obras: [{ obraId: 'o', motivo: 'boa' }] }).join(' ')
    ).toMatch(/sem dizer por quê/i);

    expect(
      problemasDoArtigo({ ...bom(), pessoas: [{ pessoaId: 'p', motivo: '' }] }).join(' ')
    ).toMatch(/sem dizer por quê/i);

    expect(
      problemasDoArtigo({ ...bom(), coletaneas: [{ coletaneaId: 'c', motivo: 'ok' }] }).join(' ')
    ).toMatch(/sem dizer por quê/i);
  });

  it('a mesma obra citada duas vezes é recusada', () => {
    const a = {
      ...bom(),
      obras: [
        { obraId: 'x', motivo: 'Abre a série de estudos do período examinado.' },
        { obraId: 'x', motivo: 'Fecha a série de estudos do período examinado.' },
      ],
    };
    expect(problemasDoArtigo(a).join(' ')).toMatch(/duas vezes/i);
  });

  it('🔴 obra que não existe no acervo é recusada', () => {
    /**
     * Artigo que aponta para obra inexistente é um percurso que não se pode
     * percorrer — e quem lê descobre isso no meio do caminho.
     */
    const r = problemasDoArtigo(bom(), new Set(['outra_obra']));
    expect(r.join(' ')).toMatch(/não existe no acervo/i);
  });

  it('sem o acervo em mãos, a conferência de existência NÃO é feita — e não finge', () => {
    /** Fingir que conferiu seria pior: daria verde a um percurso quebrado. */
    expect(problemasDoArtigo(bom())).toEqual([]);
    expect(problemasDoArtigo(bom(), new Set(['obra_1']))).toEqual([]);
  });
});

describe('a camada entra sobre os artigos publicados', () => {
  it('corrigir um artigo troca o que se lê, sem mexer nos outros', async () => {
    const publicados = SEED_ARTICLES.slice(0, 3);
    const alvo = publicados[0];

    await servico.salvarArtigo({
      artigo: { ...alvo, titulo: 'TÍTULO CORRIGIDO' },
      publicado: alvo,
      editadaPor: 'Aline',
    });

    const lidos = await servico.artigosComEdicoes(publicados);

    expect(lidos.length, 'a correção mudou a quantidade de artigos').toBe(publicados.length);
    expect(lidos[0].titulo).toBe('TÍTULO CORRIGIDO');
    expect(lidos[1].titulo, 'a correção vazou para outro artigo').toBe(publicados[1].titulo);
  });

  it('artigo escrito do zero ENTRA na listagem', async () => {
    const publicados = SEED_ARTICLES.slice(0, 2);

    await servico.salvarArtigo({ artigo: bom(), publicado: null, editadaPor: 'Aline' });

    const lidos = await servico.artigosComEdicoes(publicados);

    expect(lidos.length).toBe(publicados.length + 1);
    expect(lidos.some((a) => a.id === 'art_teste')).toBe(true);
  });

  it('o artigo criado é marcado como criado — e o corrigido, não', async () => {
    /**
     * A diferença decide o que "remover" significa: reverter um publicado, ou
     * apagar um que só existe na camada. A tela precisa dizer qual dos dois é.
     */
    await servico.salvarArtigo({ artigo: bom(), publicado: null, editadaPor: 'Aline' });
    await servico.salvarArtigo({
      artigo: { ...SEED_ARTICLES[0], titulo: 'X' },
      publicado: SEED_ARTICLES[0],
      editadaPor: 'Aline',
    });

    const edicoes = await servico.edicoesDeArtigos();
    expect(edicoes.find((e) => e.artigoId === 'art_teste')!.criado).toBe(true);
    expect(edicoes.find((e) => e.artigoId === SEED_ARTICLES[0].id)!.criado).toBe(false);
  });

  it('sem edição nenhuma, a lista volta como veio', () => {
    const publicados = SEED_ARTICLES.slice(0, 3);
    expect(aplicarEdicoesDeArtigos(publicados, [])).toEqual(publicados);
  });

  it('editar duas vezes o mesmo artigo deixa UMA edição', async () => {
    await servico.salvarArtigo({
      artigo: { ...SEED_ARTICLES[0], titulo: 'A' },
      publicado: SEED_ARTICLES[0],
      editadaPor: 'Aline',
    });
    await servico.salvarArtigo({
      artigo: { ...SEED_ARTICLES[0], titulo: 'B' },
      publicado: SEED_ARTICLES[0],
      editadaPor: 'Aline',
    });

    expect((await servico.edicoesDeArtigos()).length).toBe(1);
  });

  it('🔴 reverter devolve o PUBLICADO, e não a versão intermediária', async () => {
    const original = SEED_ARTICLES[0];

    await servico.salvarArtigo({
      artigo: { ...original, titulo: 'v2' },
      publicado: original,
      editadaPor: 'Aline',
    });
    await servico.salvarArtigo({
      artigo: { ...original, titulo: 'v3' },
      publicado: { ...original, titulo: 'v2' },
      editadaPor: 'Aline',
    });

    const guardada = (await servico.edicoesDeArtigos())[0];
    expect(guardada.anterior!.titulo, 'reverter pararia numa versão intermediária').toBe(
      original.titulo
    );
  });

  it('remover apaga a edição, e o publicado volta', async () => {
    const publicados = SEED_ARTICLES.slice(0, 2);

    await servico.salvarArtigo({
      artigo: { ...publicados[0], titulo: 'mudado' },
      publicado: publicados[0],
      editadaPor: 'Aline',
    });
    await servico.removerArtigo(publicados[0].id);

    const lidos = await servico.artigosComEdicoes(publicados);
    expect(lidos[0].titulo).toBe(publicados[0].titulo);
  });
});

describe('o serviço recusa o que não pode gravar', () => {
  it('artigo inválido não é gravado', async () => {
    await expect(
      servico.salvarArtigo({
        artigo: { ...bom(), resumo: '' },
        publicado: null,
        editadaPor: 'Aline',
      })
    ).rejects.toThrow(/resumo/i);

    expect((await servico.edicoesDeArtigos()).length, 'gravou mesmo recusando').toBe(0);
  });

  it('edição sem autoria é recusada', async () => {
    await expect(
      servico.salvarArtigo({ artigo: bom(), publicado: null, editadaPor: '  ' })
    ).rejects.toThrow(/autoria/i);
  });

  it('🔴 `atualizadoEm` é gravado pelo serviço, e não aceito da tela', async () => {
    /**
     * É registro, e não campo: deixar a tela mandar permitiria gravar uma
     * revisão datada de ontem, e o rodapé mentiria sobre quando foi revista.
     */
    await servico.salvarArtigo({
      artigo: { ...bom(), atualizadoEm: '1999-01-01T00:00:00.000Z' },
      publicado: null,
      editadaPor: 'Aline',
    });

    const gravado = (await servico.edicoesDeArtigos())[0].conteudo;
    expect(gravado.atualizadoEm.startsWith('1999'), 'a tela ditou a data de revisão').toBe(false);
  });

  it('o identificador da edição vem do artigo, e não de sorteio', () => {
    expect(idDaEdicaoDeArtigo('art_x')).toBe(idDaEdicaoDeArtigo('art_x'));
  });
});

describe('🔴 o RODAPÉ é derivado, e não um campo que alguém preenche', () => {
  it('conta as referências de verdade, por tipo', () => {
    /**
     * Um rodapé escrito à mão diverge do corpo no dia em que uma citação entra
     * e ninguém lembra de atualizá-lo — e aí a peça diz "12 obras" e percorre 14.
     */
    const r = rodapeDoArtigo(bom());

    expect(r.referencias.obras).toBe(1);
    expect(r.referencias.pessoas).toBe(1);
    expect(r.referencias.coletaneas).toBe(1);
    expect(r.referencias.total).toBe(3);
  });

  it('traz autoria, instituição e as duas datas', () => {
    const r = rodapeDoArtigo(bom());
    expect(r.autoria).toBe('Aline Alves Silva');
    expect(r.instituicao).toBe('Conservatório Muscicapa');
    expect(r.publicadoEm).toBe('2026-03-01T00:00:00.000Z');
  });

  it('🔴 "revisado" compara a DATA, e não o instante', () => {
    /**
     * Gravar o artigo no mesmo dia em que ele saiu não o torna revisado —
     * marcar isso encheria o rodapé de revisões que ninguém fez.
     */
    const mesmoDia = { ...bom(), atualizadoEm: '2026-03-01T23:59:00.000Z' };
    expect(rodapeDoArtigo(mesmoDia).revisado).toBe(false);

    const outroDia = { ...bom(), atualizadoEm: '2026-04-10T00:00:00.000Z' };
    expect(rodapeDoArtigo(outroDia).revisado).toBe(true);
  });

  it('o rodapé de todos os artigos publicados fecha com o que eles citam', () => {
    /** Se a conta divergisse em algum artigo real, seria aqui que apareceria. */
    for (const a of SEED_ARTICLES) {
      const r = rodapeDoArtigo(a);
      expect(r.referencias.total).toBe(a.obras.length + a.pessoas.length + a.coletaneas.length);
    }
  });
});

describe('o artigo em branco já nasce com a forma certa', () => {
  it('tem autoria, instituição, uma seção e as datas', () => {
    const a = artigoEmBranco({ id: 'art_novo', autoria: 'Aline' });

    expect(a.autoria).toBe('Aline');
    expect(a.instituicao).not.toBe('');
    expect(a.secoes.length).toBe(1);
    expect(a.publicadoEm).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('🔴 ele NÃO passa na validação — e é isso que se espera', () => {
    /**
     * Um branco que passasse permitiria publicar artigo sem título e sem
     * resumo. O que ele dá é a forma, não o conteúdo.
     */
    const problemas = problemasDoArtigo(artigoEmBranco({ id: 'x', autoria: 'Aline' }));
    expect(problemas.length).toBeGreaterThan(0);
    expect(problemas.join(' ')).toMatch(/sem título/i);
  });

  it('os tipos oferecidos são os do domínio, e cada um explica o que é', () => {
    expect(TIPOS_DE_ARTIGO.length).toBe(3);
    for (const t of TIPOS_DE_ARTIGO) {
      expect(t.rotulo.trim()).not.toBe('');
      expect(t.explica.trim().length, `"${t.rotulo}" sem explicação`).toBeGreaterThan(15);
    }
  });
});

describe('os artigos entram no PACOTE', () => {
  it('exportar leva os artigos junto, e o resumo os conta', async () => {
    await servico.salvarArtigo({ artigo: bom(), publicado: null, editadaPor: 'Aline' });

    const { json, resumo } = await servico.exportarPacote('Aline');

    expect(resumo.artigos).toBe(1);
    expect(json).toContain('art_teste');
  });

  it('🔴 importar funde os artigos, e a mais nova vence', async () => {
    const antiga: EdicaoDeArtigo = {
      id: idDaEdicaoDeArtigo('art_teste'),
      artigoId: 'art_teste',
      conteudo: { ...bom(), titulo: 'DO PACOTE ANTIGO' },
      anterior: null,
      criado: true,
      editadaPor: 'Outro',
      editadaEm: '2020-01-01T00:00:00.000Z',
    };

    await servico.salvarArtigo({
      artigo: { ...bom(), titulo: 'MEU TRABALHO DE HOJE' },
      publicado: null,
      editadaPor: 'Aline',
    });

    const pacote = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      exportadoEm: new Date().toISOString(),
      edicoes: [],
      licoesCriadas: [],
      artigos: [antiga],
      livretos: [],
    });

    const r = await servico.importarPacote(pacote);

    expect(r.ok).toBe(true);
    expect(r.artigos!.mantidas, 'o pacote antigo substituiu o trabalho de hoje').toBe(1);

    const lidos = await servico.artigosComEdicoes([]);
    expect(lidos[0].titulo).toBe('MEU TRABALHO DE HOJE');
  });

  it('pacote sem a lista de artigos é recusado, e diz isso', async () => {
    const semArtigos = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      edicoes: [],
      licoesCriadas: [],
      livretos: [],
    });
    const r = await servico.importarPacote(semArtigos);

    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/artigos/i);
  });

  it('artigo sem identificador no pacote é recusado', async () => {
    const torto = JSON.stringify({
      versao: VERSAO_DO_PACOTE,
      edicoes: [],
      licoesCriadas: [],
      artigos: [{ conteudo: bom() }],
      livretos: [],
    });

    const r = await servico.importarPacote(torto);
    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/identificador/i);
  });

  it('a contagem de pendentes inclui os artigos', async () => {
    expect(await servico.pendentes()).toBe(0);
    await servico.salvarArtigo({ artigo: bom(), publicado: null, editadaPor: 'Aline' });
    expect(await servico.pendentes()).toBe(1);
  });
});
