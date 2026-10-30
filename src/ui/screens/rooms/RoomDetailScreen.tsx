import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCourse } from '../../../domain/academy';
import {
  Comentario,
  Encontro,
  Entrega,
  FormatoDeEntrega,
  Membro,
  NoRanking,
  Post,
  SobreASala,
  Tarefa,
  motivo,
  salasService,
} from '../../../services/application/salas.service';
import { ArrowLeft, Heart, MessageSquare, Pin, Trash2 } from 'lucide-react';
import { BotaoDenunciar } from '../../components/comunidade/BotaoDenunciar';

/**
 * A sala (AUD-9), no molde do Skool: Comunidade · Sala de aula · Agenda ·
 * Membros · Ranking · Sobre.
 *
 * Antes eram duas abas vazias ("Nenhuma tarefa publicada", "Nenhum aluno
 * matriculado") sem nenhum caminho para deixarem de estar vazias: não havia
 * como entrar, publicar, marcar encontro nem aprovar ninguém.
 *
 * Quem decide o que cada pessoa pode é o servidor; a tela só não oferece o
 * botão a quem ele vai recusar.
 */
type Aba = 'comunidade' | 'tarefas' | 'aula' | 'agenda' | 'membros' | 'ranking' | 'sobre';
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'comunidade', rotulo: 'Comunidade' },
  { id: 'tarefas', rotulo: 'Tarefas' },
  { id: 'aula', rotulo: 'Sala de aula' },
  { id: 'agenda', rotulo: 'Agenda' },
  { id: 'membros', rotulo: 'Membros' },
  { id: 'ranking', rotulo: 'Ranking' },
  { id: 'sobre', rotulo: 'Sobre' },
];

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

const campo = 'w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800';

export const RoomDetailScreen: React.FC = () => {
  const { params, navigate, currentPath } = useRouter();
  const slug = params.id;
  const { userId } = useCurrentUser();
  const [sobre, setSobre] = useState<SobreASala | null>(null);
  const [ausente, setAusente] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('comunidade');
  const [recado, setRecado] = useState<string | null>(null);

  const carregar = useCallback(() => {
    if (!slug) return;
    salasService
      .sobre(slug)
      .then((s) => {
        setSobre(s);
        setAusente(null);
      })
      .catch((e) => setAusente(motivo(e)));
  }, [slug]);
  useEffect(carregar, [carregar, userId]);

  const eu = sobre?.eu ?? null;
  const ativo = eu?.status === 'ativo';
  const cuida = ativo && eu!.papel !== 'membro';

  const entrar = async () => {
    if (!userId) {
      navigate(`/auth/login?voltar=${encodeURIComponent(currentPath)}`);
      return;
    }
    try {
      const m = await salasService.entrar(slug!);
      setRecado(m.status === 'pendente' ? 'Pedido enviado. Quem cuida da sala vai aprovar.' : null);
      carregar();
    } catch (e) {
      setRecado(motivo(e));
    }
  };

  if (ausente || !slug) {
    return (
      <ScreenContainer
        id="room-missing"
        title="Sala não encontrada"
        subtitle={ausente ?? 'Endereço sem sala.'}
        primaryAction={{ label: 'Ver as salas', icon: ArrowLeft, onClick: () => navigate('/rooms') }}
      >
        <p className="text-sm text-stone-600">A sala pode ter outro endereço, ou ainda não existir.</p>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id="room-detail"
      title={sobre?.sala.nome ?? 'Sala'}
      subtitle={
        sobre
          ? `por ${sobre.sala.dono.nome} · ${sobre.membros} ${sobre.membros === 1 ? 'membro' : 'membros'} · ${sobre.sala.privacidade === 'publica' ? 'pública' : 'privada'}`
          : ''
      }
      state={sobre ? 'populated' : 'loading'}
      loadingMessage="Abrindo a sala…"
      primaryAction={
        !eu
          ? { label: sobre?.sala.privacidade === 'privada' ? 'Pedir para entrar' : 'Entrar na sala', onClick: () => void entrar() }
          : undefined
      }
      secondaryActions={[{ label: 'Todas as salas', icon: ArrowLeft, onClick: () => navigate('/rooms') }]}
    >
      {sobre && (
        <div className="space-y-5">
          {eu?.status === 'pendente' && (
            <p role="status" className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              Seu pedido para entrar está esperando quem cuida da sala.
            </p>
          )}
          {recado && (
            <p role="status" className="text-xs text-stone-700">
              {recado}
            </p>
          )}

          <div role="tablist" aria-label="Partes da sala" className="flex flex-wrap gap-1 border-b border-stone-200">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={aba === a.id}
                onClick={() => setAba(a.id)}
                className={`px-3 py-2 text-sm border-b-2 -mb-px ${aba === a.id ? 'border-anil-800 font-semibold text-stone-900' : 'border-transparent text-stone-600 hover:text-stone-900'}`}
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          {!sobre.podeLer && aba !== 'sobre' ? (
            <Card variant="muted" padding="lg">
              <p className="text-sm text-stone-700">
                Esta sala é privada: a conversa, a agenda e os membros são de quem está nela.
                {!eu && ' Peça para entrar — quem cuida da sala aprova.'}
              </p>
            </Card>
          ) : (
            <>
              {aba === 'comunidade' && <Comunidade slug={slug} sobre={sobre} ativo={ativo} cuida={cuida} meuSub={eu?.sub} onEntrar={() => void entrar()} />}
              {aba === 'tarefas' && <Tarefas slug={slug} ativo={ativo} cuida={cuida} />}
              {aba === 'aula' && <SalaDeAula slug={slug} sobre={sobre} dono={eu?.papel === 'dono'} aoMudar={carregar} />}
              {aba === 'agenda' && <Agenda slug={slug} cuida={cuida} />}
              {aba === 'membros' && <Membros slug={slug} ativo={ativo} eu={eu} />}
              {aba === 'ranking' && <Ranking slug={slug} />}
            </>
          )}
          {aba === 'sobre' && <Sobre sobre={sobre} eu={eu} slug={slug} aoSair={carregar} />}
        </div>
      )}
    </ScreenContainer>
  );
};

// ------------------------------------------------------------- comunidade ---

const Comunidade: React.FC<{
  slug: string;
  sobre: SobreASala;
  ativo: boolean;
  cuida: boolean;
  meuSub?: string;
  onEntrar: () => void;
}> = ({ slug, sobre, ativo, cuida, meuSub, onEntrar }) => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categoria, setCategoria] = useState<string>('todas');
  const [erro, setErro] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [catNova, setCatNova] = useState(sobre.sala.categorias[0] ?? 'Geral');
  const [aberto, setAberto] = useState<string | null>(null);

  const ler = useCallback(() => {
    salasService.posts(slug).then(setPosts).catch((e) => setErro(motivo(e)));
  }, [slug]);
  useEffect(ler, [ler]);

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salasService.publicar(slug, { titulo, corpo, categoria: catNova });
      setTitulo('');
      setCorpo('');
      ler();
    } catch (err) {
      setErro(motivo(err));
    }
  };
  const agir = (f: () => Promise<unknown>) => () =>
    void f()
      .then(ler)
      .catch((err) => setErro(motivo(err)));

  const visiveis = (posts ?? []).filter((p) => categoria === 'todas' || p.categoria === categoria);

  return (
    <div className="space-y-4">
      {ativo ? (
        <form onSubmit={publicar} aria-label="Escrever na sala">
          <Card variant="default" padding="md" className="space-y-2">
            <label htmlFor="post-titulo" className="sr-only">Título do post</label>
            <input id="post-titulo" className={campo} placeholder="Escreva algo para a sala…" value={titulo} maxLength={140} onChange={(e) => setTitulo(e.target.value)} />
            {titulo && (
              <>
                <label htmlFor="post-corpo" className="sr-only">Texto do post</label>
                <textarea id="post-corpo" className={campo} rows={4} maxLength={5000} value={corpo} onChange={(e) => setCorpo(e.target.value)} />
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-stone-600">
                    Categoria{' '}
                    <select value={catNova} onChange={(e) => setCatNova(e.target.value)} className="ml-1 rounded border border-stone-300 p-1 text-xs">
                      {sobre.sala.categorias.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" size="sm" disabled={!titulo.trim() || !corpo.trim()}>
                    Publicar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </form>
      ) : (
        <Card variant="muted" padding="md" className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-700">Para publicar, curtir e comentar, entre na sala.</p>
          <Button size="sm" onClick={onEntrar}>
            Entrar
          </Button>
        </Card>
      )}

      <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por categoria">
        {['todas', ...sobre.sala.categorias].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={categoria === c}
            onClick={() => setCategoria(c)}
            className={`rounded-full px-3 py-1 text-xs ${categoria === c ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
          >
            {c === 'todas' ? 'Tudo' : c}
          </button>
        ))}
      </div>

      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {posts === null && <p className="text-xs text-stone-500">Carregando a conversa…</p>}
      {posts && visiveis.length === 0 && <p className="text-sm text-stone-600">Nada publicado aqui ainda.</p>}

      {visiveis.map((p) => (
        <Card key={p.id} variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>
              <strong className="text-stone-800">{p.autor.nome}</strong> · {dataHora(p.em)} · {p.categoria}
            </span>
            {p.fixado && (
              <span className="flex items-center gap-1 text-anil-800"><Pin className="h-3 w-3" aria-hidden="true" /> Fixado</span>
            )}
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">{p.titulo}</h3>
          <p className="whitespace-pre-line text-sm text-stone-700">{p.corpo}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <button
              type="button"
              disabled={!ativo || p.autor.sub === meuSub}
              aria-pressed={p.curtiEu}
              aria-label={`Curtir o post de ${p.autor.nome}`}
              onClick={agir(() => salasService.curtir(slug, p.id))}
              className={`flex items-center gap-1 disabled:opacity-50 ${p.curtiEu ? 'text-red-700' : 'text-stone-600'}`}
            >
              <Heart className="h-3.5 w-3.5" aria-hidden="true" /> {p.curtidas}
            </button>
            <button type="button" onClick={() => setAberto(aberto === p.id ? null : p.id)} className="flex items-center gap-1 text-stone-600">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> {p.comentarios} {p.comentarios === 1 ? 'comentário' : 'comentários'}
            </button>
            {cuida && (
              <button type="button" onClick={agir(() => salasService.fixar(slug, p.id))} className="text-stone-600">
                {p.fixado ? 'Desafixar' : 'Fixar'}
              </button>
            )}
            {(cuida || p.autor.sub === meuSub) && (
              <button type="button" aria-label={`Apagar o post ${p.titulo}`} onClick={agir(() => salasService.apagar(slug, p.id))} className="flex items-center gap-1 text-stone-500">
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Apagar
              </button>
            )}
          </div>
            {ativo && p.autor.sub !== meuSub && (
              <BotaoDenunciar alvo={{ tipo: 'sala-post', id: p.id, salaId: sobre.sala.id, resumo: p.titulo }} />
            )}
          {aberto === p.id && <Comentarios slug={slug} postId={p.id} ativo={ativo} aoComentar={ler} />}
        </Card>
      ))}
    </div>
  );
};

const Comentarios: React.FC<{ slug: string; postId: string; ativo: boolean; aoComentar: () => void }> = ({ slug, postId, ativo, aoComentar }) => {
  const [lista, setLista] = useState<Comentario[] | null>(null);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const ler = useCallback(() => {
    salasService.comentarios(slug, postId).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug, postId]);
  useEffect(ler, [ler]);

  return (
    <div className="space-y-2 border-t border-stone-100 pt-2">
      {(lista ?? []).map((c) => (
        <p key={c.id} className="text-xs text-stone-700">
          <strong>{c.autor.nome}</strong> — {c.corpo}
        </p>
      ))}
      {lista?.length === 0 && <p className="text-xs text-stone-500">Nenhum comentário ainda.</p>}
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {ativo && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            salasService
              .comentar(slug, postId, texto)
              .then(() => {
                setTexto('');
                ler();
                aoComentar();
              })
              .catch((err) => setErro(motivo(err)));
          }}
        >
          <label htmlFor={`comentario-${postId}`} className="sr-only">Seu comentário</label>
          <input id={`comentario-${postId}`} className={campo} value={texto} maxLength={2000} onChange={(e) => setTexto(e.target.value)} placeholder="Comentar…" />
          <Button type="submit" size="sm" disabled={!texto.trim()}>
            Enviar
          </Button>
        </form>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- tarefas ---

const FORMATO: Record<FormatoDeEntrega, string> = {
  texto: 'Resposta em texto',
  link: 'Link (gravação no Drive, vídeo…)',
  partitura: 'Partitura (MusicXML do caderno)',
};

/** P-7 — quem cuida propõe e avalia; cada aluno entrega e vê só a própria entrega. */
const Tarefas: React.FC<{ slug: string; ativo: boolean; cuida: boolean }> = ({ slug, ativo, cuida }) => {
  const [lista, setLista] = useState<Tarefa[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [nova, setNova] = useState({ titulo: '', enunciado: '', formato: 'texto' as FormatoDeEntrega, prazo: '' });
  const [aberta, setAberta] = useState<string | null>(null);
  const ler = useCallback(() => {
    salasService.tarefas(slug).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug]);
  useEffect(() => {
    if (ativo) ler();
  }, [ativo, ler]);

  if (!ativo) return <p className="text-sm text-stone-600">As tarefas são de quem está na sala.</p>;

  return (
    <div className="space-y-4">
      {cuida && (
        <form
          aria-label="Propor tarefa"
          onSubmit={(e) => {
            e.preventDefault();
            salasService
              .proporTarefa(slug, { ...nova, prazo: nova.prazo ? new Date(nova.prazo).toISOString() : undefined })
              .then(() => {
                setNova({ titulo: '', enunciado: '', formato: 'texto', prazo: '' });
                ler();
              })
              .catch((err) => setErro(motivo(err)));
          }}
        >
          <Card variant="default" padding="md" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs sm:col-span-2">Título da tarefa<input className={campo} value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} /></label>
            <label className="text-xs sm:col-span-2">Enunciado<textarea rows={3} className={campo} value={nova.enunciado} onChange={(e) => setNova({ ...nova, enunciado: e.target.value })} /></label>
            <label className="text-xs">Formato da entrega
              <select className={campo} value={nova.formato} onChange={(e) => setNova({ ...nova, formato: e.target.value as FormatoDeEntrega })}>
                {Object.entries(FORMATO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </label>
            <label className="text-xs">Prazo (opcional)<input type="datetime-local" className={campo} value={nova.prazo} onChange={(e) => setNova({ ...nova, prazo: e.target.value })} /></label>
            <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={!nova.titulo.trim() || !nova.enunciado.trim()}>Propor tarefa</Button></div>
          </Card>
        </form>
      )}
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {lista?.length === 0 && <p className="text-sm text-stone-600">Nenhuma tarefa proposta ainda.</p>}
      {(lista ?? []).map((t) => (
        <Card key={t.id} variant="default" padding="md" className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
            <span>{FORMATO[t.formato]}{t.prazo ? ` · prazo ${dataHora(t.prazo)}` : ''}</span>
            {cuida && t.entregas !== null && <span>{t.entregas} {t.entregas === 1 ? 'entrega' : 'entregas'}</span>}
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">{t.titulo}</h3>
          <p className="whitespace-pre-line text-sm text-stone-700">{t.enunciado}</p>
          {cuida ? (
            <>
              <button type="button" onClick={() => setAberta(aberta === t.id ? null : t.id)} className="text-xs text-anil-700 underline">
                {aberta === t.id ? 'Fechar entregas' : 'Ver entregas'}
              </button>
              {aberta === t.id && <EntregasDaTurma slug={slug} tarefa={t} />}
            </>
          ) : (
            <MinhaEntrega slug={slug} tarefa={t} aoEntregar={ler} />
          )}
        </Card>
      ))}
    </div>
  );
};

const MinhaEntrega: React.FC<{ slug: string; tarefa: Tarefa; aoEntregar: () => void }> = ({ slug, tarefa, aoEntregar }) => {
  const e = tarefa.minhaEntrega;
  const [conteudo, setConteudo] = useState(e?.conteudo ?? '');
  const [erro, setErro] = useState<string | null>(null);
  if (e?.avaliacao) {
    return (
      <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-stone-800">
        <p className="font-semibold">Avaliada por {e.avaliacao.por}{e.avaliacao.nota !== null ? ` — nota ${e.avaliacao.nota}` : ''}</p>
        <p className="whitespace-pre-line">{e.avaliacao.comentario}</p>
      </div>
    );
  }
  return (
    <form
      className="space-y-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        salasService.entregar(slug, tarefa.id, conteudo).then(aoEntregar).catch((err) => setErro(motivo(err)));
      }}
    >
      <label htmlFor={`entrega-${tarefa.id}`} className="text-xs font-semibold text-stone-700">
        {e ? `Sua entrega (${e.atrasada ? 'depois do prazo' : 'no prazo'}) — dá para refazer até a avaliação` : 'Sua entrega'}
      </label>
      {tarefa.formato === 'link' ? (
        <input id={`entrega-${tarefa.id}`} type="url" placeholder="https://" className={campo} value={conteudo} onChange={(x) => setConteudo(x.target.value)} />
      ) : (
        <textarea
          id={`entrega-${tarefa.id}`}
          rows={tarefa.formato === 'partitura' ? 4 : 3}
          placeholder={tarefa.formato === 'partitura' ? 'Cole aqui o MusicXML exportado do seu caderno no Estúdio' : ''}
          className={campo}
          value={conteudo}
          onChange={(x) => setConteudo(x.target.value)}
        />
      )}
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      <Button type="submit" size="sm" disabled={!conteudo.trim()}>{e ? 'Refazer entrega' : 'Entregar'}</Button>
    </form>
  );
};

const EntregasDaTurma: React.FC<{ slug: string; tarefa: Tarefa }> = ({ slug, tarefa }) => {
  const [lista, setLista] = useState<Entrega[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, { nota: string; comentario: string }>>({});
  const ler = useCallback(() => {
    salasService.entregas(slug, tarefa.id).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug, tarefa.id]);
  useEffect(ler, [ler]);
  if (lista?.length === 0) return <p className="text-xs text-stone-600">Ninguém entregou ainda.</p>;
  return (
    <div className="space-y-3 border-t border-stone-100 pt-2">
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {(lista ?? []).map((e) => {
        const n = notas[e.aluno.sub] ?? { nota: '', comentario: '' };
        return (
          <div key={e.aluno.sub} className="space-y-1 text-xs">
            <p className="font-semibold text-stone-900">
              {e.aluno.nome} <span className="font-normal text-stone-500">· {dataHora(e.em)}{e.atrasada ? ' · depois do prazo' : ''}</span>
            </p>
            {tarefa.formato === 'link' ? (
              <a href={e.conteudo} target="_blank" rel="noopener noreferrer" className="text-anil-700 underline">{e.conteudo}</a>
            ) : tarefa.formato === 'partitura' ? (
              <p className="text-stone-600">Partitura em MusicXML ({Math.round(e.conteudo.length / 1024)} KB) — abra no caderno do Estúdio para ler.</p>
            ) : (
              <p className="whitespace-pre-line text-stone-700">{e.conteudo}</p>
            )}
            {e.avaliacao ? (
              <p className="text-emerald-800">Avaliada{e.avaliacao.nota !== null ? ` — nota ${e.avaliacao.nota}` : ''}: {e.avaliacao.comentario}</p>
            ) : (
              <form
                className="flex flex-wrap items-end gap-2"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  salasService
                    .avaliar(slug, tarefa.id, e.aluno.sub, { nota: n.nota === '' ? null : Number(n.nota), comentario: n.comentario })
                    .then(ler)
                    .catch((err) => setErro(motivo(err)));
                }}
              >
                <label>Nota (0–10, opcional)<input type="number" min={0} max={10} step={0.1} className="ml-1 w-16 rounded border border-stone-300 p-1" value={n.nota} onChange={(x) => setNotas({ ...notas, [e.aluno.sub]: { ...n, nota: x.target.value } })} /></label>
                <label className="flex-1">Comentário<input className={campo} value={n.comentario} onChange={(x) => setNotas({ ...notas, [e.aluno.sub]: { ...n, comentario: x.target.value } })} /></label>
                <Button type="submit" size="sm" disabled={!n.comentario.trim()}>Avaliar</Button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------------------- sala de aula ---

const SalaDeAula: React.FC<{ slug: string; sobre: SobreASala; dono: boolean; aoMudar: () => void }> = ({ slug, sobre, dono, aoMudar }) => {
  const { navigate } = useRouter();
  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [editando, setEditando] = useState(false);
  const [escolha, setEscolha] = useState<string[]>(sobre.sala.cursos);
  useEffect(() => {
    academyService.getCourses().then(setCursos).catch(() => setCursos([]));
  }, []);

  const daSala = sobre.sala.cursos.map((id) => cursos.find((c) => c.id === id)).filter((c): c is AcademyCourse => !!c);

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-600">
        Os cursos que quem cuida da sala escolheu da Academia. O progresso de cada pessoa continua dela — fica na conta de
        cada um.
      </p>
      {daSala.length === 0 && !editando && <p className="text-sm text-stone-600">Nenhum curso na sala de aula ainda.</p>}
      {!editando &&
        daSala.map((c) => (
          <Card key={c.id} variant="default" padding="md" interactive onClick={() => navigate(`/academia/course/${c.id}`)}>
            <h3 className="font-serif font-bold text-stone-900">{c.title}</h3>
            <p className="text-xs text-stone-600 line-clamp-2">{c.description}</p>
          </Card>
        ))}
      {dono && !editando && (
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          Escolher cursos
        </Button>
      )}
      {editando && (
        <Card variant="default" padding="md" className="space-y-2">
          {cursos.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={escolha.includes(c.id)}
                onChange={(e) => setEscolha(e.target.checked ? [...escolha, c.id] : escolha.filter((x) => x !== c.id))}
                className="accent-anil-800"
              />
              {c.title}
            </label>
          ))}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                void salasService.editar(slug, { cursos: escolha }).then(() => {
                  setEditando(false);
                  aoMudar();
                })
              }
            >
              Guardar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ agenda ---

const Agenda: React.FC<{ slug: string; cuida: boolean }> = ({ slug, cuida }) => {
  const [lista, setLista] = useState<Encontro[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [duracao, setDuracao] = useState('60');
  const [link, setLink] = useState('');
  const ler = useCallback(() => {
    salasService.encontros(slug).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug]);
  useEffect(ler, [ler]);

  const agora = new Date().toISOString();
  const proximos = (lista ?? []).filter((e) => e.inicio >= agora);
  const passados = (lista ?? []).filter((e) => e.inicio < agora).reverse();

  return (
    <div className="space-y-4">
      {cuida && (
        <form
          aria-label="Marcar encontro"
          onSubmit={(e) => {
            e.preventDefault();
            salasService
              .marcar(slug, { titulo, inicio: new Date(inicio).toISOString(), duracaoMin: Number(duracao), link: link || undefined })
              .then(() => {
                setTitulo('');
                setInicio('');
                setLink('');
                ler();
              })
              .catch((err) => setErro(motivo(err)));
          }}
        >
          <Card variant="default" padding="md" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs">Título<input className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
            <label className="text-xs">Quando<input type="datetime-local" className={campo} value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
            <label className="text-xs">Duração (min)<input type="number" min={5} max={480} className={campo} value={duracao} onChange={(e) => setDuracao(e.target.value)} /></label>
            <label className="text-xs">Link da chamada (opcional)<input type="url" className={campo} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" /></label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={!titulo.trim() || !inicio}>
                Marcar encontro
              </Button>
            </div>
          </Card>
        </form>
      )}
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {lista && proximos.length === 0 && <p className="text-sm text-stone-600">Nenhum encontro marcado.</p>}
      {proximos.map((e) => (
        <Card key={e.id} variant="default" padding="md" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-stone-900">{e.titulo}</p>
            <p className="text-xs text-stone-600">
              {dataHora(e.inicio)} · {e.duracaoMin} min
            </p>
          </div>
          {e.link && (
            <a href={e.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-anil-700 underline">
              Entrar na chamada
            </a>
          )}
        </Card>
      ))}
      {passados.length > 0 && (
        <details className="text-xs text-stone-600">
          <summary>Encontros passados ({passados.length})</summary>
          <ul className="mt-2 space-y-1">
            {passados.map((e) => (
              <li key={e.id}>
                {dataHora(e.inicio)} — {e.titulo}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

// ----------------------------------------------------------------- membros ---

const Membros: React.FC<{ slug: string; ativo: boolean; eu: Membro | null }> = ({ slug, ativo, eu }) => {
  const [lista, setLista] = useState<Membro[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const ler = useCallback(() => {
    salasService.membros(slug).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug]);
  useEffect(() => {
    if (ativo) ler();
  }, [ativo, ler]);

  if (!ativo) return <p className="text-sm text-stone-600">A lista de membros é de quem está na sala.</p>;
  const decidir = (sub: string, acao: 'aprovar' | 'remover' | 'moderador' | 'membro') =>
    void salasService.decidir(slug, sub, acao).then(ler).catch((e) => setErro(motivo(e)));
  const cuida = eu && eu.papel !== 'membro';
  const PAPEL = { dono: 'Quem criou', moderador: 'Moderação', membro: 'Membro' } as const;

  return (
    <div className="space-y-2">
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      {(lista ?? []).map((m) => (
        <Card key={m.sub} variant="default" padding="sm" className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm">
            <strong>{m.nome}</strong> <span className="text-xs text-stone-500">· {m.status === 'pendente' ? 'pediu para entrar' : PAPEL[m.papel]}</span>
          </span>
          {cuida && m.papel !== 'dono' && m.sub !== eu!.sub && (
            <span className="flex gap-2 text-xs">
              {m.status === 'pendente' && <button type="button" onClick={() => decidir(m.sub, 'aprovar')} className="font-semibold text-anil-700">Aprovar</button>}
              {eu!.papel === 'dono' && m.status === 'ativo' && (
                <button type="button" onClick={() => decidir(m.sub, m.papel === 'moderador' ? 'membro' : 'moderador')} className="text-stone-700">
                  {m.papel === 'moderador' ? 'Tirar da moderação' : 'Tornar moderação'}
                </button>
              )}
              <button type="button" onClick={() => decidir(m.sub, 'remover')} className="text-red-700">
                {m.status === 'pendente' ? 'Recusar' : 'Remover'}
              </button>
            </span>
          )}
        </Card>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------- ranking ---

const Ranking: React.FC<{ slug: string }> = ({ slug }) => {
  const [lista, setLista] = useState<NoRanking[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    salasService.ranking(slug).then(setLista).catch((e) => setErro(motivo(e)));
  }, [slug]);
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-600">Cada curtida recebida vale um ponto; os pontos sobem o nível, de 1 a 9.</p>
      {erro && <p role="alert" className="text-xs text-red-800">{erro}</p>}
      <ol className="space-y-1">
        {(lista ?? []).map((p, i) => (
          <li key={p.sub} className="flex items-center justify-between rounded border border-stone-200 bg-white px-3 py-2 text-sm">
            <span>
              <span className="mr-2 font-mono text-stone-500">{i + 1}.</span>
              {p.nome} <span className="text-xs text-stone-500">· nível {p.nivel}</span>
            </span>
            <span className="font-mono text-stone-700">{p.pontos} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

// ------------------------------------------------------------------- sobre ---

const Sobre: React.FC<{ sobre: SobreASala; eu: Membro | null; slug: string; aoSair: () => void }> = ({ sobre, eu, slug, aoSair }) => (
  <Card variant="default" padding="lg" className="space-y-3">
    <p className="whitespace-pre-line text-sm text-stone-700">{sobre.sala.descricao || 'Quem criou a sala ainda não escreveu sobre ela.'}</p>
    <dl className="grid grid-cols-2 gap-2 text-xs text-stone-600">
      <dt>Quem criou</dt>
      <dd className="text-stone-900">{sobre.sala.dono.nome}</dd>
      <dt>Desde</dt>
      <dd className="text-stone-900">{new Date(sobre.sala.criadaEm).toLocaleDateString('pt-BR')}</dd>
      <dt>Membros</dt>
      <dd className="text-stone-900">{sobre.membros}</dd>
      <dt>Quem vê</dt>
      <dd className="text-stone-900">{sobre.sala.privacidade === 'publica' ? 'Qualquer pessoa lê; membros participam' : 'Só membros aprovados'}</dd>
    </dl>
    {eu && eu.papel !== 'dono' && (
      <Button variant="outline" size="sm" onClick={() => void salasService.sair(slug).then(aoSair)}>
        {eu.status === 'pendente' ? 'Cancelar pedido' : 'Sair da sala'}
      </Button>
    )}
  </Card>
);
