import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { CredentialCanvas, baixarComoSvg } from '../../components/credentials/CredentialCanvas';
import { AssetUploader } from '../../components/credentials/AssetUploader';
import { credentialService } from '../../../services/application/credential.service';
import {
  TemplateCredencial,
  TipoCredencial,
  DadosEmissao,
  ROTULOS_TIPO,
  DESCRICOES_TIPO,
  CANVAS,
  especificacoesImagem,
  SlotImagem,
  ProblemaTemplate,
} from '../../../domain/credential-design';
import {
  Copy,
  Download,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Type,
  Palette,
  ImageIcon,
  Lock,
} from 'lucide-react';

/**
 * Estúdio de Credenciais — a matriz de badges, credenciais e certificados.
 *
 * A identidade visual da plataforma ainda não foi decidida. Esta tela existe
 * para que isso não seja um bloqueio: a ESTRUTURA dos documentos fica pronta
 * agora, e quando houver logotipo, nome e paleta, é só preencher — todos os
 * documentos passam a sair com a identidade nova, sem tocar em código.
 *
 * Por que o editor não é de arrastar e soltar: posição e tamanho vêm do
 * template porque um certificado com o nome fora da caixa é um documento
 * inválido. Liberdade de composição aqui não compensa esse risco. O que é
 * livre são as cores, as tipografias, as imagens e os textos.
 */

const DADOS_EXEMPLO: Omit<DadosEmissao, 'codigoVerificacao' | 'urlVerificacao'> = {
  nomeTitular: 'Nome de Quem Recebe',
  tituloDocumento: 'Harmonia Funcional',
  nomeCurso: 'Harmonia Funcional e Condução de Vozes',
  descricao:
    'concluiu o programa com aproveitamento, cumprindo as atividades avaliadas e a prova final da disciplina.',
  cargaHoraria: '180 horas',
  dataEmissao: '17 de setembro de 2026',
  dataValidade: '17 de setembro de 2028',
  nomeInstituicao: 'Conservatório Muscicapa',
  nomeSignatario: 'Direção Acadêmica',
  cargoSignatario: 'Coordenação de Cátedra',
  competencias: 'Cifragem · Cadências · Condução de vozes',
};

type Aba = 'matrizes' | 'emitir';

export const CredentialStudioScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [templates, setTemplates] = useState<TemplateCredencial[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<TemplateCredencial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [recado, setRecado] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('matrizes');

  const carregar = useCallback(async () => {
    try {
      const lista = await credentialService.listarTemplates();
      setTemplates(lista);
      setSelecionadoId((atual) => atual ?? lista[0]?.id ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar as matrizes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const achado = templates.find((t) => t.id === selecionadoId) ?? null;
    setRascunho(achado ? JSON.parse(JSON.stringify(achado)) : null);
  }, [selecionadoId, templates]);

  const problemas: ProblemaTemplate[] = useMemo(
    () => (rascunho ? credentialService.validarTemplate(rascunho) : []),
    [rascunho]
  );
  const temErro = problemas.some((p) => p.gravidade === 'erro');

  const dadosPreview: DadosEmissao = useMemo(
    () => ({
      ...DADOS_EXEMPLO,
      codigoVerificacao: 'CMU-EXEM-PLO4',
      urlVerificacao: credentialService.urlDeVerificacao('CMU-EXEM-PLO4'),
    }),
    []
  );

  const avisar = (texto: string) => {
    setRecado(texto);
    setTimeout(() => setRecado(null), 4000);
  };

  const alterarToken = <K extends keyof TemplateCredencial['tokens']>(
    chave: K,
    valor: TemplateCredencial['tokens'][K]
  ) => {
    setRascunho((r) => (r ? { ...r, tokens: { ...r.tokens, [chave]: valor } } : r));
  };

  const alterarImagem = (slot: SlotImagem, dataUrl: string | undefined) => {
    setRascunho((r) => {
      if (!r) return r;
      const imagens = { ...r.imagens };
      if (dataUrl) imagens[slot] = dataUrl;
      else delete imagens[slot];
      return { ...r, imagens };
    });
  };

  const enviarFonte = async (papel: 'titulo' | 'corpo', arquivo: File) => {
    const dataUrl = await new Promise<string>((resolve) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result));
      leitor.readAsDataURL(arquivo);
    });
    const nome = arquivo.name.replace(/\.[^.]+$/, '');
    setRascunho((r) =>
      r ? { ...r, fontes: { ...(r.fontes ?? {}), [papel]: { nome, dataUrl } } } : r
    );
  };

  const salvar = async () => {
    if (!rascunho) return;
    try {
      await credentialService.salvarTemplate(rascunho);
      await carregar();
      avisar('Matriz salva. Os documentos já emitidos não mudam — cada um guarda o desenho da própria emissão.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const duplicar = async () => {
    if (!rascunho) return;
    const copia = await credentialService.duplicarTemplate(rascunho.id);
    await carregar();
    setSelecionadoId(copia.id);
    avisar('Cópia criada. Edite a cópia à vontade — a matriz de fábrica continua intacta.');
  };

  const excluir = async () => {
    if (!rascunho || rascunho.ehPadrao) return;
    const removeu = await credentialService.excluirTemplate(rascunho.id);
    if (removeu) {
      setSelecionadoId(null);
      await carregar();
      avisar('Matriz removida.');
    }
  };

  const criarNova = async (tipo: TipoCredencial) => {
    const nova = credentialService.criarTemplateVazio(tipo, `Nova ${ROTULOS_TIPO[tipo].toLowerCase()}`);
    await credentialService.salvarTemplate(nova);
    await carregar();
    setSelecionadoId(nova.id);
  };

  // -------------------------------------------------------------------------

  return (
    <PageLayout
      id="credential-studio"
      form="workspace"
      state={isLoading ? 'loading' : erro && !rascunho ? 'error' : 'content'}
      loadingMessage="Carregando as matrizes de credencial..."
      errorProps={{ message: erro ?? '', onRetry: carregar }}
    >
      <PageLayout.Toolbar>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-sm font-bold text-stone-100">Estúdio de Credenciais</h1>
            <div className="flex rounded-md bg-zinc-800 p-0.5 text-[11px]">
              {(['matrizes', 'emitir'] as Aba[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAba(a)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    aba === a ? 'bg-zinc-700 font-semibold text-stone-100' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {a === 'matrizes' ? 'Matrizes' : 'Emitir'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recado && (
              <span className="hidden items-center gap-1.5 text-[11px] text-emerald-400 sm:flex">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {recado}
              </span>
            )}
            <button
              type="button"
              onClick={() => rascunho && baixarComoSvg('studio-preview', `${rascunho.nome}.svg`)}
              disabled={!rascunho}
              className="flex items-center gap-1.5 rounded border border-zinc-600 px-2.5 py-1 text-[11px] text-stone-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> Baixar SVG
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={!rascunho || temErro}
              title={temErro ? 'Corrija os erros estruturais antes de salvar' : undefined}
              className="flex items-center gap-1.5 rounded bg-anil-800 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-anil-700 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" /> Salvar matriz
            </button>
          </div>
        </div>
      </PageLayout.Toolbar>

      {/* ------------------------------------------------ painel: as matrizes */}
      <PageLayout.Panel>
        <div className="space-y-4 p-3">
          {(['CERTIFICADO', 'CREDENCIAL', 'BADGE'] as TipoCredencial[]).map((tipo) => (
            <section key={tipo} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {ROTULOS_TIPO[tipo]}
                </h2>
                <button
                  type="button"
                  onClick={() => criarNova(tipo)}
                  title={`Nova matriz de ${ROTULOS_TIPO[tipo].toLowerCase()}`}
                  className="rounded p-0.5 text-stone-500 transition-colors hover:bg-zinc-800 hover:text-stone-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-500">{DESCRICOES_TIPO[tipo]}</p>

              <ul className="space-y-1 pt-1">
                {templates
                  .filter((t) => t.tipo === tipo)
                  .map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setSelecionadoId(t.id)}
                        className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                          selecionadoId === t.id
                            ? 'bg-zinc-700 font-semibold text-stone-100'
                            : 'text-stone-300 hover:bg-zinc-800'
                        }`}
                      >
                        {t.ehPadrao && <Lock className="h-3 w-3 shrink-0 text-stone-500" />}
                        <span className="truncate">{t.nome}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </PageLayout.Panel>

      {/* ------------------------------------------------- centro: o documento */}
      <PageLayout.Main>
        {aba === 'emitir' ? (
          <PainelEmissao templates={templates} onAvisar={avisar} onIrPara={navigate} />
        ) : rascunho ? (
          <div className="space-y-4 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="font-serif text-base font-bold text-stone-100">{rascunho.nome}</h2>
                <p className="font-mono text-[10px] text-stone-500">
                  {CANVAS[rascunho.tipo].largura}×{CANVAS[rascunho.tipo].altura} ·{' '}
                  {CANVAS[rascunho.tipo].nota}
                </p>
              </div>
              {rascunho.ehPadrao && (
                <span className="flex shrink-0 items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-stone-400">
                  <Lock className="h-3 w-3" /> matriz de fábrica
                </span>
              )}
            </div>

            <div className="flex justify-center rounded-lg bg-zinc-800 p-6">
              <CredentialCanvas
                id="studio-preview"
                template={rascunho}
                dados={dadosPreview}
                className="max-w-full rounded shadow-2xl"
                larguraExibicao={rascunho.tipo === 'BADGE' ? 340 : 720}
              />
            </div>

            <p className="text-center text-[11px] text-stone-500">
              Pré-visualização com dados de exemplo. Nenhum documento é emitido aqui.
            </p>

            {problemas.length > 0 && (
              <ul className="space-y-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 p-3">
                {problemas.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-[11px] leading-relaxed ${
                      p.gravidade === 'erro' ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{p.mensagem}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-stone-400">
            Escolha uma matriz no painel à esquerda, ou crie uma nova.
          </div>
        )}
      </PageLayout.Main>

      {/* ------------------------------------------------- inspetor: os campos */}
      <PageLayout.Inspector>
        {rascunho && aba === 'matrizes' && (
          <div className="space-y-5 p-3">
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                <Type className="h-3 w-3" /> Identificação
              </h3>
              <CampoTexto
                rotulo="Nome da matriz"
                valor={rascunho.nome}
                onChange={(v) => setRascunho((r) => (r ? { ...r, nome: v } : r))}
              />
              <CampoTexto
                rotulo="Descrição"
                valor={rascunho.descricao}
                onChange={(v) => setRascunho((r) => (r ? { ...r, descricao: v } : r))}
              />
            </section>

            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                <Palette className="h-3 w-3" /> Cores
              </h3>
              <CampoCor rotulo="Primária" valor={rascunho.tokens.corPrimaria} onChange={(v) => alterarToken('corPrimaria', v)} />
              <CampoCor rotulo="Secundária (bordô)" valor={rascunho.tokens.corSecundaria} onChange={(v) => alterarToken('corSecundaria', v)} />
              <CampoCor rotulo="Fundo" valor={rascunho.tokens.corFundo} onChange={(v) => alterarToken('corFundo', v)} />
              <CampoCor rotulo="Texto" valor={rascunho.tokens.corTexto} onChange={(v) => alterarToken('corTexto', v)} />
              <CampoCor rotulo="Texto suave" valor={rascunho.tokens.corTextoSuave} onChange={(v) => alterarToken('corTextoSuave', v)} />
              <CampoCor rotulo="Moldura" valor={rascunho.tokens.corMoldura} onChange={(v) => alterarToken('corMoldura', v)} />
              <CampoNumero
                rotulo="Espessura da moldura"
                valor={rascunho.tokens.espessuraMoldura}
                min={0}
                max={12}
                onChange={(v) => alterarToken('espessuraMoldura', v)}
              />
              <CampoNumero
                rotulo="Raio dos cantos"
                valor={rascunho.tokens.raioCanto}
                min={0}
                max={40}
                onChange={(v) => alterarToken('raioCanto', v)}
              />
            </section>

            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                <Type className="h-3 w-3" /> Tipografia
              </h3>
              <CampoTexto
                rotulo="Fonte dos títulos"
                valor={rascunho.tokens.fonteTitulo}
                onChange={(v) => alterarToken('fonteTitulo', v)}
              />
              <CampoTexto
                rotulo="Fonte do corpo"
                valor={rascunho.tokens.fonteCorpo}
                onChange={(v) => alterarToken('fonteCorpo', v)}
              />
              {(['titulo', 'corpo'] as const).map((papel) => (
                <label
                  key={papel}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-zinc-600 px-2 py-1.5 text-[11px] text-stone-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700/50"
                >
                  Enviar fonte própria ({papel})
                  <input
                    type="file"
                    accept=".woff2,.woff,.otf,.ttf,font/woff2,font/woff,font/otf,font/ttf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) enviarFonte(papel, f);
                    }}
                  />
                </label>
              ))}
              {rascunho.fontes && (
                <p className="text-[10px] leading-relaxed text-stone-500">
                  Fontes próprias vão embutidas no arquivo baixado — ele abre com a tipografia
                  certa mesmo em um computador que não a tenha instalada.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                <ImageIcon className="h-3 w-3" /> Imagens
              </h3>
              {especificacoesImagem(rascunho.tipo).map((spec) => (
                <AssetUploader
                  key={spec.slot}
                  spec={spec}
                  valor={rascunho.imagens[spec.slot]}
                  onChange={(v) => alterarImagem(spec.slot, v)}
                />
              ))}
            </section>

            <section className="space-y-1.5 border-t border-zinc-800 pt-3">
              <button
                type="button"
                onClick={duplicar}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-zinc-600 px-2 py-1.5 text-[11px] text-stone-200 transition-colors hover:bg-zinc-700"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicar matriz
              </button>
              <button
                type="button"
                onClick={excluir}
                disabled={rascunho.ehPadrao}
                title={rascunho.ehPadrao ? 'Matrizes de fábrica não podem ser apagadas' : undefined}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-zinc-700 px-2 py-1.5 text-[11px] text-red-400 transition-colors hover:bg-zinc-800 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </section>
          </div>
        )}
      </PageLayout.Inspector>
    </PageLayout>
  );
};

// ---------------------------------------------------------------------------
// Emissão
// ---------------------------------------------------------------------------

const PainelEmissao: React.FC<{
  templates: TemplateCredencial[];
  onAvisar: (t: string) => void;
  onIrPara: (rota: string) => void;
}> = ({ templates, onAvisar, onIrPara }) => {
  const [templateId, setTemplateId] = useState('');
  const [campos, setCampos] = useState({ ...DADOS_EXEMPLO, nomeTitular: '', nomeCurso: '' });
  const [emitido, setEmitido] = useState<{ codigo: string; url: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const emitir = async () => {
    setErro(null);
    try {
      const credencial = await credentialService.emitir({
        templateId,
        // Emissão avulsa pelo console. A emissão automática por conclusão de
        // curso passa o userId real de quem concluiu.
        userId: 'emissao_manual',
        dados: campos,
        origem: { tipo: 'MANUAL' },
      });
      setEmitido({ codigo: credencial.codigo, url: credencial.dados.urlVerificacao });
      onAvisar('Documento emitido e registrado.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao emitir.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h2 className="font-serif text-base font-bold text-stone-100">Emitir documento</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
          O documento emitido guarda uma cópia congelada do desenho. Alterar a matriz depois
          não modifica nada que já foi entregue.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-[11px] font-semibold text-stone-300">Matriz</span>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-stone-100"
        >
          <option value="">Escolha uma matriz…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {ROTULOS_TIPO[t.tipo]} · {t.nome}
            </option>
          ))}
        </select>
      </label>

      {(
        [
          ['nomeTitular', 'Nome de quem recebe'],
          ['tituloDocumento', 'Título do documento'],
          ['nomeCurso', 'Curso ou trilha'],
          ['cargaHoraria', 'Carga horária'],
          ['dataEmissao', 'Data de emissão'],
          ['nomeInstituicao', 'Instituição'],
        ] as [keyof typeof campos, string][]
      ).map(([chave, rotulo]) => (
        <label key={chave} className="block space-y-1">
          <span className="text-[11px] font-semibold text-stone-300">{rotulo}</span>
          <input
            type="text"
            value={String(campos[chave] ?? '')}
            onChange={(e) => setCampos((c) => ({ ...c, [chave]: e.target.value }))}
            className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-stone-100"
          />
        </label>
      ))}

      <button
        type="button"
        onClick={emitir}
        disabled={!templateId || !campos.nomeTitular.trim()}
        className="w-full rounded bg-anil-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-anil-700 disabled:opacity-40"
      >
        Emitir e registrar
      </button>

      {erro && (
        <p role="alert" className="text-[11px] text-red-400">
          {erro}
        </p>
      )}

      {emitido && (
        <div className="space-y-2 rounded-md border border-emerald-800 bg-emerald-950/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Emitido
          </p>
          <dl className="space-y-1 font-mono text-[11px] text-stone-300">
            <div>
              <dt className="text-stone-500">Código</dt>
              <dd className="text-stone-100">{emitido.codigo}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Página de verificação</dt>
              <dd className="break-all text-stone-100">{emitido.url}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => onIrPara(`/credential/${emitido.codigo}`)}
            className="rounded border border-emerald-700 px-2 py-1 text-[11px] text-emerald-200 transition-colors hover:bg-emerald-900/50"
          >
            Abrir a página do documento
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Campos do inspetor
// ---------------------------------------------------------------------------

const CampoTexto: React.FC<{ rotulo: string; valor: string; onChange: (v: string) => void }> = ({
  rotulo,
  valor,
  onChange,
}) => (
  <label className="block space-y-1">
    <span className="text-[10px] text-stone-400">{rotulo}</span>
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-[11px] text-stone-100"
    />
  </label>
);

const CampoCor: React.FC<{ rotulo: string; valor: string; onChange: (v: string) => void }> = ({
  rotulo,
  valor,
  onChange,
}) => (
  <label className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-stone-400">{rotulo}</span>
    <span className="flex items-center gap-1.5">
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded border border-zinc-600 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-100"
      />
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(valor) ? valor : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Escolher ${rotulo}`}
        className="h-6 w-8 cursor-pointer rounded border border-zinc-600 bg-transparent"
      />
    </span>
  </label>
);

const CampoNumero: React.FC<{
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ rotulo, valor, min, max, onChange }) => (
  <label className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-stone-400">{rotulo}</span>
    <input
      type="number"
      value={valor}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 rounded border border-zinc-600 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-100"
    />
  </label>
);
