import { EXPRESSION_META } from '../../model'
import { applyScopes } from './apply-scopes'



export function applyGlobalScopes(query: any) {
  const Model = query.$model

  if (!Model) return

  applyScopes(query)

  const expressions = Model[EXPRESSION_META]

  if (expressions && query._withTree) {
    const parentTable = Model.getTable()

    for (const [key, configRaw] of Object.entries(expressions)) {
      const config = configRaw as any

      if (query._withTree[key]) {
        if (typeof config === 'function') {
          const sub = config(query.client, parentTable)

          if (sub) {
            const subQueryStr = typeof sub === 'string' ? sub : (sub.toQuery ? sub.toQuery() : String(sub))

            const hasSelect = query._statements?.some((s: any) => s.group === 'select')
            if (!hasSelect) {
              query.select(`${parentTable}.*`)
            }

            query.select(query.client.raw(`(${subQueryStr}) as ${key}`))
          }
        } else {
          const expandCallback = query._withTree[key]?.__callback
          const mergedCallback = expandCallback || config.callback
            ? (q: any) => {
                config.callback?.(q)
                expandCallback?.(q)
              }
            : undefined

          query.withAggregate(`${config.relation} as ${key}`, config.fn, config.column ?? '*', mergedCallback)
        }
      }
    }
  }

  if (Model.isSoftDelete?.()) {
    const col   =  Model.getDeletedAtColumn()
    const mode  =  query._softDeleteScope ?? 'default'

    if (mode === 'with') return

    const table = Model.getTable()
    const qualifiedCol = col.includes('.') ? col : `${table}.${col}`

    if (mode === 'default') query.whereNull(qualifiedCol)

    if (mode === 'only') query.whereNotNull(qualifiedCol)
  }
}
