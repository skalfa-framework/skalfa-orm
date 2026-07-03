import type { ScopeType } from '../types'
import { SCOPE_META } from '../model'



export function Scope(mode: 'global' | 'internal' = 'internal') {
  return function (
    target       :  any,
    propertyKey  :  string,
    descriptor   :  PropertyDescriptor
  ) {
    const ctor = typeof target === 'function' ? target : target.constructor

    if (!ctor[SCOPE_META]) ctor[SCOPE_META] = {}

    ctor[SCOPE_META][propertyKey] = {
      fn  :  descriptor.value,
      mode,
    } satisfies ScopeType
  }
}
