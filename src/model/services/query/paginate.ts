import { applyGlobalScopes } from '../scope/apply-global-scopes'
import { applyWithAggregates } from '../aggregate/apply-with-aggregates'
import { applyOrderByAggregates } from '../aggregate/apply-order-by-aggregates'
import { loadRelations } from '../relation/load-relations'



export async function paginate(query: any, Model: any, page = 1, limit = 10) {
  applyGlobalScopes(query)
  applyWithAggregates(query)
  applyOrderByAggregates(query)

  const offset  =  (page - 1) * limit

  const raw     =  await query.clone().limit(limit).offset(offset)
  let   data    =  Model.hydrate(raw)

  const [{ count }]  =  await query.clone().clearSelect().clearOrder().count('* as count')
  const total        =  Number(count)

  if (!total) return { data: [], total: 0 }

  if (query._withTree && Object.keys(query._withTree).length) {
    await loadRelations(data, query.$model, query._withTree)
  }

  data.forEach((item: any) => {
    item.__expandedAttributes = Object.keys(query._withTree || {})
      .filter(k => query._withTree[k]?.__attribute)
  })

  if (query._formatter) {
    data = data.map(query._formatter)
  }

  return { data, total }
}
