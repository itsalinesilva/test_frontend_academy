import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { CredentialCanvas, baixarComoSvg } from '../../components/credentials/CredentialCanvas';
import { credentialService } from '../../../services/application/credential.service';
import { ResultadoVerificacao, EXPLICACAO_SITUACAO } from '../../../domain/credential';
import { ShieldCheck, AlertTriangle, Download, Link2, Search } from 'lucide-react';

/**
 * Página pública de um documento emitido — o destino do QR e do link.
 *
 * É a peça que fecha o ciclo: sem ela, o QR impresso no certificado não leva
 * a lugar nenhum e o código não serve para nada. Por isso ela é PÚBLICA e não
 * exige sessão: quem verifica um certificado é um empregador, uma banca, uma
 * secretaria — gente que não tem conta na plataforma e não vai criar uma para
 * conferir um documento.
 *
 * O que ela mostra é o que o documento AFIRMA e se essa afirmação confere com
 * o registro. Nada do perfil de quem recebeu é exposto aqui.
 */
export const CredentialVerifyScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const codigoDaUrl = params.codigo;

  const [entrada, setEntrada] = useState(codigoDaUrl ?? '');
  const [resultado, setResultado] = useState<ResultadoVerificacao | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(codigoDaUrl));

  const verificar = useCallback(async (codigo: string) => {
    setIsLoading(true);
    try {
      setResultado(await credentialService.verificar(codigo));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (codigoDaUrl) {
      setEntrada(codigoDaUrl);
      verificar(codigoDaUrl);
    }
  }, [codigoDaUrl, verificar]);

  const situacao = resultado?.situacao;
  const explicacao = situacao ? EXPLICACAO_SITUACAO[situacao] : null;
  const credencial = resultado && 'credencial' in resultado ? resultado.credencial : null;

  const aparencia =
    situacao === 'VALIDA'
      ? { borda: 'border-emerald-300', fundo: 'bg-emerald-50', texto: 'text-emerald-900', Icone: ShieldCheck }
      : situacao === 'EXPIRADA'
        ? { borda: 'border-amber-300', fundo: 'bg-amber-50', texto: 'text-amber-900', Icone: AlertTriangle }
        : { borda: 'border-red-300', fundo: 'bg-red-50', texto: 'text-red-900', Icone: AlertTriangle };

  return (
    <PageLayout
      id="credential-verify"
      form="focus"
      density="editorial"
      state={isLoading ? 'loading' : 'content'}
      loadingMessage="Consultando o registro..."
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">Verificação de documento</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
            Todo badge, credencial e certificado emitido pela Academia carrega um código.
            Digite-o abaixo — ou escaneie o QR impresso no documento — para conferir se ele
            consta no registro e se o conteúdo confere com o que foi emitido.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Main>
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (entrada.trim()) {
                navigate(`/credential/${entrada.trim().toUpperCase()}`);
                verificar(entrada);
              }
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="credential-code"
                type="text"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value.toUpperCase())}
                placeholder="CMU-XXXX-XXXX"
                aria-label="Código de verificação"
                className="w-full rounded-md border border-stone-300 py-2.5 pl-9 pr-3 font-mono text-sm tracking-wider text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
              />
            </div>
            <Button variant="primary" size="md" type="submit">
              Verificar
            </Button>
          </form>

          {explicacao && (
            <Card variant="default" padding="lg" className={`space-y-2 ${aparencia.borda} ${aparencia.fundo}`}>
              <p className={`flex items-center gap-2 font-serif text-base font-bold ${aparencia.texto}`}>
                <aparencia.Icone className="h-5 w-5 shrink-0" />
                {explicacao.titulo}
              </p>
              <p className={`text-sm leading-relaxed ${aparencia.texto}`}>{explicacao.texto}</p>

              {situacao === 'REVOGADA' && credencial?.motivoRevogacao && (
                <p className="border-t border-red-200 pt-2 text-xs text-red-800">
                  Motivo registrado: {credencial.motivoRevogacao}
                </p>
              )}
            </Card>
          )}

          {credencial && (
            <>
              <Card variant="default" padding="lg" className="space-y-3">
                <h2 className="font-serif text-sm font-bold text-stone-900">O que este documento afirma</h2>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                  {(
                    [
                      ['Titular', credencial.dados.nomeTitular],
                      ['Documento', credencial.dados.tituloDocumento],
                      ['Curso', credencial.dados.nomeCurso],
                      ['Carga horária', credencial.dados.cargaHoraria],
                      ['Emitido em', credencial.dados.dataEmissao],
                      ['Válido até', credencial.dados.dataValidade],
                      ['Instituição', credencial.dados.nomeInstituicao],
                      ['Competências', credencial.dados.competencias],
                    ] as [string, string | undefined][]
                  )
                    .filter(([, v]) => Boolean(v))
                    .map(([rotulo, valor]) => (
                      <div key={rotulo} className="flex flex-col border-b border-stone-100 py-1">
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                          {rotulo}
                        </dt>
                        <dd className="text-stone-800">{valor}</dd>
                      </div>
                    ))}
                </dl>

                <div className="space-y-1 border-t border-stone-100 pt-3 font-mono text-[11px]">
                  <p className="text-stone-500">Impressão criptográfica registrada na emissão</p>
                  <p className="break-all text-stone-700">{credencial.sha256Hash}</p>
                  {resultado?.situacao === 'ADULTERADA' && (
                    <>
                      <p className="pt-1 text-red-700">Recalculada agora — não confere</p>
                      <p className="break-all text-red-700">{resultado.hashRecalculado}</p>
                    </>
                  )}
                </div>
              </Card>

              <Card variant="default" padding="lg" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-sm font-bold text-stone-900">Documento</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        baixarComoSvg('credential-document', `${credencial.codigo}.svg`)
                      }
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(credencial.dados.urlVerificacao);
                      }}
                    >
                      <Link2 className="mr-1 h-3.5 w-3.5" /> Copiar link
                    </Button>
                  </div>
                </div>

                {/* O desenho vem do snapshot congelado na emissão: é o mesmo
                    documento que a pessoa recebeu, não uma re-renderização
                    com a identidade visual de hoje. */}
                <div className="flex justify-center rounded-md bg-stone-100 p-4">
                  <CredentialCanvas
                    id="credential-document"
                    template={credencial.templateSnapshot}
                    dados={credencial.dados}
                    className="max-w-full rounded shadow-lg"
                    larguraExibicao={credencial.tipo === 'BADGE' ? 300 : 640}
                  />
                </div>
              </Card>
            </>
          )}

          {!resultado && !codigoDaUrl && (
            <p className="text-xs leading-relaxed text-stone-500">
              O código tem o formato <span className="font-mono">PREFIXO-XXXX-XXXX</span> e usa
              apenas caracteres que não se confundem ao serem lidos de um papel — sem zero e
              letra O, sem um e letra I.
            </p>
          )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
