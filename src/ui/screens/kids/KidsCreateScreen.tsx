import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { authService } from '../../../services/application/auth.service';
import { kidsAccountService } from '../../../services/application/kids-account.service';
import {
  validarCredenciais,
  idadeEmAnos,
  DESCRICAO_MODALIDADE,
} from '../../../domain/kids-account';
import { Info, ShieldCheck, KeyRound, UserPlus, ArrowRight, ArrowLeft, Check } from 'lucide-react';

/**
 * Criação de um perfil infantil.
 *
 * O fluxo é explicado passo a passo porque a estrutura não é óbvia e o
 * silêncio aqui gera a confusão errada: a pessoa acha que está criando uma
 * conta solta para a criança e depois não entende por que precisa da própria.
 *
 * Então a primeira tela diz, antes de qualquer campo, o que vai acontecer:
 * uma conta adulta é criada no nome de quem está ali, e o perfil da criança
 * nasce dentro dela.
 */

type Etapa = 'entender' | 'crianca' | 'acesso' | 'pronto';

const ETAPAS: { id: Etapa; titulo: string }[] = [
  { id: 'entender', titulo: 'Como funciona' },
  { id: 'crianca', titulo: 'Sobre a criança' },
  { id: 'acesso', titulo: 'Acesso dela' },
  { id: 'pronto', titulo: 'Pronto' },
];

const Box: React.FC<{ titulo: string; children: React.ReactNode; tom?: 'info' | 'atencao' }> = ({
  titulo,
  children,
  tom = 'info',
}) => (
  <div
    className={`flex gap-2.5 rounded-md border p-3 ${
      tom === 'atencao' ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50'
    }`}
  >
    <Info
      className={`mt-0.5 h-4 w-4 shrink-0 ${tom === 'atencao' ? 'text-amber-700' : 'text-sky-700'}`}
    />
    <div className="space-y-1">
      <p className={`text-xs font-semibold ${tom === 'atencao' ? 'text-amber-900' : 'text-sky-900'}`}>
        {titulo}
      </p>
      <div className={`text-xs leading-relaxed ${tom === 'atencao' ? 'text-amber-900' : 'text-sky-900'}`}>
        {children}
      </div>
    </div>
  </div>
);

export const KidsCreateScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [etapa, setEtapa] = useState<Etapa>('entender');

  const [nomeExibicao, setNomeExibicao] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const idade = dataNascimento ? idadeEmAnos(dataNascimento) : null;
  const problemas = validarCredenciais(nomeUsuario, senha);

  const podeAvancarCrianca = nomeExibicao.trim().length >= 2 && Boolean(dataNascimento) && idade !== null && idade < 18;
  const podeConcluir = problemas.length === 0 && senha === confirmacao && senha.length > 0;

  const criar = async () => {
    setErro(null);
    setSalvando(true);
    try {
      const sessao = await authService.getActiveSession();
      // Sem sessão, o identificador do responsável ainda assim existe: a
      // conta adulta é criada como consequência de criar o perfil infantil.
      const responsavelUserId = sessao?.user.id ?? `usr_resp_${Date.now().toString(36)}`;

      await kidsAccountService.criarPerfilInfantil({
        responsavelUserId,
        nomeExibicao,
        dataNascimento,
        nomeUsuario,
        senha,
      });
      setEtapa('pronto');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar o perfil.');
    } finally {
      setSalvando(false);
    }
  };

  const indiceAtual = ETAPAS.findIndex((e) => e.id === etapa);

  return (
    <PageLayout id="kids-create" form="focus" density="editorial" state="content">
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">Criar um perfil infantil</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
            Um perfil para uma criança estudar música com segurança, sempre ligado a uma conta
            de responsável.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Main>
        <div className="mx-auto max-w-2xl space-y-5">
          {/* Trilha de etapas */}
          <ol className="flex flex-wrap items-center gap-1 text-[11px]">
            {ETAPAS.map((e, i) => (
              <li key={e.id} className="flex items-center gap-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                    i < indiceAtual
                      ? 'bg-emerald-700 text-white'
                      : i === indiceAtual
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {i < indiceAtual ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className={i === indiceAtual ? 'font-semibold text-stone-900' : 'text-stone-500'}>
                  {e.titulo}
                </span>
                {i < ETAPAS.length - 1 && <span className="px-1 text-stone-300">›</span>}
              </li>
            ))}
          </ol>

          {/* ---------------------------------------------------- entender */}
          {etapa === 'entender' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900">
                Antes de começar, como isto funciona
              </h2>

              <Box titulo="O perfil da criança vive dentro da sua conta">
                Não existe conta infantil separada na plataforma. Ao criar este perfil, uma conta
                de responsável é criada no seu nome, e o perfil da criança nasce ligado a ela.
                Você não precisa preencher nada sobre você agora.
              </Box>

              <Box titulo="Sua conta começa apenas como acompanhamento">
                {DESCRICAO_MODALIDADE.GERENCIAL} Se um dia você quiser estudar aqui também, há um
                botão para abrir o seu próprio perfil de músico — e nada se perde.
              </Box>

              <Box titulo="A criança entra com nome de usuário e senha que você define">
                Há dois caminhos para ela acessar: você abre o perfil dela de dentro da sua conta,
                ou ela entra direto na tela de acesso com o nome de usuário e a senha que você
                escolher no passo 3.
              </Box>

              <Box titulo="Tudo que envolve outras pessoas passa por você" tom="atencao">
                Pedir conexão, aceitar conexão, entrar numa sala de estudo, publicar na comunidade:
                cada uma dessas ações vira uma solicitação na sua tela de acompanhamento. Você
                decide uma a uma, vendo de quem se trata. E tudo isso já começa desligado.
              </Box>

              <Box titulo="A criança não abre o perfil de ninguém" tom="atencao">
                Perfis de outras pessoas, o diretório de músicos, a comunidade e as salas ficam
                fora do perfil infantil — inclusive por link recebido de fora. As aulas, os
                exercícios e a prática continuam inteiros.
              </Box>

              <div className="flex justify-end pt-1">
                <Button variant="primary" size="md" onClick={() => setEtapa('crianca')}>
                  Entendi, continuar <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* ----------------------------------------------------- criança */}
          {etapa === 'crianca' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="font-serif text-base font-bold text-stone-900">Sobre a criança</h2>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Como ela quer ser chamada</span>
                <input
                  type="text"
                  value={nomeExibicao}
                  onChange={(e) => setNomeExibicao(e.target.value)}
                  placeholder="O primeiro nome basta"
                  className="w-full rounded border border-stone-300 p-2.5 text-sm focus:border-stone-500 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Data de nascimento</span>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full rounded border border-stone-300 p-2.5 text-sm focus:border-stone-500 focus:outline-none"
                />
              </label>

              <Box titulo="Por que pedimos a data de nascimento">
                Ela define a faixa etária do conteúdo e as proteções aplicadas. Não aparece para
                mais ninguém na plataforma, e não é exibida no perfil da criança.
              </Box>

              {idade !== null && idade >= 18 && (
                <Box titulo="Esta data indica uma pessoa maior de idade" tom="atencao">
                  Contas de adultos se criam pelo cadastro normal, com todos os recursos
                  disponíveis. Este fluxo é só para crianças e adolescentes.
                </Box>
              )}

              <div className="flex justify-between pt-1">
                <Button variant="ghost" size="md" onClick={() => setEtapa('entender')}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!podeAvancarCrianca}
                  onClick={() => setEtapa('acesso')}
                >
                  Continuar <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* ------------------------------------------------------ acesso */}
          {etapa === 'acesso' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <h2 className="flex items-center gap-2 font-serif text-base font-bold text-stone-900">
                <KeyRound className="h-4 w-4 text-stone-500" /> O acesso da criança
              </h2>

              <Box titulo="Você escolhe, e você guarda">
                O nome de usuário e a senha abaixo são definidos por você. A criança usa os dois
                para entrar sozinha; você usa os mesmos para abrir o perfil dela de dentro da sua
                conta. Guarde-os em lugar seguro — e você pode trocar a senha quando quiser.
              </Box>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Nome de usuário</span>
                <input
                  type="text"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  placeholder="sem espaços e sem acentos"
                  autoComplete="off"
                  className="w-full rounded border border-stone-300 p-2.5 font-mono text-sm focus:border-stone-500 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Senha</span>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded border border-stone-300 p-2.5 text-sm focus:border-stone-500 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Repita a senha</span>
                <input
                  type="password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded border border-stone-300 p-2.5 text-sm focus:border-stone-500 focus:outline-none"
                />
              </label>

              {problemas.length > 0 && (
                <ul className="space-y-1">
                  {problemas.map((p, i) => (
                    <li key={i} className="text-xs text-red-700">
                      {p.mensagem}
                    </li>
                  ))}
                </ul>
              )}
              {senha && confirmacao && senha !== confirmacao && (
                <p className="text-xs text-red-700">As duas senhas não são iguais.</p>
              )}

              <Box titulo="Uma ressalva honesta sobre a senha" tom="atencao">
                A plataforma guarda apenas uma impressão criptográfica da senha, nunca a senha em
                si. Mas como tudo fica no navegador deste aparelho, quem tiver o aparelho
                desbloqueado tem acesso aos dados guardados. Trate este computador como parte da
                proteção da criança.
              </Box>

              {erro && <p className="text-xs text-red-700">{erro}</p>}

              <div className="flex justify-between pt-1">
                <Button variant="ghost" size="md" onClick={() => setEtapa('crianca')}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
                </Button>
                <Button variant="primary" size="md" disabled={!podeConcluir || salvando} onClick={criar}>
                  <UserPlus className="mr-1 h-4 w-4" />
                  {salvando ? 'Criando…' : 'Criar perfil infantil'}
                </Button>
              </div>
            </Card>
          )}

          {/* ------------------------------------------------------ pronto */}
          {etapa === 'pronto' && (
            <Card variant="default" padding="lg" className="space-y-4 border-emerald-300 bg-emerald-50">
              <h2 className="flex items-center gap-2 font-serif text-base font-bold text-emerald-900">
                <ShieldCheck className="h-5 w-5" /> Perfil criado
              </h2>
              <p className="text-sm leading-relaxed text-emerald-900">
                O perfil de <strong>{nomeExibicao}</strong> está pronto e ligado à sua conta.
                Todas as permissões sociais começam desligadas — nada envolvendo outras pessoas
                acontece sem você.
              </p>
              <p className="text-xs leading-relaxed text-emerald-900">
                Na tela de acompanhamento você define o que liberar, vê as solicitações
                pendentes e pode abrir o perfil da criança sem precisar sair da sua conta.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="primary" size="md" onClick={() => navigate('/kids/manage')}>
                  Ir para o acompanhamento
                </Button>
                <Button variant="outline" size="md" onClick={() => navigate('/academy')}>
                  Ver a Academia
                </Button>
              </div>
            </Card>
          )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
