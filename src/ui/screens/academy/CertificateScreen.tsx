import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCertificate } from '../../../domain/academy';
import { RESSALVA_CURSO_LIVRE } from '../../../domain/credential-design';
import {
  GraduationCap,
  ShieldCheck,
  Download,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const CertificateScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const certificateId = params.id || '';

  const [certificate, setCertificate] = useState<AcademyCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const cert = await academyService.getCertificate(certificateId);
        setCertificate(cert);
      } catch (err) {
        console.error('Error loading certificate:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);

  if (!certificate && !isLoading) {
    return (
      <ScreenContainer
        id="certificate-not-found"
        title="Certificado Acadêmico"
        subtitle="Certificado não localizado."
        emptyProps={{
          title: 'Certificado não encontrado',
          description: `O código [${certificateId}] não corresponde a um registro válido.`,
          actionLabel: 'Voltar ao Meu Aprendizado',
          onAction: () => navigate('/academy/my-learning'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <ScreenContainer
      id={`certificate-view-${certificateId}`}
      title="Certificado"
      subtitle="Comprovante de conclusão do curso e de aprovação na avaliação final."
      badgeLabel="Autenticado"
      badgeVariant="brand"
      primaryAction={{
        label: 'Imprimir / Salvar PDF',
        icon: Download,
        onClick: handlePrint,
      }}
      secondaryActions={[
        {
          label: 'Meu Histórico',
          icon: ArrowLeft,
          onClick: () => navigate('/academy/history'),
        },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Printable Formal Diploma Card */}
        <div
          id="formal-certificate-sheet"
          className="bg-white border-8 border-stone-800 p-8 sm:p-12 rounded-xl shadow-lg relative overflow-hidden space-y-8 print:border-4 print:p-6"
        >
          {/* Watermark / Seal Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <GraduationCap className="w-96 h-96 text-stone-900" />
          </div>

          {/* Institutional Header */}
          <div className="text-center space-y-2 border-b-2 border-stone-800 pb-6">
            {/*
              Dizia "ACADEMIA MUSICAL DIGITAL — CÁTEDRA DE ENSINO SUPERIOR
              LIVRE". Dois erros no mesmo cabeçalho, e o segundo é sério:
              "ensino superior" é categoria regulada, e o Conservatório não a
              oferece. Quem lesse o certificado poderia entender graduação
              onde há curso livre — e quem mais perde com isso é a pessoa que
              apresenta o documento.
            */}
            <span className="text-xs font-mono uppercase tracking-widest text-stone-600 block">
              CONSERVATÓRIO MUSCICAPA • COURSE FREE DE QUALIFICAÇÃO MUSICAL
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
              CERTIFICADO DE MÉRITO ACADÊMICO
            </h1>
            <p className="text-xs text-stone-500 font-sans">
              Emitido mediante conclusão integral do curso e aprovação na avaliação final
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="text-center space-y-6 py-4">
            <p className="text-sm sm:text-base text-stone-700 font-serif leading-relaxed">
              Certificamos que o acadêmico(a)
            </p>

            <div className="font-serif font-bold text-2xl sm:text-3xl text-red-900 underline decoration-stone-300 underline-offset-8">
              {certificate?.userName || 'Acadêmico'}
            </div>

            <p className="text-sm sm:text-base text-stone-700 font-serif leading-relaxed max-w-2xl mx-auto">
              concluiu com êxito todas as exigências curriculares, audições de percepção acústica e avaliações somativas da disciplina:
            </p>

            <div className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
              {certificate?.courseTitle}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 font-mono">
              Carga Horária: {certificate?.workloadHours} horas • Nível: {certificate?.level} • Aproveitamento Final: {certificate?.scorePercentage}%
            </p>
          </div>

          {/* Competencies summary */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-2">
            <span className="font-mono uppercase text-stone-500 font-bold block text-[10px]">
              Competências Formais Homologadas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans">
              {certificate?.competencies.map((comp, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Cryptographic Hashes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-2 border-stone-800">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Corpo Docente & Cátedra</span>
              <div className="font-serif font-bold text-stone-900 text-sm">{certificate?.instructorName}</div>
              <div className="text-[11px] text-stone-500">Coordenação Curricular da Academia</div>
            </div>

            <div className="space-y-1 text-center sm:text-right font-mono text-[10px] text-stone-500">
              <div>Código de Verificação: <strong className="text-stone-900">{certificate?.verificationCode}</strong></div>
              <div>Data de Emissão: {certificate ? new Date(certificate.issuedAt).toLocaleDateString('pt-BR') : ''}</div>
              <div className="truncate">Hash SHA-256: {certificate?.cryptographicHash}</div>
            </div>
          </div>
          {/*
            Ressalva de curso livre — a mesma frase que `CredentialCanvas`
            desenha no rodapé de toda credencial, aqui também. Ela precisa
            estar no documento IMPRESSO, e não apenas na tela ao redor dele:
            é o papel que chega ao empregador.
          */}
          <p className="border-t border-stone-200 pt-4 text-center text-[10px] leading-relaxed text-stone-500">
            {RESSALVA_CURSO_LIVRE}
          </p>
        </div>

        {/* Verification & Sharing info */}
        <Card variant="muted" padding="md" className="flex flex-col sm:flex-row items-center justify-between gap-4 border-stone-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs text-stone-700">
              <strong>Registro Auditado:</strong> Este certificado está vinculado permanentemente ao seu Perfil Único sob a lente <em>Academic</em> e compõe o Portfólio de Evidências.
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            Ver no Meu Perfil
          </Button>
        </Card>
      </div>
    </ScreenContainer>
  );
};
