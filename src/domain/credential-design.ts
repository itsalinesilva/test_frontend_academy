/**
 * Matriz de design de badges, credenciais e certificados.
 *
 * O QUE ESTE MÓDULO É
 * -------------------
 * A fundadora ainda não definiu logotipo, nome da plataforma nem a identidade
 * visual dos documentos. Então o que se define aqui não é a aparência final:
 * é a MATRIZ — quais peças um documento tem, onde cada uma fica, que formato
 * e que tamanho cada imagem precisa ter, e quais textos são obrigatórios.
 *
 * Com a matriz no lugar, trocar a identidade visual depois é preencher
 * campos, não reescrever telas: ela sobe um logotipo no formato que a matriz
 * pede e ele aparece, no tamanho certo, em todos os documentos já emitidos.
 *
 * O QUE ELE NÃO É
 * ---------------
 * Não é um editor livre de desenho. Posição e tamanho dos elementos vêm do
 * template; o formulário de emissão só preenche conteúdo. Isso é deliberado:
 * um certificado com o nome fora da caixa ou a data sobre o selo é um
 * documento inválido, e nenhuma quantidade de liberdade de edição compensa
 * isso num papel que serve de prova.
 */

import { EntityId, ISOTimestamp } from './types';

// ---------------------------------------------------------------------------
// Tipos de documento
// ---------------------------------------------------------------------------

export type TipoCredencial = 'BADGE' | 'CREDENCIAL' | 'CERTIFICADO';

export const ROTULOS_TIPO: Record<TipoCredencial, string> = {
  BADGE: 'Badge',
  CREDENCIAL: 'Credencial',
  CERTIFICADO: 'Certificado',
};

export const DESCRICOES_TIPO: Record<TipoCredencial, string> = {
  BADGE:
    'Marca pequena e quadrada, de leitura instantânea. Vive dentro da plataforma, ao lado do nome, e é o que aparece repetido em listas.',
  CREDENCIAL:
    'Cartão horizontal com validade e código. Serve para apresentar uma habilitação — docente, monitor, avaliador — e é compartilhável.',
  CERTIFICADO:
    'Documento em folha, com assinatura, selo e carga horária. É a peça que se imprime e se anexa a um currículo.',
};

/**
 * Dimensões do papel de cada tipo, em unidades de desenho.
 *
 * O certificado usa a proporção de uma A4 deitada (√2 : 1) para imprimir sem
 * margem sobrando; a credencial usa a proporção de um cartão; o badge é
 * quadrado porque vai aparecer em avatar e em lista.
 */
export const CANVAS: Record<TipoCredencial, { largura: number; altura: number; nota: string }> = {
  BADGE: { largura: 512, altura: 512, nota: 'Quadrado 1:1 — some para 48px em listas.' },
  CREDENCIAL: { largura: 1012, altura: 638, nota: 'Proporção de cartão, 1,586:1.' },
  CERTIFICADO: { largura: 1122, altura: 794, nota: 'A4 deitada — imprime em 297×210mm.' },
};

// ---------------------------------------------------------------------------
// Imagens que a matriz aceita
// ---------------------------------------------------------------------------

export type SlotImagem = 'logotipo' | 'fundo' | 'selo' | 'assinatura' | 'ornamento';

export interface EspecificacaoImagem {
  readonly slot: SlotImagem;
  readonly label: string;
  readonly larguraIdeal: number;
  readonly alturaIdeal: number;
  readonly formatos: readonly string[];
  readonly obrigatoria: boolean;
  /** O que acontece se esta peça não for enviada. */
  readonly semImagem: string;
  readonly orientacao: string;
}

/**
 * A matriz de imagens por tipo de documento.
 *
 * Os tamanhos são os que o desenho realmente usa. Enviar uma imagem menor
 * serrilha na impressão; enviar muito maior só engorda o arquivo — por isso
 * o formulário avisa dos dois casos em vez de aceitar em silêncio.
 */
export function especificacoesImagem(tipo: TipoCredencial): EspecificacaoImagem[] {
  const vetorPreferido = ['image/svg+xml', 'image/png'] as const;

  const logotipo: EspecificacaoImagem = {
    slot: 'logotipo',
    label: 'Logotipo da plataforma',
    larguraIdeal: tipo === 'BADGE' ? 220 : 360,
    alturaIdeal: tipo === 'BADGE' ? 220 : 120,
    formatos: vetorPreferido,
    obrigatoria: false,
    semImagem: 'Enquanto não houver logotipo, entra a marca tipográfica provisória (as iniciais).',
    orientacao: 'SVG é o ideal: escala do badge de 48px ao certificado impresso sem perder nitidez.',
  };

  const fundo: EspecificacaoImagem = {
    slot: 'fundo',
    label: 'Fundo / textura',
    larguraIdeal: CANVAS[tipo].largura,
    alturaIdeal: CANVAS[tipo].altura,
    formatos: ['image/png', 'image/jpeg', 'image/svg+xml'],
    obrigatoria: false,
    semImagem: 'Sem fundo, vale a cor sólida definida nos tokens — que imprime melhor.',
    orientacao: 'Exatamente na proporção do documento; qualquer outra proporção é recortada pelo centro.',
  };

  if (tipo === 'BADGE') {
    return [logotipo, fundo];
  }

  const selo: EspecificacaoImagem = {
    slot: 'selo',
    label: 'Selo institucional',
    larguraIdeal: 200,
    alturaIdeal: 200,
    formatos: vetorPreferido,
    obrigatoria: false,
    semImagem: 'Sem selo, o espaço é ocupado pelo código de verificação em tipo maior.',
    orientacao: 'Circular e quadrado no arquivo — o desenho reserva um quadrado.',
  };

  const assinatura: EspecificacaoImagem = {
    slot: 'assinatura',
    label: 'Assinatura digitalizada',
    larguraIdeal: 320,
    alturaIdeal: 110,
    formatos: vetorPreferido,
    obrigatoria: false,
    semImagem: 'Sem assinatura, fica só a linha com nome e cargo abaixo.',
    orientacao: 'Fundo transparente. Assinatura sobre fundo branco cria um retângulo visível.',
  };

  const ornamento: EspecificacaoImagem = {
    slot: 'ornamento',
    label: 'Ornamento de borda',
    larguraIdeal: CANVAS[tipo].largura,
    alturaIdeal: 90,
    formatos: vetorPreferido,
    obrigatoria: false,
    semImagem: 'Sem ornamento, a moldura é a linha dupla definida nos tokens.',
    orientacao: 'Faixa horizontal repetida no topo e espelhada no rodapé.',
  };

  return tipo === 'CERTIFICADO'
    ? [logotipo, fundo, selo, assinatura, ornamento]
    : [logotipo, fundo, selo];
}

// ---------------------------------------------------------------------------
// Tokens visuais
// ---------------------------------------------------------------------------

export interface TokensVisuais {
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  corTextoSuave: string;
  corMoldura: string;
  /** Família tipográfica dos títulos. Aceita fonte enviada pela fundadora. */
  fonteTitulo: string;
  fonteCorpo: string;
  espessuraMoldura: number;
  raioCanto: number;
}

/**
 * Identidade do Conservatório Muscicapa.
 *
 * As cores vêm do brasão, medidas no arquivo original — não escolhidas:
 * o anil é o campo do escudo (#1B3357), o ouro é a moldura e a abelha
 * (#947D53). Ver `src/index.css` para as rampas completas e as conferências
 * de contraste.
 *
 * O ouro entra como moldura e acento cerimonial, nunca em texto corrido:
 * sobre papel branco ele só fecha contraste a partir do passo 600, e um
 * certificado precisa ser legível também fotocopiado em preto e branco.
 *
 * Tudo aqui é editável no Estúdio de Credenciais.
 */
export const TOKENS_PADRAO: TokensVisuais = {
  corPrimaria: '#1d2f49',
  corSecundaria: '#233a5c',
  corFundo: '#fffdf9',
  corTexto: '#1c1917',
  corTextoSuave: '#57534e',
  corMoldura: '#7b6947',
  fonteTitulo: 'Georgia, "Times New Roman", serif',
  fonteCorpo: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  espessuraMoldura: 3,
  raioCanto: 8,
};

/**
 * Ressalva obrigatória de natureza do curso.
 *
 * A Academia opera com CURSOS LIVRES e certificação própria. Isso não é
 * demérito — é uma categoria legítima e regulada — mas precisa estar dito no
 * documento, e não só nos termos de uso.
 *
 * A razão é direta: quem recebe o certificado pode apresentá-lo a um
 * empregador ou a uma secretaria, e essas pessoas precisam saber o que estão
 * lendo sem ter de perguntar. Um certificado que se deixa confundir com
 * diploma reconhecido pelo MEC prejudica primeiro quem o recebeu.
 *
 * Fica no rodapé, em corpo pequeno, mas presente em todo certificado e
 * credencial — e não é editável no Estúdio, diferente do resto.
 */
export const RESSALVA_CURSO_LIVRE =
  'Curso livre de qualificação profissional. Certificação própria do Conservatório Muscicapa, sem vínculo com o MEC.';

// ---------------------------------------------------------------------------
// Elementos do documento
// ---------------------------------------------------------------------------

/**
 * Campos que a emissão preenche.
 *
 * O template referencia o campo pelo nome; a emissão fornece o valor. Assim
 * um mesmo desenho serve para qualquer curso sem ser reeditado.
 */
export type CampoEmissao =
  | 'nomeTitular'
  | 'tituloDocumento'
  | 'nomeCurso'
  | 'descricao'
  | 'cargaHoraria'
  | 'dataEmissao'
  | 'dataValidade'
  | 'codigoVerificacao'
  | 'nomeInstituicao'
  | 'nomeSignatario'
  | 'cargoSignatario'
  | 'competencias';

export const ROTULOS_CAMPO: Record<CampoEmissao, string> = {
  nomeTitular: 'Nome de quem recebe',
  tituloDocumento: 'Título do documento',
  nomeCurso: 'Curso ou trilha',
  descricao: 'Descrição / texto de outorga',
  cargaHoraria: 'Carga horária',
  dataEmissao: 'Data de emissão',
  dataValidade: 'Validade',
  codigoVerificacao: 'Código de verificação',
  nomeInstituicao: 'Nome da instituição',
  nomeSignatario: 'Quem assina',
  cargoSignatario: 'Cargo de quem assina',
  competencias: 'Competências',
};

export type AlinhamentoTexto = 'esquerda' | 'centro' | 'direita';

/** Caixa de posicionamento, em unidades do canvas. */
export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export type ElementoTemplate =
  | {
      kind: 'CAMPO';
      id: string;
      campo: CampoEmissao;
      caixa: Caixa;
      tamanhoFonte: number;
      fonte: 'titulo' | 'corpo';
      peso: 'normal' | 'bold';
      cor: 'primaria' | 'secundaria' | 'texto' | 'suave';
      alinhamento: AlinhamentoTexto;
      maiusculas?: boolean;
      espacamentoLetras?: number;
      /** Rótulo fixo impresso acima do valor, como "OUTORGADO A". */
      rotuloAcima?: string;
    }
  | {
      kind: 'TEXTO_FIXO';
      id: string;
      texto: string;
      caixa: Caixa;
      tamanhoFonte: number;
      fonte: 'titulo' | 'corpo';
      peso: 'normal' | 'bold';
      cor: 'primaria' | 'secundaria' | 'texto' | 'suave';
      alinhamento: AlinhamentoTexto;
      maiusculas?: boolean;
      espacamentoLetras?: number;
    }
  | { kind: 'IMAGEM'; id: string; slot: SlotImagem; caixa: Caixa }
  | { kind: 'QRCODE'; id: string; caixa: Caixa; legenda?: string }
  | { kind: 'LINHA'; id: string; caixa: Caixa; espessura: number; cor: 'primaria' | 'moldura' | 'suave' }
  | { kind: 'MOLDURA'; id: string; margem: number };

export interface TemplateCredencial {
  id: EntityId;
  tipo: TipoCredencial;
  nome: string;
  descricao: string;
  tokens: TokensVisuais;
  elementos: ElementoTemplate[];
  /** Imagens enviadas, como data URL, por slot. */
  imagens: Partial<Record<SlotImagem, string>>;
  /** Fontes próprias enviadas, como data URL, por papel. */
  fontes?: Partial<Record<'titulo' | 'corpo', { nome: string; dataUrl: string }>>;
  /** Template de fábrica: pode ser copiado, não apagado. */
  ehPadrao: boolean;
  criadoEm: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Dados de emissão
// ---------------------------------------------------------------------------

export interface DadosEmissao {
  nomeTitular: string;
  tituloDocumento: string;
  nomeCurso?: string;
  descricao?: string;
  cargaHoraria?: string;
  dataEmissao: string;
  dataValidade?: string;
  codigoVerificacao: string;
  nomeInstituicao: string;
  nomeSignatario?: string;
  cargoSignatario?: string;
  competencias?: string;
  /** Endereço da página de verificação, que vira o QR. */
  urlVerificacao: string;
}

export function valorDoCampo(campo: CampoEmissao, dados: DadosEmissao): string {
  const valor = dados[campo as keyof DadosEmissao];
  return typeof valor === 'string' ? valor : '';
}

// ---------------------------------------------------------------------------
// Validação da matriz
// ---------------------------------------------------------------------------

export interface ProblemaTemplate {
  gravidade: 'erro' | 'aviso';
  mensagem: string;
  elementoId?: string;
}

/**
 * Campos sem os quais o documento não cumpre sua função.
 *
 * Um certificado sem nome de quem recebe não é um certificado; sem código de
 * verificação, não é verificável. O editor impede salvar sem eles em vez de
 * deixar descobrir na hora de emitir.
 */
const OBRIGATORIOS: Record<TipoCredencial, CampoEmissao[]> = {
  BADGE: ['tituloDocumento'],
  CREDENCIAL: ['nomeTitular', 'tituloDocumento', 'codigoVerificacao'],
  CERTIFICADO: ['nomeTitular', 'dataEmissao', 'codigoVerificacao'],
};

/**
 * Conjuntos em que basta UM dos campos estar presente.
 *
 * Um certificado precisa dizer o que foi conquistado, mas isso tanto pode
 * vir do nome do curso quanto de um título próprio — a matriz clássica usa
 * o nome do curso em destaque e deixa "Certificado de Conclusão" como texto
 * fixo. Exigir os dois obrigaria a repetir a mesma informação duas vezes no
 * papel.
 */
const PELO_MENOS_UM: Partial<Record<TipoCredencial, { campos: CampoEmissao[]; explanation: string }>> = {
  CERTIFICADO: {
    campos: ['tituloDocumento', 'nomeCurso'],
    explanation:
      'O certificado precisa identificar a conquista: inclua o título do documento ou o nome do curso.',
  },
};

export function validarTemplate(template: TemplateCredencial): ProblemaTemplate[] {
  const problemas: ProblemaTemplate[] = [];
  const canvas = CANVAS[template.tipo];

  const camposPresentes = new Set(
    template.elementos.filter((e) => e.kind === 'CAMPO').map((e) => e.campo)
  );

  for (const campo of OBRIGATORIOS[template.tipo]) {
    if (!camposPresentes.has(campo)) {
      problemas.push({
        gravidade: 'erro',
        mensagem: `Falta o campo obrigatório "${ROTULOS_CAMPO[campo]}".`,
      });
    }
  }

  const alternativa = PELO_MENOS_UM[template.tipo];
  if (alternativa && !alternativa.campos.some((c) => camposPresentes.has(c))) {
    problemas.push({ gravidade: 'erro', mensagem: alternativa.explanation });
  }

  if (template.tipo !== 'BADGE' && !template.elementos.some((e) => e.kind === 'QRCODE')) {
    problemas.push({
      gravidade: 'aviso',
      mensagem:
        'Sem QR Code, quem receber o documento impresso não tem como chegar à página de verificação.',
    });
  }

  for (const el of template.elementos) {
    if (el.kind === 'MOLDURA') continue;
    const { x, y, largura, altura } = el.caixa;
    if (x < 0 || y < 0 || x + largura > canvas.largura || y + altura > canvas.altura) {
      problemas.push({
        gravidade: 'erro',
        elementoId: el.id,
        mensagem: `O elemento "${el.id}" sai da área do documento (${canvas.largura}×${canvas.altura}).`,
      });
    }
  }

  for (const spec of especificacoesImagem(template.tipo)) {
    if (spec.obrigatoria && !template.imagens[spec.slot]) {
      problemas.push({
        gravidade: 'erro',
        mensagem: `A imagem obrigatória "${spec.label}" não foi enviada.`,
      });
    }
  }

  return problemas;
}

export function templateValido(template: TemplateCredencial): boolean {
  return validarTemplate(template).every((p) => p.gravidade !== 'erro');
}

// ---------------------------------------------------------------------------
// Código de verificação
// ---------------------------------------------------------------------------

/**
 * Alfabeto sem os caracteres que se confundem quando alguém digita o código
 * lendo de um papel: 0/O, 1/I/L, 5/S, 2/Z, 8/B.
 */
const ALFABETO = 'ACDEFGHJKMNPQRTUVWXY34679';

export function gerarCodigoVerificacao(prefixo = 'CMU'): string {
  const bloco = () => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
  };
  return `${prefixo}-${bloco()}-${bloco()}`;
}

export function codigoEhValido(codigo: string): boolean {
  return new RegExp(`^[A-Z]{2,5}-[${ALFABETO}]{4}-[${ALFABETO}]{4}$`).test(codigo);
}
