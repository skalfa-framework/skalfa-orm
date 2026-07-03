import type { ScopeType } from '../../types'



export function applyScopes(query: any) {
  const Model = query.$model

  if (!Model) return

  const scopes    =  Model.scopes ?? {}
  const disabled  =  query._disabledScopes ?? new Set<string>()

  for (const [name, meta] of Object.entries(scopes) as [string, ScopeType][]) {
    if (meta.mode !== 'global') continue

    if (disabled.has(name)) continue

    meta.fn.call(Model, query)
  }
}
