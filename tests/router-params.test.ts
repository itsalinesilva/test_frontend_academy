import { describe, it, expect } from 'vitest';
import { resolveRouteParams, CANONICAL_ROUTES } from '../src/ui/navigation/router';

/**
 * Resolução de parâmetros de rota.
 *
 * REGRESSÃO R-01 (01_REPOSITORY_AUDIT): a lista de padrões dinâmicos era
 * mantida à mão e estava incompleta. Seis rotas recebiam `params = {}`, e
 * dezoito telas mascaravam isso com um id fixo de reserva — de modo que as
 * rotas quebradas PARECIAM funcionar, sempre exibindo a mesma entidade.
 */
describe('Rotas quebradas — as seis do R-01', () => {
  const casos: Array<[string, Record<string, string>]> = [
    ['/academia/course/crs_x/curriculum', { id: 'crs_x' }],
    ['/academia/course/crs_x/progress', { id: 'crs_x' }],
    ['/academia/lesson/les_x/interactive', { id: 'les_x' }],
    ['/academia/quiz/quiz_x', { id: 'quiz_x' }],
    ['/academia/category/cat_x', { id: 'cat_x' }],
    ['/practice/feedback/fb_x', { id: 'fb_x' }],
  ];

  it.each(casos)('resolve %s', (path, esperado) => {
    expect(resolveRouteParams(path)).toEqual(esperado);
  });
});

describe('Rotas que já funcionavam continuam funcionando', () => {
  it('curso, lição e obra', () => {
    expect(resolveRouteParams('/academia/course/crs_fomt_01')).toEqual({ id: 'crs_fomt_01' });
    expect(resolveRouteParams('/academia/lesson/les_1')).toEqual({ id: 'les_1' });
    expect(resolveRouteParams('/worlds/work/bwv-1001')).toEqual({ id: 'bwv-1001' });
  });

  it('módulo, com dois parâmetros', () => {
    expect(resolveRouteParams('/academia/course/crs_1/module/mod_2')).toEqual({
      courseId: 'crs_1',
      moduleId: 'mod_2',
    });
  });
});

describe('Rota estática tem precedência sobre padrão dinâmico', () => {
  it('/rooms/create não é capturado por /rooms/:id', () => {
    // Sem a precedência, `create` viraria o id de uma sala inexistente.
    expect(resolveRouteParams('/rooms/create')).toEqual({});
    expect(resolveRouteParams('/rooms/sala_x')).toEqual({ id: 'sala_x' });
  });

  it('/academia/search/results não vira categoria nem curso', () => {
    expect(resolveRouteParams('/academia/search/results')).toEqual({});
  });

  it('/practice/skill-tree não é capturado por /practice/skill/:id', () => {
    expect(resolveRouteParams('/practice/skill-tree')).toEqual({});
    expect(resolveRouteParams('/practice/skill/sk_1')).toEqual({ id: 'sk_1' });
  });
});

describe('Cobertura derivada de CANONICAL_ROUTES', () => {
  it('toda rota dinâmica declarada resolve seus parâmetros', () => {
    const dinamicas = Object.values(CANONICAL_ROUTES).filter((r) => r.includes(':'));
    expect(dinamicas.length).toBeGreaterThan(15);

    for (const pattern of dinamicas) {
      // Substitui cada :param por um valor sintético e confere o retorno.
      const nomes = pattern.split('/').filter((s) => s.startsWith(':')).map((s) => s.slice(1));
      const concreto = pattern.replace(/:([A-Za-z]+)/g, (_, n: string) => `val-${n}`);
      const resolvido = resolveRouteParams(concreto);

      for (const nome of nomes) {
        expect(resolvido[nome], `rota ${pattern} nao resolveu :${nome}`).toBe(`val-${nome}`);
      }
    }
  });

  it('caminho desconhecido devolve vazio, sem inventar parâmetro', () => {
    expect(resolveRouteParams('/rota/que/nao/existe/mesmo')).toEqual({});
    expect(resolveRouteParams('/')).toEqual({});
  });

  it('decodifica identificadores com escape percentual', () => {
    expect(resolveRouteParams('/worlds/work/bwv%201001')).toEqual({ id: 'bwv 1001' });
  });
});
