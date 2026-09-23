import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { userRepository } from '../../../repositories/user.repository';
import { roomsRepository } from '../../../repositories/rooms.repository';
import { auditRepository } from '../../../repositories/audit.repository';
import {
  Users,
  Activity,
  FileCheck,
  Award,
  Flag,
  History,
  ArrowRight,
  Pencil,
  ClipboardList,
  Library,
  FileText,
} from 'lucide-react';

/**
 * O painel da administração.
 *
 * As quatro medidas aqui eram números CRAVADOS: "1.240 usuários matriculados",
 * "42 salas de aula ativas", "4/4 motores operacionais", "8.920 eventos
 * auditados" — numa plataforma que tem zero de cada um.
 *
 * Não era estado vazio mal desenhado: era número inventado posando de medição,
 * justamente na tela que existe para decidir. Um painel administrativo que
 * mente é pior que um painel ausente, porque decisões são tomadas a partir
 * dele.
 *
 * Agora cada número vem de uma contagem real, e `null` enquanto ela não
 * voltou — zero só aparece quando é zero medido.
 */
export const AdminDashboardScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [medidas, setMedidas] = useState<{
    usuarios: number;
    salas: number;
    eventos: number;
  } | null>(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      userRepository.listAll(),
      roomsRepository.listar(),
      auditRepository.listRecent(1000),
    ])
      .then(([usuarios, salas, eventos]) => {
        if (!vivo) return;
        setMedidas({
          usuarios: usuarios.length,
          salas: salas.length,
          eventos: eventos.length,
        });
      })
      .catch(() => {
        // Falhar em contar não autoriza inventar: fica sem número.
        if (vivo) setMedidas(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * AUD-12..15 — os cartões prometiam o que as telas não fazem: atribuir
   * papéis e homologar contas, homologar ementas, uma fila de denúncias com
   * "0 Denúncias", e uma trilha "imutável" de "logs criptográficos". Cada
   * cartão agora descreve a tela que abre.
   */
  const adminModules = [
    {
      id: 'users',
      title: 'Contas',
      desc: 'As contas que entraram por este navegador, com papel e data. Papel administrativo é concedido pelo servidor, não por aqui.',
      icon: Users,
      link: '/founder/users',
      badge: 'Consulta',
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
      id: 'licoes',
      title: 'Lições e exercícios',
      desc: 'Editar o conteúdo das lições bloco a bloco — texto, pentagrama, player, diagrama e verificação. Criar, remover e reordenar.',
      icon: Pencil,
      link: '/founder/licoes',
      badge: 'Engine editorial',
    },
    {
      id: 'artigos',
      title: 'Artigos da biblioteca',
      desc: 'Escrever e corrigir os artigos: cabeçalho no padrão, corpo em .md, citações com motivo e rodapé calculado.',
      icon: FileText,
      link: '/founder/artigos',
      badge: 'Engine editorial',
    },
    {
      id: 'livretos',
      title: 'Livretos e avaliações',
      desc: 'Os cadernos de exercício de cada curso: capítulos, questões, simulado e prova. É daqui que saem as 378 questões do nivelamento.',
      icon: ClipboardList,
      link: '/founder/booklets',
      badge: 'Banco de questões',
    },
    {
      id: 'biblioteca',
      title: 'Biblioteca do Conservatório',
      desc: 'Os livros de leitura e os cadernos de prática de cada curso, para ler, baixar e revisar.',
      icon: Library,
      link: '/founder/biblioteca',
      badge: 'Livros',
    },
    {
      id: 'content',
      title: 'Catálogo publicado',
      desc: 'Os cursos e módulos como o aluno os vê, com a grade de cada um. Para editar, use Lições, Artigos e Livretos.',
      icon: FileCheck,
      link: '/founder/content',
      badge: 'Consulta',
    },
    {
      id: 'moderation',
      title: 'Moderação',
      desc: 'Ainda não existe: não há como denunciar uma publicação. Os relatos de problema em exercícios chegam em Lições e exercícios.',
      icon: Flag,
      link: '/founder/moderation',
      badge: 'Não implementada',
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
      title: 'Trilha de auditoria',
      desc: 'O registro do servidor, assinado elo a elo, e o deste navegador: entradas, saídas e acessos negados.',
      icon: History,
      link: '/founder/audit',
      badge: 'Auditoria',
    },
  ];

  return (
    <ScreenContainer
      id="admin-dashboard"
      title="Governança Institucional & Administração"
      subtitle="Console de gestão do Conservatório Muscicapa. Só a administração entra aqui; o servidor confere a sessão."
      badgeLabel="Acesso Restrito • ADMIN"
      badgeVariant="brand"
    >
      <div className="space-y-6">
        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Medida rotulo="Contas registradas" valor={medidas?.usuarios} />
          <Medida rotulo="Salas de aula" valor={medidas?.salas} />
          <Medida rotulo="Eventos auditados" valor={medidas?.eventos} />
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Saúde dos motores</span>
            <button
              type="button"
              onClick={() => navigate('/founder/engines')}
              className="block text-left text-sm font-medium text-anil-700 underline-offset-2 hover:underline"
            >
              Medir agora
            </button>
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

/**
 * Uma medida.
 *
 * `undefined` é "ainda contando", e não zero. A distinção importa num painel:
 * zero medido é informação — "não há contas" —, enquanto zero exibido antes da
 * contagem é uma afirmação falsa que dura o tempo do carregamento.
 */
const Medida: React.FC<{ rotulo: string; valor: number | undefined }> = ({ rotulo, valor }) => (
  <Card variant="default" padding="md" className="space-y-1">
    <span className="text-xs text-stone-500 font-mono uppercase">{rotulo}</span>
    <p className="text-2xl font-bold font-serif text-stone-900">
      {valor === undefined ? (
        <span className="text-base font-normal text-stone-400">contando…</span>
      ) : (
        valor.toLocaleString('pt-BR')
      )}
    </p>
  </Card>
);
