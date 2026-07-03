import { db } from '../../../db'

type AggregateType = 'count' | 'sum' | 'avg' | 'min' | 'max'



export function applyWithAggregates(query: any) {
  const Model = query.$model

  if (!Model || !query._withAggregates?.length) return

  const parentTable = Model.getTable()

  for (const item of query._withAggregates) {
    const relDef = Model.relations?.[item.relation]

    if (!relDef) continue

    const desc = relDef()
    const Related = desc.model()
    const relatedTable = Related.getTable()

    const fn = item.fn as AggregateType
    const sub = (db(Related.getTable()) as any)[fn](item.column)

    if (desc.type === 'hasMany' || desc.type === 'hasOne') {
      sub.whereRaw(`${relatedTable}.${desc.foreignKey} = ${parentTable}.${desc.localKey}`)
    }

    if (desc.type === 'belongsTo') {
      sub.whereRaw(`${relatedTable}.${desc.localKey} = ${parentTable}.${desc.foreignKey}`)
    }

    if (desc.type === 'belongsToMany') {
      const pivot = desc.pivotTable

      sub.join(pivot, `${pivot}.${desc.pivotForeign}`, '=', `${relatedTable}.${Related.primaryKey}`)

      sub.whereRaw(`${pivot}.${desc.pivotLocal} = ${parentTable}.${desc.localKey}`)
    }

    desc.callback?.(sub)
    item.callback?.(sub)

    query.select(query.client.raw(`(${sub.toQuery()}) as ${item.alias}`))
  }
}
