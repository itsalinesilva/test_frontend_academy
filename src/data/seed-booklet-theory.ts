import { Livreto, CapituloLivreto } from '../domain/booklet';
import { CAPITULOS_TEORIA } from './theory/capitulos';
import { QUESTOES_01_29 } from './theory/questoes-01-29';
import { QUESTOES_30_58 } from './theory/questoes-30-58';

/**
 * Livreto de exercícios — Teoria da Música.
 *
 * O DESALINHAMENTO QUE ISTO CORRIGE
 * ---------------------------------
 * Este livreto tinha dezesseis capítulos, herdados de quando o curso tinha
 * dezesseis. Quando o curso passou a ter cinquenta e oito, o livreto ficou
 * para trás — e o resultado era pior que a falta de exercício: o capítulo 5
 * do livreto perguntava sobre intervalos enquanto a lição 5 ensinava semitons.
 * Os dezesseis capítulos estavam todos desalinhados.
 *
 * Agora ele é montado **a partir** de `CAPITULOS_TEORIA`. Título, número e
 * `licaoId` vêm do curso, não de uma cópia. Acrescentar um capítulo ao curso
 * passa a acrescentá-lo aqui automaticamente, e um capítulo sem questão
 * aparece vazio em vez de aparecer com as questões do vizinho.
 *
 * TRÊS QUESTÕES POR CAPÍTULO
 * --------------------------
 * Com cinquenta e oito capítulos, três por capítulo dão cento e setenta e
 * quatro questões — o suficiente para o simulado ser uma revisão séria do
 * curso inteiro sem que nenhum capítulo vire prova.
 *
 * TODA QUESTÃO TEM EXPLICAÇÃO.
 * ----------------------------
 * Uma questão sem explicação ensina a acertar, não o assunto. A explicação é
 * onde a questão vira aula — é o que o aluno lê depois de errar, e é a única
 * parte que ele lê com atenção total.
 */

const QUESTOES = { ...QUESTOES_01_29, ...QUESTOES_30_58 };

const CAPITULOS: CapituloLivreto[] = CAPITULOS_TEORIA.map((c) => ({
  id: `cap_teoria_${String(c.numero).padStart(2, '0')}`,
  numero: c.numero,
  titulo: c.titulo,
  licaoId: `les_teoria_${String(c.numero).padStart(2, '0')}`,
  questoes: QUESTOES[c.numero] ?? [],
}));

export const LIVRETO_TEORIA: Livreto = {
  id: 'liv_teoria_fundamentos',
  cursoId: 'crs_teoria_fundamentos',
  titulo: 'Caderno de Exercícios — Teoria da Música',
  descricao:
    'Três questões ao fim de cada um dos 58 capítulos. As mesmas questões reaparecem no simulado, na ordem em que foram estudadas.',
  capitulos: CAPITULOS,
  criadoEm: '2026-09-17T00:00:00.000Z',
  atualizadoEm: '2026-09-17T00:00:00.000Z',
};
