import { applyGlobalScopes } from '../scope/apply-global-scopes'
import { applyWithAggregates } from '../aggregate/apply-with-aggregates'
import { applyOrderByAggregates } from '../aggregate/apply-order-by-aggregates'
import { loadRelations } from '../relation/load-relations'



export async function get(query: any) {
  applyGlobalScopes(query)
  applyWithAggregates(query)
  applyOrderByAggregates(query)

  const rows = await query
  let result = query.$model.hydrate(rows)

  if (query._withTree && Object.keys(query._withTree).length) {
    await loadRelations(result, query.$model, query._withTree)
  }

  result.forEach((item: any) => {
    item.__expandedAttributes = Object.keys(query._withTree || {})
      .filter(k => query._withTree[k]?.__attribute)
  })

  if (query._formatter) {
    result = result.map(query._formatter)
  }

  return result
}
