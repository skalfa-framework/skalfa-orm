export function search(
  query                              :  any,
  Model                              :  any,
  keyword                            :  string,
  { includes = [], searchable = [] } : { includes?: string[], searchable?: string[] } = {}
) {
  const model = query.$model

  if (!model) return query

  const defaultSearchable  =  Model.searchable || []
  const mergedSearchable   =  searchable?.length ? searchable : [...defaultSearchable, ...includes]

  if (!keyword || !mergedSearchable.length) return query

  const client      =  query?.client?.config?.client
  const isMySql     =  typeof client  ===  'string' && client.includes('mysql')
  const searchMode  =  Model.searchMode ?? 'like'

  query.where((q: any) => {
    mergedSearchable.forEach((column) => {
      if (column.includes(".")) {
        const [relation, col] = column.split(".")

        q.orWhereHas(relation, (rel: any) => {
          const relModel       =  rel.$model
          const relClient      =  rel?.client?.config?.client
          const relIsMySql     =  typeof relClient  ===  'string' && relClient.includes('mysql')
          const relSearchMode  =  relModel?.searchMode ?? 'like'

          if (relIsMySql || relSearchMode === 'like') {
            const op = relIsMySql ? 'LIKE' : 'ILIKE'

            rel.where(col, op, `%${keyword}%`)
          } else {
            const cleanKeyword  =  keyword.replace(/[!|&()*:\\]/g, ' ')
            const tsQuery       =  cleanKeyword.trim().split(/\s+/).filter(Boolean).map(w => `${w}:*`).join(' & ')

            if (tsQuery) {
              rel.whereRaw(`to_tsvector('simple', coalesce(??, '')) @@ to_tsquery('simple', ?)`, [col, tsQuery])
            } else {
              rel.whereRaw('1 = 0')
            }
          }
        })
      } else {
        if (isMySql || searchMode === 'like') {
          const op = isMySql ? 'LIKE' : 'ILIKE'

          q.orWhere(column, op, `%${keyword}%`)
        } else {
          const cleanKeyword  =  keyword.replace(/[!|&()*:\\]/g, ' ')
          const tsQuery       =  cleanKeyword.trim().split(/\s+/).filter(Boolean).map(w => `${w}:*`).join(' & ')

          if (tsQuery) q.orWhereRaw(`to_tsvector('simple', coalesce(??, '')) @@ to_tsquery('simple', ?)`, [column, tsQuery])
        }
      }
    })
  })

  return query
}
