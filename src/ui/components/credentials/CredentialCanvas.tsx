import React, { useMemo } from 'react';
import {
  TemplateCredencial,
  DadosEmissao,
  ElementoTemplate,
  valorDoCampo,
  CANVAS,
  TokensVisuais,
  RESSALVA_CURSO_LIVRE,
} from '../../../domain/credential-design';
import { gerarQrCode, qrParaSvgPath } from '../../../domain/qrcode';

/**
 * Desenha um badge, credencial ou certificado a partir da matriz.
 *
 * SVG, e não canvas nem HTML, por três motivos que se somam:
 *  - o mesmo desenho serve de pré-visualização no editor, de documento na
 *    página pública e de arquivo baixado, sem três implementações;
 *  - imprime em qualquer tamanho sem serrilhar, o que importa num papel que
 *    vai para um currículo;
 *  - o arquivo baixado é autocontido — fontes e imagens vão embutidas —
 *    então abre offline e continua legível daqui a anos, sem depender de a
 *    plataforma estar no ar.
 */

export interface CredentialCanvasProps {
  template: TemplateCredencial;
  dados: DadosEmissao;
  /** Largura de exibição em pixels. O desenho escala sozinho. */
  larguraExibicao?: number;
  className?: string;
  /** Usado pelo download para localizar o nó e serializá-lo. */
  id?: string;
}

function corDeToken(
  cor: 'primaria' | 'secundaria' | 'texto' | 'suave' | 'moldura',
  t: TokensVisuais
): string {
  switch (cor) {
    case 'primaria': return t.corPrimaria;
    case 'secundaria': return t.corSecundaria;
    case 'suave': return t.corTextoSuave;
    case 'moldura': return t.corMoldura;
    default: return t.corTexto;
  }
}

type AncoraSvg = 'start' | 'middle' | 'end';

function ancora(alinhamento: 'esquerda' | 'centro' | 'direita'): AncoraSvg {
  return alinhamento === 'centro' ? 'middle' : alinhamento === 'direita' ? 'end' : 'start';
}

function xDoTexto(caixa: { x: number; largura: number }, alinhamento: string): number {
  if (alinhamento === 'centro') return caixa.x + caixa.largura / 2;
  if (alinhamento === 'direita') return caixa.x + caixa.largura;
  return caixa.x;
}

/**
 * Quebra o texto em linhas que cabem na caixa.
 *
 * A largura é estimada a partir do tamanho da fonte (≈0,52 em por caractere
 * em tipos de texto). É aproximação, não medição: medir de verdade exigiria
 * o texto já no documento, e aí seria tarde para decidir a quebra. A
 * estimativa é conservadora — erra para linha mais curta, que desalinha menos
 * do que texto vazando a caixa.
 */
function quebrarLinhas(texto: string, largura: number, tamanhoFonte: number): string[] {
  if (!texto) return [];
  const porLinha = Math.max(1, Math.floor(largura / (tamanhoFonte * 0.52)));
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = '';

  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (tentativa.length <= porLinha) {
      atual = tentativa;
    } else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export const CredentialCanvas: React.FC<CredentialCanvasProps> = ({
  template,
  dados,
  larguraExibicao,
  className,
  id = 'credential-canvas',
}) => {
  const canvas = CANVAS[template.tipo];
  const t = template.tokens;

  const caminhoQr = useMemo(() => {
    const comQr = template.elementos.some((e) => e.kind === 'QRCODE');
    if (!comQr || !dados.urlVerificacao) return null;
    try {
      const matriz = gerarQrCode(dados.urlVerificacao);
      return { path: qrParaSvgPath(matriz), lado: matriz.tamanho };
    } catch {
      // URL longa demais para a versão 10. O desenho segue sem o QR em vez
      // de derrubar a tela inteira — e o código de verificação continua lá.
      return null;
    }
  }, [template.elementos, dados.urlVerificacao]);

  const fonteTitulo = template.fontes?.titulo ? `"${template.fontes.titulo.nome}"` : t.fonteTitulo;
  const fonteCorpo = template.fontes?.corpo ? `"${template.fontes.corpo.nome}"` : t.fonteCorpo;

  const renderizarElemento = (el: ElementoTemplate): React.ReactNode => {
    switch (el.kind) {
      case 'MOLDURA':
        return (
          <g key={el.id}>
            <rect
              x={el.margem}
              y={el.margem}
              width={canvas.largura - el.margem * 2}
              height={canvas.altura - el.margem * 2}
              fill="none"
              stroke={t.corMoldura}
              strokeWidth={t.espessuraMoldura}
              rx={t.raioCanto}
            />
            <rect
              x={el.margem + 7}
              y={el.margem + 7}
              width={canvas.largura - (el.margem + 7) * 2}
              height={canvas.altura - (el.margem + 7) * 2}
              fill="none"
              stroke={t.corMoldura}
              strokeWidth={1}
              opacity={0.45}
              rx={Math.max(0, t.raioCanto - 3)}
            />
          </g>
        );

      case 'LINHA':
        return (
          <line
            key={el.id}
            x1={el.caixa.x}
            y1={el.caixa.y}
            x2={el.caixa.x + el.caixa.largura}
            y2={el.caixa.y}
            stroke={corDeToken(el.cor, t)}
            strokeWidth={el.espessura}
          />
        );

      case 'IMAGEM': {
        const src = template.imagens[el.slot];
        if (!src) {
          // Sem imagem não se desenha caixa de reserva: uma moldura vazia
          // num certificado emitido parece defeito de impressão.
          return null;
        }
        return (
          <image
            key={el.id}
            href={src}
            x={el.caixa.x}
            y={el.caixa.y}
            width={el.caixa.largura}
            height={el.caixa.altura}
            preserveAspectRatio="xMidYMid meet"
          />
        );
      }

      case 'QRCODE': {
        if (!caminhoQr) return null;
        const escala = el.caixa.largura / caminhoQr.lado;
        return (
          <g key={el.id}>
            <rect
              x={el.caixa.x - 6}
              y={el.caixa.y - 6}
              width={el.caixa.largura + 12}
              height={el.caixa.altura + 12}
              fill="#ffffff"
              rx={4}
            />
            <g transform={`translate(${el.caixa.x} ${el.caixa.y}) scale(${escala})`}>
              <path d={caminhoQr.path} fill={t.corTexto} />
            </g>
            {el.legenda && (
              <text
                x={el.caixa.x + el.caixa.largura / 2}
                y={el.caixa.y + el.caixa.altura + 20}
                textAnchor="middle"
                fontFamily={fonteCorpo}
                fontSize={10}
                fill={t.corTextoSuave}
              >
                {el.legenda}
              </text>
            )}
          </g>
        );
      }

      case 'TEXTO_FIXO':
      case 'CAMPO': {
        const bruto = el.kind === 'CAMPO' ? valorDoCampo(el.campo, dados) : el.texto;
        if (!bruto) return null;
        const texto = el.maiusculas ? bruto.toLocaleUpperCase('pt-BR') : bruto;
        const familia = el.fonte === 'titulo' ? fonteTitulo : fonteCorpo;
        const alinhamento = el.alinhamento;
        const x = xDoTexto(el.caixa, alinhamento);

        const rotulo = el.kind === 'CAMPO' ? el.rotuloAcima : undefined;
        const deslocamentoRotulo = rotulo ? 22 : 0;

        const linhas = quebrarLinhas(texto, el.caixa.largura, el.tamanhoFonte);
        const alturaLinha = el.tamanhoFonte * 1.22;

        return (
          <g key={el.id}>
            {rotulo && (
              <text
                x={x}
                y={el.caixa.y + 12}
                textAnchor={ancora(alinhamento)}
                fontFamily={fonteCorpo}
                fontSize={11}
                letterSpacing={3}
                fill={t.corTextoSuave}
              >
                {rotulo.toLocaleUpperCase('pt-BR')}
              </text>
            )}
            <text
              x={x}
              y={el.caixa.y + deslocamentoRotulo + el.tamanhoFonte}
              textAnchor={ancora(alinhamento)}
              fontFamily={familia}
              fontSize={el.tamanhoFonte}
              fontWeight={el.peso}
              letterSpacing={el.espacamentoLetras ?? 0}
              fill={corDeToken(el.cor, t)}
            >
              {linhas.map((linha, i) => (
                <tspan key={i} x={x} dy={i === 0 ? 0 : alturaLinha}>
                  {linha}
                </tspan>
              ))}
            </text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  const fontesEmbutidas = [template.fontes?.titulo, template.fontes?.corpo]
    .filter((f): f is { nome: string; dataUrl: string } => Boolean(f))
    .map((f) => `@font-face{font-family:"${f.nome}";src:url(${f.dataUrl});}`)
    .join('');

  return (
    <svg
      id={id}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${canvas.largura} ${canvas.altura}`}
      width={larguraExibicao}
      role="img"
      aria-label={`${template.nome} — ${dados.tituloDocumento} de ${dados.nomeTitular}`}
    >
      {fontesEmbutidas && <defs><style>{fontesEmbutidas}</style></defs>}

      <rect x={0} y={0} width={canvas.largura} height={canvas.altura} fill={t.corFundo} />
      {template.imagens.fundo && (
        <image
          href={template.imagens.fundo}
          x={0}
          y={0}
          width={canvas.largura}
          height={canvas.altura}
          preserveAspectRatio="xMidYMid slice"
        />
      )}

      {template.elementos.map(renderizarElemento)}

      {/*
        Ressalva de curso livre. Desenhada aqui, no componente, e nao como um
        elemento do template — assim ela nao pode ser removida editando a
        matriz nem esquecida ao criar uma nova. Um certificado que se deixa
        confundir com diploma reconhecido prejudica primeiro quem o recebeu.
      */}
      {template.tipo !== 'BADGE' && (
        <text
          x={canvas.largura / 2}
          y={canvas.altura - 14}
          textAnchor="middle"
          fontFamily={fonteCorpo}
          fontSize={canvas.largura > 1050 ? 10.5 : 9.5}
          fill={t.corTextoSuave}
          opacity={0.85}
        >
          {RESSALVA_CURSO_LIVRE}
        </text>
      )}
    </svg>
  );
};

/**
 * Serializa o desenho num arquivo SVG autocontido e dispara o download.
 *
 * Fica junto do componente porque depende do mesmo nó: o arquivo entregue é
 * exatamente o que estava na tela, não uma segunda renderização que pode
 * divergir.
 */
export function baixarComoSvg(elementoId: string, nomeArquivo: string): boolean {
  const no = document.getElementById(elementoId);
  if (!no) return false;

  const clone = no.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.removeAttribute('width');

  const conteudo = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  const blob = new Blob([conteudo], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo.endsWith('.svg') ? nomeArquivo : `${nomeArquivo}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
