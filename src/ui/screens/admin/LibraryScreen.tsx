import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { bookService } from '../../../services/application/book.service';
import { bookletService } from '../../../services/application/booklet.service';
import { academyService } from '../../../services/application/academy.service';
import { editorialService } from '../../../services/application/editorial.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  LivroDoConservatorio,
  SecaoDoLivro,
  SecaoEditadaDoLivro,
  secoesEditaveis,
  countWords,
  idDaSecaoEditada,
  RESSALVA_EDITORIAL,
  INSTITUICAO,
  AUTORIA_PADRAO,
} from '../../../domain/book';
import { AcademyCourse, AcademyModule } from '../../../domain/academy';
import { BookOpen, Download, Pencil, Lock, FileText, Info, RotateCcw, Save, X } from 'lucide-react';

/**
 * Biblioteca Oficial do Conservatório.
 *
 * Cada curso rende dois livros — o de leitura e o caderno de prática — e
 * ambos ficam aqui para ler, baixar e revisar.
 *
 * A TELA MOSTRA O QUE É EDITÁVEL, E ISSO É O PONTO
 * ------------------------------------------------
 * Seções GERADAS nascem do curso: sumário, capítulos, exercícios, gabarito.
 * Editá-las aqui faria o livro e a plataforma divergirem — e a divergência
 * apareceria meses depois, sem ninguém saber qual está certo. Por isso são
 * marcadas com cadeado.
 *
 * Seções EDITÁVEIS — capa, folha de rosto, ficha, prefácio, colofão — são do
 * livro e não existem no curso. Regenerar preserva o que foi escrito nelas.
 *
 * 🔴 E ELAS SE EDITAM AQUI (EE-19). A tela dizia "editável" sobre seções que
 * não tinham editor, e o livro é regenerado a cada leitura: o que fosse
 * escrito não tinha onde ficar. O texto agora grava na camada editorial,
 * volta a cada leitura por cima do gerado, e viaja no pacote.
 */
export const LibraryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [livros, setLivros] = useState<LivroDoConservatorio[]>([]);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [edicoes, setEdicoes] = useState<SecaoEditadaDoLivro[]>([]);
  const [pendentes, setPendentes] = useState(0);
  const [editando, setEditando] = useState<string | null>(null);
  const { nome } = useCurrentUser();

  const carregar = useCallback(async () => {
    try {
      const cursos: AcademyCourse[] = await academyService.getCourses();
      const montados: LivroDoConservatorio[] = [];

      for (const curso of cursos) {
        const [modulos, livreto] = await Promise.all([
          academyService.getModules(curso.id),
          bookletService.buscarLivretoDoCurso(curso.id),
        ]);
        if (modulos.length === 0) continue;

        const licoes = (
          await Promise.all(modulos.map((m: AcademyModule) => academyService.getLessons(m.id)))
        ).flat();
        if (licoes.length === 0) continue;

        const { leitura, imersao } = bookService.gerar({ curso, modulos, licoes, livreto });
        montados.push(leitura, imersao);
      }

      setLivros(await editorialService.livrosComEdicoes(montados));
      setEdicoes(await editorialService.secoesDeLivro());
      setPendentes(await editorialService.pendentes());
      setSelecionado((atual) => atual ?? montados[0]?.id ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao montar a biblioteca.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const livro = livros.find((l) => l.id === selecionado) ?? null;
  const edicaoDe = (livroId: string, secaoId: string) =>
    edicoes.find((e) => e.id === idDaSecaoEditada(livroId, secaoId)) ?? null;

  /**
   * Baixa o livro em Markdown.
   *
   * Markdown, e não PDF: é o formato que se edita, se versiona e se converte
   * depois para o que for preciso. Um PDF gerado no navegador seria o fim da
   * linha — bonito e imutável, e é justamente o contrário do que serve agora.
   */
  const baixar = (l: LivroDoConservatorio) => {
    const texto = [...l.secoes]
      .sort((a, b) => a.ordem - b.ordem)
      .map((s) => `<!-- secao: ${s.id} · ${s.papel} · ${s.origem} -->\n\n${s.conteudo}`)
      .join('\n\n\n');

    const blob = new Blob([texto], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${l.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      id="biblioteca"
      form="detail"
      density="editorial"
      asideLabel="Acervo"
      state={isLoading ? 'loading' : erro ? 'error' : livros.length === 0 ? 'empty' : 'content'}
      loadingMessage="Montando a biblioteca…"
      errorProps={{ message: erro ?? '', onRetry: carregar }}
      emptyProps={{
        title: 'A biblioteca está vazia',
        description:
          'Cada curso com módulos e lições rende dois livros: o de leitura e o caderno de prática. Assim que um curso ficar pronto, ele aparece aqui.',
        actionLabel: 'Ver os cursos',
        onAction: () => navigate('/founder/content'),
      }}
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Biblioteca Oficial do {INSTITUICAO}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
            A versão impressa de cada curso, assinada por {AUTORIA_PADRAO}. Os livros são
            montados a partir do próprio curso — corrigir uma lição corrige o livro.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Obras
          </p>
          <ul className="space-y-1">
            {livros.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelecionado(l.id)}
                  className={`flex w-full items-start gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    selecionado === l.id
                      ? 'bg-anil-900 font-semibold text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {l.tipo === 'LEITURA' ? (
                    <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate">{l.titulo}</span>
                    <span className="block font-mono text-[10px] opacity-70">
                      {l.secoes.length} seções · {countWords(l)} palavras
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" padding="md" className="space-y-2">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            <Info className="h-3 w-3" /> Como gerar os arquivos
          </p>
          <p className="text-[11px] leading-relaxed text-stone-600">
            <code className="rounded bg-stone-100 px-1">npm run livros</code> escreve os livros em{' '}
            <code className="rounded bg-stone-100 px-1">books/</code>, em Markdown e em HTML — o
            HTML já sai pronto para imprimir em A5.
          </p>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
        {livro && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">{livro.titulo}</h2>
                <p className="text-sm text-stone-600">{livro.subtitulo}</p>
                <p className="mt-1 font-mono text-[11px] text-stone-500">
                  {livro.autoria} · {livro.instituicao} · {livro.edicao}, {livro.ano}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => baixar(livro)}>
                <Download className="mr-1 h-3.5 w-3.5" /> Baixar Markdown
              </Button>
            </div>

            {pendentes > 0 && (
              <p
                role="status"
                className="rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs leading-relaxed text-stone-800"
              >
                <strong>
                  {pendentes} {pendentes === 1 ? 'mudança' : 'mudanças'} gravadas neste navegador.
                </strong>{' '}
                Elas já valem para você, e <strong>ainda não chegaram a mais ninguém</strong>:
                exporte o pacote em Lições e exercícios e leve-o ao repositório por commit.
              </p>
            )}

            {editando && livro.secoes.some((s) => s.id === editando) && (
              <EditorDaSecao
                key={`${livro.id}:${editando}`}
                livro={livro}
                secao={livro.secoes.find((s) => s.id === editando)!}
                edicao={edicaoDe(livro.id, editando)}
                editadaPor={nome ?? ''}
                onFechar={() => setEditando(null)}
                onGravou={async () => {
                  setEditando(null);
                  await carregar();
                }}
              />
            )}

            <Card variant="default" padding="md" className="border-amber-200 bg-amber-50">
              <p className="text-[11px] leading-relaxed text-amber-900">{RESSALVA_EDITORIAL}</p>
            </Card>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Estrutura
              </h3>
              <ul className="space-y-1">
                {[...livro.secoes]
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((s: SecaoDoLivro) => (
                    <li
                      key={s.id}
                      className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs ${
                        s.origem === 'EDITAVEL'
                          ? 'border-dashed border-ouro-400 bg-ouro-50/50'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      {s.origem === 'EDITAVEL' ? (
                        <Pencil className="h-3 w-3 shrink-0 text-ouro-700" />
                      ) : (
                        <Lock className="h-3 w-3 shrink-0 text-stone-400" />
                      )}
                      <span className="flex-1 truncate text-stone-800">{s.titulo}</span>
                      <span className="shrink-0 font-mono text-[10px] text-stone-400">
                        {s.origem === 'GERADA'
                          ? 'gerada do curso'
                          : edicaoDe(livro.id, s.id)
                            ? 'escrita'
                            : 'texto de partida'}
                      </span>
                      {s.origem === 'EDITAVEL' && (
                        <button
                          type="button"
                          onClick={() => setEditando(s.id)}
                          aria-label={`Editar ${s.titulo}`}
                          className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ouro-800 hover:bg-ouro-100"
                        >
                          Editar
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
              <p className="text-[11px] leading-relaxed text-stone-500">
                As seções com cadeado nascem do curso. Editá-las aqui faria o livro e a plataforma
                divergirem — e a divergência apareceria meses depois, sem se saber qual está certo.
                As {secoesEditaveis(livro).length} tracejadas são do livro, e regenerar preserva o
                que você escrever nelas.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Prévia
              </h3>
              <Card variant="default" padding="lg" className="max-h-[28rem] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-serif text-xs leading-relaxed text-stone-800">
                  {[...livro.secoes]
                    .sort((a, b) => a.ordem - b.ordem)
                    .slice(0, 6)
                    .map((s) => s.conteudo)
                    .join('\n\n───\n\n')
                    .replace(/<!--[\s\S]*?-->/g, '')
                    .slice(0, 4000)}
                </pre>
              </Card>
            </section>
          </div>
        )}
      </PageLayout.Main>
    </PageLayout>
  );
};

/**
 * O editor de uma seção escrita do livro.
 *
 * Markdown puro, numa caixa de texto: é o formato do livro inteiro, e o que
 * `npm run livros` converte para impressão. Um editor visual aqui esconderia
 * justamente o que vai sair no papel.
 */
const EditorDaSecao: React.FC<{
  livro: LivroDoConservatorio;
  secao: SecaoDoLivro;
  edicao: SecaoEditadaDoLivro | null;
  editadaPor: string;
  onFechar: () => void;
  onGravou: () => void | Promise<void>;
}> = ({ livro, secao, edicao, editadaPor, onFechar, onGravou }) => {
  const [texto, setTexto] = useState(secao.conteudo);
  const [falha, setFalha] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  const gravar = async () => {
    setGravando(true);
    setFalha(null);
    try {
      await editorialService.salvarSecaoDeLivro({
        livro,
        secaoId: secao.id,
        conteudo: texto,
        editadaPor,
      });
      await onGravou();
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível gravar a seção.');
    } finally {
      setGravando(false);
    }
  };

  const reverter = async () => {
    await editorialService.reverterSecaoDeLivro(livro.id, secao.id);
    await onGravou();
  };

  return (
    <Card variant="default" padding="md" className="space-y-3 border-ouro-300">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-base font-bold text-stone-900">{secao.titulo}</h3>
          <p className="text-[11px] text-stone-500">
            {edicao
              ? `Escrita por ${edicao.editadaPor} em ${new Date(edicao.editadaEm).toLocaleDateString('pt-BR')}.`
              : 'Ainda com o texto de partida que o livro gera.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar o editor"
          className="rounded p-1 text-stone-500 hover:bg-stone-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          Texto em Markdown
        </span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={12}
          className="w-full rounded border border-stone-300 p-2 font-mono text-xs leading-relaxed text-stone-800"
        />
      </label>

      {!editadaPor && (
        <p className="text-[11px] text-stone-500">
          Entre com sua conta para gravar: toda edição leva autoria.
        </p>
      )}

      {falha && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {falha}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={gravar} disabled={gravando || !editadaPor}>
          <Save className="mr-1 h-3.5 w-3.5" /> Gravar seção
        </Button>
        {edicao && (
          <Button variant="secondary" size="sm" onClick={reverter}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Voltar ao texto de partida
          </Button>
        )}
      </div>
    </Card>
  );
};
