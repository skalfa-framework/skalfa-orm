export async function loadHasOne(
  rows       :  any[],
  rel        :  any,
  name       :  string,
  callback  ?:  (q: any) => void
) {
  const ids = rows.map(r => r[rel.localKey])

  if (!ids.length) {
    rows.forEach(r => (r[name] = null))

    return []
  }

  const q = rel.model().query().whereIn(rel.foreignKey, ids)

  rel.callback?.(q)

  callback?.(q)

  const related  =  rel.model().hydrate(await q)
  const map      =  new Map(related.map((r: any) => [String(r[rel.foreignKey]), r]))

  rows.forEach(r => r[name] = map.get(String(r[rel.localKey])) ?? null)

  return related
}
