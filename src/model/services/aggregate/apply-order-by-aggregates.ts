import { db } from '../../../db'

type AggregateType = 'count' | 'sum' | 'avg' | 'min' | 'max'



export function applyOrderByAggregates(query: any) {
  const Model = query.$model

  if (!Model || !query._orderByAggregates?.length) return

  const parentTable = Model.getTable()

  for (const item of query._orderByAggregates) {
    const relDef = Model.relations?.[item.relation]
    if (!relDef) continue

    const desc = relDef()
    const Related = desc.model()
    const relatedTable = Related.getTable()

    const fn = item.fn as AggregateType
    const sub = (db(Related.getTable()) as any)[fn](item.column)

    if (desc.type === 'hasMany') sub.whereRaw(`${relatedTable}.${desc.foreignKey} = ${parentTable}.${desc.localKey}`)

    if (desc.type === 'belongsTo') sub.whereRaw(`${relatedTable}.${desc.localKey} = ${parentTable}.${desc.foreignKey}`)

    if (Related.isSoftDelete?.()) sub.whereNull(Related.getDeletedAtColumn())

    desc.callback?.(sub)
    item.callback?.(sub)

    query.orderByRaw(`(${sub.toQuery()}) ${item.direction}`)
  }
}
