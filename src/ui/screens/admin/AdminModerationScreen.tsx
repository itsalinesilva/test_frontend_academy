import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

/**
 * A fila de moderação.
 *
 * O QUE ESTA TELA DIZIA, E POR QUE ERA GRAVE
 * ------------------------------------------
 * "Comunidade em Plena Conformidade". "Não constam denúncias pendentes ou
 * violações de conduta registradas no sistema nas últimas 48 horas."
 *
 * Nada disso tinha sido verificado. Não havia — e não há — mecanismo de
 * denúncia: nenhum botão de reportar, nenhuma fila, nenhuma consulta. A tela
 * afirmava um estado apurado que ninguém apurou, e o fazia justamente onde a
 * fundadora olharia para decidir se precisa agir.
 *
 * É a mesma família do ranking com Bach em primeiro: não é tela incompleta, é
 * afirmação falsa. E aqui a consequência é pior, porque "está tudo em ordem" é
 * o tipo de informação sobre a qual se decide **não** fazer nada.
 *
 * O QUE ELA DIZ AGORA
 * -------------------
 * Que a moderação ainda não existe, e o que falta para existir. Ausência
 * declarada é informação; ausência disfarçada de conformidade é mentira.
 */
export const AdminModerationScreen: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <ScreenContainer
      id="admin-moderation"
      title="Moderação"
      subtitle="Supervisão de interações da comunidade e proteção ao público infantil."
      badgeLabel="Não implementada"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao console',
        icon: ArrowLeft,
        onClick: () => navigate('/founder'),
      }}
    >
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              A moderação ainda não existe
            </h3>
            <p className="text-sm leading-relaxed text-stone-600">
              Esta tela não tem fila porque não há de onde uma fila vir: a plataforma ainda não
              oferece nenhuma forma de denunciar uma publicação, e portanto nenhuma denúncia foi
              registrada.
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              Enquanto isso for verdade, esta tela não vai dizer que a comunidade está em
              conformidade — <strong>ninguém conferiu</strong>, e afirmar o contrário seria o
              tipo de informação sobre a qual se decide não agir.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            O que falta para esta tela funcionar
          </p>
          <ol className="mt-2 space-y-1.5 text-sm text-stone-600">
            <li>1. Botão de denunciar na publicação e na resposta do fórum</li>
            <li>2. Registro da denúncia, com autor, motivo e alvo</li>
            <li>3. Fila aqui, com as ações de manter, ocultar e advertir</li>
            <li>4. Trilha de auditoria de cada decisão de moderação</li>
          </ol>
          <p className="mt-3 text-xs text-stone-500">
            Registrado em <code className="font-mono">CLAUDE_TODO.md</code>, fase M.
          </p>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="text-sm font-medium text-anil-700 underline-offset-2 hover:underline"
          >
            Ver a Comunidade
          </button>
        </div>
      </Card>
    </ScreenContainer>
  );
};
