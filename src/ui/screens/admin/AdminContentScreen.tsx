import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { FileCheck, ArrowLeft, Plus } from 'lucide-react';

export const AdminContentScreen: React.FC = () => {
  const { navigate } = useRouter();

  const curriculums = [
    {
      id: 'cur-harmonia',
      title: 'Plano Curricular: Harmonia & Contraponto Tonal',
      author: 'Comissão Pedagógica',
      status: 'Homologado',
      modulesCount: 4,
      version: '2026.2',
    },
    {
      id: 'cur-teclados',
      title: 'Plano Curricular: Cátedra de Teclados Históricos',
      author: 'Prof. Gabriel Carvalho',
      status: 'Em Revisão',
      modulesCount: 6,
      version: '2026.3-beta',
    },
  ];

  return (
    <ScreenContainer
      id="admin-content"
      title="Governança de Conteúdo & Currículo"
      subtitle="Validação e homologação de planos de ensino, ementas de cursos e acervo musicológico oficial."
      badgeLabel="Curadoria Oficial"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Propor Novo Curso',
        icon: Plus,
        onClick: () => alert('Abertura de formulário de proposição de nova disciplina acadêmica.'),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Console',
          icon: ArrowLeft,
          onClick: () => navigate('/admin'),
        },
      ]}
    >
      <div className="space-y-4">
        {curriculums.map((c) => (
          <Card key={c.id} variant="default" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-anil-800" />
                <h3 className="font-serif font-bold text-base text-stone-900">{c.title}</h3>
              </div>
              <Badge variant={c.status === 'Homologado' ? 'brand' : 'neutral'}>
                {c.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
              <span>Autor: {c.author}</span>
              <span>•</span>
              <span>{c.modulesCount} módulos formativos</span>
              <span>•</span>
              <span>Edição: {c.version}</span>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => alert(`Inspecionar grade de ${c.title}`)}>
                Auditar Ementa
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};
