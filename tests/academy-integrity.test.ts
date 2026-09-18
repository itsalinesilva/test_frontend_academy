import { describe, it, expect } from 'vitest';
import { SEED_COURSES, SEED_MODULES, SEED_LESSONS } from '../src/data/seed-academy-content';
import { LIVRETOS_PADRAO, PROVAS_PADRAO, SIMULADOS_PADRAO } from '../src/data/seed-booklets';
import { bookService } from '../src/services/application/book.service';
import { secoesEditaveis } from '../src/domain/book';
import { countWords } from '../src/domain/workload';
import { LessonBlock } from '../src/domain/academy';

/**
 * A pergunta que este arquivo responde é a que foi feita de peito aberto:
 * **o Academy está pronto de ponta a ponta?**
 *
 * Não se responde isso lendo tela. Responde-se contando: todo curso tem
 * capítulos, todo capítulo tem conteúdo e exercício, todo exercício está no
 * capítulo certo, toda prova sai do livreto certo, e a biblioteca reflete o
 * que os cursos têm agora — não o que tinham quando o livro foi gerado.
 */

const blocosDa = (lessonId: string): LessonBlock[] => {
  const l = SEED_LESSONS.find((x) => x.id === lessonId);
  return l ? l.variants.TRADITIONAL.sections.flatMap((s) => s.blocks ?? []) : [];
};

describe('todo curso está inteiro', () => {
  it('cada curso tem módulos, lições e livreto', () => {
    for (const c of SEED_COURSES) {
      const mods = SEED_MODULES.filter((m) => m.courseId === c.id);
      const lics = SEED_LESSONS.filter((l) => l.courseId === c.id);
      const liv = LIVRETOS_PADRAO.find((l) => l.cursoId === c.id);

      expect(mods.length, `${c.title}: sem módulos`).toBeGreaterThan(0);
      expect(lics.length, `${c.title}: lições ≠ módulos`).toBe(mods.length);
      expect(liv, `${c.title}: sem livreto`).toBeTruthy();
      expect(liv!.capitulos.length, `${c.title}: livreto ≠ curso`).toBe(mods.length);
    }
  });

  it('a lição de cada módulo existe e pertence ao mesmo curso', () => {
    const porId = new Map(SEED_LESSONS.map((l) => [l.id, l]));
    for (const m of SEED_MODULES) {
      for (const lid of m.lessonIds) {
        const l = porId.get(lid);
        expect(l, `${m.id} aponta para lição inexistente ${lid}`).toBeTruthy();
        expect(l!.courseId, `${lid} está em outro curso`).toBe(m.courseId);
        expect(l!.moduleId, `${lid} aponta para outro módulo`).toBe(m.id);
      }
    }
  });

  it('nenhuma lição fica sem conteúdo nem sem checkpoint', () => {
    for (const l of SEED_LESSONS) {
      const b = blocosDa(l.id);
      expect(b.length, `${l.id} sem blocos`).toBeGreaterThan(0);
      expect(
        b.some((x) => x.kind === 'CHECKPOINT'),
        `${l.id} sem checkpoint`
      ).toBe(true);
    }
  });

  it('nenhuma lição é casca: todas têm texto de verdade', () => {
    // Conta tudo o que o aluno lê — markdown e o texto dos avisos —, porque é
    // isso que ele lê. Capítulos curtos existem e são legítimos: "Intervalos
    // compostos" não dá mil palavras. O piso separa capítulo curto de
    // capítulo vazio.
    for (const l of SEED_LESSONS) {
      const palavras = blocosDa(l.id).reduce((a, b) => {
        if (b.kind === 'MARKDOWN') return a + countWords(b.markdown);
        if (b.kind === 'CALLOUT') return a + countWords(`${b.title} ${b.text}`);
        return a;
      }, 0);
      expect(palavras, `${l.id} tem só ${palavras} palavras`).toBeGreaterThan(150);
    }
  });

  it('a variante infantil existe para toda lição', () => {
    for (const l of SEED_LESSONS) {
      expect(l.variants.KIDS, `${l.id} sem variante KIDS`).toBeTruthy();
      expect(l.variants.KIDS.sections.length).toBeGreaterThan(0);
    }
  });
});

describe('cada exercício está no capítulo certo', () => {
  it('o capítulo do livreto aponta para a lição do mesmo número', () => {
    for (const liv of LIVRETOS_PADRAO) {
      const mods = SEED_MODULES.filter((m) => m.courseId === liv.cursoId).sort(
        (a, b) => a.order - b.order
      );
      for (const cap of liv.capitulos) {
        const mod = mods.find((m) => m.order === cap.numero);
        expect(mod, `${liv.titulo} cap ${cap.numero}: sem módulo correspondente`).toBeTruthy();
        expect(mod!.lessonIds).toContain(cap.lessonId);
      }
    }
  });

  it('o título do capítulo do livreto é o do capítulo do curso', () => {
    // Foi exatamente aqui que o livreto de Teoria ficou dezesseis capítulos
    // atrás: o capítulo 5 perguntava sobre intervalos e a lição 5 ensinava
    // semitons.
    for (const liv of LIVRETOS_PADRAO) {
      const mods = SEED_MODULES.filter((m) => m.courseId === liv.cursoId);
      for (const cap of liv.capitulos) {
        const mod = mods.find((m) => m.order === cap.numero)!;
        expect(
          mod.title.includes(cap.titulo),
          `${liv.titulo} cap ${cap.numero}: "${cap.titulo}" vs "${mod.title}"`
        ).toBe(true);
      }
    }
  });

  it('a competência da questão é ensinada pelo curso', () => {
    for (const liv of LIVRETOS_PADRAO) {
      const curso = SEED_COURSES.find((c) => c.id === liv.cursoId)!;
      const ensinadas = new Set(curso.competencies);
      for (const cap of liv.capitulos) {
        for (const q of cap.questoes) {
          for (const comp of q.competencias) {
            expect(ensinadas.has(comp), `${q.id} cobra "${comp}", fora do curso`).toBe(true);
          }
        }
      }
    }
  });
});

describe('simulado e prova', () => {
  it('cada curso tem simulado e prova', () => {
    for (const c of SEED_COURSES) {
      expect(SIMULADOS_PADRAO.some((s) => s.cursoId === c.id), `${c.title}`).toBe(true);
      expect(PROVAS_PADRAO.some((p) => p.cursoId === c.id), `${c.title}`).toBe(true);
    }
  });

  it('o simulado do curso aponta para as questões do livreto do curso', () => {
    for (const sim of SIMULADOS_PADRAO) {
      const liv = LIVRETOS_PADRAO.find((l) => l.cursoId === sim.cursoId)!;
      const doLivreto = new Set(liv.capitulos.flatMap((c) => c.questoes.map((q) => q.id)));
      for (const id of sim.questaoIds) {
        expect(doLivreto.has(id), `${sim.titulo} referencia ${id}, que não é deste livreto`).toBe(
          true
        );
      }
    }
  });

  it('a prova só usa questões do livreto do próprio curso', () => {
    for (const prova of PROVAS_PADRAO) {
      const liv = LIVRETOS_PADRAO.find((l) => l.cursoId === prova.cursoId)!;
      const doLivreto = new Set(liv.capitulos.flatMap((c) => c.questoes.map((q) => q.id)));
      for (const q of prova.questoesProprias) {
        // A prova congela cópias com prefixo `pf_`.
        expect(doLivreto.has(q.id.replace(/^pf_/, '')), `${prova.titulo}: ${q.id}`).toBe(true);
      }
    }
  });
});

describe('biblioteca do Conservatório', () => {
  const livrosDe = (courseId: string) => {
    const curso = SEED_COURSES.find((c) => c.id === courseId)!;
    const modulos = SEED_MODULES.filter((m) => m.courseId === courseId).sort(
      (a, b) => a.order - b.order
    );
    const licoes = SEED_LESSONS.filter((l) => l.courseId === courseId);
    const livreto = LIVRETOS_PADRAO.find((l) => l.cursoId === courseId) ?? null;
    return bookService.gerar({ curso, modulos, licoes, livreto });
  };

  it('cada curso rende os dois livros — leitura e prática', () => {
    for (const c of SEED_COURSES) {
      const { leitura, imersao } = livrosDe(c.id);
      expect(leitura, `${c.title}: sem livro de leitura`).toBeTruthy();
      expect(imersao, `${c.title}: sem livro de prática`).toBeTruthy();
    }
  });

  it('o livro cobre todos os capítulos do curso', () => {
    for (const c of SEED_COURSES) {
      const { leitura } = livrosDe(c.id);
      const mods = SEED_MODULES.filter((m) => m.courseId === c.id);
      // O título do capítulo é o título da SEÇÃO do livro, não parte do corpo.
      const texto = leitura.secoes.map((s) => `${s.titulo}\n${s.conteudo}`).join('\n');
      for (const m of mods) {
        const titulo = m.title.replace(/^[\dIVXLC]+[.\s-]*/, '').trim();
        expect(texto.includes(titulo), `${c.title}: livro não traz "${titulo}"`).toBe(true);
      }
    }
  });

  it('o livro tem seções editáveis — senão não é editável', () => {
    for (const c of SEED_COURSES) {
      const { leitura } = livrosDe(c.id);
      expect(secoesEditaveis(leitura).length, `${c.title}`).toBeGreaterThan(0);
    }
  });

  it('as seções geradas nascem do curso e não são editáveis à mão', () => {
    // Editá-las faria livro e plataforma divergirem sem ninguém saber qual
    // está certo.
    for (const c of SEED_COURSES) {
      const { leitura } = livrosDe(c.id);
      const geradas = leitura.secoes.filter((s) => s.origem === 'GERADA');
      expect(geradas.length, `${c.title}`).toBeGreaterThan(0);
      for (const s of geradas) {
        expect(secoesEditaveis(leitura).map((e) => e.id)).not.toContain(s.id);
      }
    }
  });

  it('a biblioteca reflete o catálogo atual, com os cinco cursos', () => {
    const titulos = SEED_COURSES.map((c) => livrosDe(c.id).leitura.titulo);
    expect(titulos.length).toBe(5);
    expect(new Set(titulos).size, 'dois livros com o mesmo título').toBe(5);
  });
});
