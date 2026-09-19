// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { SeletorDeEstrelas, Estrelas } from '../../src/ui/components/academy/Estrelas';
import { ReviewForm } from '../../src/ui/components/academy/ReviewForm';
import { CarrosselDeDepoimentos } from '../../src/ui/components/academy/CarrosselDeDepoimentos';
import { StudyCalendar } from '../../src/ui/components/academy/StudyCalendar';
import { AvaliacaoDeCurso } from '../../src/domain/reviews';

const raiz = resolve(__dirname, '../..');
const ler = (p: string) => readFileSync(resolve(raiz, p), 'utf-8');

afterEach(cleanup);

/**
 * A função pode estar pronta e o dado não existir ainda — são coisas
 * diferentes. Estes testes verificam a FUNÇÃO: que o seletor seleciona, que o
 * formulário valida e envia, que o carrossel navega. O banco vazio é o estado
 * inicial esperado, não uma pendência.
 */

describe('seletor de estrelas', () => {
  it('é um grupo de rádio de verdade, navegável por teclado', () => {
    // Estrela desenhada com onClick num div não é acessível, por mais bonita
    // que fique.
    render(<SeletorDeEstrelas id="s" valor={null} onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveProperty('name', 's-nota');
  });

  it('seleciona a nota clicada', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<SeletorDeEstrelas id="s" valor={null} onChange={onChange} />);

    await u.click(screen.getByLabelText('4 estrelas'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('não interage quando desabilitado', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    render(<SeletorDeEstrelas id="s" valor={null} onChange={onChange} disabled />);

    await u.click(screen.getByLabelText('3 estrelas'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('exibição anuncia ausência de nota, não nota zero', () => {
    render(<Estrelas valor={null} />);
    expect(screen.getByRole('img', { name: 'sem avaliação' })).toBeTruthy();
  });
});

describe('formulário de avaliação', () => {
  it('não abre para quem não concluiu o curso', () => {
    render(
      <ReviewForm concluiuOCurso={false} jaAvaliou={false} onEnviar={async () => {}} />
    );
    expect(screen.queryByRole('button', { name: /Avaliar este curso/i })).toBeNull();
    expect(screen.getByText(/abre quando você concluir/i)).toBeTruthy();
  });

  it('abre para quem concluiu', async () => {
    const u = userEvent.setup();
    render(
      <ReviewForm concluiuOCurso jaAvaliou={false} onEnviar={async () => {}} />
    );
    await u.click(screen.getByRole('button', { name: /Avaliar este curso/i }));
    expect(screen.getByRole('radiogroup', { name: /Nota de 1 a 5/i })).toBeTruthy();
  });

  it('exige nota e comentário mínimo antes de enviar', async () => {
    const u = userEvent.setup();
    const onEnviar = vi.fn();
    render(<ReviewForm concluiuOCurso jaAvaliou={false} onEnviar={onEnviar} />);

    await u.click(screen.getByRole('button', { name: /Avaliar este curso/i }));
    const publicar = screen.getByRole('button', { name: /Publicar avaliação/i });
    expect(publicar).toHaveProperty('disabled', true);

    await u.click(screen.getByLabelText('5 estrelas'));
    expect(publicar).toHaveProperty('disabled', true); // ainda falta o texto

    await u.type(screen.getByRole('textbox'), 'Curso muito bem estruturado, recomendo.');
    expect(publicar).toHaveProperty('disabled', false);
  });

  it('envia nota, comentário e a escolha de anonimato', async () => {
    const u = userEvent.setup();
    const onEnviar = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm concluiuOCurso jaAvaliou={false} onEnviar={onEnviar} />);

    await u.click(screen.getByRole('button', { name: /Avaliar este curso/i }));
    await u.click(screen.getByLabelText('4 estrelas'));
    await u.type(screen.getByRole('textbox'), 'Conteúdo denso e bem escrito, valeu a pena.');
    await u.click(screen.getByRole('checkbox'));
    await u.click(screen.getByRole('button', { name: /Publicar avaliação/i }));

    expect(onEnviar).toHaveBeenCalledWith({
      estrelas: 4,
      comentario: 'Conteúdo denso e bem escrito, valeu a pena.',
      anonima: true,
    });
  });

  it('quem já avaliou vê o botão de editar, com os valores carregados', async () => {
    const u = userEvent.setup();
    render(
      <ReviewForm
        concluiuOCurso
        jaAvaliou
        valorInicial={{ estrelas: 3, comentario: 'Texto anterior suficientemente longo.', anonima: false }}
        onEnviar={async () => {}}
      />
    );
    await u.click(screen.getByRole('button', { name: /Editar minha avaliação/i }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('Texto anterior');
  });
});

describe('carrossel de depoimentos', () => {
  const dep = (i: number, texto: string): AvaliacaoDeCurso => ({
    id: `d${i}`,
    courseId: 'c1',
    userId: `u${i}`,
    autor: `Aluno ${i}`,
    anonima: false,
    estrelas: 5,
    comentario: texto,
    criadaEm: '2026-09-17T00:00:00.000Z',
    concluiuOCurso: true,
  });

  it('sem depoimentos, explica que a instituição não redige depoimento', () => {
    render(<CarrosselDeDepoimentos depoimentos={[]} />);
    expect(screen.getByText(/não redige depoimento/i)).toBeTruthy();
  });

  it('com um só, não mostra setas nem pontos', () => {
    render(<CarrosselDeDepoimentos depoimentos={[dep(1, 'Um depoimento só.')]} />);
    expect(screen.queryByLabelText('Próximo depoimento')).toBeNull();
  });

  it('navega entre depoimentos', async () => {
    const u = userEvent.setup();
    render(
      <CarrosselDeDepoimentos
        depoimentos={[dep(1, 'Primeiro texto.'), dep(2, 'Segundo texto.')]}
      />
    );
    expect(screen.getByText('Primeiro texto.')).toBeTruthy();

    await u.click(screen.getByLabelText('Próximo depoimento'));
    expect(screen.getByText('Segundo texto.')).toBeTruthy();
  });

  it('não gira sozinho', () => {
    // Rotação automática rouba a leitura de quem está no meio de uma frase.
    const src = ler('src/ui/components/academy/CarrosselDeDepoimentos.tsx');
    expect(src).not.toContain('setInterval');
    expect(src).not.toContain('setTimeout');
  });
});

describe('calendário de estudo', () => {
  const hoje = new Date(2026, 8, 17);

  it('desenha a grade do mês com cabeçalho de dias da semana', () => {
    render(<StudyCalendar registros={[]} hoje={hoje} />);
    expect(screen.getByRole('grid')).toBeTruthy();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
  });

  it('marca o dia estudado e não marca o dia sem registro', () => {
    render(
      <StudyCalendar
        registros={[{ dia: '2026-09-10', minutos: 30, eventos: 1 }]}
        hoje={hoje}
      />
    );
    expect(screen.getByLabelText('dia 10, estudou')).toBeTruthy();
    expect(screen.getByLabelText('dia 11, sem registro')).toBeTruthy();
  });

  it('explica o vazio em vez de mostrar um mês em branco sem contexto', () => {
    render(<StudyCalendar registros={[]} hoje={hoje} />);
    expect(screen.getByText(/Nenhum dia registrado ainda/i)).toBeTruthy();
  });
});

describe('Explorar lista telas, não sub-rotas', () => {
  it('nenhum destino é sub-rota de outra tela', () => {
    // "Editor de partitura" é parte do Studio; "Simulador" é parte do Violino.
    // Um menu de navegação que lista sub-rotas obriga a ler o mapa inteiro.
    const src = ler('src/ui/components/layout/ExplorarMenu.tsx');
    const caminhos = [...src.matchAll(/path: '([^']+)'/g)].map((m) => m[1]);

    expect(caminhos.length).toBeGreaterThan(0);
    for (const c of caminhos) {
      expect(c, `${c} tem mais de um segmento`).toMatch(/^\/[a-z-]+$/);
      expect(c, `${c} carrega query string`).not.toContain('?');
    }
  });

  it('os destinos são os pilares oficiais da plataforma', () => {
    const src = ler('src/ui/components/layout/ExplorarMenu.tsx');
    const caminhos = new Set([...src.matchAll(/path: '([^']+)'/g)].map((m) => m[1]));
    const oficiais = new Set([
      '/academia',
      '/practice',
      '/score',
      '/studio',
      '/worlds',
      '/community',
      '/profile',
      '/rooms',
      '/founder',
    ]);
    for (const c of caminhos) expect(oficiais.has(c), `${c} não é pilar oficial`).toBe(true);
  });
});
