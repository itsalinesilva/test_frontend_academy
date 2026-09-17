import { Livreto } from '../domain/booklet';
import { LIVRETO_TEORIA } from './seed-booklet-theory';

/**
 * Livretos de fabrica.
 *
 * Cada curso entra aqui quando fica pronto — com o caderno de exercicios
 * escrito junto do conteudo, nao depois. Um livreto inventado antes do curso
 * seria conteudo de enchimento; um curso sem livreto seria leitura sem
 * fixacao.
 */
export const LIVRETOS_PADRAO: Livreto[] = [LIVRETO_TEORIA];
