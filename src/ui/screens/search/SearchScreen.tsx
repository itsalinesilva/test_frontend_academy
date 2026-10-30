import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { Search, ArrowRight, BookOpen, Compass, Layers } from 'lucide-react';
import { academyService } from '../../../services/application/academy.service';

export const SearchScreen: React.FC = () => {
  const { navigate, query: consulta } = useRouter();
  /**
   * O termo vem do endereço: é assim que o campo do cabeçalho o entrega
   * (`/search?q=…`). Começar vazio obrigaria a digitar de novo o que acabou
   * de ser digitado.
   */
  const termoDoEndereco = consulta.get('q') ?? '';
  const [query, setQuery] = useState(termoDoEndereco);

  /** Uma nova busca pelo cabeçalho, estando já aqui, troca o termo. */
  useEffect(() => {
    setQuery(termoDoEndereco);
  }, [termoDoEndereco]);

  const [resultados, setResultados] = useState<Resultado[] | null>(null);

  /**
   * A busca é de verdade, e por isso só o que existe aparece.
   *
   * Esta tela mostrava três resultados CRAVADOS: um curso "Harmonia e Teoria
   * Fundamental", uma obra do Atlas e uma "Cátedra Chopin" do Prof. Gabriel
   * Carvalho. Nenhum dos três existe — o Atlas não tem obra nenhuma, e não há
   * nenhum professor cadastrado.
   *
   * Pior que tela vazia: quem buscasse "Chopin" veria o resultado aparecer,
   * clicaria, e cairia numa tela de "não localizado". A busca inventada
   * quebra a confiança em tudo o que a plataforma mostra depois.
   */
  useEffect(() => {
    const termo = query.trim();
    if (termo.length < 2) {
      setResultados(null);
      return;
    }

    let vivo = true;
    const t = window.setTimeout(() => {
      academyService
        .searchCatalog(termo)
        .then(({ programs, paths, courses }) => {
          if (!vivo) return;
          setResultados([
            ...courses.map((c) => ({
              id: c.id,
              tipo: 'Curso',
              titulo: c.title,
              contexto: c.subtitle ?? 'Academia',
              destino: `/academia/course/${c.id}`,
              Icone: BookOpen,
            })),
            ...paths.map((p) => ({
              id: p.id,
              tipo: 'Trilha',
              titulo: p.title,
              contexto: 'Academia',
              destino: `/academia/path/${p.id}`,
              Icone: Compass,
            })),
            ...programs.map((p) => ({
              id: p.id,
              tipo: 'Programa',
              titulo: p.title,
              contexto: 'Academia',
              destino: `/academia/program/${p.id}`,
              Icone: Layers,
            })),
          ]);
        })
        .catch(() => {
          // Falhar em buscar não autoriza mostrar resultado nenhum como se fosse.
          if (vivo) setResultados([]);
        });
    }, 250);

    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [query]);

  return (
    <ScreenContainer
      id="global-search"
      title="Busca"
      subtitle="Pesquise no catálogo da Academia: programas, trilhas e cursos."
      badgeLabel="Catálogo"
      badgeVariant="neutral"
      emptyProps={{
        title: 'Nenhum resultado encontrado',
        description: 'Tente utilizar termos mais amplos ou verificar a grafia do autor ou obra.',
        actionLabel: 'Limpar Termos de Busca',
        onAction: () => setQuery(''),
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="omnisearch-input"
            type="text"
            aria-label="Buscar em toda a plataforma"
            placeholder="Buscar por compositor, título de obra, lição, sala ou termo teórico…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-anil-800 bg-white shadow-sm"
          />
        </div>

        {/**
          * As abas de categoria saíram.
          *
          * Eram "Tudo", "Cursos & Lições", "Obras & Partituras" e "Salas de
          * Aula" — e, com a busca cobrindo só o catálogo da Academia, três
          * delas não filtrariam nada. Botão que não age ainda não existe: ou
          * ele age, ou sai da tela.
          *
          * Voltam quando o Atlas tiver acervo e as salas tiverem busca.
          */}

        {/* Resultados */}
        {resultados !== null && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500">
              {resultados.length === 0
                ? 'Nenhum resultado'
                : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`}
            </h2>

            {resultados.length === 0 ? (
              <p className="rounded-lg border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
                Nada no catálogo corresponde a <strong>{query}</strong>. A busca cobre programas,
                trilhas e cursos da Academia — o Atlas e a Comunidade ainda não entram nela.
              </p>
            ) : (
              <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white overflow-hidden">
                {resultados.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.destino)}
                    className="w-full p-3.5 text-left hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-stone-100 text-stone-700">
                        <item.Icone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-900">{item.titulo}</span>
                          <Badge variant="neutral" size="sm">{item.tipo}</Badge>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{item.contexto}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {resultados === null && (
          <p className="text-sm leading-relaxed text-stone-500">
            Escreva ao menos duas letras para buscar.
          </p>
        )}

      </div>
    </ScreenContainer>
  );
};

interface Resultado {
  id: string;
  tipo: string;
  titulo: string;
  contexto: string;
  destino: string;
  Icone: React.ElementType;
}
