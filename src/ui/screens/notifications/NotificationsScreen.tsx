import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { ArrowLeft, BellOff } from 'lucide-react';

/**
 * A central de notificações.
 *
 * O QUE ESTA TELA MOSTRAVA
 * ------------------------
 * Três notificações escritas à mão, a qualquer pessoa que abrisse:
 *
 *   "Sua submissão de Harmonia SATB recebeu parecer do Prof. Gabriel Carvalho"
 *   "O Módulo II de Contraponto Modal foi liberado para sua turma"
 *   "Aline Silva mencionou você no tópico sobre a Fuga BWV 1001"
 *
 * Não existe Prof. Gabriel Carvalho. Não existe módulo de Contraponto Modal.
 * Não existe tópico sobre a BWV 1001 — o fórum está vazio. E o pior: o "Marcar
 * todas como lidas" funcionava, então a tela parecia viva enquanto mentia
 * sobre trabalho corrigido e sobre alguém ter chamado a pessoa pelo nome.
 *
 * O QUE ELA MOSTRA AGORA
 * ----------------------
 * Nada, porque não há nada: a plataforma ainda não emite notificação nenhuma.
 * Não há domínio, repositório nem evento que a produza.
 *
 * Ausência declarada é informação. Ausência preenchida com exemplo é pior que
 * tela em branco, porque a pessoa age sobre ela — vai procurar o parecer do
 * professor que não existe.
 */
export const NotificationsScreen: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <ScreenContainer
      id="notifications"
      title="Notificações"
      subtitle="Avisos sobre as suas disciplinas, avaliações e menções."
      badgeLabel="Nenhuma"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar',
        icon: ArrowLeft,
        onClick: () => navigate('/'),
      }}
    >
      <Card variant="default" padding="lg" className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-start gap-3">
          <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Você não tem notificações
            </h3>
            <p className="text-sm leading-relaxed text-stone-600">
              A plataforma ainda não emite avisos. Quando emitir, aparecerão aqui as correções
              das suas atividades, as lições liberadas nos seus cursos e as menções a você na
              Comunidade.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            O que falta para esta tela funcionar
          </p>
          <ol className="mt-2 space-y-1.5 text-sm text-stone-600">
            <li>1. Domínio de notificação, com tipo, alvo e estado de leitura</li>
            <li>2. Emissão nos pontos que já existem: correção, publicação de lição, menção</li>
            <li>3. Repositório por usuário — notificação de alguém é dado de alguém</li>
          </ol>
          <p className="mt-3 text-xs text-stone-500">
            Registrado em <code className="font-mono">CLAUDE_TODO.md</code>, fase M.
          </p>
        </div>
      </Card>
    </ScreenContainer>
  );
};
