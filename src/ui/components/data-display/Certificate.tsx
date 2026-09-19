import React from 'react';
import { Award, ShieldCheck, Printer, Share2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../base/Button';

export interface CertificateProps {
  id?: string;
  studentName: string;
  courseTitle: string;
  programTitle?: string;
  workloadHours: number;
  verificationCode: string;
  sha256Hash: string;
  issuedAt: string;
  instructorName: string;
  instructorTitle: string;
  competencies: string[];
  institution?: string;
  onPrint?: () => void;
  onShare?: () => void;
  className?: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  id = 'academic-certificate',
  studentName,
  courseTitle,
  programTitle,
  workloadHours,
  verificationCode,
  sha256Hash,
  issuedAt,
  instructorName,
  instructorTitle,
  competencies,
  institution = 'Conservatório Muscicapa',
  onPrint,
  onShare,
  className,
}) => {
  return (
    <div className={twMerge('flex flex-col gap-4 max-w-4xl mx-auto select-none', className)}>
      {/* Certificate Formal Paper */}
      <div
        id={id}
        className="relative bg-white border-8 border-double border-stone-800 p-8 sm:p-12 shadow-md rounded-xs flex flex-col justify-between text-center overflow-hidden"
      >
        {/* Subtle Watermark Corner Seals */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-anil-800/40 pointer-events-none" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-anil-800/40 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-anil-800/40 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-anil-800/40 pointer-events-none" />

        {/* Header & Crest */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-anil-800 text-white flex items-center justify-center shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <span className="font-serif tracking-widest text-xs uppercase font-bold text-stone-600 mt-2">
            {institution}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-wide">
            CERTIFICADO DE CONCLUSÃO
          </h2>
          <div className="w-24 h-0.5 bg-anil-800 mx-auto mt-1" />
        </div>

        {/* Body Text */}
        <div className="my-8 flex flex-col items-center">
          <p className="text-sm sm:text-base text-stone-600 italic">
            Certificamos solenemente que
          </p>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 my-2 tracking-tight">
            {studentName}
          </h3>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            concluiu com distinção e rigorosa avaliação formal a disciplina de
          </p>
          <h4 className="text-lg sm:text-xl font-bold text-red-900 mt-1 mb-2">
            {courseTitle}
          </h4>
          {programTitle && (
            <p className="text-xs text-stone-500 mb-2">
              como parte integrante do programa acadêmico <strong className="text-stone-700">{programTitle}</strong>
            </p>
          )}
          <p className="text-xs sm:text-sm text-stone-600">
            Carga horária total auditada de <strong>{workloadHours} horas acadêmicas</strong>.
          </p>

          {/* Competencies */}
          {competencies.length > 0 && (
            <div className="mt-6 max-w-2xl">
              <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block mb-2">
                Competências Formais Demonstradas
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {competencies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-stone-50 text-stone-800 border border-stone-200 px-2.5 py-1 rounded font-medium"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signatures & Verification */}
        <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="text-left space-y-1">
            <div className="w-48 border-b border-stone-400 pb-1 text-xs font-serif font-bold text-stone-800">
              {instructorName}
            </div>
            <p className="text-[11px] text-stone-500">{instructorTitle}</p>
            <p className="text-[10px] text-stone-400">Data de emissão: {new Date(issuedAt).toLocaleDateString()}</p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Autenticidade Criptográfica Verificada
            </div>
            <div className="text-[11px] font-mono text-stone-700">
              Código: <strong className="text-stone-900">{verificationCode}</strong>
            </div>
            <div className="text-[9px] font-mono text-stone-400 truncate max-w-xs ml-auto" title={sha256Hash}>
              SHA-256: {sha256Hash}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 px-2">
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint} leadingIcon={<Printer className="w-4 h-4" />}>
            Imprimir Certificado
          </Button>
        )}
        {onShare && (
          <Button variant="primary" size="sm" onClick={onShare} leadingIcon={<Share2 className="w-4 h-4" />}>
            Compartilhar no LinkedIn
          </Button>
        )}
      </div>
    </div>
  );
};
