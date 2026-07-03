import type { ModelCastType } from '../types'
import { FIELD_META, EXPRESSION_META } from '../model'



export type ExpressionRelationConfig = {
  relation  :  string
  fn        :  'count' | 'sum' | 'avg' | 'min' | 'max'
  column   ?:  string
  cast     ?:  ModelCastType
  callback ?:  (q: any) => void
}

export type ExpressionCallback  =  (db: any, parentTable: string) => any



export function Expression(
  config      :  ExpressionRelationConfig | ExpressionCallback,
  castOption ?:  ModelCastType
) {
  return function (target: any, key: string) {
    const ctor = target.constructor

    let castType: ModelCastType | undefined = castOption

    if (!castType && typeof config === 'object') {
      castType = config.cast
      if (!castType) {
        if (['count', 'sum', 'avg', 'min', 'max'].includes(config.fn)) {
          castType = 'number'
        }
      }
    }

    if (!ctor[FIELD_META]) ctor[FIELD_META] = {}
    ctor[FIELD_META][key] = {
      cast        :  castType,
      selectable  :  false,
    }

    if (!ctor[EXPRESSION_META]) ctor[EXPRESSION_META] = {}

    ctor[EXPRESSION_META][key] = config
  }
}
