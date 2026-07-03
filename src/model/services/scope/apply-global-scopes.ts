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

            query.select(query.client.raw(`(${subQueryStr}) as ${key}`))
          }
        } else {
          query.withAggregate(`${config.relation} as ${key}`, config.fn, config.column ?? '*', config.callback)
        }
      }
    }
  }

  if (Model.isSoftDelete?.()) {
    const col   =  Model.getDeletedAtColumn()
    const mode  =  query._softDeleteScope ?? 'default'

    if (mode === 'with') return

    if (mode === 'default') query.whereNull(col)

    if (mode === 'only') query.whereNotNull(col)
  }
}
