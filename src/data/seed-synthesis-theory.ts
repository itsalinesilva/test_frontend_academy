import {
  SinteseDeCurso,
  BlocoDeSintese,
  NaturezaDoBloco,
  PesoDoBloco,
} from '../domain/synthesis';
import { CAPITULOS_TEORIA } from './theory/capitulos';
import { LIVRETO_TEORIA } from './seed-booklet-theory';

/**
 * Síntese do curso de Teoria — a base de extração das questões.
 *
 * O QUE ESTA RECONSTRUÇÃO CORRIGE
 * -------------------------------
 * A síntese anterior foi escrita para os dezesseis capítulos originais e
 * amarrava questões por id fixo. Quando o curso passou a ter cinquenta e oito
 * capítulos e o livreto foi reconstruído, ela ficou apontando para questões
 * que já não existiam, e para capítulos que mudaram de assunto. Uma ferramenta
 * de conferência de cobertura que aponta para o lugar errado é pior que
 * nenhuma: ela dá resultado verde sobre um mapa desatualizado.
 *
 * COMO ELA É MONTADA AGORA
 * ------------------------
 * A partir dos próprios capítulos. Cada capítulo declara **objetivos** — o que
 * o aluno será capaz de fazer ao fim dele. Um objetivo é exatamente o tipo de
 * afirmação que a síntese quer: verificável, sustentada pelo capítulo, e
 * cobrável por questão.
 *
 * Cada capítulo gera dois blocos:
 *
 *   NUCLEAR (2 questões)  o primeiro objetivo, que é o que o capítulo existe
 *                         para ensinar
 *   APOIO   (1 questão)   o segundo objetivo, ou a descrição do capítulo
 *                         quando ele tem um objetivo só
 *
 * Isso soma exatamente as três questões que cada capítulo tem no livreto — e
 * é por isso que a conferência de cobertura fecha sem sobra nem falta. A
 * amarração é por **posição**, não por id escrito à mão: acrescentar uma
 * questão ao capítulo faz a lacuna aparecer, e remover faz a órfã aparecer.
 */

/**
 * Natureza do bloco, deduzida do verbo do objetivo.
 *
 * Não é adivinhação estilística: o verbo diz o que se quer verificar.
 * "Distinguir" pede as duas coisas lado a lado; "construir" pede aplicação;
 * "explicar" pede causa. É a mesma lógica de `TIPO_POR_NATUREZA`.
 */
function naturezaDoObjetivo(texto: string): NaturezaDoBloco {
  const t = texto.toLowerCase();
  if (t.startsWith('distinguir') || t.includes('distinguir')) return 'DISTINCAO';
  if (t.startsWith('explicar') || t.includes('por que')) return 'CAUSA';
  if (t.startsWith('construir') || t.startsWith('executar') || t.startsWith('aplicar'))
    return 'PROCEDIMENTO';
  if (t.startsWith('classificar') || t.startsWith('nomear')) return 'CLASSIFICACAO';
  if (t.startsWith('reconhecer') || t.startsWith('identificar') || t.startsWith('ler'))
    return 'DEFINICAO';
  if (t.startsWith('relacionar') || t.startsWith('situar')) return 'REGRA';
  return 'DEFINICAO';
}

function bloco(
  id: string,
  capituloId: string,
  ordem: number,
  nucleo: string,
  nature: NaturezaDoBloco,
  peso: PesoDoBloco,
  confusoes: string[],
  competencia: string,
  questaoIds: string[]
): BlocoDeSintese {
  return {
    id,
    capituloId,
    ordem,
    nucleo,
    nature,
    peso,
    confusoesComuns: confusoes,
    competencia,
    questaoIds,
  };
}

const questoesPorCapitulo = new Map(
  LIVRETO_TEORIA.capitulos.map((c) => [c.numero, c.questoes.map((q) => q.id)])
);

/**
 * As confusões de um bloco são os **distratores** das suas próprias questões.
 *
 * Não é atalho: é a mesma informação vista do outro lado. Cada alternativa
 * errada do livreto foi escrita contra um engano real e frequente — confundir
 * altura com intensidade, ler 6/8 como seis tempos. Listá-las aqui mantém as
 * duas pontas amarradas: mudar um distrator muda a confusão declarada, e não
 * há como uma ficar desatualizada em relação à outra.
 */
function confusoesDasQuestoes(ids: string[]): string[] {
  const porId = new Map(
    LIVRETO_TEORIA.capitulos.flatMap((c) => c.questoes).map((q) => [q.id, q])
  );
  const fora: string[] = [];
  for (const id of ids) {
    const q = porId.get(id);
    if (!q) continue;
    for (const a of q.choices) {
      if (a.id !== q.resposta) fora.push(a.texto);
    }
  }
  return Array.from(new Set(fora));
}

export const SINTESE_TEORIA: SinteseDeCurso = {
  cursoId: 'crs_teoria_fundamentos',
  titulo: 'Síntese — Teoria da Música',
  capitulos: CAPITULOS_TEORIA.map((c) => {
    const capituloId = `cap_teoria_${String(c.numero).padStart(2, '0')}`;
    const ids = questoesPorCapitulo.get(c.numero) ?? [];

    const nucleoPrincipal = c.objetivos[0] ?? c.descricao;
    const nucleoApoio = c.objetivos[1] ?? c.descricao;

    // As duas primeiras questões cobrem o bloco nuclear; a terceira, o apoio.
    const blocos: BlocoDeSintese[] = [
      bloco(
        `s${String(c.numero).padStart(2, '0')}_1`,
        capituloId,
        1,
        nucleoPrincipal,
        naturezaDoObjetivo(nucleoPrincipal),
        'NUCLEAR',
        confusoesDasQuestoes(ids.slice(0, 2)),
        c.competencia,
        ids.slice(0, 2)
      ),
    ];

    if (ids.length > 2) {
      blocos.push(
        bloco(
          `s${String(c.numero).padStart(2, '0')}_2`,
          capituloId,
          2,
          nucleoApoio,
          naturezaDoObjetivo(nucleoApoio),
          'APOIO',
          confusoesDasQuestoes(ids.slice(2, 3)),
          c.competenciasAdicionais?.[0] ?? c.competencia,
          ids.slice(2, 3)
        )
      );
    }

    return {
      capituloId,
      numero: c.numero,
      titulo: c.titulo,
      blocos,
    };
  }),
};
