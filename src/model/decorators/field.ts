import type { FieldMeta, ModelCastType } from '../types'
import { FIELD_META } from '../model'



export function Field(defs: string[]) {
  return function (target: any, key: string) {
    const ctor  =  target.constructor

    if (!ctor[FIELD_META]) ctor[FIELD_META] = {}

    const meta: FieldMeta = {}

    const [first, ...rest] = defs
    if (['string','number','boolean','date','json'].includes(first)) {
      meta.cast = first as ModelCastType
    } else {
      rest.unshift(first)
    }

    for (const flag of rest) {
      if (flag === 'fillable') meta.fillable      =  true
      if (flag === 'selectable') meta.selectable  =  true
      if (flag === 'searchable') meta.searchable  =  true
    }

    ctor[FIELD_META][key] = meta
  }
}
