import { avaliarPrazo } from './copyright-term';
import { EntityId } from './types';
import { LocalizedText, PublicDomainAssessment } from './music-knowledge';

/**
 * O REGISTRO DA ANTIGUIDADE — e por que ele não é uma ficha de obra.
 *
 * O PROBLEMA
 * ----------
 * O primeiro capítulo do curso de história trata da Antiguidade, e o acervo de
 * obras não tem nenhuma dela. A tentação é chamar isso de lacuna e sair
 * catalogando peças.
 *
 * Não há peças. Sobreviveram cerca de **quarenta fragmentos gregos notados**,
 * a maioria mutilada, e o mais completo — um epitáfio gravado em pedra — tem
 * doze versos. O que chegou inteiro foi a **teoria**: tetracordes, gêneros,
 * modos, a doutrina do ethos.
 *
 * Forçar a ficha de obra aqui produziria um catálogo de fantasmas: registros
 * com título, compositor e data que ninguém conhece, sobre música que ninguém
 * pode tocar.
 *
 * A SOLUÇÃO
 * ---------
 * Outro tipo de registro, com os campos que a era de fato tem:
 *
 *   **o suporte** — pedra, papiro, pergaminho. Em que a coisa chegou até nós
 *   determina o que se pode saber dela.
 *
 *   **o estado** — completo, fragmentário, ilegível. É a informação mais
 *   honesta que existe sobre um fragmento antigo, e a ficha de obra não tem
 *   onde guardá-la.
 *
 *   **o que se pode ouvir** — e aqui a resposta quase sempre é: uma
 *   reconstrução, que é interpretação e precisa ser declarada como tal.
 *
 * COBERTURA AO MESMO NÍVEL
 * ------------------------
 * A era não terá o mesmo NÚMERO de registros que o Romantismo, porque não
 * sobreviveu o mesmo número de coisas. Terá o mesmo **nível de tratamento**:
 * cada item com proveniência, estado declarado, e o que se pode fazer com ele
 * escrito. É isso que se iguala.
 */

export type SuporteAntigo =
  /** Inscrição em pedra — a forma mais durável, e a mais rara. */
  | 'PEDRA'
  /** Papiro: a maior parte do que sobreviveu, e a mais danificada. */
  | 'PAPIRO'
  /** Cópia manuscrita medieval de um original perdido. */
  | 'COPIA_MEDIEVAL'
  /** Tratado teórico transmitido por cópia. */
  | 'TRATADO';

export type EstadoDoFragmento =
  /** Chegou legível do começo ao fim. São pouquíssimos. */
  | 'COMPLETO'
  /** Partes faltam, e o que falta é conhecido. */
  | 'FRAGMENTARIO'
  /** A notação existe e não se sabe lê-la com segurança. */
  | 'ILEGIVEL';

export type NaturezaDoRegistro =
  /** Música notada, ainda que em pedaços. */
  | 'MUSICA_NOTADA'
  /** Texto que descreve como a música se organizava. */
  | 'TEORIA'
  /** Objeto ou imagem que informa sobre a prática musical. */
  | 'ICONOGRAFIA';

/**
 * O que a plataforma pode oferecer sobre um item da Antiguidade.
 *
 * Quase nunca é "tocar o original". Em geral é ouvir uma **reconstrução**, que
 * é leitura moderna de uma notação que se entende parcialmente — e apresentar
 * reconstrução como se fosse a peça seria o mesmo erro de apresentar dedução
 * como catalogação.
 */
export type OfertaAntiga =
  /** Há reconstrução sonora, declarada como tal. */
  | 'RECONSTRUCAO'
  /** Há demonstração do procedimento: o modo, o tetracorde, a escala. */
  | 'DEMONSTRACAO'
  /** Só o registro textual. */
  | 'SOMENTE_FICHA';

export interface RegistroDaAntiguidade {
  id: EntityId;
  titulo: LocalizedText;
  /** Século ou intervalo, como a datação permite: "séc. II d.C.", "c. 200 a.C." */
  datacao: string;
  natureza: NaturezaDoRegistro;
  suporte: SuporteAntigo;
  estado: EstadoDoFragmento;
  /** Onde o objeto está, quando se sabe. Museu, coleção, sítio. */
  procedencia?: string;
  /** O que o item ensina — escrito para quem estuda, e não catalogação seca. */
  descricao: string;
  /**
   * Quantos versos, linhas ou compassos sobreviveram.
   *
   * `null` quando não se conta — um tratado não tem compassos. Zero seria
   * afirmar uma contagem que ninguém fez.
   */
  extensaoSobrevivente: string | null;
  oferta: OfertaAntiga;
  /**
   * O que a plataforma demonstra sobre ele, quando demonstra.
   *
   * Aponta para material próprio — a escala, o tetracorde, o modo construído
   * no sintetizador. É por aqui que a era deixa de ser só leitura.
   */
  demonstracaoId?: EntityId;
  eraId: EntityId;
  regionId?: EntityId;
  publicDomain: PublicDomainAssessment;
}

/**
 * A Antiguidade é integralmente de domínio público.
 *
 * Não por cálculo de prazo — não há autor com data de morte registrada —, mas
 * porque qualquer prazo concebível expirou há mais de mil anos. A **edição
 * moderna** de um fragmento, porém, tem direito próprio: quem transcreveu e
 * reconstruiu fez trabalho, e isso é outra coisa.
 */
export function dominioDaAntiguidade(): PublicDomainAssessment {
  /**
   * 🔴 ISTO ERA UMA DATA DE MORTE INVENTADA.
   *
   * A versão anterior passava `anoDeMorte: 500` para a conta geral — um ano
   * escolhido para dar um resultado, e não um fato sobre ninguém. Funcionava,
   * e mentia sobre o método: a ficha declarava domínio público "por morte do
   * autor em 500" de um epitáfio anônimo do século II.
   *
   * O regime certo existe e tem nome: `ANTERIOR_A_QUALQUER_PRAZO`. Não é
   * cálculo, é constatação — e dizer isso é mais honesto que fabricar a data
   * que faria o cálculo fechar.
   */
  const prazo = avaliarPrazo({ regime: 'ANTERIOR_A_QUALQUER_PRAZO' });

  return {
    jurisdiction: 'BR',
    assessedAt: new Date().toISOString(),
    status: 'PUBLIC_DOMAIN',
    basis: 'BEFORE_ANY_TERM',
    note: `${prazo.nota} A edição moderna de um fragmento tem direito próprio.`,
  };
}

/** O item tem algo que se possa ouvir? */
export function temSom(r: RegistroDaAntiguidade): boolean {
  return r.oferta !== 'SOMENTE_FICHA';
}

/**
 * O que a ficha diz sobre a disponibilidade, por extenso.
 *
 * O motivo nunca é vazio, e nunca é "indisponível" seco: quem consulta precisa
 * saber se o limite é do acervo, da notação, ou do que sobreviveu.
 */
export function motivoDaOferta(r: RegistroDaAntiguidade): string {
  if (r.oferta === 'RECONSTRUCAO') {
    return 'Há reconstrução sonora. É leitura moderna de uma notação que se entende em parte — ouça como hipótese, e não como registro.';
  }
  if (r.oferta === 'DEMONSTRACAO') {
    return 'Não há como tocar o original. A plataforma demonstra o procedimento que o item documenta — o modo, o tetracorde, a escala.';
  }
  if (r.estado === 'ILEGIVEL') {
    return 'A notação sobreviveu e ainda não se sabe lê-la com segurança. O registro existe; o som, não.';
  }
  return 'Registro textual. O que sobreviveu deste item não é música notada.';
}
