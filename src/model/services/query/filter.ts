export function filter(query: any, filters?: Record<string, string>) {
  if (!filters) return query

  for (const [field, filterVal] of Object.entries(filters)) {
    const [type, value] = filterVal.split(":")

    if (!type || value === undefined) continue

    const client   =  query?.client?.config?.client
    const isMySql  =  typeof client  ===  'string' && client.includes('mysql')
    const op       =  isMySql ? 'LIKE' : 'ILIKE'

    const applyWhere = (q: any, col: string) => {
      switch (type) {
        case "li": q.where(col, op, `%${value}%`); break
        case "eq": q.where(col, value); break
        case "ne": q.where(col, "!=", value); break
        case "in": q.whereIn(col, value.split(",")); break
        case "ni": q.whereNotIn(col, value.split(",")); break
        case "bw": {
          const [min, max] = value.split(",")

          q.whereBetween(col, [min, max])

          break
        }
      }
    }


    if (field.includes(".")) {
      const [relation, col] = field.split(".")

      query.whereHas(relation, (q: any) => applyWhere(q, col))
    } else {
      applyWhere(query, field)
    }
  }

  return query
}
