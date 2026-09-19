import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyRepository } from '../../../repositories/academy.repository';
import { AcademyCourse, AcademyModule } from '../../../domain/academy';
import { FileCheck, ArrowLeft, BookOpen } from 'lucide-react';

/**
 * Conteúdo publicado.
 *
 * A tela listava dois "planos curriculares" escritos no código — Harmonia e
 * Contraponto na versão 2026.2, Teclados Históricos na 2026.3-beta, com
 * autores e contagens de módulos inventados — enquanto o catálogo real, com
 * cinco cursos e cento e vinte e seis capítulos, existia ao lado e não era
 * mostrado. O botão "Auditar ementa" abria um `alert`.
 *
 * Agora mostra o catálogo que a plataforma publica de fato, e "Ver a grade"
 * leva à grade daquele curso — a mesma que o aluno vê.
 */
interface CursoNaTela {
  curso: AcademyCourse;
  modulos: AcademyModule[];
}

export const AdminContentScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [itens, setItens] = useState<CursoNaTela[] | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const cursos = await academyRepository.listCourses();
      const compostos = await Promise.all(
        cursos.map(async (curso) => ({
          curso,
          modulos: await academyRepository.listModulesByCourse(curso.id),
        }))
      );
      if (ativo) setItens(compostos);
    })().catch(() => {
      if (ativo) setItens([]);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <ScreenContainer
      id="admin-content"
      title="Conteúdo publicado"
      subtitle="Cursos que o Conservatório publica no catálogo, com a grade de cada um."
      badgeLabel="Console"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao console',
        icon: ArrowLeft,
        onClick: () => navigate('/admin'),
      }}
      emptyProps={{
        title: 'Nenhum curso publicado',
        description: 'O catálogo está vazio nesta instalação.',
      }}
      state={itens === null ? 'loading' : itens.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-4">
        {(itens ?? []).map(({ curso, modulos }) => (
          <Card key={curso.id} variant="default" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-anil-800" aria-hidden="true" />
                <h3 className="font-serif text-base font-bold text-stone-900">{curso.title}</h3>
              </div>
              <Badge variant={curso.isPublished ? 'brand' : 'neutral'} size="sm">
                {curso.isPublished ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-stone-500">
              <span>
                {modulos.length} capítulo{modulos.length === 1 ? '' : 's'}
              </span>
              <span aria-hidden="true">•</span>
              <span>{curso.workloadHours} h de carga</span>
              <span aria-hidden="true">•</span>
              <span>
                {curso.competencies.length} competência{curso.competencies.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/academy/course/${curso.id}/curriculum`)}
              >
                <BookOpen className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Ver a grade
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};
