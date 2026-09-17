import {
  TemplateCredencial,
  TOKENS_PADRAO,
  CANVAS,
  ElementoTemplate,
} from '../domain/credential-design';

/**
 * Identidade visual provisória — três matrizes de fábrica.
 *
 * Nenhuma delas é a identidade final: logotipo, nome da plataforma e paleta
 * definitiva ainda não foram decididos. O que está fixado aqui é a ESTRUTURA
 * — o que cada documento contém, em que ordem se lê e onde cada peça entra.
 *
 * Todos os campos são editáveis no Estúdio de Credenciais, e estes três não
 * podem ser apagados: servem de ponto de partida para qualquer variação.
 * Duplicar e alterar a cópia é o caminho previsto.
 *
 * As decisões de composição, para quem for mexer:
 *  - O nome de quem recebe é o maior elemento do documento. É ele que a
 *    pessoa procura ao abrir, e é ele que aparece na miniatura compartilhada.
 *  - O código de verificação fica perto do QR, não num rodapé distante:
 *    quem não puder escanear vai digitar, e os dois caminhos levam ao mesmo
 *    lugar.
 *  - Nada essencial encosta na margem de 28 unidades — é a área que
 *    impressoras domésticas costumam cortar.
 */

const agora = '2026-01-01T00:00:00.000Z';

// ---------------------------------------------------------------------------
// Certificado
// ---------------------------------------------------------------------------

const elementosCertificado: ElementoTemplate[] = [
  { kind: 'MOLDURA', id: 'moldura', margem: 28 },
  { kind: 'IMAGEM', id: 'logo', slot: 'logotipo', caixa: { x: 461, y: 54, largura: 200, altura: 64 } },
  {
    kind: 'TEXTO_FIXO',
    id: 'chapeu',
    texto: 'Certificado de Conclusão',
    caixa: { x: 61, y: 138, largura: 1000, altura: 30 },
    tamanhoFonte: 20,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'primaria',
    alinhamento: 'centro',
    maiusculas: true,
    espacamentoLetras: 6,
  },
  {
    kind: 'CAMPO',
    id: 'instituicao',
    campo: 'nomeInstituicao',
    caixa: { x: 61, y: 176, largura: 1000, altura: 24 },
    tamanhoFonte: 14,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  { kind: 'LINHA', id: 'divisor', caixa: { x: 481, y: 212, largura: 160, altura: 1 }, espessura: 2, cor: 'primaria' },
  {
    kind: 'CAMPO',
    id: 'titular',
    campo: 'nomeTitular',
    caixa: { x: 111, y: 252, largura: 900, altura: 70 },
    tamanhoFonte: 46,
    fonte: 'titulo',
    peso: 'bold',
    cor: 'texto',
    alinhamento: 'centro',
    rotuloAcima: 'Outorgado a',
  },
  {
    kind: 'CAMPO',
    id: 'descricao',
    campo: 'descricao',
    caixa: { x: 181, y: 344, largura: 760, altura: 70 },
    tamanhoFonte: 15,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  {
    kind: 'CAMPO',
    id: 'curso',
    campo: 'nomeCurso',
    caixa: { x: 141, y: 424, largura: 840, altura: 40 },
    tamanhoFonte: 26,
    fonte: 'titulo',
    peso: 'bold',
    cor: 'primaria',
    alinhamento: 'centro',
  },
  {
    kind: 'CAMPO',
    id: 'carga',
    campo: 'cargaHoraria',
    caixa: { x: 141, y: 474, largura: 840, altura: 22 },
    tamanhoFonte: 13,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  { kind: 'IMAGEM', id: 'assinatura-img', slot: 'assinatura', caixa: { x: 168, y: 566, largura: 260, altura: 88 } },
  { kind: 'LINHA', id: 'linha-assinatura', caixa: { x: 158, y: 664, largura: 280, altura: 1 }, espessura: 1, cor: 'suave' },
  {
    kind: 'CAMPO',
    id: 'signatario',
    campo: 'nomeSignatario',
    caixa: { x: 158, y: 674, largura: 280, altura: 22 },
    tamanhoFonte: 14,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'texto',
    alinhamento: 'centro',
  },
  {
    kind: 'CAMPO',
    id: 'cargo',
    campo: 'cargoSignatario',
    caixa: { x: 158, y: 698, largura: 280, altura: 20 },
    tamanhoFonte: 11,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  { kind: 'IMAGEM', id: 'selo-img', slot: 'selo', caixa: { x: 491, y: 566, largura: 140, altura: 140 } },
  {
    kind: 'CAMPO',
    id: 'data',
    campo: 'dataEmissao',
    caixa: { x: 461, y: 714, largura: 200, altura: 20 },
    tamanhoFonte: 12,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  { kind: 'QRCODE', id: 'qr', caixa: { x: 872, y: 566, largura: 130, altura: 130 }, legenda: 'Verifique em' },
  {
    kind: 'CAMPO',
    id: 'codigo',
    campo: 'codigoVerificacao',
    caixa: { x: 797, y: 714, largura: 280, altura: 22 },
    tamanhoFonte: 12,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'secundaria',
    alinhamento: 'centro',
    espacamentoLetras: 1,
  },
];

// ---------------------------------------------------------------------------
// Credencial
// ---------------------------------------------------------------------------

const elementosCredencial: ElementoTemplate[] = [
  { kind: 'MOLDURA', id: 'moldura', margem: 22 },
  { kind: 'IMAGEM', id: 'logo', slot: 'logotipo', caixa: { x: 56, y: 48, largura: 200, altura: 64 } },
  {
    kind: 'TEXTO_FIXO',
    id: 'chapeu',
    texto: 'Credencial',
    caixa: { x: 56, y: 136, largura: 560, altura: 24 },
    tamanhoFonte: 15,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'primaria',
    alinhamento: 'esquerda',
    maiusculas: true,
    espacamentoLetras: 5,
  },
  {
    kind: 'CAMPO',
    id: 'titulo',
    campo: 'tituloDocumento',
    caixa: { x: 56, y: 172, largura: 600, altura: 84 },
    tamanhoFonte: 34,
    fonte: 'titulo',
    peso: 'bold',
    cor: 'texto',
    alinhamento: 'esquerda',
  },
  {
    kind: 'CAMPO',
    id: 'titular',
    campo: 'nomeTitular',
    caixa: { x: 56, y: 292, largura: 600, altura: 40 },
    tamanhoFonte: 26,
    fonte: 'titulo',
    peso: 'normal',
    cor: 'texto',
    alinhamento: 'esquerda',
    rotuloAcima: 'Titular',
  },
  {
    kind: 'CAMPO',
    id: 'instituicao',
    campo: 'nomeInstituicao',
    caixa: { x: 56, y: 372, largura: 600, altura: 22 },
    tamanhoFonte: 14,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'esquerda',
  },
  {
    kind: 'CAMPO',
    id: 'validade',
    campo: 'dataValidade',
    caixa: { x: 56, y: 440, largura: 300, altura: 26 },
    tamanhoFonte: 15,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'secundaria',
    alinhamento: 'esquerda',
    rotuloAcima: 'Válida até',
  },
  { kind: 'IMAGEM', id: 'selo-img', slot: 'selo', caixa: { x: 716, y: 56, largura: 140, altura: 140 } },
  { kind: 'QRCODE', id: 'qr', caixa: { x: 726, y: 276, largura: 130, altura: 130 } },
  {
    kind: 'CAMPO',
    id: 'codigo',
    campo: 'codigoVerificacao',
    caixa: { x: 676, y: 428, largura: 280, altura: 22 },
    tamanhoFonte: 13,
    fonte: 'corpo',
    peso: 'bold',
    cor: 'secundaria',
    alinhamento: 'centro',
    espacamentoLetras: 1,
  },
];

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

const elementosBadge: ElementoTemplate[] = [
  { kind: 'MOLDURA', id: 'moldura', margem: 18 },
  { kind: 'IMAGEM', id: 'logo', slot: 'logotipo', caixa: { x: 146, y: 74, largura: 220, altura: 96 } },
  {
    kind: 'CAMPO',
    id: 'titulo',
    campo: 'tituloDocumento',
    caixa: { x: 56, y: 212, largura: 400, altura: 120 },
    tamanhoFonte: 36,
    fonte: 'titulo',
    peso: 'bold',
    cor: 'primaria',
    alinhamento: 'centro',
  },
  {
    kind: 'CAMPO',
    id: 'curso',
    campo: 'nomeCurso',
    caixa: { x: 76, y: 348, largura: 360, altura: 44 },
    tamanhoFonte: 15,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
  },
  { kind: 'LINHA', id: 'divisor', caixa: { x: 206, y: 406, largura: 100, altura: 1 }, espessura: 2, cor: 'primaria' },
  {
    kind: 'CAMPO',
    id: 'instituicao',
    campo: 'nomeInstituicao',
    caixa: { x: 56, y: 426, largura: 400, altura: 22 },
    tamanhoFonte: 12,
    fonte: 'corpo',
    peso: 'normal',
    cor: 'suave',
    alinhamento: 'centro',
    maiusculas: true,
    espacamentoLetras: 2,
  },
];

// ---------------------------------------------------------------------------

export const TEMPLATES_PADRAO: TemplateCredencial[] = [
  {
    id: 'tpl_certificado_classico',
    tipo: 'CERTIFICADO',
    nome: 'Certificado — Clássico',
    descricao:
      'Folha deitada com moldura, nome em destaque, assinatura, selo e QR. Imprime em A4 sem ajuste.',
    tokens: TOKENS_PADRAO,
    elementos: elementosCertificado,
    imagens: {},
    ehPadrao: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'tpl_credencial_cartao',
    tipo: 'CREDENCIAL',
    nome: 'Credencial — Cartão',
    descricao:
      'Cartão horizontal com habilitação, titular, validade e verificação. Pensada para apresentar em tela.',
    tokens: TOKENS_PADRAO,
    elementos: elementosCredencial,
    imagens: {},
    ehPadrao: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: 'tpl_badge_selo',
    tipo: 'BADGE',
    nome: 'Badge — Selo',
    descricao:
      'Quadrado de leitura instantânea. Legível como miniatura de 48px ao lado do nome numa lista.',
    tokens: TOKENS_PADRAO,
    elementos: elementosBadge,
    imagens: {},
    ehPadrao: true,
    criadoEm: agora,
    atualizadoEm: agora,
  },
];

/** Área útil de cada tipo, para quem for posicionar elementos novos. */
export const AREA_UTIL = Object.fromEntries(
  (Object.keys(CANVAS) as (keyof typeof CANVAS)[]).map((tipo) => [
    tipo,
    { largura: CANVAS[tipo].largura, altura: CANVAS[tipo].altura },
  ])
);
