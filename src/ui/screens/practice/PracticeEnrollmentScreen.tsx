import React, { useState } from 'react';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { EnrollmentForm } from '../../components/practice/EnrollmentForm';
import { ProfileMeters, Meter, Badge } from '../../components/practice/ProfileMeters';
import { pathRepository } from '../../../repositories/practice-path.repository';
import { DIMENSIONS } from '../../../domain/music-grammar';

/**
 * Matrícula no percurso, e as réguas de quem já está nele.
 *
 * As duas telas moram juntas porque respondem à mesma pergunta em momentos
 * diferentes: **onde eu estou neste Laboratório?** Antes de entrar, isso é a
 * matrícula; depois, são as réguas.
 *
 * Como o resto do Laboratório, as duas existiam testadas e sem rota.
 */
export const PracticeEnrollmentScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();
  const [matriculado, setMatriculado] = useState(false);
  const [meters, setMeters] = useState<Meter[] | null>(null);
  const [meterAtiva, setMeterAtiva] = useState('percurso');

  React.useEffect(() => {
    if (!userId) return;
    let vivo = true;
    pathRepository.forUser(userId).then((record) => {
      if (!vivo) return;
      setMatriculado(record.completed.length > 0);
      setMeters([
        {
          id: 'percurso',
          nome: 'Nós concluídos',
          descricao: 'Cada nó é uma seção do percurso, e abre os que dependem dela.',
          valor: record.completed.length,
          max: Object.keys(DIMENSIONS).length,
        },
        {
          id: 'meta',
          nome: 'Meta de constância',
          descricao:
            record.streakGoal === null
              ? 'Você ainda não escolheu uma. Ela aparece ao fim de uma lição.'
              : 'Escolhida por você, e trocável a qualquer momento.',
          valor: record.streakGoal ?? 0,
          unit: record.streakGoal ? 'dias' : undefined,
        },
      ]);
    });
    return () => {
      vivo = false;
    };
  }, [userId]);

  if (matriculado && meters) {
    return (
      <ScreenContainer
        id="practice-profile"
        title="Suas réguas"
        subtitle="Por onde o seu progresso no Laboratório é medido."
        badgeLabel="Percurso"
        badgeVariant="neutral"
        secondaryActions={[
          { label: 'Voltar ao percurso', onClick: () => navigate('/practice/path') },
        ]}
      >
        <div className="mx-auto w-full max-w-lg px-4 py-6">
          <ProfileMeters
            meters={meters}
            activeMeterId={meterAtiva}
            onChangeMeter={setMeterAtiva}
            badges={SEM_EMBLEMAS}
          />
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id="practice-enrollment"
      title="Matrícula no percurso"
      subtitle="Duas perguntas, e nada de teste antes de começar."
      badgeLabel="Laboratório"
      badgeVariant="neutral"
    >
      <EnrollmentForm
        pathName="Teoria musical"
        onEnroll={() => navigate('/practice/path')}
      />
    </ScreenContainer>
  );
};

/**
 * Nenhum emblema, porque nenhum existe ainda.
 *
 * O catálogo está escrito em `78_REWARDS_AND_PASSPORT.md` e o domínio é a fase
 * D do backlog. Até lá a lista é vazia — e a tela já sabe dizer "0 de 0" sem
 * inventar coleção.
 */
const SEM_EMBLEMAS: Badge[] = [];
