export function withAggregate(
  query      :  any,
  expr       :  string,
  fn         :  'count' | 'sum' | 'avg' | 'min' | 'max',
  column     :  string = '*',
  callback  ?:  (q: any) => void
) {
  if (!query._withAggregates) query._withAggregates = []

  const [rel, aliasRaw] = expr.split(/\s+as\s+/i)

  query._withAggregates.push({
    relation  :  rel.trim(),
    alias     :  aliasRaw?.trim() || `${rel}_${fn}`,
    fn,
    column,
    callback,
  })

  return query
}
