import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { authService } from '../../../services/application/auth.service';
import { kidsAccountService } from '../../../services/application/kids-account.service';
import {
  PerfilInfantil,
  SolicitacaoParental,
  PermissoesInfantis,
  ROTULOS_PERMISSAO,
  EXPLICACAO_SOLICITACAO,
  ModalidadeContaAdulta,
  DESCRICAO_MODALIDADE,
  idadeEmAnos,
} from '../../../domain/kids-account';
import { Info, ShieldCheck, Check, X, Clock, UserPlus, KeyRound } from 'lucide-react';

/**
 * Acompanhamento da conta infantil.
 *
 * Reúne as três coisas que um responsável precisa: o que está esperando
 * decisão, o que a criança pode fazer, e como entrar no perfil dela.
 *
 * As solicitações vêm primeiro porque são a única parte com prazo — há uma
 * criança do outro lado esperando. Permissões e acesso não têm pressa.
 */

type Aba = 'solicitacoes' | 'permissoes' | 'acesso';

const Box: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2.5 rounded-md border border-sky-200 bg-sky-50 p-3">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
    <div className="text-xs leading-relaxed text-sky-900">{children}</div>
  </div>
);

export const KidsGuardianScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [perfis, setPerfis] = useState<PerfilInfantil[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoParental[]>([]);
  const [modalidade, setModalidade] = useState<ModalidadeContaAdulta | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('solicitacoes');
  const [isLoading, setIsLoading] = useState(true);
  const [recado, setRecado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const sessao = await authService.getActiveSession();
    const responsavelId = sessao?.user.id;
    if (!responsavelId) {
      setIsLoading(false);
      return;
    }
    const [lista, pedidos, modo] = await Promise.all([
      kidsAccountService.listarPerfis(responsavelId),
      kidsAccountService.listarSolicitacoes(responsavelId),
      kidsAccountService.modalidadeDaConta(responsavelId),
    ]);
    setPerfis(lista);
    setSolicitacoes(pedidos);
    setModalidade(modo);
    setSelecionado((atual) => atual ?? lista[0]?.userId ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const crianca = perfis.find((p) => p.userId === selecionado) ?? null;
  const pendentes = solicitacoes.filter((s) => s.situacao === 'PENDENTE');
  const decididas = solicitacoes.filter((s) => s.situacao !== 'PENDENTE');

  const avisar = (t: string) => {
    setRecado(t);
    setTimeout(() => setRecado(null), 4000);
  };

  const decidir = async (id: string, aprovar: boolean) => {
    await kidsAccountService.decidirSolicitacao(
      id,
      aprovar,
      aprovar ? undefined : 'Decidido pelo responsável.'
    );
    await carregar();
    avisar(aprovar ? 'Aprovado. A criança foi avisada.' : 'Recusado. A criança foi avisada.');
  };

  const alterarPermissao = async (
    chave: keyof Omit<PermissoesInfantis, 'limiteDiarioMinutos'>,
    campo: 'permitido' | 'exigeConfirmacao',
    valor: boolean
  ) => {
    if (!crianca) return;
    const novas: PermissoesInfantis = {
      ...crianca.permissoes,
      [chave]: { ...crianca.permissoes[chave], [campo]: valor },
    };
    // Desligar a permissão desliga também a exigência de confirmação: manter
    // "confirmar" ligado sobre uma ação impossível confundiria a leitura.
    if (campo === 'permitido' && !valor) {
      novas[chave] = { permitido: false, exigeConfirmacao: true };
    }
    await kidsAccountService.atualizarPermissoes(crianca.userId, novas);
    await carregar();
  };

  const nomeDaCrianca = (userId: string) =>
    perfis.find((p) => p.userId === userId)?.nomeExibicao ?? 'a criança';

  return (
    <PageLayout
      id="kids-guardian"
      form="detail"
      density="operational"
      asideLabel="Perfis"
      state={isLoading ? 'loading' : perfis.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando o acompanhamento..."
      emptyProps={{
        title: 'Nenhum perfil infantil ainda',
        description:
          'Um perfil infantil fica sempre ligado à sua conta, e tudo que envolve outras pessoas passa por você antes de acontecer.',
        actionLabel: 'Criar perfil infantil',
        onAction: () => navigate('/kids/create'),
      }}
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Acompanhamento da conta infantil
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
            O que está esperando você, o que a criança pode fazer, e como entrar no perfil dela.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Tabs
        id="kids-guardian-tabs"
        tabs={[
          { id: 'solicitacoes', label: 'Solicitações', badge: pendentes.length || undefined },
          { id: 'permissoes', label: 'O que ela pode fazer' },
          { id: 'acesso', label: 'Acesso' },
        ]}
        activeTab={aba}
        onChange={(id) => setAba(id as Aba)}
      />

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Perfis sob sua tutela
          </p>
          <ul className="space-y-1">
            {perfis.map((p) => (
              <li key={p.userId}>
                <button
                  type="button"
                  onClick={() => setSelecionado(p.userId)}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    selecionado === p.userId
                      ? 'bg-stone-900 font-semibold text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {p.nomeExibicao}
                  <span className="ml-1 opacity-70">· {idadeEmAnos(p.dataNascimento)} anos</span>
                </button>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/kids/create')}>
            <UserPlus className="mr-1 h-3.5 w-3.5" /> Outro perfil
          </Button>
        </Card>

        {modalidade === 'GERENCIAL' && (
          <Card variant="default" padding="md" className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Sua conta
            </p>
            <p className="text-xs leading-relaxed text-stone-600">
              {DESCRICAO_MODALIDADE.GERENCIAL}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                const sessao = await authService.getActiveSession();
                if (sessao) await kidsAccountService.abrirPerfilCompleto(sessao.user.id);
                await carregar();
                avisar('Seu perfil de músico foi aberto. Nada do acompanhamento mudou.');
              }}
            >
              Abrir meu perfil na plataforma
            </Button>
          </Card>
        )}
      </PageLayout.Aside>

      <PageLayout.Main>
        {recado && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {recado}
          </div>
        )}

        {/* ------------------------------------------------- solicitações */}
        {aba === 'solicitacoes' && (
          <div className="space-y-4">
            <Box>
              Cada item aqui é uma ação que {crianca?.nomeExibicao ?? 'a criança'} tentou fazer e
              que está parada esperando você. Nada acontece enquanto você não decidir — e ela vê
              que o pedido está aguardando, não que deu erro.
            </Box>

            {pendentes.length === 0 ? (
              <Card variant="default" padding="lg" className="space-y-2 text-center">
                <Clock className="mx-auto h-6 w-6 text-stone-300" />
                <p className="text-sm text-stone-600">Nada esperando por você agora.</p>
                <p className="text-xs leading-relaxed text-stone-500">
                  Quando houver um pedido de conexão, uma tentativa de entrar numa sala ou uma
                  publicação, aparece aqui.
                </p>
              </Card>
            ) : (
              <ul className="space-y-3">
                {pendentes.map((s) => (
                  <li key={s.id}>
                    <Card variant="default" padding="md" className="space-y-3 border-amber-200">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-stone-900">{s.resumo}</p>
                        <p className="text-[11px] text-stone-500">
                          {nomeDaCrianca(s.criancaUserId)} ·{' '}
                          {new Date(s.criadaEm).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <p className="rounded bg-stone-50 p-2 text-xs leading-relaxed text-stone-700">
                        {EXPLICACAO_SOLICITACAO[s.tipo]}
                      </p>

                      {Object.keys(s.detalhes).length > 0 && (
                        <dl className="space-y-0.5 text-xs">
                          {Object.entries(s.detalhes).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <dt className="text-stone-500">{k}:</dt>
                              <dd className="font-medium text-stone-800">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button variant="primary" size="sm" onClick={() => decidir(s.id, true)}>
                          <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => decidir(s.id, false)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Recusar
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            {decididas.length > 0 && (
              <section className="space-y-2">
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Já decididas
                </h2>
                <ul className="space-y-1.5">
                  {decididas.slice(0, 12).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded border border-stone-200 px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate text-stone-700">{s.resumo}</span>
                      <span
                        className={`shrink-0 font-medium ${
                          s.situacao === 'APROVADA' ? 'text-emerald-700' : 'text-stone-500'
                        }`}
                      >
                        {s.situacao === 'APROVADA' ? 'aprovada' : 'recusada'}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* --------------------------------------------------- permissões */}
        {aba === 'permissoes' && crianca && (
          <div className="space-y-4">
            <Box>
              Cada permissão tem duas chaves. A primeira diz se{' '}
              {crianca.nomeExibicao} pode <strong>sequer tentar</strong>. A segunda diz se cada
              tentativa precisa do seu aval, uma a uma. Separar as duas evita a escolha entre
              "bloqueado" e "liberado geral" — o comum é querer que ela possa pedir, mas que cada
              pedido passe por você antes.
            </Box>

            <ul className="space-y-3">
              {(
                Object.keys(ROTULOS_PERMISSAO) as (keyof typeof ROTULOS_PERMISSAO)[]
              ).map((chave) => {
                const regra = crianca.permissoes[chave];
                const rotulos = ROTULOS_PERMISSAO[chave];
                const situacao = !regra.permitido
                  ? rotulos.seDesligado
                  : regra.exigeConfirmacao
                    ? rotulos.seLigadoComConfirmar
                    : rotulos.seLigadoSemConfirmar;

                return (
                  <li key={chave}>
                    <Card variant="default" padding="md" className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-stone-900">{rotulos.titulo}</p>
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={regra.permitido}
                            onChange={(e) => alterarPermissao(chave, 'permitido', e.target.checked)}
                            className="h-4 w-4 accent-anil-800"
                          />
                          <span className="text-stone-700">Permitir</span>
                        </label>
                      </div>

                      <label
                        className={`flex cursor-pointer items-center gap-1.5 text-xs ${
                          regra.permitido ? 'text-stone-700' : 'cursor-not-allowed text-stone-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={regra.exigeConfirmacao}
                          disabled={!regra.permitido}
                          onChange={(e) =>
                            alterarPermissao(chave, 'exigeConfirmacao', e.target.checked)
                          }
                          className="h-4 w-4 accent-anil-800"
                        />
                        Confirmar cada vez, antes de acontecer
                      </label>

                      <p className="rounded bg-stone-50 p-2 text-xs leading-relaxed text-stone-600">
                        <strong className="text-stone-800">Como está agora:</strong> {situacao}
                      </p>
                    </Card>
                  </li>
                );
              })}
            </ul>

            <Card variant="default" padding="md" className="space-y-2">
              <p className="text-sm font-semibold text-stone-900">Tempo de estudo por dia</p>
              <label className="flex items-center gap-2 text-xs text-stone-700">
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={crianca.permissoes.limiteDiarioMinutos}
                  onChange={async (e) => {
                    await kidsAccountService.atualizarPermissoes(crianca.userId, {
                      ...crianca.permissoes,
                      limiteDiarioMinutos: Number(e.target.value),
                    });
                    await carregar();
                  }}
                  className="w-20 rounded border border-stone-300 px-2 py-1 font-mono text-xs"
                />
                minutos
              </label>
              <p className="text-xs leading-relaxed text-stone-500">
                Zero significa sem limite. O aviso aparece para a criança quando o tempo acaba;
                o que ela já estava fazendo não é interrompido no meio.
              </p>
            </Card>
          </div>
        )}

        {/* -------------------------------------------------------- acesso */}
        {aba === 'acesso' && crianca && (
          <div className="space-y-4">
            <Box>
              Há dois caminhos para {crianca.nomeExibicao} usar a plataforma, e os dois usam o
              mesmo nome de usuário e a mesma senha.
            </Box>

            <Card variant="default" padding="lg" className="space-y-3">
              <h2 className="font-serif text-sm font-bold text-stone-900">
                1. Abrir o perfil dela sem sair da sua conta
              </h2>
              <p className="text-xs leading-relaxed text-stone-600">
                Você continua autenticado e entra no perfil da criança. Ao sair, volta para o
                acompanhamento. É o caminho do dia a dia, quando vocês estudam juntos.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/academy')}>
                Abrir o perfil de {crianca.nomeExibicao}
              </Button>
            </Card>

            <Card variant="default" padding="lg" className="space-y-3">
              <h2 className="font-serif text-sm font-bold text-stone-900">
                2. Ela entrar sozinha na tela de acesso
              </h2>
              <dl className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <dt className="text-stone-500">Nome de usuário:</dt>
                  <dd className="font-mono font-semibold text-stone-900">
                    {crianca.credenciais.nomeUsuario}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-stone-500">Senha:</dt>
                  <dd className="text-stone-700">
                    guardada de forma cifrada — não é possível exibi-la aqui
                  </dd>
                </div>
              </dl>
              <p className="text-xs leading-relaxed text-stone-500">
                A plataforma guarda apenas uma impressão criptográfica da senha. Isso significa
                que nem nós conseguimos mostrá-la de volta — se ela for esquecida, o caminho é
                definir outra.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nova = window.prompt(
                    `Nova senha para ${crianca.nomeExibicao} (mínimo 8 caracteres):`
                  );
                  if (!nova) return;
                  kidsAccountService
                    .trocarSenha(crianca.userId, nova)
                    .then(() => avisar('Senha trocada. A anterior deixou de funcionar.'))
                    .catch((e) => avisar(e instanceof Error ? e.message : 'Não foi possível trocar.'));
                }}
              >
                <KeyRound className="mr-1 h-3.5 w-3.5" /> Definir nova senha
              </Button>
            </Card>
          </div>
        )}
      </PageLayout.Main>
    </PageLayout>
  );
};
