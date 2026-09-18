import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/base/Card';
import { HelpCircle, Terminal, MessageSquare, CheckCircle2 } from 'lucide-react';

export const HelpScreen: React.FC = () => {

  const faqs = [
    {
      q: 'Como funciona a validação de evidências e insígnias?',
      a: 'Todas as gravações e exercícios submetidos são analisados pelos motores analíticos da plataforma e avaliados pelo docente da sua cátedra. Uma vez aprovados, um hash SHA-256 é registrado no portfólio de quem submeteu.',
    },
    {
      q: 'Quais os requisitos de hardware para usar a DAW e o Afinador?',
      a: 'Qualquer interface USB padrão com suporte a Web Audio API (Chrome, Firefox, Safari ou Edge moderno). Recomendamos utilizar fones de ouvido para evitar realimentação sonora no microfone.',
    },
    {
      q: 'Como solicitar titularidade de Professor na plataforma?',
      a: 'A titularidade docente é concedida pela Governança Acadêmica após homologação curricular. Entre em contato com a Secretaria Acadêmica.',
    },
  ];

  return (
    <ScreenContainer
      id="help-center"
      title="Central de Ajuda & Documentação"
      subtitle="Guias operacionais, orientações musicológicas e canais de suporte ao estudante e docente."
      badgeLabel="Suporte Acadêmico"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Abrir Chamado',
        icon: MessageSquare,
        onClick: () => alert('Formulário de suporte institucional despachado.'),
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* System Health Status */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Todos os serviços e motores de áudio operando normalmente.</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-800">Status 100% Online</span>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-anil-800" />
            Perguntas Frequentes
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={idx} variant="default" padding="lg" className="space-y-1.5">
                <h3 className="font-serif font-bold text-sm text-stone-900">{faq.q}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <Card variant="default" padding="lg" className="space-y-3">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-anil-800" />
            Atalhos Universais do Teclado
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between">
              <span>Espaço</span> <span className="text-stone-500">Play / Pause</span>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between">
              <span>Ctrl + K</span> <span className="text-stone-500">Busca Global</span>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200 flex justify-between">
              <span>Esc</span> <span className="text-stone-500">Fechar Janela</span>
            </div>
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
