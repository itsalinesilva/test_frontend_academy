import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { BookOpen, Music, Compass, Sparkles } from 'lucide-react';

interface AboutTabProps {
  profile: UnifiedProfileRecord;
}

export const AboutTab: React.FC<AboutTabProps> = ({ profile }) => {
  return (
    <div id="profile-about-tab" className="space-y-6">
      {/* Bio Statement */}
      <Card id="about-card-biography" variant="default" padding="lg">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
          <BookOpen className="w-4 h-4 text-amber-800" />
          <h2 className="font-serif text-base font-bold text-stone-900">
            Trajetória Artística & Formação Acadêmica
          </h2>
        </div>
        <div className="mt-4 text-sm text-stone-700 leading-relaxed space-y-4">
          <p>
            {profile.biography}
          </p>
          <p>
            Com sólida formação nos repertórios polifônicos e nas práticas interpretativas historicamente orientadas, 
            dedica-se à investigação dos tratados musicais dos séculos XVII e XVIII, com especial ênfase nas obras de 
            Johann Sebastian Bach, François Couperin e Domenico Scarlatti.
          </p>
          <p>
            Atua simultaneamente como recitalista, cravista de baixo contínuo e docente de teoria analítica e contraponto 
            rigoroso, defendendo a convergência entre pesquisa filológica, audição analítica e virtuosismo técnico expressivo.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aesthetic Principles & Philosophical Method */}
        <Card id="about-card-philosophy" variant="default" padding="md">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
            <Compass className="w-4 h-4 text-stone-700" />
            <h3 className="font-serif text-sm font-bold text-stone-900">
              Princípios Estéticos & Abordagem Interpretativa
            </h3>
          </div>
          <ul className="mt-4 space-y-3 text-xs text-stone-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
              <span>
                <strong>Prática Historicamente Informada:</strong> Fidelidade aos tratados de época (C.P.E. Bach, Quantz, Türk) associada à expressividade orgânica e retórica barroca.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
              <span>
                <strong>Contraponto e Arquitetura:</strong> Clareza polifônica em cada voz individual, respeitando hierarquias de sujeito, contrassujeito e modulações texturais.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
              <span>
                <strong>Temperamentos Históricos:</strong> Domínio prático de afinações desiguais (Valotti, Werkmeister III, Meio-Tom) e sua cor tonal inerente.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
              <span>
                <strong>Pedagogia Integrada:</strong> O aluno não deve apenas reproduzir notas mecanicamente, mas compreender a gramática harmônica e estrutural subjacente.
              </span>
            </li>
          </ul>
        </Card>

        {/* Repertoire Specialties & Influences */}
        <Card id="about-card-specialties" variant="default" padding="md">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-sm font-bold text-stone-900">
              Especialidades & Referências de Pesquisa
            </h3>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-stone-700 block mb-2 uppercase tracking-wider">
                Especialidades Canônicas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.specialties || [
                  'Contraponto Bachiano',
                  'Cravo Histórico',
                  'Baixo Contínuo',
                  'Harmonia Funcional',
                  'Música de Câmara',
                ]).map((spec, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-700 block mb-2 uppercase tracking-wider">
                Compositores Centrais no Dossiê
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'J.S. Bach (1685–1750)',
                  'François Couperin (1668–1733)',
                  'Domenico Scarlatti (1685–1757)',
                  'Girolamo Frescobaldi (1583–1643)',
                  'Henry Purcell (1659–1695)',
                  'Johannes Brahms (1833–1897)',
                ].map((comp, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-stone-100 text-stone-800 border border-stone-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Instruments & Affiliations */}
      <Card id="about-card-instruments" variant="default" padding="md">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
          <Music className="w-4 h-4 text-stone-800" />
          <h3 className="font-serif text-sm font-bold text-stone-900">
            Instrumentos Oficiais & Características Técnicas
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-xs font-bold text-stone-900 block">Cravo Histórico Francês</span>
            <span className="text-[11px] text-stone-600 block mt-1">2 Manuais, registro de 8', 8', 4' e luth. Cópia Blanchet.</span>
            <span className="text-[10px] text-amber-800 font-mono mt-2 block">Diapasão A415</span>
          </div>

          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-xs font-bold text-stone-900 block">Piano de Concerto</span>
            <span className="text-[11px] text-stone-600 block mt-1">Steinway & Sons Modelo B (Cauda Três-Quartos).</span>
            <span className="text-[10px] text-amber-800 font-mono mt-2 block">Diapasão A440</span>
          </div>

          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-xs font-bold text-stone-900 block">Cravo Flamengo</span>
            <span className="text-[11px] text-stone-600 block mt-1">1 Manual, sonoridade clara e incisiva para sonatas italianas.</span>
            <span className="text-[10px] text-amber-800 font-mono mt-2 block">Diapasão A415</span>
          </div>

          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-xs font-bold text-stone-900 block">Órgão Positivo</span>
            <span className="text-[11px] text-stone-600 block mt-1">Órgão de tubos de madeira de 4 registros para baixo contínuo.</span>
            <span className="text-[10px] text-amber-800 font-mono mt-2 block">Transpositor 415 / 440</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
