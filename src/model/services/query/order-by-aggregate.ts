export function orderByAggregate(
  query       :  any,
  expr        :  string,
  fn          :  'count' | 'sum' | 'avg' | 'min' | 'max',
  column      :  string = '*',
  direction   :  'asc' | 'desc' = 'asc',
  callback   ?:  (q: any) => void
) {
  if (!query._orderByAggregates) query._orderByAggregates = []

  const [rel, aliasRaw] = expr.split(/\s+as\s+/i)

  query._orderByAggregates.push({
    relation : rel.trim(),
    alias    : aliasRaw?.trim(),
    fn,
    column,
    direction,
    callback,
  })

  return query
}
