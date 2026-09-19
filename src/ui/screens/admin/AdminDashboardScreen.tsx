import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Users,
  Activity,
  FileCheck,
  Award,
  Flag,
  History,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const { navigate } = useRouter();

  const adminModules = [
    {
      id: 'users',
      title: 'Gestão de Usuários & Papéis',
      desc: 'Atribuição de papéis (Aluno, Músico, Professor, Admin), homologação e moderação de contas.',
      icon: Users,
      link: '/founder/users',
      badge: 'Controle de Acesso',
    },
    {
      id: 'engines',
      title: 'Gateway de Engines & Saúde',
      desc: 'Inspeção de latência e disponibilidade dos motores: Teoria Musical, Áudio/DSP, Partituras e IA.',
      icon: Activity,
      link: '/founder/engines',
      badge: 'Infraestrutura',
    },
    {
      id: 'content',
      title: 'Curadoria & Governança Curricular',
      desc: 'Homologação de planos de curso, ementas acadêmicas e validação de proveniência musicológica.',
      icon: FileCheck,
      link: '/founder/content',
      badge: 'Currículo Oficial',
    },
    {
      id: 'moderation',
      title: 'Fila de Moderação Institucional',
      desc: 'Auditoria de publicações sinalizadas pela comunidade, denúncias e conformidade ética.',
      icon: Flag,
      link: '/founder/moderation',
      badge: '0 Denúncias',
    },
    {
      id: 'credentials',
      title: 'Estúdio de Credenciais',
      desc: 'A matriz visual de badges, credenciais e certificados: cores, tipografia, logotipo, selo, QR e emissão.',
      icon: Award,
      link: '/founder/credentials',
      badge: 'Identidade & Emissão',
    },
    {
      id: 'audit',
      title: 'Trilha Imutável de Auditoria',
      desc: 'Logs criptográficos de autenticação, concessão de privilégios e transações sensíveis.',
      icon: History,
      link: '/founder/audit',
      badge: 'Logs Imutáveis',
    },
  ];

  return (
    <ScreenContainer
      id="admin-dashboard"
      title="Governança Institucional & Administração"
      subtitle="Console protegido de gestão da Conservatório Muscicapa. Todas as ações são auditadas e assinadas."
      badgeLabel="Acesso Restrito • ADMIN"
      badgeVariant="brand"
    >
      <div className="space-y-6">
        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Usuários Matriculados</span>
            <p className="text-2xl font-bold font-serif text-stone-900">1.240</p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Salas de Aula Ativas</span>
            <p className="text-2xl font-bold font-serif text-stone-900">42</p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Motores Operacionais</span>
            <p className="text-2xl font-bold font-serif text-emerald-700">4/4 (100%)</p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Eventos Auditados</span>
            <p className="text-2xl font-bold font-serif text-stone-900">8.920</p>
          </Card>
        </div>

        {/* Admin Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <Card
                key={mod.id}
                id={`admin-mod-${mod.id}`}
                variant="default"
                padding="lg"
                interactive
                className="space-y-3 flex flex-col justify-between cursor-pointer"
                onClick={() => navigate(mod.link)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded bg-stone-100 text-anil-800">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm">{mod.badge}</Badge>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-mono">Governança Auditada</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(mod.link);
                    }}
                  >
                    Gerenciar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </ScreenContainer>
  );
};
