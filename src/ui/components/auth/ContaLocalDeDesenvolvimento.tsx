import React, { useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { authService } from '../../../services/application/auth.service';
import { isGoogleSignInConfigured } from '../../../infrastructure/auth/google-identity-client';

export interface ContaLocalDeDesenvolvimentoProps {
  onEntrou: (destino: string) => void;
  onErro: (mensagem: string) => void;
}

/**
 * Entrada local, só em desenvolvimento.
 *
 * A plataforma autentica exclusivamente por Google. Sem
 * `VITE_GOOGLE_OAUTH_CLIENT_ID` configurado, isso tornava a plataforma
 * impossível de usar em desenvolvimento: não havia como criar conta, e
 * portanto não havia como ver **nenhuma** tela na versão logada.
 *
 * Este componente só se desenha quando as duas condições valem — ambiente de
 * desenvolvimento **e** Google não configurado. Em produção ele não existe no
 * bundle, porque o Vite elimina o ramo morto de `import.meta.env.DEV`.
 *
 * A conta criada aqui nunca recebe privilégio: privilégio vem de outorga
 * assinada pelo servidor, e um atalho local não é servidor.
 */
export const ContaLocalDeDesenvolvimento: React.FC<ContaLocalDeDesenvolvimentoProps> = ({
  onEntrou,
  onErro,
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!import.meta.env.DEV || isGoogleSignInConfigured()) return null;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    onErro('');
    try {
      const sessao = await authService.authenticateLocalDevelopment(nome, email);
      const resultado = await authService.executePostAuthPipeline(sessao.user);
      onEntrou(resultado.destination);
    } catch (err) {
      onErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      className="space-y-3 rounded-lg border border-dashed border-amber-400 bg-amber-50/60 p-4"
      aria-labelledby="conta-local-titulo"
    >
      <p
        id="conta-local-titulo"
        className="flex items-start gap-2 text-xs leading-relaxed text-amber-900"
      >
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Entrada local de desenvolvimento.</strong> Aparece
          porque <code className="font-mono">VITE_GOOGLE_OAUTH_CLIENT_ID</code> não está
          configurado. Não existe no build de produção, e a conta criada não recebe privilégio
          nenhum.
        </span>
      </p>

      <div className="space-y-2">
        <label htmlFor="conta-local-nome" className="block text-xs font-medium text-stone-700">
          Seu nome
          <input
            id="conta-local-nome"
            type="text"
            value={nome}
            onChange={(ev) => setNome(ev.target.value)}
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-anil-700 focus:ring-1 focus:ring-anil-700"
          />
        </label>

        <label htmlFor="conta-local-email" className="block text-xs font-medium text-stone-700">
          Seu e-mail
          <input
            id="conta-local-email"
            type="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-anil-700 focus:ring-1 focus:ring-anil-700"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={enviando || !email.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {enviando ? 'Entrando…' : 'Entrar localmente'}
      </button>
    </form>
  );
};
