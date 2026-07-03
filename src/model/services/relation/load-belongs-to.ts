export async function loadBelongsTo(
  rows       :  any[],
  rel        :  any,
  name       :  string,
  callback  ?:  (q: any) => void
) {
  const ids = [...new Set(rows.map(r => r[rel.foreignKey]).filter(Boolean))]
  if (!ids.length) {
    rows.forEach(r => (r[name] = null))

    return []
  }

  const q = rel.model().query().whereIn(rel.localKey, ids)

  rel.callback?.(q)

  callback?.(q)

  const related  =  rel.model().hydrate(await q)
  const map      =  new Map(related.map((r: any) => [String(r[rel.localKey]), r]))

  rows.forEach(r => (r[name] = map.get(String(r[rel.foreignKey])) ?? null))

  return related
}
